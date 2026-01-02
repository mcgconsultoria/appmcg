import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, ArrowLeft, AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
}

interface SubscriptionStatus {
  daysUntilAccessLoss: number | null;
  renewalDue: boolean;
  renewalDueDate: string | null;
  renewalPrice: number | null;
  cancellationEffectiveDate: string | null;
}

export function AppLayout({ children, title, subtitle, showBackButton = true }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const [dismissedAccessWarning, setDismissedAccessWarning] = useState(false);
  const [dismissedRenewalAlert, setDismissedRenewalAlert] = useState(false);
  
  const { data: subscription } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
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
  
  // Show global alerts for access loss or renewal (tracked separately)
  const showAccessWarning = !dismissedAccessWarning && 
    subscription?.daysUntilAccessLoss !== null && 
    subscription?.daysUntilAccessLoss !== undefined &&
    subscription.daysUntilAccessLoss <= 7;
    
  const showRenewalAlert = !dismissedRenewalAlert &&
    subscription?.renewalDue &&
    !showAccessWarning;

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
            {showAccessWarning && (
              <Alert variant="destructive" className="mb-4" data-testid="alert-global-access-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between gap-2 flex-wrap">
                  <span>
                    {subscription?.daysUntilAccessLoss !== null && subscription.daysUntilAccessLoss <= 0 
                      ? "Seu acesso expirou. Entre em contato com o suporte."
                      : `Seu acesso expira em ${subscription?.daysUntilAccessLoss} dia(s). Após essa data, você não poderá mais acessar o sistema.`
                    }
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/meu-plano">Ver Detalhes</Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDismissedAccessWarning(true)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {showRenewalAlert && (
              <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" data-testid="alert-global-renewal">
                <RefreshCw className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="flex items-center justify-between gap-2 flex-wrap text-yellow-800 dark:text-yellow-200">
                  <span>
                    Sua assinatura vence em breve. Aprove a renovação para continuar usando o sistema.
                    {subscription?.renewalPrice && (
                      <span className="font-medium"> Novo valor: R$ {(subscription.renewalPrice / 100).toFixed(2)}/mês</span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/meu-plano">Aprovar Renovação</Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDismissedRenewalAlert(true)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
