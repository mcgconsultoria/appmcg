import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Pencil, Trash2, Clock, CheckCircle2, XCircle, AlertCircle, FilePlus2, Calendar, RefreshCw } from "lucide-react";
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
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Contratos() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContratoLogistico | null>(null);
  const [showFromPropostaDialog, setShowFromPropostaDialog] = useState(false);
  const [selectedPropostaId, setSelectedPropostaId] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const [form, setForm] = useState({
    nomeCliente: "", objeto: "", dataAssinatura: "", vigenciaInicio: "",
    vigenciaFim: "", renovacaoAutomatica: false, status: "ativo",
    modeloContrato: "", totalFrete: "", totalArmazenagem: "", observacoes: "",
  });

  const { data: contratos = [], isLoading } = useQuery<ContratoLogistico[]>({
    queryKey: ["/api/contratos-logisticos"],
  });

  const { data: propostas = [] } = useQuery<Proposta[]>({
    queryKey: ["/api/propostas"],
  });

  const propostasAprovadas = propostas.filter((p) => p.status === "aprovada");

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/contratos-logisticos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contratos-logisticos"] });
      toast({ title: "Contrato criado com sucesso!" });
      setOpen(false);
      resetForm();
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

  function resetForm() {
    setForm({ nomeCliente: "", objeto: "", dataAssinatura: "", vigenciaInicio: "",
      vigenciaFim: "", renovacaoAutomatica: false, status: "ativo",
      modeloContrato: "", totalFrete: "", totalArmazenagem: "", observacoes: "" });
  }

  function openNew() {
    setEditing(null);
    resetForm();
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
    });
    setOpen(true);
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
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function createFromProposta() {
    const proposta = propostasAprovadas.find((p) => p.id.toString() === selectedPropostaId);
    if (!proposta) return;
    const payload = {
      propostaId: proposta.id,
      clientId: proposta.clientId ?? undefined,
      nomeCliente: proposta.nomeCliente ?? "",
      objeto: proposta.perfilLogistico ?? "",
      status: "ativo",
      totalFrete: proposta.totalFrete ?? undefined,
      totalArmazenagem: proposta.totalArmazenagem ?? undefined,
      observacoes: `Gerado a partir da Proposta #${String(proposta.numero).padStart(4, "0")}`,
    };
    createMutation.mutate(payload);
    setShowFromPropostaDialog(false);
    setSelectedPropostaId("");
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
          <div className="flex gap-2">
            {propostasAprovadas.length > 0 && (
              <Button variant="outline" onClick={() => setShowFromPropostaDialog(true)} data-testid="button-contrato-de-proposta">
                <FilePlus2 className="w-4 h-4 mr-2" />
                De Proposta Aprovada
              </Button>
            )}
            <Button onClick={openNew} data-testid="button-novo-contrato">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
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
              <p className="text-muted-foreground text-sm">
                Crie contratos logísticos ou converta propostas aprovadas em contratos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const sc = statusConfig[c.status ?? "ativo"];
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
                          {(c.totalFrete || c.totalArmazenagem) && (
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              Total: {fmtCurrency(c.totalFrete)} + {fmtCurrency(c.totalArmazenagem)}
                            </span>
                          )}
                        </div>
                        {c.objeto && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.objeto}</p>}
                        {c.propostaId && (
                          <p className="text-xs text-blue-500 mt-1">Originado de uma proposta aprovada</p>
                        )}
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
              <DialogTitle>{editing ? "Editar Contrato" : "Novo Contrato Logístico"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cliente *</label>
                <Input placeholder="Razão social do cliente" value={form.nomeCliente} onChange={(e) => setForm(f => ({ ...f, nomeCliente: e.target.value }))} required data-testid="input-nome-cliente-contrato" />
              </div>
              <div>
                <label className="text-sm font-medium">Objeto do Contrato</label>
                <Textarea placeholder="Descreva os serviços contratados..." rows={3} value={form.objeto} onChange={(e) => setForm(f => ({ ...f, objeto: e.target.value }))} />
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
                  <Input type="date" value={form.dataAssinatura} onChange={(e) => setForm(f => ({ ...f, dataAssinatura: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vigência Início</label>
                  <Input type="date" value={form.vigenciaInicio} onChange={(e) => setForm(f => ({ ...f, vigenciaInicio: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Vigência Fim</label>
                  <Input type="date" value={form.vigenciaFim} onChange={(e) => setForm(f => ({ ...f, vigenciaFim: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Total Frete (R$)</label>
                  <Input type="number" step="0.01" placeholder="0,00" value={form.totalFrete} onChange={(e) => setForm(f => ({ ...f, totalFrete: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Armazenagem (R$)</label>
                  <Input type="number" step="0.01" placeholder="0,00" value={form.totalArmazenagem} onChange={(e) => setForm(f => ({ ...f, totalArmazenagem: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="renovacao" checked={form.renovacaoAutomatica} onChange={(e) => setForm(f => ({ ...f, renovacaoAutomatica: e.target.checked }))} className="h-4 w-4" />
                <label htmlFor="renovacao" className="text-sm">Renovação automática</label>
              </div>
              <div>
                <label className="text-sm font-medium">Modelo / Cláusulas do Contrato</label>
                <Textarea placeholder="Cole aqui as cláusulas contratuais ou notas sobre o contrato..." rows={4} value={form.modeloContrato} onChange={(e) => setForm(f => ({ ...f, modeloContrato: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea placeholder="Notas internas..." rows={2} value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-salvar-contrato">
                  {editing ? "Atualizar" : "Criar Contrato"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog: Criar de Proposta Aprovada */}
        <Dialog open={showFromPropostaDialog} onOpenChange={setShowFromPropostaDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Contrato de Proposta Aprovada</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Selecione uma proposta aprovada para gerar o contrato automaticamente com os dados da proposta.</p>
              <Select value={selectedPropostaId} onValueChange={setSelectedPropostaId}>
                <SelectTrigger data-testid="select-proposta-aprovada">
                  <SelectValue placeholder="Selecione a proposta aprovada" />
                </SelectTrigger>
                <SelectContent>
                  {propostasAprovadas.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      #{String(p.numero).padStart(4, "0")} — {p.nomeCliente ?? "Cliente"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFromPropostaDialog(false)}>Cancelar</Button>
                <Button onClick={createFromProposta} disabled={!selectedPropostaId || createMutation.isPending} data-testid="button-gerar-contrato-de-proposta">
                  <FilePlus2 className="w-4 h-4 mr-2" />
                  Gerar Contrato
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
