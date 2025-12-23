import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Library,
  Search,
  ShoppingCart,
  CheckCircle2,
  Calendar,
  Building2,
  Filter,
  Eye,
  Loader2,
  UserPlus,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { ChecklistTemplate, Client } from "@shared/schema";

const SEGMENT_LABELS: Record<string, string> = {
  alimenticio: "Alimentício",
  embalagem: "Embalagem",
  quimico: "Químico",
  farmaceutico: "Farmacêutico",
  cosmetico: "Cosmético",
  automotivo: "Automotivo",
  eletronico: "Eletrônico",
  metalurgico: "Metalúrgico",
  textil: "Têxtil",
  agronegocio: "Agronegócio",
  construcao: "Construção Civil",
  energia: "Energia",
  papel: "Papel e Celulose",
  plastico: "Plástico",
  bebidas: "Bebidas",
  outros: "Outros",
};

export default function BibliotecaChecklists() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applyingTemplate, setApplyingTemplate] = useState<ChecklistTemplate | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [purchasingTemplate, setPurchasingTemplate] = useState<ChecklistTemplate | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("brl");

  const { data: templates, isLoading } = useQuery<ChecklistTemplate[]>({
    queryKey: ["/api/checklist-templates", selectedSegment !== "all" ? selectedSegment : undefined],
  });

  const { data: segments } = useQuery<string[]>({
    queryKey: ["/api/checklist-templates/segments/list"],
  });

  const { data: purchases } = useQuery<any[]>({
    queryKey: ["/api/checklist-template-purchases"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ templateId, currency }: { templateId: number; currency: string }) => {
      const response = await apiRequest("POST", `/api/checklist-templates/${templateId}/purchase`, { currency });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-template-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/checklist-templates"] });
      setShowCurrencyDialog(false);
      setPurchasingTemplate(null);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar compra",
        variant: "destructive",
      });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async ({ templateId, clientId }: { templateId: number; clientId: number }) => {
      const response = await apiRequest("POST", `/api/checklist-templates/${templateId}/apply`, { clientId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      toast({
        title: "Sucesso",
        description: "Template aplicado ao cliente com sucesso! Acesse a área de Checklists para ver.",
      });
      setShowApplyDialog(false);
      setApplyingTemplate(null);
      setSelectedClientId("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao aplicar template",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.industryName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSegment = selectedSegment === "all" || template.segment === selectedSegment;
    
    return matchesSearch && matchesSegment;
  });

  const isPurchased = (templateId: number) => {
    return purchases?.some(p => p.templateId === templateId && p.status === "completed");
  };

  const formatPrice = (priceInCents: number | null, currency: string = "brl") => {
    const basePriceInCents = priceInCents || 9900;
    let convertedPrice = basePriceInCents;
    let currencyCode = "BRL";
    let locale = "pt-BR";
    
    if (currency === "usd") {
      convertedPrice = Math.round(basePriceInCents / 5.0);
      currencyCode = "USD";
      locale = "en-US";
    } else if (currency === "eur") {
      convertedPrice = Math.round(basePriceInCents / 6.2);
      currencyCode = "EUR";
      locale = "de-DE";
    }
    
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(convertedPrice / 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const handlePurchase = (template: ChecklistTemplate) => {
    if (isPurchased(template.id)) {
      toast({
        title: "Já Adquirido",
        description: "Você já possui este checklist. Acesse na área de Checklists.",
      });
      return;
    }
    setPurchasingTemplate(template);
    setSelectedCurrency("brl");
    setShowCurrencyDialog(true);
  };

  const confirmPurchase = () => {
    if (!purchasingTemplate) return;
    purchaseMutation.mutate({
      templateId: purchasingTemplate.id,
      currency: selectedCurrency,
    });
  };

  const handlePreview = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  const handleApplyToClient = (template: ChecklistTemplate) => {
    setApplyingTemplate(template);
    setSelectedClientId("");
    setShowApplyDialog(true);
  };

  const confirmApply = () => {
    if (!applyingTemplate || !selectedClientId) return;
    applyMutation.mutate({
      templateId: applyingTemplate.id,
      clientId: parseInt(selectedClientId),
    });
  };

  return (
    <AppLayout title="Biblioteca de Checklists">
      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Library className="h-6 w-6 text-primary" />
              Biblioteca de Checklists
            </h1>
            <p className="text-muted-foreground mt-1">
              Checklists prontos por segmento industrial para acelerar sua análise de clientes
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, descrição ou indústria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-templates"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger className="w-[200px]" data-testid="select-segment-filter">
                    <SelectValue placeholder="Todos os segmentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os segmentos</SelectItem>
                    {segments?.map((segment) => (
                      <SelectItem key={segment} value={segment}>
                        {SEGMENT_LABELS[segment] || segment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredTemplates?.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedSegment !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Em breve teremos templates disponíveis para compra"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates?.map((template) => (
              <Card key={template.id} className="flex flex-col" data-testid={`card-template-${template.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.industryName && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{template.industryName}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {SEGMENT_LABELS[template.segment] || template.segment}
                    </Badge>
                  </div>
                  {template.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    {template.sectionUpdates && Object.keys(template.sectionUpdates).length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Última atualização: {formatDate(template.updatedAt?.toString() || null)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(template.priceInCents)}
                    </span>
                    {isPurchased(template.id) && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Adquirido
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(template)}
                      data-testid={`button-preview-${template.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    {isPurchased(template.id) ? (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApplyToClient(template)}
                        data-testid={`button-apply-${template.id}`}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Aplicar a Cliente
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePurchase(template)}
                        disabled={purchaseMutation.isPending}
                        data-testid={`button-purchase-${template.id}`}
                      >
                        {purchaseMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 mr-1" />
                        )}
                        Comprar
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                {selectedTemplate?.name}
              </DialogTitle>
              <DialogDescription>
                Preview do checklist - {SEGMENT_LABELS[selectedTemplate?.segment || ""] || selectedTemplate?.segment}
              </DialogDescription>
            </DialogHeader>

            {selectedTemplate && (
              <div className="space-y-4">
                {selectedTemplate.industryName && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Indústria Base</p>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.industryName}</p>
                    </div>
                  </div>
                )}

                {selectedTemplate.description && (
                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Seções Incluídas</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Perfil do Cliente",
                      "Comercial",
                      "Direção",
                      "Qualidade",
                      "Planejamento",
                      "Financeiro",
                      "Op. Transporte",
                      "Op. Distribuição",
                      "Op. Armazenagem",
                      "GRISCO",
                      "T.I",
                      "Compras",
                      "Contábil/Fiscal",
                      "RH",
                      "Jurídico",
                      "Boas Vindas",
                      "Relacionamento",
                    ].map((section) => (
                      <div key={section} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{section}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTemplate.sectionUpdates && Object.keys(selectedTemplate.sectionUpdates).length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Últimas Atualizações por Área</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedTemplate.sectionUpdates).map(([section, update]) => (
                        <div key={section} className="flex items-center justify-between text-sm">
                          <span>{section}</span>
                          <span className="text-muted-foreground">
                            {formatDate((update as any).lastUpdatedAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(selectedTemplate?.priceInCents || null)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedTemplate) {
                      handlePurchase(selectedTemplate);
                    }
                  }}
                  disabled={purchaseMutation.isPending || (selectedTemplate ? isPurchased(selectedTemplate.id) : false)}
                  data-testid="button-purchase-dialog"
                >
                  {purchaseMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
                  {selectedTemplate && isPurchased(selectedTemplate.id) ? "Já Adquirido" : "Comprar Agora"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Aplicar Template a Cliente
              </DialogTitle>
              <DialogDescription>
                Selecione o cliente para aplicar o template "{applyingTemplate?.name}"
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione o Cliente</label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger data-testid="select-client-apply">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} {client.tradeName ? `(${client.tradeName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {clients?.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Você ainda não tem clientes cadastrados. Acesse a área de Clientes para cadastrar.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmApply}
                disabled={!selectedClientId || applyMutation.isPending}
                data-testid="button-confirm-apply"
              >
                {applyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Aplicar Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Escolha a Moeda de Pagamento
              </DialogTitle>
              <DialogDescription>
                Selecione a moeda para pagar pelo template "{purchasingTemplate?.name}"
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-3 py-4">
              <Button
                variant={selectedCurrency === "brl" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setSelectedCurrency("brl")}
                data-testid="button-currency-brl"
              >
                <span className="text-lg font-bold">R$</span>
                <span className="font-medium">Real</span>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(purchasingTemplate?.priceInCents || null, "brl")}
                </span>
              </Button>
              <Button
                variant={selectedCurrency === "usd" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setSelectedCurrency("usd")}
                data-testid="button-currency-usd"
              >
                <span className="text-lg font-bold">$</span>
                <span className="font-medium">Dólar</span>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(purchasingTemplate?.priceInCents || null, "usd")}
                </span>
              </Button>
              <Button
                variant={selectedCurrency === "eur" ? "default" : "outline"}
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => setSelectedCurrency("eur")}
                data-testid="button-currency-eur"
              >
                <span className="text-lg font-bold">€</span>
                <span className="font-medium">Euro</span>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(purchasingTemplate?.priceInCents || null, "eur")}
                </span>
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCurrencyDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmPurchase}
                disabled={purchaseMutation.isPending}
                data-testid="button-confirm-purchase"
              >
                {purchaseMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="h-4 w-4 mr-2" />
                )}
                Ir para Pagamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
