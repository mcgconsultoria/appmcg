import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, Search, User, Clock, Filter, FileText } from "lucide-react";
import { useState } from "react";
import type { AuditLog } from "@shared/schema";

const actionLabels: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  create: { label: "Criacao", variant: "default" },
  update: { label: "Atualizacao", variant: "secondary" },
  delete: { label: "Exclusao", variant: "destructive" },
  view: { label: "Visualizacao", variant: "outline" },
  export: { label: "Exportacao", variant: "secondary" },
  login: { label: "Login", variant: "default" },
  logout: { label: "Logout", variant: "outline" },
  import: { label: "Importacao", variant: "secondary" },
  send_email: { label: "Email Enviado", variant: "default" },
  generate_pdf: { label: "PDF Gerado", variant: "secondary" },
};

const entityLabels: Record<string, string> = {
  client: "Cliente",
  checklist: "Checklist",
  meeting_record: "Ata de Reuniao",
  commercial_event: "Evento Comercial",
  task: "Tarefa",
  project: "Projeto",
  proposal: "Proposta",
  financial_account: "Conta Financeira",
  team_member: "Membro da Equipe",
  rfi: "RFI",
  user: "Usuario",
  company: "Empresa",
  store_order: "Pedido Loja",
  store_product: "Produto Loja",
};

export default function AuditLogs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  const { data: logs, isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs", actionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (actionFilter && actionFilter !== "all") {
        params.append("action", actionFilter);
      }
      params.append("limit", "100");
      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.json();
    },
  });

  const filteredLogs = logs?.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.description?.toLowerCase().includes(searchLower) ||
      log.entityType?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower)
    );
  });

  const isAdminOrGestor = user?.perfilConta === "admin" || user?.perfilConta === "gestor" || user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";

  if (!isAdminOrGestor) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Apenas administradores e gestores podem visualizar os logs de auditoria.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Logs de Auditoria
            </h1>
            <p className="text-muted-foreground">
              Acompanhe todas as acoes realizadas pelos usuarios da sua empresa
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Historico de Atividades
              </CardTitle>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="input-search-logs"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]" data-testid="select-action-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por acao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as acoes</SelectItem>
                    <SelectItem value="create">Criacao</SelectItem>
                    <SelectItem value="update">Atualizacao</SelectItem>
                    <SelectItem value="delete">Exclusao</SelectItem>
                    <SelectItem value="export">Exportacao</SelectItem>
                    <SelectItem value="send_email">Email Enviado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredLogs && filteredLogs.length > 0 ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col gap-2 p-4 rounded-md border bg-card hover-elevate"
                      data-testid={`log-item-${log.id}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={actionLabels[log.action]?.variant || "default"}>
                            {actionLabels[log.action]?.label || log.action}
                          </Badge>
                          <Badge variant="outline">
                            {entityLabels[log.entityType] || log.entityType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      
                      {log.description && (
                        <p className="text-sm">{log.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>ID: {log.userId.substring(0, 8)}...</span>
                        </div>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                        {log.entityId && (
                          <span>Entidade ID: {log.entityId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum log encontrado</h3>
                <p className="text-muted-foreground">
                  Os logs de atividades aparecerao aqui conforme os usuarios realizarem acoes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
