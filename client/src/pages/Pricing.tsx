import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
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
    description: "Acesso às calculadoras de frete e armazenagem",
    price: 0,
    interval: "sempre",
    features: [
      "Calculadora de Frete com ICMS",
      "Calculadora de Armazenagem",
      "Acesso ilimitado às calculadoras",
    ],
    popular: false,
    priceId: null,
  },
  {
    name: "Profissional",
    description: "Todas as ferramentas para gestão completa",
    price: 297,
    interval: "mês",
    features: [
      "Tudo do plano Gratuito",
      "CRM de Clientes",
      "Pipeline de Vendas (Kanban)",
      "Checklists de 15 Departamentos",
      "Gestão Financeira",
      "Materiais de Marketing",
      "Suporte por email",
    ],
    popular: true,
    priceId: null,
  },
  {
    name: "Empresarial",
    description: "Para operações em grande escala",
    price: 597,
    interval: "mês",
    features: [
      "Tudo do plano Profissional",
      "Multi-usuários (até 10)",
      "Relatórios avançados",
      "Integrações personalizadas",
      "Suporte prioritário",
      "Treinamento dedicado",
    ],
    popular: false,
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

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">Pagamento Seguro</h2>
          <p className="text-muted-foreground mb-6">
            Todos os pagamentos são processados de forma segura pelo Stripe.
            Aceitamos cartões de crédito, PIX e boleto bancário.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="px-4 py-2">
              Cartão de Crédito
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              PIX
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              Boleto Bancário
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
