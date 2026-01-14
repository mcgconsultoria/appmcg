import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  ClipboardList,
  Calculator,
  Warehouse,
  Kanban,
  Settings,
  LogOut,
  FileEdit,
  Calendar,
  ListTodo,
  FolderKanban,
  CreditCard,
  Shield,
  HeadphonesIcon,
  BarChart3,
  UserRound,
  Settings2,
  Library,
  TrendingUp,
  Megaphone,
  MessageSquareHeart,
  ChevronDown,
  ShoppingCart,
  Handshake,
  UserCog,
  Briefcase,
  FileText,
  Palette,
  FileSignature,
  Rocket,
  Search,
  PieChart,
  Building2,
  Landmark,
  FileBadge,
  BookOpen,
  Route,
  Store,
  Gift,
  Activity,
  Wallet,
  GitBranch,
  UserCheck,
  MessageSquare,
  Database,
  Lock,
  HelpCircle,
} from "lucide-react";

// Mapeamento de URLs para IDs do manual (subcategoria e item)
const manualMapping: Record<string, { subCategory: string; itemId: string }> = {
  "/marketing": { subCategory: "mkt", itemId: "mkt-marketing" },
  "/indicadores-pre-vendas": { subCategory: "mkt", itemId: "mkt-indicadores" },
  "/calculadora-frete": { subCategory: "com", itemId: "com-calcule-frete" },
  "/calculadora-armazenagem": { subCategory: "com", itemId: "com-calcule-armazenagem" },
  "/dashboard": { subCategory: "com", itemId: "com-dashboard" },
  "/clientes": { subCategory: "com", itemId: "com-clientes" },
  "/pipeline": { subCategory: "com", itemId: "com-pipeline" },
  "/calendario": { subCategory: "com", itemId: "com-calendario" },
  "/calendário": { subCategory: "com", itemId: "com-calendario" },
  "/rotas": { subCategory: "com", itemId: "com-rotas" },
  "/atas": { subCategory: "com", itemId: "com-ata" },
  "/checklist": { subCategory: "com", itemId: "com-checklist" },
  "/rfi": { subCategory: "com", itemId: "com-rfi" },
  "/tarefas": { subCategory: "com", itemId: "com-tarefas" },
  "/projetos": { subCategory: "com", itemId: "com-projetos" },
  "/indicadores-vendas": { subCategory: "com", itemId: "com-indicadores" },
  "/relatórios": { subCategory: "com", itemId: "com-relatorios" },
  "/operações": { subCategory: "com", itemId: "com-metas" },
  "/pesquisas": { subCategory: "cac", itemId: "cac-pesquisas" },
  "/indicadores-pos-vendas": { subCategory: "cac", itemId: "cac-indicadores" },
};
import logoMcg from "@assets/logo_mcg_principal.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

const preVendasItems = [
  {
    title: "Marketing",
    url: "/marketing",
    icon: Megaphone,
  },
  {
    title: "Indicadores",
    url: "/indicadores-pre-vendas",
    icon: TrendingUp,
  },
];

const vendasItems = [
  {
    title: "Calcule Frete",
    url: "/calculadora-frete",
    icon: Calculator,
  },
  {
    title: "Calcule Armazenagem",
    url: "/calculadora-armazenagem",
    icon: Warehouse,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Pipeline",
    url: "/pipeline",
    icon: Kanban,
  },
  {
    title: "Calendário",
    url: "/calendário",
    icon: Calendar,
  },
  {
    title: "Rotas",
    url: "/rotas",
    icon: Route,
  },
  {
    title: "Ata Plano de Ação",
    url: "/atas",
    icon: FileEdit,
  },
  {
    title: "Checklist",
    url: "/checklist",
    icon: ClipboardCheck,
  },
  {
    title: "RFI",
    url: "/rfi",
    icon: ClipboardList,
  },
  {
    title: "Tarefas",
    url: "/tarefas",
    icon: ListTodo,
  },
  {
    title: "Projetos",
    url: "/projetos",
    icon: FolderKanban,
  },
  {
    title: "Indicadores",
    url: "/indicadores-vendas",
    icon: TrendingUp,
  },
  {
    title: "Relatórios",
    url: "/relatórios",
    icon: BarChart3,
  },
  {
    title: "Metas",
    url: "/operações",
    icon: Settings2,
  },
];

