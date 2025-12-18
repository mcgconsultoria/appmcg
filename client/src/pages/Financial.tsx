import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/brazilStates";
import type { FinancialAccount, InsertFinancialAccount } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const financialFormSchema = z.object({
  type: z.enum(["receivable", "payable"]),
  description: z.string().min(1, "Descrição é obrigatória"),
  value: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

type FinancialFormData = z.infer<typeof financialFormSchema>;

const categories = [
  "Frete",
  "Armazenagem",
  "Impostos",
  "Folha de Pagamento",
  "Combustível",
  "Manutenção",
  "Seguros",
  "Outros",
];

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "paid", label: "Pago" },
  { value: "overdue", label: "Vencido" },
  { value: "cancelled", label: "Cancelado" },
];

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "overdue":
      return "destructive";
    case "cancelled":
      return "outline";
    default:
      return "secondary";
  }
}

export default function Financial() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [activeTab, setActiveTab] = useState<"receivable" | "payable">("receivable");
  const { toast } = useToast();

  const { data: accounts = [], isLoading } = useQuery<FinancialAccount[]>({
    queryKey: ["/api/financial"],
  });

  const form = useForm<FinancialFormData>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: {
      type: "receivable",
      description: "",
      value: "",
      dueDate: "",
      category: "",
      status: "pending",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FinancialFormData) => {
      const payload: InsertFinancialAccount = {
        companyId: 1,
        type: data.type,
        description: data.description,
        value: data.value,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        category: data.category,
        status: data.status,
      };
      return apiRequest("POST", "/api/financial", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Conta criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar conta", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FinancialFormData) => {
      if (!editingAccount) return;
      return apiRequest("PATCH", `/api/financial/${editingAccount.id}`, {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial"] });
      setIsDialogOpen(false);
      setEditingAccount(null);
      form.reset();
      toast({ title: "Conta atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar conta", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/financial/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial"] });
      toast({ title: "Conta excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir conta", variant: "destructive" });
    },
  });

  const handleEdit = (account: FinancialAccount) => {
    setEditingAccount(account);
    form.reset({
      type: account.type as "receivable" | "payable",
      description: account.description,
      value: account.value?.toString() || "",
      dueDate: account.dueDate
        ? new Date(account.dueDate).toISOString().split("T")[0]
        : "",
      category: account.category || "",
      status: account.status || "pending",
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
    form.reset();
  };

  const handleNewAccount = (type: "receivable" | "payable") => {
    form.reset({
      type,
      description: "",
      value: "",
      dueDate: "",
      category: "",
      status: "pending",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: FinancialFormData) => {
    if (editingAccount) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const receivables = accounts.filter((a) => a.type === "receivable");
  const payables = accounts.filter((a) => a.type === "payable");

  const totalReceivables = receivables
    .filter((a) => a.status === "pending")
    .reduce((sum, a) => sum + Number(a.value || 0), 0);
  const totalPayables = payables
    .filter((a) => a.status === "pending")
    .reduce((sum, a) => sum + Number(a.value || 0), 0);
  const balance = totalReceivables - totalPayables;

  const filteredAccounts = activeTab === "receivable" ? receivables : payables;

  return (
    <AppLayout title="Financeiro" subtitle="Controle de contas a pagar e receber">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">A Receber</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalReceivables)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">A Pagar</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(totalPayables)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p
                    className={`text-2xl font-bold ${
                      balance >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">Contas</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleNewAccount("payable")}
                data-testid="button-new-payable"
              >
                <ArrowDownRight className="h-4 w-4 mr-2" />
                A Pagar
              </Button>
              <Button
                onClick={() => handleNewAccount("receivable")}
                data-testid="button-new-receivable"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                A Receber
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="receivable" data-testid="tab-receivables">
                  A Receber ({receivables.length})
                </TabsTrigger>
                <TabsTrigger value="payable" data-testid="tab-payables">
                  A Pagar ({payables.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                    </div>
                  </div>
                ) : filteredAccounts.length === 0 ? (
                  <div className="p-12 text-center">
                    <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-medium mb-1">Nenhuma conta encontrada</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione uma nova conta para começar
                    </p>
                    <Button onClick={() => handleNewAccount(activeTab)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="w-12" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAccounts.map((account) => (
                          <TableRow key={account.id} data-testid={`row-account-${account.id}`}>
                            <TableCell>
                              <p className="font-medium">{account.description}</p>
                            </TableCell>
                            <TableCell>{account.category || "-"}</TableCell>
                            <TableCell>
                              {account.dueDate
                                ? new Date(account.dueDate).toLocaleDateString("pt-BR")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusBadgeVariant(account.status || "")}
                                size="sm"
                              >
                                {statusOptions.find((s) => s.value === account.status)?.label ||
                                  "Pendente"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(Number(account.value || 0))}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    data-testid={`button-menu-account-${account.id}`}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(account)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteMutation.mutate(account.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Editar Conta" : "Nova Conta"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Atualize as informações da conta"
                : "Preencha os dados da nova conta"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-account-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="receivable">A Receber</SelectItem>
                        <SelectItem value="payable">A Pagar</SelectItem>
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
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-account-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          data-testid="input-account-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-account-due-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-category">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-account"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Salvando..."
                    : editingAccount
                    ? "Atualizar"
                    : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
