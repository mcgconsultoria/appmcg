import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  HeadphonesIcon,
  Plus,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Ticket,
  PhoneCall,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SupportTicket, SupportTicketMessage } from "@shared/schema";

const ticketFormSchema = z.object({
  subject: z.string().min(1, "Assunto e obrigatorio"),
  description: z.string().min(1, "Descricao e obrigatoria"),
  category: z.string().min(1, "Categoria e obrigatoria"),
  priority: z.string().default("medium"),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

const categoryLabels: Record<string, string> = {
  suporte: "Suporte Tecnico",
  financeiro: "Financeiro",
  comercial: "Comercial",
  tecnico: "Tecnico",
};

const priorityLabels: Record<string, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

const statusLabels: Record<string, string> = {
  open: "Aberto",
  in_progress: "Em Andamento",
  waiting_customer: "Aguardando Cliente",
  resolved: "Resolvido",
  closed: "Fechado",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return <AlertCircle className="h-4 w-4" />;
    case "in_progress":
      return <Clock className="h-4 w-4" />;
    case "waiting_customer":
      return <MessageSquare className="h-4 w-4" />;
    case "resolved":
      return <CheckCircle2 className="h-4 w-4" />;
    case "closed":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Ticket className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
    case "in_progress":
      return "bg-blue-500/10 text-blue-600 border-blue-200";
    case "waiting_customer":
      return "bg-orange-500/10 text-orange-600 border-orange-200";
    case "resolved":
      return "bg-green-500/10 text-green-600 border-green-200";
    case "closed":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-muted";
    case "medium":
      return "bg-blue-500/10 text-blue-600";
    case "high":
      return "bg-orange-500/10 text-orange-600";
    case "urgent":
      return "bg-red-500/10 text-red-600";
    default:
      return "";
  }
};

export default function Support() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "",
      priority: "medium",
    },
  });

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  const { data: ticketMessages = [], isLoading: isLoadingMessages } = useQuery<SupportTicketMessage[]>({
    queryKey: ["/api/support-tickets", selectedTicket?.id, "messages"],
    enabled: !!selectedTicket,
  });

  const createMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      const response = await apiRequest("POST", "/api/support-tickets", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      toast({ title: "Chamado aberto com sucesso" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao abrir chamado", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!selectedTicket) return;
      const response = await apiRequest(
        "POST",
        `/api/support-tickets/${selectedTicket.id}/messages`,
        { message }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/support-tickets", selectedTicket?.id, "messages"],
      });
      setNewMessage("");
    },
    onError: () => {
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    },
  });

  const handleSubmit = (data: TicketFormData) => {
    createMutation.mutate(data);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  const WHATSAPP_NUMBER = "5511999999999";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-support-title">
              Suporte e Contato
            </h1>
            <p className="text-muted-foreground">
              Abra chamados e entre em contato com nossa equipe
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
              data-testid="button-whatsapp"
            >
              <SiWhatsapp className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-ticket">
              <Plus className="h-4 w-4 mr-2" />
              Novo Chamado
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-tickets">
                    {tickets.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Chamados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-open-tickets">
                    {openTickets.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Em Aberto</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-resolved-tickets">
                    {resolvedTickets.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Resolvidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <PhoneCall className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Contato Direto</p>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                    data-testid="link-whatsapp-direct"
                  >
                    Falar no WhatsApp
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5" />
                Meus Chamados
              </CardTitle>
              <CardDescription>
                Clique em um chamado para ver detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-8">
                  <HeadphonesIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum chamado</h3>
                  <p className="text-muted-foreground mb-4">
                    Voce ainda nao tem chamados abertos
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Abrir Chamado
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedTicket?.id === ticket.id
                            ? "bg-muted border-primary"
                            : "hover-elevate"
                        }`}
                        onClick={() => setSelectedTicket(ticket)}
                        data-testid={`ticket-item-${ticket.id}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {ticket.ticketNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(ticket.status || "open")}`}
                          >
                            {getStatusIcon(ticket.status || "open")}
                            <span className="ml-1">
                              {statusLabels[ticket.status || "open"]}
                            </span>
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-1">
                          {ticket.subject}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {categoryLabels[ticket.category || "suporte"]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {ticket.createdAt &&
                              format(new Date(ticket.createdAt), "dd/MM/yy", {
                                locale: ptBR,
                              })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {selectedTicket ? selectedTicket.subject : "Detalhes do Chamado"}
              </CardTitle>
              {selectedTicket && (
                <CardDescription className="flex items-center gap-2">
                  <span className="font-mono">{selectedTicket.ticketNumber}</span>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedTicket.status || "open")}
                  >
                    {statusLabels[selectedTicket.status || "open"]}
                  </Badge>
                  <Badge className={getPriorityColor(selectedTicket.priority || "medium")}>
                    {priorityLabels[selectedTicket.priority || "medium"]}
                  </Badge>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!selectedTicket ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Selecione um chamado para ver os detalhes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Descricao</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTicket.description || "Sem descricao"}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Mensagens</h4>
                    <ScrollArea className="h-[200px] pr-4">
                      {isLoadingMessages ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : ticketMessages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma mensagem ainda
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {ticketMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${
                                msg.userId === user?.id
                                  ? "bg-primary/10 ml-8"
                                  : "bg-muted mr-8"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <span className="text-xs text-muted-foreground mt-1 block">
                                {msg.createdAt &&
                                  format(new Date(msg.createdAt), "dd/MM HH:mm", {
                                    locale: ptBR,
                                  })}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        data-testid="input-ticket-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        data-testid="button-send-message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Chamado</DialogTitle>
              <DialogDescription>
                Descreva seu problema ou duvida para nossa equipe de suporte
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Resumo do problema"
                          data-testid="input-ticket-subject"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-ticket-category">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="suporte">Suporte Tecnico</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="comercial">Comercial</SelectItem>
                            <SelectItem value="tecnico">Tecnico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-ticket-priority">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descricao</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva detalhadamente seu problema ou duvida..."
                          rows={4}
                          data-testid="textarea-ticket-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-ticket"
                  >
                    {createMutation.isPending ? "Abrindo..." : "Abrir Chamado"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
