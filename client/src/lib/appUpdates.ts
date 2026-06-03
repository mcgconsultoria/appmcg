export interface AppUpdate {
  date: string;
  menu: string;
  submenu?: string;
  item: string;
  description: string;
}

// ── Regra padrão: ao criar ou atualizar qualquer item/menu da plataforma,
// adicionar uma entrada aqui no topo (ordem decrescente — mais recente primeiro).
export const appUpdates: AppUpdate[] = [
  {
    date: "2026-06-03",
    menu: "Administrativo",
    item: "Atualizações",
    description: "Nova página com histórico completo de atualizações da plataforma, ordenado da mais recente para a mais antiga.",
  },
  {
    date: "2026-06-03",
    menu: "Fluxograma Comercial",
    item: "Seção Administrativo",
    description: "Adicionada seção 'Administrativo' no Fluxograma Comercial com os itens Meu Plano, Colaboradores, Logs de Auditoria e Atualizações.",
  },
  {
    date: "2026-06-03",
    menu: "Manual APP",
    submenu: "Roteiro Comercial",
    item: "Grupo Comercial (MKT / COM / CAC)",
    description: "MKT, COM e CAC agrupados dentro do grupo 'Comercial' no Manual, facilitando a navegação.",
  },
  {
    date: "2026-06-03",
    menu: "Manual APP",
    submenu: "Plataforma MCG",
    item: "ADMIN PJ / ADMIN PF",
    description: "Seções exclusivas para administração interna da MCG adicionadas ao Manual APP.",
  },
  {
    date: "2026-06-03",
    menu: "Sidebar (todos os itens)",
    item: "Botão de Ajuda (?)",
    description: "Todos os itens do sidebar passaram a exibir o botão (?) que direciona para o item correspondente no Manual APP.",
  },
  {
    date: "2026-06-03",
    menu: "ADMIN PJ",
    submenu: "Comercial",
    item: "Clientes MCG",
    description: "Nova página de gestão de clientes da MCG Consultoria adicionada ao ADMIN PJ.",
  },
  {
    date: "2026-06-03",
    menu: "ADMIN PJ",
    submenu: "Comercial",
    item: "Pipeline",
    description: "Renomeado de 'Gestão Comercial' para 'Pipeline'.",
  },
  {
    date: "2026-06-03",
    menu: "ADMIN PJ",
    submenu: "Comercial",
    item: "Dashboard",
    description: "Renomeado de 'Leads Diagnóstico' para 'Dashboard'.",
  },
  {
    date: "2026-06-03",
    menu: "ADMIN PJ",
    submenu: "Marketing",
    item: "Campanha Piloto",
    description: "Movido de 'Comercial' para 'Marketing' no menu lateral.",
  },
  {
    date: "2026-06-03",
    menu: "ADMIN PJ",
    submenu: "Usuários",
    item: "Novo Usuário",
    description: "Botão para criar usuários aprovados diretamente pelo administrador MCG.",
  },
];
