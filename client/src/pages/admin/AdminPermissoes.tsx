import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Plus, Edit2, Trash2, Lock, Eye, FileEdit, FilePlus, FileX, Download, CheckCircle, Settings } from "lucide-react";
import type { CompanyRole, PermissionDefinition } from "@/hooks/use-permissions";

const MODULE_LABELS: Record<string, string> = {
  crm: "CRM",
  financial: "Financeiro",
  checklist: "Checklist",
  rfi: "RFI",
  calculator: "Calculadoras",
  loja: "Loja",
  calendar: "Calendário",
  tasks: "Tarefas",
  projects: "Projetos",
  atas: "Atas",
  support: "Suporte",
  reports: "Relatórios",
  admin: "Administração",
};

const CATEGORY_ICONS: Record<string, typeof Eye> = {
  view: Eye,
  create: FilePlus,
  edit: FileEdit,
  delete: FileX,
  export: Download,
  approve: CheckCircle,
  manage: Settings,
};

const ROLE_COLORS = [
  { value: "#8B5CF6", label: "Roxo" },
  { value: "#3B82F6", label: "Azul" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Amarelo" },
  { value: "#EF4444", label: "Vermelho" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#6B7280", label: "Cinza" },
];

export default function AdminPermissoes() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<CompanyRole | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roleForm, setRoleForm] = useState({
    code: "",
    name: "",
    description: "",
    color: "#3B82F6",
    permissions: [] as string[],
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<CompanyRole[]>({
    queryKey: ["/api/roles"],
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<PermissionDefinition[]>({
    queryKey: ["/api/permissions"],
  });

  const createRoleMutation = useMutation({
    mutationFn: async (data: typeof roleForm) => {
      return apiRequest("/api/roles", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsRoleDialogOpen(false);
      resetForm();
      toast({ title: "Cargo criado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar cargo", variant: "destructive" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof roleForm> }) => {
      return apiRequest(`/api/roles/${id}`, { method: "PATCH", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      setIsRoleDialogOpen(false);
      resetForm();
      toast({ title: "Cargo atualizado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar cargo", variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/roles/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({ title: "Cargo excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Erro ao excluir cargo", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setRoleForm({
      code: "",
      name: "",
      description: "",
      color: "#3B82F6",
      permissions: [],
    });
    setSelectedRole(null);
    setIsEditMode(false);
  };

  const openEditDialog = (role: CompanyRole) => {
    setSelectedRole(role);
    setRoleForm({
      code: role.code,
      name: role.name,
      description: role.description || "",
      color: role.color || "#3B82F6",
      permissions: role.permissions || [],
    });
    setIsEditMode(true);
    setIsRoleDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsRoleDialogOpen(true);
  };

  const handleSubmit = () => {
    if (isEditMode && selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, data: roleForm });
    } else {
      createRoleMutation.mutate(roleForm);
    }
  };

  const togglePermission = (permCode: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permCode)
        ? prev.permissions.filter(p => p !== permCode)
        : [...prev.permissions, permCode],
    }));
  };

  const toggleModulePermissions = (module: string, checked: boolean) => {
    const modulePerms = permissions.filter(p => p.module === module).map(p => p.code);
    setRoleForm(prev => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...modulePerms])]
        : prev.permissions.filter(p => !modulePerms.includes(p)),
    }));
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>);

  const systemRoles = roles.filter(r => r.isSystem);
  const customRoles = roles.filter(r => !r.isSystem);

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="page-title">Cargos e Permissões</h1>
          <p className="text-muted-foreground">Gerencie os cargos e permissões de acesso da sua equipe</p>
        </div>
        <Button onClick={openCreateDialog} data-testid="btn-create-role">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cargo
        </Button>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles" data-testid="tab-roles">
            <Users className="h-4 w-4 mr-2" />
            Cargos
          </TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions">
            <Shield className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cargos do Sistema</CardTitle>
              <CardDescription>Cargos padrão disponíveis para todas as empresas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {systemRoles.map(role => (
                  <Card key={role.id} className="relative">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: role.color || "#6B7280" }}
                          />
                          <div>
                            <h3 className="font-semibold">{role.name}</h3>
                            <p className="text-sm text-muted-foreground">{role.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Sistema
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(role.permissions || []).slice(0, 5).map(perm => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm.split(".")[0]}
                          </Badge>
                        ))}
                        {(role.permissions || []).length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{(role.permissions || []).length - 5}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cargos Personalizados</CardTitle>
              <CardDescription>Cargos criados pela sua empresa</CardDescription>
            </CardHeader>
            <CardContent>
              {customRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum cargo personalizado criado ainda.</p>
                  <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Cargo
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {customRoles.map(role => (
                    <Card key={role.id} className="relative">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: role.color || "#6B7280" }}
                            />
                            <div>
                              <h3 className="font-semibold">{role.name}</h3>
                              <p className="text-sm text-muted-foreground">{role.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(role)}
                              data-testid={`btn-edit-role-${role.id}`}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteRoleMutation.mutate(role.id)}
                              data-testid={`btn-delete-role-${role.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {(role.permissions || []).slice(0, 5).map(perm => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm.split(".")[0]}
                            </Badge>
                          ))}
                          {(role.permissions || []).length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{(role.permissions || []).length - 5}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissões Disponíveis</CardTitle>
              <CardDescription>Lista de todas as permissões do sistema organizadas por módulo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {MODULE_LABELS[module] || module}
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {perms.map(perm => {
                        const Icon = CATEGORY_ICONS[perm.category || "view"] || Eye;
                        return (
                          <div
                            key={perm.id}
                            className="flex items-center gap-3 p-3 rounded-lg border"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{perm.name}</p>
                              <p className="text-xs text-muted-foreground">{perm.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Cargo" : "Novo Cargo"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Atualize as informações e permissões do cargo"
                : "Crie um novo cargo com permissões personalizadas"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Cargo</Label>
                <Input
                  id="name"
                  value={roleForm.name}
                  onChange={e => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Supervisor de Vendas"
                  data-testid="input-role-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={roleForm.code}
                  onChange={e => setRoleForm(prev => ({ ...prev, code: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder="Ex: supervisor_vendas"
                  data-testid="input-role-code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={roleForm.description}
                onChange={e => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva as responsabilidades deste cargo"
                data-testid="input-role-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {ROLE_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      roleForm.color === color.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setRoleForm(prev => ({ ...prev, color: color.value }))}
                    title={color.label}
                    data-testid={`btn-color-${color.value}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Permissões</Label>
              {Object.entries(groupedPermissions).map(([module, perms]) => {
                const modulePerms = perms.map(p => p.code);
                const allSelected = modulePerms.every(p => roleForm.permissions.includes(p));
                const someSelected = modulePerms.some(p => roleForm.permissions.includes(p));

                return (
                  <div key={module} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Checkbox
                        id={`module-${module}`}
                        checked={allSelected}
                        onCheckedChange={(checked) => toggleModulePermissions(module, !!checked)}
                        className={someSelected && !allSelected ? "opacity-50" : ""}
                        data-testid={`checkbox-module-${module}`}
                      />
                      <Label htmlFor={`module-${module}`} className="font-semibold cursor-pointer">
                        {MODULE_LABELS[module] || module}
                      </Label>
                      <Badge variant="secondary" className="ml-auto">
                        {roleForm.permissions.filter(p => p.startsWith(`${module}.`)).length}/{perms.length}
                      </Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 pl-6">
                      {perms.map(perm => (
                        <div key={perm.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`perm-${perm.code}`}
                            checked={roleForm.permissions.includes(perm.code)}
                            onCheckedChange={() => togglePermission(perm.code)}
                            data-testid={`checkbox-perm-${perm.code}`}
                          />
                          <Label htmlFor={`perm-${perm.code}`} className="text-sm cursor-pointer">
                            {perm.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              data-testid="btn-save-role"
            >
              {isEditMode ? "Salvar Alterações" : "Criar Cargo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
