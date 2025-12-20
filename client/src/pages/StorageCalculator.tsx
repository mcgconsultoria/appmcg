import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Warehouse, 
  RotateCcw, 
  Save, 
  Info, 
  Thermometer, 
  FileDown,
  UserPlus,
  Crown,
  Snowflake,
  AlertTriangle,
  Pill,
  Apple,
  Package,
  Gem,
  Wheat,
  FlaskConical
} from "lucide-react";
import { formatCurrency } from "@/lib/brazilStates";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ClientCombobox } from "@/components/ClientCombobox";
import type { Client } from "@shared/schema";

interface StorageFormData {
  area: string;
  period: string;
  storageCategory: string;
  storageType: string;
  storageRate: string;
  movementRate: string;
  handlingValue: string;
  quantity: string;
  palletPositions: string;
  insuranceRate: string;
  productValue: string;
}

const initialFormData: StorageFormData = {
  area: "",
  period: "30",
  storageCategory: "",
  storageType: "",
  storageRate: "",
  movementRate: "",
  handlingValue: "",
  quantity: "",
  palletPositions: "",
  insuranceRate: "0.05",
  productValue: "",
};

interface StorageType {
  value: string;
  label: string;
  category: string;
  baseRate: number;
  temperature: string;
  legislation: string[];
  requirements: string[];
  icon: typeof Package;
}

const storageCategories = [
  { value: "dry", label: "Carga Seca", icon: Package },
  { value: "refrigerated", label: "Refrigerada", icon: Thermometer },
  { value: "frozen", label: "Congelada", icon: Snowflake },
  { value: "pharmaceutical", label: "Farmaceutica", icon: Pill },
  { value: "hazardous", label: "Perigosa", icon: AlertTriangle },
  { value: "agricultural", label: "Agricola", icon: Wheat },
  { value: "special", label: "Especial", icon: Gem },
];

