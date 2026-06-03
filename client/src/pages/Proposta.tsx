import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, FileText, Clock, Pencil, Trash2, CheckCircle, Send, Printer,
  Truck, Warehouse, Link2, X, Search, ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Proposta, FreightCalculation, StorageCalculation } from "@shared/schema";

const STATUS_OPTS = ["rascunho", "enviada", "em_analise", "aprovada", "recusada", "cancelada"];

const statusConfig: Record<string, { label: string; color: string }> = {
  rascunho: { label: "Rascunho", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  enviada: { label: "Enviada", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  em_analise: { label: "Em Análise", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  aprovada: { label: "Aprovada", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  recusada: { label: "Recusada", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500" },
};

function fmtCurrency(v: string | null | undefined) {
  if (!v) return "";
  const n = Number(v);
  if (isNaN(n)) return v;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const emptyForm = {
  nomeCliente: "", validade: 30, status: "rascunho" as string,
  perfilLogistico: "", observacoes: "",
  totalFrete: "", totalArmazenagem: "",
  freteCalculoId: null as number | null,
  armazenagemCalculoId: null as number | null,
};

export default function PropostaPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Proposta | null>(null);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [form, setForm] = useState({ ...emptyForm });

  // Calc picker dialogs
  const [showFreteCalcPicker, setShowFreteCalcPicker] = useState(false);
  const [showStorageCalcPicker, setShowStorageCalcPicker] = useState(false);
  const [searchCalc, setSearchCalc] = useState("");

  const { data: propostas = [], isLoading } = useQuery<Proposta[]>({
    queryKey: ["/api/propostas"],
  });

  const { data: freteCalcs = [] } = useQuery<FreightCalculation[]>({
    queryKey: ["/api/freight-calculations"],
  });

  const { data: storageCalcs = [] } = useQuery<StorageCalculation[]>({
    queryKey: ["/api/storage-calculations"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/propostas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/propostas"] });
      toast({ title: "Proposta criada com sucesso!" });
      setOpen(false);
      setForm({ ...emptyForm });
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
      setForm({ ...emptyForm });
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
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(p: Proposta) {
    setEditing(p);
    setForm({
      nomeCliente: p.nomeCliente ?? "",
      validade: p.validade ?? 30,
      status: p.status ?? "rascunho",
      perfilLogistico: p.perfilLogistico ?? "",
      observacoes: p.observacoes ?? "",
      totalFrete: p.totalFrete ?? "",
      totalArmazenagem: p.totalArmazenagem ?? "",
      freteCalculoId: p.freteCalculoId ?? null,
      armazenagemCalculoId: p.armazenagemCalculoId ?? null,
    });
    setOpen(true);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nomeCliente.trim()) {
      toast({ title: "Nome do cliente é obrigatório", variant: "destructive" });
      return;
    }
    const nextNum = propostas.length > 0 ? Math.max(...propostas.map((p) => p.numero)) + 1 : 1;
    const payload = {
      ...form,
      numero: editing ? editing.numero : nextNum,
      validade: Number(form.validade),
      totalFrete: form.totalFrete || undefined,
      totalArmazenagem: form.totalArmazenagem || undefined,
      freteCalculoId: form.freteCalculoId ?? undefined,
      armazenagemCalculoId: form.armazenagemCalculoId ?? undefined,
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function exportPDF(p: Proposta) {
    const win = window.open("", "_blank");
    if (!win) return;
    const freteCalc = freteCalcs.find((c) => c.id === p.freteCalculoId);
    const storageCalc = storageCalcs.find((c) => c.id === p.armazenagemCalculoId);
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Proposta #${String(p.numero).padStart(4,"0")}</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;color:#222}h1{color:#1a56db}
    .header{margin-bottom:24px}.badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:12px;background:#e1f0ff;color:#1a56db}
    table{width:100%;border-collapse:collapse;margin:16px 0}td,th{padding:8px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5}
    .section{margin-top:24px;padding-top:16px;border-top:2px solid #e5e7eb}.total{font-size:18px;font-weight:bold;color:#1a56db}
    @media print{button{display:none}}</style>
    </head><body>
    <button onclick="window.print()" style="margin-bottom:20px;padding:8px 16px;background:#1a56db;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimir / Salvar PDF</button>
    <h1>Proposta Comercial</h1>
    <div class="header">
      <span class="badge">${statusConfig[p.status ?? "rascunho"]?.label ?? p.status}</span>
      <p><strong>Número:</strong> #${String(p.numero).padStart(4,"0")}</p>
      <p><strong>Cliente:</strong> ${p.nomeCliente ?? "—"}</p>
      <p><strong>Data de Emissão:</strong> ${p.dataEmissao ? format(new Date(p.dataEmissao),"dd/MM/yyyy",{locale:ptBR}) : "—"}</p>
      <p><strong>Validade:</strong> ${p.validade ?? 30} dias</p>
    </div>
    ${p.perfilLogistico ? `<div class="section"><h3>Perfil Logístico</h3><p>${p.perfilLogistico}</p></div>` : ""}
    ${freteCalc ? `<div class="section"><h3>Cálculo de Frete Vinculado — #${String(freteCalc.numero ?? "").padStart(4,"0")} ${freteCalc.titulo ?? ""}</h3>
    <table><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>
    ${freteCalc.originCity ? `<tr><td>Origem</td><td>${freteCalc.originCity}/${freteCalc.originState}</td></tr>` : ""}
    ${freteCalc.destinationCity ? `<tr><td>Destino</td><td>${freteCalc.destinationCity}/${freteCalc.destinationState}</td></tr>` : ""}
    ${freteCalc.weight ? `<tr><td>Peso</td><td>${Number(freteCalc.weight).toLocaleString("pt-BR")} kg</td></tr>` : ""}
    ${freteCalc.freightValue ? `<tr><td>Valor do Frete</td><td>${fmtCurrency(freteCalc.freightValue)}</td></tr>` : ""}
    ${freteCalc.totalValue ? `<tr><td><strong>Total</strong></td><td><strong>${fmtCurrency(freteCalc.totalValue)}</strong></td></tr>` : ""}
    </tbody></table></div>` : ""}
    ${storageCalc ? `<div class="section"><h3>Cálculo de Armazenagem Vinculado — #${String(storageCalc.numero ?? "").padStart(4,"0")} ${storageCalc.titulo ?? ""}</h3>
    <table><thead><tr><th>Campo</th><th>Valor</th></tr></thead><tbody>
    ${storageCalc.area ? `<tr><td>Área</td><td>${Number(storageCalc.area).toLocaleString("pt-BR")} m²</td></tr>` : ""}
    ${storageCalc.period ? `<tr><td>Período</td><td>${storageCalc.period} dias</td></tr>` : ""}
    ${storageCalc.totalValue ? `<tr><td><strong>Total</strong></td><td><strong>${fmtCurrency(storageCalc.totalValue)}</strong></td></tr>` : ""}
    </tbody></table></div>` : ""}
    <div class="section">
      <table><thead><tr><th>Item</th><th>Valor</th></tr></thead><tbody>
      ${p.totalFrete ? `<tr><td>Total Frete</td><td>${fmtCurrency(p.totalFrete)}</td></tr>` : ""}
      ${p.totalArmazenagem ? `<tr><td>Total Armazenagem</td><td>${fmtCurrency(p.totalArmazenagem)}</td></tr>` : ""}
      </tbody></table>
    </div>
    ${p.observacoes ? `<div class="section"><h3>Observações</h3><p>${p.observacoes}</p></div>` : ""}
    <p style="margin-top:40px;font-size:12px;color:#888">Gerado em ${format(new Date(),"dd/MM/yyyy HH:mm",{locale:ptBR})} | MCG Consultoria</p>
    </body></html>`;
    win.document.write(html);
    win.document.close();
  }

  // Linked calc helpers
  const linkedFreteCalc = form.freteCalculoId ? freteCalcs.find((c) => c.id === form.freteCalculoId) : null;
  const linkedStorageCalc = form.armazenagemCalculoId ? storageCalcs.find((c) => c.id === form.armazenagemCalculoId) : null;

  const filteredFreteCalcs = freteCalcs.filter((c) =>
    !searchCalc || (c.titulo ?? "").toLowerCase().includes(searchCalc.toLowerCase()) ||
    String(c.numero ?? "").includes(searchCalc)
  );
  const filteredStorageCalcs = storageCalcs.filter((c) =>
    !searchCalc || (c.titulo ?? "").toLowerCase().includes(searchCalc.toLowerCase()) ||
    String(c.numero ?? "").includes(searchCalc)
  );

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
        <Button onClick={openNew} data-testid="button-nova-proposta">
          <Plus className="w-4 h-4 mr-2" />
          Nova Proposta
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div><p className="text-2xl font-bold">{propostas.length}</p><p className="text-xs text-muted-foreground">Total de propostas</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Send className="w-8 h-8 text-blue-500" />
            <div><p className="text-2xl font-bold">{enviadas}</p><p className="text-xs text-muted-foreground">Em aberto</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div><p className="text-2xl font-bold">{aprovadas}</p><p className="text-xs text-muted-foreground">Aprovadas</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
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

      {/* Lista */}
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
            const freteCalc = freteCalcs.find((c) => c.id === p.freteCalculoId);
            const storCalc = storageCalcs.find((c) => c.id === p.armazenagemCalculoId);
            return (
              <Card key={p.id} className="hover:shadow-sm transition-shadow" data-testid={`card-proposta-${p.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-primary">#{String(p.numero).padStart(4, "0")}</span>
                        <span className="font-semibold truncate">{p.nomeCliente ?? "—"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${sc.color}`}>{sc.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {p.dataEmissao && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(p.dataEmissao), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                        {p.validade && <span>Validade: {p.validade} dias</span>}
                        {(p.totalFrete || p.totalArmazenagem) && (
                          <span className="font-medium text-foreground">
                            {p.totalFrete && `Frete: ${fmtCurrency(p.totalFrete)}`}
                            {p.totalFrete && p.totalArmazenagem && " · "}
                            {p.totalArmazenagem && `Arm.: ${fmtCurrency(p.totalArmazenagem)}`}
                          </span>
                        )}
                      </div>
                      {/* Linked calcs */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {freteCalc && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Truck className="w-3 h-3" />
                            Frete #{String(freteCalc.numero ?? "").padStart(3,"0")} — {freteCalc.titulo ?? `${freteCalc.originCity}→${freteCalc.destinationCity}`}
                          </Badge>
                        )}
                        {storCalc && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Warehouse className="w-3 h-3" />
                            Arm. #{String(storCalc.numero ?? "").padStart(3,"0")} — {storCalc.titulo ?? `${storCalc.area}m²`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Exportar PDF" onClick={() => exportPDF(p)} data-testid={`btn-pdf-proposta-${p.id}`}>
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)} data-testid={`btn-edit-proposta-${p.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(p.id)} data-testid={`btn-delete-proposta-${p.id}`}>
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

      {/* Dialog: Novo/Editar Proposta */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                onClick={() => setOpen(false)} data-testid="button-voltar-proposta">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>{editing ? "Editar Proposta" : "Nova Proposta Comercial"}</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
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
                <label className="text-sm font-medium">Validade (dias)</label>
                <Input type="number" value={form.validade} onChange={(e) => setForm(f => ({ ...f, validade: Number(e.target.value) }))} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Cliente *</label>
              <Input placeholder="Nome da empresa ou cliente" value={form.nomeCliente}
                onChange={(e) => setForm(f => ({ ...f, nomeCliente: e.target.value }))}
                required data-testid="input-cliente-proposta" />
            </div>

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

            {/* Vinculo com cálculo de frete */}
            <div>
              <label className="text-sm font-medium block mb-1">Cálculo de Frete Vinculado</label>
              {linkedFreteCalc ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-sm flex-1">
                    #{String(linkedFreteCalc.numero ?? "").padStart(3,"0")} — {linkedFreteCalc.titulo ?? `${linkedFreteCalc.originCity ?? ""}→${linkedFreteCalc.destinationCity ?? ""}`}
                    {linkedFreteCalc.totalValue && ` (${fmtCurrency(linkedFreteCalc.totalValue)})`}
                  </span>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6"
                    onClick={() => setForm(f => ({ ...f, freteCalculoId: null }))}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => { setSearchCalc(""); setShowFreteCalcPicker(true); }}
                  data-testid="button-vincular-frete-calc">
                  <Link2 className="w-4 h-4 mr-2" />
                  Vincular Cálculo de Frete
                </Button>
              )}
            </div>

            {/* Vinculo com cálculo de armazenagem */}
            <div>
              <label className="text-sm font-medium block mb-1">Cálculo de Armazenagem Vinculado</label>
              {linkedStorageCalc ? (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                  <Warehouse className="w-4 h-4 text-primary" />
                  <span className="text-sm flex-1">
                    #{String(linkedStorageCalc.numero ?? "").padStart(3,"0")} — {linkedStorageCalc.titulo ?? `${linkedStorageCalc.area ?? ""}m²`}
                    {linkedStorageCalc.totalValue && ` (${fmtCurrency(linkedStorageCalc.totalValue)})`}
                  </span>
                  <Button type="button" size="icon" variant="ghost" className="h-6 w-6"
                    onClick={() => setForm(f => ({ ...f, armazenagemCalculoId: null }))}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={() => { setSearchCalc(""); setShowStorageCalcPicker(true); }}
                  data-testid="button-vincular-storage-calc">
                  <Link2 className="w-4 h-4 mr-2" />
                  Vincular Cálculo de Armazenagem
                </Button>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Perfil Logístico</label>
              <Textarea placeholder="Descreva o perfil e necessidade do cliente..." rows={3}
                value={form.perfilLogistico} onChange={(e) => setForm(f => ({ ...f, perfilLogistico: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Observações</label>
              <Textarea placeholder="Notas internas sobre esta proposta..." rows={2}
                value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-salvar-proposta">
                {editing ? "Atualizar" : "Criar Proposta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Picker de cálculo de frete */}
      <Dialog open={showFreteCalcPicker} onOpenChange={setShowFreteCalcPicker}>
        <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Truck className="w-5 h-5" />Selecionar Cálculo de Frete</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título ou número..." className="pl-8"
              value={searchCalc} onChange={(e) => setSearchCalc(e.target.value)} />
          </div>
          <div className="overflow-y-auto flex-1 space-y-2">
            {freteCalcs.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-8">
                Nenhum cálculo de frete salvo. Use a calculadora de frete e clique em "Salvar Cálculo".
              </p>
            )}
            {filteredFreteCalcs.map((c) => (
              <Card key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                setForm(f => ({ ...f, freteCalculoId: c.id }));
                setShowFreteCalcPicker(false);
              }} data-testid={`pick-frete-${c.id}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-sm">#{String(c.numero ?? "").padStart(3,"0")}</span>
                    <span className="font-medium text-sm">{c.titulo ?? `${c.originCity ?? ""}→${c.destinationCity ?? ""}`}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                    {c.originCity && <span>{c.originCity}/{c.originState} → {c.destinationCity}/{c.destinationState}</span>}
                    {c.totalValue && <span className="font-medium">{fmtCurrency(c.totalValue)}</span>}
                    {c.createdAt && <span>{format(new Date(c.createdAt), "dd/MM/yyyy")}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Picker de cálculo de armazenagem */}
      <Dialog open={showStorageCalcPicker} onOpenChange={setShowStorageCalcPicker}>
        <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Warehouse className="w-5 h-5" />Selecionar Cálculo de Armazenagem</DialogTitle>
          </DialogHeader>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título ou número..." className="pl-8"
              value={searchCalc} onChange={(e) => setSearchCalc(e.target.value)} />
          </div>
          <div className="overflow-y-auto flex-1 space-y-2">
            {storageCalcs.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-8">
                Nenhum cálculo de armazenagem salvo. Use a calculadora de armazenagem e clique em "Salvar Cálculo".
              </p>
            )}
            {filteredStorageCalcs.map((c) => (
              <Card key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                setForm(f => ({ ...f, armazenagemCalculoId: c.id }));
                setShowStorageCalcPicker(false);
              }} data-testid={`pick-storage-${c.id}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-sm">#{String(c.numero ?? "").padStart(3,"0")}</span>
                    <span className="font-medium text-sm">{c.titulo ?? `${c.area ?? ""}m² / ${c.period ?? ""}d`}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                    {c.area && <span>{c.area}m²</span>}
                    {c.period && <span>{c.period} dias</span>}
                    {c.totalValue && <span className="font-medium">{fmtCurrency(c.totalValue)}</span>}
                    {c.createdAt && <span>{format(new Date(c.createdAt), "dd/MM/yyyy")}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
