import { useState, useEffect } from "react";
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
  HelpCircle,
  Shirt,
} from "lucide-react";

import { getSidebarItems, getManualMapping, getComGroupItems } from "@/lib/featureRegistry";

const manualMapping = getManualMapping();
import logoMcg from "@assets/logo_mcg_principal.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { StoreProductCategory } from "@shared/schema";

const preVendasItems = getSidebarItems("mkt");
const posVendasItems = getSidebarItems("cac");
const comPlanejamentoItems = getComGroupItems("planejamento");
const comRelacionamentoItems = getComGroupItems("relacionamento");
const comPrecificacaoItems = getComGroupItems("precificacao");
const comGestaoItems = getComGroupItems("gestao");

const adminClienteItems = [
  {
    title: "Meu Plano",
    url: "/admin/meu-plano",
    icon: CreditCard,
  },
  {
    title: "Colaboradores",
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
    title: "Usuários",
    url: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Pipeline",
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
    title: "Dashboard",
    url: "/admin/leads-diagnóstico",
    icon: Search,
  },
  {
    title: "Templates",
    url: "/admin/templates",
    icon: Library,
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
    title: "Contas Bancárias",
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
    title: "Relatório DRE",
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
    title: "Produtos",
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
    title: "Suporte",
    url: "/admin/suporte",
    icon: HeadphonesIcon,
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
  "/loja",
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

function isUrlAllowedForPlan(url: string, plan: string | undefined | null, planLoaded: boolean = true, userRole?: string | null, fullAccessGranted?: boolean | null): boolean {
  // Admin MCG (CEO) always has full access - no restrictions
  if (userRole === "admin_mcg") {
    return true;
  }
  
  // Users with fullAccessGranted have complete access regardless of plan
  if (fullAccessGranted) {
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
  fullAccessGranted?: boolean | null;
  subtle?: boolean;
  // Controlled mode (accordion support)
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CollapsibleSection({ title, icon: Icon, items, location, defaultOpen = false, userPlan, planLoaded = true, userRole, fullAccessGranted, subtle = false, isOpen: controlledOpen, onOpenChange: onControlledChange }: CollapsibleSectionProps) {
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/admin") {
      return location === "/admin";
    }
    return location === itemUrl || location.startsWith(itemUrl + "/");
  };

  const hasActiveItem = items.some(item => isItemActive(item.url));
  const [internalOpen, setInternalOpen] = useState(
    controlledOpen !== undefined ? controlledOpen : (defaultOpen || hasActiveItem)
  );

  useEffect(() => {
    if (hasActiveItem && controlledOpen === undefined) {
      setInternalOpen(true);
    }
  }, [location]);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = (open: boolean) => {
    if (onControlledChange) onControlledChange(open);
    else setInternalOpen(open);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button
            className={`flex items-center justify-between w-full px-3 py-2 text-sm text-foreground hover-elevate rounded-md cursor-pointer ${subtle ? 'font-normal' : 'font-semibold'}`}
            data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{title}</span>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = isItemActive(item.url);
                const isLocked = !isUrlAllowedForPlan(item.url, userPlan, planLoaded, userRole, fullAccessGranted);
                
                if (isLocked) return null;
                
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

function getCategoryIcon(slug: string): React.ElementType {
  switch (slug) {
    case 'brindes':
      return Gift;
    case 'ebooks':
    case 'ebook':
      return BookOpen;
    case 'escritorio':
      return Briefcase;
    case 'vestuario':
      return Shirt;
    default:
      return Store;
  }
}

interface LojaMcgDynamicSectionProps {
  location: string;
  userPlan?: string | null;
  planLoaded?: boolean;
  userRole?: string | null;
  fullAccessGranted?: boolean | null;
}

// Categorias fixas da loja - sempre visíveis no menu
const DEFAULT_STORE_CATEGORIES = [
  { title: "E-books", url: "/loja/ebooks", icon: BookOpen },
  { title: "Escritório", url: "/loja/escritorio", icon: Briefcase },
  { title: "Brindes", url: "/loja/brindes", icon: Gift },
  { title: "M. Veste", url: "/loja/vestuario", icon: Shirt },
];

function LojaMcgDynamicSection({ location, userPlan, planLoaded = true, userRole, fullAccessGranted, isOpen: controlledOpen, onOpenChange: onControlledChange }: LojaMcgDynamicSectionProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const items = DEFAULT_STORE_CATEGORIES;

  const isItemActive = (itemUrl: string) => location === itemUrl || location.startsWith(itemUrl + "/");
  const hasActiveItem = items.some(item => isItemActive(item.url));

  const [internalOpen, setInternalOpen] = useState(hasActiveItem);

  useEffect(() => {
    if (hasActiveItem && controlledOpen === undefined) setInternalOpen(true);
  }, [hasActiveItem]);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = (open: boolean) => {
    if (onControlledChange) onControlledChange(open);
    else setInternalOpen(open);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-foreground hover-elevate rounded-md cursor-pointer"
            data-testid="section-loja-mcg"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Store className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Loja MCG</span>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = isItemActive(item.url);
                const isLocked = !isUrlAllowedForPlan(item.url, userPlan, planLoaded, userRole, fullAccessGranted);
                
                if (isLocked) return null;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={`nav-loja-${item.url.split('/').pop()}`}>
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

function AdminPJSection({ location, userRole, userPlan, planLoaded = true, fullAccessGranted, isOpen: controlledOpen, onOpenChange: onControlledChange }: { location: string; userRole?: string; userPlan?: string | null; planLoaded?: boolean; fullAccessGranted?: boolean | null; isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const filteredComercialItems = userRole === 'admin_mcg' 
    ? adminMcgComercialItems 
    : adminMcgComercialItems.filter(item => item.url !== '/admin/aguardando-aprovacao' && item.url !== '/admin/usuarios');

  const allAdminPJItems = [
    ...filteredComercialItems,
    ...adminMcgMarketingItems,
    ...adminMcgFinanceiroItems,
    ...adminMcgLojaItems,
    ...adminMcgSistemaItems
  ];
  
  const hasActiveItem = allAdminPJItems.some(item => 
    location === item.url || location.startsWith(item.url + "/")
  );

  const [internalOpen, setInternalOpen] = useState(hasActiveItem);
  useEffect(() => { if (hasActiveItem && controlledOpen === undefined) setInternalOpen(true); }, [location]);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = (open: boolean) => {
    if (onControlledChange) onControlledChange(open);
    else setInternalOpen(open);
  };

  const getActiveSubGroup = () => {
    if (filteredComercialItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "comercial";
    if (adminMcgMarketingItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "marketing";
    if (adminMcgFinanceiroItems.some(i => location === i.url || (i.url.length > 6 && location.startsWith(i.url + "/")))) return "financeiro";
    if (adminMcgLojaItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "loja";
    if (adminMcgSistemaItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "sistema";
    return null;
  };
  const [openSubGroup, setOpenSubGroup] = useState<string | null>(getActiveSubGroup());
  useEffect(() => { const ag = getActiveSubGroup(); if (ag) setOpenSubGroup(ag); }, [location]);
  const handleSubToggle = (group: string) => (open: boolean) => setOpenSubGroup(open ? group : null);

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
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
              fullAccessGranted={fullAccessGranted}
              isOpen={openSubGroup === "comercial"}
              onOpenChange={handleSubToggle("comercial")}
            />
            <CollapsibleSection
              title="Marketing"
              icon={Megaphone}
              items={adminMcgMarketingItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openSubGroup === "marketing"}
              onOpenChange={handleSubToggle("marketing")}
            />
            <CollapsibleSection
              title="Financeiro"
              icon={Landmark}
              items={adminMcgFinanceiroItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openSubGroup === "financeiro"}
              onOpenChange={handleSubToggle("financeiro")}
            />
            <CollapsibleSection
              title="Loja MCG"
              icon={Store}
              items={adminMcgLojaItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openSubGroup === "loja"}
              onOpenChange={handleSubToggle("loja")}
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
                fullAccessGranted={fullAccessGranted}
                isOpen={openSubGroup === "sistema"}
                onOpenChange={handleSubToggle("sistema")}
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
    title: "Visão Geral",
    url: "/pessoal",
    icon: LayoutDashboard,
  },
  {
    title: "Gestão Financeira",
    url: "/pessoal/financeiro",
    icon: Wallet,
  },
  {
    title: "Plano de Contas",
    url: "/pessoal/plano-contas",
    icon: PieChart,
  },
  {
    title: "Centros de Custo",
    url: "/pessoal/centros-custo",
    icon: Building2,
  },
  {
    title: "Contas Bancárias",
    url: "/pessoal/bancos",
    icon: Landmark,
  },
  {
    title: "IRPF",
    url: "/pessoal/irpf",
    icon: FileText,
  },
];

function AdminPFSection({ location, userPlan, planLoaded = true, userRole, fullAccessGranted, isOpen: controlledOpen, onOpenChange: onControlledChange }: { location: string; userPlan?: string | null; planLoaded?: boolean; userRole?: string; fullAccessGranted?: boolean | null; isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/pessoal") return location === "/pessoal";
    return location === itemUrl || location.startsWith(itemUrl + "/");
  };
  
  const hasActiveItem = adminPfItems.some(item => isItemActive(item.url));
  const [internalOpen, setInternalOpen] = useState(hasActiveItem);

  useEffect(() => { if (hasActiveItem && controlledOpen === undefined) setInternalOpen(true); }, [location]);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = (open: boolean) => {
    if (onControlledChange) onControlledChange(open);
    else setInternalOpen(open);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
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
                const isLocked = !isUrlAllowedForPlan(item.url, userPlan, planLoaded, userRole, fullAccessGranted);
                
                if (isLocked) return null;
                
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

interface ComercialSectionProps {
  location: string;
  userPlan?: string | null;
  planLoaded?: boolean;
  userRole?: string | null;
  fullAccessGranted?: boolean | null;
}

function ComVendasSection({ location, userPlan, planLoaded = true, userRole, fullAccessGranted, isOpen: controlledOpen, onOpenChange: onControlledChange }: ComercialSectionProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const allComItems = [...comPlanejamentoItems, ...comRelacionamentoItems, ...comPrecificacaoItems, ...comGestaoItems];
  const hasActiveItem = allComItems.some(item => location === item.url || location.startsWith(item.url + "/"));
  const [internalOpen, setInternalOpen] = useState(hasActiveItem);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const getActiveGroup = () => {
    if (comPlanejamentoItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "planejamento";
    if (comPrecificacaoItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "negociacao";
    if (comRelacionamentoItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "relacionamento";
    if (comGestaoItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "gestao";
    return null;
  };

  const [openGroup, setOpenGroup] = useState<string | null>(getActiveGroup());

  useEffect(() => {
    if (hasActiveItem && controlledOpen === undefined) setInternalOpen(true);
    const ag = getActiveGroup();
    if (ag) setOpenGroup(ag);
  }, [location]);

  const handleGroupToggle = (group: string) => (open: boolean) => {
    setOpenGroup(open ? group : null);
  };

  const handleComVendasToggle = (open: boolean) => {
    if (onControlledChange) onControlledChange(open);
    else setInternalOpen(open);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={handleComVendasToggle}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-foreground hover-elevate rounded-md cursor-pointer"
            data-testid="section-com-vendas"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">COM (Vendas)</span>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-2">
            <CollapsibleSection
              title="Planejamento"
              icon={ClipboardList}
              items={comPlanejamentoItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openGroup === "planejamento"}
              onOpenChange={handleGroupToggle("planejamento")}
            />
            <CollapsibleSection
              title="Negociação"
              icon={Calculator}
              items={comPrecificacaoItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openGroup === "negociacao"}
              onOpenChange={handleGroupToggle("negociacao")}
            />
            <CollapsibleSection
              title="Relacionamento"
              icon={Users}
              items={comRelacionamentoItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openGroup === "relacionamento"}
              onOpenChange={handleGroupToggle("relacionamento")}
            />
            <CollapsibleSection
              title="Gestão"
              icon={BarChart3}
              items={comGestaoItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openGroup === "gestao"}
              onOpenChange={handleGroupToggle("gestao")}
            />
          </div>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

function ComercialSection({ location, userPlan, planLoaded = true, userRole, fullAccessGranted, isOpen: controlledOpen, onOpenChange: onControlledChange }: ComercialSectionProps & { isOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const allComercialItems = [...preVendasItems, ...comPlanejamentoItems, ...comRelacionamentoItems, ...comPrecificacaoItems, ...comGestaoItems, ...posVendasItems];

  const hasActiveItem = allComercialItems.some(item =>
    location === item.url || location.startsWith(item.url + "/")
  );

  const [internalOpen, setInternalOpen] = useState(hasActiveItem);
  useEffect(() => { if (hasActiveItem && controlledOpen === undefined) setInternalOpen(true); }, [location]);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = (open: boolean) => {
    if (onControlledChange) onControlledChange(open);
    else setInternalOpen(open);
  };

  // Accordion for MKT / COM / CAC
  const getActiveSubSection = () => {
    if (preVendasItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "mkt";
    if (posVendasItems.some(i => location === i.url || location.startsWith(i.url + "/"))) return "cac";
    if ([...comPlanejamentoItems, ...comRelacionamentoItems, ...comPrecificacaoItems, ...comGestaoItems].some(i => location === i.url || location.startsWith(i.url + "/"))) return "com";
    return null;
  };
  const [openSubSection, setOpenSubSection] = useState<string | null>(getActiveSubSection());
  useEffect(() => { const s = getActiveSubSection(); if (s) setOpenSubSection(s); }, [location]);
  const handleSubToggle = (section: string) => (open: boolean) => setOpenSubSection(open ? section : null);

  return (
    <Collapsible open={isOpen} onOpenChange={handleToggle}>
      <SidebarGroup>
        <CollapsibleTrigger asChild>
          <button
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-foreground hover-elevate rounded-md cursor-pointer"
            data-testid="section-comercial"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingCart className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Comercial</span>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="pl-2">
            <CollapsibleSection
              title="MKT (Pré Vendas)"
              icon={Megaphone}
              items={preVendasItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openSubSection === "mkt"}
              onOpenChange={handleSubToggle("mkt")}
            />
            <ComVendasSection
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openSubSection === "com"}
              onOpenChange={handleSubToggle("com")}
            />
            <CollapsibleSection
              title="CAC (Pós Vendas)"
              icon={Handshake}
              items={posVendasItems}
              location={location}
              userPlan={userPlan}
              planLoaded={planLoaded}
              userRole={userRole}
              fullAccessGranted={fullAccessGranted}
              isOpen={openSubSection === "cac"}
              onOpenChange={handleSubToggle("cac")}
            />
          </div>
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

  // Accordion de nível raiz: só uma seção aberta por vez
  const getInitialTopSection = () => {
    // AdminPF: páginas pessoais
    if (location.startsWith("/pessoal")) return "adminpf";
    // Administrativo (cliente): apenas URLs específicas dessa seção
    const adminClienteOnly = ["/admin/meu-plano", "/vendedores", "/logs-auditoria"];
    if (adminClienteOnly.some(u => location === u || location.startsWith(u + "/"))) return "admincliente";
    // AdminPJ: qualquer outra página /admin/*
    if (location === "/admin" || location.startsWith("/admin/")) return "adminpj";
    // Loja
    if (location.startsWith("/loja")) return "loja";
    // Comercial (padrão)
    return "comercial";
  };
  const [openTopSection, setOpenTopSection] = useState<string>(getInitialTopSection());
  useEffect(() => { setOpenTopSection(getInitialTopSection()); }, [location]);
  const makeTopToggle = (key: string) => (open: boolean) => setOpenTopSection(open ? key : openTopSection === key ? "" : openTopSection);

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

        {user?.role === "admin_mcg" && (
          <AdminPJSection location={location} userRole={user?.role} userPlan={effectivePlan} planLoaded={planLoaded} fullAccessGranted={user?.fullAccessGranted} isOpen={openTopSection === "adminpj"} onOpenChange={makeTopToggle("adminpj")} />
        )}

        {user?.role === "admin_mcg" && (
          <AdminPFSection location={location} userPlan={effectivePlan} planLoaded={planLoaded} userRole={user?.role} fullAccessGranted={user?.fullAccessGranted} isOpen={openTopSection === "adminpf"} onOpenChange={makeTopToggle("adminpf")} />
        )}

        {(user?.role === "admin" || user?.role === "admin_mcg") && (
          <CollapsibleSection
            title="Administrativo"
            icon={UserCog}
            items={adminClienteItems}
            location={location}
            userPlan={effectivePlan}
            planLoaded={planLoaded}
            userRole={user?.role}
            fullAccessGranted={user?.fullAccessGranted}
            isOpen={openTopSection === "admincliente"}
            onOpenChange={makeTopToggle("admincliente")}
          />
        )}

        <ComercialSection
          location={location}
          userPlan={effectivePlan}
          planLoaded={planLoaded}
          userRole={user?.role}
          fullAccessGranted={user?.fullAccessGranted}
          isOpen={openTopSection === "comercial"}
          onOpenChange={makeTopToggle("comercial")}
        />

        <LojaMcgDynamicSection
          location={location}
          userPlan={effectivePlan}
          planLoaded={planLoaded}
          userRole={user?.role}
          fullAccessGranted={user?.fullAccessGranted}
          isOpen={openTopSection === "loja"}
          onOpenChange={makeTopToggle("loja")}
        />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/manual-app"}>
                  <Link 
                    href="/manual-app" 
                    data-testid="nav-manual-app"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>Manual APP</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/suporte"}>
                  <Link 
                    href="/suporte" 
                    data-testid="nav-suporte"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400"
                  >
                    <HeadphonesIcon className="h-4 w-4 shrink-0" />
                    <span>Suporte</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
