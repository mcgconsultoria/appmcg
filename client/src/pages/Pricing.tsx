import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, Loader2, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

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
    features: [
      "Calculadora de Frete com ICMS",
      "Calculadora de Armazenagem",
      "3 calculos gratuitos",
    ],
    popular: false,
    priceId: null,
  },
  {
    name: "Profissional",
    description: "Todas as ferramentas para gestao comercial completa",
    price: 297,
    interval: "mes",
    features: [
      "Tudo do plano Gratuito",
      "Calculos ilimitados",
      "CRM de Clientes",
      "Pipeline de Vendas (Kanban)",
      "Checklists de 15 Departamentos",
      "Calendario Comercial",
      "Ata Plano de Acao",
      "Gestao Financeira",
      "Suporte por email",
    ],
    popular: true,
    priceId: null,
  },
  {
    name: "Corporativo",
    description: "Para operacoes em grande escala",
    price: 597,
    interval: "mes",
    features: [
      "Tudo do plano Profissional",
      "Multi-usuarios (ate 10)",
      "Gestao de Tarefas e Projetos",
      "Indicadores e Curva ABC",
      "Modulo de Marketing",
      "Integracoes personalizadas",
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
    description: "Checklists para 15 departamentos de logistica",
    price: 97,
    interval: "mes",
    priceId: null,
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();

  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ["/api/stripe/products"],
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
  });

  const plans = productsData?.data?.length
    ? productsData.data.map((product, index) => ({
        name: product.name,
        description: product.description || "",
        price: product.prices[0]?.unit_amount ? product.prices[0].unit_amount / 100 : 0,
        interval: product.prices[0]?.recurring?.interval === "month" ? "mês" : "ano",
        features: product.metadata?.features?.split(",") || [],
        popular: index === 1,
        priceId: product.prices[0]?.id,
      }))
    : defaultPlans;

  const handleSubscribe = (priceId: string | null) => {
    if (!priceId) {
      return;
    }
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    checkoutMutation.mutate(priceId);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">
            Escolha seu Plano
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comece gratuitamente com nossas calculadoras e faça upgrade quando precisar de mais recursos
          </p>
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
                    onClick={() => (window.location.href = "/calculadora-frete")}
                    data-testid={`button-plan-${index}`}
                  >
                    Começar Grátis
                  </Button>
                ) : (
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
                      "Assinar Agora"
                    )}
                  </Button>
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

          <div className="grid md:grid-cols-3 gap-6">
            {individualProducts.map((product, index) => (
              <Card key={index} className="flex flex-col" data-testid={`card-product-${index}`}>
                <CardHeader>
                  <CardTitle className="text-xl" data-testid={`text-product-name-${index}`}>
                    {product.name}
                  </CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div>
                    <span className="text-3xl font-bold" data-testid={`text-product-price-${index}`}>
                      R$ {product.price}
                    </span>
                    <span className="text-muted-foreground">/{product.interval}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSubscribe(product.priceId)}
                    disabled={checkoutMutation.isPending || !product.priceId}
                    data-testid={`button-product-${index}`}
                  >
                    {!product.priceId ? "Em Breve" : "Adquirir"}
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
              <Button className="w-full md:w-auto" size="lg" data-testid="button-consulting-contact">
                Solicitar Proposta
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Entre em contato para receber uma proposta personalizada para sua empresa
              </p>
            </CardFooter>
          </Card>
        </div>

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
