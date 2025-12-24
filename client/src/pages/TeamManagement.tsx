import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Building2,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";
import type { CompanyTeamMember, User } from "@shared/schema";

const teamMemberFormSchema = z.object({
  userId: z.string().min(1, "Selecione um usuario"),
  role: z.string().min(1, "Selecione um perfil"),
  department: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>;

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  member: "Membro",
};

const departmentLabels: Record<string, string> = {
  Comercial: "Comercial",
  Operacao: "Operação",
  Financeiro: "Financeiro",
  SAC: "SAC",
};

const permissionOptions = [
  { id: "crm", label: "CRM / Clientes" },
  { id: "checklist", label: "Checklist" },
  { id: "calculator", label: "Calculadoras" },
  { id: "rfi", label: "RFI" },
  { id: "financial", label: "Financeiro" },
  { id: "calendar", label: "Calendário" },
  { id: "tasks", label: "Tarefas" },
  { id: "projects", label: "Projetos" },
];

export default function TeamManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CompanyTeamMember | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      userId: "",
      role: "member",
      department: "",
      permissions: ["crm", "checklist", "calculator"],
      isActive: true,
    },
  });

  const { data: teamMembers = [], isLoading } = useQuery<CompanyTeamMember[]>({
    queryKey: ["/api/company-team"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      const response = await apiRequest("POST", "/api/company-team", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-team"] });
      toast({ title: "Membro adicionado com sucesso" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao adicionar membro", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TeamMemberFormData> }) => {
      const response = await apiRequest("PATCH", `/api/company-team/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-team"] });
      toast({ title: "Membro atualizado com sucesso" });
      setIsDialogOpen(false);
      setEditingMember(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar membro", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/company-team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-team"] });
      toast({ title: "Membro removido com sucesso" });
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast({ title: "Erro ao remover membro", variant: "destructive" });
    },
  });

  const handleEdit = (member: CompanyTeamMember) => {
    setEditingMember(member);
    form.reset({
      userId: member.userId,
      role: member.role || "member",
      department: member.department || "",
      permissions: (member.permissions as string[]) || [],
      isActive: member.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: TeamMemberFormData) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenNewDialog = () => {
    setEditingMember(null);
    form.reset({
      userId: "",
      role: "member",
      department: "",
      permissions: ["crm", "checklist", "calculator"],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  const activeMembers = teamMembers.filter((m) => m.isActive);
  const inactiveMembers = teamMembers.filter((m) => !m.isActive);

  return (
    <AppLayout title="Usuarios e Perfis" subtitle="Gerencie o time comercial da sua empresa">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-team-title">
              Usuarios e Perfis
            </h1>
            <p className="text-muted-foreground">
              Gerencie o time comercial da sua empresa
            </p>
          </div>
          <Button onClick={handleOpenNewDialog} data-testid="button-add-member">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Membro
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-members">
                    {teamMembers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Membros</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-active-members">
                    {activeMembers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <UserX className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-inactive-members">
                    {inactiveMembers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Inativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-admin-count">
                    {teamMembers.filter((m) => m.role === "admin").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Administradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Membros do Time
            </CardTitle>
            <CardDescription>
              Lista de usuarios com acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum membro cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione membros do seu time para gerenciar acessos
                </p>
                <Button onClick={handleOpenNewDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Permissoes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{member.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role || "member")}>
                          {roleLabels[member.role || "member"] || member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.department ? (
                          <Badge variant="outline">
                            {departmentLabels[member.department] || member.department}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {((member.permissions as string[]) || []).slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                          {((member.permissions as string[]) || []).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{((member.permissions as string[]) || []).length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(member)}
                            data-testid={`button-edit-member-${member.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteConfirmId(member.id)}
                            data-testid={`button-delete-member-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Editar Membro" : "Adicionar Membro"}
              </DialogTitle>
              <DialogDescription>
                {editingMember
                  ? "Atualize as informações do membro do time"
                  : "Adicione um novo membro ao time da empresa"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Usuario</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="email@empresa.com"
                            className="pl-10"
                            disabled={!!editingMember}
                            data-testid="input-member-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perfil</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-member-role">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="member">Membro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-member-department">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Comercial">Comercial</SelectItem>
                            <SelectItem value="Operação">Operacao</SelectItem>
                            <SelectItem value="Financeiro">Financeiro</SelectItem>
                            <SelectItem value="SAC">SAC</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <FormItem>
                      <FormLabel>Permissoes</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {permissionOptions.map((permission) => (
                          <FormField
                            key={permission.id}
                            control={form.control}
                            name="permissions"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...field.value, permission.id]);
                                      } else {
                                        field.onChange(
                                          field.value?.filter((v) => v !== permission.id)
                                        );
                                      }
                                    }}
                                    data-testid={`checkbox-permission-${permission.id}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {permission.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-member-active"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Usuario ativo
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-member"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Salvando..."
                      : editingMember
                        ? "Atualizar"
                        : "Adicionar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Remocao</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover este membro do time? Esta acao nao pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Removendo..." : "Remover"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
