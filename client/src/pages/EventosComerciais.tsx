import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventoComercialSchema, type EventoComercial, type InsertEventoComercial } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, CalendarDays, MapPin, Clock, Pencil, Trash2, Users } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORIAS = [
  "Ligação",
  "Reunião Online",
  "Reunião Presencial",
  "Visita Comercial",
  "Feira",
  "Evento",
  "Convenção",
  "Lançamento",
  "BID",
  "Licitação",
  "Workshop",
  "Webinar",
  "Outro",
];
const STATUS_OPTS = ["agendado", "realizado", "cancelado", "adiado"];

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  realizado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  adiado: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const formSchema = insertEventoComercialSchema.extend({
  titulo: z.string().min(1, "Título é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
});

export default function EventosComerciais() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventoComercial | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const { data: eventos = [], isLoading } = useQuery<EventoComercial[]>({
    queryKey: ["/api/eventos-comerciais"],
  });

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "", categoria: "", dataInicio: "", dataFim: "",
      local: "", descricao: "", status: "agendado", observacoes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/eventos-comerciais", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos-comerciais"] });
      toast({ title: "Evento criado com sucesso!" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao salvar evento", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PATCH", `/api/eventos-comerciais/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos-comerciais"] });
      toast({ title: "Evento atualizado!" });
      setOpen(false);
      setEditing(null);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao atualizar evento", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/eventos-comerciais/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos-comerciais"] });
      toast({ title: "Evento removido!" });
    },
    onError: () => toast({ title: "Erro ao remover evento", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    form.reset({ titulo: "", categoria: "", dataInicio: "", dataFim: "", local: "", descricao: "", status: "agendado", observacoes: "" });
    setOpen(true);
  }

  function openEdit(e: EventoComercial) {
    setEditing(e);
    form.reset({
      titulo: e.titulo,
      categoria: e.categoria,
      dataInicio: e.dataInicio ? new Date(e.dataInicio).toISOString().slice(0, 16) : "",
      dataFim: e.dataFim ? new Date(e.dataFim).toISOString().slice(0, 16) : "",
      local: e.local ?? "",
      descricao: e.descricao ?? "",
      status: e.status ?? "agendado",
      observacoes: e.observacoes ?? "",
      companyId: e.companyId,
    });
    setOpen(true);
  }

  function onSubmit(data: any) {
    const payload = {
      ...data,
      dataInicio: data.dataInicio ? new Date(data.dataInicio).toISOString() : undefined,
      dataFim: data.dataFim ? new Date(data.dataFim).toISOString() : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filtered = filtroStatus === "todos" ? eventos : eventos.filter((e) => e.status === filtroStatus);

  const counts = STATUS_OPTS.reduce((acc, s) => {
    acc[s] = eventos.filter((e) => e.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Eventos Comerciais</h1>
          <p className="text-muted-foreground text-sm">Feiras, visitas, reuniões e eventos do setor</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} data-testid="button-novo-evento">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Evento" : "Novo Evento Comercial"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="titulo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl><Input placeholder="Nome do evento" {...field} data-testid="input-titulo-evento" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="categoria" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="dataInicio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Início *</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataFim" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Fim</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="local" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl><Input placeholder="Cidade, estado ou endereço" {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="descricao" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl><Textarea placeholder="Detalhes do evento..." {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-salvar-evento">
                    {editing ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filtroStatus === "todos" ? "default" : "outline"} onClick={() => setFiltroStatus("todos")}>
          Todos ({eventos.length})
        </Button>
        {STATUS_OPTS.map((s) => (
          <Button key={s} size="sm" variant={filtroStatus === s ? "default" : "outline"} onClick={() => setFiltroStatus(s)} className="capitalize">
            {s} ({counts[s] ?? 0})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="h-24 p-4" /></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Nenhum evento encontrado</h3>
            <p className="text-muted-foreground text-sm">Registre feiras, visitas e reuniões importantes.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <Card key={e.id} className="hover:shadow-sm transition-shadow" data-testid={`card-evento-${e.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{e.titulo}</h3>
                      <Badge variant="outline" className="text-xs shrink-0">{e.categoria}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${statusColors[e.status ?? "agendado"]}`}>
                        {e.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {e.dataInicio && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(new Date(e.dataInicio), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </span>
                      )}
                      {e.local && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {e.local}
                        </span>
                      )}
                    </div>
                    {e.descricao && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{e.descricao}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(e)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(e.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
