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
  DollarSign,
  Kanban,
  FileText,
  Settings,
  LogOut,
  FileEdit,
  Calendar,
  ListTodo,
  FolderKanban,
  Palette,
} from "lucide-react";
import logoMcg from "@assets/logo_mcg_principal.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

const mainMenuItems = [
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
];

const calculatorMenuItems = [
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
];

const managementMenuItems = [
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
  },
  {
    title: "Marketing",
    url: "/marketing",
    icon: FileText,
  },
  {
    title: "Kit da Marca",
    url: "/kit-marca",
    icon: Palette,
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
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
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
          <SidebarGroupLabel>Calculadoras</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calculatorMenuItems.map((item) => {
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
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementMenuItems.map((item) => {
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
            <Link href="/configuracoes">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
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
