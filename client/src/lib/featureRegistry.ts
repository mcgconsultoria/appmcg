import {
  Megaphone,
  TrendingUp,
  Calculator,
  Warehouse,
  LayoutDashboard,
  Users,
  Kanban,
  Calendar,
  Route,
  FileEdit,
  ClipboardCheck,
  ClipboardList,
  ListTodo,
  FolderKanban,
  BarChart3,
  Settings2,
  MessageSquareHeart,
  Handshake,
  FileText,
  Library,
  GitBranch,
  UsersRound,
  Tag,
  CalendarDays,
  FileSignature,
  UserCheck,
  Building2,
  Briefcase,
  Search,
  Palette,
  Rocket,
  Landmark,
  PieChart,
  FileBadge,
  BookOpen,
  Store,
  CreditCard,
  Shield,
  MessageSquare,
  Database,
  Wallet,
  UserRound,
  Activity,
  DollarSign,
  HeadphonesIcon,
} from "lucide-react";

export interface FeatureItem {
  id: string;
  title: string;
  url: string;
  icon: typeof Megaphone;
  subCategory: "mkt" | "com" | "cac" | "adminpj" | "adminpf" | "administrativo";
  comGroup?: "planejamento" | "relacionamento" | "precificacao" | "gestao";
  manual: {
    title: string;
    description: string;
    type: "pdf" | "video" | "article";
    downloadUrl?: string;
    externalUrl?: string;
  };
}

