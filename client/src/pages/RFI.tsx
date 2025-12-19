import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Plus,
  Save,
  Trash2,
  FileText,
  Truck,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Package,
  Loader2,
  Eye,
  Edit,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TaxIdField } from "@/components/TaxIdField";
import type { Rfi } from "@shared/schema";

const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const segmentosAtuacao = [
  { id: "alimentosBebidas", label: "Alimentos, Bebidas e Perecíveis" },
  { id: "automobilistica", label: "Automobilística" },
  { id: "construcaoCivil", label: "Construção Civil" },
  { id: "combustiveis", label: "Combustíveis e Lubrificantes" },
  { id: "quimicos", label: "Químicos e Petroquímicos" },
  { id: "vidros", label: "Vidros" },
  { id: "agronegocio", label: "Agronegócio" },
  { id: "eletrodomesticos", label: "Eletrodomésticos e Eletrônicos" },
  { id: "farmaceutica", label: "Farmacêutica e Hospitalar" },
  { id: "metalurgia", label: "Ferro, Aço e Metalurgia" },
  { id: "madeiras", label: "Madeiras" },
  { id: "papelCelulose", label: "Papel e Celulose" },
  { id: "residuos", label: "Resíduos" },
  { id: "liquidosGranel", label: "Outros Líquidos a Granel" },
  { id: "solidosGranel", label: "Outros Sólidos a Granel" },
];

const modaisAtuacao = [
  { id: "aereo", label: "Aéreo" },
  { id: "cabotagem", label: "Cabotagem" },
  { id: "ferroviario", label: "Ferroviário" },
  { id: "fluvial", label: "Fluvial" },
  { id: "rodoviario", label: "Rodoviário" },
  { id: "multimodal", label: "Multimodal" },
];

const tiposAcondicionamento = [
  { id: "seca", label: "Seca" },
  { id: "perigosa", label: "Perigosa" },
  { id: "isotermica", label: "Isotérmica" },
  { id: "refrigerada", label: "Refrigerada" },
  { id: "congelada", label: "Congelada" },
];

const tiposOperacao = [
  { id: "transferencia", label: "Transferência" },
  { id: "distribuicaoUrbana", label: "Distribuição Urbana" },
  { id: "distribuicaoFracionada", label: "Distribuição Fracionada" },
  { id: "crossDocking", label: "Cross Docking / Transit Point" },
  { id: "frotaDedicada", label: "Frota Dedicada" },
  { id: "milkRun", label: "Milk Run" },
  { id: "circuitosEstaticos", label: "Circuitos Estáticos" },
];

const tiposVeiculosFrota = [
  "VUC",
  "3/4",
  "Toco",
  "Truck",
  "Carreta",
  "Bitrem",
  "Rodotrem",
  "Tanque",
  "Sider",
  "Baú",
  "Graneleiro",
];

interface RfiFormData {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  contato: string;
  telefone: string;
  email: string;
  site: string;
  ramoAtividade: string;
  inicioAtividades: string;
  faturamentoAnual: Record<string, string>;
  unidades: Array<{ local: string; endereco: string; telefone: string; contato: string }>;
  fornecedores: Array<{ nome: string; ramoAtuacao: string }>;
  concorrentes: Array<{ nome: string }>;
  principaisClientes: Array<{ nome: string; percentualFaturamento: string; segmento: string }>;
  linhaProdutos: string;
  frequenciaColeta: string;
  procedimentosEmbarque: string;
  coberturaRegional: Record<string, boolean>;
  detalhesRegionais: Array<{ regiao: string; prazo: string; valorMedio: string; volumeMedio: string }>;
  permiteTerceirizacao: boolean;
  tiposVeiculos: Record<string, boolean>;
  perfilVeiculos: Record<string, boolean>;
  disponibilizaXml: boolean;
  prazoPagamento: string;
  segmentosAtuacao: Record<string, boolean>;
  modaisAtuacao: Record<string, boolean>;
  tiposAcondicionamento: Record<string, boolean>;
  tiposOperacao: Record<string, boolean>;
  frota: Array<{ tipoVeiculo: string; quantidade: string; idadeMedia: string }>;
  responsavelPreenchimento: string;
  cargoResponsavel: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  observacoes: string;
  status: string;
}

