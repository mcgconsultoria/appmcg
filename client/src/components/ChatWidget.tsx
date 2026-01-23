import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Ticket,
  ChevronDown,
  Headphones
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  content: string;
  sender: "bot" | "user";
  timestamp: Date;
  options?: ChatOption[];
}

interface ChatOption {
  label: string;
  value: string;
  action?: "create_ticket" | "navigate" | "faq";
}

const FAQ_RESPONSES: Record<string, string> = {
  planos: "Oferecemos 3 planos: Free (R$0), Profissional (R$399/mês) e Corporativo (R$1.299/mês). Todos incluem 1 usuário base. Usuários adicionais custam R$49/mês cada. Quer saber mais sobre algum plano específico?",
  calculadoras: "Temos duas calculadoras: Frete (com ICMS de todos os estados) e Armazenagem. No plano Free você tem 3 cálculos gratuitos. Nos planos pagos, cálculos ilimitados!",
  pagamento: "Aceitamos cartão de crédito via Stripe. Após aprovação da MCG, você receberá o link de pagamento por email. Precisa de ajuda com pagamento?",
  suporte: "Nosso suporte funciona em horário comercial. Você pode abrir um ticket aqui no chat ou enviar email para comercial@mcgconsultoria.com.br",
  cancelamento: "Para cancelar sua assinatura, acesse Meu Plano > Cancelar Assinatura. O acesso continua até o fim do período pago. Quer que eu explique melhor?",
  crm: "O CRM da MCG permite gerenciar seus clientes, pipeline de vendas, análise ABC e segmentação. Disponível nos planos Professional e Enterprise.",
  checklist: "O Diagnóstico Comercial analisa 18 departamentos da sua empresa logística, identificando pontos de melhoria. Gratuito para todos!",
  integracao: "Estamos trabalhando em integrações com QualP, KMM e outros ERPs logísticos. Em breve teremos novidades!",
};

const GREETING_MESSAGE: ChatMessage = {
  id: "greeting",
  content: "Olá! Sou a assistente virtual da MCG Consultoria. Como posso ajudar você hoje?",
  sender: "bot",
  timestamp: new Date(),
  options: [
    { label: "Conhecer os planos", value: "planos", action: "faq" },
    { label: "Dúvidas sobre pagamento", value: "pagamento", action: "faq" },
    { label: "Suporte técnico", value: "suporte_tecnico", action: "faq" },
    { label: "Abrir um chamado", value: "criar_ticket", action: "create_ticket" },
  ],
};

function findBestResponse(input: string): string {
  const lowerInput = input.toLowerCase();
  
  const keywords: Record<string, string[]> = {
    planos: ["plano", "preço", "valor", "custo", "assinar", "assinatura", "free", "professional", "enterprise", "gratuito"],
    calculadoras: ["calculadora", "frete", "armazenagem", "calcular", "cálculo", "icms"],
    pagamento: ["pagar", "pagamento", "cartão", "boleto", "stripe", "cobrança", "fatura"],
    suporte: ["suporte", "ajuda", "atendimento", "contato", "email", "telefone"],
    cancelamento: ["cancelar", "cancelamento", "desistir", "parar", "encerrar"],
    crm: ["crm", "cliente", "pipeline", "venda", "comercial", "abc"],
    checklist: ["checklist", "diagnóstico", "diagnostico", "análise", "analise", "departamento"],
    integracao: ["integração", "integracao", "erp", "qualp", "kmm", "sistema"],
  };
  
  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some(word => lowerInput.includes(word))) {
      return FAQ_RESPONSES[topic];
    }
  }
  
  return "Não encontrei uma resposta específica para sua pergunta. Posso abrir um chamado para nossa equipe analisar sua dúvida. Deseja criar um ticket de suporte?";
}

