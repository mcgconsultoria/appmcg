import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Plus, Search, CheckCircle2, ArrowLeft, Check, Square } from "lucide-react";
import logoMcg from "@assets/logo_mcg_principal.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TaxIdField } from "@/components/TaxIdField";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { BusinessType, MarketSegment } from "@shared/schema";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmPassword: z.string(),
  userCategories: z.array(z.string()).min(1, "Selecione pelo menos uma categoria"),
  cnpj: z.string().optional(),
  inscriçãoEstadual: z.string().optional(),
  inscriçãoEstadualIsento: z.boolean().optional().default(false),
  inscriçãoMunicipal: z.string().optional(),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional(),
  tipoEmpresa: z.string().optional(),
  segmentos: z.array(z.string()).optional(),
  segmento: z.string().optional(),
  departamento: z.string().optional(),
  vendedor: z.string().optional(),
  perfilConta: z.string().optional().default("colaborador"),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Você deve aceitar os termos de uso",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

const userCategoryOptions = [
  { key: "embarcador", label: "Embarcador", desc: "Busca prestadores de serviço" },
  { key: "servicos", label: "Transportadora", desc: "Busca clientes" },
  { key: "operador", label: "Operador Logístico", desc: "Busca clientes e prestadores de serviço" },
  { key: "parceiro", label: "Parceiros", desc: "Serviços Autônomos" },
  { key: "motorista", label: "Motoristas", desc: "Terceiros, Agregados, Autônomos" },
];

const defaultBusinessTypes = [
  "Indústria",
  "Transportadora",
  "Operador Logístico",
  "Carga/Descarga",
  "Motorista",
  "Despachante Aduaneiro",
  "Associação",
  "Contador",
  "Advogado",
  "Governo",
  "Portos",
  "Influencer",
  "ERP",
];

const defaultSegments = [
  "Alimentos Seco",
  "Alimentos Refrigerado",
  "Medicamentos",
  "Ferramentas",
  "Bebidas",
  "Químicos",
  "Higiene/Limpeza",
  "Pet",
  "EPIs",
  "Automotivo",
  "Peças Automotivo",
  "Café",
  "Têxtil",
  "Eletrônicos",
  "Odontológico",
  "Esportivos",
  "Embalagens",
];

const departamentos = [
  { value: "direção", label: "Direção" },
  { value: "comercial", label: "Comercial" },
  { value: "financeiro", label: "Financeiro" },
  { value: "compras", label: "Compras" },
  { value: "logística", label: "Logística" },
  { value: "frota", label: "Frota" },
  { value: "qualidade", label: "Qualidade" },
  { value: "ti", label: "T.I" },
];