const posVendasItems = [
  {
    title: "Pesquisas de Satisfação",
    url: "/pesquisas",
    icon: MessageSquareHeart,
  },
  {
    title: "Indicadores",
    url: "/indicadores-pos-vendas",
    icon: TrendingUp,
  },
];

const adminClienteItems = [
  {
    title: "Meu Plano",
    url: "/admin/meu-plano",
    icon: CreditCard,
  },
  {
    title: "Vendedores",
    url: "/vendedores",
    icon: UserRound,
  },
  {
    title: "Logs de Auditoria",
    url: "/logs-auditoria",
    icon: Activity,
  },
];

const adminMcgComercialItems = [
  {
    title: "Aguardando Aprovação",
    url: "/admin/aguardando-aprovacao",
    icon: UserCheck,
  },
  {
    title: "Comercial",
    url: "/admin/comercial",
    icon: Briefcase,
  },
  {
    title: "Projetos",
    url: "/admin/projetos",
    icon: FolderKanban,
  },
  {
    title: "Parcerias",
    url: "/admin/parcerias",
    icon: Handshake,
  },
  {
    title: "Contratos",
    url: "/admin/contratos",
    icon: FileSignature,
  },
  {
    title: "Campanha Piloto",
    url: "/admin/campanha-piloto",
    icon: Rocket,
  },
  {
    title: "Diagnóstico Leads",
    url: "/admin/leads-diagnóstico",
    icon: Search,
  },
];

const adminMcgMarketingItems = [
  {
    title: "Conteúdo",
    url: "/admin/conteudo",
    icon: FileText,
  },
  {
    title: "Kit Marca",
    url: "/admin/kit-marca",
    icon: Palette,
  },
  {
    title: "Templates",
    url: "/admin/templates",
    icon: Library,
  },
];

const adminMcgFinanceiroItems = [
  {
    title: "Dashboard Admin",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Financeiro",
    url: "/admin/financeiro",
    icon: CreditCard,
  },
  {
    title: "Plano de Contas (DRE)",
    url: "/admin/dre",
    icon: PieChart,
  },
  {
    title: "Centros de Custo",
    url: "/admin/centros-custo",
    icon: Building2,
  },
  {
    title: "Contas Bancarias",
    url: "/admin/bancos",
    icon: Landmark,
  },
  {
    title: "Certificados",
    url: "/admin/certificados",
    icon: FileBadge,
  },
  {
    title: "Lançamentos",
    url: "/admin/lançamentos",
    icon: BookOpen,
  },
  {
    title: "Relatorio DRE",
    url: "/admin/relatorio-dre",
    icon: BarChart3,
  },
  {
    title: "IRPJ",
    url: "/admin/irpj",
    icon: FileText,
  },
];

const adminMcgLojaItems = [
  {
    title: "Loja MCG",
    url: "/admin/loja",
    icon: Store,
  },
];

const adminMcgSistemaItems = [
  {
    title: "Planos e Valores",
    url: "/admin/planos",
    icon: CreditCard,
  },
  {
    title: "Cargos e Permissões",
    url: "/admin/permissoes",
    icon: Shield,
  },
  {
    title: "WhatsApp",
    url: "/admin/whatsapp",
    icon: MessageSquare,
  },
  {
    title: "Backup GitHub",
    url: "/admin/backup",
    icon: Database,
  },
];

const suporteItems = [
  {
    title: "Suporte",
    url: "/suporte",
    icon: HeadphonesIcon,
  },
];

const lojaMcgItems = [
  {
    title: "Biblioteca",
    url: "/biblioteca",
    icon: Library,
  },
  {
    title: "E-book",
    url: "/ebook",
    icon: BookOpen,
  },
  {
    title: "Brindes",
    url: "/brindes",
    icon: Gift,
  },
];

const FREE_PLAN_ALLOWED_URLS = [
  "/calculadora-frete",
  "/calculadora-armazenagem",
  "/suporte",
  "/manual-app",
  "/fluxograma",
  "/configuracoes",
  "/logout",
  "/admin/meu-plano",
  "/vendedores",
  "/logs-auditoria",
];

const PROFESSIONAL_PLAN_ALLOWED_URLS = [
  ...FREE_PLAN_ALLOWED_URLS,
  "/marketing",
  "/indicadores-pre-vendas",
  "/dashboard",
  "/clientes",
  "/pipeline",
  "/calendario",
  "/rotas",
  "/atas",
  "/checklist",
  "/rfi",
  "/tarefas",
  "/projetos",
  "/indicadores-vendas",
  "/relatorios",
  "/operacoes",
  "/pesquisas",
  "/indicadores-pos-vendas",
  "/admin/meu-plano",
  "/vendedores",
  "/logs-auditoria",
  "/biblioteca",
  "/ebook",
  "/brindes",
];

