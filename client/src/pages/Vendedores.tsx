import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Plus, Search, Mail, Phone, Target, UserCog, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const perfisConta = [
  { value: "administrador", label: "Administrador" },
  { value: "supervisor", label: "Supervisor" },
  { value: "analista", label: "Analista" },
  { value: "auxiliar", label: "Auxiliar" },
];

export default function Vendedores() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [perfilConta, setPerfilConta] = useState(user?.perfilConta || "auxiliar");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    cargo: "",
    metaMensal: "",
    status: "ativo",
  });

  const isAdmin = user?.perfilConta === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";

  useEffect(() => {
    if (user?.perfilConta) {
      setPerfilConta(user.perfilConta);
    }
  }, [user?.perfilConta]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { perfilConta: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(errorData.message || `Erro ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Perfil atualizado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: error.message || "Erro ao atualizar perfil", variant: "destructive" });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsDialogOpen(false);
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      cargo: "",
      metaMensal: "",
      status: "ativo",
    });
  };

  return (
    <AppLayout title="Vendedores">
      <div className="p-6 space-y-6">
        {/* Secao Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Perfil da Conta
            </CardTitle>
            <CardDescription>Defina seu nivel de acesso no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UserCog className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Perfil Atual</p>
                <p className="text-xs text-muted-foreground">
                  {perfisConta.find(p => p.value === (user?.perfilConta || "auxiliar"))?.label || "Auxiliar"}
                </p>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Select
                    value={perfilConta}
                    onValueChange={setPerfilConta}
                  >
                    <SelectTrigger className="w-40" data-testid="select-perfil-conta">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {perfisConta.map((perfil) => (
                        <SelectItem key={perfil.value} value={perfil.value}>
                          {perfil.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {perfilConta !== (user?.perfilConta || "auxiliar") && (
                    <Button
                      size="sm"
                      onClick={() => updateProfileMutation.mutate({ perfilConta })}
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-perfil-conta"
                    >
                      {updateProfileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Salvar"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserRound className="h-6 w-6" />
              Vendedores
            </h1>
            <p className="text-muted-foreground">
              Gerencie sua equipe de vendas
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-vendedor">
            <Plus className="h-4 w-4 mr-2" />
            Novo Vendedor
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar vendedor..." 
              className="pl-9"
              data-testid="input-search-vendedor"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendedores</CardTitle>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
              <UserRound className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta do Mes</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">R$ 0</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendedores</CardTitle>
            <CardDescription>
              Cadastre e gerencie os vendedores da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <UserRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vendedor cadastrado</p>
              <p className="text-sm mt-2">Clique em "Novo Vendedor" para comecar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Novo Vendedor
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do vendedor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Nome do vendedor"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                data-testid="input-vendedor-nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="email@empresa.com"
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  data-testid="input-vendedor-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  className="pl-9"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange("telefone", e.target.value)}
                  data-testid="input-vendedor-telefone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                placeholder="Ex: Vendedor Senior"
                value={formData.cargo}
                onChange={(e) => handleInputChange("cargo", e.target.value)}
                data-testid="input-vendedor-cargo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaMensal">Meta Mensal (R$)</Label>
              <Input
                id="metaMensal"
                type="number"
                placeholder="0,00"
                value={formData.metaMensal}
                onChange={(e) => handleInputChange("metaMensal", e.target.value)}
                data-testid="input-vendedor-meta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger data-testid="select-vendedor-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="ferias">Em Ferias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel-vendedor">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} data-testid="button-save-vendedor">
              Salvar Vendedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
