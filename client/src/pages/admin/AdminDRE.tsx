import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  FolderTree,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DreAccount } from "@shared/schema";

const defaultAccounts: Partial<DreAccount>[] = [
  { code: "1", name: "RECEITA BRUTA", nature: "receita", level: 1 },
  { code: "1.1", name: "Receita de Servicos", nature: "receita", level: 2, parentId: undefined },
  { code: "1.1.1", name: "Consultoria", nature: "receita", level: 3 },
  { code: "1.1.2", name: "Licencas de Software", nature: "receita", level: 3 },
  { code: "1.1.3", name: "Treinamentos", nature: "receita", level: 3 },
  { code: "2", name: "(-) DEDUCOES DA RECEITA", nature: "custo", level: 1 },
  { code: "2.1", name: "Impostos sobre Servicos", nature: "custo", level: 2 },
  { code: "2.1.1", name: "ISS", nature: "custo", level: 3 },
  { code: "2.1.2", name: "PIS", nature: "custo", level: 3 },
  { code: "2.1.3", name: "COFINS", nature: "custo", level: 3 },
  { code: "3", name: "CUSTOS DOS SERVICOS PRESTADOS", nature: "custo", level: 1 },
  { code: "3.1", name: "Custos Diretos", nature: "custo", level: 2 },
  { code: "3.1.1", name: "Mao de Obra Direta", nature: "custo", level: 3 },
  { code: "3.1.2", name: "Materiais e Insumos", nature: "custo", level: 3 },
  { code: "4", name: "DESPESAS OPERACIONAIS", nature: "despesa", level: 1 },
  { code: "4.1", name: "Despesas Administrativas", nature: "despesa", level: 2 },
  { code: "4.1.1", name: "Salarios e Encargos", nature: "despesa", level: 3 },
  { code: "4.1.2", name: "Aluguel e Condominio", nature: "despesa", level: 3 },
  { code: "4.1.3", name: "Energia e Telecom", nature: "despesa", level: 3 },
  { code: "4.1.4", name: "Servicos de Terceiros", nature: "despesa", level: 3 },
  { code: "4.2", name: "Despesas Comerciais", nature: "despesa", level: 2 },
  { code: "4.2.1", name: "Marketing e Publicidade", nature: "despesa", level: 3 },
  { code: "4.2.2", name: "Comissoes de Vendas", nature: "despesa", level: 3 },
  { code: "4.3", name: "Despesas Financeiras", nature: "despesa", level: 2 },
  { code: "4.3.1", name: "Juros e Multas", nature: "despesa", level: 3 },
  { code: "4.3.2", name: "Tarifas Bancarias", nature: "despesa", level: 3 },
  { code: "5", name: "RESULTADO ANTES DO IR/CSLL", nature: "receita", level: 1 },
  { code: "6", name: "(-) IR/CSLL", nature: "custo", level: 1 },
  { code: "7", name: "RESULTADO LIQUIDO", nature: "receita", level: 1 },
];

const natureConfig = {
  receita: { label: "Receita", color: "text-emerald-600 dark:text-emerald-400", icon: TrendingUp },
  custo: { label: "Custo", color: "text-amber-600 dark:text-amber-400", icon: TrendingDown },
  despesa: { label: "Despesa", color: "text-red-600 dark:text-red-400", icon: DollarSign },
};

