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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calculator,
  RotateCcw,
  Save,
  FileDown,
  Plus,
  Trash2,
  Send,
  AlertCircle,
  Info,
  Truck,
  Package,
  MapPin,
} from "lucide-react";
import {
  brazilStates,
  productTypes,
  packagingTypes,
  vehicleAxles,
  formatCurrency,
  calculateAnttMinFreight,
  getTaxInfo,
  isTollExemptFromIcms,
  getRouteType,
} from "@/lib/brazilStates";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";

interface RouteData {
  id: string;
  operationName: string;
  originCity: string;
  originState: string;
  destinationCity: string;
  destinationState: string;
  distanceKm: string;
  productType: string;
  packagingType: string;
  weight: string;
  cargoValue: string;
  vehicleAxles: number;
  useAnttMinFreight: boolean;
  freightValue: string;
  tollValue: string;
  unloadingValue: string;
  grisRate: string;
  advRate: string;
}

const createEmptyRoute = (): RouteData => ({
  id: crypto.randomUUID(),
  operationName: "",
  originCity: "",
  originState: "",
  destinationCity: "",
  destinationState: "",
  distanceKm: "",
  productType: "carga_geral",
  packagingType: "pallet",
  weight: "",
  cargoValue: "",
  vehicleAxles: 5,
  useAnttMinFreight: false,
  freightValue: "",
  tollValue: "",
  unloadingValue: "",
  grisRate: "0.3",
  advRate: "0.3",
});

interface ProposalData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCnpj: string;
  validityDays: number;
  contractType: string;
  notes: string;
}

const initialProposalData: ProposalData = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientCnpj: "",
  validityDays: 15,
  contractType: "spot",
  notes: "",
};

