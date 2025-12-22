import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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
  ClipboardCheck,
  Save,
  Download,
  Building2,
  Truck,
  DollarSign,
  ShieldCheck,
  Users,
  FileText,
  Scale,
  Briefcase,
  Package,
  Settings,
  Computer,
  Calculator,
  Gavel,
  ChevronRight,
  RefreshCw,
  Plus,
  Globe,
  TrendingUp,
  Target,
  MapPin,
  History,
  Newspaper,
  Link,
  Linkedin,
  Mail,
  Phone,
  User,
  Award,
  Warehouse,
  ClipboardList,
  UserCheck,
  Handshake,
  PartyPopper,
  Calendar,
  BarChart3,
  Key,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Checklist, Client } from "@shared/schema";

const sections = [
  { id: "perfil", label: "Perfil do Cliente", icon: Building2, group: "capa" },
  { id: "comercial", label: "Comercial", icon: Briefcase, group: "areas" },
  { id: "direcao", label: "Direção", icon: Target, group: "areas" },
  { id: "qualidade", label: "Qualidade", icon: Award, group: "areas" },
  { id: "planejamento", label: "Planejamento", icon: Calculator, group: "areas" },
  { id: "financeiro", label: "Financeiro", icon: DollarSign, group: "areas" },
  { id: "transporte", label: "Op. Transporte", icon: Truck, group: "operacoes" },
  { id: "distribuicao", label: "Op. Distribuição", icon: Package, group: "operacoes" },
  { id: "armazenagem", label: "Op. Armazenagem", icon: Warehouse, group: "operacoes" },
  { id: "grisco", label: "GRISCO", icon: ShieldCheck, group: "areas" },
  { id: "ti", label: "T.I", icon: Computer, group: "areas" },
  { id: "compras", label: "Compras", icon: Package, group: "areas" },
  { id: "contabil", label: "Contábil/Fiscal", icon: FileText, group: "areas" },
  { id: "rh", label: "RH", icon: Users, group: "areas" },
  { id: "motoristas", label: "Motoristas", icon: Truck, group: "areas" },
  { id: "marketing", label: "Marketing", icon: BarChart3, group: "areas" },
  { id: "juridico", label: "Jurídico", icon: Gavel, group: "areas" },
  { id: "teste", label: "Cliente em Teste", icon: ClipboardList, group: "final" },
  { id: "onboarding", label: "Boas Vindas", icon: PartyPopper, group: "final" },
  { id: "relacionamento", label: "Relacionamento", icon: Handshake, group: "final" },
];

