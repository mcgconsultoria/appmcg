import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Check, X, Building2, Mail, Phone, Calendar, User, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User as UserType } from "@shared/schema";

type PendingUser = Omit<UserType, "password" | "activeSessionToken">;

export default function PendingApprovals() {
  const { toast } = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: pendingUsers, isLoading } = useQuery<PendingUser[]>({
    queryKey: ["/api/admin/pending-approvals"],
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/approve-user/${userId}`, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
      toast({
        title: "Usuário aprovado",
        description: "O usuário foi aprovado e receberá um email de confirmação.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o usuário.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest(`/api/admin/reject-user/${userId}`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-approvals"] });
      setRejectDialogOpen(false);
      setSelectedUser(null);
      setRejectReason("");
      toast({
        title: "Solicitação rejeitada",
        description: "O usuário foi notificado por email.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (userId: string) => {
    approveMutation.mutate(userId);
  };

  const handleRejectClick = (user: PendingUser) => {
    setSelectedUser(user);
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (selectedUser) {
      rejectMutation.mutate({ userId: selectedUser.id, reason: rejectReason });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Aguardando Aprovação" subtitle="Solicitações de cadastro que precisam de aprovação">
        <div className="space-y-4">
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Aguardando Aprovação" subtitle="Solicitações de cadastro que precisam de aprovação">
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {pendingUsers?.length || 0} pendentes
          </Badge>
        </div>

      {!pendingUsers?.length ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma aprovação pendente</h3>
            <p className="text-muted-foreground">
              Todas as solicitações foram processadas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((user) => (
            <Card key={user.id} data-testid={`card-pending-user-${user.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(user.id)}
                      disabled={approveMutation.isPending}
                      data-testid={`button-approve-${user.id}`}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectClick(user)}
                      disabled={rejectMutation.isPending}
                      data-testid={`button-reject-${user.id}`}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Empresa</p>
                      <p className="font-medium">{user.razaoSocial || user.nomeFantasia || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">CNPJ</p>
                      <p className="font-medium">{user.cnpj || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Telefone</p>
                      <p className="font-medium">{user.phone || "Não informado"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Cadastrado em</p>
                      <p className="font-medium">
                        {user.createdAt
                          ? format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline">{user.tipoEmpresa || "Tipo não informado"}</Badge>
                  <Badge variant="outline">{user.perfilConta || "colaborador"}</Badge>
                  <Badge variant="secondary">{user.selectedPlan || "free"}</Badge>
                  {user.userCategories?.map((cat) => (
                    <Badge key={cat} variant="outline" className="capitalize">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O usuário receberá um email com esta informação.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: Documentação incompleta, CNPJ inválido..."
              className="mt-2"
              data-testid="input-reject-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
}
