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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Building2, Mail, Phone, Calendar, User, Search, Crown, X, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User as UserType } from "@shared/schema";

type SafeUser = Omit<UserType, "password" | "activeSessionToken">;

const defaultNewUser = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  selectedPlan: "corporativo",
  fullAccessGranted: true,
};

export default function AdminUsuarios() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [newUser, setNewUser] = useState(defaultNewUser);

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
          ? "O usuário agora tem acesso a todos os módulos independente do plano." 
          : "O usuário voltará a seguir as restrições do plano.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o acesso do usuário.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveStatusMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      return apiRequest("POST", `/api/admin/users/${userId}/active`, { active });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: variables.active ? "Usuário ativado" : "Usuário desativado",
        description: variables.active 
          ? "O usuário pode acessar o sistema normalmente." 
          : "O usuário foi bloqueado e não pode mais acessar o sistema.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof defaultNewUser) => {
      return apiRequest("POST", "/api/admin/create-user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuário criado com sucesso!" });
      setShowNewUserDialog(false);
      setNewUser(defaultNewUser);
    },
    onError: async (error: any) => {
      let msg = "Não foi possível criar o usuário.";
      try {
        const json = await error?.response?.json?.();
        if (json?.message) msg = json.message;
      } catch {}
      toast({ title: "Erro", description: msg, variant: "destructive" });
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
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              {filteredUsers?.length || 0} usuarios
            </Badge>
            <Button
              onClick={() => setShowNewUserDialog(true)}
              data-testid="button-new-user"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        <Dialog open={showNewUserDialog} onOpenChange={(open) => { setShowNewUserDialog(open); if (!open) setNewUser(defaultNewUser); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="new-firstName">Nome</Label>
                  <Input
                    id="new-firstName"
                    placeholder="Nome"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser((u) => ({ ...u, firstName: e.target.value }))}
                    data-testid="input-new-user-firstname"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-lastName">Sobrenome</Label>
                  <Input
                    id="new-lastName"
                    placeholder="Sobrenome"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser((u) => ({ ...u, lastName: e.target.value }))}
                    data-testid="input-new-user-lastname"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                  data-testid="input-new-user-email"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-password">Senha <span className="text-destructive">*</span></Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={newUser.password}
                  onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                  data-testid="input-new-user-password"
                />
              </div>
              <div className="space-y-1">
                <Label>Plano</Label>
                <Select
                  value={newUser.selectedPlan}
                  onValueChange={(val) => setNewUser((u) => ({ ...u, selectedPlan: val }))}
                >
                  <SelectTrigger data-testid="select-new-user-plan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="corporativo">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="new-fullaccess"
                  checked={newUser.fullAccessGranted}
                  onCheckedChange={(checked) => setNewUser((u) => ({ ...u, fullAccessGranted: checked }))}
                  data-testid="switch-new-user-fullaccess"
                />
                <Label htmlFor="new-fullaccess">Acesso Completo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowNewUserDialog(false); setNewUser(defaultNewUser); }}>
                Cancelar
              </Button>
              <Button
                onClick={() => createUserMutation.mutate(newUser)}
                disabled={createUserMutation.isPending || !newUser.email || !newUser.password}
                data-testid="button-confirm-new-user"
              >
                {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              <Card key={user.id} className={user.isActive === false ? "border-destructive/50 bg-destructive/5 opacity-70" : user.fullAccessGranted ? "border-primary/50 bg-primary/5" : ""}>
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
                          {user.isActive === false && (
                            <Badge variant="destructive">
                              <X className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                          {user.fullAccessGranted && user.isActive !== false && (
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

                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Ativo</span>
                          <Switch
                            checked={user.isActive !== false}
                            onCheckedChange={(checked) => {
                              toggleActiveStatusMutation.mutate({ userId: user.id, active: checked });
                            }}
                            disabled={toggleActiveStatusMutation.isPending}
                            data-testid={`switch-active-${user.id}`}
                          />
                        </div>
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
                      </div>
                      <p className="text-xs text-muted-foreground max-w-[280px] text-right">
                        {user.isActive === false 
                          ? "Usuário bloqueado - não pode acessar o sistema" 
                          : user.fullAccessGranted 
                            ? "Usuário ativo com acesso a todos os módulos" 
                            : "Usuário ativo seguindo restrições do plano"}
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
