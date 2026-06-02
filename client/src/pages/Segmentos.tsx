import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSegmentoMercadoSchema, type SegmentoMercado, type InsertSegmentoMercado } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Tag, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { z } from "zod";

const formSchema = insertSegmentoMercadoSchema.extend({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export default function Segmentos() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SegmentoMercado | null>(null);

  const { data: segmentos = [], isLoading } = useQuery<SegmentoMercado[]>({
    queryKey: ["/api/segmentos"],
  });

  const form = useForm<InsertSegmentoMercado>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", descricao: "", ativo: true },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSegmentoMercado) => apiRequest("POST", "/api/segmentos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/segmentos"] });
      toast({ title: "Segmento criado com sucesso!" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao salvar segmento", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertSegmentoMercado> }) =>
      apiRequest("PATCH", `/api/segmentos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/segmentos"] });
      toast({ title: "Segmento atualizado!" });
      setOpen(false);
      setEditing(null);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao atualizar segmento", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/segmentos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/segmentos"] });
      toast({ title: "Segmento removido!" });
    },
    onError: () => toast({ title: "Erro ao remover segmento", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    form.reset({ nome: "", descricao: "", ativo: true });
    setOpen(true);
  }

  function openEdit(s: SegmentoMercado) {
    setEditing(s);
    form.reset({ nome: s.nome, descricao: s.descricao ?? "", ativo: s.ativo ?? true, companyId: s.companyId });
    setOpen(true);
  }

  function onSubmit(data: InsertSegmentoMercado) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const ativos = segmentos.filter((s) => s.ativo);
  const inativos = segmentos.filter((s) => !s.ativo);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Segmentos de Mercado</h1>
          <p className="text-muted-foreground text-sm">Gerencie os segmentos de atuação da sua empresa</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} data-testid="button-novo-segmento">
              <Plus className="w-4 h-4 mr-2" />
              Novo Segmento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Segmento" : "Novo Segmento"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="nome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Segmento *</FormLabel>
                    <FormControl><Input placeholder="Ex: Logística Frigorificada" {...field} data-testid="input-nome-segmento" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="descricao" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl><Textarea placeholder="Descreva este segmento..." {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="ativo" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="cursor-pointer">Segmento Ativo</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? true} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-salvar-segmento">
                    {editing ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Tag className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{segmentos.length}</p>
              <p className="text-xs text-muted-foreground">Total de segmentos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{ativos.length}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{inativos.length}</p>
              <p className="text-xs text-muted-foreground">Inativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-16 p-4" /></Card>
          ))}
        </div>
      ) : segmentos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Nenhum segmento cadastrado</h3>
            <p className="text-muted-foreground text-sm">Cadastre os segmentos de mercado que sua empresa atende.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {segmentos.map((s) => (
            <Card key={s.id} className="hover:shadow-sm transition-shadow" data-testid={`card-segmento-${s.id}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{s.nome}</p>
                    {s.descricao && <p className="text-sm text-muted-foreground">{s.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={s.ativo ? "default" : "secondary"}>
                    {s.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(s.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
