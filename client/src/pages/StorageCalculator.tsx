import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Warehouse, RotateCcw, Save } from "lucide-react";
import { formatCurrency } from "@/lib/brazilStates";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StorageFormData {
  area: string;
  period: string;
  productType: string;
  storageRate: string;
  movementRate: string;
  handlingValue: string;
  quantity: string;
}

const initialFormData: StorageFormData = {
  area: "",
  period: "30",
  productType: "",
  storageRate: "",
  movementRate: "",
  handlingValue: "",
  quantity: "",
};

const productTypes = [
  { value: "general", label: "Carga Geral", baseRate: 25 },
  { value: "refrigerated", label: "Refrigerada", baseRate: 45 },
  { value: "frozen", label: "Congelada", baseRate: 55 },
  { value: "hazardous", label: "Perigosa", baseRate: 60 },
  { value: "fragile", label: "Frágil", baseRate: 35 },
  { value: "high_value", label: "Alto Valor", baseRate: 40 },
];

const periods = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias (1 mês)" },
  { value: "60", label: "60 dias (2 meses)" },
  { value: "90", label: "90 dias (3 meses)" },
  { value: "180", label: "180 dias (6 meses)" },
  { value: "365", label: "365 dias (1 ano)" },
];

export default function StorageCalculator() {
  const [formData, setFormData] = useState<StorageFormData>(initialFormData);
  const { toast } = useToast();

  const updateField = (field: keyof StorageFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "productType") {
        const product = productTypes.find((p) => p.value === value);
        if (product) {
          newData.storageRate = product.baseRate.toString();
        }
      }
      return newData;
    });
  };

  const calculations = useMemo(() => {
    const area = parseFloat(formData.area) || 0;
    const period = parseInt(formData.period) || 30;
    const storageRate = parseFloat(formData.storageRate) || 0;
    const movementRate = parseFloat(formData.movementRate) || 0;
    const handlingValue = parseFloat(formData.handlingValue) || 0;
    const quantity = parseInt(formData.quantity) || 1;

    const dailyRate = storageRate / 30;
    const storageValue = area * dailyRate * period;
    const movementValue = area * movementRate;
    const totalHandling = handlingValue * quantity;
    const subtotal = storageValue + movementValue + totalHandling;
    const adminFee = subtotal * 0.1;
    const totalValue = subtotal + adminFee;
    const monthlyEquivalent = (totalValue / period) * 30;

    return {
      dailyRate,
      storageValue,
      movementValue,
      totalHandling,
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
        area: formData.area || undefined,
        period: parseInt(formData.period) || undefined,
        productType: formData.productType || undefined,
        storageRate: formData.storageRate || undefined,
        movementRate: formData.movementRate || undefined,
        handlingValue: calculations.totalHandling.toString(),
        totalValue: calculations.totalValue.toString(),
      };
      return apiRequest("POST", "/api/storage-calculations", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage-calculations"] });
      toast({ title: "Cálculo salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar cálculo", variant: "destructive" });
    },
  });

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const canCalculate = parseFloat(formData.area) > 0 && formData.productType;

  return (
    <AppLayout title="Calculadora de Armazenagem" subtitle="Calcule custos de armazenagem e movimentação">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Dados da Armazenagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productType">Tipo de Produto</Label>
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => updateField("productType", value)}
                  >
                    <SelectTrigger id="productType" data-testid="select-product-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} (R$ {type.baseRate}/m²)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Período</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value) => updateField("period", value)}
                  >
                    <SelectTrigger id="period" data-testid="select-period">
                      <SelectValue placeholder="Selecione o período" />
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
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Área Ocupada (m²)</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="storageRate">Taxa de Armazenagem (R$/m²/mês)</Label>
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
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="movementRate">Taxa de Movimentação (R$/m²)</Label>
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

              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-reset-storage"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!canCalculate || saveMutation.isPending}
                  data-testid="button-save-storage"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? "Salvando..." : "Salvar Cálculo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Resultado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Área</span>
                  <span className="font-medium">
                    {parseFloat(formData.area) || 0} m²
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Período</span>
                  <span className="font-medium">{formData.period} dias</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Taxa diária</span>
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
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Movimentação</span>
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
              <CardTitle className="text-lg">Taxas por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {productTypes.map((type) => (
                <div key={type.value} className="flex justify-between">
                  <span className="text-muted-foreground">{type.label}</span>
                  <span className="font-medium">R$ {type.baseRate}/m²</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
