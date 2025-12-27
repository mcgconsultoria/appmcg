import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminPessoalLayout } from "@/components/AdminPessoalLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, DollarSign, TrendingUp, Trash2, Download, Calculator, Calendar, ArrowLeft } from "lucide-react";
import type { IrpjSummary, IrpjDasPayment } from "@shared/schema";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function IRPJ() {
  const { toast } = useToast();
  const [selectedSummary, setSelectedSummary] = useState<IrpjSummary | null>(null);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showDasDialog, setShowDasDialog] = useState(false);

  const [regimeTributario, setRegimeTributario] = useState("simples");
  const [dasMonth, setDasMonth] = useState("1");

  const openSummaryDialog = () => { setRegimeTributario("simples"); setShowSummaryDialog(true); };
  const closeSummaryDialog = () => { setShowSummaryDialog(false); setRegimeTributario("simples"); };

  const openDasDialog = () => { setDasMonth("1"); setShowDasDialog(true); };
  const closeDasDialog = () => { setShowDasDialog(false); setDasMonth("1"); };

  const { data: summaries = [], isLoading } = useQuery<IrpjSummary[]>({
    queryKey: ["/api/admin/irpj/summaries"],
  });

  const { data: dasPayments = [] } = useQuery<IrpjDasPayment[]>({
    queryKey: ["/api/admin/irpj/summaries", selectedSummary?.id, "das"],
    enabled: !!selectedSummary,
  });

  const createSummaryMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/irpj/summaries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpj/summaries"] });
      closeSummaryDialog();
      toast({ title: "Resumo criado com sucesso" });
    },
  });

  const deleteSummaryMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/irpj/summaries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpj/summaries"] });
      setSelectedSummary(null);
      toast({ title: "Resumo excluído" });
    },
  });

  const createDasMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/irpj/das", { ...data, summaryId: selectedSummary?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpj/summaries", selectedSummary?.id, "das"] });
      closeDasDialog();
      toast({ title: "DAS adicionado" });
    },
  });

  const updateDasMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/admin/irpj/das/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpj/summaries", selectedSummary?.id, "das"] });
      toast({ title: "DAS atualizado" });
    },
  });

  const deleteDasMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/irpj/das/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpj/summaries", selectedSummary?.id, "das"] });
      toast({ title: "DAS excluído" });
    },
  });

  const totalDas = dasPayments.reduce((acc, d) => acc + parseFloat(d.dasValue || "0"), 0);
  const paidDas = dasPayments.filter(d => d.isPaid).reduce((acc, d) => acc + parseFloat(d.dasValue || "0"), 0);
  const pendingDas = totalDas - paidDas;

  const handleSummarySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createSummaryMutation.mutate({
      year: parseInt(formData.get("year") as string),
      cnpj: formData.get("cnpj"),
      razaoSocial: formData.get("razaoSocial"),
      regimeTributario: regimeTributario,
      totalRevenue: formData.get("totalRevenue") || "0",
      totalExpenses: formData.get("totalExpenses") || "0",
      totalProlabore: formData.get("totalProlabore") || "0",
      totalDividends: formData.get("totalDividends") || "0",
      notes: formData.get("notes"),
    });
  };

  const handleDasSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createDasMutation.mutate({
      competenceMonth: parseInt(dasMonth),
      competenceYear: parseInt(formData.get("competenceYear") as string),
      revenueBase: formData.get("revenueBase"),
      aliquot: formData.get("aliquot"),
      dasValue: formData.get("dasValue"),
      dueDate: formData.get("dueDate"),
      isPaid: false,
    });
  };

  const toggleDasPaid = (das: IrpjDasPayment) => {
    updateDasMutation.mutate({
      id: das.id,
      data: { isPaid: !das.isPaid, paymentDate: !das.isPaid ? new Date().toISOString().split("T")[0] : null },
    });
  };

  if (!selectedSummary) {
    return (
      <AdminPessoalLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">IRPJ - Imposto de Renda Pessoa Jurídica</h1>
              <p className="text-muted-foreground">Resumo fiscal anual para contabilidade</p>
            </div>
            <Dialog open={showSummaryDialog} onOpenChange={(open) => { if (!open) closeSummaryDialog(); }}>
              <Button onClick={() => openSummaryDialog()} data-testid="button-add-summary">
                <Plus className="h-4 w-4 mr-2" />
                Novo Resumo Anual
              </Button>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Resumo IRPJ</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSummarySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ano-Calendário</Label>
                      <Input name="year" type="number" defaultValue={new Date().getFullYear() - 1} required data-testid="input-year" />
                    </div>
                    <div className="space-y-2">
                      <Label>Regime Tributário</Label>
                      <Select value={regimeTributario} onValueChange={setRegimeTributario}>
                        <SelectTrigger data-testid="select-regime">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simples">Simples Nacional</SelectItem>
                          <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                          <SelectItem value="lucro_real">Lucro Real</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>CNPJ</Label>
                    <Input name="cnpj" placeholder="00.000.000/0001-00" data-testid="input-cnpj" />
                  </div>
                  <div className="space-y-2">
                    <Label>Razão Social</Label>
                    <Input name="razaoSocial" data-testid="input-razao-social" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Faturamento Total</Label>
                      <Input name="totalRevenue" type="number" step="0.01" defaultValue="0" data-testid="input-revenue" />
                    </div>
                    <div className="space-y-2">
                      <Label>Despesas Totais</Label>
                      <Input name="totalExpenses" type="number" step="0.01" defaultValue="0" data-testid="input-expenses" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Pró-labore</Label>
                      <Input name="totalProlabore" type="number" step="0.01" defaultValue="0" data-testid="input-prolabore" />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Dividendos</Label>
                      <Input name="totalDividends" type="number" step="0.01" defaultValue="0" data-testid="input-dividends" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea name="notes" data-testid="input-notes" />
                  </div>
                  <Button type="submit" className="w-full" disabled={createSummaryMutation.isPending} data-testid="button-save-summary">
                    {createSummaryMutation.isPending ? "Criando..." : "Criar Resumo"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : summaries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum resumo fiscal cadastrado. Crie um novo para começar.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaries.map(summary => (
                <Card key={summary.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedSummary(summary)} data-testid={`card-summary-${summary.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>IRPJ {summary.year}</CardTitle>
                      <Badge variant={summary.status === "submitted" ? "default" : summary.status === "ready" ? "secondary" : "outline"}>
                        {summary.status === "submitted" ? "Enviado" : summary.status === "ready" ? "Pronto" : "Rascunho"}
                      </Badge>
                    </div>
                    <CardDescription>{summary.razaoSocial || "Razão social não informada"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Faturamento:</span>
                        <span className="font-medium text-green-600">R$ {parseFloat(summary.totalRevenue || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total DAS:</span>
                        <span className="font-medium text-orange-600">R$ {parseFloat(summary.totalDas || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Regime:</span>
                        <Badge variant="secondary">
                          {summary.regimeTributario === "simples" ? "Simples Nacional" : summary.regimeTributario === "lucro_presumido" ? "Lucro Presumido" : "Lucro Real"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminPessoalLayout>
    );
  }

  return (
    <AdminPessoalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Button variant="ghost" onClick={() => setSelectedSummary(null)} className="mb-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold" data-testid="text-summary-title">IRPJ {selectedSummary.year}</h1>
            <p className="text-muted-foreground">{selectedSummary.razaoSocial || "Razão social não informada"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Exportar para Contabilidade
            </Button>
            <Button variant="destructive" onClick={() => deleteSummaryMutation.mutate(selectedSummary.id)} data-testid="button-delete-summary">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-revenue">
                R$ {parseFloat(selectedSummary.totalRevenue || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="text-expenses">
                R$ {parseFloat(selectedSummary.totalExpenses || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">DAS Pago</CardTitle>
              <Calculator className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-das-paid">
                R$ {paidDas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">DAS Pendente</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-das-pending">
                R$ {pendingDas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Informações da Empresa</CardTitle>
                <CardDescription>Dados para contabilidade</CardDescription>
              </div>
              <Badge>
                {selectedSummary.regimeTributario === "simples" ? "Simples Nacional" : selectedSummary.regimeTributario === "lucro_presumido" ? "Lucro Presumido" : "Lucro Real"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CNPJ</p>
                <p className="font-medium">{selectedSummary.cnpj || "Não informado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pró-labore Anual</p>
                <p className="font-medium">R$ {parseFloat(selectedSummary.totalProlabore || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dividendos</p>
                <p className="font-medium">R$ {parseFloat(selectedSummary.totalDividends || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">INSS Patronal</p>
                <p className="font-medium">R$ {parseFloat(selectedSummary.totalInss || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="das">
          <TabsList>
            <TabsTrigger value="das" data-testid="tab-das">Pagamentos DAS</TabsTrigger>
            <TabsTrigger value="summary" data-testid="tab-summary">Resumo Mensal</TabsTrigger>
          </TabsList>

          <TabsContent value="das" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showDasDialog} onOpenChange={(open) => { if (!open) closeDasDialog(); }}>
                <Button onClick={() => openDasDialog()} data-testid="button-add-das">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo DAS
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Pagamento DAS</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDasSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mês Competência</Label>
                        <Select value={dasMonth} onValueChange={setDasMonth}>
                          <SelectTrigger data-testid="select-month">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((month, index) => (
                              <SelectItem key={index} value={(index + 1).toString()}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ano Competência</Label>
                        <Input name="competenceYear" type="number" defaultValue={selectedSummary.year} required data-testid="input-comp-year" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base de Cálculo (Faturamento)</Label>
                        <Input name="revenueBase" type="number" step="0.01" required data-testid="input-revenue-base" />
                      </div>
                      <div className="space-y-2">
                        <Label>Alíquota (%)</Label>
                        <Input name="aliquot" type="number" step="0.0001" placeholder="0.0600" data-testid="input-aliquot" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor DAS</Label>
                        <Input name="dasValue" type="number" step="0.01" required data-testid="input-das-value" />
                      </div>
                      <div className="space-y-2">
                        <Label>Vencimento</Label>
                        <Input name="dueDate" type="date" data-testid="input-due-date" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createDasMutation.isPending} data-testid="button-save-das">
                      {createDasMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {dasPayments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum pagamento DAS cadastrado
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dasPayments.map(das => (
                  <Card key={das.id} data-testid={`card-das-${das.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">{MONTHS[das.competenceMonth - 1]} {das.competenceYear}</CardTitle>
                      <Badge variant={das.isPaid ? "default" : "outline"} className="cursor-pointer" onClick={() => toggleDasPaid(das)}>
                        {das.isPaid ? "Pago" : "Pendente"}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base:</span>
                          <span>R$ {parseFloat(das.revenueBase || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Alíquota:</span>
                          <span>{(parseFloat(das.aliquot || "0") * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>DAS:</span>
                          <span className={das.isPaid ? "text-green-600" : "text-orange-600"}>
                            R$ {parseFloat(das.dasValue || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {das.dueDate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Vencimento:</span>
                            <span>{new Date(das.dueDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button size="icon" variant="ghost" onClick={() => deleteDasMutation.mutate(das.id)} data-testid={`button-delete-das-${das.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo para Contabilidade</CardTitle>
                <CardDescription>Informações consolidadas do ano {selectedSummary.year}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
                    <div>
                      <p className="text-sm text-muted-foreground">Faturamento Bruto Anual</p>
                      <p className="text-xl font-bold text-green-600">R$ {parseFloat(selectedSummary.totalRevenue || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Despesas Operacionais</p>
                      <p className="text-xl font-bold text-red-600">R$ {parseFloat(selectedSummary.totalExpenses || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-md">
                    <div>
                      <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                      <p className="text-xl font-bold">
                        R$ {(parseFloat(selectedSummary.totalRevenue || "0") - parseFloat(selectedSummary.totalExpenses || "0")).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total DAS Pago</p>
                      <p className="text-xl font-bold text-blue-600">R$ {paidDas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pró-labore + Dividendos</p>
                      <p className="text-xl font-bold">
                        R$ {(parseFloat(selectedSummary.totalProlabore || "0") + parseFloat(selectedSummary.totalDividends || "0")).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  {selectedSummary.notes && (
                    <div className="p-4 border rounded-md">
                      <p className="text-sm text-muted-foreground mb-2">Observações</p>
                      <p>{selectedSummary.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPessoalLayout>
  );
}