function normalizeUrl(url: string): string {
  return url
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isUrlAllowedForPlan(url: string, plan: string | undefined | null, planLoaded: boolean = true, userRole?: string | null): boolean {
  // Admin MCG (CEO) always has full access - no restrictions
  if (userRole === "admin_mcg") {
    return true;
  }
  
  if (!planLoaded) {
    return true;
  }
  
  const normalizedUrl = normalizeUrl(url);
  
  if (!plan || plan === "free" || plan === "gratuito") {
    return FREE_PLAN_ALLOWED_URLS.some(allowed => 
      normalizedUrl === normalizeUrl(allowed) || normalizedUrl.startsWith(normalizeUrl(allowed) + "/")
    );
  }
  if (plan === "profissional" || plan === "professional") {
    return PROFESSIONAL_PLAN_ALLOWED_URLS.some(allowed => 
      normalizedUrl === normalizeUrl(allowed) || normalizedUrl.startsWith(normalizeUrl(allowed) + "/")
    );
  }
  return true;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ElementType;
  items: Array<{ title: string; url: string; icon: React.ElementType }>;
  location: string;
  defaultOpen?: boolean;
  userPlan?: string | null;
  planLoaded?: boolean;
  userRole?: string | null;
}

function CollapsibleSection({ title, icon: Icon, items, location, defaultOpen = false, userPlan, planLoaded = true, userRole }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/admin") {
      return location === "/admin";
    }
    return location === itemUrl || location.startsWith(itemUrl + "/");
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-base font-semibold text-foreground hover-elevate rounded-md cursor-pointer"
            data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <span>{title}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = isItemActive(item.url);
                const isLocked = !isUrlAllowedForPlan(item.url, userPlan, planLoaded, userRole);
                
                if (isLocked) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-muted-foreground/60 cursor-not-allowed"
                            data-testid={`nav-${item.url.replace("/", "")}-locked`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.title}</span>
                            <Lock className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Disponível em planos superiores</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                }
                
                const manualInfo = manualMapping[item.url];
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <div className="flex items-center w-full">
                      <SidebarMenuButton asChild isActive={isActive} className="flex-1">
                        <Link href={item.url} data-testid={`nav-${item.url.replace("/", "")}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {manualInfo && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link 
                              href={`/manual-app?sub=${manualInfo.subCategory}&item=${manualInfo.itemId}`}
                              className="p-1 text-muted-foreground hover:text-primary transition-colors"
                              data-testid={`help-${item.url.replace("/", "")}`}
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Ver instruções no manual</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

function AdminPJSection({ location, userRole, userPlan, planLoaded = true }: { location: string; userRole?: string; userPlan?: string | null; planLoaded?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter comercial items - only admin_mcg can see "Aguardando Aprovação"
  const filteredComercialItems = userRole === 'admin_mcg' 
    ? adminMcgComercialItems 
    : adminMcgComercialItems.filter(item => item.url !== '/admin/aguardando-aprovacao');

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-base font-bold text-foreground hover-elevate rounded-md cursor-pointer"
            data-testid="section-admin-pj"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span>ADMIN PJ</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-2">
            <CollapsibleSection
              title="Comercial"
              icon={Briefcase}
              items={filteredComercialItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
            />
            <CollapsibleSection
              title="Marketing"
              icon={Megaphone}
              items={adminMcgMarketingItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
            />
            <CollapsibleSection
              title="Financeiro"
              icon={Landmark}
              items={adminMcgFinanceiroItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
            />
            <CollapsibleSection
              title="Loja"
              icon={Store}
              items={adminMcgLojaItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
            />
            {userRole === 'admin_mcg' && (
              <CollapsibleSection
                title="Sistema"
                icon={Settings}
                items={adminMcgSistemaItems}
                location={location}
                userPlan={userPlan}
                planLoaded={planLoaded}
                userRole={userRole}
              />
            )}
          </div>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

const adminPfItems = [
  {
    title: "Dashboard PF",
    url: "/pessoal",
    icon: LayoutDashboard,
  },
  {
    title: "Gestão Financeira",
    url: "/pessoal/gestao-financeira",
    icon: Wallet,
  },
  {
    title: "Contas Bancárias",
    url: "/pessoal/contas",
    icon: Landmark,
  },
  {
    title: "Centros de Custo",
    url: "/pessoal/centros-custo",
    icon: Building2,
  },
  {
    title: "IRPF",
    url: "/pessoal/irpf",
    icon: FileText,
  },
];

function AdminPFSection({ location, userPlan, planLoaded = true, userRole }: { location: string; userPlan?: string | null; planLoaded?: boolean; userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/pessoal") {
      return location === "/pessoal";
    }
    return location === itemUrl || location.startsWith(itemUrl + "/");
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-base font-bold text-foreground hover-elevate rounded-md cursor-pointer"
            data-testid="section-admin-pf"
          >
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              <span>ADMIN PF</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {adminPfItems.map((item) => {
                const isActive = isItemActive(item.url);
                const isLocked = !isUrlAllowedForPlan(item.url, userPlan, planLoaded, userRole);
                
                if (isLocked) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex items-center gap-2 px-3 py-2 text-muted-foreground/60 cursor-not-allowed"
                            data-testid={`nav-${item.url.replace("/", "")}-locked`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.title}</span>
                            <Lock className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Disponível em planos superiores</p>
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  );
                }
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`nav-${item.url.replace("/", "")}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout, isLoading } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const isAdmin = user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";
  
  const planLoaded = !isLoading && user !== undefined;
  const effectivePlan = planLoaded ? user?.selectedPlan : "corporativo";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <a 
          href="/landing"
          className="flex items-center gap-3 cursor-pointer no-underline"
          title="Ir para página inicial"
          data-testid="link-logo-home"
        >
          <img 
            src={logoMcg} 
            alt="MCG Consultoria" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight text-foreground">MCG</span>
            <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
          </div>
        </a>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/suporte"}>
                  <Link 
                    href="/suporte" 
                    data-testid="nav-suporte"
                    className="flex items-center gap-2 px-3 py-2 text-base font-semibold text-blue-600 dark:text-blue-400"
                  >
                    <HeadphonesIcon className="h-5 w-5" />
                    <span>Suporte</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/manual-app"}>
                  <Link 
                    href="/manual-app" 
                    data-testid="nav-manual-app"
                    className="flex items-center gap-2 px-3 py-2 text-base font-semibold"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Manual APP</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/fluxograma"}>
                  <Link 
                    href="/fluxograma" 
                    data-testid="nav-fluxograma"
                    className="flex items-center gap-2 px-3 py-2 text-base font-semibold"
                  >
                    <GitBranch className="h-5 w-5" />
                    <span>Fluxograma Comercial</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <CollapsibleSection
          title="Loja MCG"
          icon={Store}
          items={lojaMcgItems}
          location={location}
          userPlan={effectivePlan}
          planLoaded={planLoaded}
          userRole={user?.role}
        />

        <CollapsibleSection
          title="MKT (Pré Vendas)"
          icon={Megaphone}
          items={preVendasItems}
          location={location}
          userPlan={effectivePlan}
          planLoaded={planLoaded}
          userRole={user?.role}
        />

        <CollapsibleSection
          title="COM (Vendas)"
          icon={ShoppingCart}
          items={vendasItems}
          location={location}
          userPlan={effectivePlan}
          planLoaded={planLoaded}
          userRole={user?.role}
        />

        <CollapsibleSection
          title="CAC (Pós Vendas)"
          icon={Handshake}
          items={posVendasItems}
          location={location}
          userPlan={effectivePlan}
          planLoaded={planLoaded}
          userRole={user?.role}
        />

        <CollapsibleSection
          title="Admin Cliente"
          icon={UserCog}
          items={adminClienteItems}
          location={location}
          userPlan={effectivePlan}
          planLoaded={planLoaded}
          userRole={user?.role}
        />

        {(user?.role === "admin" || user?.role === "admin_mcg") && (
          <AdminPJSection location={location} userRole={user?.role} userPlan={effectivePlan} planLoaded={planLoaded} />
        )}

        {(user?.role === "admin" || user?.role === "admin_mcg") && (
          <AdminPFSection location={location} userPlan={effectivePlan} planLoaded={planLoaded} userRole={user?.role} />
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
            <AvatarFallback className="text-xs">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName || user?.email || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start" asChild>
            <Link href="/configurações">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Link>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/logout">
                <button
                  type="button"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Sair</TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
