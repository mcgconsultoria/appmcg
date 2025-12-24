import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { Plus, TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminFinancialRecord } from "@shared/schema";

const categories = {
  receita: ["Assinatura", "Consultoria Diagnóstico", "Consultoria Implementacao", "Consultoria Execucao", "Consultoria Expansao", "Revenda", "Outro"],
  despesa: ["Salarios", "Impostos", "Marketing", "Infraestrutura", "Software", "Viagens", "Outro"],
};

export default function AdminFinanceiro() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: "receita" as "receita" | "despesa",
    category: "",
    description: "",
    clientName: "",
    value: "",
    dueDate: "",
    status: "pending",
    nfseNumber: "",
  });

  const { data: records = [], isLoading } = useQuery<AdminFinancialRecord[]>({
    queryKey: ["/api/admin/financial"],
  });

  const { data: dashboardStats } = useQuery<any>({
    queryKey: ["/api/admin/dashboard"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/financial", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/financial"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Registro criado com sucesso" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/admin/financial/${id}`, "PATCH", { status, paidAt: status === "paid" ? new Date().toISOString() : null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/financial"] });
      toast({ title: "Status atualizado" });
    },
  });

  const resetForm = () => {
    setForm({
      type: "receita",
      category: "",
      description: "",
      clientName: "",
      value: "",
      dueDate: "",
      status: "pending",
      nfseNumber: "",
    });
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      value: form.value,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
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
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const receitas = records.filter((r) => r.type === "receita");
  const despesas = records.filter((r) => r.type === "despesa");

  const totalReceitas = receitas.reduce((sum, r) => sum + parseFloat(r.value || "0"), 0);
  const totalDespesas = despesas.reduce((sum, r) => sum + parseFloat(r.value || "0"), 0);
  const margin = totalReceitas - totalDespesas;

  return (
    <AppLayout title="Admin MCG">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-financeiro-title">Financeiro Gerencial</h1>
            <p className="text-muted-foreground">Controle financeiro da MCG</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-financial">
                <Plus className="h-4 w-4 mr-2" />
                Novo Lancamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Lancamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v: "receita" | "despesa") => setForm({ ...form, type: v, category: "" })}
                  >
                    <SelectTrigger data-testid="select-financial-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger data-testid="select-financial-category">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[form.type].map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    data-testid="input-financial-description"
                  />
                </div>
                {form.type === "receita" && (
                  <div>
                    <Label>Cliente</Label>
                    <Input
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      data-testid="input-financial-client"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor (R$) *</Label>
                    <Input
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      data-testid="input-financial-value"
                    />
                  </div>
                  <div>
                    <Label>Vencimento</Label>
                    <Input
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      data-testid="input-financial-due-date"
                    />
                  </div>
                </div>
                {form.type === "receita" && (
                  <div>
                    <Label>Número NFS-e</Label>
                    <Input
                      value={form.nfseNumber}
                      onChange={(e) => setForm({ ...form, nfseNumber: e.target.value })}
                      data-testid="input-financial-nfse"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!form.category || !form.value || createMutation.isPending}
                  data-testid="button-save-financial"
                >
                  Criar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-subscriptions">
                {dashboardStats?.activeSubscriptions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-total-receitas">
                {formatCurrency(totalReceitas.toString())}
              </div>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Margem</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${margin >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-margin">
                {formatCurrency(margin.toString())}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="receitas">
          <TabsList>
            <TabsTrigger value="receitas">Receitas ({receitas.length})</TabsTrigger>
            <TabsTrigger value="despesas">Despesas ({despesas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="receitas" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {receitas.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma receita cadastrada</p>
                ) : (
                  <div className="space-y-2">
                    {receitas.map((record) => (
                      <div key={record.id} className="flex items-center justify-between gap-4 p-3 border rounded-md">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{record.category}</p>
                            <Badge variant={record.status === "paid" ? "default" : "outline"}>
                              {record.status === "paid" ? "Pago" : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {record.clientName || record.description || "-"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{formatCurrency(record.value)}</p>
                          <p className="text-xs text-muted-foreground">Venc: {formatDate(record.dueDate)}</p>
                        </div>
                        {record.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: record.id, status: "paid" })}
                          >
                            Marcar Pago
                          </Button>
                        )}
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
                {despesas.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma despesa cadastrada</p>
                ) : (
                  <div className="space-y-2">
                    {despesas.map((record) => (
                      <div key={record.id} className="flex items-center justify-between gap-4 p-3 border rounded-md">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{record.category}</p>
                            <Badge variant={record.status === "paid" ? "default" : "outline"}>
                              {record.status === "paid" ? "Pago" : "Pendente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{record.description || "-"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">{formatCurrency(record.value)}</p>
                          <p className="text-xs text-muted-foreground">Venc: {formatDate(record.dueDate)}</p>
                        </div>
                        {record.status !== "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: record.id, status: "paid" })}
                          >
                            Marcar Pago
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
