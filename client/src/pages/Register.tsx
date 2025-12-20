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
import { Eye, EyeOff, Loader2, Plus } from "lucide-react";
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
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional(),
  tipoEmpresa: z.string().optional(),
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
  { value: "direcao", label: "Direção" },
  { value: "comercial", label: "Comercial" },
  { value: "financeiro", label: "Financeiro" },
  { value: "compras", label: "Compras" },
  { value: "logistica", label: "Logística" },
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
      razaoSocial: "",
      cnpj: "",
      firstName: "",
      lastName: "",
      tipoEmpresa: "",
      segmento: "",
      departamento: "",
      vendedor: "",
      perfilConta: "colaborador",
      phone: "",
      acceptTerms: false,
    },
  });

  const watchDepartamento = form.watch("departamento");
  const showVendedor = watchDepartamento === "direcao" || watchDepartamento === "comercial";

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const { confirmPassword, acceptTerms, ...registerData } = data;
      const response = await apiRequest("POST", "/api/auth/register", registerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Conta criada",
        description: "Sua conta foi criada com sucesso!",
      });
      setLocation("/dashboard");
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
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
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
                <FormField
                  control={form.control}
                  name="razaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
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
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TaxIdField
                          value={field.value || ""}
                          onChange={field.onChange}
                          label="CPF/CNPJ"
                          data-testid="input-cnpj"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    name="segmento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segmento</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-segmento" className="flex-1">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allSegments.map((segment) => (
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
      </main>
    </div>
  );
}