const sectionQuestions: Record<string, { id: string; question: string }[]> = {
  comercial: [
    { id: "com1", question: "Cronograma de cadastro e homologação definido?" },
    { id: "com2", question: "Base de negociação estabelecida?" },
    { id: "com3", question: "CRM/Grupo negociador configurado?" },
    { id: "com4", question: "Funil de vendas atualizado?" },
    { id: "com5", question: "Check List RFI enviado?" },
    { id: "com6", question: "Rotas e volumetrias recebidas?" },
    { id: "com7", question: "Proposta comercial/técnica enviada?" },
  ],
  direcao: [
    { id: "dir1", question: "Análise de perfil realizada?" },
    { id: "dir2", question: "Cliente atende pré-requisitos?" },
    { id: "dir3", question: "Segmento compatível com atuação?" },
    { id: "dir4", question: "Valor agregado da mercadoria adequado?" },
    { id: "dir5", question: "Regularidade e frequência definidas?" },
  ],
  qualidade: [
    { id: "qual1", question: "Certificações necessárias identificadas?" },
    { id: "qual2", question: "Licenças obrigatórias verificadas?" },
    { id: "qual3", question: "Requisitos de qualidade documentados?" },
    { id: "qual4", question: "Procedimentos de auditoria definidos?" },
  ],
  planejamento: [
    { id: "plan1", question: "Análise de rotas/volumetria - Transporte?" },
    { id: "plan2", question: "Análise de rotas/volumetria - Distribuição?" },
    { id: "plan3", question: "Análise de posição pallets/m³ - Armazenagem?" },
    { id: "plan4", question: "Proposta técnica elaborada?" },
    { id: "plan5", question: "Tabela de frete calculada?" },
  ],
  financeiro: [
    { id: "fin1", question: "Prazos de pagamento definidos?" },
    { id: "fin2", question: "Forma de pagamento acordada?" },
    { id: "fin3", question: "Portais de pagamento configurados?" },
    { id: "fin4", question: "Análise de crédito realizada?" },
    { id: "fin5", question: "Dados bancários atualizados?" },
    { id: "fin6", question: "CNPJ pagador de cada operação definido?" },
  ],
  transporte: [
    { id: "trans1", question: "Atendimento operacional estruturado?" },
    { id: "trans2", question: "UF de origem definidas?" },
    { id: "trans3", question: "UF de destino definidas?" },
    { id: "trans4", question: "Emissão de CT-e configurada?" },
    { id: "trans5", question: "MDF-e configurado?" },
    { id: "trans6", question: "Liberação de cargas definida?" },
  ],
  distribuicao: [
    { id: "dist1", question: "Roteiros definidos?" },
    { id: "dist2", question: "Atendimento de distribuição estruturado?" },
    { id: "dist3", question: "Emissão de CT-e configurada?" },
    { id: "dist4", question: "Particularidades do CT-e documentadas?" },
    { id: "dist5", question: "Tabela de frete válida?" },
  ],
  armazenagem: [
    { id: "arm1", question: "Atendimento de armazenagem estruturado?" },
    { id: "arm2", question: "Posições de pallets definidas?" },
    { id: "arm3", question: "Picking & Packing configurado?" },
    { id: "arm4", question: "FEFO/FIFO implementado?" },
    { id: "arm5", question: "Cross Docking estruturado?" },
    { id: "arm6", question: "Mão de obra dimensionada?" },
  ],
  grisco: [
    { id: "gri1", question: "Análise de risco realizada?" },
    { id: "gri2", question: "Seguro contratado?" },
    { id: "gri3", question: "Gerenciadora definida?" },
    { id: "gri4", question: "Apólice de seguro atualizada?" },
    { id: "gri5", question: "Procedimentos de segurança documentados?" },
  ],
  ti: [
    { id: "ti1", question: "Integrações identificadas?" },
    { id: "ti2", question: "EDIs configurados?" },
    { id: "ti3", question: "Automatizações implementadas?" },
    { id: "ti4", question: "Tecnologia com o cliente definida?" },
    { id: "ti5", question: "Sistemas integrados?" },
  ],
  compras: [
    { id: "comp1", question: "Suprimentos identificados?" },
    { id: "comp2", question: "Acessórios necessários listados?" },
    { id: "comp3", question: "Investimentos aprovados?" },
    { id: "comp4", question: "Fornecedores homologados?" },
  ],
  contabil: [
    { id: "cont1", question: "Regime tributário definido?" },
    { id: "cont2", question: "Análise de impostos por estado?" },
    { id: "cont3", question: "CND atualizada?" },
    { id: "cont4", question: "Legislação específica verificada?" },
    { id: "cont5", question: "Obrigações fiscais mapeadas?" },
  ],
  rh: [
    { id: "rh1", question: "Jornada de trabalho definida?" },
    { id: "rh2", question: "Qualificação de pessoas identificada?" },
    { id: "rh3", question: "Ficha de funcionários atualizada?" },
    { id: "rh4", question: "Treinamentos necessários?" },
    { id: "rh5", question: "Escala de trabalho definida?" },
  ],
  motoristas: [
    { id: "mot1", question: "Cadastro de motoristas atualizado?" },
    { id: "mot2", question: "CNH válida e categorizada?" },
    { id: "mot3", question: "Exames médicos em dia?" },
    { id: "mot4", question: "Curso MOPP realizado (se aplicável)?" },
    { id: "mot5", question: "Ficha de conduta atualizada?" },
    { id: "mot6", question: "Treinamento de direção defensiva?" },
    { id: "mot7", question: "Consulta de multas e pontuação?" },
  ],
  marketing: [
    { id: "mkt1", question: "Estratégia de divulgação definida?" },
    { id: "mkt2", question: "Material institucional preparado?" },
    { id: "mkt3", question: "Apresentação comercial atualizada?" },
    { id: "mkt4", question: "Cases de sucesso documentados?" },
    { id: "mkt5", question: "Redes sociais configuradas?" },
    { id: "mkt6", question: "Site/Landing page do cliente?" },
    { id: "mkt7", question: "Comunicação visual alinhada?" },
  ],
  juridico: [
    { id: "jur1", question: "Análise de contrato realizada?" },
    { id: "jur2", question: "Validade do contrato verificada?" },
    { id: "jur3", question: "Cláusulas específicas documentadas?" },
    { id: "jur4", question: "Responsabilidades definidas?" },
  ],
  teste: [
    { id: "test1", question: "Check List da operação em teste?" },
    { id: "test2", question: "Indicadores de teste definidos?" },
    { id: "test3", question: "Análise Teste x Proposta realizada?" },
    { id: "test4", question: "Resultado do teste documentado?" },
  ],
  onboarding: [
    { id: "onb1", question: "Processo de boas vindas executado?" },
    { id: "onb2", question: "Apresentação interna do cliente realizada?" },
    { id: "onb3", question: "Ações de marketing definidas?" },
    { id: "onb4", question: "E-mail marketing enviado?" },
    { id: "onb5", question: "Brindes enviados?" },
  ],
  relacionamento: [
    { id: "rel1", question: "Contatos do cliente atualizados?" },
    { id: "rel2", question: "Diário do cliente configurado?" },
    { id: "rel3", question: "Calendário de validades configurado?" },
    { id: "rel4", question: "Indicadores que o cliente quer receber definidos?" },
    { id: "rel5", question: "Portais e senhas documentados?" },
  ],
};

