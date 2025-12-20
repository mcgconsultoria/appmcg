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
} from "lucide-react";
import { SiFacebook, SiInstagram, SiLinkedin, SiWhatsapp, SiGoogle, SiYoutube } from "react-icons/si";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoMcg from "@assets/logo_mcg_principal.png";

const features = [
  {
    icon: ClipboardCheck,
    title: "Checklist Completo",
    description: "15 departamentos com questões estruturadas para diagnóstico completo da operação",
    href: "/login",
  },
  {
    icon: Calculator,
    title: "Calculadoras",
    description: "Cálculo preciso de frete e armazenagem com ICMS, GRIS, ADV e impostos",
    href: "/calculadora-frete",
  },
  {
    icon: Users,
    title: "CRM Integrado",
    description: "Gestão completa de clientes com pipeline visual e acompanhamento de propostas",
    href: "/login",
  },
  {
    icon: BarChart3,
    title: "Dashboard Gerencial",
    description: "Visualização em tempo real dos indicadores da sua operação comercial",
    href: "/login",
  },
  {
    icon: TrendingUp,
    title: "Módulo Financeiro",
    description: "Controle de contas a pagar e receber com gestão de encargos contábeis",
    href: "/login",
  },
  {
    icon: Shield,
    title: "Multi-empresas",
    description: "Arquitetura segura com isolamento completo de dados entre empresas",
    href: "/planos",
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
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculadora-frete" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Calculadora Frete
            </Link>
            <Link href="/calculadora-armazenagem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Calculadora Armazenagem
            </Link>
            <Link href="/planos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </Link>
            <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button data-testid="button-login">Entrar</Button>
            </Link>
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
              Transforme sua{" "}
              <span className="text-primary">operação comercial</span>{" "}
              em logística
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Sistema completo para gestão de empresas do setor logístico. CRM, calculadoras, 
              checklists e controle financeiro em uma única plataforma.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/calculadora-frete">
                <Button size="lg" className="gap-2" data-testid="button-start-free">
                  Calculadora Grátis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/planos">
                <Button size="lg" variant="outline" data-testid="button-learn-more">
                  Ver Planos
                </Button>
              </Link>
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

        <section id="servicos" className="py-20 bg-muted/30">
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
                  <Card className="hover-elevate cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-primary" />
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
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a href="https://wa.me/5541995323362" target="_blank" rel="noopener noreferrer">
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
            </div>
            <div className="text-center mt-8">
              <p className="text-lg font-semibold mb-4">PodBlog MCG</p>
              <a 
                href="https://www.youtube.com/@mcgconsultoriacomercial" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover-elevate"
              >
                <SiYoutube className="h-6 w-6 text-white" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
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
              <p className="text-sm text-muted-foreground mb-2">
                Consultoria especializada em logística com foco na área comercial.
              </p>
              <p className="text-xs text-muted-foreground">
                CNPJ: 08.670.140/0001-89
              </p>
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
                <li>Contato</li>
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

              <div className="flex items-center gap-4 flex-wrap justify-center">
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
    </div>
  );
}
