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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
  Save,
  Download,
  RotateCcw,
  Plus,
  Megaphone,
  Users,
  HeadphonesIcon,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const nodeColors: Record<string, string> = {
  mkt: "#f97316",
  com: "#3b82f6",
  cac: "#22c55e",
  central: "#8b5cf6",
  ferramenta: "#6b7280",
};

const defaultNodes: Node[] = [
  {
    id: "central",
    type: "default",
    position: { x: 400, y: 50 },
    data: { label: "GESTAO COMERCIAL", area: "central" },
    style: {
      background: nodeColors.central,
      color: "white",
      border: "2px solid #7c3aed",
      borderRadius: "8px",
      padding: "16px 24px",
      fontWeight: "bold",
      fontSize: "14px",
    },
  },
  {
    id: "mkt",
    type: "default",
    position: { x: 100, y: 180 },
    data: { label: "PRE-VENDAS (MKT)", area: "mkt" },
    style: {
      background: nodeColors.mkt,
      color: "white",
      border: "2px solid #ea580c",
      borderRadius: "8px",
      padding: "12px 20px",
      fontWeight: "bold",
    },
  },
  {
    id: "com",
    type: "default",
    position: { x: 400, y: 180 },
    data: { label: "VENDAS (COM)", area: "com" },
    style: {
      background: nodeColors.com,
      color: "white",
      border: "2px solid #2563eb",
      borderRadius: "8px",
      padding: "12px 20px",
      fontWeight: "bold",
    },
  },
  {
    id: "cac",
    type: "default",
    position: { x: 700, y: 180 },
    data: { label: "POS-VENDAS (CAC)", area: "cac" },
    style: {
      background: nodeColors.cac,
      color: "white",
      border: "2px solid #16a34a",
      borderRadius: "8px",
      padding: "12px 20px",
      fontWeight: "bold",
    },
  },
  {
    id: "mkt-1",
    type: "default",
    position: { x: 50, y: 320 },
    data: { label: "Diagnostico Leads", area: "mkt", link: "/admin/diagnostico-leads" },
    style: {
      background: "#fed7aa",
      color: "#9a3412",
      border: "1px solid #fb923c",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "mkt-2",
    type: "default",
    position: { x: 50, y: 380 },
    data: { label: "Marketing", area: "mkt", link: "/marketing" },
    style: {
      background: "#fed7aa",
      color: "#9a3412",
      border: "1px solid #fb923c",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "mkt-3",
    type: "default",
    position: { x: 50, y: 440 },
    data: { label: "Indicadores Pre-Vendas", area: "mkt", link: "/indicadores-pre-vendas" },
    style: {
      background: "#fed7aa",
      color: "#9a3412",
      border: "1px solid #fb923c",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "mkt-4",
    type: "default",
    position: { x: 50, y: 500 },
    data: { label: "Pesquisas", area: "mkt", link: "/pesquisas" },
    style: {
      background: "#fed7aa",
      color: "#9a3412",
      border: "1px solid #fb923c",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "com-1",
    type: "default",
    position: { x: 350, y: 320 },
    data: { label: "Clientes", area: "com", link: "/clientes" },
    style: {
      background: "#bfdbfe",
      color: "#1e40af",
      border: "1px solid #60a5fa",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "com-2",
    type: "default",
    position: { x: 350, y: 380 },
    data: { label: "Pipeline", area: "com", link: "/pipeline" },
    style: {
      background: "#bfdbfe",
      color: "#1e40af",
      border: "1px solid #60a5fa",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "com-3",
    type: "default",
    position: { x: 350, y: 440 },
    data: { label: "Calendario", area: "com", link: "/calendário" },
    style: {
      background: "#bfdbfe",
      color: "#1e40af",
      border: "1px solid #60a5fa",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "com-4",
    type: "default",
    position: { x: 350, y: 500 },
    data: { label: "Ata Plano de Acao", area: "com", link: "/atas" },
    style: {
      background: "#bfdbfe",
      color: "#1e40af",
      border: "1px solid #60a5fa",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "com-5",
    type: "default",
    position: { x: 350, y: 560 },
    data: { label: "Indicadores Vendas", area: "com", link: "/indicadores-vendas" },
    style: {
      background: "#bfdbfe",
      color: "#1e40af",
      border: "1px solid #60a5fa",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "cac-1",
    type: "default",
    position: { x: 650, y: 320 },
    data: { label: "Checklist", area: "cac", link: "/checklist" },
    style: {
      background: "#bbf7d0",
      color: "#166534",
      border: "1px solid #4ade80",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "cac-2",
    type: "default",
    position: { x: 650, y: 380 },
    data: { label: "RFI", area: "cac", link: "/rfi" },
    style: {
      background: "#bbf7d0",
      color: "#166534",
      border: "1px solid #4ade80",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "cac-3",
    type: "default",
    position: { x: 650, y: 440 },
    data: { label: "Operacoes", area: "cac", link: "/operações" },
    style: {
      background: "#bbf7d0",
      color: "#166534",
      border: "1px solid #4ade80",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
  {
    id: "cac-4",
    type: "default",
    position: { x: 650, y: 500 },
    data: { label: "Indicadores Pos-Vendas", area: "cac", link: "/indicadores-pos-vendas" },
    style: {
      background: "#bbf7d0",
      color: "#166534",
      border: "1px solid #4ade80",
      borderRadius: "6px",
      padding: "8px 12px",
      fontSize: "12px",
    },
  },
];

const defaultEdges: Edge[] = [
  { id: "e-central-mkt", source: "central", target: "mkt", animated: true, style: { stroke: nodeColors.mkt } },
  { id: "e-central-com", source: "central", target: "com", animated: true, style: { stroke: nodeColors.com } },
  { id: "e-central-cac", source: "central", target: "cac", animated: true, style: { stroke: nodeColors.cac } },
  { id: "e-mkt-mkt1", source: "mkt", target: "mkt-1", style: { stroke: nodeColors.mkt } },
  { id: "e-mkt-mkt2", source: "mkt", target: "mkt-2", style: { stroke: nodeColors.mkt } },
  { id: "e-mkt-mkt3", source: "mkt", target: "mkt-3", style: { stroke: nodeColors.mkt } },
  { id: "e-mkt-mkt4", source: "mkt", target: "mkt-4", style: { stroke: nodeColors.mkt } },
  { id: "e-com-com1", source: "com", target: "com-1", style: { stroke: nodeColors.com } },
  { id: "e-com-com2", source: "com", target: "com-2", style: { stroke: nodeColors.com } },
  { id: "e-com-com3", source: "com", target: "com-3", style: { stroke: nodeColors.com } },
  { id: "e-com-com4", source: "com", target: "com-4", style: { stroke: nodeColors.com } },
  { id: "e-com-com5", source: "com", target: "com-5", style: { stroke: nodeColors.com } },
  { id: "e-cac-cac1", source: "cac", target: "cac-1", style: { stroke: nodeColors.cac } },
  { id: "e-cac-cac2", source: "cac", target: "cac-2", style: { stroke: nodeColors.cac } },
  { id: "e-cac-cac3", source: "cac", target: "cac-3", style: { stroke: nodeColors.cac } },
  { id: "e-cac-cac4", source: "cac", target: "cac-4", style: { stroke: nodeColors.cac } },
  { id: "e-mkt-com", source: "mkt", target: "com", animated: true, style: { stroke: "#a855f7", strokeDasharray: "5,5" } },
  { id: "e-com-cac", source: "com", target: "cac", animated: true, style: { stroke: "#a855f7", strokeDasharray: "5,5" } },
];

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
    mutationFn: async (data: { nodes: Node[]; edges: Edge[] }) => {
      return apiRequest("POST", "/api/flowchart", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flowchart"] });
      toast({ title: "Fluxograma salvo com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar fluxograma", variant: "destructive" });
    },
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const link = node.data?.link as string | undefined;
      if (link) {
        navigate(link);
      }
    },
    [navigate]
  );

  const handleSave = () => {
    saveFlowMutation.mutate({ nodes, edges });
  };

  const handleReset = () => {
    setNodes(defaultNodes);
    setEdges(defaultEdges);
    toast({ title: "Fluxograma restaurado ao padrao" });
  };

  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;

    const areaColor = nodeColors[newNodeArea] || nodeColors.ferramenta;
    const bgColors: Record<string, string> = {
      mkt: "#fed7aa",
      com: "#bfdbfe",
      cac: "#bbf7d0",
      central: "#e9d5ff",
      ferramenta: "#e5e7eb",
    };
    const textColors: Record<string, string> = {
      mkt: "#9a3412",
      com: "#1e40af",
      cac: "#166534",
      central: "#6b21a8",
      ferramenta: "#374151",
    };

    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "default",
      position: { x: Math.random() * 400 + 200, y: Math.random() * 200 + 300 },
      data: { label: newNodeLabel, area: newNodeArea, link: newNodeLink || undefined },
      style: {
        background: bgColors[newNodeArea],
        color: textColors[newNodeArea],
        border: `1px solid ${areaColor}`,
        borderRadius: "6px",
        padding: "8px 12px",
        fontSize: "12px",
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setDialogOpen(false);
    setNewNodeLabel("");
    setNewNodeLink("");
    toast({ title: "No adicionado" });
  };

  const handleDeleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fluxograma-comercial.json";
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Fluxograma exportado" });
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between gap-4 p-4 border-b flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">
              Fluxograma Comercial
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualize e personalize a jornada comercial da sua empresa
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              data-testid="button-add-node"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteSelected}
              data-testid="button-delete-selected"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restaurar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saveFlowMutation.isPending}
              data-testid="button-save"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
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
              nodeColor={(node) => nodeColors[node.data?.area as string] || "#6b7280"}
              maskColor="rgba(0,0,0,0.1)"
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Panel position="bottom-right" className="bg-card p-3 rounded-lg border shadow-sm">
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: nodeColors.mkt }} />
                  <span>Pre-Vendas</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: nodeColors.com }} />
                  <span>Vendas</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: nodeColors.cac }} />
                  <span>Pos-Vendas</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo No</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do No</Label>
                <Input
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="Ex: Nova Ferramenta"
                  data-testid="input-node-label"
                />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Select value={newNodeArea} onValueChange={setNewNodeArea}>
                  <SelectTrigger data-testid="select-node-area">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mkt">Pre-Vendas (MKT)</SelectItem>
                    <SelectItem value="com">Vendas (COM)</SelectItem>
                    <SelectItem value="cac">Pos-Vendas (CAC)</SelectItem>
                    <SelectItem value="ferramenta">Ferramenta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Link (opcional)</Label>
                <Input
                  value={newNodeLink}
                  onChange={(e) => setNewNodeLink(e.target.value)}
                  placeholder="Ex: /clientes"
                  data-testid="input-node-link"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNode} data-testid="button-confirm-add">
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