const oportunidadesOptions = [
  "Cadastro/Homologação",
  "BID",
  "Cotação",
  "Projetos",
  "Spot - Diárias",
];

const brasileiroStates = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA",
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

interface SectionResponsavel {
  responsavelNome: string;
  responsavelEmail: string;
  dataRecebimento: string;
  dataRetorno: string;
  isPerfil: boolean | null;
  parecer: string;
  documentosAtualizados: boolean;
  prestadorNome: string;
  prestadorTelefone: string;
  prestadorEmail: string;
  prestadorAniversario: string;
  prestadorCargo: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  clienteAniversario: string;
  clienteCargo: string;
  aprovadoPrestador: boolean;
  aprovadoPrestadorData: string;
  aprovadoPrestadorPor: string;
  aprovadoCliente: boolean;
  aprovadoClienteData: string;
  aprovadoClientePor: string;
}

interface ContatoCliente {
  nome: string;
  celular: string;
  email: string;
  setor: string;
  aniversario: string;
  funcao: string;
}

interface PortalSenha {
  portal: string;
  link: string;
  login: string;
  observacao: string;
}

export default function Checklist() {
  const [activeSection, setActiveSection] = useState("perfil");
  const [checklistId, setChecklistId] = useState<number | null>(null);
  const { toast } = useToast();

  // Profile fields
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCnpj, setClienteCnpj] = useState("");
  const [focalPointNome, setFocalPointNome] = useState("");
  const [focalPointEmail, setFocalPointEmail] = useState("");
  const [focalPointCelular, setFocalPointCelular] = useState("");
  const [focalPointRegiao, setFocalPointRegiao] = useState("");
  
  const [historia, setHistoria] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [segmentoDetalhado, setSegmentoDetalhado] = useState("");
  const [produto, setProduto] = useState("");
  const [numeros, setNumeros] = useState("");
  const [noticias, setNoticias] = useState("");
  
  const [site, setSite] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [emailComercial, setEmailComercial] = useState("");
  const [contatoComercial, setContatoComercial] = useState("");
  
  const [abrangenciaNacional, setAbrangenciaNacional] = useState(false);
  const [abrangenciaRegional, setAbrangenciaRegional] = useState(false);
  const [abrangenciaInternacional, setAbrangenciaInternacional] = useState(false);
  
  const [marketShare, setMarketShare] = useState("");
  const [posicaoMercado, setPosicaoMercado] = useState("");
  
  const [oportunidades, setOportunidades] = useState<string[]>([]);
  
  const [pipelineSegmento, setPipelineSegmento] = useState("");
  const [pipelineProduto, setPipelineProduto] = useState("");
  const [pipelineVolume, setPipelineVolume] = useState("");
  const [pipelineTarget, setPipelineTarget] = useState("");
  
  const [contatosCliente, setContatosCliente] = useState<ContatoCliente[]>([]);
  const [portaisSenhas, setPortaisSenhas] = useState<PortalSenha[]>([]);
  
  // Section responsáveis
  const [sectionResponsaveis, setSectionResponsaveis] = useState<Record<string, SectionResponsavel>>({});
  
  // Question answers
  const [answers, setAnswers] = useState<Record<string, { checked: boolean; notes: string }>>({});

  // Clients query
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Load client data when selected
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setClienteNome(client.name || "");
        setClienteCnpj(client.cnpj || "");
        setEmailComercial(client.email || "");
        setLocalizacao(`${client.city || ""}, ${client.state || ""}`);
        setSegmentoDetalhado(client.segment || "");
      }
    }
  }, [selectedClientId, clients]);

  const handleCheck = (questionId: string, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], checked, notes: prev[questionId]?.notes || "" },
    }));
  };

  const handleNotes = (questionId: string, notes: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], notes, checked: prev[questionId]?.checked || false },
    }));
  };

  const handleResponsavelChange = (sectionId: string, field: keyof SectionResponsavel, value: any) => {
    setSectionResponsaveis((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value,
      },
    }));
  };

  const calculateSectionProgress = (sectionId: string) => {
    const questions = sectionQuestions[sectionId] || [];
    if (questions.length === 0) return 0;
    const answered = questions.filter((q) => answers[q.id]?.checked).length;
    return Math.round((answered / questions.length) * 100);
  };

  const calculateTotalProgress = () => {
    const allQuestions = Object.values(sectionQuestions).flat();
    if (allQuestions.length === 0) return 0;
    const answered = allQuestions.filter((q) => answers[q.id]?.checked).length;
    return Math.round((answered / allQuestions.length) * 100);
  };

  const addContato = () => {
    setContatosCliente([...contatosCliente, {
      nome: "",
      celular: "",
      email: "",
      setor: "",
      aniversario: "",
      funcao: "",
    }]);
  };

  const updateContato = (index: number, field: keyof ContatoCliente, value: string) => {
    const updated = [...contatosCliente];
    updated[index] = { ...updated[index], [field]: value };
    setContatosCliente(updated);
  };

  const removeContato = (index: number) => {
    setContatosCliente(contatosCliente.filter((_, i) => i !== index));
  };

  const addPortal = () => {
    setPortaisSenhas([...portaisSenhas, {
      portal: "",
      link: "",
      login: "",
      observacao: "",
    }]);
  };

  const updatePortal = (index: number, field: keyof PortalSenha, value: string) => {
    const updated = [...portaisSenhas];
    updated[index] = { ...updated[index], [field]: value };
    setPortaisSenhas(updated);
  };

  const removePortal = (index: number) => {
    setPortaisSenhas(portaisSenhas.filter((_, i) => i !== index));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: clienteNome || `Check List ${new Date().toLocaleDateString("pt-BR")}`,
        clientId: selectedClientId,
        segment: segmentoDetalhado,
        status: calculateTotalProgress() === 100 ? "completed" : "in_progress",
        clienteNome,
        clienteCnpj,
        focalPointNome,
        focalPointEmail,
        focalPointCelular,
        focalPointRegiao,
        historia,
        localizacao,
        segmentoDetalhado,
        produto,
        numeros,
        noticias,
        site,
        linkedIn,
        emailComercial,
        contatoComercial,
        abrangenciaNacional,
        abrangenciaRegional,
        abrangenciaInternacional,
        marketShare,
        posicaoMercado,
        oportunidades,
        pipelineSegmento,
        pipelineProduto,
        pipelineVolume,
        pipelineTarget: pipelineTarget ? parseFloat(pipelineTarget) : null,
        contatosCliente,
        portaisSenhas,
      };
      
      if (checklistId) {
        return apiRequest("PATCH", `/api/checklists/${checklistId}`, payload);
      }
      return apiRequest("POST", "/api/checklists", payload);
    },
    onSuccess: async (response) => {
      if (!checklistId && response) {
        try {
          const data = await response.json();
          if (data?.id) {
            setChecklistId(data.id);
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      toast({ title: "Check List salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar Check List", variant: "destructive" });
    },
  });

  const handleReset = () => {
    setChecklistId(null);
    setClienteNome("");
    setClienteCnpj("");
    setFocalPointNome("");
    setFocalPointEmail("");
    setFocalPointCelular("");
    setFocalPointRegiao("");
    setHistoria("");
    setLocalizacao("");
    setSegmentoDetalhado("");
    setProduto("");
    setNumeros("");
    setNoticias("");
    setSite("");
    setLinkedIn("");
    setEmailComercial("");
    setContatoComercial("");
    setAbrangenciaNacional(false);
    setAbrangenciaRegional(false);
    setAbrangenciaInternacional(false);
    setMarketShare("");
    setPosicaoMercado("");
    setOportunidades([]);
    setPipelineSegmento("");
    setPipelineProduto("");
    setPipelineVolume("");
    setPipelineTarget("");
    setContatosCliente([]);
    setPortaisSenhas([]);
    setSectionResponsaveis({});
    setAnswers({});
    setSelectedClientId(null);
    toast({ title: "Check List reiniciado" });
  };

  const totalProgress = calculateTotalProgress();
  const currentSection = sections.find(s => s.id === activeSection);
  const questions = sectionQuestions[activeSection] || [];

  const renderPerfilSection = () => (
    <div className="space-y-6">
      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dados" data-testid="tab-dados">Dados</TabsTrigger>
          <TabsTrigger value="historia" data-testid="tab-historia">História</TabsTrigger>
          <TabsTrigger value="mercado" data-testid="tab-mercado">Mercado</TabsTrigger>
          <TabsTrigger value="contatos" data-testid="tab-contatos">Contatos</TabsTrigger>
          <TabsTrigger value="portais" data-testid="tab-portais">Portais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecionar Cliente Existente</Label>
                <Select 
                  value={selectedClientId?.toString() || ""} 
                  onValueChange={(v) => setSelectedClientId(v ? parseInt(v) : null)}
                >
                  <SelectTrigger data-testid="select-client">
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Cliente</Label>
                  <Input 
                    value={clienteNome} 
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Razão Social"
                    data-testid="input-cliente-nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input 
                    value={clienteCnpj} 
                    onChange={(e) => setClienteCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    data-testid="input-cliente-cnpj"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Focal Point Comercial
              </CardTitle>
              <CardDescription>Responsável comercial interno</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input 
                  value={focalPointNome} 
                  onChange={(e) => setFocalPointNome(e.target.value)}
                  data-testid="input-focal-nome"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input 
                  type="email"
                  value={focalPointEmail} 
                  onChange={(e) => setFocalPointEmail(e.target.value)}
                  data-testid="input-focal-email"
                />
              </div>
              <div className="space-y-2">
                <Label>Celular</Label>
                <Input 
                  value={focalPointCelular} 
                  onChange={(e) => setFocalPointCelular(e.target.value)}
                  data-testid="input-focal-celular"
                />
              </div>
              <div className="space-y-2">
                <Label>Região</Label>
                <Input 
                  value={focalPointRegiao} 
                  onChange={(e) => setFocalPointRegiao(e.target.value)}
                  data-testid="input-focal-regiao"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historia" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                História e Perfil da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>História da Empresa</Label>
                <Textarea 
                  value={historia} 
                  onChange={(e) => setHistoria(e.target.value)}
                  placeholder="Quando a empresa nasceu, trajetória, marcos importantes..."
                  rows={4}
                  data-testid="input-historia"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Localização/Onde está</Label>
                  <Textarea 
                    value={localizacao} 
                    onChange={(e) => setLocalizacao(e.target.value)}
                    placeholder="Matriz, filiais, centros de distribuição..."
                    rows={3}
                    data-testid="input-localizacao"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Segmento</Label>
                  <Textarea 
                    value={segmentoDetalhado} 
                    onChange={(e) => setSegmentoDetalhado(e.target.value)}
                    placeholder="Segmento de atuação detalhado..."
                    rows={3}
                    data-testid="input-segmento"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Textarea 
                    value={produto} 
                    onChange={(e) => setProduto(e.target.value)}
                    placeholder="Produtos comercializados..."
                    rows={3}
                    data-testid="input-produto"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Números</Label>
                  <Textarea 
                    value={numeros} 
                    onChange={(e) => setNumeros(e.target.value)}
                    placeholder="Faturamento, funcionários, volume..."
                    rows={3}
                    data-testid="input-numeros"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notícias</Label>
                <Textarea 
                  value={noticias} 
                  onChange={(e) => setNoticias(e.target.value)}
                  placeholder="Notícias recentes sobre a empresa..."
                  rows={3}
                  data-testid="input-noticias"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Abrangência
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="nacional" 
                  checked={abrangenciaNacional}
                  onCheckedChange={(c) => setAbrangenciaNacional(c as boolean)}
                  data-testid="check-nacional"
                />
                <Label htmlFor="nacional">Nacional</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="regional" 
                  checked={abrangenciaRegional}
                  onCheckedChange={(c) => setAbrangenciaRegional(c as boolean)}
                  data-testid="check-regional"
                />
                <Label htmlFor="regional">Regional</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="internacional" 
                  checked={abrangenciaInternacional}
                  onCheckedChange={(c) => setAbrangenciaInternacional(c as boolean)}
                  data-testid="check-internacional"
                />
                <Label htmlFor="internacional">Internacional</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mercado" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Market Share
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posição de Mercado</Label>
                  <Textarea 
                    value={posicaoMercado} 
                    onChange={(e) => setPosicaoMercado(e.target.value)}
                    placeholder="Posição no mercado, ranking..."
                    rows={3}
                    data-testid="input-posicao"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Market Share</Label>
                  <Textarea 
                    value={marketShare} 
                    onChange={(e) => setMarketShare(e.target.value)}
                    placeholder="Participação de mercado..."
                    rows={3}
                    data-testid="input-marketshare"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {oportunidadesOptions.map((op) => (
                  <div key={op} className="flex items-center gap-2">
                    <Checkbox 
                      id={`op-${op}`}
                      checked={oportunidades.includes(op)}
                      onCheckedChange={(c) => {
                        if (c) {
                          setOportunidades([...oportunidades, op]);
                        } else {
                          setOportunidades(oportunidades.filter(o => o !== op));
                        }
                      }}
                      data-testid={`check-op-${op}`}
                    />
                    <Label htmlFor={`op-${op}`}>{op}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Pipeline Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Segmento</Label>
                <Input 
                  value={pipelineSegmento} 
                  onChange={(e) => setPipelineSegmento(e.target.value)}
                  data-testid="input-pipeline-segmento"
                />
              </div>
              <div className="space-y-2">
                <Label>Produto Predominante</Label>
                <Input 
                  value={pipelineProduto} 
                  onChange={(e) => setPipelineProduto(e.target.value)}
                  data-testid="input-pipeline-produto"
                />
              </div>
              <div className="space-y-2">
                <Label>Volume Carga/Mês</Label>
                <Input 
                  value={pipelineVolume} 
                  onChange={(e) => setPipelineVolume(e.target.value)}
                  data-testid="input-pipeline-volume"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Médio R$</Label>
                <Input 
                  type="number"
                  value={pipelineTarget} 
                  onChange={(e) => setPipelineTarget(e.target.value)}
                  data-testid="input-pipeline-target"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contatos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link className="h-4 w-4" />
                Links e Contatos Comerciais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Site
                </Label>
                <Input 
                  value={site} 
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="https://..."
                  data-testid="input-site"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </Label>
                <Input 
                  value={linkedIn} 
                  onChange={(e) => setLinkedIn(e.target.value)}
                  placeholder="https://linkedin.com/..."
                  data-testid="input-linkedin"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-3 w-3" /> E-mail Comercial
                </Label>
                <Input 
                  type="email"
                  value={emailComercial} 
                  onChange={(e) => setEmailComercial(e.target.value)}
                  data-testid="input-email-comercial"
                />
              </div>
              <div className="space-y-2">
                <Label>Contato Comercial</Label>
                <Textarea 
                  value={contatoComercial} 
                  onChange={(e) => setContatoComercial(e.target.value)}
                  placeholder="Nome, telefone, cargo..."
                  rows={2}
                  data-testid="input-contato-comercial"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contatos do Cliente por Setor
                </CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={addContato} data-testid="button-add-contato">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {contatosCliente.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum contato adicionado
                </p>
              )}
              {contatosCliente.map((contato, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Contato {index + 1}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removeContato(index)}
                      data-testid={`button-remove-contato-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Input 
                      placeholder="Nome"
                      value={contato.nome}
                      onChange={(e) => updateContato(index, "nome", e.target.value)}
                    />
                    <Input 
                      placeholder="Celular"
                      value={contato.celular}
                      onChange={(e) => updateContato(index, "celular", e.target.value)}
                    />
                    <Input 
                      placeholder="E-mail"
                      value={contato.email}
                      onChange={(e) => updateContato(index, "email", e.target.value)}
                    />
                    <Input 
                      placeholder="Setor"
                      value={contato.setor}
                      onChange={(e) => updateContato(index, "setor", e.target.value)}
                    />
                    <Input 
                      placeholder="Aniversário"
                      value={contato.aniversario}
                      onChange={(e) => updateContato(index, "aniversario", e.target.value)}
                    />
                    <Input 
                      placeholder="Função"
                      value={contato.funcao}
                      onChange={(e) => updateContato(index, "funcao", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portais" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Portais e Senhas
                </CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={addPortal} data-testid="button-add-portal">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {portaisSenhas.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum portal adicionado
                </p>
              )}
              {portaisSenhas.map((portal, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Portal {index + 1}</span>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => removePortal(index)}
                      data-testid={`button-remove-portal-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input 
                      placeholder="Nome do Portal"
                      value={portal.portal}
                      onChange={(e) => updatePortal(index, "portal", e.target.value)}
                    />
                    <Input 
                      placeholder="Link"
                      value={portal.link}
                      onChange={(e) => updatePortal(index, "link", e.target.value)}
                    />
                    <Input 
                      placeholder="Login/Usuário"
                      value={portal.login}
                      onChange={(e) => updatePortal(index, "login", e.target.value)}
                    />
                    <Input 
                      placeholder="Observação"
                      value={portal.observacao}
                      onChange={(e) => updatePortal(index, "observacao", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderQuestionsSection = () => {
    const sectionData = sectionResponsaveis[activeSection] || {};
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Prestador de Servico (Cliente MCG)
              </CardTitle>
              <CardDescription>Contato interno responsavel por esta area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input 
                    value={sectionData.prestadorNome || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "prestadorNome", e.target.value)}
                    placeholder="Nome do responsavel"
                    data-testid="input-prestador-nome"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cargo/Funcao</Label>
                  <Input 
                    value={sectionData.prestadorCargo || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "prestadorCargo", e.target.value)}
                    placeholder="Ex: Gerente Comercial"
                    data-testid="input-prestador-cargo"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Telefone</Label>
                  <Input 
                    value={sectionData.prestadorTelefone || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "prestadorTelefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    data-testid="input-prestador-telefone"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Aniversario</Label>
                  <Input 
                    value={sectionData.prestadorAniversario || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "prestadorAniversario", e.target.value)}
                    placeholder="DD/MM"
                    data-testid="input-prestador-aniversario"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">E-mail</Label>
                <Input 
                  type="email"
                  value={sectionData.prestadorEmail || ""}
                  onChange={(e) => handleResponsavelChange(activeSection, "prestadorEmail", e.target.value)}
                  placeholder="email@empresa.com"
                  data-testid="input-prestador-email"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Cliente (a ser atendido)
              </CardTitle>
              <CardDescription>Contato do cliente correspondente a esta area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Nome</Label>
                  <Input 
                    value={sectionData.clienteNome || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "clienteNome", e.target.value)}
                    placeholder="Nome do contato"
                    data-testid="input-cliente-contato-nome"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cargo/Funcao</Label>
                  <Input 
                    value={sectionData.clienteCargo || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "clienteCargo", e.target.value)}
                    placeholder="Ex: Coord. Compras"
                    data-testid="input-cliente-cargo"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Telefone</Label>
                  <Input 
                    value={sectionData.clienteTelefone || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "clienteTelefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    data-testid="input-cliente-telefone"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Aniversario</Label>
                  <Input 
                    value={sectionData.clienteAniversario || ""}
                    onChange={(e) => handleResponsavelChange(activeSection, "clienteAniversario", e.target.value)}
                    placeholder="DD/MM"
                    data-testid="input-cliente-aniversario"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">E-mail</Label>
                <Input 
                  type="email"
                  value={sectionData.clienteEmail || ""}
                  onChange={(e) => handleResponsavelChange(activeSection, "clienteEmail", e.target.value)}
                  placeholder="email@cliente.com"
                  data-testid="input-cliente-email"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Parecer e Validacao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Data Recebimento</Label>
                <Input 
                  type="date"
                  value={sectionData.dataRecebimento || ""}
                  onChange={(e) => handleResponsavelChange(activeSection, "dataRecebimento", e.target.value)}
                  data-testid="input-data-recebimento"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Retorno</Label>
                <Input 
                  type="date"
                  value={sectionData.dataRetorno || ""}
                  onChange={(e) => handleResponsavelChange(activeSection, "dataRetorno", e.target.value)}
                  data-testid="input-data-retorno"
                />
              </div>
              <div className="space-y-2">
                <Label>E Perfil?</Label>
                <Select 
                  value={sectionData.isPerfil === true ? "sim" : sectionData.isPerfil === false ? "nao" : ""}
                  onValueChange={(v) => handleResponsavelChange(activeSection, "isPerfil", v === "sim" ? true : v === "nao" ? false : null)}
                >
                  <SelectTrigger data-testid="select-is-perfil">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Nao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Documentos Atualizados?</Label>
                <div className="flex items-center gap-2 h-9">
                  <Checkbox 
                    id="docs-atualizados"
                    checked={sectionData.documentosAtualizados || false}
                    onCheckedChange={(c) => handleResponsavelChange(activeSection, "documentosAtualizados", c)}
                    data-testid="check-docs-atualizados"
                  />
                  <Label htmlFor="docs-atualizados">Sim</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Parecer da Area sobre o Cliente</Label>
              <Textarea 
                value={sectionData.parecer || ""}
                onChange={(e) => handleResponsavelChange(activeSection, "parecer", e.target.value)}
                placeholder="Parecer detalhado sobre o cliente..."
                rows={3}
                data-testid="input-parecer"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="aprovado-prestador"
                    checked={sectionData.aprovadoPrestador || false}
                    onCheckedChange={(c) => {
                      handleResponsavelChange(activeSection, "aprovadoPrestador", c);
                      if (c) {
                        handleResponsavelChange(activeSection, "aprovadoPrestadorData", new Date().toISOString());
                      }
                    }}
                    data-testid="check-aprovado-prestador"
                  />
                  <div className="flex-1">
                    <Label htmlFor="aprovado-prestador" className="font-medium cursor-pointer">
                      Check-in Prestador
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Confirmo que li e aprovo as informacoes desta area
                    </p>
                    {sectionData.aprovadoPrestador && sectionData.aprovadoPrestadorData && (
                      <p className="text-xs text-green-600 mt-1">
                        Aprovado em {new Date(sectionData.aprovadoPrestadorData).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="aprovado-cliente"
                    checked={sectionData.aprovadoCliente || false}
                    onCheckedChange={(c) => {
                      handleResponsavelChange(activeSection, "aprovadoCliente", c);
                      if (c) {
                        handleResponsavelChange(activeSection, "aprovadoClienteData", new Date().toISOString());
                      }
                    }}
                    data-testid="check-aprovado-cliente"
                  />
                  <div className="flex-1">
                    <Label htmlFor="aprovado-cliente" className="font-medium cursor-pointer">
                      Check-in Cliente
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Cliente confirma que leu e aprova as informacoes
                    </p>
                    {sectionData.aprovadoCliente && sectionData.aprovadoClienteData && (
                      <p className="text-xs text-green-600 mt-1">
                        Aprovado em {new Date(sectionData.aprovadoClienteData).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {activeSection === "teste" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Painel de Validacao - Aprovacao das Areas
              </CardTitle>
              <CardDescription>
                Visao geral das aprovacoes de cada area. Todas as areas devem estar aprovadas para liberar o teste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const areasParaValidar = sections.filter(s => s.group === "areas" || s.group === "operacoes");
                const totalAreas = areasParaValidar.length;
                const areasAprovadasPrestador = areasParaValidar.filter(s => sectionResponsaveis[s.id]?.aprovadoPrestador).length;
                const areasAprovadasCliente = areasParaValidar.filter(s => sectionResponsaveis[s.id]?.aprovadoCliente).length;
                const todasAprovadas = areasAprovadasPrestador === totalAreas && areasAprovadasCliente === totalAreas;
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <p className="text-2xl font-bold">{areasAprovadasPrestador}/{totalAreas}</p>
                        <p className="text-sm text-muted-foreground">Prestador Aprovou</p>
                      </div>
                      <div className="p-4 rounded-lg border bg-muted/30 text-center">
                        <p className="text-2xl font-bold">{areasAprovadasCliente}/{totalAreas}</p>
                        <p className="text-sm text-muted-foreground">Cliente Aprovou</p>
                      </div>
                    </div>
                    
                    {todasAprovadas ? (
                      <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">Todas as areas aprovadas! Cliente liberado para teste.</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
                        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Aguardando aprovacao de todas as areas para liberar teste.</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {areasParaValidar.map(section => {
                        const sectionData = sectionResponsaveis[section.id] || {};
                        const prestadorOk = sectionData.aprovadoPrestador;
                        const clienteOk = sectionData.aprovadoCliente;
                        const IconComponent = section.icon;
                        
                        return (
                          <div 
                            key={section.id}
                            className={`p-3 rounded-lg border ${
                              prestadorOk && clienteOk 
                                ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" 
                                : "bg-muted/30"
                            }`}
                            data-testid={`validacao-${section.id}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="h-4 w-4" />
                              <span className="text-sm font-medium">{section.label}</span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={prestadorOk ? "default" : "secondary"} className="text-xs">
                                {prestadorOk ? "Prestador OK" : "Prestador Pendente"}
                              </Badge>
                              <Badge variant={clienteOk ? "default" : "secondary"} className="text-xs">
                                {clienteOk ? "Cliente OK" : "Cliente Pendente"}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Checklist - {currentSection?.label}</CardTitle>
            <CardDescription>{questions.length} itens para verificar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="p-4 rounded-lg border bg-card"
                data-testid={`question-${q.id}`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={q.id}
                    checked={answers[q.id]?.checked || false}
                    onCheckedChange={(checked) => handleCheck(q.id, checked as boolean)}
                    className="mt-1"
                    data-testid={`checkbox-${q.id}`}
                  />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={q.id} className="text-sm font-medium cursor-pointer">
                      {index + 1}. {q.question}
                    </Label>
                    <Textarea
                      placeholder="Observacoes..."
                      value={answers[q.id]?.notes || ""}
                      onChange={(e) => handleNotes(q.id, e.target.value)}
                      className="text-sm"
                      rows={2}
                      data-testid={`notes-${q.id}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <AppLayout title="Check List" subtitle="Diagnóstico completo do cliente">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Seções
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Progress value={totalProgress} className="flex-1" />
                <span className="text-xs font-medium">{totalProgress}%</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="p-2 space-y-1">
                  {sections.map((section) => {
                    const sectionProgress = calculateSectionProgress(section.id);
                    const isActive = activeSection === section.id;
                    const isPerfil = section.id === "perfil";
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover-elevate"
                        }`}
                        data-testid={`section-${section.id}`}
                      >
                        <section.icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{section.label}</p>
                          {!isPerfil && (
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={sectionProgress} className="h-1 flex-1" />
                              <span className="text-xs">{sectionProgress}%</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {currentSection && <currentSection.icon className="h-5 w-5" />}
                  {currentSection?.label}
                </CardTitle>
              </div>
              <Badge variant={totalProgress === 100 ? "default" : "secondary"}>
                {totalProgress}% completo
              </Badge>
            </CardHeader>
            <CardContent>
              {activeSection === "perfil" ? renderPerfilSection() : renderQuestionsSection()}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              data-testid="button-reset-checklist"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              data-testid="button-save-checklist"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Check List"}
            </Button>
            <Button variant="outline" data-testid="button-export-checklist">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
