import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBilateralSchema, type Bilateral, type InsertBilateral } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Mail, Phone, Briefcase, Search, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

const formSchema = insertBilateralSchema.extend({
  nome: z.string().min(1, "Nome é obrigatório"),
});

export default function Bilaterais() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bilateral | null>(null);

  const { data: bilaterals = [], isLoading } = useQuery<Bilateral[]>({
    queryKey: ["/api/bilaterais"],
  });

  const form = useForm<InsertBilateral>({
    resolver: zodResolver(formSchema),
    defaultValues: { nome: "", email: "", telefone: "", cargo: "", areaAtuacao: "", observacoes: "" },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertBilateral) => apiRequest("POST", "/api/bilaterais", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bilaterais"] });
      toast({ title: "Contato adicionado com sucesso!" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao salvar contato", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBilateral> }) =>
      apiRequest("PATCH", `/api/bilaterais/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bilaterais"] });
      toast({ title: "Contato atualizado!" });
      setOpen(false);
      setEditing(null);
      form.reset();
    },
    onError: () => toast({ title: "Erro ao atualizar contato", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/bilaterais/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bilaterais"] });
      toast({ title: "Contato removido!" });
    },
    onError: () => toast({ title: "Erro ao remover contato", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    form.reset({ nome: "", email: "", telefone: "", cargo: "", areaAtuacao: "", observacoes: "" });
    setOpen(true);
  }

  function openEdit(b: Bilateral) {
    setEditing(b);
    form.reset({
      nome: b.nome,
      email: b.email ?? "",
      telefone: b.telefone ?? "",
      cargo: b.cargo ?? "",
      areaAtuacao: b.areaAtuacao ?? "",
      observacoes: b.observacoes ?? "",
      companyId: b.companyId,
    });
    setOpen(true);
  }

  function onSubmit(data: InsertBilateral) {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const filtered = bilaterals.filter(
    (b) =>
      b.nome.toLowerCase().includes(search.toLowerCase()) ||
      (b.cargo ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (b.areaAtuacao ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bilaterais</h1>
          <p className="text-muted-foreground text-sm">Diretório de contatos comerciais e parceiros</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} data-testid="button-novo-contato">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Contato" : "Novo Contato Bilateral"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="nome" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl><Input placeholder="Nome completo" {...field} data-testid="input-nome" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="cargo" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl><Input placeholder="Ex: Diretor Comercial" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="areaAtuacao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Atuação</FormLabel>
                      <FormControl><Input placeholder="Ex: Logística" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl><Input placeholder="email@empresa.com" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telefone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl><Input placeholder="(00) 00000-0000" {...field} value={field.value ?? ""} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="observacoes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl><Textarea placeholder="Notas sobre este contato..." {...field} value={field.value ?? ""} /></FormControl>
                  </FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-salvar-contato">
                    {editing ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, cargo ou área..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-testid="input-busca-bilaterais"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="h-40 p-4" /></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">Nenhum contato encontrado</h3>
            <p className="text-muted-foreground text-sm">Adicione contatos bilaterais para construir seu diretório comercial.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <Card key={b.id} className="hover:shadow-md transition-shadow" data-testid={`card-bilateral-${b.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{b.nome}</CardTitle>
                    {b.cargo && <p className="text-sm text-muted-foreground">{b.cargo}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(b)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(b.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {b.areaAtuacao && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                    <Badge variant="secondary" className="text-xs">{b.areaAtuacao}</Badge>
                  </div>
                )}
                {b.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <a href={`mailto:${b.email}`} className="hover:underline truncate">{b.email}</a>
                  </div>
                )}
                {b.telefone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{b.telefone}</span>
                  </div>
                )}
                {b.observacoes && (
                  <p className="text-xs text-muted-foreground pt-1 line-clamp-2">{b.observacoes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
