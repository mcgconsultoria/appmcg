import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Plus, Pencil, Trash2, Clock, CheckCircle2, RefreshCw,
  FilePlus2, Calendar, Truck, Warehouse, Search, X, ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ContratoLogistico, Proposta } from "@shared/schema";

const STATUS_OPTS = ["ativo", "encerrado", "em_renovacao", "suspenso", "cancelado"];

const statusConfig: Record<string, { label: string; color: string }> = {
  ativo: { label: "Ativo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  encerrado: { label: "Encerrado", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
  em_renovacao: { label: "Em Renovação", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  suspenso: { label: "Suspenso", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "dd/MM/yyyy", { locale: ptBR });
}

function fmtCurrency(v: string | null | undefined) {
  if (!v) return "—";
  const n = Number(v);
  if (isNaN(n)) return v;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function propostaLabel(p: Proposta) {
  return `#${String(p.numero).padStart(4, "0")} — ${p.nomeCliente ?? "Cliente"}`;
}

const emptyForm = {
  nomeCliente: "", objeto: "", dataAssinatura: "", vigenciaInicio: "",
  vigenciaFim: "", renovacaoAutomatica: false, status: "ativo",
  modeloContrato: "", totalFrete: "", totalArmazenagem: "", observacoes: "",
  propostaFreteIds: [] as number[],
  propostaArmazenagemIds: [] as number[],
};

export default function Contratos() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContratoLogistico | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [form, setForm] = useState({ ...emptyForm });

  // Picker states
  const [showFretePicker, setShowFretePicker] = useState(false);
  const [showArmazenagemPicker, setShowArmazenagemPicker] = useState(false);
  const [searchFrete, setSearchFrete] = useState("");
  const [searchArmazenagem, setSearchArmazenagem] = useState("");

  const { data: contratos = [], isLoading } = useQuery<ContratoLogistico[]>({
    queryKey: ["/api/contratos-logisticos"],
  });

  const { data: propostas = [] } = useQuery<Proposta[]>({
    queryKey: ["/api/propostas"],
  });

  // Propostas de frete = têm totalFrete preenchido ou freteCalculoId
  const propostasComFrete = propostas.filter((p) => p.totalFrete || p.freteCalculoId);
  // Propostas de armazenagem = têm totalArmazenagem ou armazenagemCalculoId
  const propostasComArmazenagem = propostas.filter((p) => p.totalArmazenagem || p.armazenagemCalculoId);

  const filteredFrete = propostasComFrete.filter((p) =>
    !searchFrete || propostaLabel(p).toLowerCase().includes(searchFrete.toLowerCase())
  );
  const filteredArmazenagem = propostasComArmazenagem.filter((p) =>
    !searchArmazenagem || propostaLabel(p).toLowerCase().includes(searchArmazenagem.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/contratos-logisticos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contratos-logisticos"] });
      toast({ title: "Contrato criado com sucesso!" });
      setOpen(false);
      setForm({ ...emptyForm });
    },
    onError: () => toast({ title: "Erro ao criar contrato", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PATCH", `/api/contratos-logisticos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contratos-logisticos"] });
      toast({ title: "Contrato atualizado!" });
      setOpen(false);
      setEditing(null);
    },
    onError: () => toast({ title: "Erro ao atualizar contrato", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/contratos-logisticos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contratos-logisticos"] });
      toast({ title: "Contrato removido!" });
    },
    onError: () => toast({ title: "Erro ao remover contrato", variant: "destructive" }),
  });

  function openNew() {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(c: ContratoLogistico) {
    setEditing(c);
    setForm({
      nomeCliente: c.nomeCliente ?? "",
      objeto: c.objeto ?? "",
      dataAssinatura: c.dataAssinatura ? new Date(c.dataAssinatura).toISOString().slice(0, 10) : "",
      vigenciaInicio: c.vigenciaInicio ? new Date(c.vigenciaInicio).toISOString().slice(0, 10) : "",
      vigenciaFim: c.vigenciaFim ? new Date(c.vigenciaFim).toISOString().slice(0, 10) : "",
      renovacaoAutomatica: c.renovacaoAutomatica ?? false,
      status: c.status ?? "ativo",
      modeloContrato: c.modeloContrato ?? "",
      totalFrete: c.totalFrete ?? "",
      totalArmazenagem: c.totalArmazenagem ?? "",
      observacoes: c.observacoes ?? "",
      propostaFreteIds: (c.propostaFreteIds as number[] | null) ?? [],
      propostaArmazenagemIds: (c.propostaArmazenagemIds as number[] | null) ?? [],
    });
    setOpen(true);
  }

  function addFreteProposta(p: Proposta) {
    if (form.propostaFreteIds.includes(p.id)) return;
    const newIds = [...form.propostaFreteIds, p.id];
    // Auto-sum totalFrete from all linked propostas
    const total = newIds.reduce((sum, id) => {
      const prop = propostas.find((x) => x.id === id);
      return sum + (prop?.totalFrete ? Number(prop.totalFrete) : 0);
    }, 0);
    setForm(f => ({
      ...f,
      propostaFreteIds: newIds,
      totalFrete: total > 0 ? String(total) : f.totalFrete,
    }));
    setShowFretePicker(false);
    setSearchFrete("");
  }

  function removeFreteProposta(id: number) {
    const newIds = form.propostaFreteIds.filter((x) => x !== id);
    const total = newIds.reduce((sum, pid) => {
      const prop = propostas.find((x) => x.id === pid);
      return sum + (prop?.totalFrete ? Number(prop.totalFrete) : 0);
    }, 0);
    setForm(f => ({
      ...f,
      propostaFreteIds: newIds,
      totalFrete: total > 0 ? String(total) : f.totalFrete,
    }));
  }

  function addArmazenagemProposta(p: Proposta) {
    if (form.propostaArmazenagemIds.includes(p.id)) return;
    const newIds = [...form.propostaArmazenagemIds, p.id];
    const total = newIds.reduce((sum, id) => {
      const prop = propostas.find((x) => x.id === id);
      return sum + (prop?.totalArmazenagem ? Number(prop.totalArmazenagem) : 0);
    }, 0);
    setForm(f => ({
      ...f,
      propostaArmazenagemIds: newIds,
      totalArmazenagem: total > 0 ? String(total) : f.totalArmazenagem,
    }));
    setShowArmazenagemPicker(false);
    setSearchArmazenagem("");
  }

  function removeArmazenagemProposta(id: number) {
    const newIds = form.propostaArmazenagemIds.filter((x) => x !== id);
    const total = newIds.reduce((sum, pid) => {
      const prop = propostas.find((x) => x.id === pid);
      return sum + (prop?.totalArmazenagem ? Number(prop.totalArmazenagem) : 0);
    }, 0);
    setForm(f => ({
      ...f,
      propostaArmazenagemIds: newIds,
      totalArmazenagem: total > 0 ? String(total) : f.totalArmazenagem,
    }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      dataAssinatura: form.dataAssinatura ? new Date(form.dataAssinatura).toISOString() : undefined,
      vigenciaInicio: form.vigenciaInicio ? new Date(form.vigenciaInicio).toISOString() : undefined,
      vigenciaFim: form.vigenciaFim ? new Date(form.vigenciaFim).toISOString() : undefined,
      totalFrete: form.totalFrete || undefined,
      totalArmazenagem: form.totalArmazenagem || undefined,
      propostaFreteIds: form.propostaFreteIds.length > 0 ? form.propostaFreteIds : undefined,
      propostaArmazenagemIds: form.propostaArmazenagemIds.length > 0 ? form.propostaArmazenagemIds : undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filtered = filtroStatus === "todos" ? contratos : contratos.filter((c) => c.status === filtroStatus);
  const ativos = contratos.filter((c) => c.status === "ativo").length;
  const renovacao = contratos.filter((c) => c.renovacaoAutomatica).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contratos Logísticos</h1>
            <p className="text-muted-foreground text-sm">Contratos entre sua empresa e clientes de logística</p>
          </div>
          <Button onClick={openNew} data-testid="button-novo-contrato">
            <Plus className="w-4 h-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div><p className="text-2xl font-bold">{contratos.length}</p><p className="text-xs text-muted-foreground">Total de contratos</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div><p className="text-2xl font-bold">{ativos}</p><p className="text-xs text-muted-foreground">Contratos ativos</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500" />
              <div><p className="text-2xl font-bold">{renovacao}</p><p className="text-xs text-muted-foreground">Renovação automática</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={filtroStatus === "todos" ? "default" : "outline"} onClick={() => setFiltroStatus("todos")}>
            Todos ({contratos.length})
          </Button>
          {STATUS_OPTS.map((s) => {
            const count = contratos.filter((c) => c.status === s).length;
            return (
              <Button key={s} size="sm" variant={filtroStatus === s ? "default" : "outline"} onClick={() => setFiltroStatus(s)}>
                {statusConfig[s]?.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Card key={i} className="animate-pulse"><CardContent className="h-28 p-4" /></Card>)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-1">Nenhum contrato encontrado</h3>
              <p className="text-muted-foreground text-sm">Crie contratos logísticos para seus clientes.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const sc = statusConfig[c.status ?? "ativo"];
              const nFrete = (c.propostaFreteIds as number[] | null)?.length ?? 0;
              const nArm = (c.propostaArmazenagemIds as number[] | null)?.length ?? 0;
              return (
                <Card key={c.id} className="hover:shadow-sm transition-shadow" data-testid={`card-contrato-${c.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-primary">#{String(c.numero).padStart(4, "0")}</span>
                          <span className="font-semibold truncate">{c.nomeCliente ?? "—"}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${sc.color}`}>
                            {sc.label}
                          </span>
                          {c.renovacaoAutomatica && (
                            <Badge variant="outline" className="text-xs shrink-0">
                              <RefreshCw className="w-3 h-3 mr-1" />Renovação Auto
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {c.dataAssinatura && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Assinado em {fmtDate(c.dataAssinatura)}
                            </span>
                          )}
                          {c.vigenciaInicio && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Vigência: {fmtDate(c.vigenciaInicio)} até {fmtDate(c.vigenciaFim)}
                            </span>
                          )}
                          {nFrete > 0 && (
                            <span className="flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-blue-500" />
                              {nFrete} proposta{nFrete > 1 ? "s" : ""} frete
                            </span>
                          )}
                          {nArm > 0 && (
                            <span className="flex items-center gap-1">
                              <Warehouse className="w-3.5 h-3.5 text-orange-500" />
                              {nArm} proposta{nArm > 1 ? "s" : ""} armazenagem
                            </span>
                          )}
                          {(c.totalFrete || c.totalArmazenagem) && (
                            <span className="font-medium text-foreground">
                              Total: {c.totalFrete ? fmtCurrency(c.totalFrete) : "—"} frete / {c.totalArmazenagem ? fmtCurrency(c.totalArmazenagem) : "—"} arm.
                            </span>
                          )}
                        </div>
                        {c.objeto && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.objeto}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)} data-testid={`btn-edit-contrato-${c.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(c.id)} data-testid={`btn-delete-contrato-${c.id}`}>
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

        {/* Dialog: Novo/Editar Contrato */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                  onClick={() => setOpen(false)} data-testid="button-voltar-contrato">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle>{editing ? "Editar Contrato" : "Novo Contrato Logístico"}</DialogTitle>
              </div>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cliente *</label>
                <Input placeholder="Razão social do cliente" value={form.nomeCliente}
                  onChange={(e) => setForm(f => ({ ...f, nomeCliente: e.target.value }))}
                  required data-testid="input-nome-cliente-contrato" />
              </div>

              <div>
                <label className="text-sm font-medium">Objeto do Contrato</label>
                <Textarea placeholder="Descreva os serviços contratados..." rows={3}
                  value={form.objeto} onChange={(e) => setForm(f => ({ ...f, objeto: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTS.map((s) => <SelectItem key={s} value={s}>{statusConfig[s]?.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Assinatura</label>
                  <Input type="date" value={form.dataAssinatura}
                    onChange={(e) => setForm(f => ({ ...f, dataAssinatura: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vigência Início</label>
                  <Input type="date" value={form.vigenciaInicio}
                    onChange={(e) => setForm(f => ({ ...f, vigenciaInicio: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Vigência Fim</label>
                  <Input type="date" value={form.vigenciaFim}
                    onChange={(e) => setForm(f => ({ ...f, vigenciaFim: e.target.value }))} />
                </div>
              </div>

              {/* Propostas de Frete */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Truck className="w-4 h-4 text-blue-500" />
                  Propostas de Frete vinculadas
                </label>
                {form.propostaFreteIds.length > 0 && (
                  <div className="space-y-1">
                    {form.propostaFreteIds.map((id) => {
                      const p = propostas.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="flex items-center gap-2 p-2 border rounded-md bg-blue-50/50 dark:bg-blue-950/20">
                          <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-sm flex-1">
                            {propostaLabel(p)}
                            {p.totalFrete && ` — ${fmtCurrency(p.totalFrete)}`}
                          </span>
                          <Button type="button" size="icon" variant="ghost" className="h-6 w-6 shrink-0"
                            onClick={() => removeFreteProposta(id)} data-testid={`btn-remove-frete-prop-${id}`}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button type="button" variant="outline" size="sm"
                  onClick={() => { setSearchFrete(""); setShowFretePicker(true); }}
                  data-testid="button-buscar-proposta-frete">
                  <Plus className="w-4 h-4 mr-1" />
                  Buscar Proposta de Frete
                </Button>
              </div>

              {/* Propostas de Armazenagem */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Warehouse className="w-4 h-4 text-orange-500" />
                  Propostas de Armazenagem vinculadas
                </label>
                {form.propostaArmazenagemIds.length > 0 && (
                  <div className="space-y-1">
                    {form.propostaArmazenagemIds.map((id) => {
                      const p = propostas.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="flex items-center gap-2 p-2 border rounded-md bg-orange-50/50 dark:bg-orange-950/20">
                          <Warehouse className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="text-sm flex-1">
                            {propostaLabel(p)}
                            {p.totalArmazenagem && ` — ${fmtCurrency(p.totalArmazenagem)}`}
                          </span>
                          <Button type="button" size="icon" variant="ghost" className="h-6 w-6 shrink-0"
                            onClick={() => removeArmazenagemProposta(id)} data-testid={`btn-remove-arm-prop-${id}`}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Button type="button" variant="outline" size="sm"
                  onClick={() => { setSearchArmazenagem(""); setShowArmazenagemPicker(true); }}
                  data-testid="button-buscar-proposta-armazenagem">
                  <Plus className="w-4 h-4 mr-1" />
                  Buscar Proposta de Armazenagem
                </Button>
              </div>

              {/* Totais calculados */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Total Frete (R$)</label>
                  <Input type="number" step="0.01" placeholder="0,00" value={form.totalFrete}
                    onChange={(e) => setForm(f => ({ ...f, totalFrete: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Armazenagem (R$)</label>
                  <Input type="number" step="0.01" placeholder="0,00" value={form.totalArmazenagem}
                    onChange={(e) => setForm(f => ({ ...f, totalArmazenagem: e.target.value }))} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="renovacao" checked={form.renovacaoAutomatica}
                  onChange={(e) => setForm(f => ({ ...f, renovacaoAutomatica: e.target.checked }))} className="h-4 w-4" />
                <label htmlFor="renovacao" className="text-sm">Renovação automática</label>
              </div>

              <div>
                <label className="text-sm font-medium">Modelo / Cláusulas do Contrato</label>
                <Textarea placeholder="Cole aqui as cláusulas contratuais ou notas sobre o contrato..." rows={4}
                  value={form.modeloContrato} onChange={(e) => setForm(f => ({ ...f, modeloContrato: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea placeholder="Notas internas..." rows={2}
                  value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-salvar-contrato">
                  {editing ? "Atualizar" : "Criar Contrato"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Picker: Proposta de Frete */}
        <Dialog open={showFretePicker} onOpenChange={setShowFretePicker}>
          <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                Buscar Proposta de Frete
              </DialogTitle>
            </DialogHeader>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por número ou cliente..." className="pl-8"
                value={searchFrete} onChange={(e) => setSearchFrete(e.target.value)}
                data-testid="input-search-frete-proposta" />
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {propostasComFrete.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">
                  Nenhuma proposta com valor de frete. Crie uma proposta com Total Frete preenchido.
                </p>
              ) : filteredFrete.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-6">Nenhum resultado para "{searchFrete}"</p>
              ) : (
                filteredFrete.map((p) => {
                  const jaVinculada = form.propostaFreteIds.includes(p.id);
                  return (
                    <Card key={p.id}
                      className={`cursor-pointer transition-colors ${jaVinculada ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"}`}
                      onClick={() => !jaVinculada && addFreteProposta(p)}
                      data-testid={`pick-frete-prop-${p.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{propostaLabel(p)}</p>
                            {p.totalFrete && <p className="text-xs text-muted-foreground">Frete: {fmtCurrency(p.totalFrete)}</p>}
                          </div>
                          {jaVinculada && <Badge variant="secondary" className="text-xs">Já vinculada</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            <div className="pt-2 border-t">
              <Button variant="outline" className="w-full" onClick={() => setShowFretePicker(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Picker: Proposta de Armazenagem */}
        <Dialog open={showArmazenagemPicker} onOpenChange={setShowArmazenagemPicker}>
          <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-orange-500" />
                Buscar Proposta de Armazenagem
              </DialogTitle>
            </DialogHeader>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por número ou cliente..." className="pl-8"
                value={searchArmazenagem} onChange={(e) => setSearchArmazenagem(e.target.value)}
                data-testid="input-search-arm-proposta" />
            </div>
            <div className="overflow-y-auto flex-1 space-y-2">
              {propostasComArmazenagem.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-8">
                  Nenhuma proposta com valor de armazenagem. Crie uma proposta com Total Armazenagem preenchido.
                </p>
              ) : filteredArmazenagem.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-6">Nenhum resultado para "{searchArmazenagem}"</p>
              ) : (
                filteredArmazenagem.map((p) => {
                  const jaVinculada = form.propostaArmazenagemIds.includes(p.id);
                  return (
                    <Card key={p.id}
                      className={`cursor-pointer transition-colors ${jaVinculada ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/50"}`}
                      onClick={() => !jaVinculada && addArmazenagemProposta(p)}
                      data-testid={`pick-arm-prop-${p.id}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">{propostaLabel(p)}</p>
                            {p.totalArmazenagem && <p className="text-xs text-muted-foreground">Armazenagem: {fmtCurrency(p.totalArmazenagem)}</p>}
                          </div>
                          {jaVinculada && <Badge variant="secondary" className="text-xs">Já vinculada</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            <div className="pt-2 border-t">
              <Button variant="outline" className="w-full" onClick={() => setShowArmazenagemPicker(false)}>Fechar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
