import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Truck,
  CreditCard,
  Settings,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Crown,
  Zap,
  Building2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const planFeatures: Record<string, string[]> = {
  free: [
    "Calculadora de Frete",
    "Calculadora de Armazenagem",
    "ICMS para 27 estados",
    "3 calculos gratuitos",
  ],
  starter: [
    "Tudo do plano Gratuito",
    "CRM com ate 50 clientes",
    "Pipeline visual",
    "Checklists basicos",
    "Suporte por email",
  ],
  professional: [
    "Tudo do plano Essencial",
    "CRM ilimitado",
    "15 departamentos de Checklist",
    "Modulo Financeiro",
    "Calendario Comercial",
    "Ata Plano de Acao",
    "Relatorios avancados",
    "Suporte prioritario",
  ],
  enterprise: [
    "Tudo do plano Profissional",
    "Multi-empresas",
    "API de integracao",
    "Modulo de Marketing",
    "Gestao de Tarefas e Projetos",
    "Indicadores e Curva ABC",
    "Gerente de conta dedicado",
    "SLA personalizado",
  ],
};

const planIcons: Record<string, any> = {
  free: Zap,
  starter: Zap,
  professional: Crown,
  enterprise: Building2,
};

const planNames: Record<string, string> = {
  free: "Gratuito",
  starter: "Essencial",
  professional: "Profissional",
  enterprise: "Corporativo",
};

function getStatusBadge(status: string | null | undefined) {
  switch (status) {
    case "active":
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
    case "trialing":
      return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Período de Teste</Badge>;
    case "past_due":
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Pagamento Pendente</Badge>;
    case "canceled":
      return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Cancelado</Badge>;
    case "free":
    default:
      return <Badge variant="outline">Gratuito</Badge>;
  }
}

export default function Subscription() {
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/stripe/portal");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível acessar o portal",
        variant: "destructive",
      });
    },
  });

  const currentPlan = user?.subscriptionStatus || "free";
  const PlanIcon = planIcons[currentPlan] || Zap;
  const features = planFeatures[currentPlan] || planFeatures.free;

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">MCG</span>
              <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minha Assinatura</h1>
            <p className="text-muted-foreground">
              Gerencie seu plano e informações de pagamento
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlanIcon className="h-5 w-5 text-primary" />
                  Plano Atual
                </CardTitle>
                <CardDescription>
                  Seu plano e status de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{planNames[currentPlan] || "Gratuito"}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  {getStatusBadge(user?.subscriptionStatus)}
                </div>
                
                <Separator />
                
                <div>
                  <p className="font-medium mb-2">Recursos incluídos:</p>
                  <ul className="space-y-1">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {user?.subscriptionEndDate && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Próxima cobrança: {new Date(user.subscriptionEndDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Pagamento
                </CardTitle>
                <CardDescription>
                  Gerencie seus métodos de pagamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.stripeCustomerId ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Acesse o portal de pagamento para atualizar seu cartão, 
                      ver faturas anteriores ou cancelar sua assinatura.
                    </p>
                    <Button
                      onClick={() => portalMutation.mutate()}
                      disabled={portalMutation.isPending}
                      className="w-full"
                      data-testid="button-manage-billing"
                    >
                      {portalMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Gerenciar Pagamento
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Você está usando o plano gratuito. Faça upgrade para 
                      desbloquear recursos premium.
                    </p>
                    <Link href="/planos">
                      <Button className="w-full" data-testid="button-upgrade">
                        <Crown className="h-4 w-4 mr-2" />
                        Fazer Upgrade
                      </Button>
                    </Link>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <p className="font-medium">Métodos de pagamento aceitos:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Cartão de Crédito</Badge>
                    <Badge variant="outline">PIX</Badge>
                    <Badge variant="outline">Boleto</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {currentPlan !== "enterprise" && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Precisa de mais recursos?</CardTitle>
                <CardDescription>
                  Explore nossos planos e encontre o ideal para sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/planos">
                  <Button variant="outline" data-testid="button-view-plans">
                    Ver todos os planos
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
