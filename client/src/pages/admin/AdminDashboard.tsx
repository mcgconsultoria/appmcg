import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FolderKanban, CreditCard, DollarSign, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<{
    activeLeads: number;
    activeProjects: number;
    activeSubscriptions: number;
    estimatedRevenue: number;
  }>({
    queryKey: ["/api/admin/dashboard"],
  });

  const { data: leads = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/leads"],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/projects"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const recentLeads = leads.slice(0, 5);
  const activeProjects = projects.filter((p: any) => p.status === "active").slice(0, 5);

  return (
    <AppLayout title="Dashboard MCG" subtitle="Visão geral da gestão interna">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">Dashboard MCG</h1>
          <p className="text-muted-foreground">Visão geral da gestão interna</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Leads Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-leads">
                {isLoading ? "..." : stats?.activeLeads || 0}
              </div>
              <p className="text-xs text-muted-foreground">Em negociação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-projects">
                {isLoading ? "..." : stats?.activeProjects || 0}
              </div>
              <p className="text-xs text-muted-foreground">Consultorias em andamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-subscriptions">
                {isLoading ? "..." : stats?.activeSubscriptions || 0}
              </div>
              <p className="text-xs text-muted-foreground">Assinantes ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-estimated-revenue">
                {isLoading ? "..." : formatCurrency(stats?.estimatedRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Pipeline total</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leads Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum lead cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{lead.companyName}</p>
                        <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {lead.stage}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projetos em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum projeto ativo</p>
              ) : (
                <div className="space-y-3">
                  {activeProjects.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.clientName}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {project.progress || 0}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhum alerta no momento. Todos os indicadores estao normais.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
