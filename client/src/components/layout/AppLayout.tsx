import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Link } from "wouter";

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
          <header className="h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-border bg-background sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              {showBackButton && !isDashboard && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  data-testid="button-back"
                  title="Voltar"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-lg font-semibold" data-testid="text-page-title">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild data-testid="button-new-access">
                <a href="/login" title="Acessar outra conta">
                  Novo Acesso
                </a>
              </Button>
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
