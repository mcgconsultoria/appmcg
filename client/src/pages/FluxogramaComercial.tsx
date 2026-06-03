import { useCallback, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Download, RotateCcw, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  mkt:      { border: "#ea580c", bg: "#fed7aa", text: "#9a3412", phase: "#f97316" },
  com:      { border: "#2563eb", bg: "#bfdbfe", text: "#1e40af", phase: "#3b82f6" },
  cac:      { border: "#16a34a", bg: "#bbf7d0", text: "#166534", phase: "#22c55e" },
  central:  { border: "#7c3aed", bg: "#8b5cf6", text: "#ffffff", phase: "#8b5cf6" },
  group:    { border: "#94a3b8", bg: "#f1f5f9", text: "#334155" },
};

const phaseStyle = (c: typeof C.mkt) => ({
  background: c.phase, color: "#fff",
  border: `2px solid ${c.border}`, borderRadius: "8px",
  padding: "12px 20px", fontWeight: "bold", fontSize: "13px",
});

const groupStyle = () => ({
  background: C.group.bg, color: C.group.text,
  border: `1px solid ${C.group.border}`, borderRadius: "6px",
  padding: "6px 14px", fontWeight: "600", fontSize: "11px",
  textTransform: "uppercase" as const, letterSpacing: "0.04em",
});

const itemStyle = (c: typeof C.mkt) => ({
  background: c.bg, color: c.text,
  border: `1px solid ${c.border}`, borderRadius: "6px",
  padding: "6px 12px", fontSize: "12px", cursor: "pointer",
});

// ── Layout constants ─────────────────────────────────────────────────────────
const CX = 760;      // central x
const MKT_X = 60;
const COM_X = 760;
const CAC_X = 1560;

const GROUP_X: Record<string, number> = {
  planejamento: 440,
  relacionamento: 680,
  precificacao:   920,
  gestao:        1160,
};

const ITEM_Y0 = 390;
const ITEM_DY = 55;
const GROUP_Y  = 310;
const PHASE_Y  = 160;
const CENTRAL_Y = 30;
const MKT_ITEM_Y0 = 290;
const CAC_ITEM_Y0 = 290;

