import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminPessoalLayout } from "@/components/AdminPessoalLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Landmark,
  CreditCard,
  Star,
  QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PersonalAccount } from "@shared/schema";

const banksList = [
  { code: "001", name: "Banco do Brasil" },
  { code: "033", name: "Santander" },
  { code: "104", name: "Caixa Economica Federal" },
  { code: "237", name: "Bradesco" },
  { code: "341", name: "Itau Unibanco" },
  { code: "336", name: "C6 Bank" },
  { code: "260", name: "Nubank" },
  { code: "077", name: "Inter" },
  { code: "212", name: "Original" },
  { code: "756", name: "Sicoob" },
  { code: "748", name: "Sicredi" },
  { code: "422", name: "Safra" },
];

const pixKeyTypes = [
  { value: "cpf", label: "CPF" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave Aleatoria" },
];

export default function ContasBancariasPF() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PersonalAccount | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    agency: "",
    accountNumber: "",
    accountType: "corrente" as "corrente" | "poupanca" | "investimento",
    currentBalance: "0",
    pixKey: "",
    notes: "",
    isMain: false,
  });

  const { data: accounts = [], isLoading } = useQuery<PersonalAccount[]>({
    queryKey: ["/api/personal-accounts"],
  });

  const createAccount = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/personal-accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-accounts"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Conta bancaria criada com sucesso" });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/personal-accounts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-accounts"] });
      setDialogOpen(false);
      setEditingAccount(null);
      resetForm();
      toast({ title: "Conta bancaria atualizada com sucesso" });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/personal-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-accounts"] });
      toast({ title: "Conta bancaria removida com sucesso" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      bankName: "",
      agency: "",
      accountNumber: "",
      accountType: "corrente",
      currentBalance: "0",
      pixKey: "",
      notes: "",
      isMain: false,
    });
  };

  const openEditDialog = (account: PersonalAccount) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      bankName: account.bankName || "",
      agency: account.agency || "",
      accountNumber: account.accountNumber || "",
      accountType: account.accountType || "corrente",
      currentBalance: account.currentBalance || "0",
      pixKey: account.pixKey || "",
      notes: account.notes || "",
      isMain: account.isMain || false,
    });
    setDialogOpen(true);
  };

  const handleBankSelect = (code: string) => {
    const bank = banksList.find((b) => b.code === code);
    setFormData({
      ...formData,
      name: bank?.name || "",
      bankName: bank?.name || "",
    });
  };

  const handleSubmit = () => {
    if (editingAccount) {
      updateAccount.mutate({ id: editingAccount.id, data: formData });
    } else {
      createAccount.mutate(formData);
    }
  };

  return (
    <AdminPessoalLayout title="Contas Bancarias PF">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Landmark className="h-6 w-6" />
              Contas Bancarias Pessoais
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas contas bancarias pessoais
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingAccount(null);
              setDialogOpen(true);
            }}
            data-testid="button-add-pf-bank"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma conta bancaria pessoal cadastrada.
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setFormData({
                    ...formData,
                    name: "C6 Bank",
                    bankName: "C6 Bank",
                  });
                  setDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar C6 Bank
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="relative" data-testid={`card-pf-bank-${account.id}`}>
                {account.isMain && (
                  <div className="absolute top-3 right-3">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Landmark className="h-5 w-5" />
                    {account.name}
                  </CardTitle>
                  <CardDescription>{account.bankName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Agencia:</span>
                      <p className="font-medium">{account.agency || "-"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conta:</span>
                      <p className="font-medium">{account.accountNumber || "-"}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Saldo Atual:</span>
                    <p className="font-medium text-lg">
                      R$ {parseFloat(account.currentBalance || "0").toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  {account.pixKey && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <QrCode className="h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">PIX:</span>
                        <p className="font-mono text-xs">{account.pixKey}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant={account.accountType === "corrente" ? "default" : "secondary"}>
                      {account.accountType === "corrente" ? "Corrente" : 
                       account.accountType === "poupanca" ? "Poupanca" : "Investimento"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(account)}
                        data-testid={`button-edit-pf-bank-${account.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remover esta conta bancaria?")) {
                            deleteAccount.mutate(account.id);
                          }
                        }}
                        data-testid={`button-delete-pf-bank-${account.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Conta Bancaria" : "Nova Conta Bancaria"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da sua conta bancaria pessoal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>Banco</Label>
                <Select onValueChange={handleBankSelect}>
                  <SelectTrigger data-testid="select-pf-bank">
                    <SelectValue placeholder="Selecione o banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {banksList.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.code} - {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nome da Conta</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: C6 Bank PF"
                  data-testid="input-pf-account-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agencia</Label>
                  <Input
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    placeholder="0001"
                    data-testid="input-pf-agency"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numero da Conta</Label>
                  <Input
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="123456-7"
                    data-testid="input-pf-account-number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(v: "corrente" | "poupanca" | "investimento") => setFormData({ ...formData, accountType: v })}
                >
                  <SelectTrigger data-testid="select-pf-account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupanca</SelectItem>
                    <SelectItem value="investimento">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Saldo Atual (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-pf-balance"
                />
              </div>

              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  placeholder="CPF, Email, Telefone ou Chave Aleatoria"
                  data-testid="input-pf-pix-key"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <Label>Conta Principal</Label>
                  <p className="text-sm text-muted-foreground">
                    Marcar como conta principal
                  </p>
                </div>
                <Switch
                  checked={formData.isMain}
                  onCheckedChange={(v) => setFormData({ ...formData, isMain: v })}
                  data-testid="switch-pf-main-account"
                />
              </div>

              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre a conta..."
                  rows={2}
                  data-testid="textarea-pf-bank-notes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createAccount.isPending || updateAccount.isPending}
                  data-testid="button-save-pf-bank"
                >
                  {createAccount.isPending || updateAccount.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPessoalLayout>
  );
}
