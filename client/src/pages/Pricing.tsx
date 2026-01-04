import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, Loader2, Briefcase, ArrowRight, Lock, Send, ArrowLeft, Save } from "lucide-react";
import type { Client } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  prices: Price[];
  metadata: Record<string, string>;
}

const defaultPlans = [
  {
    name: "Gratuito",
    description: "Acesso as calculadoras de frete e armazenagem",
    price: 0,
    interval: "sempre",
    baseUsers: 1,
    additionalUserPrice: 0,
    features: [
      "Calculadora de Frete com ICMS",
      "Calculadora de Armazenagem",
      "3 calculos gratuitos",
      "1 usuario incluido",
    ],
    popular: false,
    priceId: null,
  },
  {
    name: "Profissional",
    description: "Todas as ferramentas para gestão comercial completa",
    price: 499,
    interval: "mes",
    baseUsers: 1,
    additionalUserPrice: 69,
    features: [
      "Tudo do plano Gratuito",
      "Calculos ilimitados",
      "CRM de Clientes",
      "Pipeline de Vendas (Kanban)",
      "Checklists de 18 Departamentos",
      "Calendario Comercial",
      "Ata Plano de Acao",
      "Gestao Financeira",
      "1 usuario incluido (+R$69/usuario adicional)",
      "Suporte por email",
    ],
    popular: true,
    priceId: null,
  },
  {
    name: "Corporativo",
    description: "Para operações em grande escala com múltiplas filiais",
    price: 1499,
    interval: "mes",
    baseUsers: 1,
    additionalUserPrice: 69,
    features: [
      "Tudo do plano Profissional",
      "Gestao de Tarefas e Projetos",
      "Indicadores e Curva ABC",
      "Modulo de Marketing",
      "Integracoes com ERP (KMM/QualP)",
      "Multi-empresas (Matriz/Filiais)",
      "1 usuario incluido (+R$69/usuario adicional)",
      "Suporte prioritario",
      "Treinamento dedicado",
    ],
    popular: false,
    priceId: null,
  },
];

const individualProducts = [
  {
    name: "Calculadora de Frete",
    description: "Calculo de frete com ICMS para 27 estados",
    price: 47,
    interval: "mes",
    priceId: null,
  },
  {
    name: "Calculadora de Armazenagem",
    description: "Calculo completo de custos de armazenagem",
    price: 47,
    interval: "mes",
    priceId: null,
  },
  {
    name: "Checklist Operacional",
    description: "Checklists para 20 departamentos de logística",
    price: 97,
    interval: "mes",
    priceId: null,
  },
  {
    name: "Ata Plano de Ação",
    description: "Registro de reuniões com itens de ação e PDF",
    price: 47,
    interval: "mes",
    priceId: null,
  },
  {
    name: "RFI",
    description: "Perfil técnico da empresa para participação em BIDs",
    price: 47,
    interval: "mes",
    priceId: null,
  },
];

