import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Bell, Shield, Palette, Building2, Upload, Loader2, Search, CheckCircle2, UserCog, Lock, Store, Megaphone, ShoppingCart, Handshake, Calculator, LayoutDashboard, Users, ClipboardCheck, FileText, Calendar, Wallet, MessageSquare, BookOpen, GitBranch, BarChart3, Package } from "lucide-react";
import type { Company } from "@shared/schema";
import { TaxIdField } from "@/components/TaxIdField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const perfisConta = [
  { value: "administrador", label: "Administrador" },
  { value: "supervisor", label: "Supervisor" },
  { value: "analista", label: "Analista" },
  { value: "auxiliar", label: "Auxiliar" },
];

const modulosPermissoes = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clientes", label: "CRM - Clientes", icon: Users },
  { key: "pipeline", label: "Pipeline de Vendas", icon: BarChart3 },
  { key: "checklist", label: "Checklist Diagnóstico", icon: ClipboardCheck },
  { key: "atas", label: "Atas / Plano de Ação", icon: FileText },
  { key: "rfi", label: "RFI - Ficha Técnica", icon: FileText },
  { key: "calendario", label: "Calendário Comercial", icon: Calendar },
  { key: "tarefas", label: "Tarefas", icon: ClipboardCheck },
  { key: "projetos", label: "Projetos", icon: Package },
  { key: "calculadoras", label: "Calculadoras", icon: Calculator },
  { key: "loja", label: "Loja MCG", icon: Store },
  { key: "mkt", label: "MKT (Pré Vendas)", icon: Megaphone },
  { key: "com", label: "COM (Vendas)", icon: ShoppingCart },
  { key: "cac", label: "CAC (Pós Vendas)", icon: Handshake },
  { key: "financeiro", label: "Gestão Financeira", icon: Wallet },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { key: "manual", label: "Manual APP", icon: BookOpen },
  { key: "fluxograma", label: "Fluxograma", icon: GitBranch },
];

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjFound, setCnpjFound] = useState(false);
  const [perfilConta, setPerfilConta] = useState(user?.perfilConta || "auxiliar");
  const [permissoes, setPermissoes] = useState<string[]>([]);

  const isAdmin = user?.perfilConta === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";
  
  const [companyForm, setCompanyForm] = useState({
    name: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    inscricaoEstadualIsento: false,
    inscricaoMunicipal: "",
    logo: "",
  });

  const { data: company, isLoading: isLoadingCompany } = useQuery<Company>({
    queryKey: ["/api/company"],
  });

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || "",
        nomeFantasia: company.nomeFantasia || "",
        cnpj: company.cnpj || "",
        inscricaoEstadual: company.inscricaoEstadual || "",
        inscricaoEstadualIsento: company.inscricaoEstadualIsento || false,
        inscricaoMunicipal: company.inscricaoMunicipal || "",
        logo: company.logo || "",
      });
    }
  }, [company]);

  const handleCnpjLookup = async () => {
    const cleanCnpj = companyForm.cnpj.replace(/[^\d]/g, "");
    if (cleanCnpj.length !== 14) return;

    setCnpjLoading(true);
    setCnpjFound(false);
    try {
      const response = await fetch(`/api/cnpj/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        setCompanyForm(prev => ({
          ...prev,
          name: data.razao_social || prev.name,
          nomeFantasia: data.nome_fantasia || prev.nomeFantasia,
        }));
        setCnpjFound(true);
        toast({ title: "Dados encontrados na Receita Federal" });
      } else {
        toast({ title: "CNPJ nao encontrado", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao consultar CNPJ", variant: "destructive" });
    } finally {
      setCnpjLoading(false);
    }
  };

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      const res = await apiRequest("PATCH", "/api/company", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
      toast({ title: "Empresa atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar empresa", variant: "destructive" });
    },
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({ title: "Imagem muito grande. Maximo 500KB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCompanyForm(prev => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCompany = () => {
    updateCompanyMutation.mutate(companyForm);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { profileImageUrl?: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Foto atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar foto", variant: "destructive" });
    },
  });

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        toast({ title: "Imagem muito grande. Maximo 500KB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateProfileMutation.mutate({ profileImageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <AppLayout title="Configurações" subtitle="Gerencie sua conta e preferências">
      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>Informações da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Perfil da Conta */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <UserCog className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Perfil da Conta</p>
                <p className="text-xs text-muted-foreground">
                  {perfisConta.find(p => p.value === (user?.perfilConta || "auxiliar"))?.label || "Auxiliar"}
                </p>
              </div>
              {isAdmin && (
                <Select
                  value={perfilConta}
                  onValueChange={setPerfilConta}
                >
                  <SelectTrigger className="w-40" data-testid="select-perfil-conta">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfisConta.map((perfil) => (
                      <SelectItem key={perfil.value} value={perfil.value}>
                        {perfil.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                  data-testid="input-profile-image"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-upload-profile-image"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  defaultValue={user?.firstName || ""}
                  disabled
                  data-testid="input-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  defaultValue={user?.lastName || ""}
                  disabled
                  data-testid="input-last-name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  data-testid="input-email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Permissões - apenas para Administradores */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Permissões
              </CardTitle>
              <CardDescription>Defina quais módulos os membros da equipe podem acessar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {modulosPermissoes.map((modulo) => {
                  const IconComponent = modulo.icon;
                  const isChecked = permissoes.includes(modulo.key);
                  return (
                    <div
                      key={modulo.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        isChecked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        if (isChecked) {
                          setPermissoes(permissoes.filter(p => p !== modulo.key));
                        } else {
                          setPermissoes([...permissoes, modulo.key]);
                        }
                      }}
                      data-testid={`checkbox-permissao-${modulo.key}`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPermissoes([...permissoes, modulo.key]);
                          } else {
                            setPermissoes(permissoes.filter(p => p !== modulo.key));
                          }
                        }}
                      />
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{modulo.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPermissoes(modulosPermissoes.map(m => m.key))}
                  data-testid="button-select-all-permissions"
                >
                  Selecionar Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPermissoes([])}
                  data-testid="button-clear-permissions"
                >
                  Limpar Seleção
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                As permissões serão aplicadas aos membros da equipe com perfis abaixo de Administrador.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Empresa
            </CardTitle>
            <CardDescription>Informações da sua empresa e logotipo para documentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50 overflow-hidden">
                  {companyForm.logo ? (
                    <img src={companyForm.logo} alt="Logo" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  data-testid="input-company-logo"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-logo"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Logo
                </Button>
                <p className="text-xs text-muted-foreground text-center">Max 500KB</p>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>CNPJ/CPF</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <TaxIdField
                        value={companyForm.cnpj}
                        onChange={(value) => {
                          setCompanyForm(prev => ({ ...prev, cnpj: value }));
                          setCnpjFound(false);
                        }}
                        label=""
                        data-testid="input-company-cnpj"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCnpjLookup}
                      disabled={cnpjLoading || !companyForm.cnpj || companyForm.cnpj.replace(/[^\d]/g, "").length !== 14}
                      data-testid="button-company-cnpj-lookup"
                    >
                      {cnpjLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : cnpjFound ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Digite o CNPJ e clique na lupa para buscar dados automaticamente</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual (I.E.)</Label>
                    <Input
                      id="ie"
                      placeholder={companyForm.inscricaoEstadualIsento ? "ISENTO" : "Inscrição Estadual"}
                      disabled={companyForm.inscricaoEstadualIsento}
                      value={companyForm.inscricaoEstadualIsento ? "" : companyForm.inscricaoEstadual}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, inscricaoEstadual: e.target.value }))}
                      data-testid="input-company-ie"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <Checkbox
                        id="company-ie-isento"
                        checked={companyForm.inscricaoEstadualIsento}
                        onCheckedChange={(checked) => {
                          setCompanyForm(prev => ({
                            ...prev,
                            inscricaoEstadualIsento: !!checked,
                            inscricaoEstadual: checked ? "" : prev.inscricaoEstadual
                          }));
                        }}
                        data-testid="checkbox-company-ie-isento"
                      />
                      <label htmlFor="company-ie-isento" className="text-xs text-muted-foreground cursor-pointer">
                        Isento
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="im">Inscrição Municipal (I.M.)</Label>
                    <Input
                      id="im"
                      placeholder="Inscrição Municipal"
                      value={companyForm.inscricaoMunicipal}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, inscricaoMunicipal: e.target.value }))}
                      data-testid="input-company-im"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Razao Social</Label>
                    <Input
                      id="companyName"
                      placeholder="Nome da empresa"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      placeholder="Nome fantasia"
                      value={companyForm.nomeFantasia}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                      data-testid="input-company-nome-fantasia"
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSaveCompany} 
              disabled={updateCompanyMutation.isPending}
              data-testid="button-save-company"
            >
              {updateCompanyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Alteracoes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>Personalize a interface do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo Escuro</p>
                <p className="text-sm text-muted-foreground">
                  Alterne entre tema claro e escuro
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
                data-testid="switch-dark-mode"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações por Email</p>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações importantes por email
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-email-notifications" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Vencimento</p>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre contas a vencer
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-due-alerts" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Novos Clientes</p>
                <p className="text-sm text-muted-foreground">
                  Notificações quando novos leads entrarem
                </p>
              </div>
              <Switch defaultChecked data-testid="switch-new-client-alerts" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Configurações de segurança da conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação em Dois Fatores</p>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-enable-2fa"
                onClick={() => toast({ title: "Autenticação em 2 fatores será disponibilizada em breve" })}
              >
                Configurar
              </Button>
            </div>
            <Separator />
            <div>
              <Link href="/logout">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid="button-logout-settings"
                >
                  Sair da Conta
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
