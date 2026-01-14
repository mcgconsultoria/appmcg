import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { WhatsappJourneyStep, WhatsappConfig, WhatsappAgent, WhatsappConversation } from "@shared/schema";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  MessageSquare,
  Settings,
  Users,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Phone,
  Clock,
  ArrowRight,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Smartphone,
  ChevronRight,
  MessageCircle,
  Headphones,
  HelpCircle,
  LogOut,
  Menu,
  Save,
  ExternalLink,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { Link } from "wouter";

const stepTypeConfig = {
  welcome: { label: "Boas-vindas", icon: MessageCircle, color: "bg-green-500" },
  menu: { label: "Menu", icon: Menu, color: "bg-blue-500" },
  faq: { label: "FAQ", icon: HelpCircle, color: "bg-purple-500" },
  human: { label: "Atendente", icon: Headphones, color: "bg-orange-500" },
  goodbye: { label: "Encerramento", icon: LogOut, color: "bg-gray-500" },
};

function JourneyStepCard({ 
  step, 
  onEdit, 
  onDelete,
  children 
}: { 
  step: WhatsappJourneyStep; 
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}) {
  const config = stepTypeConfig[step.stepType as keyof typeof stepTypeConfig] || stepTypeConfig.menu;
  const Icon = config.icon;

  return (
    <div className="relative">
      <Card className={`border-l-4 ${step.isActive ? 'border-l-primary' : 'border-l-muted'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-md ${config.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <CardTitle className="text-sm font-medium">{step.name}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={step.isActive ? "default" : "secondary"} className="text-xs">
                {step.isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-step-${step.id}`}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={onDelete} data-testid={`button-delete-step-${step.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {step.description && (
            <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
          )}
          {step.messageTemplate && (
            <div className="bg-muted/50 rounded-md p-2 text-sm">
              <p className="line-clamp-2">{step.messageTemplate}</p>
            </div>
          )}
          {step.buttonOptions && step.buttonOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {step.buttonOptions.map((btn: { id: string; label: string }) => (
                <Badge key={btn.id} variant="outline" className="text-xs">
                  {btn.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {children && (
        <div className="ml-6 mt-2 pl-4 border-l-2 border-dashed border-muted space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

function JourneyMap({ steps }: { steps: WhatsappJourneyStep[] }) {
  const [editingStep, setEditingStep] = useState<WhatsappJourneyStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/whatsapp/journey-steps/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/journey-steps"] });
      toast({ title: "Etapa removida com sucesso" });
    },
  });

  const rootSteps = steps.filter(s => !s.parentId);
  const getChildren = (parentId: number) => steps.filter(s => s.parentId === parentId);

  const renderStep = (step: WhatsappJourneyStep): React.ReactNode => {
    const children = getChildren(step.id);
    return (
      <JourneyStepCard
        key={step.id}
        step={step}
        onEdit={() => setEditingStep(step)}
        onDelete={() => deleteMutation.mutate(step.id)}
      >
        {children.length > 0 && children.map(child => renderStep(child))}
      </JourneyStepCard>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Mapa da Jornada</h3>
          <p className="text-sm text-muted-foreground">
            Visualize e edite o fluxo de atendimento automatizado
          </p>
        </div>
        <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-journey-step">
              <Plus className="w-4 h-4 mr-2" />
              Nova Etapa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Etapa</DialogTitle>
            </DialogHeader>
            <StepForm 
              onSuccess={() => {
                setIsAddingStep(false);
                queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/journey-steps"] });
              }}
              existingSteps={steps}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {rootSteps.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">Nenhuma etapa configurada</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Comece adicionando a primeira etapa da jornada de atendimento
            </p>
            <Button onClick={() => setIsAddingStep(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Etapa
            </Button>
          </Card>
        ) : (
          rootSteps.sort((a, b) => (a.order || 0) - (b.order || 0)).map(step => renderStep(step))
        )}
      </div>

      {editingStep && (
        <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Etapa</DialogTitle>
            </DialogHeader>
            <StepForm 
              step={editingStep}
              existingSteps={steps}
              onSuccess={() => {
                setEditingStep(null);
                queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/journey-steps"] });
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StepForm({ 
  step, 
  existingSteps,
  onSuccess 
}: { 
  step?: WhatsappJourneyStep;
  existingSteps: WhatsappJourneyStep[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: step?.name || "",
    description: step?.description || "",
    stepType: step?.stepType || "menu",
    parentId: step?.parentId?.toString() || "",
    order: step?.order || 0,
    messageTemplate: step?.messageTemplate || "",
    triggerKeywords: step?.triggerKeywords?.join(", ") || "",
    isActive: step?.isActive !== false,
  });
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        triggerKeywords: data.triggerKeywords.split(",").map(k => k.trim()).filter(Boolean),
      };
      if (step) {
        return apiRequest("PATCH", `/api/admin/whatsapp/journey-steps/${step.id}`, payload);
      }
      return apiRequest("POST", "/api/admin/whatsapp/journey-steps", payload);
    },
    onSuccess: () => {
      toast({ title: step ? "Etapa atualizada" : "Etapa criada com sucesso" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Erro ao salvar etapa", variant: "destructive" });
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Nome da Etapa</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Menu Principal"
            data-testid="input-step-name"
          />
        </div>

        <div>
          <Label htmlFor="stepType">Tipo</Label>
          <Select value={formData.stepType} onValueChange={(v) => setFormData({ ...formData, stepType: v })}>
            <SelectTrigger data-testid="select-step-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(stepTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className="w-4 h-4" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="parentId">Etapa Pai (opcional)</Label>
          <Select value={formData.parentId} onValueChange={(v) => setFormData({ ...formData, parentId: v })}>
            <SelectTrigger data-testid="select-parent-step">
              <SelectValue placeholder="Nenhuma (etapa raiz)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhuma (etapa raiz)</SelectItem>
              {existingSteps.filter(s => s.id !== step?.id).map(s => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Descricao</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Breve descricao da etapa"
            data-testid="input-step-description"
          />
        </div>

        <div>
          <Label htmlFor="messageTemplate">Mensagem</Label>
          <Textarea
            id="messageTemplate"
            value={formData.messageTemplate}
            onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
            placeholder="Mensagem que sera enviada nesta etapa..."
            rows={3}
            data-testid="textarea-step-message"
          />
        </div>

        <div>
          <Label htmlFor="triggerKeywords">Palavras-chave (separadas por virgula)</Label>
          <Input
            id="triggerKeywords"
            value={formData.triggerKeywords}
            onChange={(e) => setFormData({ ...formData, triggerKeywords: e.target.value })}
            placeholder="ola, oi, bom dia, ajuda"
            data-testid="input-step-keywords"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isActive">Etapa Ativa</Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
            data-testid="switch-step-active"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-save-step">
        <Save className="w-4 h-4 mr-2" />
        {mutation.isPending ? "Salvando..." : "Salvar Etapa"}
      </Button>
    </form>
  );
}

function ConfigSection() {
  const { data: config, isLoading } = useQuery<WhatsappConfig>({
    queryKey: ["/api/admin/whatsapp/config"],
  });

  const [formData, setFormData] = useState({
    phoneNumber: "",
    businessName: "MCG Consultoria",
    provider: "aisensy",
    apiKey: "",
    welcomeMessage: "Ola! Bem-vindo a MCG Consultoria. Como posso ajudar?",
    businessHoursStart: "08:00",
    businessHoursEnd: "18:00",
    outsideHoursMessage: "Estamos fora do horario de atendimento. Retornaremos em breve!",
    isActive: true,
  });
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (config?.id) {
        return apiRequest("PATCH", `/api/admin/whatsapp/config/${config.id}`, data);
      }
      return apiRequest("POST", "/api/admin/whatsapp/config", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/config"] });
      toast({ title: "Configuracoes salvas com sucesso" });
    },
  });

  // Update form when config loads
  if (config && formData.phoneNumber !== config.phoneNumber) {
    setFormData({
      phoneNumber: config.phoneNumber || "",
      businessName: config.businessName || "MCG Consultoria",
      provider: config.provider || "aisensy",
      apiKey: config.apiKey || "",
      welcomeMessage: config.welcomeMessage || "",
      businessHoursStart: config.businessHoursStart || "08:00",
      businessHoursEnd: config.businessHoursEnd || "18:00",
      outsideHoursMessage: config.outsideHoursMessage || "",
      isActive: config.isActive !== false,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Configuracao WhatsApp Business API</h3>
          <p className="text-sm text-muted-foreground">
            Configure sua conta de WhatsApp Business para atendimento automatizado
          </p>
        </div>
        <a 
          href="https://aisensy.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Abrir AiSensy <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phoneNumber">Numero WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+55 41 99999-9999"
                  data-testid="input-whatsapp-phone"
                />
              </div>

              <div>
                <Label htmlFor="businessName">Nome do Negocio</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="MCG Consultoria"
                  data-testid="input-business-name"
                />
              </div>

              <div>
                <Label htmlFor="provider">Provedor API</Label>
                <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
                  <SelectTrigger data-testid="select-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aisensy">AiSensy (Gratuito)</SelectItem>
                    <SelectItem value="360dialog">360Dialog</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="apiKey">Chave API</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Sua chave API do provedor"
                  data-testid="input-api-key"
                />
              </div>

              <div>
                <Label htmlFor="businessHoursStart">Horario Inicio</Label>
                <Input
                  id="businessHoursStart"
                  type="time"
                  value={formData.businessHoursStart}
                  onChange={(e) => setFormData({ ...formData, businessHoursStart: e.target.value })}
                  data-testid="input-hours-start"
                />
              </div>

              <div>
                <Label htmlFor="businessHoursEnd">Horario Fim</Label>
                <Input
                  id="businessHoursEnd"
                  type="time"
                  value={formData.businessHoursEnd}
                  onChange={(e) => setFormData({ ...formData, businessHoursEnd: e.target.value })}
                  data-testid="input-hours-end"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
              <Textarea
                id="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                rows={2}
                data-testid="textarea-welcome-message"
              />
            </div>

            <div>
              <Label htmlFor="outsideHoursMessage">Mensagem Fora do Horario</Label>
              <Textarea
                id="outsideHoursMessage"
                value={formData.outsideHoursMessage}
                onChange={(e) => setFormData({ ...formData, outsideHoursMessage: e.target.value })}
                rows={2}
                data-testid="textarea-outside-hours"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">WhatsApp Ativo</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
                data-testid="switch-whatsapp-active"
              />
            </div>

            <Button type="submit" disabled={mutation.isPending} data-testid="button-save-config">
              <Save className="w-4 h-4 mr-2" />
              {mutation.isPending ? "Salvando..." : "Salvar Configuracoes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Como Integrar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Criar conta no AiSensy (Gratuito)</h4>
            <p className="text-sm text-muted-foreground">
              Acesse aisensy.com e crie uma conta gratuita. O plano free permite chatbot e multi-agente.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">2. Verificar negocio no Meta Business</h4>
            <p className="text-sm text-muted-foreground">
              O AiSensy guiara voce pelo processo de verificacao da empresa no Meta Business Manager.
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">3. Configurar numero WhatsApp</h4>
            <p className="text-sm text-muted-foreground">
              Conecte o numero de telefone da MCG (deve ser dedicado ao WhatsApp Business).
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium">4. Copiar chave API</h4>
            <p className="text-sm text-muted-foreground">
              Apos aprovacao, copie a chave API do painel AiSensy e cole aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AgentsSection() {
  const { data: agents, isLoading } = useQuery<WhatsappAgent[]>({
    queryKey: ["/api/admin/whatsapp/agents"],
  });
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/whatsapp/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/agents"] });
      toast({ title: "Agente removido" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Agentes de Atendimento</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie a equipe que atendera os clientes via WhatsApp
          </p>
        </div>
        <Dialog open={isAddingAgent} onOpenChange={setIsAddingAgent}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-agent">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Agente</DialogTitle>
            </DialogHeader>
            <AgentForm onSuccess={() => {
              setIsAddingAgent(false);
              queryClient.invalidateQueries({ queryKey: ["/api/admin/whatsapp/agents"] });
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents?.map(agent => (
          <Card key={agent.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${agent.isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-muted-foreground">{agent.email}</p>
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => deleteMutation.mutate(agent.id)}
                  data-testid={`button-delete-agent-${agent.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Badge variant={agent.isAvailable ? "default" : "secondary"}>
                  {agent.isAvailable ? "Disponivel" : "Indisponivel"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {agent.currentChatCount || 0}/{agent.maxConcurrentChats || 5} chats
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!agents || agents.length === 0) && (
          <Card className="col-span-full p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="font-medium mb-2">Nenhum agente cadastrado</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione agentes para atender os clientes quando o bot precisar de ajuda humana
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function AgentForm({ agent, onSuccess }: { agent?: WhatsappAgent; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: agent?.name || "",
    email: agent?.email || "",
    phone: agent?.phone || "",
    isAvailable: agent?.isAvailable !== false,
    maxConcurrentChats: agent?.maxConcurrentChats || 5,
  });
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (agent) {
        return apiRequest("PATCH", `/api/admin/whatsapp/agents/${agent.id}`, data);
      }
      return apiRequest("POST", "/api/admin/whatsapp/agents", data);
    },
    onSuccess: () => {
      toast({ title: agent ? "Agente atualizado" : "Agente criado com sucesso" });
      onSuccess();
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
      <div>
        <Label htmlFor="agentName">Nome</Label>
        <Input
          id="agentName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome do agente"
          data-testid="input-agent-name"
        />
      </div>
      <div>
        <Label htmlFor="agentEmail">Email</Label>
        <Input
          id="agentEmail"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="email@exemplo.com"
          data-testid="input-agent-email"
        />
      </div>
      <div>
        <Label htmlFor="agentPhone">Telefone (opcional)</Label>
        <Input
          id="agentPhone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+55 41 99999-9999"
          data-testid="input-agent-phone"
        />
      </div>
      <div>
        <Label htmlFor="maxChats">Max. Chats Simultaneos</Label>
        <Input
          id="maxChats"
          type="number"
          min={1}
          max={20}
          value={formData.maxConcurrentChats}
          onChange={(e) => setFormData({ ...formData, maxConcurrentChats: parseInt(e.target.value) || 5 })}
          data-testid="input-max-chats"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="isAvailable">Disponivel para atendimento</Label>
        <Switch
          id="isAvailable"
          checked={formData.isAvailable}
          onCheckedChange={(v) => setFormData({ ...formData, isAvailable: v })}
          data-testid="switch-agent-available"
        />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-save-agent">
        <Save className="w-4 h-4 mr-2" />
        {mutation.isPending ? "Salvando..." : "Salvar Agente"}
      </Button>
    </form>
  );
}

function ConversationsSection() {
  const { data: conversations, isLoading } = useQuery<WhatsappConversation[]>({
    queryKey: ["/api/admin/whatsapp/conversations"],
  });

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Ativo", variant: "default" },
    waiting_human: { label: "Aguardando Atendente", variant: "destructive" },
    resolved: { label: "Resolvido", variant: "secondary" },
    closed: { label: "Encerrado", variant: "outline" },
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Conversas Ativas</h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie as conversas em andamento
        </p>
      </div>

      {(!conversations || conversations.length === 0) ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">Nenhuma conversa ativa</h4>
          <p className="text-sm text-muted-foreground">
            As conversas aparecerao aqui quando clientes entrarem em contato via WhatsApp
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => {
            const status = statusConfig[conv.status || "active"];
            return (
              <Card key={conv.id} className="hover-elevate">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <SiWhatsapp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{conv.customerName || conv.customerPhone}</h4>
                        <p className="text-sm text-muted-foreground">{conv.customerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Button size="sm" variant="outline" data-testid={`button-view-conversation-${conv.id}`}>
                        Ver Conversa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminWhatsApp() {
  const { data: journeySteps = [] } = useQuery<WhatsappJourneyStep[]>({
    queryKey: ["/api/admin/whatsapp/journey-steps"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin-mcg">
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <SiWhatsapp className="w-6 h-6 text-green-500" />
              <h1 className="text-xl font-bold">WhatsApp Business</h1>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Integracão Ativa
          </Badge>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <Tabs defaultValue="journey" className="space-y-6">
          <TabsList>
            <TabsTrigger value="journey" className="flex items-center gap-2" data-testid="tab-journey">
              <MessageCircle className="w-4 h-4" />
              Jornada
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2" data-testid="tab-config">
              <Settings className="w-4 h-4" />
              Configuracao
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2" data-testid="tab-agents">
              <Users className="w-4 h-4" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="conversations" className="flex items-center gap-2" data-testid="tab-conversations">
              <MessageSquare className="w-4 h-4" />
              Conversas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journey">
            <JourneyMap steps={journeySteps} />
          </TabsContent>

          <TabsContent value="config">
            <ConfigSection />
          </TabsContent>

          <TabsContent value="agents">
            <AgentsSection />
          </TabsContent>

          <TabsContent value="conversations">
            <ConversationsSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