const consultingPhases = [
  {
    id: "diagnóstico",
    name: "Diagnóstico",
    badge: "1ª Fase",
    duration: "1 mês",
    description: "Escopo, Estruturação In Loco, Acompanhamento On Line",
    requiresDiagnóstico: false,
    isExpansao: false,
  },
  {
    id: "implementação",
    name: "Implementação",
    badge: "2ª Fase",
    duration: "1 mês",
    description: "In Loco, On Line",
    requiresDiagnóstico: true,
    isExpansao: false,
  },
  {
    id: "execução",
    name: "Execução",
    badge: "3ª Fase",
    duration: "1 mês",
    description: "In Loco, On Line",
    requiresDiagnóstico: true,
    isExpansao: false,
  },
  {
    id: "expansao",
    name: "Expansão",
    badge: "4ª Fase",
    duration: "Contínuo",
    description: "On Line + Comissão sobre negócios fechados",
    requiresDiagnóstico: false,
    isExpansao: true,
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [consultingDialogOpen, setConsultingDialogOpen] = useState(false);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [consultingForm, setConsultingForm] = useState({
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [pendingSubscribe, setPendingSubscribe] = useState<string | null>(null);

  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ["/api/stripe/products"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await apiRequest("POST", "/api/stripe/checkout", { priceId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar assinatura",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    },
  });

  // Check for subscribe param after login redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscribeParam = urlParams.get('subscribe');
    if (subscribeParam && isAuthenticated) {
      // Clear the URL param and trigger checkout
      window.history.replaceState({}, '', '/planos');
      checkoutMutation.mutate(subscribeParam);
    } else if (subscribeParam) {
      setPendingSubscribe(subscribeParam);
    }
  }, [isAuthenticated]);

  const togglePhase = (phaseId: string) => {
    const phase = consultingPhases.find(p => p.id === phaseId);
    if (!phase) return;

    if (phase.requiresDiagnóstico && !selectedPhases.includes("diagnóstico")) {
      toast({
        title: "Fase não disponível",
        description: "Selecione primeiro a fase de Diagnóstico para habilitar esta fase.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPhases(prev => {
      if (prev.includes(phaseId)) {
        if (phaseId === "diagnóstico") {
          return prev.filter(id => id === "expansao" || id === "diagnóstico").filter(id => id !== "diagnóstico");
        }
        return prev.filter(id => id !== phaseId);
      }
      return [...prev, phaseId];
    });
  };

  const getSelectedPhasesInfo = () => {
    const phases = selectedPhases.map(phaseId => {
      const phase = consultingPhases.find(p => p.id === phaseId);
      return phase;
    }).filter(Boolean);
    
    const hasExpansao = phases.some(p => p?.isExpansao);
    
    return { phases, hasExpansao };
  };

  const consultingProposalMutation = useMutation({
    mutationFn: async () => {
      const { hasExpansao } = getSelectedPhasesInfo();
      
      const payload = {
        proposalType: "consulting_quote",
        contactName: consultingForm.contactName,
        email: consultingForm.email,
        phone: consultingForm.phone,
        message: consultingForm.message,
        phases: selectedPhases.map(phaseId => {
          const phase = consultingPhases.find(p => p.id === phaseId);
          return {
            id: phaseId,
            name: phase?.name,
            duration: phase?.duration,
          };
        }),
        hasExpansao,
      };
      return apiRequest("POST", "/api/consulting-quote-request", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consulting-quote-requests"] });
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Nossa equipe entrará em contato em breve com um orçamento personalizado.",
      });
      setConsultingDialogOpen(false);
      setSelectedPhases([]);
      setConsultingForm({
        contactName: "",
        email: "",
        phone: "",
        message: "",
      });
    },
    onError: () => {
      toast({ title: "Erro ao enviar solicitação", variant: "destructive" });
    },
  });

  const handleSubmitProposal = () => {
    if (selectedPhases.length === 0) {
      toast({
        title: "Selecione ao menos uma fase",
        description: "Escolha as fases de consultoria desejadas.",
        variant: "destructive",
      });
      return;
    }

    if (!consultingForm.contactName || !consultingForm.email) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    consultingProposalMutation.mutate();
  };

  const plans = productsData?.data?.length
    ? productsData.data
        .filter((product) => ["free", "professional", "enterprise"].includes(product.metadata?.plan_type || ""))
        .sort((a, b) => parseInt(a.metadata?.order || "99") - parseInt(b.metadata?.order || "99"))
        .map((product) => ({
          name: product.name,
          description: product.description || "",
          price: product.prices[0]?.unit_amount ? product.prices[0].unit_amount / 100 : 0,
          interval: product.prices[0]?.recurring?.interval === "month" ? "mês" : "ano",
          features: product.metadata?.features?.split(",") || [],
          popular: product.metadata?.popular === "true",
          priceId: product.prices[0]?.id,
        }))
    : defaultPlans;

  const addons = productsData?.data?.length
    ? productsData.data
        .filter((product) => product.metadata?.plan_type === "addon")
        .map((product) => ({
          name: product.name,
          description: product.description || "",
          price: product.prices[0]?.unit_amount ? product.prices[0].unit_amount / 100 : 0,
          interval: product.prices[0]?.recurring?.interval === "month" ? "mês" : "ano",
          priceId: product.prices[0]?.id,
        }))
    : individualProducts;

  const handleSubscribe = (priceId: string | null) => {
    if (!priceId) {
      return;
    }
    if (!isAuthenticated) {
      // Redirect to custom login page with return URL
      window.location.href = `/login?redirect=${encodeURIComponent(`/planos?subscribe=${priceId}`)}`;
      return;
    }
    checkoutMutation.mutate(priceId);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comece gratuitamente com nossas calculadoras e faça upgrade quando precisar de mais recursos
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-md text-sm font-medium">
            <Check className="h-4 w-4" />
            15 dias grátis para testar - cancele a qualquer momento sem custo
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}
              data-testid={`card-plan-${index}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                  Mais Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl" data-testid={`text-plan-name-${index}`}>
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold" data-testid={`text-plan-price-${index}`}>
                    {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  )}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.price === 0 ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = "/calculadoras")}
                    data-testid={`button-plan-${index}`}
                  >
                    Começar Grátis
                  </Button>
                ) : (
                  <div className="w-full space-y-2">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSubscribe(plan.priceId)}
                      disabled={checkoutMutation.isPending}
                      data-testid={`button-plan-${index}`}
                    >
                      {checkoutMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Testar 15 dias grátis"
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Cobrança inicia no 16º dia
                    </p>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-products-title">
              Produtos Avulsos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Precisa apenas de uma ferramenta especifica? Adquira individualmente
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-6">
            {addons.slice(0, 2).map((product, index) => (
              <Card key={index} className="flex flex-col" data-testid={`card-product-${index}`}>
                <CardHeader>
                  <CardTitle className="text-xl" data-testid={`text-product-name-${index}`}>
                    {product.name}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = "mailto:comercial@mcgconsultoria.com.br?subject=Consulta de Preço - " + encodeURIComponent(product.name)}
                    data-testid={`button-product-${index}`}
                  >
                    Consultar Preço
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {addons.slice(2).map((product, index) => (
              <Card key={index + 2} className="flex flex-col" data-testid={`card-product-${index + 2}`}>
                <CardHeader>
                  <CardTitle className="text-xl" data-testid={`text-product-name-${index + 2}`}>
                    {product.name}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = "mailto:comercial@mcgconsultoria.com.br?subject=Consulta de Preço - " + encodeURIComponent(product.name)}
                    data-testid={`button-product-${index + 2}`}
                  >
                    Consultar Preço
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-consulting-title">
              Serviço de Consultoria
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Acompanhamento especializado para estruturar e expandir sua operação comercial
            </p>
          </div>

          <Card className="max-w-4xl mx-auto" data-testid="card-consulting-service">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Consultoria Comercial Logística</CardTitle>
              <CardDescription>
                Metodologia exclusiva em 4 fases para transformar sua área comercial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <Badge variant="outline" className="mb-3">1ª Fase</Badge>
                  <h4 className="font-semibold mb-2">Diagnóstico</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Escopo</li>
                    <li>Estruturação In Loco</li>
                    <li>Acompanhamento On Line</li>
                  </ul>
                  <p className="text-xs text-primary mt-3 font-medium">1 mês</p>
                </div>
                
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <Badge variant="outline" className="mb-3">2ª Fase</Badge>
                  <h4 className="font-semibold mb-2">Implementação</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>In Loco</li>
                    <li>On Line</li>
                  </ul>
                  <p className="text-xs text-primary mt-3 font-medium">1 mês</p>
                </div>
                
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <Badge variant="outline" className="mb-3">3ª Fase</Badge>
                  <h4 className="font-semibold mb-2">Execução</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>In Loco</li>
                    <li>On Line</li>
                  </ul>
                  <p className="text-xs text-primary mt-3 font-medium">1 mês</p>
                </div>
                
                <div className="text-center p-4 rounded-md bg-muted/50">
                  <Badge variant="outline" className="mb-3">4ª Fase</Badge>
                  <h4 className="font-semibold mb-2">Expansão</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>On Line</li>
                  </ul>
                  <p className="text-xs text-primary mt-3 font-medium">Contínuo</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full md:w-auto" 
                size="lg" 
                data-testid="button-consulting-contact"
                onClick={() => setConsultingDialogOpen(true)}
              >
                Solicitar Proposta
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Selecione as fases desejadas e receba uma proposta personalizada
              </p>
            </CardFooter>
          </Card>
        </div>

        <Dialog open={consultingDialogOpen} onOpenChange={setConsultingDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Solicitar Proposta de Consultoria</DialogTitle>
              <DialogDescription>
                Selecione as fases desejadas e preencha seus dados para receber uma proposta personalizada
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <Label className="text-base font-semibold mb-4 block">Selecione as Fases</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {consultingPhases.map((phase) => {
                    const isSelected = selectedPhases.includes(phase.id);
                    const isLocked = phase.requiresDiagnóstico && !selectedPhases.includes("diagnóstico");
                    
                    return (
                      <div
                        key={phase.id}
                        onClick={() => !isLocked && togglePhase(phase.id)}
                        className={`
                          relative p-4 rounded-md border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? "border-primary bg-primary/5" 
                            : isLocked 
                              ? "border-muted bg-muted/30 cursor-not-allowed opacity-60" 
                              : "border-border hover:border-primary/50"
                          }
                        `}
                        data-testid={`phase-${phase.id}`}
                      >
                        {isLocked && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            checked={isSelected}
                            disabled={isLocked}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Badge variant="outline" className="mb-2 text-xs">
                              {phase.badge}
                            </Badge>
                            <h4 className="font-semibold text-sm">{phase.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {phase.description}
                            </p>
                            <p className="text-xs text-primary mt-2 font-medium">{phase.duration}</p>
                          </div>
                        </div>
                        {isLocked && (
                          <p className="text-xs text-destructive mt-2">
                            Requer Diagnóstico
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {selectedPhases.length > 0 && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">
                      {selectedPhases.length} fase(s) selecionada(s)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Você receberá um orçamento personalizado por email
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">Detalhes das Fases</Label>
                <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
                  <p><strong className="text-foreground">Diagnóstico:</strong> [Aguardando descrição]</p>
                  <p><strong className="text-foreground">Implementação:</strong> [Aguardando descrição]</p>
                  <p><strong className="text-foreground">Execução:</strong> [Aguardando descrição]</p>
                  <p><strong className="text-foreground">Expansão:</strong> [Aguardando descrição] + comissão sobre negócios fechados</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">Dados para Contato</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nome Completo *</Label>
                    <Input
                      id="contactName"
                      value={consultingForm.contactName}
                      onChange={(e) => setConsultingForm(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="João Silva"
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={consultingForm.email}
                      onChange={(e) => setConsultingForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contato@empresa.com.br"
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone">Telefone / WhatsApp</Label>
                    <Input
                      id="phone"
                      value={consultingForm.phone}
                      onChange={(e) => setConsultingForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      data-testid="input-phone"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="message">Mensagem Adicional</Label>
                  <Textarea
                    id="message"
                    value={consultingForm.message}
                    onChange={(e) => setConsultingForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Conte-nos sobre sua empresa e suas necessidades..."
                    rows={3}
                    data-testid="input-message"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setConsultingDialogOpen(false)}
                data-testid="button-cancel-proposal"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitProposal}
                disabled={consultingProposalMutation.isPending}
                data-testid="button-submit-proposal"
              >
                <Save className="h-4 w-4 mr-2" />
                {consultingProposalMutation.isPending ? "Criando..." : "Criar Proposta"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Pagamento Seguro</h2>
          <p className="text-muted-foreground mb-6">
            Todos os pagamentos sao processados de forma segura pelo Stripe.
            Aceitamos cartoes de credito, PIX e boleto bancario.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="px-4 py-2">
              Cartao de Credito
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              PIX
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              Boleto Bancario
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
