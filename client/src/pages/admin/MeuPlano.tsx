import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CreditCard, Users, Check, X, RefreshCw, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SubscriptionStatus {
  plan: string;
  status: string;
  maxUsers: number;
  currentUsers: number;
  cancellationRequestedAt: string | null;
  cancellationEffectiveDate: string | null;
  daysUntilAccessLoss: number | null;
  renewalDue: boolean;
  renewalDueDate: string | null;
  renewalPrice: number | null;
  renewalApproved: boolean;
  contractStartDate: string | null;
}

const planNames: Record<string, string> = {
  free: "Gratuito",
  professional: "Profissional",
  enterprise: "Corporativo"
};

const planPrices: Record<string, number> = {
  free: 0,
  professional: 499,
  enterprise: 1499
};

export default function MeuPlano() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data: subscription, isLoading } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscription/status"],
  });

  const cancelMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiRequest("/api/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Cancelamento solicitado",
        description: "Seu cancelamento foi registrado. Você continuará tendo acesso até a data informada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      setShowCancelDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar o cancelamento.",
        variant: "destructive",
      });
    },
  });

  const renewalMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/subscription/approve-renewal", {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Renovação aprovada",
        description: "Sua assinatura foi renovada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/status"] });
      setShowRenewalDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível aprovar a renovação.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const planName = planNames[subscription?.plan || "free"] || subscription?.plan;
  const monthlyPrice = planPrices[subscription?.plan || "free"] || 0;
  const isCancelling = subscription?.status === "cancelling";
  const hasActiveCancellation = !!subscription?.cancellationRequestedAt;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Meu Plano</h1>
            <p className="text-muted-foreground">Gerencie sua assinatura e plano</p>
          </div>
        </div>
      </div>

      {subscription && subscription.daysUntilAccessLoss !== null && subscription.daysUntilAccessLoss !== undefined && subscription.daysUntilAccessLoss <= 7 && (
        <Alert variant="destructive" data-testid="alert-access-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Aviso de Acesso</AlertTitle>
          <AlertDescription>
            {subscription.daysUntilAccessLoss <= 0 
              ? "Seu acesso expirou. Entre em contato com o suporte."
              : `Seu acesso expira em ${subscription.daysUntilAccessLoss} dia(s). Após essa data, você não poderá mais acessar o sistema.`
            }
          </AlertDescription>
        </Alert>
      )}

      {subscription?.renewalDue && !subscription.renewalApproved && (
        <Alert data-testid="alert-renewal-due">
          <RefreshCw className="h-4 w-4" />
          <AlertTitle>Renovação Pendente</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <span>
              Sua assinatura vence em {subscription.renewalDueDate ? new Date(subscription.renewalDueDate).toLocaleDateString('pt-BR') : 'breve'}.
              {subscription.renewalPrice && (
                <span className="font-medium"> Novo valor: R$ {(subscription.renewalPrice / 100).toFixed(2)}/mês</span>
              )}
            </span>
            <Button 
              onClick={() => setShowRenewalDialog(true)}
              className="w-fit"
              data-testid="button-approve-renewal"
            >
              Aprovar Renovação
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-plan-details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detalhes do Plano
            </CardTitle>
            <CardDescription>Informações sobre sua assinatura atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plano</span>
              <Badge variant="secondary" className="text-base" data-testid="badge-plan-name">
                {planName}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor Mensal</span>
              <span className="font-semibold" data-testid="text-monthly-price">
                {monthlyPrice === 0 ? "Gratuito" : `R$ ${monthlyPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge 
                variant={isCancelling ? "destructive" : "default"}
                data-testid="badge-status"
              >
                {isCancelling ? "Cancelando" : subscription?.status === "active" ? "Ativo" : subscription?.status}
              </Badge>
            </div>
            {subscription?.contractStartDate && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Início do Contrato</span>
                <span data-testid="text-contract-start">
                  {new Date(subscription.contractStartDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-users">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários
            </CardTitle>
            <CardDescription>Gerenciamento de licenças</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Usuários Ativos</span>
              <span className="font-semibold" data-testid="text-current-users">
                {subscription?.currentUsers || 1}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Limite de Usuários</span>
              <span className="font-semibold" data-testid="text-max-users">
                {subscription?.maxUsers || 1}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Usuário Adicional</span>
              <span className="text-sm">R$ 69,00/mês</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasActiveCancellation && (
        <Card className="border-destructive" data-testid="card-cancellation-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancelamento Solicitado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Data da Solicitação</span>
              <span data-testid="text-cancellation-date">
                {subscription?.cancellationRequestedAt 
                  ? new Date(subscription.cancellationRequestedAt).toLocaleDateString('pt-BR')
                  : "-"
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Acesso até</span>
              <span className="font-semibold" data-testid="text-access-until">
                {subscription?.cancellationEffectiveDate 
                  ? new Date(subscription.cancellationEffectiveDate).toLocaleDateString('pt-BR')
                  : "-"
                }
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Você continuará tendo acesso completo ao sistema até a data acima. 
              Após essa data, seu acesso será suspenso, mas seus dados permanecerão armazenados.
            </p>
          </CardContent>
        </Card>
      )}

      {!hasActiveCancellation && subscription?.plan !== "free" && (
        <Card data-testid="card-cancel-subscription">
          <CardHeader>
            <CardTitle>Cancelar Assinatura</CardTitle>
            <CardDescription>Solicite o cancelamento do seu plano</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelDialog(true)}
              data-testid="button-cancel-subscription"
            >
              Solicitar Cancelamento
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancelar Assinatura
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <div className="space-y-2">
                <p className="font-medium">Antes de continuar, saiba que:</p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>
                    <span className="font-medium">Pagamento integral do mês atual:</span> Não há reembolso proporcional do mês em curso.
                  </li>
                  <li>
                    <span className="font-medium">Cobrança adicional:</span> Será cobrado mais 1 (um) mês após a solicitação, com direito a uso até o último dia coberto.
                  </li>
                  <li>
                    <span className="font-medium">Sem multa:</span> Não há multa por cancelamento, mesmo antes de 1 ano de contrato.
                  </li>
                  <li>
                    <span className="font-medium">Seus dados ficam salvos:</span> O banco de dados da sua empresa permanece armazenado e pode ser reativado no futuro.
                  </li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Motivo do cancelamento (opcional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Conte-nos o motivo do cancelamento..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              data-testid="input-cancel-reason"
            />
          </div>
          
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
              data-testid="button-cancel-dialog-close"
            >
              <X className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => cancelMutation.mutate(cancelReason)}
              disabled={cancelMutation.isPending}
              data-testid="button-confirm-cancellation"
            >
              {cancelMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Aprovar Renovação
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                Sua assinatura anual está prestes a vencer. 
                {subscription?.renewalPrice && (
                  <span className="font-medium"> O novo valor mensal será de R$ {(subscription.renewalPrice / 100).toFixed(2)}.</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Ao aprovar, sua assinatura será renovada por mais 12 meses nas mesmas condições, 
                exceto pelo valor que pode ter sido atualizado pela MCG Consultoria.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowRenewalDialog(false)}
              data-testid="button-renewal-dialog-close"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={() => renewalMutation.mutate()}
              disabled={renewalMutation.isPending}
              data-testid="button-confirm-renewal"
            >
              {renewalMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Aprovar Renovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
