import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Check, X, Plus, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SubscriptionPlan } from "@shared/schema";

export default function AdminPlanos() {
  const { toast } = useToast();
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<SubscriptionPlan>>({});

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SubscriptionPlan> }) => {
      return apiRequest("PUT", `/api/subscription-plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      setEditingPlan(null);
      setEditedData({});
      toast({
        title: "Plano atualizado",
        description: "As alteracoes foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Nao foi possivel atualizar o plano.",
        variant: "destructive",
      });
    },
  });

  const seedPlansMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/subscription-plans/seed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      toast({
        title: "Planos criados",
        description: "Os planos padrao foram criados com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Nao foi possivel criar os planos.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditedData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      interval: plan.interval,
      baseUsers: plan.baseUsers,
      additionalUserPrice: plan.additionalUserPrice,
      features: plan.features,
      popular: plan.popular,
      active: plan.active,
    });
  };

  const handleSave = (id: number) => {
    updatePlanMutation.mutate({ id, data: editedData });
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setEditedData({});
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(editedData.features || [])];
    newFeatures[index] = value;
    setEditedData({ ...editedData, features: newFeatures });
  };

  const handleAddFeature = () => {
    const newFeatures = [...(editedData.features || []), ""];
    setEditedData({ ...editedData, features: newFeatures });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = (editedData.features || []).filter((_, i) => i !== index);
    setEditedData({ ...editedData, features: newFeatures });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Planos e Valores</h1>
          <p className="text-muted-foreground">Gerencie os planos de assinatura exibidos para os clientes</p>
        </div>
        {(!plans || plans.length === 0) && (
          <Button
            onClick={() => seedPlansMutation.mutate()}
            disabled={seedPlansMutation.isPending}
            data-testid="button-seed-plans"
          >
            {seedPlansMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Criar Planos Padrao
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id} className={plan.popular ? "border-primary" : ""} data-testid={`card-plan-${plan.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {plan.popular && <Badge variant="default">Popular</Badge>}
                </CardTitle>
                {editingPlan !== plan.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                    data-testid={`button-edit-plan-${plan.id}`}
                  >
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSave(plan.id)}
                      disabled={updatePlanMutation.isPending}
                      data-testid={`button-save-plan-${plan.id}`}
                    >
                      {updatePlanMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCancel}
                      data-testid={`button-cancel-plan-${plan.id}`}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription>
                {editingPlan === plan.id ? (
                  <Input
                    value={editedData.description || ""}
                    onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                    placeholder="Descricao do plano"
                    data-testid={`input-description-${plan.id}`}
                  />
                ) : (
                  plan.description
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Preco (R$)</Label>
                {editingPlan === plan.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={(editedData.price || 0) / 100}
                      onChange={(e) => setEditedData({ ...editedData, price: Math.round(parseFloat(e.target.value) * 100) })}
                      className="w-32"
                      data-testid={`input-price-${plan.id}`}
                    />
                    <span className="text-sm text-muted-foreground">/{plan.interval === "always" ? "sempre" : "mes"}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">
                    {plan.price === 0 ? "Gratis" : formatPrice(plan.price)}
                    {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/{plan.interval === "always" ? "sempre" : "mes"}</span>}
                  </p>
                )}
              </div>

              {editingPlan === plan.id && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Preco Usuario Adicional (R$)</Label>
                  <Input
                    type="number"
                    value={(editedData.additionalUserPrice || 0) / 100}
                    onChange={(e) => setEditedData({ ...editedData, additionalUserPrice: Math.round(parseFloat(e.target.value) * 100) })}
                    className="w-32"
                    data-testid={`input-additional-price-${plan.id}`}
                  />
                </div>
              )}

              {editingPlan === plan.id && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editedData.popular || false}
                    onCheckedChange={(checked) => setEditedData({ ...editedData, popular: checked })}
                    data-testid={`switch-popular-${plan.id}`}
                  />
                  <Label className="text-sm">Destacar como Popular</Label>
                </div>
              )}

              <div>
                <Label className="text-sm text-muted-foreground">Recursos incluidos</Label>
                {editingPlan === plan.id ? (
                  <div className="space-y-2 mt-2">
                    {(editedData.features || []).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="Recurso"
                          data-testid={`input-feature-${plan.id}-${index}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveFeature(index)}
                          data-testid={`button-remove-feature-${plan.id}-${index}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddFeature}
                      data-testid={`button-add-feature-${plan.id}`}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar Recurso
                    </Button>
                  </div>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans && plans.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum plano cadastrado</p>
            <Button
              onClick={() => seedPlansMutation.mutate()}
              disabled={seedPlansMutation.isPending}
              data-testid="button-seed-plans-empty"
            >
              {seedPlansMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Criar Planos Padrao
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
