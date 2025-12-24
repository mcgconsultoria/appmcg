import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, FolderKanban, Trash2, Edit2, Loader2, Calendar, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Project, Task, Client } from "@shared/schema";
import { ClientCombobox } from "@/components/ClientCombobox";
import { AppLayout } from "@/components/layout/AppLayout";

const statusOptions = [
  { value: "planning", label: "Planejamento", color: "secondary" },
  { value: "active", label: "Ativo", color: "default" },
  { value: "on_hold", label: "Em Pausa", color: "outline" },
  { value: "completed", label: "Concluido", color: "default" },
  { value: "cancelled", label: "Cancelado", color: "destructive" },
];

export default function ProjectsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    startDate: "",
    endDate: "",
    clientId: "",
  });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Projeto criado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar projeto", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Projeto atualizado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar projeto", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Projeto excluido com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir projeto", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "planning",
      startDate: "",
      endDate: "",
      clientId: "",
    });
    setSelectedProject(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      description: formData.description || null,
      status: formData.status,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      clientId: formData.clientId && formData.clientId !== "none" ? parseInt(formData.clientId) : null,
      companyId: 1,
    };

    if (selectedProject) {
      updateMutation.mutate({ id: selectedProject.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status || "planning",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
      clientId: project.clientId?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const getStatusInfo = (status: string | null) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getProjectTasks = (projectId: number) => {
    return tasks?.filter(t => t.projectId === projectId) || [];
  };

  const getProjectProgress = (projectId: number) => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === "completed").length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  if (isLoading) {
    return (
      <AppLayout title="Projetos" subtitle="Acompanhe seus projetos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Projetos" subtitle="Acompanhe seus projetos">
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-4 flex-wrap">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-project">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedProject ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
              <DialogDescription>
                Crie um novo projeto para organizar tarefas
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Implementacao do CRM"
                  required
                  data-testid="input-project-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva os objetivos do projeto"
                  rows={3}
                  data-testid="input-project-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Cliente (opcional)</Label>
                <ClientCombobox
                  clients={clients || []}
                  value={formData.clientId}
                  onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                  placeholder="Buscar cliente..."
                  allowNone={true}
                  showAddButton={true}
                  data-testid="select-client"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-project">
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    selectedProject ? "Atualizar" : "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!projects?.length ? (
        <Card className="p-12 text-center">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum projeto registrado</h3>
          <p className="text-muted-foreground mb-4">
            Crie seu primeiro projeto para organizar suas iniciativas
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Projeto
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const statusInfo = getStatusInfo(project.status);
            const projectTasks = getProjectTasks(project.id);
            const progress = getProjectProgress(project.id);
            const completedTasks = projectTasks.filter(t => t.status === "completed").length;

            return (
              <Card key={project.id} className="hover-elevate" data-testid={`project-card-${project.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={statusInfo.color as any}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectTasks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {completedTasks} concluida(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <ListTodo className="h-3 w-3" />
                          {projectTasks.length} total
                        </span>
                      </div>
                    </div>
                  )}
                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {project.startDate && format(new Date(project.startDate), "dd/MM/yy", { locale: ptBR })}
                      {project.startDate && project.endDate && " - "}
                      {project.endDate && format(new Date(project.endDate), "dd/MM/yy", { locale: ptBR })}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center gap-1 w-full justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(project)}
                      data-testid={`button-edit-project-${project.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(project.id)}
                      data-testid={`button-delete-project-${project.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </AppLayout>
  );
}
