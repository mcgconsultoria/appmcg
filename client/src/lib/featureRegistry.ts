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
} from "lucide-react";

export interface FeatureItem {
  id: string;
  title: string;
  url: string;
  icon: typeof Megaphone;
  subCategory: "mkt" | "com" | "cac";
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

  // COM - Vendas
  {
    id: "com-calcule-frete",
    title: "Calcule Frete",
    url: "/calculadora-frete",
    icon: Calculator,
    subCategory: "com",
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
    manual: {
      title: "Calculadora de Armazenagem",
      description: "Como precificar serviços de armazenagem",
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
    id: "com-clientes",
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    subCategory: "com",
    manual: {
      title: "Gestão de Clientes",
      description: "Como gerenciar sua carteira de clientes",
      type: "pdf",
    },
  },
  {
    id: "com-pipeline",
    title: "Pipeline",
    url: "/pipeline",
    icon: Kanban,
    subCategory: "com",
    manual: {
      title: "Pipeline de Vendas",
      description: "Acompanhamento do funil comercial",
      type: "pdf",
    },
  },
  {
    id: "com-calendario",
    title: "Calendário",
    url: "/calendário",
    icon: Calendar,
    subCategory: "com",
    manual: {
      title: "Calendário Comercial",
      description: "Agendamento de reuniões e visitas",
      type: "pdf",
    },
  },
  {
    id: "com-rotas",
    title: "Rotas",
    url: "/rotas",
    icon: Route,
    subCategory: "com",
    manual: {
      title: "Rotas Salvas",
      description: "Gerenciamento de rotas de entrega",
      type: "pdf",
    },
  },
  {
    id: "com-ata",
    title: "Ata Plano de Ação",
    url: "/atas",
    icon: FileEdit,
    subCategory: "com",
    manual: {
      title: "Ata Plano de Ação",
      description: "Registro de reuniões e planos de ação",
      type: "pdf",
    },
  },
  {
    id: "com-checklist",
    title: "Checklist",
    url: "/checklist",
    icon: ClipboardCheck,
    subCategory: "com",
    manual: {
      title: "Checklist Comercial",
      description: "Diagnóstico operacional do cliente",
      type: "pdf",
    },
  },
  {
    id: "com-biblioteca",
    title: "Biblioteca",
    url: "/biblioteca",
    icon: Library,
    subCategory: "com",
    manual: {
      title: "Biblioteca de Checklists",
      description: "Templates prontos de checklists por segmento",
      type: "pdf",
    },
  },
  {
    id: "com-rfi",
    title: "RFI",
    url: "/rfi",
    icon: ClipboardList,
    subCategory: "com",
    manual: {
      title: "RFI - Request for Information",
      description: "Ficha técnica para licitações",
      type: "pdf",
    },
  },
  {
    id: "com-tarefas",
    title: "Tarefas",
    url: "/tarefas",
    icon: ListTodo,
    subCategory: "com",
    manual: {
      title: "Gestão de Tarefas",
      description: "Controle de atividades e prazos",
      type: "pdf",
    },
  },
  {
    id: "com-projetos",
    title: "Projetos",
    url: "/projetos",
    icon: FolderKanban,
    subCategory: "com",
    manual: {
      title: "Gestão de Projetos",
      description: "Acompanhamento de projetos comerciais",
      type: "pdf",
    },
  },
  {
    id: "com-indicadores",
    title: "Indicadores",
    url: "/indicadores-vendas",
    icon: BarChart3,
    subCategory: "com",
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
    manual: {
      title: "Relatórios",
      description: "Exportação e análise de dados",
      type: "pdf",
    },
  },
  {
    id: "com-metas",
    title: "Metas",
    url: "/operações",
    icon: Settings2,
    subCategory: "com",
    manual: {
      title: "Gestão de Metas",
      description: "Definição e acompanhamento de metas",
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
