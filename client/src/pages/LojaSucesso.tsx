import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Package,
  ArrowLeft,
  Home,
  ShoppingBag,
  Mail,
  Clock,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoMcg from "@assets/logo_mcg_principal.png";

export default function LojaSucesso() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderNumber = params.get("order");
  const { isAuthenticated } = useAuth();

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ["/api/store/orders", orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      const res = await fetch(`/api/store/orders/${orderNumber}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orderNumber,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/store/checkout/confirm", {
        orderNumber,
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (orderNumber) {
      confirmMutation.mutate();
    }
  }, [orderNumber]);

  const formatPrice = (amount: string | null) => {
    if (!amount) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Pago</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Aguardando Pagamento</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processando</Badge>;
      case "shipped":
        return <Badge className="bg-purple-500">Enviado</Badge>;
      case "delivered":
        return <Badge className="bg-green-600">Entregue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Pedido Realizado!</CardTitle>
          <p className="text-muted-foreground mt-2">
            Obrigado pela sua compra. Seu pedido foi registrado com sucesso.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : order ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Numero do Pedido:</span>
                  <span className="font-mono font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="font-bold text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Itens do Pedido
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            {item.productSnapshot?.primaryImageUrl ? (
                              <img
                                src={item.productSnapshot.primaryImageUrl}
                                alt={item.productSnapshot?.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground/50" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.productSnapshot?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qtd: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">
                      Confirmação por E-mail
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Você receberá um e-mail com os detalhes do seu pedido em breve.
                    </p>
                  </div>
                </div>
              </div>

              {order.status === "pending" && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">
                        Aguardando Confirmação de Pagamento
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Se você pagou com Boleto ou PIX, o status será atualizado assim que o pagamento for confirmado.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Pedido nao encontrado</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/loja" className="flex-1">
              <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
            <Link href={isAuthenticated ? "/dashboard" : "/landing"} className="flex-1">
              <Button className="w-full" data-testid="button-go-home">
                <Home className="h-4 w-4 mr-2" />
                {isAuthenticated ? "Ir para Dashboard" : "Voltar ao Inicio"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isAuthenticated) {
    return (
      <AppLayout title="Pedido Realizado" subtitle="Seu pedido foi registrado com sucesso">
        {content}
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3">
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
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/loja">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar a Loja
              </Button>
            </Link>
          </div>
        </div>
      </header>
      {content}
    </div>
  );
}
