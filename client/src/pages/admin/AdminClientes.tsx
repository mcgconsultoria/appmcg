import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import {
  Building2, Mail, Phone, Calendar, User, Search, UserPlus, MapPin, X
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { User as UserType } from "@shared/schema";

type SafeUser = Omit<UserType, "password" | "activeSessionToken">;

const planLabels: Record<string, string> = {
  free: "Gratuito",
  starter: "Starter",
  profissional: "Profissional",
  corporativo: "Corporativo",
};

const planColors: Record<string, string> = {
  free: "secondary",
  starter: "outline",
  profissional: "default",
  corporativo: "default",
};

const defaultNewClient = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  phone: "",
  selectedPlan: "corporativo",
  fullAccessGranted: true,
};

export default function AdminClientes() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState(defaultNewClient);

  const { data: users, isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/admin/users"],
  });

  const clientes = users?.filter(
    (u) => u.role !== "admin_mcg" && u.role !== "admin"
  );

  const filtered = clientes?.filter((u) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      u.email?.toLowerCase().includes(t) ||
      u.firstName?.toLowerCase().includes(t) ||
      u.lastName?.toLowerCase().includes(t) ||
      u.razaoSocial?.toLowerCase().includes(t) ||
      u.nomeFantasia?.toLowerCase().includes(t) ||
      u.cnpj?.includes(t) ||
      u.phone?.includes(t)
    );
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof defaultNewClient) =>
      apiRequest("POST", "/api/admin/create-user", { ...data, role: "user" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Cliente criado com sucesso!" });
      setShowDialog(false);
      setForm(defaultNewClient);
    },
    onError: async (error: any) => {
      let msg = "Não foi possível criar o cliente.";
      try {
        const json = await error?.response?.json?.();
        if (json?.message) msg = json.message;
      } catch {}
      toast({ title: "Erro", description: msg, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) =>
      apiRequest("POST", `/api/admin/users/${userId}/active`, { active }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: vars.active ? "Cliente ativado" : "Cliente desativado" });
    },
    onError: () => toast({ title: "Erro", description: "Não foi possível alterar o status.", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <AppLayout title="Clientes" subtitle="Gestão de clientes MCG">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Clientes" subtitle="Gestão de clientes MCG">
      <div className="space-y-4">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-clientes"
            />
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              {filtered?.length ?? 0} clientes
            </Badge>
            <Button onClick={() => setShowDialog(true)} data-testid="button-novo-cliente">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Dialog novo cliente */}
        <Dialog open={showDialog} onOpenChange={(o) => { setShowDialog(o); if (!o) setForm(defaultNewClient); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nome</Label>
                  <Input placeholder="Nome" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} data-testid="input-cliente-firstname" />
                </div>
                <div className="space-y-1">
                  <Label>Sobrenome</Label>
                  <Input placeholder="Sobrenome" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} data-testid="input-cliente-lastname" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" placeholder="email@empresa.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} data-testid="input-cliente-email" />
              </div>
              <div className="space-y-1">
                <Label>Senha <span className="text-destructive">*</span></Label>
                <Input type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} data-testid="input-cliente-password" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Razão Social</Label>
                  <Input placeholder="Razão Social" value={form.razaoSocial} onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))} data-testid="input-cliente-razao" />
                </div>
                <div className="space-y-1">
                  <Label>Nome Fantasia</Label>
                  <Input placeholder="Nome Fantasia" value={form.nomeFantasia} onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))} data-testid="input-cliente-fantasia" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>CNPJ</Label>
                  <Input placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))} data-testid="input-cliente-cnpj" />
                </div>
                <div className="space-y-1">
                  <Label>Telefone</Label>
                  <Input placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} data-testid="input-cliente-phone" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Plano</Label>
                <Select value={form.selectedPlan} onValueChange={(v) => setForm((f) => ({ ...f, selectedPlan: v }))}>
                  <SelectTrigger data-testid="select-cliente-plan"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="corporativo">Corporativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="cliente-fullaccess" checked={form.fullAccessGranted} onCheckedChange={(c) => setForm((f) => ({ ...f, fullAccessGranted: c }))} data-testid="switch-cliente-fullaccess" />
                <Label htmlFor="cliente-fullaccess">Acesso Completo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDialog(false); setForm(defaultNewClient); }}>Cancelar</Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending || !form.email || !form.password}
                data-testid="button-confirmar-cliente"
              >
                {createMutation.isPending ? "Criando..." : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Lista */}
        {filtered?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente ajustar os termos de busca." : "Nenhum cliente cadastrado ainda."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered?.map((user) => (
              <Card
                key={user.id}
                className={user.isActive === false ? "border-destructive/50 bg-destructive/5 opacity-70" : ""}
                data-testid={`card-cliente-${user.id}`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {user.profileImageUrl ? (
                          <img src={user.profileImageUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold" data-testid={`text-cliente-nome-${user.id}`}>
                            {user.nomeFantasia || user.razaoSocial || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—"}
                          </h3>
                          {user.isActive === false && (
                            <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Inativo</Badge>
                          )}
                          <Badge variant={(planColors[user.selectedPlan ?? "free"] ?? "secondary") as any}>
                            {planLabels[user.selectedPlan ?? "free"] ?? user.selectedPlan}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.cnpj && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{user.cnpj}</span>
                            </div>
                          )}
                          {(user as any).state && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{(user as any).state}</span>
                            </div>
                          )}
                          {user.createdAt && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>Desde {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                          )}
                          {user.razaoSocial && user.nomeFantasia && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground col-span-2">
                              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{user.razaoSocial}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm text-muted-foreground">Ativo</span>
                      <Switch
                        checked={user.isActive !== false}
                        onCheckedChange={(checked) => toggleActiveMutation.mutate({ userId: user.id, active: checked })}
                        disabled={toggleActiveMutation.isPending}
                        data-testid={`switch-cliente-ativo-${user.id}`}
                      />
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
