import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  DollarSign,
  Handshake,
  FileText,
  ArrowLeft,
  LogOut,
  Megaphone,
  Palette,
  PenTool,
  Library,
  Building2,
  Shield,
  PieChart,
  Landmark,
  BarChart3,
  User,
} from "lucide-react";
import logoMcg from "@assets/logo_mcg_principal.png";

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Gestão Comercial",
    url: "/admin/comercial",
    icon: Users,
  },
  {
    title: "Projetos",
    url: "/admin/projetos",
    icon: FolderKanban,
  },
  {
    title: "Financeiro",
    url: "/admin/financeiro",
    icon: DollarSign,
  },
  {
    title: "Parcerias",
    url: "/admin/parcerias",
    icon: Handshake,
  },
  {
    title: "Conteúdo",
    url: "/admin/conteudo",
    icon: FileText,
  },
  {
    title: "Contratos Digitais",
    url: "/admin/contratos",
    icon: PenTool,
  },
  {
    title: "Biblioteca Templates",
    url: "/admin/templates",
    icon: Library,
  },
  {
    title: "Admin Pessoal (CEO)",
    url: "/pessoal",
    icon: User,
  },
];

const marketingMenuItems = [
  {
    title: "Kit da Marca",
    url: "/admin/kit-marca",
    icon: Palette,
  },
  {
    title: "Campanha Piloto",
    url: "/admin/campanha-piloto",
    icon: Megaphone,
  },
  {
    title: "Leads Diagnóstico",
    url: "/admin/leads-diagnóstico",
    icon: Users,
  },
];

const financeConfigItems = [
  {
    title: "Plano de Contas DRE",
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
    title: "Certificados Digitais",
    url: "/admin/certificados",
    icon: Shield,
  },
  {
    title: "Lançamentos",
    url: "/admin/lançamentos",
    icon: FileText,
  },
  {
    title: "Relatorio DRE",
    url: "/admin/relatorio-dre",
    icon: BarChart3,
  },
];


interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <img
                src={logoMcg}
                alt="MCG"
                className="h-8 w-8 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">MCG Admin</span>
                <span className="text-xs text-muted-foreground leading-tight">Gestão Interna</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url || (item.url !== "/admin" && location.startsWith(item.url))}
                        data-testid={item.url === "/pessoal" ? "link-admin-pessoal" : undefined}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Marketing</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {marketingMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url || location.startsWith(item.url)}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Config. Financeiras</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {financeConfigItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url || location.startsWith(item.url)}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar ao Sistema</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName || user?.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Administrador
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/logout">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                      data-testid="button-admin-logout"
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

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-3 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
                </TooltipTrigger>
                <TooltipContent>Menu</TooltipContent>
              </Tooltip>
              <h1 className="text-lg font-semibold">ADMIN MCG</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-6 bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