// ── Nodes ────────────────────────────────────────────────────────────────────
const defaultNodes: Node[] = [
  // ── Central ──
  {
    id: "central",
    position: { x: CX, y: CENTRAL_Y },
    data: { label: "GESTÃO COMERCIAL", area: "central" },
    style: { ...phaseStyle(C.central), padding: "16px 28px", fontSize: "15px" },
  },

  // ── Phase: MKT ──
  {
    id: "mkt",
    position: { x: MKT_X, y: PHASE_Y },
    data: { label: "PRÉ-VENDAS (MKT)", area: "mkt" },
    style: phaseStyle(C.mkt),
  },
  {
    id: "mkt-marketing",
    position: { x: MKT_X - 10, y: MKT_ITEM_Y0 },
    data: { label: "Marketing", area: "mkt", link: "/marketing" },
    style: itemStyle(C.mkt),
  },
  {
    id: "mkt-indicadores",
    position: { x: MKT_X - 10, y: MKT_ITEM_Y0 + ITEM_DY },
    data: { label: "Indicadores", area: "mkt", link: "/indicadores-pre-vendas" },
    style: itemStyle(C.mkt),
  },

  // ── Phase: COM ──
  {
    id: "com",
    position: { x: COM_X, y: PHASE_Y },
    data: { label: "VENDAS (COM)", area: "com" },
    style: phaseStyle(C.com),
  },

  // COM → Planejamento group
  {
    id: "grp-planejamento",
    position: { x: GROUP_X.planejamento, y: GROUP_Y },
    data: { label: "📋 Planejamento", area: "com" },
    style: groupStyle(),
  },
  {
    id: "com-checklist",
    position: { x: GROUP_X.planejamento, y: ITEM_Y0 },
    data: { label: "Checklist", area: "com", link: "/checklist" },
    style: itemStyle(C.com),
  },
  {
    id: "com-rfi",
    position: { x: GROUP_X.planejamento, y: ITEM_Y0 + ITEM_DY },
    data: { label: "Meu RFI", area: "com", link: "/rfi" },
    style: itemStyle(C.com),
  },
  {
    id: "com-ata",
    position: { x: GROUP_X.planejamento, y: ITEM_Y0 + ITEM_DY * 2 },
    data: { label: "Ata Plano de Ação", area: "com", link: "/atas" },
    style: itemStyle(C.com),
  },
  {
    id: "com-fluxograma",
    position: { x: GROUP_X.planejamento, y: ITEM_Y0 + ITEM_DY * 3 },
    data: { label: "Fluxograma Comercial", area: "com", link: "/fluxograma" },
    style: itemStyle(C.com),
  },

  // COM → Relacionamento group
  {
    id: "grp-relacionamento",
    position: { x: GROUP_X.relacionamento, y: GROUP_Y },
    data: { label: "🤝 Relacionamento", area: "com" },
    style: groupStyle(),
  },
  {
    id: "com-clientes",
    position: { x: GROUP_X.relacionamento, y: ITEM_Y0 },
    data: { label: "Clientes", area: "com", link: "/clientes" },
    style: itemStyle(C.com),
  },
  {
    id: "com-bilaterais",
    position: { x: GROUP_X.relacionamento, y: ITEM_Y0 + ITEM_DY },
    data: { label: "Bilaterais", area: "com", link: "/bilaterais" },
    style: itemStyle(C.com),
  },
  {
    id: "com-segmentos",
    position: { x: GROUP_X.relacionamento, y: ITEM_Y0 + ITEM_DY * 2 },
    data: { label: "Segmentos", area: "com", link: "/segmentos" },
    style: itemStyle(C.com),
  },
  {
    id: "com-eventos",
    position: { x: GROUP_X.relacionamento, y: ITEM_Y0 + ITEM_DY * 3 },
    data: { label: "Eventos", area: "com", link: "/eventos-comerciais" },
    style: itemStyle(C.com),
  },
  {
    id: "com-calendario",
    position: { x: GROUP_X.relacionamento, y: ITEM_Y0 + ITEM_DY * 4 },
    data: { label: "Calendário", area: "com", link: "/calendario-eventos" },
    style: itemStyle(C.com),
  },

  // COM → Precificação group
  {
    id: "grp-precificacao",
    position: { x: GROUP_X.precificacao, y: GROUP_Y },
    data: { label: "💰 Precificação e Propostas", area: "com" },
    style: groupStyle(),
  },
  {
    id: "com-frete",
    position: { x: GROUP_X.precificacao, y: ITEM_Y0 },
    data: { label: "Calcule Frete", area: "com", link: "/calculadora-frete" },
    style: itemStyle(C.com),
  },
  {
    id: "com-armazenagem",
    position: { x: GROUP_X.precificacao, y: ITEM_Y0 + ITEM_DY },
    data: { label: "Calcule Armazenagem", area: "com", link: "/calculadora-armazenagem" },
    style: itemStyle(C.com),
  },
  {
    id: "com-rotas",
    position: { x: GROUP_X.precificacao, y: ITEM_Y0 + ITEM_DY * 2 },
    data: { label: "Rotas", area: "com", link: "/rotas" },
    style: itemStyle(C.com),
  },
  {
    id: "com-proposta",
    position: { x: GROUP_X.precificacao, y: ITEM_Y0 + ITEM_DY * 3 },
    data: { label: "Proposta", area: "com", link: "/proposta" },
    style: itemStyle(C.com),
  },
  {
    id: "com-contrato",
    position: { x: GROUP_X.precificacao, y: ITEM_Y0 + ITEM_DY * 4 },
    data: { label: "Contrato", area: "com", link: "/contratos" },
    style: itemStyle(C.com),
  },

  // COM → Gestão group
  {
    id: "grp-gestao",
    position: { x: GROUP_X.gestao, y: GROUP_Y },
    data: { label: "📊 Gestão e Controle", area: "com" },
    style: groupStyle(),
  },
  {
    id: "com-metas",
    position: { x: GROUP_X.gestao, y: ITEM_Y0 },
    data: { label: "Metas", area: "com", link: "/metas" },
    style: itemStyle(C.com),
  },
  {
    id: "com-pipeline",
    position: { x: GROUP_X.gestao, y: ITEM_Y0 + ITEM_DY },
    data: { label: "Pipeline", area: "com", link: "/pipeline" },
    style: itemStyle(C.com),
  },
  {
    id: "com-dashboard",
    position: { x: GROUP_X.gestao, y: ITEM_Y0 + ITEM_DY * 2 },
    data: { label: "Dashboard", area: "com", link: "/dashboard" },
    style: itemStyle(C.com),
  },
  {
    id: "com-indicadores",
    position: { x: GROUP_X.gestao, y: ITEM_Y0 + ITEM_DY * 3 },
    data: { label: "Indicadores", area: "com", link: "/indicadores-vendas" },
    style: itemStyle(C.com),
  },
  {
    id: "com-relatorios",
    position: { x: GROUP_X.gestao, y: ITEM_Y0 + ITEM_DY * 4 },
    data: { label: "Relatórios", area: "com", link: "/relatorios" },
    style: itemStyle(C.com),
  },
  {
    id: "com-biblioteca",
    position: { x: GROUP_X.gestao, y: ITEM_Y0 + ITEM_DY * 5 },
    data: { label: "Biblioteca", area: "com", link: "/biblioteca" },
    style: itemStyle(C.com),
  },

  // ── Phase: CAC ──
  {
    id: "cac",
    position: { x: CAC_X, y: PHASE_Y },
    data: { label: "PÓS-VENDAS (CAC)", area: "cac" },
    style: phaseStyle(C.cac),
  },
  {
    id: "cac-pesquisas",
    position: { x: CAC_X - 10, y: CAC_ITEM_Y0 },
    data: { label: "Pesquisas", area: "cac", link: "/pesquisas" },
    style: itemStyle(C.cac),
  },
  {
    id: "cac-indicadores",
    position: { x: CAC_X - 10, y: CAC_ITEM_Y0 + ITEM_DY },
    data: { label: "Indicadores", area: "cac", link: "/indicadores-pos-vendas" },
    style: itemStyle(C.cac),
  },
];

