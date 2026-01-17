import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Building2, Mail, Phone, Calendar, User, Search, Crown, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User as UserType } from "@shared/schema";

type SafeUser = Omit<UserType, "password" | "activeSessionToken">;

export default function AdminUsuarios() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const toggleFullAccessMutation = useMutation({
    mutationFn: async ({ userId, granted }: { userId: string; granted: boolean }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/full-access`, { granted });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: variables.granted ? "Acesso completo liberado" : "Acesso completo removido",
        description: variables.granted 
          ? "O usuario agora tem acesso a todos os modulos independente do plano." 
          : "O usuario voltara a seguir as restricoes do plano.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar o acesso do usuario.",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.email.toLowerCase().includes(term) ||
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.razaoSocial?.toLowerCase().includes(term) ||
      user.nomeFantasia?.toLowerCase().includes(term) ||
      user.cnpj?.includes(term)
    );
  });

  if (isLoading) {
    return (
      <AppLayout title="Usuarios" subtitle="Gerenciamento de usuarios cadastrados">
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
    <AppLayout title="Usuarios" subtitle="Gerenciamento de usuarios cadastrados">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>
          <Badge variant="outline" className="text-base px-4 py-2">
            {filteredUsers?.length || 0} usuarios
          </Badge>
        </div>

        {filteredUsers?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum usuario encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente ajustar os termos de busca." : "Nao ha usuarios aprovados no sistema."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers?.map((user) => (
              <Card key={user.id} className={user.fullAccessGranted ? "border-primary/50 bg-primary/5" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {user.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg" data-testid={`text-user-name-${user.id}`}>
                            {user.firstName} {user.lastName}
                          </h3>
                          {user.fullAccessGranted && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Crown className="h-3 w-3 mr-1" />
                              Acesso Completo
                            </Badge>
                          )}
                          <Badge variant="outline">{user.selectedPlan || "free"}</Badge>
                          <Badge variant="secondary">{user.perfilConta || "colaborador"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                          {(user.razaoSocial || user.nomeFantasia) && (
                            <div className="flex items-start gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Empresa</p>
                                <p className="text-sm font-medium">{user.nomeFantasia || user.razaoSocial}</p>
                              </div>
                            </div>
                          )}
                          {user.cnpj && (
                            <div className="flex items-start gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">CNPJ</p>
                                <p className="text-sm font-medium">{user.cnpj}</p>
                              </div>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Telefone</p>
                                <p className="text-sm font-medium">{user.phone}</p>
                              </div>
                            </div>
                          )}
                          {user.createdAt && (
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Cadastrado em</p>
                                <p className="text-sm font-medium">
                                  {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {user.fullAccessGrantedAt && user.fullAccessGrantedBy && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Acesso liberado em {format(new Date(user.fullAccessGrantedAt), "dd/MM/yyyy", { locale: ptBR })} por {user.fullAccessGrantedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Acesso Completo</span>
                        <Switch
                          checked={!!user.fullAccessGranted}
                          onCheckedChange={(checked) => {
                            toggleFullAccessMutation.mutate({ userId: user.id, granted: checked });
                          }}
                          disabled={toggleFullAccessMutation.isPending}
                          data-testid={`switch-full-access-${user.id}`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground max-w-[200px] text-right">
                        {user.fullAccessGranted 
                          ? "Este usuario tem acesso a todos os modulos" 
                          : "Libere acesso completo independente do plano"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
