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
} from "lucide-react";

export interface FeatureItem {
  id: string;
  title: string;
  url: string;
  icon: typeof Megaphone;
  subCategory: "mkt" | "com" | "cac";
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
  // MKT - Pré-Vendas
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

  // COM - Vendas — PLANEJAMENTO
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
    url: "/operações",
    icon: Settings2,
    subCategory: "com",
    comGroup: "planejamento",
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

  // COM - Vendas — RELACIONAMENTO
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

  // COM - Vendas — PRECIFICAÇÃO E PROPOSTAS
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

  // COM - Vendas — GESTÃO E CONTROLE
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
    id: "com-rotas",
    title: "Rotas",
    url: "/rotas",
    icon: Route,
    subCategory: "com",
    comGroup: "gestao",
    manual: {
      title: "Rotas Salvas",
      description: "Gerenciamento de rotas de entrega",
      type: "pdf",
    },
  },
  {
    id: "com-dashboard",
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    subCategory: "com",
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

  // CAC - Pós-Vendas
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
  const subCategoryInfo = {
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

  const subCategories = (["mkt", "com", "cac"] as const).map((subCat) => {
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
      ...subCategoryInfo[subCat],
      items,
    };
  });

  return [
    {
      id: "roteiro-comercial",
      title: "Roteiro Comercial",
      description: "Guia completo do processo comercial da plataforma MCG",
      icon: Route,
      subCategories,
    },
  ];
}