// ── Edges ────────────────────────────────────────────────────────────────────
const mkEdge = (id: string, source: string, target: string, color: string, animated = false, dashed = false): Edge => ({
  id, source, target, animated,
  style: { stroke: color, ...(dashed ? { strokeDasharray: "5,5" } : {}) },
});

const defaultEdges: Edge[] = [
  // central → phases
  mkEdge("e-c-mkt", "central", "mkt", C.mkt.phase, true),
  mkEdge("e-c-com", "central", "com", C.com.phase, true),
  mkEdge("e-c-cac", "central", "cac", C.cac.phase, true),

  // flow
  mkEdge("e-mkt-com", "mkt", "com", "#a855f7", true, true),
  mkEdge("e-com-cac", "com", "cac", "#a855f7", true, true),

  // MKT items
  mkEdge("e-mkt-marketing",    "mkt", "mkt-marketing",    C.mkt.phase),
  mkEdge("e-mkt-indicadores",  "mkt", "mkt-indicadores",  C.mkt.phase),

  // COM → groups
  mkEdge("e-com-grp-pl",  "com", "grp-planejamento",  C.group.border),
  mkEdge("e-com-grp-re",  "com", "grp-relacionamento", C.group.border),
  mkEdge("e-com-grp-pr",  "com", "grp-precificacao",  C.group.border),
  mkEdge("e-com-grp-ge",  "com", "grp-gestao",        C.group.border),

  // Planejamento items
  mkEdge("e-pl-checklist",   "grp-planejamento", "com-checklist",   C.com.phase),
  mkEdge("e-pl-rfi",         "grp-planejamento", "com-rfi",         C.com.phase),
  mkEdge("e-pl-ata",         "grp-planejamento", "com-ata",         C.com.phase),
  mkEdge("e-pl-fluxograma",  "grp-planejamento", "com-fluxograma",  C.com.phase),

  // Relacionamento items
  mkEdge("e-re-clientes",    "grp-relacionamento", "com-clientes",    C.com.phase),
  mkEdge("e-re-bilaterais",  "grp-relacionamento", "com-bilaterais",  C.com.phase),
  mkEdge("e-re-segmentos",   "grp-relacionamento", "com-segmentos",   C.com.phase),
  mkEdge("e-re-eventos",     "grp-relacionamento", "com-eventos",     C.com.phase),
  mkEdge("e-re-calendario",  "grp-relacionamento", "com-calendario",  C.com.phase),

  // Precificação items
  mkEdge("e-pr-frete",       "grp-precificacao", "com-frete",       C.com.phase),
  mkEdge("e-pr-armazenagem", "grp-precificacao", "com-armazenagem", C.com.phase),
  mkEdge("e-pr-rotas",       "grp-precificacao", "com-rotas",       C.com.phase),
  mkEdge("e-pr-proposta",    "grp-precificacao", "com-proposta",    C.com.phase),
  mkEdge("e-pr-contrato",    "grp-precificacao", "com-contrato",    C.com.phase),

  // Gestão items
  mkEdge("e-ge-metas",       "grp-gestao", "com-metas",       C.com.phase),
  mkEdge("e-ge-pipeline",    "grp-gestao", "com-pipeline",    C.com.phase),
  mkEdge("e-ge-dashboard",   "grp-gestao", "com-dashboard",   C.com.phase),
  mkEdge("e-ge-indicadores", "grp-gestao", "com-indicadores", C.com.phase),
  mkEdge("e-ge-relatorios",  "grp-gestao", "com-relatorios",  C.com.phase),
  mkEdge("e-ge-biblioteca",  "grp-gestao", "com-biblioteca",  C.com.phase),

  // CAC items
  mkEdge("e-cac-pesquisas",    "cac", "cac-pesquisas",    C.cac.phase),
  mkEdge("e-cac-indicadores",  "cac", "cac-indicadores",  C.cac.phase),
];

