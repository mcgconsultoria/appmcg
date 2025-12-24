import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  FileText,
  Plus,
  Pencil,
  Trash2,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ContractTemplate, ContractAgreement, Company } from "@shared/schema";

const contractStatusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  viewed: "Visualizado",
  signed: "Assinado",
  expired: "Expirado",
  cancelled: "Cancelado",
};

const contractStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  sent: "bg-blue-500/10 text-blue-500",
  viewed: "bg-purple-500/10 text-purple-500",
  signed: "bg-green-500/10 text-green-500",
  expired: "bg-red-500/10 text-red-500",
  cancelled: "bg-muted text-muted-foreground",
};

const contractTypeLabels: Record<string, string> = {
  consultoria: "Contrato de Consultoria",
  aplicativo: "Contrato do Aplicativo",
};

export default function AdminContratos() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("agreements");

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    type: "consultoria",
    name: "",
    version: "1.0",
    content: "",
  });

  const [isAgreementDialogOpen, setIsAgreementDialogOpen] = useState(false);
  const [agreementForm, setAgreementForm] = useState({
    companyId: "",
    templateId: "",
    contractType: "consultoria",
    notes: "",
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contract-templates"],
  });

  const { data: agreements = [], isLoading: agreementsLoading } = useQuery<ContractAgreement[]>({
    queryKey: ["/api/contract-agreements"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/admin/companies"],
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: typeof templateForm) => {
      const response = await apiRequest("POST", "/api/contract-templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      setIsTemplateDialogOpen(false);
      resetTemplateForm();
      toast({ title: "Modelo criado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar modelo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof templateForm> }) => {
      const response = await apiRequest("PATCH", `/api/contract-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      setIsTemplateDialogOpen(false);
      setEditingTemplate(null);
      resetTemplateForm();
      toast({ title: "Modelo atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar modelo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/contract-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      toast({ title: "Modelo excluido com sucesso!" });
    },
  });

  const createAgreementMutation = useMutation({
    mutationFn: async (data: typeof agreementForm) => {
      const response = await apiRequest("POST", "/api/contract-agreements", {
        ...data,
        companyId: parseInt(data.companyId),
        templateId: parseInt(data.templateId),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-agreements"] });
      setIsAgreementDialogOpen(false);
      resetAgreementForm();
      toast({ title: "Contrato enviado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetTemplateForm = () => {
    setTemplateForm({
      type: "consultoria",
      name: "",
      version: "1.0",
      content: "",
    });
  };

  const resetAgreementForm = () => {
    setAgreementForm({
      companyId: "",
      templateId: "",
      contractType: "consultoria",
      notes: "",
    });
  };

  const handleEditTemplate = (template: ContractTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      type: template.type,
      name: template.name,
      version: template.version || "1.0",
      content: template.content || "",
    });
    setIsTemplateDialogOpen(true);
  };

  const handleSubmitTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: templateForm });
    } else {
      createTemplateMutation.mutate(templateForm);
    }
  };

  const pendingCount = agreements.filter(a => a.status === "pending" || a.status === "sent").length;
  const signedCount = agreements.filter(a => a.status === "signed").length;

  return (
    <AppLayout title="Admin MCG">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Contratos Digitais
          </h1>
          <p className="text-muted-foreground">
            Gerencie modelos e contratos de clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modelos</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assinados</p>
                  <p className="text-2xl font-bold">{signedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empresas</p>
                  <p className="text-2xl font-bold">{companies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="agreements" data-testid="tab-agreements">
              <Send className="h-4 w-4 mr-2" />
              Contratos Enviados
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <FileText className="h-4 w-4 mr-2" />
              Modelos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agreements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Contratos Enviados</CardTitle>
                  <CardDescription>Contratos enviados para assinatura dos clientes</CardDescription>
                </div>
                <Button onClick={() => setIsAgreementDialogOpen(true)} data-testid="button-new-agreement">
                  <Plus className="h-4 w-4 mr-2" />
                  Enviar Contrato
                </Button>
              </CardHeader>
              <CardContent>
                {agreementsLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : agreements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum contrato enviado ainda
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Emitido</TableHead>
                        <TableHead>Assinado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agreements.map((agreement) => {
                        const company = companies.find(c => c.id === agreement.companyId);
                        return (
                          <TableRow key={agreement.id}>
                            <TableCell className="font-medium">
                              {company?.name || `Empresa #${agreement.companyId}`}
                            </TableCell>
                            <TableCell>
                              {contractTypeLabels[agreement.contractType] || agreement.contractType}
                            </TableCell>
                            <TableCell>
                              <Badge className={contractStatusColors[agreement.status || "pending"]}>
                                {contractStatusLabels[agreement.status || "pending"]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {agreement.issuedAt
                                ? format(new Date(agreement.issuedAt), "dd/MM/yyyy", { locale: ptBR })
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {agreement.signedAt
                                ? format(new Date(agreement.signedAt), "dd/MM/yyyy", { locale: ptBR })
                                : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Modelos de Contrato</CardTitle>
                  <CardDescription>Templates de contrato disponiveis para envio</CardDescription>
                </div>
                <Button onClick={() => setIsTemplateDialogOpen(true)} data-testid="button-new-template">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Modelo
                </Button>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : templates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum modelo criado ainda
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Versao</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>
                            {contractTypeLabels[template.type] || template.type}
                          </TableCell>
                          <TableCell>{template.version}</TableCell>
                          <TableCell>
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleEditTemplate(template)}
                                data-testid={`button-edit-template-${template.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteTemplateMutation.mutate(template.id)}
                                data-testid={`button-delete-template-${template.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Modelo" : "Novo Modelo de Contrato"}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate
                  ? "Atualize as informações do modelo"
                  : "Crie um novo modelo de contrato"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <Select
                    value={templateForm.type}
                    onValueChange={(v) => setTemplateForm({ ...templateForm, type: v })}
                  >
                    <SelectTrigger data-testid="select-template-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultoria">Contrato de Consultoria</SelectItem>
                      <SelectItem value="aplicativo">Contrato do Aplicativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Versao</label>
                  <Input
                    value={templateForm.version}
                    onChange={(e) => setTemplateForm({ ...templateForm, version: e.target.value })}
                    placeholder="1.0"
                    data-testid="input-template-version"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Nome do Modelo</label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="Ex: Contrato de Consultoria Padrao"
                  data-testid="input-template-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Conteúdo do Contrato</label>
                <Textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Insira o texto do contrato aqui..."
                  className="min-h-[200px]"
                  data-testid="input-template-content"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTemplateDialogOpen(false);
                  setEditingTemplate(null);
                  resetTemplateForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitTemplate}
                disabled={!templateForm.name || createTemplateMutation.isPending || updateTemplateMutation.isPending}
                data-testid="button-save-template"
              >
                {createTemplateMutation.isPending || updateTemplateMutation.isPending
                  ? "Salvando..."
                  : editingTemplate
                  ? "Atualizar"
                  : "Criar Modelo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAgreementDialogOpen} onOpenChange={setIsAgreementDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Contrato</DialogTitle>
              <DialogDescription>
                Selecione a empresa e o modelo de contrato para enviar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Empresa</label>
                <Select
                  value={agreementForm.companyId}
                  onValueChange={(v) => setAgreementForm({ ...agreementForm, companyId: v })}
                >
                  <SelectTrigger data-testid="select-agreement-company">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Tipo de Contrato</label>
                <Select
                  value={agreementForm.contractType}
                  onValueChange={(v) => setAgreementForm({ ...agreementForm, contractType: v })}
                >
                  <SelectTrigger data-testid="select-agreement-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultoria">Contrato de Consultoria</SelectItem>
                    <SelectItem value="aplicativo">Contrato do Aplicativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Modelo</label>
                <Select
                  value={agreementForm.templateId}
                  onValueChange={(v) => setAgreementForm({ ...agreementForm, templateId: v })}
                >
                  <SelectTrigger data-testid="select-agreement-template">
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter(t => t.type === agreementForm.contractType && t.isActive)
                      .map((template) => (
                        <SelectItem key={template.id} value={String(template.id)}>
                          {template.name} (v{template.version})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Observações (opcional)</label>
                <Textarea
                  value={agreementForm.notes}
                  onChange={(e) => setAgreementForm({ ...agreementForm, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  data-testid="input-agreement-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAgreementDialogOpen(false);
                  resetAgreementForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => createAgreementMutation.mutate(agreementForm)}
                disabled={
                  !agreementForm.companyId ||
                  !agreementForm.templateId ||
                  createAgreementMutation.isPending
                }
                data-testid="button-send-agreement"
              >
                {createAgreementMutation.isPending ? "Enviando..." : "Enviar Contrato"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