const perfisConta = [
  { value: "administrador", label: "Administrador" },
  { value: "colaborador", label: "Colaborador" },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newSegmentName, setNewSegmentName] = useState("");
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjFound, setCnpjFound] = useState(false);

  const { data: businessTypesFromDb = [] } = useQuery<BusinessType[]>({
    queryKey: ["/api/business-types"],
  });

  const { data: segmentsFromDb = [] } = useQuery<MarketSegment[]>({
    queryKey: ["/api/market-segments"],
  });

  const allBusinessTypes = [
    ...defaultBusinessTypes,
    ...businessTypesFromDb.map(t => t.name).filter(n => !defaultBusinessTypes.includes(n))
  ];

  const allSegments = [
    ...defaultSegments,
    ...segmentsFromDb.map(s => s.name).filter(n => !defaultSegments.includes(n))
  ];

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      userCategories: [],
      cnpj: "",
      inscriçãoEstadual: "",
      inscriçãoEstadualIsento: false,
      inscriçãoMunicipal: "",
      razaoSocial: "",
      nomeFantasia: "",
      firstName: "",
      lastName: "",
      tipoEmpresa: "",
      segmentos: [],
      segmento: "",
      departamento: "",
      vendedor: "",
      perfilConta: "colaborador",
      phone: "",
      acceptTerms: false,
    },
  });

  const watchIEIsento = form.watch("inscriçãoEstadualIsento");

  const handleCnpjLookup = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/[^\d]/g, "");
    if (cleanCnpj.length !== 14) return;

    setCnpjLoading(true);
    setCnpjFound(false);
    try {
      const response = await fetch(`/api/cnpj/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        // Backend retorna em snake_case
        const razaoSocial = data.razao_social || data.razaoSocial || "";
        const nomeFantasia = data.nome_fantasia || data.nomeFantasia || "";
        form.setValue("razaoSocial", razaoSocial);
        form.setValue("nomeFantasia", nomeFantasia);
        setCnpjFound(true);
        toast({
          title: "CNPJ encontrado",
          description: `Dados de ${razaoSocial} carregados automaticamente`,
        });
      } else {
        toast({
          title: "CNPJ não encontrado",
          description: "Não foi possível encontrar dados para este CNPJ",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast({
        title: "Erro ao buscar CNPJ",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setCnpjLoading(false);
    }
  };

  const watchDepartamento = form.watch("departamento");
  const showVendedor = watchDepartamento === "direção" || watchDepartamento === "comercial";

  const [pendingApproval, setPendingApproval] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const { confirmPassword, acceptTerms, ...registerData } = data;
      const response = await apiRequest("POST", "/api/auth/register", registerData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.pendingApproval) {
        setPendingApproval(true);
        toast({
          title: "Cadastro realizado!",
          description: "Sua conta está aguardando aprovação. Você receberá um email quando for aprovada.",
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        toast({
          title: "Conta criada",
          description: "Sua conta foi criada com sucesso!",
        });
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível criar sua conta",
        variant: "destructive",
      });
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/business-types", { name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-types"] });
      setNewTypeName("");
      setTypeDialogOpen(false);
      toast({ title: "Tipo de empresa criado!" });
    },
  });

  const createSegmentMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/market-segments", { name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/market-segments"] });
      setNewSegmentName("");
      setSegmentDialogOpen(false);
      toast({ title: "Segmento criado!" });
    },
  });

  const onSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = "/")}
              data-testid="button-back"
              title="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <img 
                src={logoMcg} 
                alt="MCG Consultoria" 
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">MCG</span>
                <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {pendingApproval ? (
          <Card className="w-full max-w-md">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Cadastro Realizado!</h2>
                <p className="text-muted-foreground">
                  Sua conta foi criada e está aguardando aprovação.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-medium">O que acontece agora?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Nossa equipe irá analisar seu cadastro</li>
                  <li>2. Você receberá um email quando sua conta for aprovada</li>
                  <li>3. Após aprovação, você poderá acessar o sistema normalmente</li>
                </ul>
              </div>
              <div className="pt-4 space-y-3">
                <Button onClick={() => setLocation("/login")} className="w-full" data-testid="button-go-to-login">
                  Ir para Login
                </Button>
                <Button variant="outline" onClick={() => setLocation("/")} className="w-full" data-testid="button-go-home">
                  Voltar para o Início
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Preencha os dados para criar sua conta gratuita
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Categorias de Usuário */}
                <FormField
                  control={form.control}
                  name="userCategories"
                  render={({ field }) => {
                    const currentValues = Array.isArray(field.value) ? field.value : [];
                    const hasSelection = currentValues.length > 0;
                    
                    const handleToggle = (categoryKey: string) => {
                      if (currentValues.includes(categoryKey)) {
                        field.onChange([]);
                      } else {
                        field.onChange([categoryKey]);
                      }
                    };
                    
                    return (
                      <FormItem>
                        <FormLabel>Você é: *</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {userCategoryOptions.map((category) => {
                            const isChecked = currentValues.includes(category.key);
                            const isDisabled = hasSelection && !isChecked;
                            return (
                              <div
                                key={category.key}
                                role="radio"
                                aria-checked={isChecked}
                                aria-disabled={isDisabled}
                                tabIndex={isDisabled ? -1 : 0}
                                className={`flex items-start gap-2 p-3 rounded-md border transition-colors select-none ${
                                  isChecked
                                    ? "border-primary bg-primary/5 cursor-pointer"
                                    : isDisabled
                                    ? "border-border opacity-50 cursor-not-allowed"
                                    : "border-border hover:border-primary/50 cursor-pointer"
                                }`}
                                onClick={() => !isDisabled && handleToggle(category.key)}
                                onKeyDown={(e) => {
                                  if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    handleToggle(category.key);
                                  }
                                }}
                                data-testid={`checkbox-category-${category.key}`}
                              >
                                <div className={`flex-shrink-0 h-4 w-4 rounded-full border ${isChecked ? 'bg-primary border-primary' : 'border-primary'} flex items-center justify-center mt-0.5`}>
                                  {isChecked && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{category.label}</span>
                                  <span className="text-xs text-muted-foreground">{category.desc}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ/CPF</FormLabel>
                      <div className="flex gap-2">
                        <FormControl className="flex-1">
                          <TaxIdField
                            value={field.value || ""}
                            onChange={(value) => {
                              field.onChange(value);
                              setCnpjFound(false);
                            }}
                            label=""
                            data-testid="input-cnpj"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleCnpjLookup(field.value || "")}
                          disabled={cnpjLoading || !field.value || field.value.replace(/[^\d]/g, "").length !== 14}
                          data-testid="button-cnpj-lookup"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="inscriçãoEstadual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inscrição Estadual (I.E.)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={watchIEIsento ? "ISENTO" : "Inscrição Estadual"}
                            disabled={watchIEIsento}
                            data-testid="input-ie"
                            {...field}
                            value={watchIEIsento ? "" : field.value}
                          />
                        </FormControl>
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox
                            id="ie-isento"
                            checked={watchIEIsento}
                            onCheckedChange={(checked) => {
                              form.setValue("inscriçãoEstadualIsento", !!checked);
                              if (checked) form.setValue("inscriçãoEstadual", "");
                            }}
                            data-testid="checkbox-ie-isento"
                          />
                          <label htmlFor="ie-isento" className="text-xs text-muted-foreground cursor-pointer">
                            Isento
                          </label>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="inscriçãoMunicipal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inscrição Municipal (I.M.)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Inscrição Municipal"
                            data-testid="input-im"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razao Social</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome da empresa"
                            data-testid="input-razao-social"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nomeFantasia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Fantasia</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome fantasia"
                            data-testid="input-nome-fantasia"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome"
                            data-testid="input-first-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu sobrenome"
                            data-testid="input-last-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipoEmpresa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Você é</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tipo-empresa" className="flex-1">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allBusinessTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Novo Tipo de Empresa</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Nome do tipo"
                                  value={newTypeName}
                                  onChange={(e) => setNewTypeName(e.target.value)}
                                  data-testid="input-new-type"
                                />
                                <Button
                                  onClick={() => createTypeMutation.mutate(newTypeName)}
                                  disabled={!newTypeName || createTypeMutation.isPending}
                                  data-testid="button-create-type"
                                >
                                  {createTypeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="segmentos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segmentos (múltipla escolha)</FormLabel>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Select 
                              onValueChange={(value) => {
                                const current = field.value || [];
                                if (!current.includes(value)) {
                                  field.onChange([...current, value]);
                                }
                              }} 
                              value=""
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-segmento" className="flex-1">
                                  <SelectValue placeholder="Adicionar segmento..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {allSegments.filter(s => !(field.value || []).includes(s)).map((segment) => (
                                  <SelectItem key={segment} value={segment}>
                                    {segment}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Dialog open={segmentDialogOpen} onOpenChange={setSegmentDialogOpen}>
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline" size="icon">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Novo Segmento</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Nome do segmento"
                                    value={newSegmentName}
                                    onChange={(e) => setNewSegmentName(e.target.value)}
                                    data-testid="input-new-segment"
                                  />
                                  <Button
                                    onClick={() => createSegmentMutation.mutate(newSegmentName)}
                                    disabled={!newSegmentName || createSegmentMutation.isPending}
                                    data-testid="button-create-segment"
                                  >
                                    {createSegmentMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          {(field.value || []).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {(field.value || []).map((seg: string) => (
                                <span 
                                  key={seg}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-primary/10 text-primary"
                                >
                                  {seg}
                                  <button
                                    type="button"
                                    onClick={() => field.onChange(field.value?.filter((s: string) => s !== seg))}
                                    className="ml-1 hover:text-destructive"
                                    data-testid={`remove-segment-${seg}`}
                                  >
                                    x
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="departamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-departamento">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departamentos.map((dep) => (
                              <SelectItem key={dep.value} value={dep.value}>
                                {dep.label}
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
                    name="perfilConta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perfil da Conta</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-perfil">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {perfisConta.map((perfil) => (
                              <SelectItem key={perfil.value} value={perfil.value}>
                                {perfil.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {showVendedor && (
                  <FormField
                    control={form.control}
                    name="vendedor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendedor</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do vendedor"
                            data-testid="input-vendedor"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            data-testid="input-phone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Mínimo 8 caracteres"
                              data-testid="input-password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirme sua senha"
                              data-testid="input-confirm-password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Li e aceito os{" "}
                          <Link href="/termos" className="text-primary hover:underline">
                            Termos de Uso
                          </Link>{" "}
                          e a{" "}
                          <Link href="/privacidade" className="text-primary hover:underline">
                            Política de Privacidade
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
        )}
      </main>
    </div>
  );
}
