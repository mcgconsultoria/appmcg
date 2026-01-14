import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreVertical,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  Gift,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DiagnosticLead } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  contatado: { label: "Contatado", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  interessado: { label: "Interessado", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  em_negociação: { label: "Em Negociação", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  convertido: { label: "Convertido", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  perdido: { label: "Perdido", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
};

const maturityConfig = {
  iniciante: { label: "Iniciante", color: "text-red-600", icon: XCircle },
  basico: { label: "Basico", color: "text-orange-600", icon: AlertTriangle },
  intermediario: { label: "Intermediário", color: "text-yellow-600", icon: Clock },
  avancado: { label: "Avancado", color: "text-green-600", icon: CheckCircle },
};

const pipelineColumns = [
  { status: "novo", label: "Novos Leads", icon: Users },
  { status: "contatado", label: "Contatados", icon: Phone },
  { status: "interessado", label: "Interessados", icon: Target },
  { status: "em_negociação", label: "Em Negociação", icon: TrendingUp },
  { status: "convertido", label: "Convertidos", icon: CheckCircle },
];

export default function AdminDiagnósticoLeads() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMaturity, setFilterMaturity] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<DiagnosticLead | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: "",
    notes: "",
    followUpDate: "",
    assignedTo: "",
  });

  const handleGeneratePilotInvite = (lead: DiagnosticLead) => {
    const params = new URLSearchParams({
      company: lead.company || "",
      contact: lead.name,
      segment: lead.segment || "",
    });
    setEditDialogOpen(false);
    setLocation(`/admin/campanha-piloto?${params.toString()}`);
  };

  const { data: leads = [], isLoading, refetch } = useQuery<DiagnosticLead[]>({
    queryKey: ["/api/diagnostic-leads"],
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DiagnosticLead> }) => {
      const res = await apiRequest("PATCH", `/api/diagnostic-leads/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostic-leads"] });
      toast({ title: "Sucesso", description: "Lead atualizado com sucesso." });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar lead.", variant: "destructive" });
    },
  });

  const handleStatusChange = (lead: DiagnosticLead, newStatus: string) => {
    updateLead.mutate({ id: lead.id, data: { status: newStatus } });
  };

  const handleEditSubmit = () => {
    if (!selectedLead) return;
    updateLead.mutate({
      id: selectedLead.id,
      data: {
        status: editData.status,
        notes: editData.notes || null,
        followUpDate: editData.followUpDate ? new Date(editData.followUpDate) : null,
        assignedTo: editData.assignedTo || null,
      },
    });
  };

  const openEditDialog = (lead: DiagnosticLead) => {
    setSelectedLead(lead);
    setEditData({
      status: lead.status || "novo",
      notes: lead.notes || "",
      followUpDate: lead.followUpDate ? format(new Date(lead.followUpDate), "yyyy-MM-dd") : "",
      assignedTo: lead.assignedTo || "",
    });
    setEditDialogOpen(true);
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesMaturity = filterMaturity === "all" || lead.maturityLevel === filterMaturity;
    return matchesSearch && matchesMaturity;
  });

  const getLeadsByStatus = (status: string) =>
    filteredLeads.filter((lead) => (lead.status || "novo") === status);

  const stats = {
    total: leads.length,
    novo: leads.filter((l) => (l.status || "novo") === "novo").length,
    convertido: leads.filter((l) => l.status === "convertido").length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.percentage, 0) / leads.length) : 0,
  };

  if (isLoading) {
    return (
      <AppLayout title="Admin MCG">
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Admin MCG">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Leads do Diagnóstico</h1>
            <p className="text-muted-foreground">
              Gerencie os leads capturados pelo diagnóstico comercial
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh-leads">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total de Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.novo}</p>
                  <p className="text-xs text-muted-foreground">Aguardando Contato</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.convertido}</p>
                  <p className="text-xs text-muted-foreground">Convertidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgScore}%</p>
                  <p className="text-xs text-muted-foreground">Score Medio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-leads"
            />
          </div>
          <Select value={filterMaturity} onValueChange={setFilterMaturity}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-maturity">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Maturidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="iniciante">Iniciante</SelectItem>
              <SelectItem value="basico">Basico</SelectItem>
              <SelectItem value="intermediário">Intermediario</SelectItem>
              <SelectItem value="avancado">Avancado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineColumns.map((column) => {
            const columnLeads = getLeadsByStatus(column.status);
            const ColumnIcon = column.icon;
            return (
              <div key={column.status} className="flex-shrink-0 w-[300px]">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <ColumnIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{column.label}</span>
                    </div>
                    <Badge variant="secondary">{columnLeads.length}</Badge>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {columnLeads.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum lead
                      </p>
                    ) : (
                      columnLeads.map((lead) => {
                        const maturity = maturityConfig[lead.maturityLevel as keyof typeof maturityConfig] || maturityConfig.iniciante;
                        const MaturityIcon = maturity.icon;
                        return (
                          <Card
                            key={lead.id}
                            className="cursor-pointer hover-elevate"
                            onClick={() => openEditDialog(lead)}
                            data-testid={`card-lead-${lead.id}`}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{lead.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                      <DropdownMenuItem
                                        key={key}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(lead, key);
                                        }}
                                      >
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                        Mover para {config.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <MaturityIcon className={`h-4 w-4 ${maturity.color}`} />
                                  <span className={`text-xs font-medium ${maturity.color}`}>
                                    {lead.percentage}%
                                  </span>
                                </div>
                                {lead.createdAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(lead.createdAt), "dd/MM", { locale: ptBR })}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>
              {selectedLead?.name} - {selectedLead?.company}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedLead.email}</span>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedLead.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{selectedLead.company || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Score: {selectedLead.percentage}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editData.status} onValueChange={(v) => setEditData((prev) => ({ ...prev, status: v }))}>
                  <SelectTrigger data-testid="select-lead-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Responsavel</Label>
                <Input
                  value={editData.assignedTo}
                  onChange={(e) => setEditData((prev) => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Nome do responsavel"
                  data-testid="input-lead-assigned"
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Follow-up</Label>
                <Input
                  type="date"
                  value={editData.followUpDate}
                  onChange={(e) => setEditData((prev) => ({ ...prev, followUpDate: e.target.value }))}
                  data-testid="input-lead-followup"
                />
              </div>

              <div className="space-y-2">
                <Label>Anotacoes</Label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Adicione anotacoes sobre o lead..."
                  rows={3}
                  data-testid="textarea-lead-notes"
                />
              </div>

              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleGeneratePilotInvite(selectedLead)}
                  data-testid="button-generate-pilot-invite"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Gerar Convite Piloto
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleEditSubmit} disabled={updateLead.isPending} data-testid="button-save-lead">
                    {updateLead.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
