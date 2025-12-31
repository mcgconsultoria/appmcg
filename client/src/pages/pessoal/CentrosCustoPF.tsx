import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminPessoalLayout } from "@/components/AdminPessoalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  Pencil,
  Trash2,
  Building2,
  FolderTree,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PersonalCategory } from "@shared/schema";

const categoryTypes = [
  { value: "receita", label: "Receita", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "despesa", label: "Despesa", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
  { value: "transferencia", label: "Transferencia", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
];

const defaultCategories = [
  { name: "Moradia", type: "despesa" },
  { name: "Alimentacao", type: "despesa" },
  { name: "Transporte", type: "despesa" },
  { name: "Saude", type: "despesa" },
  { name: "Educacao", type: "despesa" },
  { name: "Lazer", type: "despesa" },
  { name: "Vestuario", type: "despesa" },
  { name: "Investimentos", type: "despesa" },
  { name: "Salario", type: "receita" },
  { name: "Pro-Labore", type: "receita" },
  { name: "Dividendos", type: "receita" },
  { name: "Aluguel Recebido", type: "receita" },
  { name: "Outros Rendimentos", type: "receita" },
];

export default function CentrosCustoPF() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PersonalCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "despesa" as "receita" | "despesa" | "transferencia",
    color: "",
  });

  const { data: categories = [], isLoading } = useQuery<PersonalCategory[]>({
    queryKey: ["/api/personal-categories"],
  });

  const createCategory = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/personal-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-categories"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Categoria criada com sucesso" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/personal-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-categories"] });
      setDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast({ title: "Categoria atualizada com sucesso" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/personal-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-categories"] });
      toast({ title: "Categoria removida com sucesso" });
    },
  });

  const createDefaultCategories = useMutation({
    mutationFn: async () => {
      for (const cat of defaultCategories) {
        await apiRequest("POST", "/api/personal-categories", cat);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-categories"] });
      toast({ title: "Categorias padrao criadas com sucesso" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "despesa",
      color: "",
    });
  };

  const openEditDialog = (category: PersonalCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type as "receita" | "despesa" | "transferencia",
      color: category.color || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategory.mutate(formData);
    }
  };

  const getCategoryTypeInfo = (type: string) => {
    return categoryTypes.find(t => t.value === type) || categoryTypes[1];
  };

  const receitaCategories = categories.filter(c => c.type === "receita");
  const despesaCategories = categories.filter(c => c.type === "despesa");
  const transferenciaCategories = categories.filter(c => c.type === "transferencia");

  return (
    <AdminPessoalLayout title="Centros de Custo PF">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderTree className="h-6 w-6" />
              Centros de Custo Pessoal
            </h1>
            <p className="text-muted-foreground">
              Organize suas financas pessoais por categorias
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.length === 0 && (
              <Button
                variant="outline"
                onClick={() => createDefaultCategories.mutate()}
                disabled={createDefaultCategories.isPending}
                data-testid="button-create-default-categories"
              >
                <FolderTree className="h-4 w-4 mr-2" />
                Criar Categorias Padrao
              </Button>
            )}
            <Button
              onClick={() => {
                resetForm();
                setEditingCategory(null);
                setDialogOpen(true);
              }}
              data-testid="button-add-pf-category"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma categoria cadastrada. Crie categorias para organizar suas financas.
              </p>
              <Button
                onClick={() => createDefaultCategories.mutate()}
                disabled={createDefaultCategories.isPending}
              >
                <FolderTree className="h-4 w-4 mr-2" />
                Criar Categorias Padrao
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                  Receitas
                  <Badge variant="secondary">{receitaCategories.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {receitaCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 rounded-md bg-green-50 dark:bg-green-900/20"
                    data-testid={`category-receita-${category.id}`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remover esta categoria?")) {
                            deleteCategory.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {receitaCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma categoria de receita
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                  Despesas
                  <Badge variant="secondary">{despesaCategories.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {despesaCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 rounded-md bg-red-50 dark:bg-red-900/20"
                    data-testid={`category-despesa-${category.id}`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remover esta categoria?")) {
                            deleteCategory.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {despesaCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma categoria de despesa
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  Transferencias
                  <Badge variant="secondary">{transferenciaCategories.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {transferenciaCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 rounded-md bg-blue-50 dark:bg-blue-900/20"
                    data-testid={`category-transferencia-${category.id}`}
                  >
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remover esta categoria?")) {
                            deleteCategory.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                {transferenciaCategories.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma categoria de transferencia
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                Crie categorias para organizar suas financas pessoais
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Categoria</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Alimentacao, Salario, etc."
                  data-testid="input-pf-category-name"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: "receita" | "despesa" | "transferencia") => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger data-testid="select-pf-category-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor (opcional)</Label>
                <Input
                  type="color"
                  value={formData.color || "#3b82f6"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-full"
                  data-testid="input-pf-category-color"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createCategory.isPending || updateCategory.isPending || !formData.name}
                  data-testid="button-save-pf-category"
                >
                  {createCategory.isPending || updateCategory.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPessoalLayout>
  );
}
