import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
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
import { Plus, FileText, DollarSign, Users, Building, Trash2, Download, ArrowLeft } from "lucide-react";
import type { IrpfDeclaration, IrpfIncome, IrpfDeduction, IrpfDependent, IrpfAsset } from "@shared/schema";

export default function IRPF() {
  const { toast } = useToast();
  const [selectedDeclaration, setSelectedDeclaration] = useState<IrpfDeclaration | null>(null);
  const [showDeclarationDialog, setShowDeclarationDialog] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);
  const [showDependentDialog, setShowDependentDialog] = useState(false);
  const [showAssetDialog, setShowAssetDialog] = useState(false);

  const [incomeType, setIncomeType] = useState("salario");
  const [deductionType, setDeductionType] = useState("saude");
  const [dependentRelationship, setDependentRelationship] = useState("filho");
  const [assetType, setAssetType] = useState("imovel");

  const openDeclarationDialog = () => { setShowDeclarationDialog(true); };
  const closeDeclarationDialog = () => { setShowDeclarationDialog(false); };

  const openIncomeDialog = () => { setIncomeType("salario"); setShowIncomeDialog(true); };
  const closeIncomeDialog = () => { setShowIncomeDialog(false); setIncomeType("salario"); };

  const openDeductionDialog = () => { setDeductionType("saude"); setShowDeductionDialog(true); };
  const closeDeductionDialog = () => { setShowDeductionDialog(false); setDeductionType("saude"); };

  const openDependentDialog = () => { setDependentRelationship("filho"); setShowDependentDialog(true); };
  const closeDependentDialog = () => { setShowDependentDialog(false); setDependentRelationship("filho"); };

  const openAssetDialog = () => { setAssetType("imovel"); setShowAssetDialog(true); };
  const closeAssetDialog = () => { setShowAssetDialog(false); setAssetType("imovel"); };

  const { data: declarations = [], isLoading } = useQuery<IrpfDeclaration[]>({
    queryKey: ["/api/admin/irpf/declarations"],
  });

  const { data: incomes = [] } = useQuery<IrpfIncome[]>({
    queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "incomes"],
    enabled: !!selectedDeclaration,
  });

  const { data: deductions = [] } = useQuery<IrpfDeduction[]>({
    queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "deductions"],
    enabled: !!selectedDeclaration,
  });

  const { data: dependents = [] } = useQuery<IrpfDependent[]>({
    queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "dependents"],
    enabled: !!selectedDeclaration,
  });

  const { data: assets = [] } = useQuery<IrpfAsset[]>({
    queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "assets"],
    enabled: !!selectedDeclaration,
  });

  const createDeclarationMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/irpf/declarations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations"] });
      closeDeclarationDialog();
      toast({ title: "Declaração criada com sucesso" });
    },
  });

  const deleteDeclarationMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/irpf/declarations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations"] });
      setSelectedDeclaration(null);
      toast({ title: "Declaração excluída" });
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/irpf/incomes", { ...data, declarationId: selectedDeclaration?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "incomes"] });
      closeIncomeDialog();
      toast({ title: "Rendimento adicionado" });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/irpf/incomes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "incomes"] });
      toast({ title: "Rendimento excluído" });
    },
  });

  const createDeductionMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/irpf/deductions", { ...data, declarationId: selectedDeclaration?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "deductions"] });
      closeDeductionDialog();
      toast({ title: "Dedução adicionada" });
    },
  });

  const deleteDeductionMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/irpf/deductions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "deductions"] });
      toast({ title: "Dedução excluída" });
    },
  });

  const createDependentMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/irpf/dependents", { ...data, declarationId: selectedDeclaration?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "dependents"] });
      closeDependentDialog();
      toast({ title: "Dependente adicionado" });
    },
  });

  const deleteDependentMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/irpf/dependents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "dependents"] });
      toast({ title: "Dependente excluído" });
    },
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/irpf/assets", { ...data, declarationId: selectedDeclaration?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "assets"] });
      closeAssetDialog();
      toast({ title: "Bem adicionado" });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/irpf/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/irpf/declarations", selectedDeclaration?.id, "assets"] });
      toast({ title: "Bem excluído" });
    },
  });

  const totalIncomes = incomes.reduce((acc, i) => acc + parseFloat(i.grossAmount || "0"), 0);
  const totalDeductions = deductions.reduce((acc, d) => acc + parseFloat(d.amount || "0"), 0);
  const totalTaxWithheld = incomes.reduce((acc, i) => acc + parseFloat(i.taxWithheld || "0"), 0);

  const handleDeclarationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createDeclarationMutation.mutate({
      year: parseInt(formData.get("year") as string),
      cpf: formData.get("cpf"),
      fullName: formData.get("fullName"),
      occupation: formData.get("occupation"),
    });
  };

  const handleIncomeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createIncomeMutation.mutate({
      type: incomeType,
      sourceName: formData.get("sourceName"),
      sourceCnpj: formData.get("sourceCnpj"),
      grossAmount: formData.get("grossAmount"),
      taxWithheld: formData.get("taxWithheld"),
      inssWithheld: formData.get("inssWithheld"),
    });
  };

  const handleDeductionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createDeductionMutation.mutate({
      type: deductionType,
      description: formData.get("description"),
      beneficiaryName: formData.get("beneficiaryName"),
      beneficiaryCpfCnpj: formData.get("beneficiaryCpfCnpj"),
      amount: formData.get("amount"),
    });
  };

  const handleDependentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createDependentMutation.mutate({
      name: formData.get("name"),
      cpf: formData.get("cpf"),
      birthDate: formData.get("birthDate"),
      relationship: dependentRelationship,
    });
  };

  const handleAssetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAssetMutation.mutate({
      type: assetType,
      description: formData.get("description"),
      location: formData.get("location"),
      acquisitionValue: formData.get("acquisitionValue"),
      currentValue: formData.get("currentValue"),
    });
  };

  if (!selectedDeclaration) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-page-title">IRPF - Imposto de Renda Pessoa Física</h1>
              <p className="text-muted-foreground">Gerencie suas declarações de imposto de renda</p>
            </div>
            <Dialog open={showDeclarationDialog} onOpenChange={(open) => { if (!open) closeDeclarationDialog(); }}>
              <Button onClick={() => openDeclarationDialog()} data-testid="button-add-declaration">
                <Plus className="h-4 w-4 mr-2" />
                Nova Declaração
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Declaração IRPF</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleDeclarationSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ano-Calendário</Label>
                    <Input name="year" type="number" defaultValue={new Date().getFullYear() - 1} required data-testid="input-year" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input name="cpf" placeholder="000.000.000-00" data-testid="input-cpf" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input name="fullName" data-testid="input-full-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ocupação</Label>
                    <Input name="occupation" data-testid="input-occupation" />
                  </div>
                  <Button type="submit" className="w-full" disabled={createDeclarationMutation.isPending} data-testid="button-save-declaration">
                    {createDeclarationMutation.isPending ? "Criando..." : "Criar Declaração"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : declarations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma declaração cadastrada. Crie uma nova para começar.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {declarations.map(dec => (
                <Card key={dec.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedDeclaration(dec)} data-testid={`card-declaration-${dec.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>IRPF {dec.year}</CardTitle>
                      <Badge variant={dec.status === "submitted" ? "default" : dec.status === "ready" ? "secondary" : "outline"}>
                        {dec.status === "submitted" ? "Enviada" : dec.status === "ready" ? "Pronta" : "Rascunho"}
                      </Badge>
                    </div>
                    <CardDescription>{dec.fullName || "Nome não informado"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Rendimentos:</span>
                        <span className="font-medium">R$ {parseFloat(dec.totalIncome || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Deduções:</span>
                        <span className="font-medium">R$ {parseFloat(dec.totalDeductions || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Button variant="ghost" onClick={() => setSelectedDeclaration(null)} className="mb-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold" data-testid="text-declaration-title">IRPF {selectedDeclaration.year}</h1>
            <p className="text-muted-foreground">{selectedDeclaration.fullName || "Nome não informado"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Exportar para Contabilidade
            </Button>
            <Button variant="destructive" onClick={() => deleteDeclarationMutation.mutate(selectedDeclaration.id)} data-testid="button-delete-declaration">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Rendimentos</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-total-incomes">
                R$ {totalIncomes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Total Deduções</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600" data-testid="text-total-deductions">
                R$ {totalDeductions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">IRRF Retido</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-tax-withheld">
                R$ {totalTaxWithheld.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Dependentes</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-dependents-count">
                {dependents.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incomes">
          <TabsList>
            <TabsTrigger value="incomes" data-testid="tab-incomes">Rendimentos</TabsTrigger>
            <TabsTrigger value="deductions" data-testid="tab-deductions">Deduções</TabsTrigger>
            <TabsTrigger value="dependents" data-testid="tab-dependents">Dependentes</TabsTrigger>
            <TabsTrigger value="assets" data-testid="tab-assets">Bens e Direitos</TabsTrigger>
          </TabsList>

          <TabsContent value="incomes" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showIncomeDialog} onOpenChange={(open) => { if (!open) closeIncomeDialog(); }}>
                <Button onClick={() => openIncomeDialog()} data-testid="button-add-income">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Rendimento
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Rendimento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleIncomeSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={incomeType} onValueChange={setIncomeType}>
                        <SelectTrigger data-testid="select-income-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salario">Salário</SelectItem>
                          <SelectItem value="prolabore">Pró-labore</SelectItem>
                          <SelectItem value="aluguel">Aluguel</SelectItem>
                          <SelectItem value="dividendos">Dividendos</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fonte Pagadora</Label>
                      <Input name="sourceName" required data-testid="input-source-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>CNPJ da Fonte</Label>
                      <Input name="sourceCnpj" data-testid="input-source-cnpj" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rendimento Bruto</Label>
                        <Input name="grossAmount" type="number" step="0.01" required data-testid="input-gross-amount" />
                      </div>
                      <div className="space-y-2">
                        <Label>IRRF Retido</Label>
                        <Input name="taxWithheld" type="number" step="0.01" defaultValue="0" data-testid="input-tax-withheld" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>INSS Retido</Label>
                      <Input name="inssWithheld" type="number" step="0.01" defaultValue="0" data-testid="input-inss-withheld" />
                    </div>
                    <Button type="submit" className="w-full" disabled={createIncomeMutation.isPending} data-testid="button-save-income">
                      {createIncomeMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {incomes.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum rendimento cadastrado</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {incomes.map(inc => (
                  <Card key={inc.id} data-testid={`card-income-${inc.id}`}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="font-medium">{inc.sourceName}</p>
                        <p className="text-sm text-muted-foreground">
                          {inc.type === "salario" ? "Salário" : inc.type === "prolabore" ? "Pró-labore" : inc.type === "aluguel" ? "Aluguel" : inc.type === "dividendos" ? "Dividendos" : "Outros"}
                          {inc.sourceCnpj && ` - ${inc.sourceCnpj}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-green-600">R$ {parseFloat(inc.grossAmount || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          <p className="text-sm text-muted-foreground">IRRF: R$ {parseFloat(inc.taxWithheld || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => deleteIncomeMutation.mutate(inc.id)} data-testid={`button-delete-income-${inc.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showDeductionDialog} onOpenChange={(open) => { if (!open) closeDeductionDialog(); }}>
                <Button onClick={() => openDeductionDialog()} data-testid="button-add-deduction">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Dedução
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Dedução</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDeductionSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={deductionType} onValueChange={setDeductionType}>
                        <SelectTrigger data-testid="select-deduction-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saude">Saúde</SelectItem>
                          <SelectItem value="educacao">Educação</SelectItem>
                          <SelectItem value="previdencia">Previdência Privada</SelectItem>
                          <SelectItem value="pensao">Pensão Alimentícia</SelectItem>
                          <SelectItem value="dependente">Dependente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input name="description" required data-testid="input-deduction-description" />
                    </div>
                    <div className="space-y-2">
                      <Label>Beneficiário</Label>
                      <Input name="beneficiaryName" data-testid="input-beneficiary-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF/CNPJ do Beneficiário</Label>
                      <Input name="beneficiaryCpfCnpj" data-testid="input-beneficiary-cpf" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input name="amount" type="number" step="0.01" required data-testid="input-deduction-amount" />
                    </div>
                    <Button type="submit" className="w-full" disabled={createDeductionMutation.isPending} data-testid="button-save-deduction">
                      {createDeductionMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {deductions.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma dedução cadastrada</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {deductions.map(ded => (
                  <Card key={ded.id} data-testid={`card-deduction-${ded.id}`}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="font-medium">{ded.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {ded.type === "saude" ? "Saúde" : ded.type === "educacao" ? "Educação" : ded.type === "previdencia" ? "Previdência" : ded.type === "pensao" ? "Pensão" : "Dependente"}
                          {ded.beneficiaryName && ` - ${ded.beneficiaryName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-blue-600">R$ {parseFloat(ded.amount || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        <Button size="icon" variant="ghost" onClick={() => deleteDeductionMutation.mutate(ded.id)} data-testid={`button-delete-deduction-${ded.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dependents" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showDependentDialog} onOpenChange={(open) => { if (!open) closeDependentDialog(); }}>
                <Button onClick={() => openDependentDialog()} data-testid="button-add-dependent">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Dependente
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Dependente</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDependentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input name="name" required data-testid="input-dependent-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input name="cpf" data-testid="input-dependent-cpf" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input name="birthDate" type="date" data-testid="input-dependent-birth" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parentesco</Label>
                      <Select value={dependentRelationship} onValueChange={setDependentRelationship}>
                        <SelectTrigger data-testid="select-relationship">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="filho">Filho(a)</SelectItem>
                          <SelectItem value="conjuge">Cônjuge</SelectItem>
                          <SelectItem value="pai">Pai</SelectItem>
                          <SelectItem value="mae">Mãe</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={createDependentMutation.isPending} data-testid="button-save-dependent">
                      {createDependentMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {dependents.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum dependente cadastrado</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dependents.map(dep => (
                  <Card key={dep.id} data-testid={`card-dependent-${dep.id}`}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div>
                        <p className="font-medium">{dep.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dep.relationship === "filho" ? "Filho(a)" : dep.relationship === "conjuge" ? "Cônjuge" : dep.relationship === "pai" ? "Pai" : dep.relationship === "mae" ? "Mãe" : "Outro"}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => deleteDependentMutation.mutate(dep.id)} data-testid={`button-delete-dependent-${dep.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showAssetDialog} onOpenChange={(open) => { if (!open) closeAssetDialog(); }}>
                <Button onClick={() => openAssetDialog()} data-testid="button-add-asset">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Bem
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Bem ou Direito</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAssetSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={assetType} onValueChange={setAssetType}>
                        <SelectTrigger data-testid="select-asset-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imovel">Imóvel</SelectItem>
                          <SelectItem value="veiculo">Veículo</SelectItem>
                          <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                          <SelectItem value="investimento">Investimento</SelectItem>
                          <SelectItem value="participacao">Participação Societária</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Textarea name="description" required data-testid="input-asset-description" />
                    </div>
                    <div className="space-y-2">
                      <Label>Localização (País/UF)</Label>
                      <Input name="location" data-testid="input-asset-location" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor de Aquisição</Label>
                        <Input name="acquisitionValue" type="number" step="0.01" data-testid="input-acquisition-value" />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Atual</Label>
                        <Input name="currentValue" type="number" step="0.01" data-testid="input-current-value" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createAssetMutation.isPending} data-testid="button-save-asset">
                      {createAssetMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            {assets.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum bem cadastrado</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {assets.map(asset => (
                  <Card key={asset.id} data-testid={`card-asset-${asset.id}`}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-muted">
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{asset.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {asset.type === "imovel" ? "Imóvel" : asset.type === "veiculo" ? "Veículo" : asset.type === "conta_corrente" ? "Conta Corrente" : asset.type === "investimento" ? "Investimento" : "Participação"}
                            {asset.location && ` - ${asset.location}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">R$ {parseFloat(asset.currentValue || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        <Button size="icon" variant="ghost" onClick={() => deleteAssetMutation.mutate(asset.id)} data-testid={`button-delete-asset-${asset.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
