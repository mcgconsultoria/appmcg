import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, GripVertical, Building2, DollarSign, User, ChevronRight } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/brazilStates";
import type { Client } from "@shared/schema";
import { Link } from "wouter";

const pipelineStages = [
  { id: "lead", label: "Leads", color: "bg-blue-500", description: "Novos contatos" },
  { id: "contact", label: "Contato", color: "bg-yellow-500", description: "Em primeiro contato" },
  { id: "proposal", label: "Proposta", color: "bg-purple-500", description: "Proposta enviada" },
  { id: "negotiation", label: "Negociação", color: "bg-orange-500", description: "Em negociação" },
  { id: "closed", label: "Fechado", color: "bg-green-500", description: "Cliente conquistado" },
];

interface MoveDialogData {
  client: Client;
  newStage: string;
}

export default function Pipeline() {
  const [moveDialog, setMoveDialog] = useState<MoveDialogData | null>(null);
  const { toast } = useToast();

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      return apiRequest("PATCH", `/api/clients/${id}`, { pipelineStage: stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setMoveDialog(null);
      toast({ title: "Cliente movido com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao mover cliente", variant: "destructive" });
    },
  });

  const handleMoveClient = (client: Client, newStage: string) => {
    if (client.pipelineStage === newStage) return;
    setMoveDialog({ client, newStage });
  };

  const confirmMove = () => {
    if (!moveDialog) return;
    updateStageMutation.mutate({
      id: moveDialog.client.id,
      stage: moveDialog.newStage,
    });
  };

  const getClientsByStage = (stageId: string) => {
    return clients.filter((c) => c.pipelineStage === stageId);
  };

  const getTotalValue = (stageClients: Client[]) => {
    return stageClients.reduce((sum, c) => sum + Number(c.estimatedValue || 0), 0);
  };

  return (
    <AppLayout title="Pipeline de Vendas" subtitle="Acompanhe o funil de vendas">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{clients.length}</span> clientes no funil
            </div>
            <div className="text-sm text-muted-foreground">
              Valor total:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(clients.reduce((sum, c) => sum + Number(c.estimatedValue || 0), 0))}
              </span>
            </div>
          </div>
          <Button asChild>
            <Link href="/clientes">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Link>
          </Button>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
            {pipelineStages.map((stage) => {
              const stageClients = getClientsByStage(stage.id);
              const totalValue = getTotalValue(stageClients);

              return (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-72"
                  data-testid={`pipeline-column-${stage.id}`}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                          <CardTitle className="text-base">{stage.label}</CardTitle>
                        </div>
                        <Badge variant="secondary" size="sm">
                          {stageClients.length}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                      {totalValue > 0 && (
                        <p className="text-sm font-medium text-primary">
                          {formatCurrency(totalValue)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2 min-h-[400px]">
                      {isLoading ? (
                        <div className="space-y-2">
                          {[1, 2].map((i) => (
                            <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />
                          ))}
                        </div>
                      ) : stageClients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Building2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">Nenhum cliente</p>
                        </div>
                      ) : (
                        stageClients.map((client) => (
                          <Card
                            key={client.id}
                            className="cursor-pointer hover-elevate"
                            data-testid={`pipeline-card-${client.id}`}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{client.name}</p>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Building2 className="h-3 w-3" />
                                    <span className="truncate">{client.segment || "Sem segmento"}</span>
                                  </div>
                                  {client.contactName && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span className="truncate">{client.contactName}</span>
                                    </div>
                                  )}
                                  {client.estimatedValue && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <DollarSign className="h-3 w-3 text-primary" />
                                      <span className="text-xs font-medium text-primary">
                                        {formatCurrency(Number(client.estimatedValue))}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-3 flex gap-1">
                                <Select
                                  value={client.pipelineStage || "lead"}
                                  onValueChange={(value) => handleMoveClient(client, value)}
                                >
                                  <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {pipelineStages.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {s.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <Dialog open={!!moveDialog} onOpenChange={() => setMoveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover Cliente</DialogTitle>
            <DialogDescription>
              Confirmar a mudança de etapa do cliente?
            </DialogDescription>
          </DialogHeader>
          {moveDialog && (
            <div className="py-4">
              <p className="text-sm mb-4">
                <span className="font-medium">{moveDialog.client.name}</span> será movido para:
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {pipelineStages.find((s) => s.id === moveDialog.client.pipelineStage)?.label}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Badge>
                  {pipelineStages.find((s) => s.id === moveDialog.newStage)?.label}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmMove}
              disabled={updateStageMutation.isPending}
            >
              {updateStageMutation.isPending ? "Movendo..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