const storageTypes: StorageType[] = [
  {
    value: "dry_general",
    label: "Carga Geral",
    category: "dry",
    baseRate: 25,
    temperature: "Ambiente (15-30C)",
    legislation: ["NBR 15.524-2/2008", "NR-11"],
    requirements: ["Ambiente limpo e ventilado", "Protecao contra intemperies", "Controle de pragas"],
    icon: Package,
  },
  {
    value: "dry_industrial",
    label: "Produtos Industrializados",
    category: "dry",
    baseRate: 28,
    temperature: "Ambiente (15-30C)",
    legislation: ["NBR 15.524-2/2008", "NR-11", "ABNT NBR 16280"],
    requirements: ["Empilhamento maximo definido", "Separacao por lote", "Controle FIFO/FEFO"],
    icon: Package,
  },
  {
    value: "dry_electronics",
    label: "Eletronicos",
    category: "dry",
    baseRate: 45,
    temperature: "Ambiente controlado (18-25C)",
    legislation: ["NBR 15.524-2/2008", "ABNT IEC 61340"],
    requirements: ["Controle de umidade < 60%", "Protecao antistatica", "Seguranca reforçada"],
    icon: Package,
  },
  {
    value: "refrigerated_food",
    label: "Alimentos Refrigerados",
    category: "refrigerated",
    baseRate: 55,
    temperature: "0C a 10C",
    legislation: ["ANVISA RDC 216/2004", "Portaria SVS 326/1997", "MAPA IN 16/2017"],
    requirements: ["Monitoramento continuo de temperatura", "Separacao por tipo de alimento", "Higienizacao diaria", "Registro de temperaturas"],
    icon: Apple,
  },
  {
    value: "refrigerated_dairy",
    label: "Laticinios",
    category: "refrigerated",
    baseRate: 60,
    temperature: "2C a 8C",
    legislation: ["ANVISA RDC 216/2004", "MAPA IN 76/2018", "Decreto 9.013/2017 (RIISPOA)"],
    requirements: ["Cadeia de frio ininterrupta", "Controle de validade FEFO", "Area exclusiva para laticinios"],
    icon: Apple,
  },
  {
    value: "refrigerated_meat",
    label: "Carnes Refrigeradas",
    category: "refrigerated",
    baseRate: 65,
    temperature: "0C a 4C",
    legislation: ["MAPA Decreto 9.013/2017", "ANVISA RDC 216/2004", "IN MAPA 60/2018"],
    requirements: ["Prateleiras inferiores obrigatorias", "Separacao de carnes cruas", "SIF obrigatorio para comercio interestadual"],
    icon: Apple,
  },
  {
    value: "refrigerated_seafood",
    label: "Pescados",
    category: "refrigerated",
    baseRate: 70,
    temperature: "0C a 2C",
    legislation: ["MAPA Decreto 9.013/2017", "ANVISA RDC 216/2004", "Resolucao CISA 10/1984"],
    requirements: ["Gelo ou refrigeracao permanente", "Area exclusiva", "Rastreabilidade de origem"],
    icon: Apple,
  },
  {
    value: "frozen_food",
    label: "Alimentos Congelados",
    category: "frozen",
    baseRate: 75,
    temperature: "-18C ou inferior",
    legislation: ["ANVISA RDC 216/2004", "Resolucao CNNPA 35/1977", "NBR 14701"],
    requirements: ["Temperatura <= -18C constante", "Nao recongelar produtos descongelados", "Embalagem hermetica"],
    icon: Snowflake,
  },
  {
    value: "frozen_meat",
    label: "Carnes Congeladas",
    category: "frozen",
    baseRate: 80,
    temperature: "-18C ou inferior",
    legislation: ["MAPA Decreto 9.013/2017", "Resolucao CNNPA 35/1977", "IN MAPA 60/2018"],
    requirements: ["Camara exclusiva para carnes", "Registro de temperatura automatico", "Descongelamento controlado"],
    icon: Snowflake,
  },
  {
    value: "frozen_icecream",
    label: "Sorvetes e Gelados",
    category: "frozen",
    baseRate: 85,
    temperature: "-23C ou inferior",
    legislation: ["ANVISA RDC 266/2005", "Resolucao CNNPA 35/1977"],
    requirements: ["Temperatura ultra-congelada", "Embalagem lacrada original", "Controle de cristalizacao"],
    icon: Snowflake,
  },
  {
    value: "pharma_standard",
    label: "Medicamentos Padrao",
    category: "pharmaceutical",
    baseRate: 90,
    temperature: "15C a 30C",
    legislation: ["ANVISA RDC 430/2020", "RDC 653/2022", "RDC 304"],
    requirements: ["Sistema de Gestao da Qualidade", "Area de quarentena", "Rastreabilidade total", "POPs documentados"],
    icon: Pill,
  },
  {
    value: "pharma_cold",
    label: "Medicamentos Refrigerados",
    category: "pharmaceutical",
    baseRate: 120,
    temperature: "2C a 8C",
    legislation: ["ANVISA RDC 430/2020", "RDC 938/2024", "RDC 653/2022"],
    requirements: ["Cadeia de frio farmaceutica", "Mapeamento termico obrigatorio", "Monitoramento 24/7", "Qualificacao termica de equipamentos"],
    icon: Pill,
  },
  {
    value: "pharma_frozen",
    label: "Vacinas e Biologicos",
    category: "pharmaceutical",
    baseRate: 150,
    temperature: "-20C a -70C",
    legislation: ["ANVISA RDC 430/2020", "RDC 938/2024", "PNI/MS"],
    requirements: ["Ultra-freezers qualificados", "Backup de energia obrigatorio", "Registro automatico de temperatura", "Plano de contingencia"],
    icon: Pill,
  },
  {
    value: "hazardous_flammable",
    label: "Inflamaveis",
    category: "hazardous",
    baseRate: 100,
    temperature: "Ambiente controlado",
    legislation: ["ABNT NBR 14725", "NR-20", "Decreto 96.044/1988"],
    requirements: ["Area isolada e ventilada", "Sistema anti-incendio", "Sinalizacao de risco", "FISPQ obrigatoria"],
    icon: AlertTriangle,
  },
  {
    value: "hazardous_corrosive",
    label: "Corrosivos",
    category: "hazardous",
    baseRate: 95,
    temperature: "Ambiente controlado",
    legislation: ["ABNT NBR 14725", "NR-20", "Resolucao ANTT 5.232/2016"],
    requirements: ["Piso resistente a corrosao", "Bacias de contencao", "EPIs especificos obrigatorios"],
    icon: AlertTriangle,
  },
  {
    value: "hazardous_toxic",
    label: "Toxicos",
    category: "hazardous",
    baseRate: 110,
    temperature: "Ambiente controlado",
    legislation: ["ABNT NBR 14725", "NR-20", "Lei 7.802/1989 (Agrotoxicos)"],
    requirements: ["Acesso restrito e controlado", "Exaustao adequada", "Licenca ambiental especifica"],
    icon: AlertTriangle,
  },
  {
    value: "agricultural_grains",
    label: "Graos e Cereais",
    category: "agricultural",
    baseRate: 18,
    temperature: "Ambiente seco (< 14% umidade)",
    legislation: ["CONAB Normativo", "IN MAPA 12/2020", "Lei 9.973/2000"],
    requirements: ["Controle de umidade e aeracao", "Prevencao de pragas", "Certificacao SNCUA opcional"],
    icon: Wheat,
  },
  {
    value: "agricultural_fertilizer",
    label: "Fertilizantes",
    category: "agricultural",
    baseRate: 22,
    temperature: "Ambiente seco",
    legislation: ["MAPA IN 53/2013", "Decreto 4.954/2004"],
    requirements: ["Separacao por tipo", "Protecao contra umidade", "Registro MAPA"],
    icon: Wheat,
  },
  {
    value: "chemical_industrial",
    label: "Quimicos Industriais",
    category: "hazardous",
    baseRate: 85,
    temperature: "Conforme FISPQ",
    legislation: ["ABNT NBR 14725", "NR-20", "Lei 12.305/2010 (PNRS)"],
    requirements: ["Compatibilidade quimica verificada", "Ventilacao adequada", "Plano de emergencia"],
    icon: FlaskConical,
  },
  {
    value: "special_fragile",
    label: "Frageis",
    category: "special",
    baseRate: 45,
    temperature: "Ambiente controlado",
    legislation: ["NBR 15.524-2/2008"],
    requirements: ["Manuseio especializado", "Embalagem reforçada", "Sinalizacao de fragilidade"],
    icon: Package,
  },
  {
    value: "special_highvalue",
    label: "Alto Valor Agregado",
    category: "special",
    baseRate: 60,
    temperature: "Ambiente controlado",
    legislation: ["NBR 15.524-2/2008"],
    requirements: ["Area com seguranca reforçada", "CFTV e controle de acesso", "Seguro obrigatorio"],
    icon: Gem,
  },
  {
    value: "special_artwork",
    label: "Obras de Arte",
    category: "special",
    baseRate: 120,
    temperature: "18C a 22C, umidade 45-55%",
    legislation: ["IPHAN", "Lei 8.313/1991 (Rouanet)"],
    requirements: ["Climatizacao precisa", "Iluminacao controlada", "Manuseio por especialistas"],
    icon: Gem,
  },
];

