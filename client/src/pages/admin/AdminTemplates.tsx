import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Library,
  Loader2,
  Save,
  X,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChecklistTemplate } from "@shared/schema";

const SEGMENTS = [
  "alimenticio",
  "embalagem",
  "quimico",
  "farmaceutico",
  "cosmetico",
  "automotivo",
  "eletronico",
  "textil",
  "metalurgico",
  "plastico",
  "papel_celulose",
  "bebidas",
  "agroindustria",
  "construcao",
  "outro",
];

const SEGMENT_LABELS: Record<string, string> = {
  alimenticio: "Alimenticio",
  embalagem: "Embalagem",
  quimico: "Quimico",
  farmaceutico: "Farmaceutico",
  cosmetico: "Cosmetico",
  automotivo: "Automotivo",
  eletronico: "Eletronico",
  textil: "Textil",
  metalurgico: "Metalurgico",
  plastico: "Plastico",
  papel_celulose: "Papel e Celulose",
  bebidas: "Bebidas",
  agroindustria: "Agroindustria",
  construcao: "Construcao",
  outro: "Outro",
};

const CHECKLIST_SECTIONS = [
  "comercial",
  "direcao",
  "qualidade",
  "planejamento",
  "financeiro",
  "op_transporte",
  "op_distribuição",
  "op_armazenagem",
  "grisco",
  "ti",
  "compras",
  "contábil_fiscal",
  "rh",
  "jurídico",
  "cliente_teste",
  "boas_vindas",
  "relacionamento",
  "encerramento",
];

const SECTION_LABELS: Record<string, string> = {
  comercial: "Comercial",
  direcao: "Direcao",
  qualidade: "Qualidade",
  planejamento: "Planejamento",
  financeiro: "Financeiro",
  op_transporte: "Op. Transporte",
  op_distribuição: "Op. Distribuição",
  op_armazenagem: "Op. Armazenagem",
  grisco: "GRISCO",
  ti: "T.I",
  compras: "Compras",
  contábil_fiscal: "Contábil/Fiscal",
  rh: "RH",
  jurídico: "Jurídico",
  cliente_teste: "Cliente em Teste",
  boas_vindas: "Boas Vindas",
  relacionamento: "Relacionamento",
  encerramento: "Encerramento",
};

interface TemplateFormData {
  name: string;
  description: string;
  segment: string;
  industryName: string;
  priceInCents: number;
  isActive: boolean;
  templateData: {
    clienteNome?: string;
    historia?: string;
    localizacao?: string;
    segmentoDetalhado?: string;
    produto?: string;
    números?: string;
    noticias?: string;
    mercado?: string;
    oportunidades?: string;
    pipeline?: string;
    sections?: {
      name: string;
      responsavel?: string;
      parecer?: string;
      ePerfil?: boolean;
      dataInicio?: string;
      dataConclusao?: string;
      observações?: string;
    }[];
  };
}

const initialFormData: TemplateFormData = {
  name: "",
  description: "",
  segment: "",
  industryName: "",
  priceInCents: 9900,
  isActive: true,
  templateData: {
    clienteNome: "",
    historia: "",
    localizacao: "",
    segmentoDetalhado: "",
    produto: "",
    números: "",
    noticias: "",
    mercado: "",
    oportunidades: "",
    pipeline: "",
    sections: CHECKLIST_SECTIONS.map((name) => ({
      name,
      responsavel: "",
      parecer: "",
      ePerfil: false,
      dataInicio: "",
      dataConclusao: "",
      observações: "",
    })),
  },
};

