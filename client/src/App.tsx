import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import CookieConsent from "@/components/CookieConsent";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Pipeline from "@/pages/Pipeline";
import Checklist from "@/pages/Checklist";
import FreightCalculator from "@/pages/FreightCalculator";
import StorageCalculator from "@/pages/StorageCalculator";
import Financial from "@/pages/Financial";
import Marketing from "@/pages/Marketing";
import Settings from "@/pages/Settings";
import Pricing from "@/pages/Pricing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-lg bg-primary/20" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/calculadora-frete" component={FreightCalculator} />
      <Route path="/calculadora-armazenagem" component={StorageCalculator} />
      <Route path="/planos" component={Pricing} />
      <Route path="/privacidade" component={Privacy} />
      <Route path="/termos" component={Terms} />
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/clientes" component={Clients} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/checklist" component={Checklist} />
          <Route path="/financeiro" component={Financial} />
          <Route path="/marketing" component={Marketing} />
          <Route path="/configuracoes" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
