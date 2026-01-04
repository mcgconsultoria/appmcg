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
import SavedRoutes from "@/pages/SavedRoutes";
import Checklist from "@/pages/Checklist";
import FreightCalculator from "@/pages/FreightCalculator";
import StorageCalculator from "@/pages/StorageCalculator";
import Financial from "@/pages/Financial";
import Marketing from "@/pages/Marketing";
import Settings from "@/pages/Settings";
import AuditLogs from "@/pages/AuditLogs";
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
import AdminCliente from "@/pages/AdminCliente";
import Support from "@/pages/Support";
import Reports from "@/pages/Reports";
import Vendedores from "@/pages/Vendedores";
import Operações from "@/pages/Operacoes";
import IndicadoresPreVendas from "@/pages/IndicadoresPreVendas";
import IndicadoresVendas from "@/pages/IndicadoresVendas";
import IndicadoresPosVendas from "@/pages/IndicadoresPosVendas";
import Pesquisas from "@/pages/Pesquisas";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import PendingApprovals from "@/pages/admin/PendingApprovals";
import AdminComercial from "@/pages/admin/AdminComercial";
import AdminProjetos from "@/pages/admin/AdminProjetos";
import AdminFinanceiro from "@/pages/admin/AdminFinanceiro";
import AdminParcerias from "@/pages/admin/AdminParcerias";
import AdminConteudo from "@/pages/admin/AdminConteudo";
import AdminContratos from "@/pages/admin/AdminContratos";
import AdminTemplates from "@/pages/admin/AdminTemplates";
import AdminCampanhaPiloto from "@/pages/admin/AdminCampanhaPiloto";
import AdminDiagnósticoLeads from "@/pages/admin/AdminDiagnosticoLeads";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDRE from "@/pages/admin/AdminDRE";
import AdminCentroCustos from "@/pages/admin/AdminCentroCustos";
import AdminBancos from "@/pages/admin/AdminBancos";
import AdminCertificados from "@/pages/admin/AdminCertificados";
import AdminLançamentos from "@/pages/admin/AdminLancamentos";
import AdminRelatorioDRE from "@/pages/admin/AdminRelatorioDRE";
import AdminLoja from "@/pages/admin/AdminLoja";
import AdminWhatsApp from "@/pages/admin/AdminWhatsApp";
import AdminBackup from "@/pages/admin/AdminBackup";
import PessoalDashboard from "@/pages/pessoal/PessoalDashboard";
import GestaoFinanceira from "@/pages/pessoal/GestaoFinanceira";
import PessoalIRPF from "@/pages/pessoal/IRPF";
import AdminIRPJ from "@/pages/admin/IRPJ";
import MeuPlano from "@/pages/admin/MeuPlano";
import ContasBancariasPF from "@/pages/pessoal/ContasBancariasPF";
import CentrosCustoPF from "@/pages/pessoal/CentrosCustoPF";
import PlanoContasPF from "@/pages/pessoal/PlanoContasPF";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import BibliotecaChecklists from "@/pages/BibliotecaChecklists";
import Ebook from "@/pages/Ebook";
import ManualApp from "@/pages/ManualApp";
import Calculadoras from "@/pages/Calculadoras";
import FluxogramaComercial from "@/pages/FluxogramaComercial";
import Brindes from "@/pages/Brindes";
import DiagnósticoComercial from "@/pages/DiagnosticoComercial";
import CampanhaPiloto from "@/pages/CampanhaPiloto";
import Logout from "@/pages/Logout";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "admin_mcg";
  const isMcgAdmin = user?.role === "admin_mcg";

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
      <Route path="/diagnóstico" component={DiagnósticoComercial} />
      <Route path="/campanha-piloto" component={CampanhaPiloto} />
      <Route path="/calculadoras" component={Calculadoras} />
      <Route path="/calculadora-frete" component={FreightCalculator} />
      <Route path="/calculadora-armazenagem" component={StorageCalculator} />
      <Route path="/planos" component={Pricing} />
      <Route path="/privacidade" component={Privacy} />
      <Route path="/termos" component={Terms} />
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Register} />
      <Route path="/esqueci-senha" component={ForgotPassword} />
      <Route path="/redefinir-senha" component={ResetPassword} />
      <Route path="/logout" component={Logout} />
      {/* Admin routes - show login if not authenticated or not admin */}
      <Route path="/admin">
        {() => isAuthenticated && isAdmin ? <AdminDashboard /> : <AdminLogin />}
      </Route>
      <Route path="/admin/aguardando-aprovacao">
        {() => isAuthenticated && isMcgAdmin ? <PendingApprovals /> : <AdminLogin />}
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
      <Route path="/admin/contratos">
        {() => isAuthenticated && isAdmin ? <AdminContratos /> : <AdminLogin />}
      </Route>
      <Route path="/admin/kit-marca">
        {() => isAuthenticated && isAdmin ? <BrandKit isAdmin /> : <AdminLogin />}
      </Route>
      <Route path="/admin/templates">
        {() => isAuthenticated && isAdmin ? <AdminTemplates /> : <AdminLogin />}
      </Route>
      <Route path="/admin/campanha-piloto">
        {() => isAuthenticated && isAdmin ? <AdminCampanhaPiloto /> : <AdminLogin />}
      </Route>
      <Route path="/admin/leads-diagnóstico">
        {() => isAuthenticated && isAdmin ? <AdminDiagnósticoLeads /> : <AdminLogin />}
      </Route>
      <Route path="/admin/dre">
        {() => isAuthenticated && isAdmin ? <AdminDRE /> : <AdminLogin />}
      </Route>
      <Route path="/admin/centros-custo">
        {() => isAuthenticated && isAdmin ? <AdminCentroCustos /> : <AdminLogin />}
      </Route>
      <Route path="/admin/bancos">
        {() => isAuthenticated && isAdmin ? <AdminBancos /> : <AdminLogin />}
      </Route>
      <Route path="/admin/certificados">
        {() => isAuthenticated && isAdmin ? <AdminCertificados /> : <AdminLogin />}
      </Route>
      <Route path="/admin/lançamentos">
        {() => isAuthenticated && isAdmin ? <AdminLançamentos /> : <AdminLogin />}
      </Route>
      <Route path="/admin/relatorio-dre">
        {() => isAuthenticated && isAdmin ? <AdminRelatorioDRE /> : <AdminLogin />}
      </Route>
      <Route path="/admin/loja">
        {() => isAuthenticated && isAdmin ? <AdminLoja /> : <AdminLogin />}
      </Route>
      <Route path="/admin/whatsapp">
        {() => isAuthenticated && isAdmin ? <AdminWhatsApp /> : <AdminLogin />}
      </Route>
      <Route path="/admin/backup">
        {() => isAuthenticated && isMcgAdmin ? <AdminBackup /> : <AdminLogin />}
      </Route>
      <Route path="/admin/meu-plano">
        {() => isAuthenticated && isAdmin ? <MeuPlano /> : <AdminLogin />}
      </Route>
      <Route path="/pessoal">
        {() => isAuthenticated && isAdmin ? <PessoalDashboard /> : <AdminLogin />}
      </Route>
      <Route path="/pessoal/financeiro">
        {() => isAuthenticated && isAdmin ? <GestaoFinanceira /> : <AdminLogin />}
      </Route>
      <Route path="/pessoal/bancos">
        {() => isAuthenticated && isAdmin ? <ContasBancariasPF /> : <AdminLogin />}
      </Route>
      <Route path="/pessoal/centros-custo">
        {() => isAuthenticated && isAdmin ? <CentrosCustoPF /> : <AdminLogin />}
      </Route>
      <Route path="/pessoal/plano-contas">
        {() => isAuthenticated && isAdmin ? <PlanoContasPF /> : <AdminLogin />}
      </Route>
      <Route path="/pessoal/irpf">
        {() => isAuthenticated && isAdmin ? <PessoalIRPF /> : <AdminLogin />}
      </Route>
      <Route path="/admin/irpj">
        {() => isAuthenticated && isAdmin ? <AdminIRPJ /> : <AdminLogin />}
      </Route>
      <Route path="/landing" component={Landing} />
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/clientes" component={Clients} />
          <Route path="/vendedores" component={Vendedores} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/rotas" component={SavedRoutes} />
          <Route path="/calendário" component={CalendarPage} />
          <Route path="/atas" component={MeetingRecords} />
          <Route path="/checklist" component={Checklist} />
          <Route path="/biblioteca" component={BibliotecaChecklists} />
          <Route path="/ebook" component={Ebook} />
          <Route path="/manual-app" component={ManualApp} />
          <Route path="/fluxograma" component={FluxogramaComercial} />
          <Route path="/brindes" component={Brindes} />
          <Route path="/rfi" component={RFI} />
          <Route path="/tarefas" component={TasksPage} />
          <Route path="/projetos" component={ProjectsPage} />
          <Route path="/relatórios" component={Reports} />
          <Route path="/indicadores-pre-vendas" component={IndicadoresPreVendas} />
          <Route path="/indicadores-vendas" component={IndicadoresVendas} />
          <Route path="/indicadores-pos-vendas" component={IndicadoresPosVendas} />
          <Route path="/operações" component={Operações} />
          <Route path="/marketing" component={Marketing} />
          <Route path="/configurações" component={Settings} />
          <Route path="/assinatura" component={Subscription} />
          <Route path="/pesquisas" component={Pesquisas} />
          <Route path="/admin-cliente" component={AdminCliente} />
          <Route path="/logs-auditoria" component={AuditLogs} />
          <Route path="/suporte" component={Support} />
          <Route path="/faleconosco" component={Support} />
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
