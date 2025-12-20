import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target, Building2, TrendingUp, TrendingDown, Search, Edit2, Check, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/brazilStates";
import type { Client } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Operacoes() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const updateMetaMutation = useMutation({
    mutationFn: async ({ id, metaValor }: { id: number; metaValor: string }) => {
      const numericValue = metaValor ? parseFloat(metaValor.replace(",", ".")) : null;
      if (metaValor && (isNaN(numericValue!) || numericValue! < 0)) {
        throw new Error("Valor invalido");
      }
      return apiRequest("PATCH", `/api/clients/${id}`, { metaValor: numericValue?.toString() || null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setEditingId(null);
      setEditValue("");
      toast({ title: "Meta atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar meta", variant: "destructive" });
    },
  });

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setEditValue(client.metaValor?.toString() || "");
  };

  const handleSave = (id: number) => {
    if (editValue && isNaN(parseFloat(editValue.replace(",", ".")))) {
      toast({ title: "Por favor insira um valor numerico valido", variant: "destructive" });
      return;
    }
    updateMetaMutation.mutate({ id, metaValor: editValue });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMeta = clients.reduce((sum, c) => sum + Number(c.metaValor || 0), 0);
  const totalEstimado = clients.reduce((sum, c) => sum + Number(c.estimatedValue || 0), 0);
  const faltaParaMeta = totalMeta - totalEstimado;
  const percentualAtingido = totalMeta > 0 ? (totalEstimado / totalMeta) * 100 : 0;

  return (
    <AppLayout title="Operacoes">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Operacoes - Metas por Cliente
          </h1>
          <p className="text-muted-foreground">
            Defina e acompanhe as metas de cada cliente
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-meta">
                {formatCurrency(totalMeta)}
              </div>
              <p className="text-xs text-muted-foreground">Soma de todas as metas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500" data-testid="text-total-estimado">
                {formatCurrency(totalEstimado)}
              </div>
              <p className="text-xs text-muted-foreground">Pipeline atual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falta para Meta</CardTitle>
              <TrendingDown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${faltaParaMeta > 0 ? "text-amber-500" : "text-green-500"}`} data-testid="text-falta-meta">
                {faltaParaMeta > 0 ? formatCurrency(faltaParaMeta) : "Meta atingida!"}
              </div>
              <p className="text-xs text-muted-foreground">
                {faltaParaMeta > 0 ? "Diferenca para atingir" : "Parabens!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Percentual Atingido</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${percentualAtingido >= 100 ? "text-green-500" : percentualAtingido >= 70 ? "text-blue-500" : "text-amber-500"}`} data-testid="text-percentual">
                {percentualAtingido.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Da meta total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Metas por Cliente</CardTitle>
                <CardDescription>
                  Defina a meta de faturamento para cada cliente
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-operacoes"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Segmento</TableHead>
                    <TableHead className="text-right">Valor Estimado</TableHead>
                    <TableHead className="text-right">Meta</TableHead>
                    <TableHead className="text-right">Falta para Meta</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => {
                    const estimado = Number(client.estimatedValue || 0);
                    const meta = Number(client.metaValor || 0);
                    const falta = meta - estimado;
                    const percentual = meta > 0 ? (estimado / meta) * 100 : 0;

                    return (
                      <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.segment ? (
                            <Badge variant="outline">{client.segment}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(estimado)}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === client.id ? (
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-32 text-right ml-auto"
                              placeholder="0,00"
                              data-testid={`input-meta-${client.id}`}
                            />
                          ) : (
                            <span className={meta > 0 ? "font-medium" : "text-muted-foreground"}>
                              {meta > 0 ? formatCurrency(meta) : "Sem meta"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {meta > 0 ? (
                            <span className={falta > 0 ? "text-amber-500" : "text-green-500"}>
                              {falta > 0 ? formatCurrency(falta) : "Atingida"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {meta > 0 ? (
                            <Badge
                              variant={percentual >= 100 ? "default" : "secondary"}
                              className={percentual >= 100 ? "bg-green-500" : percentual >= 70 ? "bg-blue-500" : ""}
                            >
                              {percentual.toFixed(0)}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === client.id ? (
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleSave(client.id)}
                                disabled={updateMetaMutation.isPending}
                                data-testid={`button-save-meta-${client.id}`}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleCancel}
                                data-testid={`button-cancel-meta-${client.id}`}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(client)}
                              data-testid={`button-edit-meta-${client.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