export default function AdminDRE() {
  const { toast } = useToast();
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DreAccount | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nature: "receita",
    type: "",
    parentId: "",
  });

  const { data: accounts = [], isLoading } = useQuery<DreAccount[]>({
    queryKey: ["/api/dre-accounts"],
  });

  const createAccount = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/dre-accounts", {
        ...data,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        level: data.code.split(".").length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dre-accounts"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Conta criada com sucesso" });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/dre-accounts/${id}`, {
        ...data,
        parentId: data.parentId ? parseInt(data.parentId) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dre-accounts"] });
      setDialogOpen(false);
      setEditingAccount(null);
      resetForm();
      toast({ title: "Conta atualizada com sucesso" });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/dre-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dre-accounts"] });
      toast({ title: "Conta removida com sucesso" });
    },
  });

  const seedDefaultAccounts = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/dre-accounts/seed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dre-accounts"] });
      toast({ title: "Plano de contas padrao criado com sucesso" });
    },
  });

  const resetForm = () => {
    setFormData({ code: "", name: "", nature: "receita", type: "", parentId: "" });
  };

  const openEditDialog = (account: DreAccount) => {
    setEditingAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      nature: account.nature,
      type: account.type || "",
      parentId: account.parentId?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingAccount) {
      updateAccount.mutate({ id: editingAccount.id, data: formData });
    } else {
      createAccount.mutate(formData);
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

  const buildTree = (accounts: DreAccount[], parentId: number | null = null): DreAccount[] => {
    return accounts
      .filter((a) => a.parentId === parentId)
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  const renderAccountRow = (account: DreAccount, depth: number = 0) => {
    const children = buildTree(accounts, account.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const config = natureConfig[account.nature as keyof typeof natureConfig] || natureConfig.receita;
    const Icon = config.icon;

    return (
      <div key={account.id}>
        <div
          className={`flex items-center gap-2 py-2 px-3 hover-elevate rounded-md cursor-pointer ${
            depth === 0 ? "bg-muted/50" : ""
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => hasChildren && toggleNode(account.id)}
          data-testid={`row-dre-account-${account.id}`}
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
          <span className="font-mono text-sm text-muted-foreground w-16">{account.code}</span>
          <span className={`flex-1 ${depth === 0 ? "font-semibold" : ""}`}>{account.name}</span>
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(account);
              }}
              data-testid={`button-edit-account-${account.id}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Remover esta conta?")) {
                  deleteAccount.mutate(account.id);
                }
              }}
              data-testid={`button-delete-account-${account.id}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => renderAccountRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootAccounts = buildTree(accounts, null);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              DRE - Plano de Contas
            </h1>
            <p className="text-muted-foreground">
              Estrutura de contas para Demonstracao do Resultado do Exercicio
            </p>
          </div>
          <div className="flex items-center gap-2">
            {accounts.length === 0 && (
              <Button
                variant="outline"
                onClick={() => seedDefaultAccounts.mutate()}
                disabled={seedDefaultAccounts.isPending}
                data-testid="button-seed-accounts"
              >
                <FolderTree className="h-4 w-4 mr-2" />
                Criar Plano Padrao
              </Button>
            )}
            <Button
              onClick={() => {
                resetForm();
                setEditingAccount(null);
                setDialogOpen(true);
              }}
              data-testid="button-add-account"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Arvore de Contas</CardTitle>
            <CardDescription>
              Clique nas setas para expandir/recolher as contas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8">
                <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhuma conta cadastrada. Crie o plano de contas padrao para comecar.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {rootAccounts.map((account) => renderAccountRow(account))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Conta" : "Nova Conta"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da conta contabil
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Codigo</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: 1.1.1"
                    data-testid="input-account-code"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Natureza</Label>
                  <Select
                    value={formData.nature}
                    onValueChange={(v) => setFormData({ ...formData, nature: v })}
                  >
                    <SelectTrigger data-testid="select-account-nature">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="custo">Custo</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome da Conta</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Receita de Consultoria"
                  data-testid="input-account-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Conta Pai (opcional)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(v) => setFormData({ ...formData, parentId: v })}
                >
                  <SelectTrigger data-testid="select-account-parent">
                    <SelectValue placeholder="Nenhuma (conta raiz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma (conta raiz)</SelectItem>
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.code} - {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createAccount.isPending || updateAccount.isPending}
                  data-testid="button-save-account"
                >
                  {createAccount.isPending || updateAccount.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