interface ChatWidgetProps {
  isAuthenticated?: boolean;
  userId?: string;
  companyId?: number;
  userEmail?: string;
  userName?: string;
  isOpenExternal?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ChatWidget({ 
  isAuthenticated = false, 
  userId,
  companyId,
  userEmail,
  userName,
  isOpenExternal,
  onOpenChange
}: ChatWidgetProps) {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : isOpenInternal;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setIsOpenInternal(open);
    }
  };
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string; description: string; category: string; priority: string }) => {
      const response = await apiRequest("POST", "/api/support-tickets", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setIsCreatingTicket(false);
      setTicketSubject("");
      setTicketDescription("");
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Ticket #${data.ticketNumber} criado com sucesso! Nossa equipe entrará em contato em breve. Você pode acompanhar o status na página de Suporte.`,
        sender: "bot",
        timestamp: new Date(),
        options: [
          { label: "Tenho outra dúvida", value: "nova_duvida", action: "faq" },
        ],
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: () => {
      toast({ 
        title: "Erro ao criar ticket", 
        description: "Tente novamente ou entre em contato por email.",
        variant: "destructive" 
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const response = findBestResponse(inputValue);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "bot",
        timestamp: new Date(),
        options: response.includes("criar um ticket") ? [
          { label: "Sim, abrir chamado", value: "criar_ticket", action: "create_ticket" },
          { label: "Não, obrigado", value: "nao", action: "faq" },
        ] : undefined,
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    setInputValue("");
  };

  const handleOptionClick = (option: ChatOption) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: option.label,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    if (option.action === "create_ticket") {
      if (!isAuthenticated) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: "Para abrir um chamado, você precisa estar logado no sistema. Faça login ou cadastre-se para continuar.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        return;
      }
      setIsCreatingTicket(true);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Vamos criar seu chamado. Por favor, preencha as informações abaixo:",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } else if (option.action === "faq") {
      setTimeout(() => {
        let response = FAQ_RESPONSES[option.value] || "Como posso ajudar você?";
        
        if (option.value === "nova_duvida" || option.value === "nao") {
          response = "Tudo bem! Posso ajudar com mais alguma coisa?";
        }
        
        if (option.value === "suporte_tecnico") {
          response = "Para suporte técnico, você pode:\n\n1. Abrir um chamado aqui no chat\n2. Enviar email para comercial@mcgconsultoria.com.br\n3. Acessar a página de Suporte no menu\n\nComo prefere prosseguir?";
        }

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "bot",
          timestamp: new Date(),
          options: option.value === "suporte_tecnico" ? [
            { label: "Abrir chamado agora", value: "criar_ticket", action: "create_ticket" },
            { label: "Tenho outra dúvida", value: "nova_duvida", action: "faq" },
          ] : [
            { label: "Abrir um chamado", value: "criar_ticket", action: "create_ticket" },
            { label: "Falar sobre planos", value: "planos", action: "faq" },
          ],
        };
        setMessages(prev => [...prev, botMessage]);
      }, 300);
    }
  };

  const handleCreateTicket = () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createTicketMutation.mutate({
      subject: ticketSubject,
      description: ticketDescription,
      category: "suporte",
      priority: "medium",
    });
  };

  return (
    <>
      {!isOpen && isOpenExternal === undefined && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
          data-testid="button-open-chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[520px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary-foreground/20">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Suporte MCG</CardTitle>
                <p className="text-xs opacity-80">Assistente Virtual</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                data-testid="button-minimize-chat"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsOpen(false);
                  setMessages([GREETING_MESSAGE]);
                  setIsCreatingTicket(false);
                }}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                data-testid="button-close-chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === "bot" && (
                        <Bot className="h-4 w-4 mt-0.5 shrink-0" />
                      )}
                      <div className="space-y-2">
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        {message.options && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {message.options.map((option, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="cursor-pointer text-xs px-2 py-1"
                                onClick={() => handleOptionClick(option)}
                                data-testid={`button-chat-option-${idx}`}
                              >
                                {option.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.sender === "user" && (
                        <User className="h-4 w-4 mt-0.5 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isCreatingTicket && (
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Ticket className="h-4 w-4" />
                    Novo Chamado
                  </div>
                  <Input
                    placeholder="Assunto do chamado"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    data-testid="input-ticket-subject"
                  />
                  <Textarea
                    placeholder="Descreva sua dúvida ou problema"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                    data-testid="input-ticket-description"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateTicket}
                      disabled={createTicketMutation.isPending}
                      data-testid="button-submit-ticket"
                    >
                      {createTicketMutation.isPending ? "Enviando..." : "Criar Chamado"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCreatingTicket(false)}
                      data-testid="button-cancel-ticket"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isCreatingTicket}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isCreatingTicket}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {isAuthenticated && userName && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Logado como {userName}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
