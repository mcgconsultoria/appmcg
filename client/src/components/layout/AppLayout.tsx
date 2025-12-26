import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export function AppLayout({ children, title, subtitle, showBackButton = true }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation("/dashboard");
    }
  };

  const isDashboard = location === "/dashboard";

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-14 md:h-16 flex items-center justify-between gap-2 md:gap-4 px-3 md:px-6 border-b border-border bg-background sticky top-0 z-40">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                </TooltipTrigger>
                <TooltipContent>Menu</TooltipContent>
              </Tooltip>
              {showBackButton && !isDashboard && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBack}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voltar</TooltipContent>
                </Tooltip>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-lg font-semibold truncate" data-testid="text-page-title">{title}</h1>
                {subtitle && (
                  <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-notifications" className="hidden sm:flex">
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notificações</TooltipContent>
              </Tooltip>
              <ThemeToggle />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" asChild data-testid="button-new-access" className="hidden md:flex">
                    <a href="/login">
                      Novo Acesso
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Acessar outra conta</TooltipContent>
              </Tooltip>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