// ── Component ────────────────────────────────────────────────────────────────
export default function FluxogramaComercial() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeArea, setNewNodeArea] = useState<string>("com");
  const [newNodeLink, setNewNodeLink] = useState("");

  const { data: savedFlow } = useQuery<{ nodes: Node[]; edges: Edge[] }>({
    queryKey: ["/api/flowchart"],
  });

  useEffect(() => {
    if (savedFlow && savedFlow.nodes && savedFlow.nodes.length > 0) {
      setNodes(savedFlow.nodes);
      setEdges(savedFlow.edges || []);
    }
  }, [savedFlow, setNodes, setEdges]);

  const saveFlowMutation = useMutation({
    mutationFn: (data: { nodes: Node[]; edges: Edge[] }) => apiRequest("POST", "/api/flowchart", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flowchart"] });
      toast({ title: "Fluxograma salvo com sucesso" });
    },
    onError: () => toast({ title: "Erro ao salvar fluxograma", variant: "destructive" }),
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const link = node.data?.link as string | undefined;
      if (link) navigate(link);
    },
    [navigate]
  );

  const handleSave = () => saveFlowMutation.mutate({ nodes, edges });

  const handleReset = () => {
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    toast({ title: "Fluxograma restaurado ao padrão" });
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;
    const colorsMap: Record<string, typeof C.mkt> = { mkt: C.mkt, com: C.com, cac: C.cac };
    const c = colorsMap[newNodeArea] || { border: "#6b7280", bg: "#e5e7eb", text: "#374151", phase: "#6b7280" };
    const newNode: Node = {
      id: `node-${Date.now()}`,
      position: { x: Math.random() * 400 + 400, y: Math.random() * 200 + 700 },
      data: { label: newNodeLabel, area: newNodeArea, link: newNodeLink || undefined },
      style: itemStyle(c),
    };
    setNodes((nds) => [...nds, newNode]);
    setDialogOpen(false);
    setNewNodeLabel("");
    setNewNodeLink("");
    toast({ title: "Nó adicionado" });
  };

  const handleDeleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "fluxograma-comercial.json"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Fluxograma exportado" });
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b flex-wrap shrink-0">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Fluxograma Comercial</h1>
            <p className="text-sm text-muted-foreground">Visualize e navegue pela jornada comercial completa</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} data-testid="button-add-node">
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteSelected} data-testid="button-delete-selected">
              <Trash2 className="h-4 w-4 mr-1" /> Excluir
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} data-testid="button-reset">
              <RotateCcw className="h-4 w-4 mr-1" /> Restaurar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} data-testid="button-export">
              <Download className="h-4 w-4 mr-1" /> Exportar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveFlowMutation.isPending} data-testid="button-save">
              <Save className="h-4 w-4 mr-1" /> Salvar
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const a = node.data?.area as string;
                return a === "mkt" ? C.mkt.phase : a === "cac" ? C.cac.phase : a === "central" ? C.central.phase : C.com.phase;
              }}
              maskColor="rgba(0,0,0,0.08)"
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Panel position="bottom-right" className="bg-card p-3 rounded-lg border shadow-sm">
              <div className="flex gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: C.mkt.phase }} />
                  <span>Pré-Vendas (MKT)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: C.com.phase }} />
                  <span>Vendas (COM)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: C.cac.phase }} />
                  <span>Pós-Vendas (CAC)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: C.group.bg, border: `1px solid ${C.group.border}` }} />
                  <span>Subgrupo</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Nó</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Nó</Label>
                <Input value={newNodeLabel} onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="Ex: Nova Ferramenta" data-testid="input-node-label" />
              </div>
              <div className="space-y-2">
                <Label>Área</Label>
                <Select value={newNodeArea} onValueChange={setNewNodeArea}>
                  <SelectTrigger data-testid="select-node-area"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mkt">Pré-Vendas (MKT)</SelectItem>
                    <SelectItem value="com">Vendas (COM)</SelectItem>
                    <SelectItem value="cac">Pós-Vendas (CAC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Link (opcional)</Label>
                <Input value={newNodeLink} onChange={(e) => setNewNodeLink(e.target.value)}
                  placeholder="Ex: /clientes" data-testid="input-node-link" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddNode} data-testid="button-confirm-add">Adicionar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