export const featureRegistry: FeatureItem[] = [
  // ─── MKT - Pré-Vendas ────────────────────────────────────────────────────
  {
    id: "mkt-marketing",
    title: "Marketing",
    url: "/marketing",
    icon: Megaphone,
    subCategory: "mkt",
    manual: {
      title: "Marketing e Campanhas",
      description: "Como criar campanhas de marketing efetivas",
      type: "pdf",
    },
  },
  {
    id: "mkt-indicadores",
    title: "Indicadores",
    url: "/indicadores-pre-vendas",
    icon: TrendingUp,
    subCategory: "mkt",
    manual: {
      title: "Indicadores de Pré-Vendas",
      description: "KPIs de marketing e prospecção",
      type: "pdf",
    },
  },

  // ─── COM - Vendas — PLANEJAMENTO ──────────────────────────────────────────
  {
    id: "com-checklist",
    title: "Checklist",
    url: "/checklist",
    icon: ClipboardCheck,
    subCategory: "com",
    comGroup: "planejamento",
    manual: {
      title: "Checklist Comercial",
      description: "Diagnóstico operacional do cliente",
      type: "pdf",
    },
  },
  {
    id: "com-rfi",
    title: "Meu RFI",
    url: "/rfi",
    icon: ClipboardList,
    subCategory: "com",
    comGroup: "planejamento",
    manual: {
      title: "RFI - Request for Information",
      description: "Ficha técnica para licitações",
      type: "pdf",
    },
  },
  {
    id: "com-ata",
    title: "Ata Plano de Ação",
    url: "/atas",
    icon: FileEdit,
    subCategory: "com",
    comGroup: "planejamento",
    manual: {
      title: "Ata Plano de Ação",
      description: "Registro de reuniões e planos de ação",
      type: "pdf",
    },
  },
  {
    id: "com-metas",
    title: "Metas",
    url: "/metas",
    icon: Settings2,
    subCategory: "com",
    comGroup: "gestao",
    manual: {
      title: "Gestão de Metas",
      description: "Definição e acompanhamento de metas",
      type: "pdf",
    },
  },
  {
    id: "com-fluxograma",
    title: "Fluxograma Comercial",
    url: "/fluxograma",
    icon: GitBranch,
    subCategory: "com",
    comGroup: "planejamento",
    manual: {
      title: "Fluxograma Comercial",
      description: "Fluxo visual do processo comercial",
      type: "pdf",
    },
  },

  // ─── COM - Vendas — RELACIONAMENTO ────────────────────────────────────────
  {
    id: "com-clientes",
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    subCategory: "com",
    comGroup: "relacionamento",
    manual: {
      title: "Gestão de Clientes",
      description: "Como gerenciar sua carteira de clientes",
      type: "pdf",
    },
  },
  {
    id: "com-bilaterais",
    title: "Bilaterais",
    url: "/bilaterais",
    icon: UsersRound,
    subCategory: "com",
    comGroup: "relacionamento",
    manual: {
      title: "Bilaterais",
      description: "Diretório de contatos comerciais e parceiros",
      type: "pdf",
    },
  },
  {
    id: "com-segmentos",
    title: "Segmentos",
    url: "/segmentos",
    icon: Tag,
    subCategory: "com",
    comGroup: "relacionamento",
    manual: {
      title: "Segmentos de Mercado",
      description: "Gestão dos segmentos de atuação",
      type: "pdf",
    },
  },
  {
    id: "com-eventos",
    title: "Eventos",
    url: "/eventos-comerciais",
    icon: CalendarDays,
    subCategory: "com",
    comGroup: "relacionamento",
    manual: {
      title: "Eventos Comerciais",
      description: "Feiras, visitas e reuniões do setor",
      type: "pdf",
    },
  },
  {
    id: "com-calendario",
    title: "Calendário",
    url: "/calendario-eventos",
    icon: Calendar,
    subCategory: "com",
    comGroup: "relacionamento",
    manual: {
      title: "Calendário Comercial",
      description: "Agendamento de reuniões e visitas",
      type: "pdf",
    },
  },

  // ─── COM - Vendas — PRECIFICAÇÃO E PROPOSTAS ──────────────────────────────
  {
    id: "com-calcule-frete",
    title: "Calcule Frete",
    url: "/calculadora-frete",
    icon: Calculator,
    subCategory: "com",
    comGroup: "precificacao",
    manual: {
      title: "Calculadora de Frete",
      description: "Como calcular fretes com ICMS e taxas",
      type: "pdf",
    },
  },
  {
    id: "com-calcule-armazenagem",
    title: "Calcule Armazenagem",
    url: "/calculadora-armazenagem",
    icon: Warehouse,
    subCategory: "com",
    comGroup: "precificacao",
    manual: {
      title: "Calculadora de Armazenagem",
      description: "Como precificar serviços de armazenagem",
      type: "pdf",
    },
  },
  {
    id: "com-rotas",
    title: "Rotas",
    url: "/rotas",
    icon: Route,
    subCategory: "com",
    comGroup: "precificacao",
    manual: {
      title: "Rotas Salvas",
      description: "Gerenciamento de rotas de entrega",
      type: "pdf",
    },
  },
  {
    id: "com-proposta",
    title: "Proposta",
    url: "/proposta",
    icon: FileSignature,
    subCategory: "com",
    comGroup: "precificacao",
    manual: {
      title: "Propostas Comerciais",
      description: "Criação e gestão de propostas para clientes",
      type: "pdf",
    },
  },
  {
    id: "com-contrato",
    title: "Contrato",
    url: "/contratos",
    icon: FileText,
    subCategory: "com",
    comGroup: "precificacao",
    manual: {
      title: "Contratos",
      description: "Visualize e acompanhe seus contratos com a MCG",
      type: "pdf",
    },
  },

  // ─── COM - Vendas — GESTÃO E CONTROLE ────────────────────────────────────
  {
    id: "com-pipeline",
    title: "Pipeline",
    url: "/pipeline",
    icon: Kanban,
    subCategory: "com",
    comGroup: "gestao",
    manual: {
      title: "Pipeline de Vendas",
      description: "Acompanhamento do funil comercial",
      type: "pdf",
    },
  },
  {
    id: "com-dashboard",
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    subCategory: "com",
    comGroup: "gestao",
    manual: {
      title: "Dashboard Comercial",
      description: "Visão geral dos indicadores de vendas",
      type: "pdf",
    },
  },
  {
    id: "com-indicadores",
    title: "Indicadores",
    url: "/indicadores-vendas",
    icon: BarChart3,
    subCategory: "com",
    comGroup: "gestao",
    manual: {
      title: "Indicadores de Vendas",
      description: "KPIs de performance comercial",
      type: "pdf",
    },
  },
  {
    id: "com-relatorios",
    title: "Relatórios",
    url: "/relatórios",
    icon: FileText,
    subCategory: "com",
    comGroup: "gestao",
    manual: {
      title: "Relatórios",
      description: "Exportação e análise de dados",
      type: "pdf",
    },
  },
  {
    id: "com-biblioteca",
    title: "Biblioteca",
    url: "/biblioteca",
    icon: Library,
    subCategory: "com",
    comGroup: "gestao",
    manual: {
      title: "Biblioteca de Checklists",
      description: "Templates prontos de checklists por segmento",
      type: "pdf",
    },
  },

  // ─── CAC - Pós-Vendas ─────────────────────────────────────────────────────
  {
    id: "cac-pesquisas",
    title: "Pesquisas",
    url: "/pesquisas",
    icon: MessageSquareHeart,
    subCategory: "cac",
    manual: {
      title: "Pesquisas de Satisfação",
      description: "Como criar e analisar pesquisas NPS",
      type: "pdf",
    },
  },
  {
    id: "cac-indicadores",
    title: "Indicadores",
    url: "/indicadores-pos-vendas",
    icon: TrendingUp,
    subCategory: "cac",
    manual: {
      title: "Indicadores de Pós-Vendas",
      description: "KPIs de satisfação e retenção",
      type: "pdf",
    },
  },

  // ─── ADMIN PJ — Comercial ─────────────────────────────────────────────────
  {
    id: "adminpj-aprovacoes",
    title: "Aguardando Aprovação",
    url: "/admin/aguardando-aprovacao",
    icon: UserCheck,
    subCategory: "adminpj",
    manual: {
      title: "Aprovação de Usuários",
      description: "Como revisar e aprovar novos cadastros na plataforma",
      type: "pdf",
    },
  },
  {
    id: "adminpj-usuarios",
    title: "Usuários",
    url: "/admin/usuarios",
    icon: Users,
    subCategory: "adminpj",
    manual: {
      title: "Gestão de Usuários",
      description: "Gerenciamento de usuários, planos e acessos",
      type: "pdf",
    },
  },
  {
    id: "adminpj-clientes",
    title: "Clientes MCG",
    url: "/admin/clientes",
    icon: Building2,
    subCategory: "adminpj",
    manual: {
      title: "Clientes MCG",
      description: "Base de clientes ativos e gestão de contas",
      type: "pdf",
    },
  },
  {
    id: "adminpj-pipeline",
    title: "Pipeline",
    url: "/admin/comercial",
    icon: Briefcase,
    subCategory: "adminpj",
    manual: {
      title: "Pipeline Comercial (Admin)",
      description: "Funil de leads, propostas e contratos da MCG",
      type: "pdf",
    },
  },
  {
    id: "adminpj-projetos",
    title: "Projetos",
    url: "/admin/projetos",
    icon: FolderKanban,
    subCategory: "adminpj",
    manual: {
      title: "Projetos Internos",
      description: "Acompanhamento de projetos e entregas internas da MCG",
      type: "pdf",
    },
  },
  {
    id: "adminpj-parcerias",
    title: "Parcerias",
    url: "/admin/parcerias",
    icon: Handshake,
    subCategory: "adminpj",
    manual: {
      title: "Gestão de Parcerias",
      description: "Registro e acompanhamento de parcerias estratégicas",
      type: "pdf",
    },
  },
  {
    id: "adminpj-contratos",
    title: "Contratos",
    url: "/admin/contratos",
    icon: FileSignature,
    subCategory: "adminpj",
    manual: {
      title: "Contratos Digitais (Admin)",
      description: "Criação e gestão de contratos com clientes",
      type: "pdf",
    },
  },
  {
    id: "adminpj-dashboard",
    title: "Dashboard (Leads)",
    url: "/admin/leads-diagnóstico",
    icon: Search,
    subCategory: "adminpj",
    manual: {
      title: "Dashboard de Leads",
      description: "Diagnóstico e análise de leads captados pela plataforma",
      type: "pdf",
    },
  },
  {
    id: "adminpj-templates",
    title: "Templates",
    url: "/admin/templates",
    icon: Library,
    subCategory: "adminpj",
    manual: {
      title: "Biblioteca de Templates",
      description: "Gestão dos templates de documentos e checklists",
      type: "pdf",
    },
  },

  // ─── ADMIN PJ — Marketing ─────────────────────────────────────────────────
  {
    id: "adminpj-conteudo",
    title: "Conteúdo",
    url: "/admin/conteudo",
    icon: FileText,
    subCategory: "adminpj",
    manual: {
      title: "Gestão de Conteúdo",
      description: "Produção e publicação de conteúdo para clientes",
      type: "pdf",
    },
  },
  {
    id: "adminpj-kit-marca",
    title: "Kit Marca",
    url: "/admin/kit-marca",
    icon: Palette,
    subCategory: "adminpj",
    manual: {
      title: "Kit da Marca MCG",
      description: "Identidade visual, cores, fontes e ativos da marca",
      type: "pdf",
    },
  },
  {
    id: "adminpj-campanha",
    title: "Campanha Piloto",
    url: "/admin/campanha-piloto",
    icon: Rocket,
    subCategory: "adminpj",
    manual: {
      title: "Campanha Piloto",
      description: "Configuração e acompanhamento da campanha piloto de clientes",
      type: "pdf",
    },
  },

  // ─── ADMIN PJ — Financeiro ────────────────────────────────────────────────
  {
    id: "adminpj-financeiro",
    title: "Financeiro",
    url: "/admin/financeiro",
    icon: DollarSign,
    subCategory: "adminpj",
    manual: {
      title: "Financeiro PJ",
      description: "Visão geral das receitas, despesas e fluxo de caixa da MCG",
      type: "pdf",
    },
  },
  {
    id: "adminpj-dre",
    title: "Plano de Contas DRE",
    url: "/admin/dre",
    icon: PieChart,
    subCategory: "adminpj",
    manual: {
      title: "Plano de Contas (DRE)",
      description: "Estrutura do Demonstrativo de Resultado do Exercício",
      type: "pdf",
    },
  },
  {
    id: "adminpj-centros",
    title: "Centros de Custo",
    url: "/admin/centros-custo",
    icon: Building2,
    subCategory: "adminpj",
    manual: {
      title: "Centros de Custo PJ",
      description: "Definição e gestão dos centros de custo da empresa",
      type: "pdf",
    },
  },
  {
    id: "adminpj-bancos",
    title: "Bancos",
    url: "/admin/bancos",
    icon: Landmark,
    subCategory: "adminpj",
    manual: {
      title: "Contas Bancárias PJ",
      description: "Gestão das contas bancárias da MCG Consultoria",
      type: "pdf",
    },
  },
  {
    id: "adminpj-certificados",
    title: "Certificados",
    url: "/admin/certificados",
    icon: FileBadge,
    subCategory: "adminpj",
    manual: {
      title: "Certificados Digitais",
      description: "Armazenamento e controle de certificados digitais",
      type: "pdf",
    },
  },
  {
    id: "adminpj-lancamentos",
    title: "Lançamentos",
    url: "/admin/lançamentos",
    icon: BookOpen,
    subCategory: "adminpj",
    manual: {
      title: "Lançamentos Financeiros",
      description: "Registro de receitas e despesas da empresa",
      type: "pdf",
    },
  },
  {
    id: "adminpj-relatorio-dre",
    title: "Relatório DRE",
    url: "/admin/relatorio-dre",
    icon: BarChart3,
    subCategory: "adminpj",
    manual: {
      title: "Relatório DRE",
      description: "Demonstrativo de resultado com análise por período",
      type: "pdf",
    },
  },
  {
    id: "adminpj-irpj",
    title: "IRPJ",
    url: "/admin/irpj",
    icon: FileText,
    subCategory: "adminpj",
    manual: {
      title: "IRPJ",
      description: "Imposto de Renda Pessoa Jurídica e obrigações fiscais",
      type: "pdf",
    },
  },

  // ─── ADMIN PJ — Loja ──────────────────────────────────────────────────────
  {
    id: "adminpj-loja",
    title: "Produtos Loja",
    url: "/admin/loja",
    icon: Store,
    subCategory: "adminpj",
    manual: {
      title: "Gestão da Loja MCG",
      description: "Cadastro e gerenciamento de produtos da Loja MCG",
      type: "pdf",
    },
  },

  // ─── ADMIN PJ — Sistema ───────────────────────────────────────────────────
  {
    id: "adminpj-planos",
    title: "Planos e Valores",
    url: "/admin/planos",
    icon: CreditCard,
    subCategory: "adminpj",
    manual: {
      title: "Planos e Valores",
      description: "Configuração dos planos de assinatura e preços",
      type: "pdf",
    },
  },
  {
    id: "adminpj-permissoes",
    title: "Cargos e Permissões",
    url: "/admin/permissoes",
    icon: Shield,
    subCategory: "adminpj",
    manual: {
      title: "Cargos e Permissões",
      description: "Definição de papéis e controle de acesso por módulo",
      type: "pdf",
    },
  },
  {
    id: "adminpj-whatsapp",
    title: "WhatsApp",
    url: "/admin/whatsapp",
    icon: MessageSquare,
    subCategory: "adminpj",
    manual: {
      title: "Integração WhatsApp",
      description: "Configuração do WhatsApp Business para atendimento automatizado",
      type: "pdf",
    },
  },
  {
    id: "adminpj-suporte",
    title: "Suporte Admin",
    url: "/admin/suporte",
    icon: HeadphonesIcon,
    subCategory: "adminpj",
    manual: {
      title: "Painel de Suporte",
      description: "Gestão de chamados e atendimento ao cliente",
      type: "pdf",
    },
  },
  {
    id: "adminpj-backup",
    title: "Backup GitHub",
    url: "/admin/backup",
    icon: Database,
    subCategory: "adminpj",
    manual: {
      title: "Backup GitHub",
      description: "Configuração e execução de backups automáticos no GitHub",
      type: "pdf",
    },
  },

  // ─── ADMIN PF ─────────────────────────────────────────────────────────────
  {
    id: "adminpf-visao",
    title: "Visão Geral",
    url: "/pessoal",
    icon: LayoutDashboard,
    subCategory: "adminpf",
    manual: {
      title: "Visão Geral — Finanças CEO",
      description: "Painel resumo das finanças pessoais do CEO",
      type: "pdf",
    },
  },
  {
    id: "adminpf-financeiro",
    title: "Gestão Financeira",
    url: "/pessoal/financeiro",
    icon: Wallet,
    subCategory: "adminpf",
    manual: {
      title: "Gestão Financeira PF",
      description: "Controle de receitas e despesas pessoais",
      type: "pdf",
    },
  },
  {
    id: "adminpf-plano-contas",
    title: "Plano de Contas",
    url: "/pessoal/plano-contas",
    icon: PieChart,
    subCategory: "adminpf",
    manual: {
      title: "Plano de Contas PF",
      description: "Categorias de receitas e despesas pessoais",
      type: "pdf",
    },
  },
  {
    id: "adminpf-centros",
    title: "Centros de Custo",
    url: "/pessoal/centros-custo",
    icon: Building2,
    subCategory: "adminpf",
    manual: {
      title: "Centros de Custo PF",
      description: "Organização das despesas pessoais por centro de custo",
      type: "pdf",
    },
  },
  {
    id: "adminpf-bancos",
    title: "Contas Bancárias",
    url: "/pessoal/bancos",
    icon: Landmark,
    subCategory: "adminpf",
    manual: {
      title: "Contas Bancárias PF",
      description: "Gestão das contas bancárias e investimentos pessoais",
      type: "pdf",
    },
  },
  {
    id: "adminpf-irpf",
    title: "IRPF",
    url: "/pessoal/irpf",
    icon: FileText,
    subCategory: "adminpf",
    manual: {
      title: "IRPF",
      description: "Imposto de Renda Pessoa Física e declaração anual",
      type: "pdf",
    },
  },

  // ─── Administrativo (clientes admin) ─────────────────────────────────────
  {
    id: "adm-meu-plano",
    title: "Meu Plano",
    url: "/admin/meu-plano",
    icon: CreditCard,
    subCategory: "administrativo",
    manual: {
      title: "Meu Plano",
      description: "Detalhes do plano contratado, uso e opções de upgrade",
      type: "pdf",
    },
  },
  {
    id: "adm-colaboradores",
    title: "Colaboradores",
    url: "/vendedores",
    icon: UserRound,
    subCategory: "administrativo",
    manual: {
      title: "Gestão de Colaboradores",
      description: "Cadastro e gerenciamento da equipe comercial",
      type: "pdf",
    },
  },
  {
    id: "adm-logs",
    title: "Logs de Auditoria",
    url: "/logs-auditoria",
    icon: Activity,
    subCategory: "administrativo",
    manual: {
      title: "Logs de Auditoria",
      description: "Histórico de ações e acessos na plataforma",
      type: "pdf",
    },
  },
];

