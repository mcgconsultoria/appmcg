import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Calendar, Trash2, Edit2, Loader2, Clock, MapPin, Users } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, parseISO, getWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CommercialEvent, Client } from "@shared/schema";
import { ClientCombobox } from "@/components/ClientCombobox";

const eventTypes = [
  { value: "meeting", label: "Reuniao", color: "bg-blue-500" },
  { value: "call", label: "Ligacao", color: "bg-green-500" },
  { value: "visit", label: "Visita", color: "bg-purple-500" },
  { value: "proposal", label: "Proposta", color: "bg-orange-500" },
  { value: "followup", label: "Follow-up", color: "bg-yellow-500" },
  { value: "other", label: "Outro", color: "bg-gray-500" },
];

const statusColors: Record<string, string> = {
  scheduled: "secondary",
  completed: "default",
  cancelled: "destructive",
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Realizado",
  cancelled: "Cancelado",
};

export default function CalendarPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CommercialEvent | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const [formData, setFormData] = useState({
    title: "",
    eventType: "meeting",
    startDate: "",
    startTime: "09:00",
    endTime: "10:00",
    clientId: "",
    location: "",
    description: "",
    pipelineStageId: "",
  });

  const { data: events, isLoading } = useQuery<CommercialEvent[]>({
    queryKey: ["/api/commercial-events"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/commercial-events", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commercial-events"] });
      toast({ title: "Evento criado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao criar evento", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/commercial-events/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commercial-events"] });
      toast({ title: "Evento atualizado com sucesso" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar evento", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/commercial-events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commercial-events"] });
      toast({ title: "Evento excluido com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir evento", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      eventType: "meeting",
      startDate: "",
      startTime: "09:00",
      endTime: "10:00",
      clientId: "",
      location: "",
      description: "",
      pipelineStageId: "",
    });
    setSelectedEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.startDate}T${formData.endTime}:00`);

    const payload = {
      title: formData.title,
      eventType: formData.eventType,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      clientId: formData.clientId && formData.clientId !== "none" ? parseInt(formData.clientId) : null,
      location: formData.location || null,
      description: formData.description || null,
      pipelineStageId: formData.pipelineStageId ? parseInt(formData.pipelineStageId) : null,
      companyId: 1,
    };

    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEditDialog = (event: CommercialEvent) => {
    setSelectedEvent(event);
    const startDate = event.startDate ? new Date(event.startDate) : new Date();
    const endDate = event.endDate ? new Date(event.endDate) : new Date();
    
    setFormData({
      title: event.title,
      eventType: event.eventType || "meeting",
      startDate: format(startDate, "yyyy-MM-dd"),
      startTime: format(startDate, "HH:mm"),
      endTime: format(endDate, "HH:mm"),
      clientId: event.clientId?.toString() || "",
      location: event.location || "",
      description: event.description || "",
      pipelineStageId: event.pipelineStageId?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const openNewEventDialog = (date: Date) => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      startDate: format(date, "yyyy-MM-dd"),
    }));
    setIsDialogOpen(true);
  };

  const getEventsForDay = (date: Date) => {
    return events?.filter(event => {
      if (!event.startDate) return false;
      return isSameDay(parseISO(event.startDate.toString()), date);
    }) || [];
  };

  const getClientName = (clientId: number | null) => {
    if (!clientId) return null;
    return clients?.find(c => c.id === clientId)?.name;
  };

  const getEventTypeInfo = (type: string | null) => {
    return eventTypes.find(t => t.value === type) || eventTypes[5];
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const navigateWeek = (direction: number) => {
    setCurrentWeekStart(addDays(currentWeekStart, direction * 7));
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Calendario Comercial</h1>
          <p className="text-muted-foreground">Planeje suas atividades comerciais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-event">
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
              <DialogDescription>
                Agende uma atividade comercial
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titulo</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Reuniao com cliente ABC"
                  required
                  data-testid="input-event-title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventType">Tipo</Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value) => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger data-testid="select-event-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente</Label>
                  <ClientCombobox
                    clients={clients || []}
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    placeholder="Buscar cliente..."
                    allowNone={true}
                    data-testid="select-client"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    data-testid="input-event-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    data-testid="input-start-time"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">Fim</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    data-testid="input-end-time"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Endereco ou link da reuniao"
                  data-testid="input-location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes do evento"
                  rows={3}
                  data-testid="input-description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-event">
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    selectedEvent ? "Atualizar" : "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} data-testid="button-prev-week">
              <span className="sr-only">Semana anterior</span>
              {"<"}
            </Button>
            <CardTitle className="text-lg">
              Semana {getWeek(currentWeekStart, { weekStartsOn: 1 })} - {format(currentWeekStart, "dd MMM", { locale: ptBR })} a {format(addDays(currentWeekStart, 6), "dd MMM yyyy", { locale: ptBR })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} data-testid="button-next-week">
              <span className="sr-only">Proxima semana</span>
              {">"}
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} data-testid="button-today">
            Hoje
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`min-h-[200px] border rounded-md p-2 ${isToday ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                      {format(day, "EEE", { locale: ptBR })}
                    </div>
                    <div className={`text-lg font-bold ${isToday ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                      const typeInfo = getEventTypeInfo(event.eventType);
                      return (
                        <div
                          key={event.id}
                          className="p-2 rounded-md bg-muted hover-elevate cursor-pointer text-xs"
                          onClick={() => openEditDialog(event)}
                          data-testid={`event-card-${event.id}`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <div className={`w-2 h-2 rounded-full ${typeInfo.color}`} />
                            <span className="font-medium truncate">{event.title}</span>
                          </div>
                          {event.startDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.startDate), "HH:mm")}
                            </div>
                          )}
                          {getClientName(event.clientId) && (
                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <Users className="h-3 w-3" />
                              <span className="truncate">{getClientName(event.clientId)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-6 text-xs opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => openNewEventDialog(day)}
                      data-testid={`button-add-event-${format(day, "yyyy-MM-dd")}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 flex-wrap">
        {eventTypes.map((type) => (
          <div key={type.value} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${type.color}`} />
            <span className="text-muted-foreground">{type.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
