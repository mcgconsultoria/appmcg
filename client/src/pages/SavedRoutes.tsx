import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, MoreVertical, Pencil, Trash2, Route, MapPin, Truck, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { SavedRoute } from "@shared/schema";
import { brazilStates } from "@/lib/brazilStates";

const routeFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  originCity: z.string().min(1, "Cidade de origem é obrigatória"),
  originState: z.string().min(1, "Estado de origem é obrigatório"),
  destinationCity: z.string().min(1, "Cidade de destino é obrigatória"),
  destinationState: z.string().min(1, "Estado de destino é obrigatório"),
  distanceKm: z.string().min(1, "Distância é obrigatória"),
  tollPerAxle: z.string().optional(),
  routeDate: z.string().optional(),
  notes: z.string().optional(),
});

type RouteFormData = z.infer<typeof routeFormSchema>;

interface IBGECity {
  id: number;
  nome: string;
}

export default function SavedRoutes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<SavedRoute | null>(null);
  const [deleteRoute, setDeleteRoute] = useState<SavedRoute | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [originCities, setOriginCities] = useState<IBGECity[]>([]);
  const [destinationCities, setDestinationCities] = useState<IBGECity[]>([]);
  const [loadingOriginCities, setLoadingOriginCities] = useState(false);
  const [loadingDestinationCities, setLoadingDestinationCities] = useState(false);
  const { toast } = useToast();

  const fetchCities = async (uf: string): Promise<IBGECity[]> => {
    if (!uf) return [];
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  };

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      name: "",
      originCity: "",
      originState: "",
      destinationCity: "",
      destinationState: "",
      distanceKm: "",
      tollPerAxle: "0",
      routeDate: "",
      notes: "",
    },
  });

  const { data: routes = [], isLoading } = useQuery<SavedRoute[]>({
    queryKey: ["/api/saved-routes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: RouteFormData) => {
      return apiRequest("POST", "/api/saved-routes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-routes"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Rota criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar rota", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RouteFormData }) => {
      return apiRequest("PATCH", `/api/saved-routes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-routes"] });
      setIsDialogOpen(false);
      setEditingRoute(null);
      form.reset();
      toast({ title: "Rota atualizada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar rota", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/saved-routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-routes"] });
      setDeleteRoute(null);
      toast({ title: "Rota excluída com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir rota", variant: "destructive" });
    },
  });

  const handleOpenDialog = async (route?: SavedRoute) => {
    if (route) {
      setEditingRoute(route);
      form.reset({
        name: route.name,
        originCity: route.originCity,
        originState: route.originState,
        destinationCity: route.destinationCity,
        destinationState: route.destinationState,
        distanceKm: route.distanceKm,
        tollPerAxle: route.tollPerAxle || "0",
        routeDate: route.routeDate ? new Date(route.routeDate).toISOString().split("T")[0] : "",
        notes: route.notes || "",
      });
      // Load cities for editing
      if (route.originState) {
        setLoadingOriginCities(true);
        const cities = await fetchCities(route.originState);
        setOriginCities(cities);
        setLoadingOriginCities(false);
      }
      if (route.destinationState) {
        setLoadingDestinationCities(true);
        const cities = await fetchCities(route.destinationState);
        setDestinationCities(cities);
        setLoadingDestinationCities(false);
      }
    } else {
      setEditingRoute(null);
      setOriginCities([]);
      setDestinationCities([]);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const handleOriginStateChange = async (uf: string) => {
    form.setValue("originState", uf);
    form.setValue("originCity", "");
    setLoadingOriginCities(true);
    const cities = await fetchCities(uf);
    setOriginCities(cities);
    setLoadingOriginCities(false);
  };

  const handleDestinationStateChange = async (uf: string) => {
    form.setValue("destinationState", uf);
    form.setValue("destinationCity", "");
    setLoadingDestinationCities(true);
    const cities = await fetchCities(uf);
    setDestinationCities(cities);
    setLoadingDestinationCities(false);
  };

  const onSubmit = (data: RouteFormData) => {
    if (editingRoute) {
      updateMutation.mutate({ id: editingRoute.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const search = searchTerm.toLowerCase();
    return (
      route.name.toLowerCase().includes(search) ||
      route.originCity.toLowerCase().includes(search) ||
      route.destinationCity.toLowerCase().includes(search)
    );
  });

  const formatCurrency = (value: string | null | undefined) => {
    if (!value || value === "0") return "-";
    return `R$ ${parseFloat(value).toFixed(2).replace(".", ",")}`;
  };

  return (
    <AppLayout title="Rotas Salvas" subtitle="Gerencie rotas para reutilizar em cotações de frete">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Rotas</p>
                  <p className="text-2xl font-bold">{routes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-500/10">
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rotas Ativas</p>
                  <p className="text-2xl font-bold">{routes.filter(r => r.isActive).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Economia Estimada</p>
                  <p className="text-sm font-medium text-muted-foreground">Evite cobranças da API</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-lg">Rotas Cadastradas</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rotas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                  data-testid="input-search-routes"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} data-testid="button-new-route">
                <Plus className="h-4 w-4 mr-2" />
                Nova Rota
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredRoutes.length === 0 ? (
              <div className="text-center py-12">
                <Route className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhuma rota encontrada" : "Nenhuma rota cadastrada"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {!searchTerm && "Cadastre rotas para reutilizar os dados de KM e pedágio em novas cotações"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead className="text-right">KM</TableHead>
                      <TableHead className="text-right">Pedágio/Eixo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.map((route) => (
                      <TableRow key={route.id} data-testid={`row-route-${route.id}`}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.originCity}/{route.originState}</TableCell>
                        <TableCell>{route.destinationCity}/{route.destinationState}</TableCell>
                        <TableCell className="text-right">{parseFloat(route.distanceKm).toLocaleString("pt-BR")} km</TableCell>
                        <TableCell className="text-right">{formatCurrency(route.tollPerAxle)}</TableCell>
                        <TableCell>
                          <Badge variant={route.isActive ? "default" : "secondary"}>
                            {route.isActive ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${route.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(route)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setDeleteRoute(route)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoute ? "Editar Rota" : "Nova Rota"}</DialogTitle>
            <DialogDescription>
              Cadastre uma rota com os dados de distância e pedágio para reutilizar em cotações
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Rota</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Curitiba - São Paulo" {...field} data-testid="input-route-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Origem</h4>
                  <FormField
                    control={form.control}
                    name="originState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={handleOriginStateChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-origin-state">
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brazilStates.map((state) => (
                              <SelectItem key={state.uf} value={state.uf}>
                                {state.uf} - {state.name}
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
                    name="originCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!form.watch("originState") || loadingOriginCities}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-origin-city">
                              <SelectValue placeholder={loadingOriginCities ? "Carregando..." : "Selecione a cidade"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {originCities.map((city) => (
                              <SelectItem key={city.id} value={city.nome}>
                                {city.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Destino</h4>
                  <FormField
                    control={form.control}
                    name="destinationState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={handleDestinationStateChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-destination-state">
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brazilStates.map((state) => (
                              <SelectItem key={state.uf} value={state.uf}>
                                {state.uf} - {state.name}
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
                    name="destinationCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!form.watch("destinationState") || loadingDestinationCities}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-destination-city">
                              <SelectValue placeholder={loadingDestinationCities ? "Carregando..." : "Selecione a cidade"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {destinationCities.map((city) => (
                              <SelectItem key={city.id} value={city.nome}>
                                {city.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distanceKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distância (KM)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-distance" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tollPerAxle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pedágio Por Eixo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="routeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Rota</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-route-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre a rota..." 
                        className="resize-none"
                        {...field} 
                        data-testid="input-notes"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-route"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRoute} onOpenChange={() => setDeleteRoute(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Rota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a rota "{deleteRoute?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoute && deleteMutation.mutate(deleteRoute.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