export function getSidebarItems(subCategory: "mkt" | "com" | "cac") {
  return featureRegistry
    .filter((item) => item.subCategory === subCategory)
    .map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
    }));
}

export function getComGroupItems(group: "planejamento" | "relacionamento" | "precificacao" | "gestao") {
  return featureRegistry
    .filter((item) => item.subCategory === "com" && item.comGroup === group)
    .map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
    }));
}

export function getManualMapping(): Record<string, { subCategory: string; itemId: string }> {
  const mapping: Record<string, { subCategory: string; itemId: string }> = {};
  featureRegistry.forEach((item) => {
    mapping[item.url] = {
      subCategory: item.subCategory,
      itemId: item.id,
    };
  });
  return mapping;
}

export function getManualCategories() {
  const comercialSubCategoryInfo = {
    mkt: {
      id: "mkt",
      title: "MKT - Pré-Vendas",
      description: "Marketing e prospecção de clientes",
      icon: Megaphone,
    },
    com: {
      id: "com",
      title: "COM - Vendas",
      description: "Ferramentas e processos de vendas",
      icon: Handshake,
    },
    cac: {
      id: "cac",
      title: "CAC - Pós-Vendas",
      description: "Relacionamento e satisfação do cliente",
      icon: MessageSquareHeart,
    },
  };

  const comercialSubCategories = (["mkt", "com", "cac"] as const).map((subCat) => {
    const items = featureRegistry
      .filter((item) => item.subCategory === subCat)
      .map((item) => ({
        id: item.id,
        title: item.manual.title,
        description: item.manual.description,
        icon: item.icon,
        type: item.manual.type,
        downloadUrl: item.manual.downloadUrl,
        externalUrl: item.manual.externalUrl,
      }));

    return {
      ...comercialSubCategoryInfo[subCat],
      items,
    };
  });

  // Admin PJ subcategory
  const adminpjItems = featureRegistry
    .filter((item) => item.subCategory === "adminpj")
    .map((item) => ({
      id: item.id,
      title: item.manual.title,
      description: item.manual.description,
      icon: item.icon,
      type: item.manual.type,
      downloadUrl: item.manual.downloadUrl,
      externalUrl: item.manual.externalUrl,
    }));

  // Admin PF subcategory
  const adminpfItems = featureRegistry
    .filter((item) => item.subCategory === "adminpf")
    .map((item) => ({
      id: item.id,
      title: item.manual.title,
      description: item.manual.description,
      icon: item.icon,
      type: item.manual.type,
      downloadUrl: item.manual.downloadUrl,
      externalUrl: item.manual.externalUrl,
    }));

  // Administrativo subcategory
  const administrativoItems = featureRegistry
    .filter((item) => item.subCategory === "administrativo")
    .map((item) => ({
      id: item.id,
      title: item.manual.title,
      description: item.manual.description,
      icon: item.icon,
      type: item.manual.type,
      downloadUrl: item.manual.downloadUrl,
      externalUrl: item.manual.externalUrl,
    }));

  return [
    {
      id: "roteiro-comercial",
      title: "Roteiro Comercial",
      description: "Guia completo do processo comercial da plataforma MCG",
      icon: Route,
      subCategories: comercialSubCategories,
    },
    {
      id: "plataforma-mcg",
      title: "Plataforma MCG",
      description: "Guia de administração e gestão interna da MCG Consultoria",
      icon: Building2,
      subCategories: [
        {
          id: "adminpj",
          title: "ADMIN PJ",
          description: "Gestão da empresa: usuários, financeiro, marketing e sistema",
          icon: Building2,
          items: adminpjItems,
        },
        {
          id: "adminpf",
          title: "ADMIN PF — Finanças CEO",
          description: "Gestão financeira pessoal do CEO",
          icon: Wallet,
          items: adminpfItems,
        },
        {
          id: "administrativo",
          title: "Administrativo",
          description: "Meu plano, colaboradores e auditoria",
          icon: UserRound,
          items: administrativoItems,
        },
      ],
    },
  ];
}