export default function FreightCalculator() {
  const [routes, setRoutes] = useState<RouteData[]>([createEmptyRoute()]);
  const [proposalData, setProposalData] = useState<ProposalData>(initialProposalData);
  const [showProposalDialog, setShowProposalDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const { toast } = useToast();

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const updateRoute = (routeId: string, field: keyof RouteData, value: any) => {
    setRoutes((prev) =>
      prev.map((route) =>
        route.id === routeId ? { ...route, [field]: value } : route
      )
    );
  };

  const addRoute = () => {
    setRoutes((prev) => [...prev, createEmptyRoute()]);
  };

  const removeRoute = (routeId: string) => {
    if (routes.length > 1) {
      setRoutes((prev) => prev.filter((route) => route.id !== routeId));
    }
  };

  const calculateRouteValues = (route: RouteData) => {
    const distanceKm = parseFloat(route.distanceKm) || 0;
    const cargoValue = parseFloat(route.cargoValue) || 0;
    const weight = parseFloat(route.weight) || 0;
    const grisRate = parseFloat(route.grisRate) || 0;
    const advRate = parseFloat(route.advRate) || 0;
    const tollValue = parseFloat(route.tollValue) || 0;
    const unloadingValue = parseFloat(route.unloadingValue) || 0;

    const anttMinFreight = calculateAnttMinFreight(
      distanceKm,
      route.productType,
      route.vehicleAxles
    );

    const freightValue = route.useAnttMinFreight
      ? anttMinFreight
      : parseFloat(route.freightValue) || 0;

    const grisValue = cargoValue * (grisRate / 100);
    const advValue = cargoValue * (advRate / 100);

    const routeType = getRouteType(
      route.originState,
      route.originCity,
      route.destinationState,
      route.destinationCity
    );

    const taxInfo = getTaxInfo(
      route.originState,
      route.originCity,
      route.destinationState,
      route.destinationCity
    );

    const tollExempt = isTollExemptFromIcms(route.originState);

    let baseForTax = freightValue + grisValue + advValue + unloadingValue;
    if (!tollExempt && routeType !== "municipal") {
      baseForTax += tollValue;
    }

    const taxValue =
      taxInfo.taxType === "ICMS"
        ? baseForTax / (1 - taxInfo.rate / 100) - baseForTax
        : baseForTax * (taxInfo.rate / 100);

    const totalValue = freightValue + grisValue + advValue + tollValue + unloadingValue + taxValue;
    const valuePerKg = weight > 0 ? totalValue / weight : 0;

    return {
      anttMinFreight,
      freightValue,
      grisValue,
      advValue,
      tollValue,
      unloadingValue,
      taxInfo,
      taxValue,
      tollExempt,
      routeType,
      totalValue,
      valuePerKg,
      baseForTax,
    };
  };

  const routeCalculations = useMemo(() => {
    return routes.map((route) => ({
      route,
      ...calculateRouteValues(route),
    }));
  }, [routes]);

  const totalProposalValue = useMemo(() => {
    return routeCalculations.reduce((sum, calc) => sum + calc.totalValue, 0);
  }, [routeCalculations]);

  const saveMutation = useMutation({
    mutationFn: async (data: { routes: RouteData[]; proposal?: ProposalData }) => {
      const payload = {
        companyId: 1,
        clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
        ...data.proposal,
        routes: data.routes.map((route) => {
          const calc = calculateRouteValues(route);
          return {
            ...route,
            distanceKm: route.distanceKm || undefined,
            weight: route.weight || undefined,
            cargoValue: route.cargoValue || undefined,
            anttMinFreight: calc.anttMinFreight.toString(),
            freightValue: calc.freightValue.toString(),
            tollValue: calc.tollValue.toString(),
            tollInIcmsBase: !calc.tollExempt,
            icmsRate: calc.taxInfo.taxType === "ICMS" ? calc.taxInfo.rate.toString() : undefined,
            icmsValue: calc.taxInfo.taxType === "ICMS" ? calc.taxValue.toString() : undefined,
            issRate: calc.taxInfo.taxType === "ISS" ? calc.taxInfo.rate.toString() : undefined,
            issValue: calc.taxInfo.taxType === "ISS" ? calc.taxValue.toString() : undefined,
            grisRate: route.grisRate,
            grisValue: calc.grisValue.toString(),
            advRate: route.advRate,
            advValue: calc.advValue.toString(),
            unloadingValue: route.unloadingValue || undefined,
            totalValue: calc.totalValue.toString(),
          };
        }),
        totalValue: totalProposalValue.toString(),
      };
      return apiRequest("POST", "/api/commercial-proposals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commercial-proposals"] });
      toast({ title: "Proposta comercial criada com sucesso!" });
      setShowProposalDialog(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar proposta", variant: "destructive" });
    },
  });

  const handleReset = () => {
    setRoutes([createEmptyRoute()]);
    setProposalData(initialProposalData);
    setSelectedClientId("");
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients?.find((c) => c.id.toString() === clientId);
    if (client) {
      setProposalData((prev) => ({
        ...prev,
        clientName: client.name,
        clientEmail: client.email || "",
        clientPhone: client.phone || "",
        clientCnpj: client.cnpj || "",
      }));
    }
  };

  const canCalculate = routes.some(
    (route) =>
      route.originState &&
      route.destinationState &&
      (parseFloat(route.freightValue) > 0 || route.useAnttMinFreight)
  );

  return (
    <AppLayout
      title="Calculadora de Frete"
      subtitle="Calcule fretes com impostos, taxas e tabela ANTT"
    >
      <div className="space-y-6">
        {routes.map((route, index) => {
          const calc = routeCalculations.find((c) => c.route.id === route.id);
          return (
            <Card key={route.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Rota {index + 1}
                    {route.operationName && (
                      <Badge variant="secondary">{route.operationName}</Badge>
                    )}
                  </CardTitle>
                  {routes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRoute(route.id)}
                      data-testid={`button-remove-route-${index}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor={`operationName-${route.id}`}>
                    Nome da Operacao (opcional)
                  </Label>
                  <Input
                    id={`operationName-${route.id}`}
                    placeholder="Ex: Coleta Curitiba - Entrega São Paulo"
                    value={route.operationName}
                    onChange={(e) =>
                      updateRoute(route.id, "operationName", e.target.value)
                    }
                    data-testid={`input-operation-name-${index}`}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Origem
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`originState-${route.id}`}>Estado</Label>
                        <Select
                          value={route.originState}
                          onValueChange={(value) =>
                            updateRoute(route.id, "originState", value)
                          }
                        >
                          <SelectTrigger
                            id={`originState-${route.id}`}
                            data-testid={`select-origin-state-${index}`}
                          >
                            <SelectValue placeholder="UF" />
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
                        <Label htmlFor={`originCity-${route.id}`}>Cidade</Label>
                        <Input
                          id={`originCity-${route.id}`}
                          placeholder="Cidade de origem"
                          value={route.originCity}
                          onChange={(e) =>
                            updateRoute(route.id, "originCity", e.target.value)
                          }
                          data-testid={`input-origin-city-${index}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Destino
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`destinationState-${route.id}`}>
                          Estado
                        </Label>
                        <Select
                          value={route.destinationState}
                          onValueChange={(value) =>
                            updateRoute(route.id, "destinationState", value)
                          }
                        >
                          <SelectTrigger
                            id={`destinationState-${route.id}`}
                            data-testid={`select-destination-state-${index}`}
                          >
                            <SelectValue placeholder="UF" />
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
                        <Label htmlFor={`destinationCity-${route.id}`}>
                          Cidade
                        </Label>
                        <Input
                          id={`destinationCity-${route.id}`}
                          placeholder="Cidade de destino"
                          value={route.destinationCity}
                          onChange={(e) =>
                            updateRoute(route.id, "destinationCity", e.target.value)
                          }
                          data-testid={`input-destination-city-${index}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {calc?.tollExempt && route.originState === "PR" && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>Lei do PR (Decreto 7.871/2017):</strong> Pedagio nao
                      incide na base de calculo do ICMS para cargas com origem no
                      Parana.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Dados da Carga
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`productType-${route.id}`}>
                      Tipo de Produto
                    </Label>
                    <Select
                      value={route.productType}
                      onValueChange={(value) =>
                        updateRoute(route.id, "productType", value)
                      }
                    >
                      <SelectTrigger
                        id={`productType-${route.id}`}
                        data-testid={`select-product-type-${index}`}
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`packagingType-${route.id}`}>
                      Tipo de Embalagem
                    </Label>
                    <Select
                      value={route.packagingType}
                      onValueChange={(value) =>
                        updateRoute(route.id, "packagingType", value)
                      }
                    >
                      <SelectTrigger
                        id={`packagingType-${route.id}`}
                        data-testid={`select-packaging-type-${index}`}
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {packagingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`weight-${route.id}`}>Peso (kg)</Label>
                    <Input
                      id={`weight-${route.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={route.weight}
                      onChange={(e) =>
                        updateRoute(route.id, "weight", e.target.value)
                      }
                      data-testid={`input-weight-${index}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`cargoValue-${route.id}`}>
                      Valor da NF (R$)
                    </Label>
                    <Input
                      id={`cargoValue-${route.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={route.cargoValue}
                      onChange={(e) =>
                        updateRoute(route.id, "cargoValue", e.target.value)
                      }
                      data-testid={`input-cargo-value-${index}`}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calculator className="h-4 w-4" />
                  Calculo do Frete
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`vehicleAxles-${route.id}`}>
                      Eixos do Veiculo
                    </Label>
                    <Select
                      value={route.vehicleAxles.toString()}
                      onValueChange={(value) =>
                        updateRoute(route.id, "vehicleAxles", parseInt(value))
                      }
                    >
                      <SelectTrigger
                        id={`vehicleAxles-${route.id}`}
                        data-testid={`select-vehicle-axles-${index}`}
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleAxles.map((axle) => (
                          <SelectItem key={axle.value} value={axle.value.toString()}>
                            {axle.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`distanceKm-${route.id}`}>Distancia (km)</Label>
                    <Input
                      id={`distanceKm-${route.id}`}
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0"
                      value={route.distanceKm}
                      onChange={(e) =>
                        updateRoute(route.id, "distanceKm", e.target.value)
                      }
                      data-testid={`input-distance-${index}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frete Minimo ANTT</Label>
                    <div className="flex items-center gap-2 min-h-9 px-3 py-2 rounded-md border bg-muted/50">
                      <span className="font-medium">
                        {formatCurrency(calc?.anttMinFreight || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <Checkbox
                    id={`useAnttMinFreight-${route.id}`}
                    checked={route.useAnttMinFreight}
                    onCheckedChange={(checked) =>
                      updateRoute(route.id, "useAnttMinFreight", checked)
                    }
                    data-testid={`checkbox-use-antt-${index}`}
                  />
                  <Label
                    htmlFor={`useAnttMinFreight-${route.id}`}
                    className="text-sm cursor-pointer"
                  >
                    Usar frete minimo ANTT como base
                  </Label>
                </div>

                {!route.useAnttMinFreight && (
                  <div className="space-y-2">
                    <Label htmlFor={`freightValue-${route.id}`}>
                      Frete Liquido (R$)
                    </Label>
                    <Input
                      id={`freightValue-${route.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={route.freightValue}
                      onChange={(e) =>
                        updateRoute(route.id, "freightValue", e.target.value)
                      }
                      data-testid={`input-freight-value-${index}`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tollValue-${route.id}`}>Pedagio (R$)</Label>
                    <Input
                      id={`tollValue-${route.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={route.tollValue}
                      onChange={(e) =>
                        updateRoute(route.id, "tollValue", e.target.value)
                      }
                      data-testid={`input-toll-value-${index}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`unloadingValue-${route.id}`}>
                      Descarga (R$)
                    </Label>
                    <Input
                      id={`unloadingValue-${route.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={route.unloadingValue}
                      onChange={(e) =>
                        updateRoute(route.id, "unloadingValue", e.target.value)
                      }
                      data-testid={`input-unloading-value-${index}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`grisRate-${route.id}`}>GRIS (%)</Label>
                    <Input
                      id={`grisRate-${route.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,30"
                      value={route.grisRate}
                      onChange={(e) =>
                        updateRoute(route.id, "grisRate", e.target.value)
                      }
                      data-testid={`input-gris-rate-${index}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`advRate-${route.id}`}>ADV (%)</Label>
                    <Input
                      id={`advRate-${route.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,30"
                      value={route.advRate}
                      onChange={(e) =>
                        updateRoute(route.id, "advRate", e.target.value)
                      }
                      data-testid={`input-adv-rate-${index}`}
                    />
                  </div>
                </div>

                <Separator />

                <div className="bg-primary text-primary-foreground rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/80">Frete Base</span>
                    <span className="font-medium">
                      {formatCurrency(calc?.freightValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/80">
                      GRIS ({route.grisRate || 0}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(calc?.grisValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/80">
                      ADV ({route.advRate || 0}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(calc?.advValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/80">
                      Pedagio{" "}
                      {calc?.tollExempt && (
                        <span className="text-xs">(fora da base ICMS)</span>
                      )}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(calc?.tollValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/80">Descarga</span>
                    <span className="font-medium">
                      {formatCurrency(calc?.unloadingValue || 0)}
                    </span>
                  </div>
                  <Separator className="bg-primary-foreground/20" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/80">
                      {calc?.taxInfo?.taxType} ({calc?.taxInfo?.rate || 0}%)
                    </span>
                    <span className="font-medium">
                      {formatCurrency(calc?.taxValue || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-primary-foreground/60">
                    {calc?.taxInfo?.description}
                  </div>
                  <Separator className="bg-primary-foreground/20" />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total da Rota</span>
                    <span
                      className="font-bold"
                      data-testid={`text-route-total-${index}`}
                    >
                      {formatCurrency(calc?.totalValue || 0)}
                    </span>
                  </div>
                  {parseFloat(route.weight) > 0 && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-primary-foreground/20">
                      <span className="text-primary-foreground/80">
                        Valor por kg
                      </span>
                      <span className="font-medium">
                        {formatCurrency(calc?.valuePerKg || 0)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={addRoute} data-testid="button-add-route">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Rota
          </Button>
          <Button variant="outline" onClick={handleReset} data-testid="button-reset">
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar Tudo
          </Button>
        </div>

        <Card className="bg-secondary">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total de {routes.length} rota(s)
                </p>
                <p className="text-2xl font-bold" data-testid="text-total-proposal">
                  {formatCurrency(totalProposalValue)}
                </p>
              </div>
              <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
                <DialogTrigger asChild>
                  <Button disabled={!canCalculate} data-testid="button-create-proposal">
                    <FileDown className="h-4 w-4 mr-2" />
                    Criar Proposta Comercial
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Criar Proposta Comercial</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectClient">Selecionar Cliente Existente</Label>
                      <Select
                        value={selectedClientId}
                        onValueChange={handleClientSelect}
                      >
                        <SelectTrigger id="selectClient" data-testid="select-client">
                          <SelectValue placeholder="Selecione um cliente ou preencha manualmente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id.toString()}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nome do Cliente</Label>
                      <Input
                        id="clientName"
                        value={proposalData.clientName}
                        onChange={(e) =>
                          setProposalData((prev) => ({
                            ...prev,
                            clientName: e.target.value,
                          }))
                        }
                        placeholder="Razao Social"
                        data-testid="input-client-name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={proposalData.clientEmail}
                          onChange={(e) =>
                            setProposalData((prev) => ({
                              ...prev,
                              clientEmail: e.target.value,
                            }))
                          }
                          placeholder="email@empresa.com"
                          data-testid="input-client-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientPhone">Telefone</Label>
                        <Input
                          id="clientPhone"
                          value={proposalData.clientPhone}
                          onChange={(e) =>
                            setProposalData((prev) => ({
                              ...prev,
                              clientPhone: e.target.value,
                            }))
                          }
                          placeholder="(00) 00000-0000"
                          data-testid="input-client-phone"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientCnpj">CNPJ</Label>
                      <Input
                        id="clientCnpj"
                        value={proposalData.clientCnpj}
                        onChange={(e) =>
                          setProposalData((prev) => ({
                            ...prev,
                            clientCnpj: e.target.value,
                          }))
                        }
                        placeholder="00.000.000/0000-00"
                        data-testid="input-client-cnpj"
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="validityDays">Validade (dias)</Label>
                        <Input
                          id="validityDays"
                          type="number"
                          min="1"
                          value={proposalData.validityDays}
                          onChange={(e) =>
                            setProposalData((prev) => ({
                              ...prev,
                              validityDays: parseInt(e.target.value) || 15,
                            }))
                          }
                          data-testid="input-validity-days"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contractType">Tipo de Contrato</Label>
                        <Select
                          value={proposalData.contractType}
                          onValueChange={(value) =>
                            setProposalData((prev) => ({
                              ...prev,
                              contractType: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="contractType"
                            data-testid="select-contract-type"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spot">Spot (Avulso)</SelectItem>
                            <SelectItem value="6_months">
                              Contrato 6 meses
                            </SelectItem>
                            <SelectItem value="1_year">Contrato 1 ano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observacoes</Label>
                      <Textarea
                        id="notes"
                        value={proposalData.notes}
                        onChange={(e) =>
                          setProposalData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Observacoes adicionais..."
                        rows={3}
                        data-testid="input-notes"
                      />
                    </div>

                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Total da Proposta
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(totalProposalValue)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {routes.length} rota(s) incluida(s)
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowProposalDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() =>
                        saveMutation.mutate({ routes, proposal: proposalData })
                      }
                      disabled={saveMutation.isPending || !proposalData.clientName}
                      data-testid="button-save-proposal"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveMutation.isPending ? "Salvando..." : "Salvar Proposta"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informacoes Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Tabela ANTT:</strong> Os valores minimos de frete sao
              calculados conforme Resolucao ANTT 6.034/2024, usando os
              coeficientes CCD (R$/km) e CC (custo de carga).
            </p>
            <p>
              <strong>Lei do PR:</strong> Conforme Decreto 7.871/2017, o pedagio
              nao incide na base de calculo do ICMS para transportes com origem
              no Parana.
            </p>
            <p>
              <strong>ICMS Interestadual:</strong> Aliquota de 7% para destinos
              no Sul/Sudeste a partir de origem Norte/Nordeste/Centro-Oeste, e
              12% nos demais casos.
            </p>
            <p>
              <strong>ISS:</strong> Incide em transportes municipais (dentro da
              mesma cidade) com aliquota de 5%.
            </p>
            <p>
              <strong>GRIS/ADV:</strong> Calculados sobre o valor da NF
              (mercadoria) para fins de seguro de carga.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
