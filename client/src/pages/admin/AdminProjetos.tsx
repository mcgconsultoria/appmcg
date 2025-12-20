import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminProject } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const statusLabels: Record<string, string> = {
  planning: "Planejamento",
  active: "Ativo",
  on_hold: "Pausado",
  completed: "Concluido",
  cancelled: "Cancelado",
};

const projectTypes = [
  "Diagnostico",
  "Implementacao",
  "Execucao",
  "Expansao",
];

export default function AdminProjetos() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProject | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    projectType: "",
    description: "",
    status: "planning",
    progress: 0,
    value: "",
    assignedTo: "",
  });

  const { data: projects = [], isLoading } = useQuery<AdminProject[]>({
    queryKey: ["/api/admin/projects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/projects", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Projeto criado com sucesso" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/projects/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsDialogOpen(false);
      setEditingProject(null);
      resetForm();
      toast({ title: "Projeto atualizado com sucesso" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/projects/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Projeto removido com sucesso" });
    },
  });

  const resetForm = () => {
    setForm({
      name: "",
      clientName: "",
      projectType: "",
      description: "",
      status: "planning",
      progress: 0,
      value: "",
      assignedTo: "",
    });
  };

  const handleEdit = (project: AdminProject) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      clientName: project.clientName || "",
      projectType: project.projectType || "",
      description: project.description || "",
      status: project.status || "planning",
      progress: project.progress || 0,
      value: project.value || "",
      assignedTo: project.assignedTo || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      progress: Number(form.progress),
      value: form.value || null,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-projetos-title">Projetos de Consultoria</h1>
            <p className="text-muted-foreground">Acompanhamento de projetos MCG</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingProject(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-project">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingProject ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Nome do Projeto *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    data-testid="input-project-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <Input
                      value={form.clientName}
                      onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                      data-testid="input-project-client"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={form.projectType}
                      onValueChange={(v) => setForm({ ...form, projectType: v })}
                    >
                      <SelectTrigger data-testid="select-project-type">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm({ ...form, status: v })}
                    >
                      <SelectTrigger data-testid="select-project-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planejamento</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="on_hold">Pausado</SelectItem>
                        <SelectItem value="completed">Concluido</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Progresso (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.progress}
                      onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Responsavel</Label>
                    <Input
                      value={form.assignedTo}
                      onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Descricao</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!form.name || createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-project"
                >
                  {editingProject ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum projeto cadastrado
              </CardContent>
            </Card>
          ) : (
            projects.map((project) => (
              <Collapsible
                key={project.id}
                open={expandedProject === project.id}
                onOpenChange={(open) => setExpandedProject(open ? project.id : null)}
              >
                <Card data-testid={`card-project-${project.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <Badge variant="outline">{statusLabels[project.status || "planning"]}</Badge>
                          {project.projectType && (
                            <Badge variant="secondary">{project.projectType}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.clientName || "Sem cliente"} {project.assignedTo && `| ${project.assignedTo}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(project.value)}</span>
                        <CollapsibleTrigger asChild>
                          <Button size="icon" variant="ghost">
                            {expandedProject === project.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progresso</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} />
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="pt-4 border-t">
                      {project.description && (
                        <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Remover este projeto?")) {
                              deleteMutation.mutate(project.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
