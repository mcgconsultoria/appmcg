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
import { Calculator, RotateCcw, Save, FileDown } from "lucide-react";
import { brazilStates, getIcmsRate, formatCurrency } from "@/lib/brazilStates";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FreightFormData {
  originState: string;
  destinationState: string;
  cargoValue: string;
  freightValue: string;
  weight: string;
  grisRate: string;
  advRate: string;
  tollValue: string;
  unloadingValue: string;
}

const initialFormData: FreightFormData = {
  originState: "",
  destinationState: "",
  cargoValue: "",
  freightValue: "",
  weight: "",
  grisRate: "0.3",
  advRate: "0.3",
  tollValue: "",
  unloadingValue: "",
};

export default function FreightCalculator() {
  const [formData, setFormData] = useState<FreightFormData>(initialFormData);
  const { toast } = useToast();

  const updateField = (field: keyof FreightFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculations = useMemo(() => {
    const cargoValue = parseFloat(formData.cargoValue) || 0;
    const freightValue = parseFloat(formData.freightValue) || 0;
    const weight = parseFloat(formData.weight) || 0;
    const grisRate = parseFloat(formData.grisRate) || 0;
    const advRate = parseFloat(formData.advRate) || 0;
    const tollValue = parseFloat(formData.tollValue) || 0;
    const unloadingValue = parseFloat(formData.unloadingValue) || 0;
    const icmsRate = formData.destinationState ? getIcmsRate(formData.destinationState) : 0;

    const grisValue = cargoValue * (grisRate / 100);
    const advValue = cargoValue * (advRate / 100);
    const subtotal = freightValue + grisValue + advValue + tollValue + unloadingValue;
    const icmsValue = subtotal * (icmsRate / 100);
    const totalValue = subtotal + icmsValue;
    const valuePerKg = weight > 0 ? totalValue / weight : 0;

    return {
      icmsRate,
      icmsValue,
      grisValue,
      advValue,
      subtotal,
      totalValue,
      valuePerKg,
    };
  }, [formData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        companyId: 1,
        originState: formData.originState,
        destinationState: formData.destinationState,
        weight: formData.weight || undefined,
        cargoValue: formData.cargoValue || undefined,
        freightValue: formData.freightValue || undefined,
        icmsRate: calculations.icmsRate.toString(),
        icmsValue: calculations.icmsValue.toString(),
        grisRate: formData.grisRate || undefined,
        grisValue: calculations.grisValue.toString(),
        advRate: formData.advRate || undefined,
        advValue: calculations.advValue.toString(),
        tollValue: formData.tollValue || undefined,
        unloadingValue: formData.unloadingValue || undefined,
        totalValue: calculations.totalValue.toString(),
      };
      return apiRequest("POST", "/api/freight-calculations", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/freight-calculations"] });
      toast({ title: "Cálculo salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar cálculo", variant: "destructive" });
    },
  });

  const handleReset = () => {
    setFormData(initialFormData);
  };

  const canCalculate = formData.destinationState && (parseFloat(formData.freightValue) > 0 || parseFloat(formData.cargoValue) > 0);

  return (
    <AppLayout title="Calculadora de Frete" subtitle="Calcule fretes com impostos e taxas">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Dados do Frete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originState">Estado de Origem</Label>
                  <Select
                    value={formData.originState}
                    onValueChange={(value) => updateField("originState", value)}
                  >
                    <SelectTrigger id="originState" data-testid="select-origin-state">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilStates.map((state) => (
                        <SelectItem key={state.uf} value={state.uf}>
                          {state.uf} - {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destinationState">Estado de Destino</Label>
                  <Select
                    value={formData.destinationState}
                    onValueChange={(value) => updateField("destinationState", value)}
                  >
                    <SelectTrigger id="destinationState" data-testid="select-destination-state">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilStates.map((state) => (
                        <SelectItem key={state.uf} value={state.uf}>
                          {state.uf} - {state.name} (ICMS: {state.icms}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargoValue">Valor da Mercadoria (R$)</Label>
                  <Input
                    id="cargoValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.cargoValue}
                    onChange={(e) => updateField("cargoValue", e.target.value)}
                    data-testid="input-cargo-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="freightValue">Frete Líquido (R$)</Label>
                  <Input
                    id="freightValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.freightValue}
                    onChange={(e) => updateField("freightValue", e.target.value)}
                    data-testid="input-freight-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    data-testid="input-weight"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grisRate">GRIS (%)</Label>
                  <Input
                    id="grisRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,30"
                    value={formData.grisRate}
                    onChange={(e) => updateField("grisRate", e.target.value)}
                    data-testid="input-gris-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="advRate">ADV (%)</Label>
                  <Input
                    id="advRate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,30"
                    value={formData.advRate}
                    onChange={(e) => updateField("advRate", e.target.value)}
                    data-testid="input-adv-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tollValue">Pedágio (R$)</Label>
                  <Input
                    id="tollValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.tollValue}
                    onChange={(e) => updateField("tollValue", e.target.value)}
                    data-testid="input-toll-value"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unloadingValue">Descarga (R$)</Label>
                  <Input
                    id="unloadingValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.unloadingValue}
                    onChange={(e) => updateField("unloadingValue", e.target.value)}
                    data-testid="input-unloading-value"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  data-testid="button-reset-freight"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button
                  onClick={() => saveMutation.mutate()}
                  disabled={!canCalculate || saveMutation.isPending}
                  data-testid="button-save-freight"
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
                  <span className="text-primary-foreground/80">Frete Líquido</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(formData.freightValue) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">
                    GRIS ({formData.grisRate || 0}%)
                  </span>
                  <span className="font-medium">{formatCurrency(calculations.grisValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">
                    ADV ({formData.advRate || 0}%)
                  </span>
                  <span className="font-medium">{formatCurrency(calculations.advValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Pedágio</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(formData.tollValue) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Descarga</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(formData.unloadingValue) || 0)}
                  </span>
                </div>
                <Separator className="bg-primary-foreground/20" />
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-foreground/80">
                    ICMS ({calculations.icmsRate}%)
                  </span>
                  <span className="font-medium">{formatCurrency(calculations.icmsValue)}</span>
                </div>
              </div>
              <Separator className="bg-primary-foreground/20" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold" data-testid="text-freight-total">
                  {formatCurrency(calculations.totalValue)}
                </span>
              </div>
              {parseFloat(formData.weight) > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-primary-foreground/20">
                  <span className="text-primary-foreground/80">Valor por kg</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.valuePerKg)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>GRIS:</strong> Gerenciamento de Riscos - taxa para cobertura de
                seguro de carga.
              </p>
              <p>
                <strong>ADV:</strong> Ad Valorem - percentual sobre o valor da mercadoria.
              </p>
              <p>
                <strong>ICMS:</strong> Imposto sobre Circulação de Mercadorias - varia por
                estado de destino.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
