import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminPessoalLayout } from "@/components/AdminPessoalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown, Wallet, Pencil, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PersonalTransaction, PersonalAccount, PersonalCategory } from "@shared/schema";

export default function FinanceiroPessoal() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<PersonalTransaction | null>(null);
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense" | "transfer",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    accountId: "",
    linkedToMcg: false,
    mcgRecordType: "",
  });

  const { data: transactions = [], isLoading } = useQuery<PersonalTransaction[]>({
    queryKey: ["/api/admin/personal/transactions"],
  });

  const { data: accounts = [] } = useQuery<PersonalAccount[]>({
    queryKey: ["/api/admin/personal/accounts"],
  });

  const { data: categories = [] } = useQuery<PersonalCategory[]>({
    queryKey: ["/api/admin/personal/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingTransaction) {
        return apiRequest("PATCH", `/api/admin/personal/transactions/${editingTransaction.id}`, data);
      }
      return apiRequest("POST", "/api/admin/personal/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/transactions"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: editingTransaction ? "Lancamento atualizado" : "Lancamento criado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/personal/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/transactions"] });
      toast({ title: "Lancamento excluido" });
    },
  });

  const resetForm = () => {
    setEditingTransaction(null);
    setForm({
      type: "expense",
      category: "",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      accountId: "",
      linkedToMcg: false,
      mcgRecordType: "",
    });
  };

  const openEditDialog = (t: PersonalTransaction) => {
    setEditingTransaction(t);
    setForm({
      type: t.type as "income" | "expense" | "transfer",
      category: t.categoryId?.toString() || "",
      description: t.description || "",
      amount: t.amount || "",
      date: t.date || new Date().toISOString().split("T")[0],
      notes: t.notes || "",
      accountId: t.accountId?.toString() || "",
      linkedToMcg: t.linkedToMcg || false,
      mcgRecordType: t.mcgRecordType || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      type: form.type,
      description: form.description,
      amount: form.amount,
      date: form.date,
      notes: form.notes,
      accountId: form.accountId ? parseInt(form.accountId) : null,
      categoryId: form.category ? parseInt(form.category) : null,
      linkedToMcg: form.linkedToMcg,
      mcgRecordType: form.mcgRecordType || null,
    };
    createMutation.mutate(data);
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const receitas = transactions.filter((t) => t.type === "income");
  const despesas = transactions.filter((t) => t.type === "expense");

  const totalReceitas = receitas.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <AdminPessoalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-financeiro-pessoal-title">Financeiro Pessoal</h1>
            <p className="text-muted-foreground">Controle financeiro pessoal do CEO</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-lancamento">
                <Plus className="h-4 w-4 mr-2" />
                Novo Lancamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Editar Lancamento" : "Novo Lancamento"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v: "income" | "expense" | "transfer") => setForm({ ...form, type: v, category: "" })}
                  >
                    <SelectTrigger data-testid="select-lancamento-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {categories.length > 0 && (
                  <div>
                    <Label>Categoria</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger data-testid="select-lancamento-category">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((cat) => {
                            if (form.type === "income") return cat.type === "receita";
                            if (form.type === "expense") return cat.type === "despesa";
                            return cat.type === "transferencia";
                          })
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Descricao *</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    data-testid="input-lancamento-description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      data-testid="input-lancamento-value"
                    />
                  </div>
                  <div>
                    <Label>Data *</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      data-testid="input-lancamento-date"
                    />
                  </div>
                </div>
                {accounts.length > 0 && (
                  <div>
                    <Label>Conta</Label>
                    <Select
                      value={form.accountId}
                      onValueChange={(v) => setForm({ ...form, accountId: v })}
                    >
                      <SelectTrigger data-testid="select-lancamento-account">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Vinculacao MCG</Label>
                  <Select
                    value={form.linkedToMcg ? "true" : "false"}
                    onValueChange={(v) => setForm({ ...form, linkedToMcg: v === "true" })}
                  >
                    <SelectTrigger data-testid="select-lancamento-mcg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Nao vinculado</SelectItem>
                      <SelectItem value="true">Vinculado a MCG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.linkedToMcg && (
                  <div>
                    <Label>Tipo MCG</Label>
                    <Select
                      value={form.mcgRecordType}
                      onValueChange={(v) => setForm({ ...form, mcgRecordType: v })}
                    >
                      <SelectTrigger data-testid="select-lancamento-mcg-type">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prolabore">Pro-labore</SelectItem>
                        <SelectItem value="dividendo">Dividendo</SelectItem>
                        <SelectItem value="reembolso">Reembolso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Observacoes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    data-testid="input-lancamento-notes"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { resetForm(); setIsDialogOpen(false); }}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!form.description || !form.amount || createMutation.isPending}
                  data-testid="button-save-lancamento"
                >
                  {createMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-total-receitas">
                {formatCurrency(totalReceitas.toString())}
              </div>
              <p className="text-xs text-muted-foreground">{receitas.length} entrada(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="text-total-despesas">
                {formatCurrency(totalDespesas.toString())}
              </div>
              <p className="text-xs text-muted-foreground">{despesas.length} saida(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-saldo">
                {formatCurrency(saldo.toString())}
              </div>
              <p className="text-xs text-muted-foreground">{saldo >= 0 ? "Superavit" : "Deficit"}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="receitas">
          <TabsList>
            <TabsTrigger value="receitas" data-testid="tab-receitas">Receitas ({receitas.length})</TabsTrigger>
            <TabsTrigger value="despesas" data-testid="tab-despesas">Despesas ({despesas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="receitas" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : receitas.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma receita cadastrada</p>
                ) : (
                  <div className="space-y-2">
                    {receitas.map((record) => (
                      <div key={record.id} className="flex items-center justify-between gap-4 p-3 border rounded-md" data-testid={`row-receita-${record.id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{record.description}</p>
                            {record.linkedToMcg && (
                              <Badge variant="secondary">MCG</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(record.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{formatCurrency(record.amount)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(record)} data-testid={`button-edit-receita-${record.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(record.id)} data-testid={`button-delete-receita-${record.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="despesas" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : despesas.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma despesa cadastrada</p>
                ) : (
                  <div className="space-y-2">
                    {despesas.map((record) => (
                      <div key={record.id} className="flex items-center justify-between gap-4 p-3 border rounded-md" data-testid={`row-despesa-${record.id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{record.description}</p>
                            {record.linkedToMcg && (
                              <Badge variant="secondary">MCG</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(record.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">{formatCurrency(record.amount)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(record)} data-testid={`button-edit-despesa-${record.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(record.id)} data-testid={`button-delete-despesa-${record.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPessoalLayout>
  );
}