const periods = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias (1 mes)" },
  { value: "60", label: "60 dias (2 meses)" },
  { value: "90", label: "90 dias (3 meses)" },
  { value: "180", label: "180 dias (6 meses)" },
  { value: "365", label: "365 dias (1 ano)" },
];

interface ProposalData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  validityDays: number;
  notes: string;
}

export default function StorageCalculator() {
  const [formData, setFormData] = useState<StorageFormData>(initialFormData);
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [proposalData, setProposalData] = useState<ProposalData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    validityDays: 15,
    notes: "",
  });
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: quota } = useQuery<{ remaining: number | null; unlimited: boolean }>({
    queryKey: ["/api/calculations/quota"],
    enabled: isAuthenticated,
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: isAuthenticated,
  });

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients?.find(c => c.id.toString() === clientId);
    if (client) {
      setProposalData(prev => ({
        ...prev,
        clientName: client.name,
        clientEmail: client.email || "",
        clientPhone: client.phone || "",
      }));
    }
  };

  const useQuotaMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/calculations/use");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations/quota"] });
    },
  });

  const updateField = (field: keyof StorageFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "storageCategory") {
        newData.storageType = "";
        newData.storageRate = "";
      }
      if (field === "storageType") {
        const type = storageTypes.find((t) => t.value === value);
        if (type) {
          newData.storageRate = type.baseRate.toString();
        }
      }
      return newData;
    });
  };

  const filteredStorageTypes = useMemo(() => {
    if (!formData.storageCategory) return [];
    return storageTypes.filter((t) => t.category === formData.storageCategory);
  }, [formData.storageCategory]);

  const selectedType = useMemo(() => {
    return storageTypes.find((t) => t.value === formData.storageType);
  }, [formData.storageType]);

  const calculations = useMemo(() => {
    const area = parseFloat(formData.area) || 0;
    const period = parseInt(formData.period) || 30;
    const storageRate = parseFloat(formData.storageRate) || 0;
    const movementRate = parseFloat(formData.movementRate) || 0;
    const handlingValue = parseFloat(formData.handlingValue) || 0;
    const quantity = parseInt(formData.quantity) || 1;
    const palletPositions = parseInt(formData.palletPositions) || 0;
    const insuranceRate = parseFloat(formData.insuranceRate) || 0;
    const productValue = parseFloat(formData.productValue) || 0;

    const dailyRate = storageRate / 30;
    const storageValue = area * dailyRate * period;
    const palletValue = palletPositions * 8 * period;
    const movementValue = area * movementRate;
    const totalHandling = handlingValue * quantity;
    const insuranceValue = (productValue * insuranceRate) / 100;
    const subtotal = storageValue + palletValue + movementValue + totalHandling + insuranceValue;
    const adminFee = subtotal * 0.1;
    const totalValue = subtotal + adminFee;
    const monthlyEquivalent = (totalValue / period) * 30;

    return {
      dailyRate,
      storageValue,
      palletValue,
      movementValue,
      totalHandling,
      insuranceValue,
      subtotal,
      adminFee,
      totalValue,
      monthlyEquivalent,
    };
  }, [formData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        companyId: 1,
        clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
        proposalType: "storage",
        clientName: proposalData.clientName,
        clientEmail: proposalData.clientEmail,
        clientPhone: proposalData.clientPhone,
        validityDays: proposalData.validityDays,
        notes: proposalData.notes,
        totalValue: calculations.totalValue.toString(),
        proposalData: {
          storageCategory: formData.storageCategory,
          storageType: formData.storageType,
          storageTypeLabel: selectedType?.label,
          area: formData.area,
          period: formData.period,
          storageRate: formData.storageRate,
          movementRate: formData.movementRate,
          quantity: formData.quantity,
          palletPositions: formData.palletPositions,
          insuranceRate: formData.insuranceRate,
          productValue: formData.productValue,
          calculations: {
            storageValue: calculations.storageValue,
            palletValue: calculations.palletValue,
            movementValue: calculations.movementValue,
            totalHandling: calculations.totalHandling,
            insuranceValue: calculations.insuranceValue,
            subtotal: calculations.subtotal,
            adminFee: calculations.adminFee,
            totalValue: calculations.totalValue,
            monthlyEquivalent: calculations.monthlyEquivalent,
          },
        },
      };
      return apiRequest("POST", "/api/commercial-proposals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commercial-proposals"] });
      toast({ title: "Proposta de armazenagem criada com sucesso!" });
      setShowProposalDialog(false);
      setSelectedClientId("");
      setProposalData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        validityDays: 15,
        notes: "",
      });
      useQuotaMutation.mutate();
    },
    onError: () => {
      toast({ title: "Erro ao criar proposta", variant: "destructive" });
    },
  });

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const handleSendProposal = () => {
    if (!isAuthenticated) {
      setLocation("/cadastro");
      return;
    }
    if (!quota?.unlimited && quota?.remaining !== null && quota.remaining <= 0) {
      setShowUpgradeDialog(true);
      return;
    }
    setShowProposalDialog(true);
  };

  const canCalculate = parseFloat(formData.area) > 0 && formData.storageType;
  const selectedCategory = storageCategories.find((c) => c.value === formData.storageCategory);
  const CategoryIcon = selectedCategory?.icon || Package;
  const TypeIcon = selectedType?.icon || Package;

  return (
    <PublicLayout title="Calculadora de Armazenagem" subtitle="Calcule custos de armazenagem e movimentacao com base na legislacao brasileira">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Dados da Armazenagem
                {isAuthenticated && quota && !quota.unlimited && quota.remaining !== null && (
                  <Badge variant="outline" className="ml-auto">
                    {quota.remaining} calculos gratuitos restantes
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storageCategory">Categoria de Armazenagem</Label>
                  <Select
                    value={formData.storageCategory}
                    onValueChange={(value) => updateField("storageCategory", value)}
                  >
                    <SelectTrigger id="storageCategory" data-testid="select-storage-category">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {cat.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageType">Tipo de Produto</Label>
                  <Select
                    value={formData.storageType}
                    onValueChange={(value) => updateField("storageType", value)}
                    disabled={!formData.storageCategory}
                  >
                    <SelectTrigger id="storageType" data-testid="select-storage-type">
                      <SelectValue placeholder={formData.storageCategory ? "Selecione o tipo" : "Selecione a categoria primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStorageTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} (R$ {type.baseRate}/m²)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedType && (
                <Card className="bg-muted/50">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <TypeIcon className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{selectedType.label}</span>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {selectedType.temperature}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            <strong>Legislacao:</strong> {selectedType.legislation.join(", ")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Requisitos:</strong> {selectedType.requirements.join("; ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Periodo</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => updateField("period", value)}
                  >
                    <SelectTrigger id="period" data-testid="select-period">
                      <SelectValue placeholder="Selecione o periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area Ocupada (m²)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.area}
                    onChange={(e) => updateField("area", e.target.value)}
                    data-testid="input-area"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storageRate">Taxa de Armazenagem (R$/m²/mes)</Label>
                  <Input
                    id="storageRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.storageRate}
                    onChange={(e) => updateField("storageRate", e.target.value)}
                    data-testid="input-storage-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="palletPositions">Posicoes Pallet (R$ 8/dia)</Label>
                  <Input
                    id="palletPositions"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.palletPositions}
                    onChange={(e) => updateField("palletPositions", e.target.value)}
                    data-testid="input-pallet-positions"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="movementRate">Taxa de Movimentacao (R$/m²)</Label>
                  <Input
                    id="movementRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.movementRate}
                    onChange={(e) => updateField("movementRate", e.target.value)}
                    data-testid="input-movement-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handlingValue">Valor por Manuseio (R$)</Label>
                  <Input
                    id="handlingValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.handlingValue}
                    onChange={(e) => updateField("handlingValue", e.target.value)}
                    data-testid="input-handling-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade de Manuseios</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => updateField("quantity", e.target.value)}
                    data-testid="input-quantity"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productValue">Valor da Mercadoria (R$)</Label>
                  <Input
                    id="productValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Para calculo de seguro"
                    value={formData.productValue}
                    onChange={(e) => updateField("productValue", e.target.value)}
                    data-testid="input-product-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceRate">Taxa de Seguro (%)</Label>
                  <Input
                    id="insuranceRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,05"
                    value={formData.insuranceRate}
                    onChange={(e) => updateField("insuranceRate", e.target.value)}
                    data-testid="input-insurance-rate"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-reset-storage"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                {!isAuthenticated ? (
                  <Button onClick={handleSendProposal} disabled={!canCalculate} data-testid="button-create-storage-proposal">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastre-se para Salvar
                  </Button>
                ) : (
                  <Button
                    onClick={handleSendProposal}
                    disabled={!canCalculate || saveMutation.isPending}
                    data-testid="button-save-storage"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveMutation.isPending ? "Salvando..." : "Salvar Calculo"}
                    {quota?.remaining !== null && !quota?.unlimited && (
                      <Badge variant="secondary" className="ml-2">
                        {quota?.remaining} gratuitos
                      </Badge>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Legislacao e Normas Aplicaveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-2">Carga Seca</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>NBR 15.524-2/2008:</strong> Sistemas de armazenagem e estruturas porta-paletes</li>
                  <li><strong>NR-11:</strong> Transporte, movimentacao e armazenagem de materiais</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Alimentos Refrigerados/Congelados</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>ANVISA RDC 216/2004:</strong> Boas praticas para servicos de alimentacao</li>
                  <li><strong>MAPA Decreto 9.013/2017 (RIISPOA):</strong> Inspecao de produtos de origem animal</li>
                  <li><strong>Resolucao CNNPA 35/1977:</strong> Padroes para alimentos congelados (min. -18C)</li>
                  <li><strong>NBR 14701:</strong> Transporte de produtos pereciveis refrigerados/congelados</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Medicamentos e Farmaceuticos</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>ANVISA RDC 430/2020:</strong> Boas praticas de distribuicao e armazenagem</li>
                  <li><strong>RDC 938/2024:</strong> Armazens alfandegados - mapeamento termico obrigatorio</li>
                  <li><strong>RDC 653/2022:</strong> Prazo final marco/2024 para adequacao</li>
                  <li><strong>RDC 887/2024:</strong> Gases medicinais - distribuicao e armazenagem</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Produtos Perigosos</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>ABNT NBR 14725:</strong> Produtos quimicos - FISPQ obrigatoria</li>
                  <li><strong>NR-20:</strong> Seguranca com inflamaveis e combustiveis</li>
                  <li><strong>Resolucao ANTT 5.232/2016:</strong> Transporte terrestre de produtos perigosos</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">Produtos Agricolas</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Lei 9.973/2000:</strong> Sistema de armazenagem de produtos agropecuarios</li>
                  <li><strong>SNCUA:</strong> Sistema Nacional de Certificacao de Unidades Armazenadoras</li>
                  <li><strong>CONAB:</strong> Normativos para graos e cereais</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {CategoryIcon && <CategoryIcon className="h-5 w-5" />}
                Resultado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Area</span>
                  <span className="font-medium">
                    {parseFloat(formData.area) || 0} m²
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Periodo</span>
                  <span className="font-medium">{formData.period} dias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Taxa diaria</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.dailyRate)}/m²
                  </span>
                </div>
                <Separator className="bg-primary-foreground/20" />
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Armazenagem</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.storageValue)}
                  </span>
                </div>
                {calculations.palletValue > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-primary-foreground/80">Pallets</span>
                    <span className="font-medium">
                      {formatCurrency(calculations.palletValue)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Movimentacao</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.movementValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Manuseio</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.totalHandling)}
                  </span>
                </div>
                {calculations.insuranceValue > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-primary-foreground/80">Seguro</span>
                    <span className="font-medium">
                      {formatCurrency(calculations.insuranceValue)}
                    </span>
                  </div>
                )}
                <Separator className="bg-primary-foreground/20" />
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Taxa Admin. (10%)</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.adminFee)}
                  </span>
                </div>
              </div>
              <Separator className="bg-primary-foreground/20" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold" data-testid="text-storage-total">
                  {formatCurrency(calculations.totalValue)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20">
                <span className="text-primary-foreground/80">Equiv. mensal</span>
                <span className="font-medium">
                  {formatCurrency(calculations.monthlyEquivalent)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Temperaturas de Referencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carga Seca</span>
                <span className="font-medium">15-30C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Refrigerados</span>
                <span className="font-medium">0-10C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Laticinios</span>
                <span className="font-medium">2-8C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carnes</span>
                <span className="font-medium">0-4C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Congelados</span>
                <span className="font-medium">-18C ou menos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medicamentos</span>
                <span className="font-medium">2-8C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vacinas</span>
                <span className="font-medium">-20 a -70C</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Taxas Base por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {storageCategories.map((cat) => {
                const Icon = cat.icon;
                const minRate = Math.min(...storageTypes.filter((t) => t.category === cat.value).map((t) => t.baseRate));
                const maxRate = Math.max(...storageTypes.filter((t) => t.category === cat.value).map((t) => t.baseRate));
                return (
                  <div key={cat.value} className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </span>
                    <span className="font-medium">R$ {minRate}-{maxRate}/m²</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Proposta de Armazenagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <ClientCombobox
                clients={clients || []}
                value={selectedClientId}
                onValueChange={handleClientSelect}
                placeholder="Buscar ou cadastrar cliente..."
                allowNone={false}
                showAddButton={true}
                data-testid="select-client"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={proposalData.clientName}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Razao Social"
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={proposalData.clientEmail}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="email@empresa.com"
                  data-testid="input-client-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input
                  id="clientPhone"
                  value={proposalData.clientPhone}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  data-testid="input-client-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validityDays">Validade (dias)</Label>
                <Input
                  id="validityDays"
                  type="number"
                  min="1"
                  value={proposalData.validityDays}
                  onChange={(e) => setProposalData(prev => ({ ...prev, validityDays: parseInt(e.target.value) || 15 }))}
                  data-testid="input-validity-days"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observacoes</Label>
              <Textarea
                id="notes"
                value={proposalData.notes}
                onChange={(e) => setProposalData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observacoes adicionais..."
                rows={2}
                data-testid="input-notes"
              />
            </div>

            <Separator />

            <div className="bg-muted p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tipo:</span>
                <span className="font-medium">{selectedType?.label || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Area:</span>
                <span className="font-medium">{formData.area} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Periodo:</span>
                <span className="font-medium">{formData.period} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-bold">{formatCurrency(calculations.totalValue)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowProposalDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !proposalData.clientName}
              data-testid="button-confirm-save"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Criar Proposta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Limite de Calculos Gratuitos Atingido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Voce utilizou seus 3 calculos gratuitos. Para continuar usando as calculadoras e acessar todos os recursos, atualize para um plano pago.
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="font-medium">Com um plano pago voce tem:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Calculos ilimitados de frete e armazenagem</li>
                <li>- CRM completo para gestao de clientes</li>
                <li>- Pipeline de vendas e oportunidades</li>
                <li>- Checklists operacionais para 15 departamentos</li>
                <li>- Gestao financeira completa</li>
                <li>- Materiais de marketing personalizados</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Voltar
            </Button>
            <Button onClick={() => setLocation("/planos")} data-testid="button-view-plans-storage">
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
