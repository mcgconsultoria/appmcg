import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  TrendingUp,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/brazilStates";
import type { Client, FinancialAccount } from "@shared/schema";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  variant?: "default" | "primary";
}

function StatCard({ title, value, change, icon, variant = "default" }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={variant === "primary" ? "bg-primary text-primary-foreground" : ""}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            variant === "primary" 
              ? "bg-primary-foreground/20" 
              : "bg-primary/10"
          }`}>
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${
              isPositive 
                ? variant === "primary" ? "text-primary-foreground" : "text-green-600 dark:text-green-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className={`text-sm mb-1 ${
          variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
        }`}>
          {title}
        </p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

const pipelineStages = [
  { id: "lead", label: "Leads", color: "bg-blue-500" },
  { id: "contact", label: "Contato", color: "bg-yellow-500" },
  { id: "proposal", label: "Proposta", color: "bg-purple-500" },
  { id: "negotiation", label: "Negociação", color: "bg-orange-500" },
  { id: "closed", label: "Fechado", color: "bg-green-500" },
];

export default function Dashboard() {
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: financials = [] } = useQuery<FinancialAccount[]>({
    queryKey: ["/api/financial"],
  });

  const activeClients = clients.filter(c => c.status === "active").length;
  const totalProposals = clients.filter(c => c.pipelineStage === "proposal" || c.pipelineStage === "negotiation").length;
  
  const totalReceivables = financials
    .filter(f => f.type === "receivable" && f.status === "pending")
    .reduce((sum, f) => sum + Number(f.value || 0), 0);

  const recentClients = clients.slice(0, 5);

  const pipelineData = pipelineStages.map(stage => ({
    ...stage,
    count: clients.filter(c => c.pipelineStage === stage.id).length,
  }));

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da sua operação">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Clientes Ativos"
            value={String(activeClients)}
            change={12}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Propostas em Aberto"
            value={String(totalProposals)}
            change={8}
            icon={<ClipboardCheck className="h-5 w-5 text-primary-foreground" />}
            variant="primary"
          />
          <StatCard
            title="A Receber"
            value={formatCurrency(totalReceivables)}
            change={-5}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Taxa de Conversão"
            value="32%"
            change={15}
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Clientes Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/clientes">
                  Ver todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentClients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">Nenhum cliente cadastrado</p>
                  <Button asChild>
                    <Link href="/clientes">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar cliente
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50 hover-elevate"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" data-testid={`text-client-name-${client.id}`}>
                          {client.name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {client.segment || "Sem segmento"} - {client.city}/{client.state}
                        </p>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {pipelineStages.find(s => s.id === client.pipelineStage)?.label || "Lead"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Pipeline de Vendas</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/pipeline">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelineData.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="flex-1 text-sm">{stage.label}</span>
                    <span className="text-sm font-medium">{stage.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total no funil</span>
                  <span className="font-semibold">{clients.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/clientes">
                    <Users className="h-5 w-5" />
                    <span className="text-sm">Novo Cliente</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/calculadora-frete">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm">Calcular Frete</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/checklist">
                    <ClipboardCheck className="h-5 w-5" />
                    <span className="text-sm">Novo Checklist</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/financeiro">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">Financeiro</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/financeiro">
                  Ver detalhes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">A Receber</p>
                      <p className="font-semibold">{formatCurrency(totalReceivables)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">A Pagar</p>
                      <p className="font-semibold">
                        {formatCurrency(
                          financials
                            .filter(f => f.type === "payable" && f.status === "pending")
                            .reduce((sum, f) => sum + Number(f.value || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
