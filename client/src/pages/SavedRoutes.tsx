import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  toll2Axles: z.string().optional(),
  toll3Axles: z.string().optional(),
  toll4Axles: z.string().optional(),
  toll5Axles: z.string().optional(),
  toll6Axles: z.string().optional(),
  toll7Axles: z.string().optional(),
  toll9Axles: z.string().optional(),
  notes: z.string().optional(),
});

type RouteFormData = z.infer<typeof routeFormSchema>;

export default function SavedRoutes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<SavedRoute | null>(null);
  const [deleteRoute, setDeleteRoute] = useState<SavedRoute | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      name: "",
      originCity: "",
      originState: "",
      destinationCity: "",
      destinationState: "",
      distanceKm: "",
      toll2Axles: "0",
      toll3Axles: "0",
      toll4Axles: "0",
      toll5Axles: "0",
      toll6Axles: "0",
      toll7Axles: "0",
      toll9Axles: "0",
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

  const handleOpenDialog = (route?: SavedRoute) => {
    if (route) {
      setEditingRoute(route);
      form.reset({
        name: route.name,
        originCity: route.originCity,
        originState: route.originState,
        destinationCity: route.destinationCity,
        destinationState: route.destinationState,
        distanceKm: route.distanceKm,
        toll2Axles: route.toll2Axles || "0",
        toll3Axles: route.toll3Axles || "0",
        toll4Axles: route.toll4Axles || "0",
        toll5Axles: route.toll5Axles || "0",
        toll6Axles: route.toll6Axles || "0",
        toll7Axles: route.toll7Axles || "0",
        toll9Axles: route.toll9Axles || "0",
        notes: route.notes || "",
      });
    } else {
      setEditingRoute(null);
      form.reset();
    }
    setIsDialogOpen(true);
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
                      <TableHead className="text-right">Pedágio 5 Eixos</TableHead>
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
                        <TableCell className="text-right">{formatCurrency(route.toll5Axles)}</TableCell>
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
                    name="originCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade de origem" {...field} data-testid="input-origin-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-origin-state">
                              <SelectValue placeholder="Selecione" />
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
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Destino</h4>
                  <FormField
                    control={form.control}
                    name="destinationCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade de destino" {...field} data-testid="input-destination-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destinationState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-destination-state">
                              <SelectValue placeholder="Selecione" />
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
                </div>
              </div>

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

              <div className="space-y-2">
                <Label className="text-sm font-medium">Pedágio por Eixo (R$)</Label>
                <div className="grid grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="toll2Axles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">2 Eixos</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll-2" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toll3Axles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">3 Eixos</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll-3" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toll4Axles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">4 Eixos</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll-4" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toll5Axles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">5 Eixos</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll-5" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="toll6Axles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">6 Eixos</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll-6" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toll7Axles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">7 Eixos</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll-7" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="toll9Axles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">9 Eixos</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-toll-9" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
