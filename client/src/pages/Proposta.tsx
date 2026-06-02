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
import { insertPropostaSchema, type Proposta, type InsertProposta } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, FileText, Building2, Clock, Pencil, Trash2, CheckCircle, XCircle, Send } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_OPTS = ["rascunho", "enviada", "em_analise", "aprovada", "recusada", "cancelada"];

const statusConfig: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  enviada: { label: "Enviada", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  em_analise: { label: "Em Análise", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  aprovada: { label: "Aprovada", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  recusada: { label: "Recusada", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500" },
};

const formSchema = insertPropostaSchema.extend({
  numero: z.number().min(1, "Número é obrigatório"),
  nomeCliente: z.string().min(1, "Nome do cliente é obrigatório"),
});

export default function PropostaPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Proposta | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const { data: propostas = [], isLoading } = useQuery<Proposta[]>({
    queryKey: ["/api/propostas"],
  });

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numero: "", nomeCliente: "", validade: 30, status: "rascunho",
      perfilLogistico: "", observacoes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/propostas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/propostas"] });
      toast({ title: "Proposta criada com sucesso!" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao salvar proposta", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PATCH", `/api/propostas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/propostas"] });
      toast({ title: "Proposta atualizada!" });
      setOpen(false);
      setEditing(null);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao atualizar proposta", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/propostas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/propostas"] });
      toast({ title: "Proposta removida!" });
    },
    onError: () => toast({ title: "Erro ao remover proposta", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    const nextNum = propostas.length > 0 ? Math.max(...propostas.map((p) => p.numero)) + 1 : 1;
    form.reset({ numero: nextNum, nomeCliente: "", validade: 30, status: "rascunho", perfilLogistico: "", observacoes: "" });
    setOpen(true);
  }

  function openEdit(p: Proposta) {
    setEditing(p);
    form.reset({
      numero: p.numero,
      nomeCliente: p.nomeCliente ?? "",
      validade: p.validade ?? 30,
      status: p.status ?? "rascunho",
      perfilLogistico: p.perfilLogistico ?? "",
      observacoes: p.observacoes ?? "",
      companyId: p.companyId,
    });
    setOpen(true);
  }

  function onSubmit(data: any) {
    const payload = { ...data, numero: Number(data.numero), validade: Number(data.validade) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filtered = filtroStatus === "todos" ? propostas : propostas.filter((p) => p.status === filtroStatus);
  const aprovadas = propostas.filter((p) => p.status === "aprovada").length;
  const enviadas = propostas.filter((p) => p.status === "enviada" || p.status === "em_analise").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Propostas Comerciais</h1>
          <p className="text-muted-foreground text-sm">Gerencie suas propostas e cotações de serviços logísticos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} data-testid="button-nova-proposta">
              <Plus className="w-4 h-4 mr-2" />
              Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Proposta" : "Nova Proposta Comercial"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="numero" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número *</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} data-testid="input-numero-proposta" /></FormControl>
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
                          {STATUS_OPTS.map((s) => (
                            <SelectItem key={s} value={s}>{statusConfig[s]?.label ?? s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="nomeCliente" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl><Input placeholder="Nome da empresa ou cliente" {...field} data-testid="input-cliente-proposta" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="validade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade (dias)</FormLabel>
                    <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="perfilLogistico" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil Logístico</FormLabel>
                    <FormControl><Textarea placeholder="Descreva o perfil e necessidade do cliente..." rows={3} {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="observacoes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl><Textarea placeholder="Notas internas sobre esta proposta..." rows={2} {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-salvar-proposta">
                    {editing ? "Atualizar" : "Criar Proposta"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{propostas.length}</p>
              <p className="text-xs text-muted-foreground">Total de propostas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Send className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{enviadas}</p>
              <p className="text-xs text-muted-foreground">Em aberto</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{aprovadas}</p>
              <p className="text-xs text-muted-foreground">Aprovadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filtroStatus === "todos" ? "default" : "outline"} onClick={() => setFiltroStatus("todos")}>
          Todas ({propostas.length})
        </Button>
        {STATUS_OPTS.map((s) => {
          const count = propostas.filter((p) => p.status === s).length;
          return (
            <Button key={s} size="sm" variant={filtroStatus === s ? "default" : "outline"} onClick={() => setFiltroStatus(s)}>
              {statusConfig[s]?.label} ({count})
            </Button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Card key={i} className="animate-pulse"><CardContent className="h-24 p-4" /></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Nenhuma proposta encontrada</h3>
            <p className="text-muted-foreground text-sm">Crie propostas comerciais para seus clientes de logística.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const sc = statusConfig[p.status ?? "rascunho"];
            return (
              <Card key={p.id} className="hover:shadow-sm transition-shadow" data-testid={`card-proposta-${p.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-primary">#{String(p.numero).padStart(4, "0")}</span>
                        <span className="font-semibold truncate">{p.nomeCliente ?? "—"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {p.dataEmissao && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Emitida em {format(new Date(p.dataEmissao), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                        {p.validade && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Validade: {p.validade} dias
                          </span>
                        )}
                      </div>
                      {p.perfilLogistico && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{p.perfilLogistico}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
