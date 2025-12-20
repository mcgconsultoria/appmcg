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
import Login from "@/pages/Login";
import Register from "@/pages/Register";
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
import Subscription from "@/pages/Subscription";
import MeetingRecords from "@/pages/MeetingRecords";
import CalendarPage from "@/pages/CalendarPage";
import TasksPage from "@/pages/TasksPage";
import ProjectsPage from "@/pages/ProjectsPage";
import RFI from "@/pages/RFI";
import BrandKit from "@/pages/BrandKit";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminComercial from "@/pages/admin/AdminComercial";
import AdminProjetos from "@/pages/admin/AdminProjetos";
import AdminFinanceiro from "@/pages/admin/AdminFinanceiro";
import AdminParcerias from "@/pages/admin/AdminParcerias";
import AdminConteudo from "@/pages/admin/AdminConteudo";
import AdminLogin from "@/pages/admin/AdminLogin";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "admin_mcg";

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
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Register} />
      {/* Admin routes - show login if not authenticated or not admin */}
      <Route path="/admin">
        {() => isAuthenticated && isAdmin ? <AdminDashboard /> : <AdminLogin />}
      </Route>
      <Route path="/admin/comercial">
        {() => isAuthenticated && isAdmin ? <AdminComercial /> : <AdminLogin />}
      </Route>
      <Route path="/admin/projetos">
        {() => isAuthenticated && isAdmin ? <AdminProjetos /> : <AdminLogin />}
      </Route>
      <Route path="/admin/financeiro">
        {() => isAuthenticated && isAdmin ? <AdminFinanceiro /> : <AdminLogin />}
      </Route>
      <Route path="/admin/parcerias">
        {() => isAuthenticated && isAdmin ? <AdminParcerias /> : <AdminLogin />}
      </Route>
      <Route path="/admin/conteudo">
        {() => isAuthenticated && isAdmin ? <AdminConteudo /> : <AdminLogin />}
      </Route>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/clientes" component={Clients} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/calendario" component={CalendarPage} />
          <Route path="/atas" component={MeetingRecords} />
          <Route path="/checklist" component={Checklist} />
          <Route path="/rfi" component={RFI} />
          <Route path="/tarefas" component={TasksPage} />
          <Route path="/projetos" component={ProjectsPage} />
          <Route path="/financeiro" component={Financial} />
          <Route path="/marketing" component={Marketing} />
          <Route path="/configuracoes" component={Settings} />
          <Route path="/assinatura" component={Subscription} />
          <Route path="/kit-marca" component={BrandKit} />
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
