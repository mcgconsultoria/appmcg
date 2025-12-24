import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  ClipboardList,
  Calculator,
  Warehouse,
  Kanban,
  FileText,
  Settings,
  LogOut,
  FileEdit,
  Calendar,
  ListTodo,
  FolderKanban,
  CreditCard,
  Shield,
  UserCog,
  HeadphonesIcon,
  BarChart3,
  UserRound,
  Settings2,
  Library,
  TrendingUp,
  Megaphone,
  MessageSquareHeart,
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
    title: "Operacoes",
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

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

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
        <SidebarGroup>
          <SidebarGroupLabel>Pre-Vendas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {preVendasItems.map((item) => {
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

        <SidebarGroup>
          <SidebarGroupLabel>Vendas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {vendasItems.map((item) => {
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

        <SidebarGroup>
          <SidebarGroupLabel>Pos-Vendas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {posVendasItems.map((item) => {
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

        {(user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg") && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin Cliente</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminClienteItems.map((item) => {
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
            <SidebarGroupLabel>Administracao</SidebarGroupLabel>
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
