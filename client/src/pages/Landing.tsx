import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Users,
  Target,
  Zap,
  Shield,
  Calculator,
  ClipboardCheck,
  TrendingUp,
  Mail,
  Handshake,
  UserCheck,
} from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiWhatsapp, SiGoogle, SiYoutube, SiX } from "react-icons/si";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import logoMcg from "@assets/logo_mcg_principal.png";
import ChatWidget from "@/components/ChatWidget";

const features = [
  {
    icon: Calculator,
    title: "Calculadoras",
    description: "Cálculo preciso de frete e armazenagem com ICMS, GRIS, ADV e impostos",
    href: "/calculadoras",
    highlighted: true,
  },
  {
    icon: ClipboardCheck,
    title: "Checklist Completo",
    description: "15 departamentos com questões estruturadas para diagnóstico completo da operação",
    href: "/login",
    highlighted: false,
  },
  {
    icon: Users,
    title: "CRM Integrado",
    description: "Gestão completa de clientes com pipeline visual e acompanhamento de propostas",
    href: "/login",
    highlighted: false,
  },
  {
    icon: BarChart3,
    title: "Dashboard Gerencial",
    description: "Visualização em tempo real dos indicadores da sua operação comercial",
    href: "/login",
    highlighted: false,
  },
  {
    icon: TrendingUp,
    title: "Módulo Financeiro",
    description: "Controle de contas a pagar e receber com gestão de encargos contábeis",
    href: "/login",
    highlighted: false,
  },
  {
    icon: Shield,
    title: "Multi-empresas",
    description: "Arquitetura segura com isolamento completo de dados entre empresas",
    href: "/login",
    highlighted: false,
  },
];

const services = [
  {
    title: "Consultoria Comercial",
    description: "Acompanhamento especializado para transformar sua operação comercial em logística, com mentoria contínua e suporte estratégico.",
    features: [
      "Mentoria executiva personalizada",
      "Análise de mercado e concorrência",
      "Estratégias de expansão comercial",
      "Acompanhamento de metas e KPIs",
    ],
    icon: Handshake,
    highlighted: true,
  },
  {
    title: "Diagnóstico de Maturidade Comercial",
    description: "Avaliação completa da estrutura comercial da sua empresa de logística, identificando pontos de melhoria e oportunidades de crescimento.",
    features: [
      "Análise de 15 departamentos",
      "Checklist personalizado por segmento",
      "Relatório detalhado de gaps",
      "Plano de ação recomendado",
    ],
    icon: Target,
    highlighted: false,
  },
  {
    title: "Estruturação de Vendas",
    description: "Implementação de processos comerciais eficientes, desde a prospecção até o fechamento de contratos de transporte e armazenagem.",
    features: [
      "Definição de processos comerciais",
      "Treinamento da equipe de vendas",
      "Implantação de CRM",
      "Acompanhamento de resultados",
    ],
    icon: Zap,
    highlighted: false,
  },
];