const emptyFormData: RfiFormData = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  endereco: "",
  bairro: "",
  cep: "",
  cidade: "",
  estado: "",
  contato: "",
  telefone: "",
  email: "",
  site: "",
  ramoAtividade: "",
  inicioAtividades: "",
  faturamentoAnual: {},
  unidades: [],
  fornecedores: [],
  concorrentes: [],
  principaisClientes: [],
  linhaProdutos: "",
  frequenciaColeta: "",
  procedimentosEmbarque: "",
  coberturaRegional: {},
  detalhesRegionais: [
    { regiao: "Sul", prazo: "", valorMedio: "", volumeMedio: "" },
    { regiao: "Sudeste", prazo: "", valorMedio: "", volumeMedio: "" },
    { regiao: "Centro-Oeste", prazo: "", valorMedio: "", volumeMedio: "" },
    { regiao: "Nordeste", prazo: "", valorMedio: "", volumeMedio: "" },
    { regiao: "Norte", prazo: "", valorMedio: "", volumeMedio: "" },
  ],
  permiteTerceirizacao: false,
  tiposVeiculos: {},
  perfilVeiculos: {},
  disponibilizaXml: false,
  prazoPagamento: "",
  segmentosAtuacao: {},
  modaisAtuacao: {},
  tiposAcondicionamento: {},
  tiposOperacao: {},
  frota: [],
  responsavelPreenchimento: "",
  cargoResponsavel: "",
  telefoneResponsavel: "",
  emailResponsavel: "",
  observacoes: "",
  status: "draft",
};

