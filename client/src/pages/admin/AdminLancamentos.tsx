import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { AccountingEntry, DreAccount, CostCenter } from "@shared/schema";
import { format } from "date-fns";

export default function AdminLancamentos() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AccountingEntry | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    dreAccountId: "",
    costCenterId: "",
  });
  const [formData, setFormData] = useState({
    dreAccountId: "",
    costCenterId: "",
    entryType: "debito" as "debito" | "credito",
    value: "",
    competenceDate: format(new Date(), "yyyy-MM-dd"),
    description: "",
    documentNumber: "",
    documentType: "",
    history: "",
  });

  // Build query string for filters
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.dreAccountId) queryParams.append("dreAccountId", filters.dreAccountId);
  if (filters.costCenterId) queryParams.append("costCenterId", filters.costCenterId);
  const queryString = queryParams.toString();

  const { data: entries = [], isLoading } = useQuery<AccountingEntry[]>({
    queryKey: ["/api/accounting-entries", queryString],
    queryFn: async () => {
      const url = queryString ? `/api/accounting-entries?${queryString}` : "/api/accounting-entries";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao buscar lancamentos");
      return res.json();
    },
  });

  const { data: dreAccounts = [] } = useQuery<DreAccount[]>({
    queryKey: ["/api/dre-accounts"],
  });

  const { data: costCenters = [] } = useQuery<CostCenter[]>({
    queryKey: ["/api/cost-centers"],
  });

  const createEntry = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/accounting-entries", {
        ...data,
        dreAccountId: parseInt(data.dreAccountId),
        costCenterId: data.costCenterId ? parseInt(data.costCenterId) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting-entries"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Lancamento criado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar lancamento", variant: "destructive" });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/accounting-entries/${id}`, {
        ...data,
        dreAccountId: parseInt(data.dreAccountId),
        costCenterId: data.costCenterId ? parseInt(data.costCenterId) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting-entries"] });
      setDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({ title: "Lancamento atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar lancamento", variant: "destructive" });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/accounting-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounting-entries"] });
      toast({ title: "Lancamento removido com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao remover lancamento", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      dreAccountId: "",
      costCenterId: "",
      entryType: "debito",
      value: "",
      competenceDate: format(new Date(), "yyyy-MM-dd"),
      description: "",
      documentNumber: "",
      documentType: "",
      history: "",
    });
  };

  const openEditDialog = (entry: AccountingEntry) => {
    setEditingEntry(entry);
    setFormData({
      dreAccountId: entry.dreAccountId.toString(),
      costCenterId: entry.costCenterId?.toString() || "",
      entryType: entry.entryType as "debito" | "credito",
      value: entry.value || "",
      competenceDate: entry.competenceDate || format(new Date(), "yyyy-MM-dd"),
      description: entry.description || "",
      documentNumber: entry.documentNumber || "",
      documentType: entry.documentType || "",
      history: entry.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.dreAccountId || !formData.value) {
      toast({ title: "Preencha conta DRE e valor", variant: "destructive" });
      return;
    }
    if (editingEntry) {
      updateEntry.mutate({ id: editingEntry.id, data: formData });
    } else {
      createEntry.mutate(formData);
    }
  };

  const getDreAccountName = (id: number) => {
    const account = dreAccounts.find((a) => a.id === id);
    return account ? `${account.code} - ${account.name}` : "-";
  };

  const getCostCenterName = (id: number | null) => {
    if (!id) return "-";
    const center = costCenters.find((c) => c.id === id);
    return center ? `${center.code} - ${center.name}` : "-";
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "R$ 0,00";
    const num = parseFloat(value);
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const totalCredito = entries
    .filter((e) => e.entryType === "credito")
    .reduce((sum, e) => sum + parseFloat(e.value || "0"), 0);
  const totalDebito = entries
    .filter((e) => e.entryType === "debito")
    .reduce((sum, e) => sum + parseFloat(e.value || "0"), 0);
  const saldo = totalCredito - totalDebito;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  data-testid="input-filter-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  data-testid="input-filter-end-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Conta DRE</Label>
                <Select
                  value={filters.dreAccountId}
                  onValueChange={(value) => setFilters({ ...filters, dreAccountId: value === "all" ? "" : value })}
                >
                  <SelectTrigger data-testid="select-filter-dre">
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {dreAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Centro de Custo</Label>
                <Select
                  value={filters.costCenterId}
                  onValueChange={(value) => setFilters({ ...filters, costCenterId: value === "all" ? "" : value })}
                >
                  <SelectTrigger data-testid="select-filter-cost-center">
                    <SelectValue placeholder="Todos os centros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os centros</SelectItem>
                    {costCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id.toString()}>
                        {center.code} - {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Creditos</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalCredito.toString())}
                  </p>
                </div>
                <ArrowUpCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Debitos</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalDebito.toString())}
                  </p>
                </div>
                <ArrowDownCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {formatCurrency(saldo.toString())}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Lancamentos ({entries.length})
              </CardTitle>
              <CardDescription>
                Registros contabeis vinculados ao DRE e centros de custo
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingEntry(null);
                setDialogOpen(true);
              }}
              data-testid="button-new-entry"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Lancamento
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum lancamento encontrado. Clique em "Novo Lancamento" para adicionar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Conta DRE</TableHead>
                      <TableHead>Centro de Custo</TableHead>
                      <TableHead>Descricao</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Doc.</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id} data-testid={`row-entry-${entry.id}`}>
                        <TableCell>
                          {entry.competenceDate
                            ? format(new Date(entry.competenceDate), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={entry.entryType === "credito" ? "default" : "secondary"}
                            className={
                              entry.entryType === "credito"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }
                          >
                            {entry.entryType === "credito" ? "Credito" : "Debito"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {getDreAccountName(entry.dreAccountId)}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {getCostCenterName(entry.costCenterId)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {entry.description || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(entry.value)}
                        </TableCell>
                        <TableCell>{entry.documentNumber || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(entry)}
                              data-testid={`button-edit-entry-${entry.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Remover este lancamento?")) {
                                  deleteEntry.mutate(entry.id);
                                }
                              }}
                              data-testid={`button-delete-entry-${entry.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Editar Lancamento" : "Novo Lancamento"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do lancamento contabil
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Lancamento *</Label>
                <Select
                  value={formData.entryType}
                  onValueChange={(value: "debito" | "credito") =>
                    setFormData({ ...formData, entryType: value })
                  }
                >
                  <SelectTrigger data-testid="select-entry-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credito">Credito (Receita)</SelectItem>
                    <SelectItem value="debito">Debito (Despesa)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Competencia *</Label>
                <Input
                  type="date"
                  value={formData.competenceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, competenceDate: e.target.value })
                  }
                  data-testid="input-competence-date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Conta DRE *</Label>
              <Select
                value={formData.dreAccountId}
                onValueChange={(value) =>
                  setFormData({ ...formData, dreAccountId: value })
                }
              >
                <SelectTrigger data-testid="select-dre-account">
                  <SelectValue placeholder="Selecione a conta DRE" />
                </SelectTrigger>
                <SelectContent>
                  {dreAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Select
                value={formData.costCenterId}
                onValueChange={(value) =>
                  setFormData({ ...formData, costCenterId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger data-testid="select-cost-center">
                  <SelectValue placeholder="Selecione o centro de custo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {costCenters.map((center) => (
                    <SelectItem key={center.id} value={center.id.toString()}>
                      {center.code} - {center.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  data-testid="input-value"
                />
              </div>
              <div className="space-y-2">
                <Label>Numero do Documento</Label>
                <Input
                  placeholder="NF, recibo, etc."
                  value={formData.documentNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, documentNumber: e.target.value })
                  }
                  data-testid="input-document-number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Documento</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) =>
                  setFormData({ ...formData, documentType: value })
                }
              >
                <SelectTrigger data-testid="select-document-type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nfse">NFS-e</SelectItem>
                  <SelectItem value="nfe">NF-e</SelectItem>
                  <SelectItem value="recibo">Recibo</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="ted">TED</SelectItem>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Input
                placeholder="Descricao resumida do lancamento"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                data-testid="input-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Historico</Label>
              <Textarea
                placeholder="Detalhes adicionais do lancamento"
                value={formData.history}
                onChange={(e) =>
                  setFormData({ ...formData, history: e.target.value })
                }
                data-testid="input-history"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingEntry(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createEntry.isPending || updateEntry.isPending}
              data-testid="button-save-entry"
            >
              {createEntry.isPending || updateEntry.isPending
                ? "Salvando..."
                : editingEntry
                ? "Atualizar"
                : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
