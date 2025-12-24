import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  HeadphonesIcon,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Ticket,
  PhoneCall,
  UserCog,
  FileText,
  Eye,
  Download,
  PenTool,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CompanyTeamMember, User, SupportTicket, SupportTicketMessage, ContractAgreement } from "@shared/schema";

const teamMemberFormSchema = z.object({
  userId: z.string().min(1, "Selecione um usuario"),
  role: z.string().min(1, "Selecione um perfil"),
  department: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>;

const ticketFormSchema = z.object({
  subject: z.string().min(1, "Assunto e obrigatorio"),
  description: z.string().min(1, "Descrição e obrigatoria"),
  category: z.string().min(1, "Categoria e obrigatoria"),
  priority: z.string().default("medium"),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  member: "Membro",
};

const departmentLabels: Record<string, string> = {
  comercial: "Comercial",
  operacao: "Operacao",
  financeiro: "Financeiro",
  sac: "SAC",
};

const permissionLabels: Record<string, string> = {
  crm: "CRM",
  checklist: "Checklist",
  calculator: "Calculadoras",
  rfi: "RFI",
  financial: "Financeiro",
  calendar: "Calendário",
  tasks: "Tarefas",
  projects: "Projetos",
};

const categoryLabels: Record<string, string> = {
  suporte: "Suporte Tecnico",
  financeiro: "Financeiro",
  comercial: "Comercial",
  tecnico: "Técnico",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  waiting_customer: "Aguardando Cliente",
  resolved: "Resolvido",
  closed: "Fechado",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-yellow-500/10 text-yellow-500",
  waiting_customer: "bg-orange-500/10 text-orange-500",
  resolved: "bg-green-500/10 text-green-500",
  closed: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-destructive/10 text-destructive",
};

const contractStatusLabels: Record<string, string> = {
  pending: "Pendente",
  sent: "Enviado",
  viewed: "Visualizado",
  signed: "Assinado",
  expired: "Expirado",
  cancelled: "Cancelado",
};

const contractStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500",
  sent: "bg-blue-500/10 text-blue-500",
  viewed: "bg-purple-500/10 text-purple-500",
  signed: "bg-green-500/10 text-green-500",
  expired: "bg-red-500/10 text-red-500",
  cancelled: "bg-muted text-muted-foreground",
};

const contractTypeLabels: Record<string, string> = {
  consultoria: "Contrato de Consultoria",
  aplicativo: "Contrato do Aplicativo",
};

function TeamTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CompanyTeamMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CompanyTeamMember | null>(null);

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      userId: "",
      role: "member",
      department: "",
      permissions: [],
      isActive: true,
    },
  });

  const { data: teamMembers = [], isLoading } = useQuery<CompanyTeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: availableUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users/available"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: TeamMemberFormData) => {
      const response = await apiRequest("POST", "/api/team-members", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/available"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Membro adicionado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TeamMemberFormData> }) => {
      const response = await apiRequest("PATCH", `/api/team-members/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsDialogOpen(false);
      setEditingMember(null);
      form.reset();
      toast({ title: "Membro atualizado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/team-members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/available"] });
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
      toast({ title: "Membro removido com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover membro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (member?: CompanyTeamMember) => {
    if (member) {
      setEditingMember(member);
      form.reset({
        userId: member.userId.toString(),
        role: member.role || "member",
        department: member.department || undefined,
        permissions: member.permissions || [],
        isActive: member.isActive ?? true,
      });
    } else {
      setEditingMember(null);
      form.reset({
        userId: "",
        role: "member",
        department: "",
        permissions: [],
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: TeamMemberFormData) => {
    if (editingMember) {
      updateMutation.mutate({ id: editingMember.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDeleteClick = (member: CompanyTeamMember) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete.id);
    }
  };

  const activeMembers = teamMembers.filter(m => m.isActive);
  const inactiveMembers = teamMembers.filter(m => !m.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Gerenciamento de Equipe</h2>
          <p className="text-sm text-muted-foreground">
            Adicione e gerencie os membros da sua empresa
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-member">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activeMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Inativos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{inactiveMembers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>Lista de todos os membros vinculados a sua empresa</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum membro cadastrado. Clique em "Adicionar Membro" para comecar.
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
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {(member as any).user?.firstName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">
                            {(member as any).user?.firstName} {(member as any).user?.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(member as any).user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[member.role || "member"] || member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.department ? (
                        <Badge variant="outline">
                          <Building2 className="h-3 w-3 mr-1" />
                          {departmentLabels[member.department] || member.department}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.permissions && member.permissions.length > 0 ? (
                          member.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {permissionLabels[perm] || perm}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">Sem permissoes</span>
                        )}
                        {member.permissions && member.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.permissions.length - 3}
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
                          onClick={() => handleOpenDialog(member)}
                          data-testid={`button-edit-member-${member.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClick(member)}
                          data-testid={`button-delete-member-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Editar Membro" : "Adicionar Membro"}
            </DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Atualize as informações do membro da equipe"
                : "Preencha os dados para adicionar um novo membro"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!editingMember && (
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-user">
                            <SelectValue placeholder="Selecione um usuario" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUsers.map((u) => (
                            <SelectItem key={u.id} value={u.id.toString()}>
                              {u.firstName} {u.lastName} ({u.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Selecione o perfil" />
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
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="operacao">Operacao</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="sac">SAC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissoes</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(permissionLabels).map(([key, label]) => (
                        <FormField
                          key={key}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(key)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, key]);
                                    } else {
                                      field.onChange(current.filter((v) => v !== key));
                                    }
                                  }}
                                  data-testid={`checkbox-perm-${key}`}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
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
                        data-testid="checkbox-active"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Membro ativo</FormLabel>
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
                    : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este membro da equipe? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SupportTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "",
      priority: "medium",
    },
  });

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  const { data: messages = [] } = useQuery<SupportTicketMessage[]>({
    queryKey: ["/api/support-tickets", selectedTicket?.id, "messages"],
    enabled: !!selectedTicket,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest("POST", "/api/support-tickets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Ticket criado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { ticketId: number; message: string }) => {
      const response = await apiRequest(
        "POST",
        `/api/support-tickets/${data.ticketId}/messages`,
        { message: data.message }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/support-tickets", selectedTicket?.id, "messages"],
      });
      setNewMessage("");
      toast({ title: "Mensagem enviada!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;
    sendMessageMutation.mutate({
      ticketId: selectedTicket.id,
      message: newMessage.trim(),
    });
  };

  const openTickets = tickets.filter((t) => t.status === "open");
  const inProgressTickets = tickets.filter((t) => t.status === "in_progress");
  const resolvedTickets = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  );

  const whatsappNumber = "5511999999999";
  const whatsappMessage = encodeURIComponent(
    "Ola! Preciso de suporte com o sistema MCG Consultoria."
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Central de Suporte</h2>
          <p className="text-sm text-muted-foreground">
            Abra tickets ou entre em contato pelo WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-whatsapp"
            >
              <SiWhatsapp className="h-4 w-4 mr-2" />
              WhatsApp
            </a>
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-ticket">
            <Plus className="h-4 w-4 mr-2" />
            Novo Ticket
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{openTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {inProgressTickets.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {resolvedTickets.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Meus Tickets</CardTitle>
            <CardDescription>Selecione um ticket para ver os detalhes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum ticket encontrado. Clique em "Novo Ticket" para abrir um chamado.
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors hover-elevate ${
                        selectedTicket?.id === ticket.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                      data-testid={`ticket-item-${ticket.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{ticket.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            {ticket.ticketNumber}
                          </div>
                        </div>
                        <Badge className={statusColors[ticket.status || "open"]}>
                          {statusLabels[ticket.status || "open"]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[ticket.category || "suporte"]}
                        </Badge>
                        <Badge className={`text-xs ${priorityColors[ticket.priority || "medium"]}`}>
                          {priorityLabels[ticket.priority || "medium"]}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {ticket.createdAt && format(new Date(ticket.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedTicket ? selectedTicket.subject : "Detalhes do Ticket"}
            </CardTitle>
            <CardDescription>
              {selectedTicket
                ? `Ticket ${selectedTicket.ticketNumber}`
                : "Selecione um ticket para ver a conversa"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-sm">{selectedTicket.description}</p>
                </div>

                <ScrollArea className="h-[250px] border rounded-md p-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Nenhuma mensagem ainda
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2 rounded-md ${
                            msg.isInternal
                              ? "bg-primary/10 ml-4"
                              : "bg-muted mr-4"
                          }`}
                        >
                          <div className="text-xs text-muted-foreground mb-1">
                            {msg.isInternal ? "Suporte MCG" : "Voce"} -{" "}
                            {msg.createdAt && format(new Date(msg.createdAt), "dd/MM HH:mm")}
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {selectedTicket.status !== "closed" && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      data-testid="input-message"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um ticket para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Ticket de Suporte</DialogTitle>
            <DialogDescription>
              Descreva seu problema e nossa equipe entrara em contato
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Resumo do problema"
                        {...field}
                        data-testid="input-subject"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="suporte">Suporte Tecnico</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="técnico">Tecnico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva seu problema em detalhes..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
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
                  disabled={createTicketMutation.isPending}
                  data-testid="button-create-ticket"
                >
                  {createTicketMutation.isPending ? "Criando..." : "Criar Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContractsTab() {
  const { toast } = useToast();
  const [selectedContract, setSelectedContract] = useState<ContractAgreement | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerCpf, setSignerCpf] = useState("");

  const { data: contracts = [], isLoading } = useQuery<ContractAgreement[]>({
    queryKey: ["/api/my-contracts"],
  });

  const signMutation = useMutation({
    mutationFn: async (agreementId: number) => {
      const response = await apiRequest("POST", `/api/contract-agreements/${agreementId}/sign`, {
        signerName,
        signerCpf,
        signatureType: "eletronica",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-contracts"] });
      setSignDialogOpen(false);
      setSelectedContract(null);
      setSignerName("");
      setSignerCpf("");
      toast({ title: "Contrato assinado com sucesso!" });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao assinar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markViewedMutation = useMutation({
    mutationFn: async (agreementId: number) => {
      const response = await apiRequest("POST", `/api/contract-agreements/${agreementId}/view`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-contracts"] });
    },
  });

  const handleViewContract = (contract: ContractAgreement) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
    if (contract.status === "pending" || contract.status === "sent") {
      markViewedMutation.mutate(contract.id);
    }
  };

  const handleSignContract = (contract: ContractAgreement) => {
    setSelectedContract(contract);
    setSignDialogOpen(true);
  };

  const consultoriaContracts = contracts.filter(c => c.contractType === "consultoria");
  const aplicativoContracts = contracts.filter(c => c.contractType === "aplicativo");

  const renderContractCard = (contract: ContractAgreement) => (
    <Card key={contract.id} className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle className="text-base">
              {contractTypeLabels[contract.contractType] || contract.contractType}
            </CardTitle>
            {contract.issuedAt && (
              <p className="text-sm text-muted-foreground">
                Emitido em {format(new Date(contract.issuedAt), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>
        <Badge className={contractStatusColors[contract.status || "pending"]}>
          {contractStatusLabels[contract.status || "pending"]}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewContract(contract)}
            data-testid={`button-view-contract-${contract.id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
          {contract.status !== "signed" && contract.status !== "cancelled" && contract.status !== "expired" && (
            <Button
              size="sm"
              onClick={() => handleSignContract(contract)}
              data-testid={`button-sign-contract-${contract.id}`}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Assinar
            </Button>
          )}
          {contract.signedPdfUrl && (
            <Button
              size="sm"
              variant="outline"
              asChild
              data-testid={`button-download-contract-${contract.id}`}
            >
              <a href={contract.signedPdfUrl} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          )}
        </div>
        {contract.signedAt && (
          <p className="text-sm text-green-600 mt-2">
            Assinado em {format(new Date(contract.signedAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando contratos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contrato de Consultoria
          </h3>
          {consultoriaContracts.length > 0 ? (
            consultoriaContracts.map(renderContractCard)
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum contrato de consultoria disponivel
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contrato do Aplicativo
          </h3>
          {aplicativoContracts.length > 0 ? (
            aplicativoContracts.map(renderContractCard)
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum contrato do aplicativo disponivel
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedContract && (contractTypeLabels[selectedContract.contractType] || selectedContract.contractType)}
            </DialogTitle>
            <DialogDescription>
              Visualize os detalhes do contrato
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={contractStatusColors[selectedContract.status || "pending"]}>
                    {contractStatusLabels[selectedContract.status || "pending"]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Emissao</p>
                  <p className="font-medium">
                    {selectedContract.issuedAt
                      ? format(new Date(selectedContract.issuedAt), "dd/MM/yyyy", { locale: ptBR })
                      : "-"}
                  </p>
                </div>
                {selectedContract.viewedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Visualizado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedContract.viewedAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
                {selectedContract.signedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Assinado em</p>
                    <p className="font-medium text-green-600">
                      {format(new Date(selectedContract.signedAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>
              {selectedContract.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p>{selectedContract.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
            {selectedContract && selectedContract.status !== "signed" && selectedContract.status !== "cancelled" && (
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleSignContract(selectedContract);
              }}>
                <PenTool className="h-4 w-4 mr-2" />
                Assinar Contrato
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assinar Contrato</DialogTitle>
            <DialogDescription>
              Preencha os dados para assinar o contrato eletronicamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome Completo</label>
              <Input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Digite seu nome completo"
                data-testid="input-signer-name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">CPF</label>
              <Input
                value={signerCpf}
                onChange={(e) => setSignerCpf(e.target.value)}
                placeholder="000.000.000-00"
                data-testid="input-signer-cpf"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Ao clicar em "Assinar", voce concorda com os termos do contrato e confirma que as informações fornecidas sao verdadeiras.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedContract && signMutation.mutate(selectedContract.id)}
              disabled={!signerName || !signerCpf || signMutation.isPending}
              data-testid="button-confirm-sign"
            >
              {signMutation.isPending ? "Assinando..." : "Assinar Contrato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCliente() {
  return (
    <AppLayout title="Admin Cliente">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6" />
            Admin Cliente
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe e contratos
          </p>
        </div>

        <Tabs defaultValue="equipe" className="space-y-4">
          <TabsList>
            <TabsTrigger value="equipe" data-testid="tab-equipe">
              <Users className="h-4 w-4 mr-2" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="contratos" data-testid="tab-contratos">
              <FileText className="h-4 w-4 mr-2" />
              Contratos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="equipe">
            <TeamTab />
          </TabsContent>
          
          <TabsContent value="contratos">
            <ContractsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
