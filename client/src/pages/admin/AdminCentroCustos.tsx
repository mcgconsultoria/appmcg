import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  Building2,
  Users,
  Briefcase,
  FolderTree,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CostCenter } from "@shared/schema";

const typeConfig = {
  administrativo: { label: "Administrativo", color: "text-blue-600 dark:text-blue-400", icon: Building2 },
  comercial: { label: "Comercial", color: "text-emerald-600 dark:text-emerald-400", icon: Users },
  operacional: { label: "Operacional", color: "text-amber-600 dark:text-amber-400", icon: Settings },
  projeto: { label: "Projeto", color: "text-violet-600 dark:text-violet-400", icon: Briefcase },
};

export default function AdminCentroCustos() {
  const { toast } = useToast();
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<CostCenter | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "administrativo",
    description: "",
    budget: "",
    parentId: "",
  });

  const { data: centers = [], isLoading } = useQuery<CostCenter[]>({
    queryKey: ["/api/cost-centers"],
  });

  const createCenter = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/cost-centers", {
        ...data,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        budget: data.budget ? data.budget : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-centers"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Centro de custo criado com sucesso" });
    },
  });

  const updateCenter = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/cost-centers/${id}`, {
        ...data,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        budget: data.budget ? data.budget : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-centers"] });
      setDialogOpen(false);
      setEditingCenter(null);
      resetForm();
      toast({ title: "Centro de custo atualizado com sucesso" });
    },
  });

  const deleteCenter = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/cost-centers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-centers"] });
      toast({ title: "Centro de custo removido com sucesso" });
    },
  });

  const seedDefaultCenters = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cost-centers/seed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cost-centers"] });
      toast({ title: "Centros de custo padrao criados com sucesso" });
    },
  });

  const resetForm = () => {
    setFormData({ code: "", name: "", type: "administrativo", description: "", budget: "", parentId: "" });
  };

  const openEditDialog = (center: CostCenter) => {
    setEditingCenter(center);
    setFormData({
      code: center.code,
      name: center.name,
      type: center.type || "administrativo",
      description: center.description || "",
      budget: center.budget?.toString() || "",
      parentId: center.parentId?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCenter) {
      updateCenter.mutate({ id: editingCenter.id, data: formData });
    } else {
      createCenter.mutate(formData);
    }
  };

  const toggleNode = (id: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const buildTree = (centers: CostCenter[], parentId: number | null = null): CostCenter[] => {
    return centers
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  const renderCenterRow = (center: CostCenter, depth: number = 0) => {
    const children = buildTree(centers, center.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(center.id);
    const config = typeConfig[center.type as keyof typeof typeConfig] || typeConfig.administrativo;
    const Icon = config.icon;

    return (
      <div key={center.id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 hover-elevate rounded-md cursor-pointer ${
            depth === 0 ? "bg-muted/50" : ""
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => hasChildren && toggleNode(center.id)}
          data-testid={`row-cost-center-${center.id}`}
        >
          <div className="w-5">
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            )}
          </div>
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className="font-mono text-sm text-muted-foreground w-16">{center.code}</span>
          <span className={`flex-1 ${depth === 0 ? "font-semibold" : ""}`}>{center.name}</span>
          {center.budget && (
            <span className="text-sm text-muted-foreground">
              R$ {parseFloat(center.budget).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          )}
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(center);
              }}
              data-testid={`button-edit-center-${center.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Remover este centro de custo?")) {
                  deleteCenter.mutate(center.id);
                }
              }}
              data-testid={`button-delete-center-${center.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderCenterRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootCenters = buildTree(centers, null);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderTree className="h-6 w-6" />
              Centro de Custos
            </h1>
            <p className="text-muted-foreground">
              Estrutura hierarquica de centros de custo para consultoria e licencas SaaS
            </p>
          </div>
          <div className="flex items-center gap-2">
            {centers.length === 0 && (
              <Button
                variant="outline"
                onClick={() => seedDefaultCenters.mutate()}
                disabled={seedDefaultCenters.isPending}
                data-testid="button-seed-centers"
              >
                <FolderTree className="h-4 w-4 mr-2" />
                Criar Estrutura Padrao
              </Button>
            )}
            <Button
              onClick={() => {
                resetForm();
                setEditingCenter(null);
                setDialogOpen(true);
              }}
              data-testid="button-add-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Centro
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Arvore de Centros de Custo</CardTitle>
            <CardDescription>
              Organize os custos por area: Administrativo, Comercial, Operacional, Projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : centers.length === 0 ? (
              <div className="text-center py-8">
                <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum centro de custo cadastrado. Crie a estrutura padrao para comecar.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {rootCenters.map((center) => renderCenterRow(center))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCenter ? "Editar Centro de Custo" : "Novo Centro de Custo"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do centro de custo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Codigo</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: ADM.01"
                    data-testid="input-center-code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger data-testid="select-center-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="projeto">Projeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Marketing Digital"
                  data-testid="input-center-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Orcamento Mensal (opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-center-budget"
                />
              </div>
              <div className="space-y-2">
                <Label>Centro Pai (opcional)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(v) => setFormData({ ...formData, parentId: v })}
                >
                  <SelectTrigger data-testid="select-center-parent">
                    <SelectValue placeholder="Nenhum (centro raiz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum (centro raiz)</SelectItem>
                    {centers.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descricao (opcional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descricao do centro de custo..."
                  rows={2}
                  data-testid="textarea-center-description"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createCenter.isPending || updateCenter.isPending}
                  data-testid="button-save-center"
                >
                  {createCenter.isPending || updateCenter.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
