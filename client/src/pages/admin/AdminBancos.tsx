import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
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
  Building2,
  CreditCard,
  Star,
  QrCode,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BankAccount } from "@shared/schema";

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
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Chave Aleatoria" },
];

export default function AdminBancos() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    bankCode: "",
    bankName: "",
    agency: "",
    agencyDigit: "",
    accountNumber: "",
    accountDigit: "",
    accountType: "corrente",
    holderName: "",
    holderCnpj: "",
    pixKey: "",
    pixKeyType: "",
    isMain: false,
    notes: "",
  });

  const { data: accounts = [], isLoading } = useQuery<BankAccount[]>({
    queryKey: ["/api/bank-accounts"],
  });

  const createAccount = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest("POST", "/api/bank-accounts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Conta bancaria criada com sucesso" });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      return apiRequest("PATCH", `/api/bank-accounts/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      setDialogOpen(false);
      setEditingAccount(null);
      resetForm();
      toast({ title: "Conta bancaria atualizada com sucesso" });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/bank-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bank-accounts"] });
      toast({ title: "Conta bancaria removida com sucesso" });
    },
  });

  const resetForm = () => {
    setFormData({
      bankCode: "",
      bankName: "",
      agency: "",
      agencyDigit: "",
      accountNumber: "",
      accountDigit: "",
      accountType: "corrente",
      holderName: "",
      holderCnpj: "",
      pixKey: "",
      pixKeyType: "",
      isMain: false,
      notes: "",
    });
  };

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bankCode: account.bankCode,
      bankName: account.bankName,
      agency: account.agency,
      agencyDigit: account.agencyDigit || "",
      accountNumber: account.accountNumber,
      accountDigit: account.accountDigit || "",
      accountType: account.accountType || "corrente",
      holderName: account.holderName || "",
      holderCnpj: account.holderCnpj || "",
      pixKey: account.pixKey || "",
      pixKeyType: account.pixKeyType || "",
      isMain: account.isMain || false,
      notes: account.notes || "",
    });
    setDialogOpen(true);
  };

  const handleBankSelect = (code: string) => {
    const bank = banksList.find((b) => b.code === code);
    setFormData({
      ...formData,
      bankCode: code,
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
    <AppLayout title="Admin MCG">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Contas Bancarias
            </h1>
            <p className="text-muted-foreground">
              Gerencie as contas bancarias da empresa
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingAccount(null);
              setDialogOpen(true);
            }}
            data-testid="button-add-bank"
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
                Nenhuma conta bancaria cadastrada.
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setFormData({
                    ...formData,
                    bankCode: "336",
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
              <Card key={account.id} className="relative" data-testid={`card-bank-${account.id}`}>
                {account.isMain && (
                  <div className="absolute top-3 right-3">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {account.bankName}
                  </CardTitle>
                  <CardDescription>Codigo: {account.bankCode}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Agencia:</span>
                      <p className="font-medium">
                        {account.agency}
                        {account.agencyDigit && `-${account.agencyDigit}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conta:</span>
                      <p className="font-medium">
                        {account.accountNumber}
                        {account.accountDigit && `-${account.accountDigit}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Titular:</span>
                    <p className="font-medium">{account.holderName || "-"}</p>
                    {account.holderCnpj && (
                      <p className="text-xs text-muted-foreground">{account.holderCnpj}</p>
                    )}
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
                      {account.accountType === "corrente" ? "Conta Corrente" : "Poupanca"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(account)}
                        data-testid={`button-edit-bank-${account.id}`}
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
                        data-testid={`button-delete-bank-${account.id}`}
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
                Preencha os dados da conta bancaria
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>Banco</Label>
                <Select value={formData.bankCode} onValueChange={handleBankSelect}>
                  <SelectTrigger data-testid="select-bank">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agencia</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.agency}
                      onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                      placeholder="0001"
                      className="flex-1"
                      data-testid="input-agency"
                    />
                    <Input
                      value={formData.agencyDigit}
                      onChange={(e) => setFormData({ ...formData, agencyDigit: e.target.value })}
                      placeholder="0"
                      className="w-16"
                      maxLength={2}
                      data-testid="input-agency-digit"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Conta</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="123456"
                      className="flex-1"
                      data-testid="input-account-number"
                    />
                    <Input
                      value={formData.accountDigit}
                      onChange={(e) => setFormData({ ...formData, accountDigit: e.target.value })}
                      placeholder="0"
                      className="w-16"
                      maxLength={2}
                      data-testid="input-account-digit"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Conta</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(v) => setFormData({ ...formData, accountType: v })}
                >
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupanca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Titular</Label>
                  <Input
                    value={formData.holderName}
                    onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                    placeholder="MCG Consultoria LTDA"
                    data-testid="input-holder-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ do Titular</Label>
                  <Input
                    value={formData.holderCnpj}
                    onChange={(e) => setFormData({ ...formData, holderCnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    data-testid="input-holder-cnpj"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Chave PIX</Label>
                  <Select
                    value={formData.pixKeyType}
                    onValueChange={(v) => setFormData({ ...formData, pixKeyType: v })}
                  >
                    <SelectTrigger data-testid="select-pix-type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {pixKeyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chave PIX</Label>
                  <Input
                    value={formData.pixKey}
                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                    placeholder="Chave PIX"
                    data-testid="input-pix-key"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <Label>Conta Principal</Label>
                  <p className="text-sm text-muted-foreground">
                    Marcar como conta principal da empresa
                  </p>
                </div>
                <Switch
                  checked={formData.isMain}
                  onCheckedChange={(v) => setFormData({ ...formData, isMain: v })}
                  data-testid="switch-main-account"
                />
              </div>

              <div className="space-y-2">
                <Label>Observacoes (opcional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observacoes sobre a conta..."
                  rows={2}
                  data-testid="textarea-bank-notes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createAccount.isPending || updateAccount.isPending}
                  data-testid="button-save-bank"
                >
                  {createAccount.isPending || updateAccount.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
