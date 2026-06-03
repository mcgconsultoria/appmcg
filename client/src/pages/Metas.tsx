import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Target, Plus, Trash2, TrendingUp, Truck, Warehouse,
  ChevronRight, ArrowLeft, CalendarDays, BarChart2, Edit2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/brazilStates";
import type { Client } from "@shared/schema";

type MetaComercial = {
  id: number;
  companyId: number;
  clienteId: number | null;
  ano: number;
  mes: number;
  metaFrete: string | null;
  metaArmazenagem: string | null;
  createdAt: string | null;
};

type MetaLancamento = {
  id: number;
  metaId: number;
  data: string;
  valorFrete: string | null;
  valorArmazenagem: string | null;
  observacao: string | null;
  createdAt: string | null;
};

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const anoAtual = new Date().getFullYear();
const ANOS = [anoAtual - 1, anoAtual, anoAtual + 1];

function pct(realizado: number, meta: number) {
  if (meta <= 0) return 0;
  return Math.min(100, (realizado / meta) * 100);
}

function PctBadge({ value }: { value: number }) {
  const color = value >= 100 ? "bg-green-100 text-green-700" : value >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{value.toFixed(0)}%</span>;
}

function getWeekOfMonth(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil(d.getDate() / 7);
}

export default function MetasPage() {
  const { toast } = useToast();
  const [openCriar, setOpenCriar] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<MetaComercial | null>(null);
  const [openLancar, setOpenLancar] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaComercial | null>(null);

  const emptyForm = {
    clienteId: "", ano: String(anoAtual),
    mes: String(new Date().getMonth() + 1),
    metaFrete: "", metaArmazenagem: "",
  };
  const [form, setForm] = useState({ ...emptyForm });

  const emptyLancForm = {
    data: new Date().toISOString().slice(0, 10),
    valorFrete: "", valorArmazenagem: "", observacao: "",
  };
  const [lancForm, setLancForm] = useState({ ...emptyLancForm });

  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ["/api/clients"] });
  const { data: metas = [], isLoading } = useQuery<MetaComercial[]>({ queryKey: ["/api/metas-comerciais"] });

  // All lancamentos at once — for the table summary
  const { data: allLancamentos = [] } = useQuery<MetaLancamento[]>({ queryKey: ["/api/metas-lancamentos"] });

  // Lancamentos for the selected meta detail view
  const { data: lancamentos = [] } = useQuery<MetaLancamento[]>({
    queryKey: ["/api/metas-lancamentos", selectedMeta?.id],
    enabled: !!selectedMeta,
  });

  const createMeta = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/metas-comerciais", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metas-comerciais"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metas-lancamentos"] });
      toast({ title: "Meta criada com sucesso!" });
      setOpenCriar(false);
      setForm({ ...emptyForm });
      setEditingMeta(null);
    },
    onError: () => toast({ title: "Erro ao criar meta", variant: "destructive" }),
  });

  const updateMeta = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/metas-comerciais/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metas-comerciais"] });
      toast({ title: "Meta atualizada!" });
      setOpenCriar(false);
      setEditingMeta(null);
    },
    onError: () => toast({ title: "Erro ao atualizar meta", variant: "destructive" }),
  });

  const deleteMeta = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/metas-comerciais/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metas-comerciais"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metas-lancamentos"] });
      toast({ title: "Meta removida!" });
      if (selectedMeta && deleteMeta.variables === selectedMeta.id) setSelectedMeta(null);
    },
    onError: () => toast({ title: "Erro ao remover meta", variant: "destructive" }),
  });

  const createLancamento = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/metas-lancamentos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metas-lancamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metas-lancamentos", selectedMeta?.id] });
      toast({ title: "Lançamento registrado!" });
      setOpenLancar(false);
      setLancForm({ ...emptyLancForm });
    },
    onError: () => toast({ title: "Erro ao registrar lançamento", variant: "destructive" }),
  });

  const deleteLancamento = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/metas-lancamentos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/metas-lancamentos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metas-lancamentos", selectedMeta?.id] });
      toast({ title: "Lançamento removido!" });
    },
    onError: () => toast({ title: "Erro ao remover lançamento", variant: "destructive" }),
  });

  function handleSubmitMeta() {
    const payload = {
      clienteId: form.clienteId && form.clienteId !== "none" ? parseInt(form.clienteId) : null,
      ano: parseInt(form.ano),
      mes: parseInt(form.mes),
      metaFrete: form.metaFrete ? parseFloat(form.metaFrete) : 0,
      metaArmazenagem: form.metaArmazenagem ? parseFloat(form.metaArmazenagem) : 0,
    };
    if (editingMeta) {
      updateMeta.mutate({ id: editingMeta.id, data: payload });
    } else {
      createMeta.mutate(payload);
    }
  }

  function openEdit(m: MetaComercial) {
    setEditingMeta(m);
    setForm({
      clienteId: m.clienteId ? String(m.clienteId) : "none",
      ano: String(m.ano),
      mes: String(m.mes),
      metaFrete: m.metaFrete ?? "",
      metaArmazenagem: m.metaArmazenagem ?? "",
    });
    setOpenCriar(true);
  }

  function handleSubmitLancamento() {
    if (!selectedMeta) return;
    createLancamento.mutate({
      metaId: selectedMeta.id,
      data: lancForm.data,
      valorFrete: lancForm.valorFrete ? parseFloat(lancForm.valorFrete) : 0,
      valorArmazenagem: lancForm.valorArmazenagem ? parseFloat(lancForm.valorArmazenagem) : 0,
      observacao: lancForm.observacao || null,
    });
  }

  const clienteNome = (id: number | null) => {
    if (!id) return "Geral";
    return clients.find((c) => c.id === id)?.name ?? `Cliente #${id}`;
  };

  // Per-meta aggregated realizado (using all lancamentos)
  const realizadoByMeta: Record<number, { frete: number; armazenagem: number }> = {};
  for (const l of allLancamentos) {
    if (!realizadoByMeta[l.metaId]) realizadoByMeta[l.metaId] = { frete: 0, armazenagem: 0 };
    realizadoByMeta[l.metaId].frete += Number(l.valorFrete ?? 0);
    realizadoByMeta[l.metaId].armazenagem += Number(l.valorArmazenagem ?? 0);
  }

  const totalMetaFrete = metas.reduce((s, m) => s + Number(m.metaFrete ?? 0), 0);
  const totalMetaArm = metas.reduce((s, m) => s + Number(m.metaArmazenagem ?? 0), 0);
  const totalRealizadoFrete = Object.values(realizadoByMeta).reduce((s, v) => s + v.frete, 0);
  const totalRealizadoArm = Object.values(realizadoByMeta).reduce((s, v) => s + v.armazenagem, 0);

  // Ritmo de Vendas detail helpers
  const realizadoFrete = lancamentos.reduce((s, l) => s + Number(l.valorFrete ?? 0), 0);
  const realizadoArmazenagem = lancamentos.reduce((s, l) => s + Number(l.valorArmazenagem ?? 0), 0);
  const metaF = Number(selectedMeta?.metaFrete ?? 0);
  const metaA = Number(selectedMeta?.metaArmazenagem ?? 0);

  function getRitmo(agrupamento: "dia" | "semana" | "mes") {
    const map: Record<string, { frete: number; armazenagem: number; label: string }> = {};
    for (const l of lancamentos) {
      let key: string, label: string;
      if (agrupamento === "dia") {
        key = l.data;
        label = new Date(l.data + "T12:00:00").toLocaleDateString("pt-BR");
      } else if (agrupamento === "semana") {
        const w = getWeekOfMonth(l.data);
        key = `S${w}`; label = `Semana ${w}`;
      } else {
        const d = new Date(l.data + "T12:00:00");
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = MESES[d.getMonth()] + "/" + d.getFullYear();
      }
      if (!map[key]) map[key] = { frete: 0, armazenagem: 0, label };
      map[key].frete += Number(l.valorFrete ?? 0);
      map[key].armazenagem += Number(l.valorArmazenagem ?? 0);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {selectedMeta && (
              <Button variant="outline" size="sm" className="gap-1 shrink-0" onClick={() => setSelectedMeta(null)} data-testid="button-voltar-metas">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                {selectedMeta
                  ? `Ritmo de Vendas — ${MESES[selectedMeta.mes - 1]} ${selectedMeta.ano}`
                  : "Metas Comerciais"}
              </h1>
              {selectedMeta && (
                <p className="text-sm text-muted-foreground">{clienteNome(selectedMeta.clienteId)}</p>
              )}
            </div>
          </div>
          {!selectedMeta && (
            <Button onClick={() => { setEditingMeta(null); setForm({ ...emptyForm }); setOpenCriar(true); }} data-testid="button-criar-meta">
              <Plus className="h-4 w-4 mr-1" /> Criar Meta
            </Button>
          )}
          {selectedMeta && (
            <Button onClick={() => { setLancForm({ ...emptyLancForm }); setOpenLancar(true); }} data-testid="button-lancar">
              <Plus className="h-4 w-4 mr-1" /> Lançar Realizado
            </Button>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            LISTA DE METAS
        ══════════════════════════════════════════════ */}
        {!selectedMeta ? (
          <>
            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-500" /> Meta Total Frete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-meta-frete">{formatCurrency(totalMetaFrete)}</div>
                  <p className="text-xs text-muted-foreground">Previsto — todas as metas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" /> Realizado Frete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRealizadoFrete)}</div>
                  <Progress value={pct(totalRealizadoFrete, totalMetaFrete)} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{pct(totalRealizadoFrete, totalMetaFrete).toFixed(0)}% da meta</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-amber-500" /> Meta Total Armazenagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-meta-arm">{formatCurrency(totalMetaArm)}</div>
                  <p className="text-xs text-muted-foreground">Previsto — todas as metas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" /> Realizado Armazenagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalRealizadoArm)}</div>
                  <Progress value={pct(totalRealizadoArm, totalMetaArm)} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{pct(totalRealizadoArm, totalMetaArm).toFixed(0)}% da meta</p>
                </CardContent>
              </Card>
            </div>

            {/* Table of metas */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : metas.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Nenhuma meta cadastrada</p>
                <p className="text-sm">Clique em "Criar Meta" para começar</p>
              </div>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Metas por Cliente / Mês</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Mês / Ano</TableHead>
                          <TableHead className="text-right">
                            <span className="flex items-center justify-end gap-1"><Truck className="h-3.5 w-3.5 text-blue-500" /> Frete Previsto</span>
                          </TableHead>
                          <TableHead className="text-right">
                            <span className="flex items-center justify-end gap-1"><TrendingUp className="h-3.5 w-3.5 text-green-500" /> Frete Realizado</span>
                          </TableHead>
                          <TableHead className="text-right">% Frete</TableHead>
                          <TableHead className="text-right">
                            <span className="flex items-center justify-end gap-1"><Warehouse className="h-3.5 w-3.5 text-amber-500" /> Arm. Previsto</span>
                          </TableHead>
                          <TableHead className="text-right">
                            <span className="flex items-center justify-end gap-1"><TrendingUp className="h-3.5 w-3.5 text-orange-500" /> Arm. Realizado</span>
                          </TableHead>
                          <TableHead className="text-right">% Arm.</TableHead>
                          <TableHead className="w-32"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metas.map((m) => {
                          const mf = Number(m.metaFrete ?? 0);
                          const ma = Number(m.metaArmazenagem ?? 0);
                          const real = realizadoByMeta[m.id] ?? { frete: 0, armazenagem: 0 };
                          const pctF = pct(real.frete, mf);
                          const pctA = pct(real.armazenagem, ma);
                          return (
                            <TableRow key={m.id} data-testid={`row-meta-${m.id}`}>
                              <TableCell className="font-medium">{clienteNome(m.clienteId)}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{MESES[m.mes - 1]} {m.ano}</Badge>
                              </TableCell>
                              <TableCell className="text-right">{formatCurrency(mf)}</TableCell>
                              <TableCell className="text-right font-medium text-green-700 dark:text-green-400">{formatCurrency(real.frete)}</TableCell>
                              <TableCell className="text-right"><PctBadge value={pctF} /></TableCell>
                              <TableCell className="text-right">{formatCurrency(ma)}</TableCell>
                              <TableCell className="text-right font-medium text-orange-700 dark:text-orange-400">{formatCurrency(real.armazenagem)}</TableCell>
                              <TableCell className="text-right"><PctBadge value={pctA} /></TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setSelectedMeta(m)} data-testid={`button-ritmo-${m.id}`}>
                                    <BarChart2 className="h-3 w-3" /> Ritmo <ChevronRight className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(m)} data-testid={`button-edit-meta-${m.id}`}>
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteMeta.mutate(m.id)} data-testid={`button-delete-meta-${m.id}`}>
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* ══════════════════════════════════════════════
             RITMO DE VENDAS (detalhe por meta)
          ══════════════════════════════════════════════ */
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-blue-500" /> Meta Frete
                  </CardTitle>
                </CardHeader>
                <CardContent><div className="text-xl font-bold">{formatCurrency(metaF)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-green-500" /> Realizado Frete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(realizadoFrete)}</div>
                  <Progress value={pct(realizadoFrete, metaF)} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{pct(realizadoFrete, metaF).toFixed(0)}% da meta</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium flex items-center gap-1">
                    <Warehouse className="h-3.5 w-3.5 text-amber-500" /> Meta Armazenagem
                  </CardTitle>
                </CardHeader>
                <CardContent><div className="text-xl font-bold">{formatCurrency(metaA)}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium flex items-center gap-1">
                    <Warehouse className="h-3.5 w-3.5 text-orange-500" /> Realizado Armazenagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-orange-600">{formatCurrency(realizadoArmazenagem)}</div>
                  <Progress value={pct(realizadoArmazenagem, metaA)} className="h-1.5 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{pct(realizadoArmazenagem, metaA).toFixed(0)}% da meta</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="dia">
              <TabsList data-testid="tabs-ritmo">
                <TabsTrigger value="dia" data-testid="tab-dia"><CalendarDays className="h-3.5 w-3.5 mr-1" /> Por Dia</TabsTrigger>
                <TabsTrigger value="semana" data-testid="tab-semana"><TrendingUp className="h-3.5 w-3.5 mr-1" /> Por Semana</TabsTrigger>
                <TabsTrigger value="mes" data-testid="tab-mes"><BarChart2 className="h-3.5 w-3.5 mr-1" /> Por Mês</TabsTrigger>
              </TabsList>

              {(["dia", "semana", "mes"] as const).map((ag) => {
                const rows = getRitmo(ag);
                return (
                  <TabsContent key={ag} value={ag}>
                    <Card>
                      <CardContent className="pt-4">
                        {rows.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p>Nenhum lançamento ainda. Clique em "Lançar Realizado" para registrar vendas.</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{ag === "dia" ? "Data" : ag === "semana" ? "Semana" : "Mês"}</TableHead>
                                <TableHead className="text-right">Frete</TableHead>
                                <TableHead className="text-right">% Meta Frete</TableHead>
                                <TableHead className="text-right">Armazenagem</TableHead>
                                <TableHead className="text-right">% Meta Arm.</TableHead>
                                <TableHead className="text-right font-semibold">Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rows.map((r, i) => (
                                <TableRow key={i} data-testid={`row-ritmo-${ag}-${i}`}>
                                  <TableCell className="font-medium">{r.label}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(r.frete)}</TableCell>
                                  <TableCell className="text-right">
                                    <PctBadge value={pct(r.frete, metaF / (rows.length || 1))} />
                                  </TableCell>
                                  <TableCell className="text-right">{formatCurrency(r.armazenagem)}</TableCell>
                                  <TableCell className="text-right">
                                    <PctBadge value={pct(r.armazenagem, metaA / (rows.length || 1))} />
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">{formatCurrency(r.frete + r.armazenagem)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Todos os Lançamentos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lancamentos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum lançamento registrado.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Frete</TableHead>
                        <TableHead className="text-right">Armazenagem</TableHead>
                        <TableHead>Observação</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lancamentos.map((l) => (
                        <TableRow key={l.id} data-testid={`row-lancamento-${l.id}`}>
                          <TableCell>{new Date(l.data + "T12:00:00").toLocaleDateString("pt-BR")}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(l.valorFrete ?? 0))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(l.valorArmazenagem ?? 0))}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{l.observacao ?? "—"}</TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" onClick={() => deleteLancamento.mutate(l.id)} data-testid={`button-delete-lanc-${l.id}`}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Criar / Editar Meta ── */}
      <Dialog open={openCriar} onOpenChange={(v) => { setOpenCriar(v); if (!v) setEditingMeta(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMeta ? "Editar Meta" : "Criar Meta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={form.clienteId} onValueChange={(v) => setForm({ ...form, clienteId: v })}>
                <SelectTrigger data-testid="select-cliente">
                  <SelectValue placeholder="Selecione o cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geral (sem cliente)</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ano</Label>
                <Select value={form.ano} onValueChange={(v) => setForm({ ...form, ano: v })}>
                  <SelectTrigger data-testid="select-ano"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ANOS.map((a) => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Mês</Label>
                <Select value={form.mes} onValueChange={(v) => setForm({ ...form, mes: v })}>
                  <SelectTrigger data-testid="select-mes"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MESES.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-blue-500" /> R$ Meta Frete (Previsto)</Label>
              <Input type="number" placeholder="0,00" value={form.metaFrete}
                onChange={(e) => setForm({ ...form, metaFrete: e.target.value })}
                data-testid="input-meta-frete" />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Warehouse className="h-3.5 w-3.5 text-amber-500" /> R$ Meta Armazenagem (Previsto)</Label>
              <Input type="number" placeholder="0,00" value={form.metaArmazenagem}
                onChange={(e) => setForm({ ...form, metaArmazenagem: e.target.value })}
                data-testid="input-meta-armazenagem" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setOpenCriar(false); setEditingMeta(null); }}>Cancelar</Button>
              <Button onClick={handleSubmitMeta} disabled={createMeta.isPending || updateMeta.isPending} data-testid="button-salvar-meta">
                {editingMeta ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Lançar Realizado ── */}
      <Dialog open={openLancar} onOpenChange={setOpenLancar}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lançar Realizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={lancForm.data}
                onChange={(e) => setLancForm({ ...lancForm, data: e.target.value })}
                data-testid="input-data-lancamento" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-blue-500" /> Frete Realizado</Label>
                <Input type="number" placeholder="0,00" value={lancForm.valorFrete}
                  onChange={(e) => setLancForm({ ...lancForm, valorFrete: e.target.value })}
                  data-testid="input-valor-frete" />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Warehouse className="h-3.5 w-3.5 text-amber-500" /> Armazenagem Realizada</Label>
                <Input type="number" placeholder="0,00" value={lancForm.valorArmazenagem}
                  onChange={(e) => setLancForm({ ...lancForm, valorArmazenagem: e.target.value })}
                  data-testid="input-valor-armazenagem" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observação</Label>
              <Textarea placeholder="Notas sobre este lançamento..." value={lancForm.observacao}
                onChange={(e) => setLancForm({ ...lancForm, observacao: e.target.value })}
                data-testid="input-observacao-lancamento" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenLancar(false)}>Cancelar</Button>
              <Button onClick={handleSubmitLancamento} disabled={createLancamento.isPending} data-testid="button-salvar-lancamento">
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
