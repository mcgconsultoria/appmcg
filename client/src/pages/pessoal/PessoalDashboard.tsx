import { useQuery } from "@tanstack/react-query";
import { AdminPessoalLayout } from "@/components/AdminPessoalLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Wallet, Receipt, Calculator, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { FinancialCalendar } from "@/components/FinancialCalendar";
import type { PersonalTransaction, PersonalAccount, IrpfDeclaration, IrpjSummary } from "@shared/schema";

export default function PessoalDashboard() {
  const { data: transactions = [] } = useQuery<PersonalTransaction[]>({
    queryKey: ["/api/personal-finance/transactions"],
  });

  const { data: accounts = [] } = useQuery<PersonalAccount[]>({
    queryKey: ["/api/personal-finance/accounts"],
  });

  const { data: irpfDeclarations = [] } = useQuery<IrpfDeclaration[]>({
    queryKey: ["/api/admin/irpf/declarations"],
  });

  const { data: irpjSummaries = [] } = useQuery<IrpjSummary[]>({
    queryKey: ["/api/admin/irpj/summaries"],
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.currentBalance || 0), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthIncome = monthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthExpenses = monthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const latestIrpf = irpfDeclarations.sort((a, b) => b.year - a.year)[0];
  const latestIrpj = irpjSummaries.sort((a, b) => b.year - a.year)[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AdminPessoalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Visao Geral</h1>
          <p className="text-muted-foreground">Resumo das suas finanças pessoais e declarações fiscais</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">{accounts.length} conta(s) ativa(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(monthIncome)}</div>
              <p className="text-xs text-muted-foreground">{monthTransactions.filter(t => t.type === "income").length} entrada(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Despesas do Mes</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(monthExpenses)}</div>
              <p className="text-xs text-muted-foreground">{monthTransactions.filter(t => t.type === "expense").length} saida(s)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Resultado do Mes</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthIncome - monthExpenses >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(monthIncome - monthExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthIncome - monthExpenses >= 0 ? "Superavit" : "Deficit"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    IRPF
                  </CardTitle>
                  <CardDescription>Imposto de Renda Pessoa Fisica</CardDescription>
                </div>
                <Link href="/pessoal/irpf">
                  <Button variant="outline" size="sm">
                    Acessar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {latestIrpf ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">Declaracao {latestIrpf.year}</span>
                    <Badge variant={latestIrpf.status === "submitted" ? "default" : latestIrpf.status === "ready" ? "secondary" : "outline"}>
                      {latestIrpf.status === "submitted" ? "Enviada" : latestIrpf.status === "ready" ? "Pronta" : "Rascunho"}
                    </Badge>
                  </div>
                  {latestIrpf.totalIncome && (
                    <p className="text-sm text-muted-foreground">
                      Renda Total: {formatCurrency(Number(latestIrpf.totalIncome))}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {irpfDeclarations.length} declaracao(es) cadastrada(s)
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhuma declaracao cadastrada</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    IRPJ
                  </CardTitle>
                  <CardDescription>Imposto de Renda Pessoa Juridica</CardDescription>
                </div>
                <Link href="/pessoal/irpj">
                  <Button variant="outline" size="sm">
                    Acessar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {latestIrpj ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">Resumo {latestIrpj.year}</span>
                    <Badge variant="outline">{latestIrpj.regimeTributario?.toUpperCase() || "SIMPLES"}</Badge>
                  </div>
                  {latestIrpj.totalRevenue && (
                    <p className="text-sm text-muted-foreground">
                      Faturamento: {formatCurrency(Number(latestIrpj.totalRevenue))}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {irpjSummaries.length} resumo(s) cadastrado(s)
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Nenhum resumo cadastrado</p>
              )}
            </CardContent>
          </Card>
        </div>

        <FinancialCalendar
          title="Calendario Financeiro Pessoal"
          transactions={transactions.map(t => ({
            id: t.id,
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type
          }))}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Ultimas Transacoes
                </CardTitle>
                <CardDescription>Movimentacoes recentes</CardDescription>
              </div>
              <Link href="/pessoal/gestao-financeira">
                <Button variant="outline" size="sm">
                  Ver Todas <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Nenhuma transacao registrada</p>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className={`font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPessoalLayout>
  );
}
