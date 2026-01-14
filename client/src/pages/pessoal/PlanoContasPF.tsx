import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminPessoalLayout } from "@/components/AdminPessoalLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PersonalCategory } from "@shared/schema";

const categoryTypes = [
  { value: "receita", label: "Receita", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100", icon: TrendingUp },
  { value: "despesa", label: "Despesa", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100", icon: TrendingDown },
  { value: "transferencia", label: "Transferencia", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100", icon: ArrowRightLeft },
];

const defaultReceitasContas = [
  "Salario",
  "Pro-Labore",
  "Dividendos",
  "Aluguel Recebido",
  "Rendimentos Investimentos",
  "Pensao/Aposentadoria",
  "Freelance/Trabalho Autonomo",
  "Venda de Bens",
  "Restituicao IR",
  "Outros Rendimentos",
];

const defaultDespesasContas = [
  "Moradia (Aluguel/Financiamento)",
  "Condominio",
  "IPTU",
  "Energia Eletrica",
  "Agua e Esgoto",
  "Gas",
  "Internet/TV/Telefone",
  "Supermercado",
  "Restaurantes/Delivery",
  "Combustivel",
  "Transporte Publico",
  "Estacionamento/Pedagio",
  "Manutencao Veiculo",
  "IPVA/Licenciamento",
  "Seguro Veiculo",
  "Plano de Saude",
  "Medicamentos",
  "Consultas Medicas",
  "Academia/Esportes",
  "Educacao (Mensalidades)",
  "Cursos/Livros",
  "Vestuario",
  "Lazer/Entretenimento",
  "Viagens/Ferias",
  "Presentes",
  "Assinaturas (Streaming)",
  "Servicos Domesticos",
  "Pet (Animais)",
  "Seguros (Vida/Residencial)",
  "Previdencia Privada",
  "Investimentos",
  "Impostos",
  "Taxas Bancarias",
  "Cartao de Credito (Juros)",
  "Emprestimos/Financiamentos",
  "Doacoes",
  "Outros Gastos",
];

export default function PlanoContasPF() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PersonalCategory | null>(null);
  const [formType, setFormType] = useState<"receita" | "despesa" | "transferencia">("despesa");
  const [formName, setFormName] = useState("");

  const { data: categories = [], isLoading } = useQuery<PersonalCategory[]>({
    queryKey: ["/api/personal-categories"],
  });

  const createCategory = useMutation({
    mutationFn: async (data: { name: string; type: string }) => {
      return apiRequest("POST", "/api/personal-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-categories"] });
      closeDialog();
      toast({ title: "Conta criada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar conta", variant: "destructive" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; type: string } }) => {
      return apiRequest("PATCH", `/api/personal-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-categories"] });
      closeDialog();
      toast({ title: "Conta atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar conta", variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/personal-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-categories"] });
      toast({ title: "Conta excluida" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir conta", variant: "destructive" });
    },
  });

  const openDialog = (type: "receita" | "despesa" | "transferencia") => {
    setFormType(type);
    setFormName("");
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const openEditDialog = (category: PersonalCategory) => {
    setEditingCategory(category);
    setFormType(category.type as "receita" | "despesa" | "transferencia");
    setFormName(category.name);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        data: { name: formName, type: formType },
      });
    } else {
      createCategory.mutate({ name: formName, type: formType });
    }
  };

  const receitaCategories = categories.filter((c) => c.type === "receita");
  const despesaCategories = categories.filter((c) => c.type === "despesa");
  const transferenciaCategories = categories.filter((c) => c.type === "transferencia");

  return (
    <AdminPessoalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Plano de Contas Pessoal
          </h1>
          <p className="text-muted-foreground">
            Organize suas categorias de receitas e despesas pessoais
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <Accordion type="multiple" defaultValue={["receitas", "despesas"]} className="space-y-4">
            <AccordionItem value="receitas" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Receitas</span>
                  <Badge variant="secondary" className="ml-2">
                    {receitaCategories.length} contas
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {receitaCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Nenhuma conta de receita cadastrada. Sugestoes: {defaultReceitasContas.slice(0, 3).join(", ")}...
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {receitaCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg"
                          data-testid={`row-category-${category.id}`}
                        >
                          <span className="font-medium">{category.name}</span>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(category)}
                              data-testid={`button-edit-${category.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteCategory.mutate(category.id)}
                              data-testid={`button-delete-${category.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openDialog("receita")}
                    data-testid="button-add-receita"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Receita
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="despesas" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="font-semibold">Despesas</span>
                  <Badge variant="secondary" className="ml-2">
                    {despesaCategories.length} contas
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {despesaCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Nenhuma conta de despesa cadastrada. Sugestoes: {defaultDespesasContas.slice(0, 3).join(", ")}...
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {despesaCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/30 rounded-lg"
                          data-testid={`row-category-${category.id}`}
                        >
                          <span className="font-medium">{category.name}</span>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(category)}
                              data-testid={`button-edit-${category.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteCategory.mutate(category.id)}
                              data-testid={`button-delete-${category.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openDialog("despesa")}
                    data-testid="button-add-despesa"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Despesa
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="transferencias" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Transferencias</span>
                  <Badge variant="secondary" className="ml-2">
                    {transferenciaCategories.length} contas
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {transferenciaCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">
                      Nenhuma conta de transferencia cadastrada.
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {transferenciaCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
                          data-testid={`row-category-${category.id}`}
                        >
                          <span className="font-medium">{category.name}</span>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditDialog(category)}
                              data-testid={`button-edit-${category.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteCategory.mutate(category.id)}
                              data-testid={`button-delete-${category.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openDialog("transferencia")}
                    data-testid="button-add-transferencia"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Transferencia
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sugestoes de Contas</CardTitle>
            <CardDescription>
              Clique para adicionar rapidamente contas comuns de pessoa fisica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Receitas</h4>
                <div className="flex flex-wrap gap-2">
                  {defaultReceitasContas.map((nome) => (
                    <Badge
                      key={nome}
                      variant="outline"
                      className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-900"
                      onClick={() => createCategory.mutate({ name: nome, type: "receita" })}
                      data-testid={`badge-sugestao-receita-${nome}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {nome}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-red-700 dark:text-red-400 mb-2">Despesas</h4>
                <div className="flex flex-wrap gap-2">
                  {defaultDespesasContas.slice(0, 15).map((nome) => (
                    <Badge
                      key={nome}
                      variant="outline"
                      className="cursor-pointer hover:bg-red-100 dark:hover:bg-red-900"
                      onClick={() => createCategory.mutate({ name: nome, type: "despesa" })}
                      data-testid={`badge-sugestao-despesa-${nome}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {nome}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Conta" : "Nova Conta"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Conta</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Salario, Aluguel, Supermercado..."
                  required
                  data-testid="input-category-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as "receita" | "despesa" | "transferencia")}>
                  <SelectTrigger data-testid="select-category-type">
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
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} data-testid="button-save-category">
                  {editingCategory ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPessoalLayout>
  );
}
