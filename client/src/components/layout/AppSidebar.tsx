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
} from "lucide-react";
import logoMcg from "@assets/logo_mcg_principal.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    title: "Calculadora de Frete",
    url: "/calculadora-frete",
    icon: Calculator,
  },
  {
    title: "Calculadora de Armazenagem",
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
    title: "Calendario",
    url: "/calendario",
    icon: Calendar,
  },
  {
    title: "Ata Plano de Acao",
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
    title: "Relatorios",
    url: "/relatorios",
    icon: BarChart3,
  },
  {
    title: "Metas",
    url: "/operacoes",
    icon: Settings2,
  },
  {
    title: "Biblioteca",
    url: "/biblioteca",
    icon: Library,
  },
];

const posVendasItems = [
  {
    title: "Pesquisas de Satisfacao",
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
    url: "/assinatura",
    icon: CreditCard,
  },
  {
    title: "Vendedores",
    url: "/vendedores",
    icon: UserRound,
  },
];

const suporteItems = [
  {
    title: "Suporte",
    url: "/suporte",
    icon: HeadphonesIcon,
  },
];

interface CollapsibleSectionProps {
  title: string;
  icon: React.ElementType;
  items: Array<{ title: string; url: string; icon: React.ElementType }>;
  location: string;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon: Icon, items, location, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasActiveItem = items.some(item => location === item.url);

  return (
    <Collapsible open={isOpen || hasActiveItem} onOpenChange={setIsOpen}>
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
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen || hasActiveItem ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent className="mt-1">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
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
  const { user } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const isAdmin = user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer">
            <img 
              src={logoMcg} 
              alt="MCG Consultoria" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">MCG</span>
              <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <CollapsibleSection
          title="Pre-Vendas"
          icon={Megaphone}
          items={preVendasItems}
          location={location}
        />

        <CollapsibleSection
          title="Vendas"
          icon={ShoppingCart}
          items={vendasItems}
          location={location}
        />

        <CollapsibleSection
          title="Pos-Vendas"
          icon={Handshake}
          items={posVendasItems}
          location={location}
        />

        {isAdmin && (
          <CollapsibleSection
            title="Admin Cliente"
            icon={UserCog}
            items={adminClienteItems}
            location={location}
          />
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {suporteItems.map((item) => {
                const isActive = location === item.url;
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
        </SidebarGroup>

        {(user?.role === "admin" || user?.role === "admin_mcg") && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.startsWith("/admin")}>
                    <Link href="/admin" data-testid="nav-admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin MCG</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
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
              {user?.firstName || user?.email || "Usuario"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start" asChild>
            <Link href="/configuracoes">
              <Settings className="h-4 w-4 mr-2" />
              Configuracoes
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            data-testid="button-logout"
            onClick={async () => {
              try {
                await apiRequest("POST", "/api/auth/logout");
                window.location.href = "/";
              } catch (error) {
                window.location.href = "/";
              }
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