export default function RFI() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRfi, setSelectedRfi] = useState<Rfi | null>(null);
  const [formData, setFormData] = useState<RfiFormData>(emptyFormData);
  const [activeTab, setActiveTab] = useState("dados");

  const { data: rfis = [], isLoading } = useQuery<Rfi[]>({
    queryKey: ["/api/rfis"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<RfiFormData>) => {
      const res = await apiRequest("POST", "/api/rfis", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfis"] });
      toast({ title: "RFI criado com sucesso" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar RFI", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<RfiFormData> }) => {
      const res = await apiRequest("PATCH", `/api/rfis/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfis"] });
      toast({ title: "RFI atualizado com sucesso" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar RFI", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/rfis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rfis"] });
      toast({ title: "RFI excluído com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir RFI", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(emptyFormData);
    setSelectedRfi(null);
    setActiveTab("dados");
  };

  const openNewRfi = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditRfi = (rfi: Rfi) => {
    setSelectedRfi(rfi);
    setFormData({
      razaoSocial: rfi.razaoSocial || "",
      nomeFantasia: rfi.nomeFantasia || "",
      cnpj: rfi.cnpj || "",
      endereco: rfi.endereco || "",
      bairro: rfi.bairro || "",
      cep: rfi.cep || "",
      cidade: rfi.cidade || "",
      estado: rfi.estado || "",
      contato: rfi.contato || "",
      telefone: rfi.telefone || "",
      email: rfi.email || "",
      site: rfi.site || "",
      ramoAtividade: rfi.ramoAtividade || "",
      inicioAtividades: rfi.inicioAtividades || "",
      faturamentoAnual: (rfi.faturamentoAnual as Record<string, string>) || {},
      unidades: (rfi.unidades as Array<{ local: string; endereco: string; telefone: string; contato: string }>) || [],
      fornecedores: (rfi.fornecedores as Array<{ nome: string; ramoAtuacao: string }>) || [],
      concorrentes: (rfi.concorrentes as Array<{ nome: string }>) || [],
      principaisClientes: (rfi.principaisClientes as Array<{ nome: string; percentualFaturamento: string; segmento: string }>) || [],
      linhaProdutos: rfi.linhaProdutos || "",
      frequenciaColeta: rfi.frequenciaColeta || "",
      procedimentosEmbarque: rfi.procedimentosEmbarque || "",
      coberturaRegional: (rfi.coberturaRegional as Record<string, boolean>) || {},
      detalhesRegionais: (rfi.detalhesRegionais as Array<{ regiao: string; prazo: string; valorMedio: string; volumeMedio: string }>) || emptyFormData.detalhesRegionais,
      permiteTerceirizacao: rfi.permiteTerceirizacao || false,
      tiposVeiculos: (rfi.tiposVeiculos as Record<string, boolean>) || {},
      perfilVeiculos: (rfi.perfilVeiculos as Record<string, boolean>) || {},
      disponibilizaXml: rfi.disponibilizaXml || false,
      prazoPagamento: rfi.prazoPagamento || "",
      segmentosAtuacao: (rfi.segmentosAtuacao as Record<string, boolean>) || {},
      modaisAtuacao: (rfi.modaisAtuacao as Record<string, boolean>) || {},
      tiposAcondicionamento: (rfi.tiposAcondicionamento as Record<string, boolean>) || {},
      tiposOperacao: (rfi.tiposOperacao as Record<string, boolean>) || {},
      frota: (rfi.frota as Array<{ tipoVeiculo: string; quantidade: string; idadeMedia: string }>) || [],
      responsavelPreenchimento: rfi.responsavelPreenchimento || "",
      cargoResponsavel: rfi.cargoResponsavel || "",
      telefoneResponsavel: rfi.telefoneResponsavel || "",
      emailResponsavel: rfi.emailResponsavel || "",
      observacoes: rfi.observacoes || "",
      status: rfi.status || "draft",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.razaoSocial) {
      toast({ title: "Razão Social é obrigatória", variant: "destructive" });
      return;
    }

    if (selectedRfi) {
      updateMutation.mutate({ id: selectedRfi.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const addUnidade = () => {
    setFormData(prev => ({
      ...prev,
      unidades: [...prev.unidades, { local: "", endereco: "", telefone: "", contato: "" }],
    }));
  };

  const removeUnidade = (index: number) => {
    setFormData(prev => ({
      ...prev,
      unidades: prev.unidades.filter((_, i) => i !== index),
    }));
  };

  const addFornecedor = () => {
    setFormData(prev => ({
      ...prev,
      fornecedores: [...prev.fornecedores, { nome: "", ramoAtuacao: "" }],
    }));
  };

  const removeFornecedor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fornecedores: prev.fornecedores.filter((_, i) => i !== index),
    }));
  };

  const addConcorrente = () => {
    setFormData(prev => ({
      ...prev,
      concorrentes: [...prev.concorrentes, { nome: "" }],
    }));
  };

  const removeConcorrente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      concorrentes: prev.concorrentes.filter((_, i) => i !== index),
    }));
  };

  const addCliente = () => {
    setFormData(prev => ({
      ...prev,
      principaisClientes: [...prev.principaisClientes, { nome: "", percentualFaturamento: "", segmento: "" }],
    }));
  };

  const removeCliente = (index: number) => {
    setFormData(prev => ({
      ...prev,
      principaisClientes: prev.principaisClientes.filter((_, i) => i !== index),
    }));
  };

  const addFrota = () => {
    setFormData(prev => ({
      ...prev,
      frota: [...prev.frota, { tipoVeiculo: "", quantidade: "", idadeMedia: "" }],
    }));
  };

  const removeFrota = (index: number) => {
    setFormData(prev => ({
      ...prev,
      frota: prev.frota.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default"><CheckCircle2 className="w-3 h-3 mr-1" />Completo</Badge>;
      case "submitted":
        return <Badge variant="secondary"><FileText className="w-3 h-3 mr-1" />Enviado</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Rascunho</Badge>;
    }
  };

  return (
    <AppLayout title="RFI - Request for Information" subtitle="Cadastro técnico para participação em BIDs">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              RFI - Request for Information
            </h1>
            <p className="text-muted-foreground">
              Cadastro técnico da empresa para participação em BIDs e licitações
            </p>
          </div>
          <Button onClick={openNewRfi} data-testid="button-new-rfi">
            <Plus className="w-4 h-4 mr-2" />
            Novo RFI
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : rfis.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum RFI cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie seu primeiro RFI para participar de licitações e BIDs
              </p>
              <Button onClick={openNewRfi}>
                <Plus className="w-4 h-4 mr-2" />
                Criar RFI
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rfis.map((rfi) => (
              <Card key={rfi.id} className="hover-elevate">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{rfi.razaoSocial}</CardTitle>
                      {rfi.nomeFantasia && (
                        <CardDescription className="truncate">{rfi.nomeFantasia}</CardDescription>
                      )}
                    </div>
                    {getStatusBadge(rfi.status || "draft")}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {rfi.cnpj && (
                      <p className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {rfi.cnpj}
                      </p>
                    )}
                    {rfi.cidade && rfi.estado && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {rfi.cidade} - {rfi.estado}
                      </p>
                    )}
                    {rfi.ramoAtividade && (
                      <p className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {rfi.ramoAtividade}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditRfi(rfi)}
                      data-testid={`button-edit-rfi-${rfi.id}`}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(rfi.id)}
                      data-testid={`button-delete-rfi-${rfi.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedRfi ? "Editar RFI" : "Novo RFI"}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="dados" data-testid="tab-dados">Dados</TabsTrigger>
                <TabsTrigger value="estrutura" data-testid="tab-estrutura">Estrutura</TabsTrigger>
                <TabsTrigger value="escopo" data-testid="tab-escopo">Escopo</TabsTrigger>
                <TabsTrigger value="frota" data-testid="tab-frota">Frota</TabsTrigger>
                <TabsTrigger value="responsavel" data-testid="tab-responsavel">Responsável</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 pr-4">
                <TabsContent value="dados" className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Dados Cadastrais
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Razão Social *</Label>
                        <Input
                          value={formData.razaoSocial}
                          onChange={(e) => setFormData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                          placeholder="Razão Social da empresa"
                          data-testid="input-razao-social"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nome Fantasia</Label>
                        <Input
                          value={formData.nomeFantasia}
                          onChange={(e) => setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                          placeholder="Nome Fantasia"
                          data-testid="input-nome-fantasia"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TaxIdField
                        value={formData.cnpj}
                        onChange={(value) => setFormData(prev => ({ ...prev, cnpj: value }))}
                        label="CPF/CNPJ"
                        data-testid="input-rfi-cnpj"
                      />
                      <div className="space-y-2">
                        <Label>Ramo de Atividade</Label>
                        <Input
                          value={formData.ramoAtividade}
                          onChange={(e) => setFormData(prev => ({ ...prev, ramoAtividade: e.target.value }))}
                          placeholder="Ex: Transporte Rodoviário"
                          data-testid="input-ramo-atividade"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início das Atividades</Label>
                        <Input
                          value={formData.inicioAtividades}
                          onChange={(e) => setFormData(prev => ({ ...prev, inicioAtividades: e.target.value }))}
                          placeholder="Ex: 2010"
                          data-testid="input-inicio-atividades"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Site</Label>
                        <Input
                          value={formData.site}
                          onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                          placeholder="www.exemplo.com.br"
                          data-testid="input-site"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereço
                    </h3>
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input
                        value={formData.endereco}
                        onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                        placeholder="Rua, número, complemento"
                        data-testid="input-endereco"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input
                          value={formData.bairro}
                          onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                          placeholder="Bairro"
                          data-testid="input-bairro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input
                          value={formData.cep}
                          onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                          placeholder="00000-000"
                          data-testid="input-cep"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          value={formData.cidade}
                          onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                          placeholder="Cidade"
                          data-testid="input-cidade"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                      >
                        <SelectTrigger data-testid="select-estado">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Contato
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Contato</Label>
                        <Input
                          value={formData.contato}
                          onChange={(e) => setFormData(prev => ({ ...prev, contato: e.target.value }))}
                          placeholder="Nome do contato principal"
                          data-testid="input-contato"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={formData.telefone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          data-testid="input-telefone"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@empresa.com.br"
                        data-testid="input-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Faturamento Anual
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {["2021", "2022", "2023", "2024"].map((year) => (
                        <div key={year} className="space-y-2">
                          <Label>{year}</Label>
                          <Input
                            value={formData.faturamentoAnual[year] || ""}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              faturamentoAnual: { ...prev.faturamentoAnual, [year]: e.target.value }
                            }))}
                            placeholder="R$ 0,00"
                            data-testid={`input-faturamento-${year}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="estrutura" className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Unidades / Filiais
                      </h3>
                      <Button variant="outline" size="sm" onClick={addUnidade} data-testid="button-add-unidade">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {formData.unidades.map((unidade, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Local</Label>
                          <Input
                            value={unidade.local}
                            onChange={(e) => {
                              const newUnidades = [...formData.unidades];
                              newUnidades[index].local = e.target.value;
                              setFormData(prev => ({ ...prev, unidades: newUnidades }));
                            }}
                            placeholder="Nome da unidade"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Endereço</Label>
                          <Input
                            value={unidade.endereco}
                            onChange={(e) => {
                              const newUnidades = [...formData.unidades];
                              newUnidades[index].endereco = e.target.value;
                              setFormData(prev => ({ ...prev, unidades: newUnidades }));
                            }}
                            placeholder="Endereço"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Telefone</Label>
                          <Input
                            value={unidade.telefone}
                            onChange={(e) => {
                              const newUnidades = [...formData.unidades];
                              newUnidades[index].telefone = e.target.value;
                              setFormData(prev => ({ ...prev, unidades: newUnidades }));
                            }}
                            placeholder="Telefone"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={unidade.contato}
                            onChange={(e) => {
                              const newUnidades = [...formData.unidades];
                              newUnidades[index].contato = e.target.value;
                              setFormData(prev => ({ ...prev, unidades: newUnidades }));
                            }}
                            placeholder="Contato"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeUnidade(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Principais Fornecedores
                      </h3>
                      <Button variant="outline" size="sm" onClick={addFornecedor} data-testid="button-add-fornecedor">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {formData.fornecedores.map((fornecedor, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Nome</Label>
                          <Input
                            value={fornecedor.nome}
                            onChange={(e) => {
                              const newFornecedores = [...formData.fornecedores];
                              newFornecedores[index].nome = e.target.value;
                              setFormData(prev => ({ ...prev, fornecedores: newFornecedores }));
                            }}
                            placeholder="Nome do fornecedor"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ramo de Atuação</Label>
                          <Input
                            value={fornecedor.ramoAtuacao}
                            onChange={(e) => {
                              const newFornecedores = [...formData.fornecedores];
                              newFornecedores[index].ramoAtuacao = e.target.value;
                              setFormData(prev => ({ ...prev, fornecedores: newFornecedores }));
                            }}
                            placeholder="Ramo de atuação"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFornecedor(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold">Principais Concorrentes</h3>
                      <Button variant="outline" size="sm" onClick={addConcorrente} data-testid="button-add-concorrente">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {formData.concorrentes.map((concorrente, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Nome</Label>
                          <Input
                            value={concorrente.nome}
                            onChange={(e) => {
                              const newConcorrentes = [...formData.concorrentes];
                              newConcorrentes[index].nome = e.target.value;
                              setFormData(prev => ({ ...prev, concorrentes: newConcorrentes }));
                            }}
                            placeholder="Nome do concorrente"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeConcorrente(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Principais Clientes
                      </h3>
                      <Button variant="outline" size="sm" onClick={addCliente} data-testid="button-add-cliente">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {formData.principaisClientes.map((cliente, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Nome</Label>
                          <Input
                            value={cliente.nome}
                            onChange={(e) => {
                              const newClientes = [...formData.principaisClientes];
                              newClientes[index].nome = e.target.value;
                              setFormData(prev => ({ ...prev, principaisClientes: newClientes }));
                            }}
                            placeholder="Nome do cliente"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">% Faturamento</Label>
                          <Input
                            value={cliente.percentualFaturamento}
                            onChange={(e) => {
                              const newClientes = [...formData.principaisClientes];
                              newClientes[index].percentualFaturamento = e.target.value;
                              setFormData(prev => ({ ...prev, principaisClientes: newClientes }));
                            }}
                            placeholder="Ex: 15%"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Segmento</Label>
                          <Input
                            value={cliente.segmento}
                            onChange={(e) => {
                              const newClientes = [...formData.principaisClientes];
                              newClientes[index].segmento = e.target.value;
                              setFormData(prev => ({ ...prev, principaisClientes: newClientes }));
                            }}
                            placeholder="Segmento"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeCliente(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Descrição dos Serviços</h3>
                    <div className="space-y-2">
                      <Label>Linha de Produtos/Serviços</Label>
                      <Textarea
                        value={formData.linhaProdutos}
                        onChange={(e) => setFormData(prev => ({ ...prev, linhaProdutos: e.target.value }))}
                        placeholder="Descreva a linha de produtos/serviços oferecidos"
                        rows={3}
                        data-testid="textarea-linha-produtos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequência de Coleta</Label>
                      <Textarea
                        value={formData.frequenciaColeta}
                        onChange={(e) => setFormData(prev => ({ ...prev, frequenciaColeta: e.target.value }))}
                        placeholder="Descreva a frequência de disponibilidade de coleta"
                        rows={3}
                        data-testid="textarea-frequencia-coleta"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Procedimentos de Embarque/Entrega</Label>
                      <Textarea
                        value={formData.procedimentosEmbarque}
                        onChange={(e) => setFormData(prev => ({ ...prev, procedimentosEmbarque: e.target.value }))}
                        placeholder="Descreva os procedimentos de embarque e entrega"
                        rows={3}
                        data-testid="textarea-procedimentos-embarque"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="escopo" className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Cobertura Regional
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {brazilianStates.map((state) => (
                        <div key={state.value} className="flex items-center gap-2">
                          <Checkbox
                            id={`state-${state.value}`}
                            checked={formData.coberturaRegional[state.value] || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              coberturaRegional: { ...prev.coberturaRegional, [state.value]: !!checked }
                            }))}
                          />
                          <Label htmlFor={`state-${state.value}`} className="text-sm cursor-pointer">
                            {state.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Detalhes por Região</h3>
                    <div className="space-y-3">
                      {formData.detalhesRegionais.map((detalhe, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center">
                          <span className="font-medium">{detalhe.regiao}</span>
                          <Input
                            value={detalhe.prazo}
                            onChange={(e) => {
                              const newDetalhes = [...formData.detalhesRegionais];
                              newDetalhes[index].prazo = e.target.value;
                              setFormData(prev => ({ ...prev, detalhesRegionais: newDetalhes }));
                            }}
                            placeholder="Prazo (dias)"
                          />
                          <Input
                            value={detalhe.valorMedio}
                            onChange={(e) => {
                              const newDetalhes = [...formData.detalhesRegionais];
                              newDetalhes[index].valorMedio = e.target.value;
                              setFormData(prev => ({ ...prev, detalhesRegionais: newDetalhes }));
                            }}
                            placeholder="Valor Médio"
                          />
                          <Input
                            value={detalhe.volumeMedio}
                            onChange={(e) => {
                              const newDetalhes = [...formData.detalhesRegionais];
                              newDetalhes[index].volumeMedio = e.target.value;
                              setFormData(prev => ({ ...prev, detalhesRegionais: newDetalhes }));
                            }}
                            placeholder="Volume Médio"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Segmentos de Atuação</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {segmentosAtuacao.map((segmento) => (
                        <div key={segmento.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`segmento-${segmento.id}`}
                            checked={formData.segmentosAtuacao[segmento.id] || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              segmentosAtuacao: { ...prev.segmentosAtuacao, [segmento.id]: !!checked }
                            }))}
                          />
                          <Label htmlFor={`segmento-${segmento.id}`} className="text-sm cursor-pointer">
                            {segmento.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Modal de Atuação</h3>
                      <div className="space-y-2">
                        {modaisAtuacao.map((modal) => (
                          <div key={modal.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`modal-${modal.id}`}
                              checked={formData.modaisAtuacao[modal.id] || false}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                modaisAtuacao: { ...prev.modaisAtuacao, [modal.id]: !!checked }
                              }))}
                            />
                            <Label htmlFor={`modal-${modal.id}`} className="text-sm cursor-pointer">
                              {modal.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Tipo de Acondicionamento</h3>
                      <div className="space-y-2">
                        {tiposAcondicionamento.map((tipo) => (
                          <div key={tipo.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`acond-${tipo.id}`}
                              checked={formData.tiposAcondicionamento[tipo.id] || false}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                tiposAcondicionamento: { ...prev.tiposAcondicionamento, [tipo.id]: !!checked }
                              }))}
                            />
                            <Label htmlFor={`acond-${tipo.id}`} className="text-sm cursor-pointer">
                              {tipo.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Tipo de Operação</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {tiposOperacao.map((tipo) => (
                        <div key={tipo.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`operacao-${tipo.id}`}
                            checked={formData.tiposOperacao[tipo.id] || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              tiposOperacao: { ...prev.tiposOperacao, [tipo.id]: !!checked }
                            }))}
                          />
                          <Label htmlFor={`operacao-${tipo.id}`} className="text-sm cursor-pointer">
                            {tipo.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="frota" className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Requisitos Operacionais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="permite-terceirizacao"
                          checked={formData.permiteTerceirizacao}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, permiteTerceirizacao: !!checked }))}
                        />
                        <Label htmlFor="permite-terceirizacao" className="cursor-pointer">
                          Permite Terceirização de Mão de Obra e/ou Veículo
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="disponibiliza-xml"
                          checked={formData.disponibilizaXml}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, disponibilizaXml: !!checked }))}
                        />
                        <Label htmlFor="disponibiliza-xml" className="cursor-pointer">
                          Disponibiliza XML da NF
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Prazo de Pagamento do Frete</Label>
                      <Select
                        value={formData.prazoPagamento}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, prazoPagamento: value }))}
                      >
                        <SelectTrigger data-testid="select-prazo-pagamento">
                          <SelectValue placeholder="Selecione o prazo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 dias</SelectItem>
                          <SelectItem value="45">45 dias</SelectItem>
                          <SelectItem value="60">60 dias</SelectItem>
                          <SelectItem value="90">90 dias</SelectItem>
                          <SelectItem value="120">120 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Tipos de Veículos</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="veiculo-climatizado"
                            checked={formData.tiposVeiculos.climatizado || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              tiposVeiculos: { ...prev.tiposVeiculos, climatizado: !!checked }
                            }))}
                          />
                          <Label htmlFor="veiculo-climatizado" className="cursor-pointer">Climatizado</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="veiculo-seco"
                            checked={formData.tiposVeiculos.seco || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              tiposVeiculos: { ...prev.tiposVeiculos, seco: !!checked }
                            }))}
                          />
                          <Label htmlFor="veiculo-seco" className="cursor-pointer">Seco</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Perfil de Veículos</h3>
                      <div className="space-y-2">
                        {["3/4", "Toco", "Truck", "Carreta"].map((perfil) => (
                          <div key={perfil} className="flex items-center gap-2">
                            <Checkbox
                              id={`perfil-${perfil}`}
                              checked={formData.perfilVeiculos[perfil] || false}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                perfilVeiculos: { ...prev.perfilVeiculos, [perfil]: !!checked }
                              }))}
                            />
                            <Label htmlFor={`perfil-${perfil}`} className="cursor-pointer">{perfil}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Frota Própria
                      </h3>
                      <Button variant="outline" size="sm" onClick={addFrota} data-testid="button-add-frota">
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                    {formData.frota.map((veiculo, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo de Veículo</Label>
                          <Select
                            value={veiculo.tipoVeiculo}
                            onValueChange={(value) => {
                              const newFrota = [...formData.frota];
                              newFrota[index].tipoVeiculo = value;
                              setFormData(prev => ({ ...prev, frota: newFrota }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {tiposVeiculosFrota.map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            value={veiculo.quantidade}
                            onChange={(e) => {
                              const newFrota = [...formData.frota];
                              newFrota[index].quantidade = e.target.value;
                              setFormData(prev => ({ ...prev, frota: newFrota }));
                            }}
                            placeholder="Qtd"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Idade Média (anos)</Label>
                          <Input
                            value={veiculo.idadeMedia}
                            onChange={(e) => {
                              const newFrota = [...formData.frota];
                              newFrota[index].idadeMedia = e.target.value;
                              setFormData(prev => ({ ...prev, frota: newFrota }));
                            }}
                            placeholder="Anos"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFrota(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="responsavel" className="mt-4 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Responsável pelo Preenchimento
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={formData.responsavelPreenchimento}
                          onChange={(e) => setFormData(prev => ({ ...prev, responsavelPreenchimento: e.target.value }))}
                          placeholder="Nome do responsável"
                          data-testid="input-responsavel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Input
                          value={formData.cargoResponsavel}
                          onChange={(e) => setFormData(prev => ({ ...prev, cargoResponsavel: e.target.value }))}
                          placeholder="Cargo"
                          data-testid="input-cargo-responsavel"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={formData.telefoneResponsavel}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefoneResponsavel: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          data-testid="input-telefone-responsavel"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input
                          value={formData.emailResponsavel}
                          onChange={(e) => setFormData(prev => ({ ...prev, emailResponsavel: e.target.value }))}
                          placeholder="email@empresa.com.br"
                          data-testid="input-email-responsavel"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Status e Observações</h3>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="completed">Completo</SelectItem>
                          <SelectItem value="submitted">Enviado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Observações adicionais"
                        rows={4}
                        data-testid="textarea-observacoes"
                      />
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-rfi"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
