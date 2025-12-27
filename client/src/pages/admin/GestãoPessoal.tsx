import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Wallet, CreditCard, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PersonalCategory, PersonalAccount, PersonalTransaction } from "@shared/schema";

export default function GestãoPessoal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transactions");
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<PersonalTransaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<PersonalAccount | null>(null);
  const [editingCategory, setEditingCategory] = useState<PersonalCategory | null>(null);

  const [txType, setTxType] = useState("expense");
  const [txAccountId, setTxAccountId] = useState("");
  const [txCategoryId, setTxCategoryId] = useState("");
  const [txLinkedToMcg, setTxLinkedToMcg] = useState("false");
  const [txMcgRecordType, setTxMcgRecordType] = useState("");
  const [accAccountType, setAccAccountType] = useState("checking");
  const [catType, setCatType] = useState("expense");

  const openTransactionDialog = (tx?: PersonalTransaction) => {
    if (tx) {
      setEditingTransaction({ ...tx });
      setTxType(tx.type || "expense");
      setTxAccountId(tx.accountId?.toString() || "");
      setTxCategoryId(tx.categoryId?.toString() || "");
      setTxLinkedToMcg(tx.linkedToMcg ? "true" : "false");
      setTxMcgRecordType(tx.mcgRecordType || "");
    } else {
      setEditingTransaction(null);
      setTxType("expense");
      setTxAccountId("");
      setTxCategoryId("");
      setTxLinkedToMcg("false");
      setTxMcgRecordType("");
    }
    setShowTransactionDialog(true);
  };

  const closeTransactionDialog = () => {
    setShowTransactionDialog(false);
    setEditingTransaction(null);
    setTxType("expense");
    setTxAccountId("");
    setTxCategoryId("");
    setTxLinkedToMcg("false");
    setTxMcgRecordType("");
  };

  const openAccountDialog = (acc?: PersonalAccount) => {
    if (acc) {
      setEditingAccount({ ...acc });
      setAccAccountType(acc.accountType || "checking");
    } else {
      setEditingAccount(null);
      setAccAccountType("checking");
    }
    setShowAccountDialog(true);
  };

  const closeAccountDialog = () => {
    setShowAccountDialog(false);
    setEditingAccount(null);
    setAccAccountType("checking");
  };

  const openCategoryDialog = (cat?: PersonalCategory) => {
    if (cat) {
      setEditingCategory({ ...cat });
      setCatType(cat.type || "expense");
    } else {
      setEditingCategory(null);
      setCatType("expense");
    }
    setShowCategoryDialog(true);
  };

  const closeCategoryDialog = () => {
    setShowCategoryDialog(false);
    setEditingCategory(null);
    setCatType("expense");
  };


  const { data: transactions = [], isLoading: loadingTransactions } = useQuery<PersonalTransaction[]>({
    queryKey: ["/api/admin/personal/transactions"],
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<PersonalAccount[]>({
    queryKey: ["/api/admin/personal/accounts"],
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery<PersonalCategory[]>({
    queryKey: ["/api/admin/personal/categories"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingTransaction) {
        return apiRequest("PATCH", `/api/admin/personal/transactions/${editingTransaction.id}`, data);
      }
      return apiRequest("POST", "/api/admin/personal/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/transactions"] });
      const wasEditing = !!editingTransaction;
      closeTransactionDialog();
      toast({ title: wasEditing ? "Transação atualizada" : "Transação criada" });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/personal/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/transactions"] });
      toast({ title: "Transação excluída" });
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingAccount) {
        return apiRequest("PATCH", `/api/admin/personal/accounts/${editingAccount.id}`, data);
      }
      return apiRequest("POST", "/api/admin/personal/accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/accounts"] });
      const wasEditing = !!editingAccount;
      closeAccountDialog();
      toast({ title: wasEditing ? "Conta atualizada" : "Conta criada" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/personal/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/accounts"] });
      toast({ title: "Conta excluída" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingCategory) {
        return apiRequest("PATCH", `/api/admin/personal/categories/${editingCategory.id}`, data);
      }
      return apiRequest("POST", "/api/admin/personal/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/categories"] });
      const wasEditing = !!editingCategory;
      closeCategoryDialog();
      toast({ title: wasEditing ? "Categoria atualizada" : "Categoria criada" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/personal/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/personal/categories"] });
      toast({ title: "Categoria excluída" });
    },
  });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + parseFloat(t.amount || "0"), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + parseFloat(t.amount || "0"), 0);
  const balance = totalIncome - totalExpense;

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      accountId: txAccountId ? parseInt(txAccountId) : null,
      categoryId: txCategoryId ? parseInt(txCategoryId) : null,
      type: txType,
      description: formData.get("description"),
      amount: formData.get("amount"),
      date: formData.get("date"),
      notes: formData.get("notes"),
      linkedToMcg: txLinkedToMcg === "true",
      mcgRecordType: txMcgRecordType || null,
    };
    createTransactionMutation.mutate(data);
  };

  const handleAccountSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      bankName: formData.get("bankName"),
      accountType: accAccountType,
      initialBalance: formData.get("initialBalance") || "0",
      currentBalance: formData.get("currentBalance") || "0",
      color: formData.get("color"),
    };
    createAccountMutation.mutate(data);
  };

  const handleCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      type: catType,
      icon: formData.get("icon"),
      color: formData.get("color"),
    };
    createCategoryMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Gestao Pessoal</h1>
            <p className="text-muted-foreground">Controle suas finanças pessoais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-total-income">
                R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600" data-testid="text-total-expense">
                R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`} data-testid="text-balance">
                R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transactions" data-testid="tab-transactions">Transações</TabsTrigger>
            <TabsTrigger value="accounts" data-testid="tab-accounts">Contas</TabsTrigger>
            <TabsTrigger value="categories" data-testid="tab-categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showTransactionDialog} onOpenChange={(open) => { if (!open) closeTransactionDialog(); }}>
                <Button onClick={() => openTransactionDialog()} data-testid="button-add-transaction">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleTransactionSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={txType} onValueChange={setTxType}>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Receita</SelectItem>
                            <SelectItem value="expense">Despesa</SelectItem>
                            <SelectItem value="transfer">Transferência</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Conta</Label>
                        <Select value={txAccountId} onValueChange={setTxAccountId}>
                          <SelectTrigger data-testid="select-account">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map(acc => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input name="description" defaultValue={editingTransaction?.description || ""} required data-testid="input-description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input name="amount" type="number" step="0.01" defaultValue={editingTransaction?.amount || ""} required data-testid="input-amount" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input name="date" type="date" defaultValue={editingTransaction?.date || new Date().toISOString().split("T")[0]} required data-testid="input-date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={txCategoryId} onValueChange={setTxCategoryId}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Vinculação MCG</Label>
                      <Select value={txLinkedToMcg} onValueChange={setTxLinkedToMcg}>
                        <SelectTrigger data-testid="select-linked-mcg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="false">Não vinculado</SelectItem>
                          <SelectItem value="true">Vinculado a MCG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo MCG (se vinculado)</Label>
                      <Select value={txMcgRecordType} onValueChange={setTxMcgRecordType}>
                        <SelectTrigger data-testid="select-mcg-type">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prolabore">Pró-labore</SelectItem>
                          <SelectItem value="dividendo">Dividendo</SelectItem>
                          <SelectItem value="reembolso">Reembolso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea name="notes" defaultValue={editingTransaction?.notes || ""} data-testid="input-notes" />
                    </div>
                    <Button type="submit" className="w-full" disabled={createTransactionMutation.isPending} data-testid="button-save-transaction">
                      {createTransactionMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loadingTransactions ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : transactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma transação cadastrada
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.map(t => (
                  <Card key={t.id} data-testid={`card-transaction-${t.id}`}>
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${t.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {t.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{t.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.date ? format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR }) : ""}
                            {t.linkedToMcg && <Badge variant="secondary" className="ml-2">MCG</Badge>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "income" ? "+" : "-"} R$ {parseFloat(t.amount || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        <Button size="icon" variant="ghost" onClick={() => openTransactionDialog(t)} data-testid={`button-edit-transaction-${t.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteTransactionMutation.mutate(t.id)} data-testid={`button-delete-transaction-${t.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showAccountDialog} onOpenChange={(open) => { if (!open) closeAccountDialog(); }}>
                <Button onClick={() => openAccountDialog()} data-testid="button-add-account">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Conta
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingAccount ? "Editar Conta" : "Nova Conta"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAccountSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome da Conta</Label>
                      <Input name="name" defaultValue={editingAccount?.name || ""} required data-testid="input-account-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input name="bankName" defaultValue={editingAccount?.bankName || ""} data-testid="input-bank-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <Select value={accAccountType} onValueChange={setAccAccountType}>
                        <SelectTrigger data-testid="select-account-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Conta Corrente</SelectItem>
                          <SelectItem value="savings">Poupança</SelectItem>
                          <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                          <SelectItem value="investment">Investimento</SelectItem>
                          <SelectItem value="cash">Dinheiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Saldo Inicial</Label>
                        <Input name="initialBalance" type="number" step="0.01" defaultValue={editingAccount?.initialBalance || "0"} data-testid="input-initial-balance" />
                      </div>
                      <div className="space-y-2">
                        <Label>Saldo Atual</Label>
                        <Input name="currentBalance" type="number" step="0.01" defaultValue={editingAccount?.currentBalance || "0"} data-testid="input-current-balance" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createAccountMutation.isPending} data-testid="button-save-account">
                      {createAccountMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loadingAccounts ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma conta cadastrada
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => (
                  <Card key={acc.id} data-testid={`card-account-${acc.id}`}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">{acc.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openAccountDialog(acc)} data-testid={`button-edit-account-${acc.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteAccountMutation.mutate(acc.id)} data-testid={`button-delete-account-${acc.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{acc.bankName || "Sem banco"}</p>
                      <p className="text-2xl font-bold mt-2">
                        R$ {parseFloat(acc.currentBalance || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {acc.accountType === "checking" ? "Conta Corrente" :
                         acc.accountType === "savings" ? "Poupança" :
                         acc.accountType === "credit_card" ? "Cartão de Crédito" :
                         acc.accountType === "investment" ? "Investimento" : "Dinheiro"}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={showCategoryDialog} onOpenChange={(open) => { if (!open) closeCategoryDialog(); }}>
                <Button onClick={() => openCategoryDialog()} data-testid="button-add-category">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input name="name" defaultValue={editingCategory?.name || ""} required data-testid="input-category-name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={catType} onValueChange={setCatType}>
                        <SelectTrigger data-testid="select-category-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={createCategoryMutation.isPending} data-testid="button-save-category">
                      {createCategoryMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {loadingCategories ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : categories.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma categoria cadastrada
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <Card key={cat.id} data-testid={`card-category-${cat.id}`}>
                    <CardContent className="flex items-center justify-between gap-2 py-4">
                      <div>
                        <p className="font-medium">{cat.name}</p>
                        <Badge variant={cat.type === "income" ? "default" : "secondary"}>
                          {cat.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openCategoryDialog(cat)} data-testid={`button-edit-category-${cat.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteCategoryMutation.mutate(cat.id)} data-testid={`button-delete-category-${cat.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