export default function Landing() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const existingScript = document.getElementById("ra-embed-reputation");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "ra-embed-reputation";
      script.src = "https://s3.amazonaws.com/raichu-beta/selos/bundle.js";
      script.setAttribute("data-id", "Ul8zMWxjWHRCU05IcTBHUTptY2ctY29uc3VsdG9yaWEtbHRkYQ==");
      script.setAttribute("data-target", "reputation-ra");
      script.setAttribute("data-model", "1");
      const container = document.getElementById("reputation-ra");
      if (container) {
        container.appendChild(script);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-logo-header">
            <img 
              src={logoMcg} 
              alt="MCG Consultoria" 
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">MCG</span>
              <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/diagnóstico" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Diagnóstico Grátis
            </Link>
            <Link href="/calculadora-frete" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Calculadora Frete
            </Link>
            <Link href="/calculadora-armazenagem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Calculadora Armazenagem
            </Link>
            <Link href="/planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-planos-nav">
              Planos
            </Link>
            <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fale Conosco
            </a>
            <div className="flex items-center gap-2 ml-2">
              <a
                href="https://wa.me/5541995323362?text=Estou%20vindo%20da%20sua%20pagina%20inicial%20e%20gostaria%20de%20conhecer%20mais%20sobre%20a%20MCG%20Consultoria"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 transition-colors"
                title="WhatsApp"
                data-testid="link-whatsapp-header"
              >
                <SiWhatsapp className="h-4 w-4 text-white" />
              </a>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md bg-foreground/10 hover:bg-foreground/20 transition-colors"
                title="Google Play"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
              </a>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md bg-foreground/10 hover:bg-foreground/20 transition-colors"
                title="App Store"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
              </a>
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <Link href="/dashboard">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-muted/50 cursor-pointer" data-testid="button-logged-in">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Logado</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <Button data-testid="button-login">Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen flex items-center justify-center pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="relative max-w-screen-xl mx-auto px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Building2 className="h-4 w-4" />
              Modelo Completo de Gestão Comercial
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
              Gestão comercial inteligente para{" "}
              <span className="text-primary">operações logísticas</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Sistema completo para gestão de empresas do setor logístico. CRM, calculadoras, 
              checklists e controle financeiro em uma única plataforma.
            </p>
            <div className="flex flex-col items-center justify-center gap-4">
              <Link href="/diagnóstico">
                <Button size="lg" className="gap-2" data-testid="button-diagnostic">
                  Faça Diagnóstico Grátis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex flex-row items-center gap-4">
                <Link href="/calculadora-frete">
                  <Button size="lg" variant="outline" className="gap-2" data-testid="button-calc-frete">
                    Calculadora de Frete
                  </Button>
                </Link>
                <Link href="/calculadora-armazenagem">
                  <Button size="lg" variant="outline" className="gap-2" data-testid="button-calc-armazenagem">
                    Calculadora de Armazenagem
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground">Anos de experiência</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Empresas atendidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">15</div>
                <div className="text-sm text-muted-foreground">Departamentos analisados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">27</div>
                <div className="text-sm text-muted-foreground">Estados cobertos</div>
              </div>
            </div>

          </div>
        </section>

        <section id="serviços" className="py-20 bg-muted/30">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Serviços</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Soluções especializadas para empresas de transporte e armazenagem que buscam 
                excelência comercial
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Card 
                  key={service.title} 
                  className={`overflow-hidden ${service.highlighted ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                >
                  {service.highlighted && (
                    <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                      Destaque
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-6 ${service.highlighted ? 'bg-primary' : 'bg-primary/10'}`}>
                      <service.icon className={`h-7 w-7 ${service.highlighted ? 'text-primary-foreground' : 'text-primary'}`} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    <ul className="space-y-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="py-20">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Funcionalidades do Sistema</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa para gerenciar sua operação comercial em um só lugar
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Link key={feature.title} href={feature.href}>
                  <Card className={`hover-elevate cursor-pointer h-full ${feature.highlighted ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}>
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.highlighted ? 'bg-green-500 dark:bg-green-600' : 'bg-primary/10'}`}>
                        <feature.icon className={`h-6 w-6 ${feature.highlighted ? 'text-white' : 'text-primary'}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-screen-xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para transformar sua gestão comercial?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Comece agora e tenha acesso ao sistema completo de gestão para empresas de logística
            </p>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-start">
                Acessar o sistema
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section id="contato" className="py-20 bg-muted/30">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Entre em Contato</h2>
              <p className="text-muted-foreground">Fale conosco para saber mais sobre nossos serviços</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <a href="https://wa.me/5541995323362?text=Estou%20vindo%20da%20sua%20pagina%20inicial%20e%20gostaria%20de%20conhecer%20mais%20sobre%20a%20MCG%20Consultoria" target="_blank" rel="noopener noreferrer">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <SiWhatsapp className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">(41) 9 9532-3362</p>
                  </CardContent>
                </Card>
              </a>
              <a href="mailto:comercial@mcgconsultoria.com.br">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">comercial@mcgconsultoria.com.br</p>
                  </CardContent>
                </Card>
              </a>
              <a href="https://www.youtube.com/@mcgconsultoriacomercial" target="_blank" rel="noopener noreferrer">
                <Card className="hover-elevate cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <SiYoutube className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">PodBlog MCG</h3>
                    <p className="text-sm text-muted-foreground">Canal no YouTube</p>
                  </CardContent>
                </Card>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4" data-testid="link-logo-footer">
                <img 
                  src={logoMcg} 
                  alt="MCG Consultoria" 
                  className="h-10 w-10 object-contain"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-tight">MCG</span>
                  <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground mb-2">
                Consultoria especializada em logística com foco na área comercial.
              </p>
              <p className="text-xs text-muted-foreground">
                CNPJ: 08.670.140/0001-89
              </p>
              <div className="flex items-center gap-2 mt-3">
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-md text-xs hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  Google Play
                </a>
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-md text-xs hover:opacity-90 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                  </svg>
                  App Store
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Serviços</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Diagnóstico Comercial</li>
                <li>Estruturação de Vendas</li>
                <li>Treinamentos</li>
                <li>Consultoria</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sistema</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>CRM</li>
                <li>Calculadoras</li>
                <li>Checklists</li>
                <li>Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Central de Ajuda</li>
                <li><a href="#contato" className="hover:text-foreground">Fale Conosco</a></li>
                <li><Link href="/termos" className="hover:text-foreground">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-foreground">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} MCG Consultoria. Todos os direitos reservados.
              </p>
              
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/mcgconsultoriacomercial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md bg-muted/50 flex items-center justify-center hover-elevate"
                  data-testid="link-facebook"
                  aria-label="Facebook"
                >
                  <SiFacebook className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://www.instagram.com/mcgconsultoriacomercial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md bg-muted/50 flex items-center justify-center hover-elevate"
                  data-testid="link-instagram"
                  aria-label="Instagram"
                >
                  <SiInstagram className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://www.linkedin.com/company/mcgconsultoriacomercial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md bg-muted/50 flex items-center justify-center hover-elevate"
                  data-testid="link-linkedin"
                  aria-label="LinkedIn"
                >
                  <SiLinkedin className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://x.com/mcgconsultoriac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md bg-muted/50 flex items-center justify-center hover-elevate"
                  data-testid="link-x-twitter"
                  aria-label="X (Twitter)"
                >
                  <SiX className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://www.google.com/maps/place/MCG+Consultoria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md bg-muted/50 flex items-center justify-center hover-elevate"
                  data-testid="link-google"
                  aria-label="Google Meu Negócio"
                >
                  <SiGoogle className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://www.youtube.com/@mcgconsultoriacomercial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-md bg-muted/50 flex items-center justify-center hover-elevate"
                  data-testid="link-youtube"
                  aria-label="YouTube"
                >
                  <SiYoutube className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <div 
                  id="reputation-ra" 
                  data-testid="badge-reclame-aqui"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Pagamento Seguro
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                  <Shield className="h-4 w-4 text-primary" />
                  LGPD Compliance
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                  <Shield className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  SSL/TLS
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ChatWidget 
        isAuthenticated={isAuthenticated} 
        userId={user?.id}
        companyId={user?.companyId ?? undefined}
        userEmail={user?.email}
        userName={user?.firstName || user?.email}
      />
    </div>
  );
}
