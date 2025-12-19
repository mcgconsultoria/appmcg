import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, FileEdit, Trash2, Eye, Download, Loader2, Users, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { MeetingRecord, MeetingActionItem, Client, Company, MeetingObjective } from "@shared/schema";
import { ClientCombobox } from "@/components/ClientCombobox";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Mail } from "lucide-react";

interface Participant {
  name: string;
  email: string;
}

const defaultObjectives = [
  "Visita Comercial",
  "Apresentacao Indicadores",
  "Visita Operacional",
];

const meetingTypes = [
  { value: "client", label: "Reuniao com Cliente" },
  { value: "internal", label: "Reuniao Interna" },
  { value: "strategic", label: "Planejamento Estrategico" },
];

const meetingModes = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
];

const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  finalized: "Finalizada",
  sent: "Enviada",
};

const statusColors: Record<string, string> = {
  draft: "secondary",
  finalized: "default",
  sent: "outline",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

const actionStatusLabels: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluido",
  cancelled: "Cancelado",
};

export default function MeetingRecords() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MeetingRecord | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    meetingType: "client",
    meetingMode: "presencial",
    meetingLocation: "",
    meetingDate: new Date().toISOString().split("T")[0],
    clientId: "",
    summary: "",
    decisions: "",
    nextSteps: "",
    nextReviewDate: "",
    pipelineStage: "",
  });

  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [newObjective, setNewObjective] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([{ name: "", email: "" }]);

  const [actionItems, setActionItems] = useState<Array<{
    description: string;
    responsible: string;
    responsibleEmail: string;
    dueDate: string;
    priority: string;
  }>>([]);

  const { data: meetingRecords, isLoading } = useQuery<MeetingRecord[]>({
    queryKey: ["/api/meeting-records"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: company } = useQuery<Company>({
    queryKey: ["/api/company"],
  });

  const { data: meetingObjectivesData } = useQuery<MeetingObjective[]>({
    queryKey: ["/api/meeting-objectives"],
  });

  const availableObjectives = [
    ...defaultObjectives,
    ...(meetingObjectivesData?.filter(o => o.isCustom).map(o => o.label) || []),
  ];

  const createObjectiveMutation = useMutation({
    mutationFn: async (label: string) => {
      const res = await apiRequest("POST", "/api/meeting-objectives", { label });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-objectives"] });
    },
  });

  const addParticipant = () => {
    setParticipants([...participants, { name: "", email: "" }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const handleAddObjective = () => {
    if (newObjective.trim() && !availableObjectives.includes(newObjective.trim())) {
      createObjectiveMutation.mutate(newObjective.trim());
      setSelectedObjectives([...selectedObjectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const toggleObjective = (objective: string) => {
    if (selectedObjectives.includes(objective)) {
      setSelectedObjectives(selectedObjectives.filter(o => o !== objective));
    } else {
      setSelectedObjectives([...selectedObjectives, objective]);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/meeting-records", data);
      return res.json();
    },
    onSuccess: async (newRecord) => {
      for (const item of actionItems) {
        if (item.description.trim()) {
          await apiRequest("POST", `/api/meeting-records/${newRecord.id}/action-items`, {
            ...item,
            dueDate: item.dueDate ? new Date(item.dueDate).toISOString() : null,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-records"] });
      toast({ title: "Ata criada com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar ata", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/meeting-records/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-records"] });
      toast({ title: "Ata atualizada com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar ata", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/meeting-records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-records"] });
      toast({ title: "Ata excluida com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir ata", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      meetingType: "client",
      meetingMode: "presencial",
      meetingLocation: "",
      meetingDate: new Date().toISOString().split("T")[0],
      clientId: "",
      summary: "",
      decisions: "",
      nextSteps: "",
      nextReviewDate: "",
      pipelineStage: "",
    });
    setSelectedObjectives([]);
    setParticipants([{ name: "", email: "" }]);
    setActionItems([]);
    setSelectedRecord(null);
    setIsViewMode(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validParticipants = participants.filter(p => p.name.trim() || p.email.trim());
    
    const payload = {
      ...formData,
      companyId: 1,
      meetingDate: new Date(formData.meetingDate).toISOString(),
      clientId: formData.clientId && formData.clientId !== "none" ? parseInt(formData.clientId) : null,
      nextReviewDate: formData.nextReviewDate ? new Date(formData.nextReviewDate).toISOString() : null,
      participants: JSON.stringify(validParticipants),
      selectedObjectives: JSON.stringify(selectedObjectives),
    };

    if (selectedRecord) {
      updateMutation.mutate({ id: selectedRecord.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const addActionItem = () => {
    setActionItems([
      ...actionItems,
      { description: "", responsible: "", responsibleEmail: "", dueDate: "", priority: "medium" },
    ]);
  };

  const updateActionItem = (index: number, field: string, value: string) => {
    const updated = [...actionItems];
    updated[index] = { ...updated[index], [field]: value };
    setActionItems(updated);
  };

  const removeActionItem = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const openEditDialog = (record: MeetingRecord) => {
    setSelectedRecord(record);
    setFormData({
      title: record.title,
      meetingType: record.meetingType || "client",
      meetingMode: (record as any).meetingMode || "presencial",
      meetingLocation: (record as any).meetingLocation || "",
      meetingDate: record.meetingDate ? new Date(record.meetingDate).toISOString().split("T")[0] : "",
      clientId: record.clientId?.toString() || "",
      summary: record.summary || "",
      decisions: record.decisions || "",
      nextSteps: record.nextSteps || "",
      nextReviewDate: record.nextReviewDate ? new Date(record.nextReviewDate).toISOString().split("T")[0] : "",
      pipelineStage: record.pipelineStage || "",
    });
    
    try {
      const parsedParticipants = record.participants ? JSON.parse(record.participants) : [];
      setParticipants(parsedParticipants.length > 0 ? parsedParticipants : [{ name: "", email: "" }]);
    } catch {
      setParticipants([{ name: record.participants || "", email: "" }]);
    }
    
    try {
      const parsedObjectives = (record as any).selectedObjectives ? JSON.parse((record as any).selectedObjectives) : [];
      setSelectedObjectives(parsedObjectives);
    } catch {
      setSelectedObjectives([]);
    }
    
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const getClientName = (clientId: number | null) => {
    if (!clientId) return "-";
    const client = clients?.find(c => c.id === clientId);
    return client?.name || "-";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Ata Plano de Acao</h1>
          <p className="text-muted-foreground">Registre reunioes e acompanhe planos de acao</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-meeting">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ata
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRecord ? "Editar Ata" : "Nova Ata de Reuniao"}</DialogTitle>
              <DialogDescription>
                Registre os detalhes da reuniao e defina acoes
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titulo da Reuniao</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Alinhamento comercial Q1"
                    required
                    data-testid="input-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingType">Tipo de Reuniao</Label>
                  <Select
                    value={formData.meetingType}
                    onValueChange={(value) => setFormData({ ...formData, meetingType: value })}
                  >
                    <SelectTrigger data-testid="select-meeting-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meetingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingMode">Modalidade</Label>
                  <Select
                    value={formData.meetingMode}
                    onValueChange={(value) => setFormData({ ...formData, meetingMode: value })}
                  >
                    <SelectTrigger data-testid="select-meeting-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {meetingModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.meetingMode === "presencial" && (
                  <div className="space-y-2">
                    <Label htmlFor="meetingLocation">Local da Reuniao</Label>
                    <Input
                      id="meetingLocation"
                      value={formData.meetingLocation}
                      onChange={(e) => setFormData({ ...formData, meetingLocation: e.target.value })}
                      placeholder="Ex: Escritorio central, Sala de reunioes 3"
                      data-testid="input-meeting-location"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="meetingDate">Data da Reuniao</Label>
                  <Input
                    id="meetingDate"
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    required
                    data-testid="input-meeting-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente (opcional)</Label>
                  <ClientCombobox
                    clients={clients || []}
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    placeholder="Buscar cliente..."
                    allowNone={true}
                    showAddButton={true}
                    data-testid="select-client"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <Label>Participantes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addParticipant} data-testid="button-add-participant">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Participante
                  </Button>
                </div>
                {participants.map((participant, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Nome"
                      value={participant.name}
                      onChange={(e) => updateParticipant(index, "name", e.target.value)}
                      className="flex-1"
                      data-testid={`input-participant-name-${index}`}
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={participant.email}
                      onChange={(e) => updateParticipant(index, "email", e.target.value)}
                      className="flex-1"
                      data-testid={`input-participant-email-${index}`}
                    />
                    {participants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeParticipant(index)}
                        data-testid={`button-remove-participant-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label>Objetivos da Reuniao</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {availableObjectives.map((objective) => (
                    <div key={objective} className="flex items-center space-x-2">
                      <Checkbox
                        id={`objective-${objective}`}
                        checked={selectedObjectives.includes(objective)}
                        onCheckedChange={() => toggleObjective(objective)}
                        data-testid={`checkbox-objective-${objective.replace(/\s/g, "-")}`}
                      />
                      <label htmlFor={`objective-${objective}`} className="text-sm cursor-pointer">
                        {objective}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar novo objetivo..."
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddObjective())}
                    data-testid="input-new-objective"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddObjective}
                    disabled={!newObjective.trim()}
                    data-testid="button-add-objective"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Resumo / Pauta</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Resumo dos pontos discutidos"
                  rows={4}
                  data-testid="input-summary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decisions">Decisoes Tomadas</Label>
                <Textarea
                  id="decisions"
                  value={formData.decisions}
                  onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
                  placeholder="Quais decisoes foram tomadas nesta reuniao?"
                  rows={3}
                  data-testid="input-decisions"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <Label>Plano de Acao</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addActionItem} data-testid="button-add-action">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Acao
                  </Button>
                </div>
                {actionItems.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-2">
                        <Input
                          placeholder="Descricao da acao"
                          value={item.description}
                          onChange={(e) => updateActionItem(index, "description", e.target.value)}
                          data-testid={`input-action-description-${index}`}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Responsavel"
                          value={item.responsible}
                          onChange={(e) => updateActionItem(index, "responsible", e.target.value)}
                          data-testid={`input-action-responsible-${index}`}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Email"
                          type="email"
                          value={item.responsibleEmail}
                          onChange={(e) => updateActionItem(index, "responsibleEmail", e.target.value)}
                          data-testid={`input-action-email-${index}`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) => updateActionItem(index, "dueDate", e.target.value)}
                          data-testid={`input-action-due-date-${index}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeActionItem(index)}
                          data-testid={`button-remove-action-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nextSteps">Proximos Passos</Label>
                  <Textarea
                    id="nextSteps"
                    value={formData.nextSteps}
                    onChange={(e) => setFormData({ ...formData, nextSteps: e.target.value })}
                    placeholder="Quais sao os proximos passos?"
                    rows={2}
                    data-testid="input-next-steps"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextReviewDate">Data da Proxima Reuniao</Label>
                  <Input
                    id="nextReviewDate"
                    type="date"
                    value={formData.nextReviewDate}
                    onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
                    data-testid="input-next-review-date"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-meeting">
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    selectedRecord ? "Atualizar" : "Salvar Ata"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!meetingRecords?.length ? (
        <Card className="p-12 text-center">
          <FileEdit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma ata registrada</h3>
          <p className="text-muted-foreground mb-4">
            Crie sua primeira ata de reuniao para documentar decisoes e planos de acao
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Ata
          </Button>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Atas Registradas</CardTitle>
            <CardDescription>{meetingRecords.length} ata(s) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetingRecords.map((record) => (
                  <TableRow key={record.id} data-testid={`row-meeting-${record.id}`}>
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell>
                      {meetingTypes.find(t => t.value === record.meetingType)?.label || record.meetingType}
                    </TableCell>
                    <TableCell>
                      {record.meetingDate ? format(new Date(record.meetingDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                    </TableCell>
                    <TableCell>{getClientName(record.clientId)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[record.status || "draft"] as any}>
                        {statusLabels[record.status || "draft"]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-view-meeting-${record.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none">
                            <div className="print:p-8" id={`print-ata-${record.id}`}>
                              <div className="flex items-start justify-between mb-6 pb-4 border-b">
                                {company?.logo ? (
                                  <img src={company.logo} alt="Logo" className="h-16 w-auto object-contain" />
                                ) : (
                                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="text-right">
                                  <h2 className="text-xl font-bold">{company?.name || "MCG Consultoria"}</h2>
                                  <p className="text-sm text-muted-foreground">{company?.cnpj}</p>
                                </div>
                              </div>
                              <h1 className="text-2xl font-bold mb-2">{record.title}</h1>
                              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div><strong>Data:</strong> {record.meetingDate ? format(new Date(record.meetingDate), "dd/MM/yyyy") : "-"}</div>
                                <div><strong>Tipo:</strong> {meetingTypes.find(t => t.value === record.meetingType)?.label}</div>
                                <div><strong>Modalidade:</strong> {meetingModes.find(m => m.value === (record as any).meetingMode)?.label || "Presencial"}</div>
                                {(record as any).meetingMode === "presencial" && (record as any).meetingLocation && (
                                  <div><strong>Local:</strong> {(record as any).meetingLocation}</div>
                                )}
                                <div><strong>Cliente:</strong> {getClientName(record.clientId)}</div>
                                <div>
                                  <strong>Participantes:</strong>
                                  {(() => {
                                    try {
                                      const parsed = JSON.parse(record.participants || "[]");
                                      if (Array.isArray(parsed) && parsed.length > 0) {
                                        return parsed.map((p: {name: string, email: string}, i: number) => (
                                          <span key={i}> {p.name}{p.email ? ` (${p.email})` : ""}{i < parsed.length - 1 ? "," : ""}</span>
                                        ));
                                      }
                                      return " -";
                                    } catch {
                                      return ` ${record.participants || "-"}`;
                                    }
                                  })()}
                                </div>
                              </div>
                              {(() => {
                                try {
                                  const objectives = JSON.parse((record as any).selectedObjectives || "[]");
                                  if (Array.isArray(objectives) && objectives.length > 0) {
                                    return (
                                      <div className="mb-4">
                                        <h3 className="font-semibold mb-1">Objetivos</h3>
                                        <ul className="text-sm list-disc list-inside">
                                          {objectives.map((obj: string, i: number) => (
                                            <li key={i}>{obj}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  }
                                  return null;
                                } catch {
                                  return record.objectives ? (
                                    <div className="mb-4">
                                      <h3 className="font-semibold mb-1">Objetivos</h3>
                                      <p className="text-sm whitespace-pre-wrap">{record.objectives}</p>
                                    </div>
                                  ) : null;
                                }
                              })()}
                              {record.summary && (
                                <div className="mb-4">
                                  <h3 className="font-semibold mb-1">Resumo / Pauta</h3>
                                  <p className="text-sm whitespace-pre-wrap">{record.summary}</p>
                                </div>
                              )}
                              {record.decisions && (
                                <div className="mb-4">
                                  <h3 className="font-semibold mb-1">Decisoes Tomadas</h3>
                                  <p className="text-sm whitespace-pre-wrap">{record.decisions}</p>
                                </div>
                              )}
                              {record.nextSteps && (
                                <div className="mb-4">
                                  <h3 className="font-semibold mb-1">Proximos Passos</h3>
                                  <p className="text-sm whitespace-pre-wrap">{record.nextSteps}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end gap-2 print:hidden">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  window.open(`/api/meeting-records/${record.id}/pdf`, "_blank");
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Baixar PDF
                              </Button>
                              <Button variant="outline" onClick={() => window.print()}>
                                <Download className="h-4 w-4 mr-2" />
                                Imprimir
                              </Button>
                              <Button 
                                variant="default"
                                onClick={async () => {
                                  try {
                                    const res = await apiRequest("POST", `/api/meeting-records/${record.id}/send-email`);
                                    const data = await res.json();
                                    if (data.emailServiceNotConfigured) {
                                      toast({ 
                                        title: "Servico de email nao configurado", 
                                        description: "Configure o RESEND_API_KEY ou SENDGRID_API_KEY para enviar emails.",
                                        variant: "destructive" 
                                      });
                                    } else {
                                      toast({ title: data.message });
                                      queryClient.invalidateQueries({ queryKey: ["/api/meeting-records"] });
                                    }
                                  } catch (error: any) {
                                    const message = error?.message || "Erro ao enviar email";
                                    toast({ title: message, variant: "destructive" });
                                  }
                                }}
                                data-testid={`button-send-email-${record.id}`}
                              >
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar por Email
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(record)}
                          data-testid={`button-edit-meeting-${record.id}`}
                        >
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(record.id)}
                          data-testid={`button-delete-meeting-${record.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
