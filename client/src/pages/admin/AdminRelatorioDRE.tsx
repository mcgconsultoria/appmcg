import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";

interface DreReportItem {
  id: number;
  code: string;
  name: string;
  type: string;
  parentId: number | null;
  level: number;
  credito: number;
  debito: number;
  saldo: number;
}

export default function AdminRelatorioDRE() {
  const currentDate = new Date();
  const [filters, setFilters] = useState({
    startDate: format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), "yyyy-MM-dd"),
  });

  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  const queryString = queryParams.toString();

  const { data: reportData = [], isLoading } = useQuery<DreReportItem[]>({
    queryKey: ["/api/dre-report", queryString],
    queryFn: async () => {
      const url = queryString ? `/api/dre-report?${queryString}` : "/api/dre-report";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Falha ao carregar relatorio");
      return res.json();
    },
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getRowStyle = (level: number, type: string) => {
    if (level === 0 || type === "grupo") {
      return "font-bold bg-muted/50";
    }
    if (level === 1) {
      return "font-semibold";
    }
    return "";
  };

  const getIndentation = (level: number) => {
    return { paddingLeft: `${level * 20 + 8}px` };
  };

  const totalReceitas = reportData
    .filter((item) => item.type === "receita" || item.code.startsWith("1"))
    .reduce((sum, item) => sum + item.saldo, 0);

  const totalDespesas = reportData
    .filter((item) => item.type === "despesa" || item.code.startsWith("2") || item.code.startsWith("3") || item.code.startsWith("4"))
    .reduce((sum, item) => sum + Math.abs(item.saldo), 0);

  const lucroOperacional = totalReceitas - totalDespesas;

  return (
    <AppLayout title="Admin MCG">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Demonstrativo de Resultado (DRE)
            </h1>
            <p className="text-muted-foreground">
              Relatorio gerencial de receitas e despesas do período
            </p>
          </div>
          <Button variant="outline" data-testid="button-export-dre">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Período
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  data-testid="input-dre-start-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  data-testid="input-dre-end-date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Receitas</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalReceitas)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Despesas</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalDespesas)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resultado Operacional</p>
                  <p className={`text-2xl font-bold ${lucroOperacional >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {formatCurrency(lucroOperacional)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              DRE Analitico
            </CardTitle>
            <CardDescription>
              Período: {filters.startDate ? format(new Date(filters.startDate), "dd/MM/yyyy") : "-"} a {filters.endDate ? format(new Date(filters.endDate), "dd/MM/yyyy") : "-"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : reportData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado encontrado para o período selecionado.
                <br />
                <span className="text-sm">Configure o plano de contas e registre lançamentos contabeis.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Creditos</TableHead>
                      <TableHead className="text-right">Debitos</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item) => (
                      <TableRow
                        key={item.id}
                        className={getRowStyle(item.level, item.type)}
                        data-testid={`row-dre-${item.id}`}
                      >
                        <TableCell className="font-mono text-sm">{item.code}</TableCell>
                        <TableCell style={getIndentation(item.level)}>
                          {item.name}
                        </TableCell>
                        <TableCell className="text-right text-green-600 dark:text-green-400">
                          {item.credito > 0 ? formatCurrency(item.credito) : "-"}
                        </TableCell>
                        <TableCell className="text-right text-red-600 dark:text-red-400">
                          {item.debito > 0 ? formatCurrency(item.debito) : "-"}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${item.saldo >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {formatCurrency(item.saldo)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 border-border font-bold bg-muted">
                      <TableCell colSpan={2} className="text-right">
                        RESULTADO DO PERIODO
                      </TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">
                        {formatCurrency(totalReceitas)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        {formatCurrency(totalDespesas)}
                      </TableCell>
                      <TableCell className={`text-right ${lucroOperacional >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {formatCurrency(lucroOperacional)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