export default function AdminTemplates() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState("info");

  const { data: templates = [], isLoading } = useQuery<ChecklistTemplate[]>({
    queryKey: ["/api/checklist-templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const response = await apiRequest("POST", "/api/checklist-templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-templates"] });
      toast({ title: "Template criado com sucesso" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TemplateFormData> }) => {
      const response = await apiRequest("PATCH", `/api/checklist-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-templates"] });
      toast({ title: "Template atualizado com sucesso" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/checklist-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-templates"] });
      toast({ title: "Template excluido com sucesso" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData(initialFormData);
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      segment: template.segment,
      industryName: template.industryName || "",
      priceInCents: template.priceInCents || 9900,
      isActive: template.isActive ?? true,
      templateData: template.templateData || initialFormData.templateData,
    });
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData(initialFormData);
  };

  const handleSave = () => {
    if (!formData.name || !formData.segment) {
      toast({
        title: "Campos obrigatorios",
        description: "Nome e segmento sao obrigatorios",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      deleteMutation.mutate(id);
    }
  };

  const updateSection = (index: number, field: string, value: any) => {
    const sections = [...(formData.templateData.sections || [])];
    sections[index] = { ...sections[index], [field]: value };
    setFormData({
      ...formData,
      templateData: { ...formData.templateData, sections },
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout title="Admin MCG">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-templates-title">
              Biblioteca de Templates
            </h1>
            <p className="text-muted-foreground">
              Gerencie os templates de checklist disponiveis para venda
            </p>
          </div>
          <Button onClick={handleOpenCreate} data-testid="button-create-template">
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5" />
              Templates Cadastrados
            </CardTitle>
            <CardDescription>
              {templates.length} template(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum template cadastrado ainda
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead>Industria Base</TableHead>
                    <TableHead>Preco</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {SEGMENT_LABELS[template.segment] || template.segment}
                        </Badge>
                      </TableCell>
                      <TableCell>{template.industryName || "-"}</TableCell>
                      <TableCell>{formatCurrency(template.priceInCents || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? "default" : "outline"}>
                          {template.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(template)}
                            data-testid={`button-edit-template-${template.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(template.id)}
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do template de checklist
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="perfil">Perfil Cliente</TabsTrigger>
              <TabsTrigger value="secoes">Secoes (18)</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Template *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Checklist Industria Alimenticia Completo"
                    data-testid="input-template-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento *</Label>
                  <Select
                    value={formData.segment}
                    onValueChange={(value) => setFormData({ ...formData, segment: value })}
                  >
                    <SelectTrigger data-testid="select-template-segment">
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((seg) => (
                        <SelectItem key={seg} value={seg}>
                          {SEGMENT_LABELS[seg]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industryName">Industria Base (referencia)</Label>
                  <Input
                    id="industryName"
                    value={formData.industryName}
                    onChange={(e) => setFormData({ ...formData, industryName: e.target.value })}
                    placeholder="Ex: BRF, Ambev, Natura"
                    data-testid="input-template-industry"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preco (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.priceInCents / 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceInCents: Math.round(parseFloat(e.target.value || "0") * 100),
                      })
                    }
                    placeholder="99.00"
                    data-testid="input-template-price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que este template inclui..."
                  rows={3}
                  data-testid="input-template-description"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-template-active"
                />
                <Label>Template ativo (visivel na biblioteca)</Label>
              </div>
            </TabsContent>

            <TabsContent value="perfil" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente Modelo</Label>
                  <Input
                    value={formData.templateData.clienteNome || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        templateData: { ...formData.templateData, clienteNome: e.target.value },
                      })
                    }
                    placeholder="Nome ficticio ou anonimizado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Segmento Detalhado</Label>
                  <Input
                    value={formData.templateData.segmentoDetalhado || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        templateData: { ...formData.templateData, segmentoDetalhado: e.target.value },
                      })
                    }
                    placeholder="Ex: Industria de processados congelados"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Historia/Contexto</Label>
                <Textarea
                  value={formData.templateData.historia || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      templateData: { ...formData.templateData, historia: e.target.value },
                    })
                  }
                  placeholder="Histórico da empresa, fundacao, evolucao..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Localizacao</Label>
                  <Input
                    value={formData.templateData.localizacao || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        templateData: { ...formData.templateData, localizacao: e.target.value },
                      })
                    }
                    placeholder="Ex: SP, RJ, Nacional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Produto Principal</Label>
                  <Input
                    value={formData.templateData.produto || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        templateData: { ...formData.templateData, produto: e.target.value },
                      })
                    }
                    placeholder="Ex: Alimentos congelados"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Números/Indicadores</Label>
                <Textarea
                  value={formData.templateData.números || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      templateData: { ...formData.templateData, números: e.target.value },
                    })
                  }
                  placeholder="Faturamento, funcionarios, volume..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Mercado</Label>
                <Textarea
                  value={formData.templateData.mercado || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      templateData: { ...formData.templateData, mercado: e.target.value },
                    })
                  }
                  placeholder="Market share, posicionamento, concorrencia..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Oportunidades</Label>
                <Textarea
                  value={formData.templateData.oportunidades || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      templateData: { ...formData.templateData, oportunidades: e.target.value },
                    })
                  }
                  placeholder="BID, Cotacao, Projetos, Spot..."
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="secoes" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Preencha as informações de cada secao do checklist. Estes dados servirao de modelo para os clientes.
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {(formData.templateData.sections || []).map((section, index) => (
                  <Card key={section.name} className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h4 className="font-medium">
                        {index + 1}. {SECTION_LABELS[section.name] || section.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">E Perfil?</Label>
                        <Switch
                          checked={section.ePerfil || false}
                          onCheckedChange={(checked) => updateSection(index, "ePerfil", checked)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Responsavel</Label>
                        <Input
                          value={section.responsavel || ""}
                          onChange={(e) => updateSection(index, "responsavel", e.target.value)}
                          placeholder="Nome do responsavel"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Parecer</Label>
                        <Input
                          value={section.parecer || ""}
                          onChange={(e) => updateSection(index, "parecer", e.target.value)}
                          placeholder="Parecer/conclusao"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label className="text-xs">Observações</Label>
                      <Textarea
                        value={section.observações || ""}
                        onChange={(e) => updateSection(index, "observações", e.target.value)}
                        placeholder="Observações e detalhes..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={handleCloseDialog} disabled={isPending}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending} data-testid="button-save-template">
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
