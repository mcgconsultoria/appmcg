import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, PieChart, TrendingUp, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
  return (
    <AppLayout title="Relatórios">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Relatórios
          </h1>
          <p className="text-muted-foreground">
            Visualize e exporte relatórios do seu negocio
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Relatorio de Clientes</CardTitle>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Analise de clientes por segmento, estado e classificacao ABC
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-report-clients">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Relatorio de Pipeline</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Funil de vendas, conversoes e oportunidades por estagio
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-report-pipeline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Relatorio Financeiro</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receitas, despesas e fluxo de caixa do período
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-report-financial">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Relatorio de Tarefas</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Tarefas concluidas, pendentes e atrasadas por período
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-report-tasks">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Relatorio de Projetos</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Status dos projetos, progresso e prazos
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-report-projects">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Relatorio de Atividades</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Reunioes, visitas e atividades comerciais realizadas
              </CardDescription>
              <Button variant="outline" size="sm" className="mt-4" data-testid="button-report-activities">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Em breve</CardTitle>
            <CardDescription>
              Novos relatórios estao sendo desenvolvidos para ajudar voce a tomar melhores decisoes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Estamos trabalhando em relatórios personalizados, dashboards interativos e exportacao em varios formatos (PDF, Excel, CSV).
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
