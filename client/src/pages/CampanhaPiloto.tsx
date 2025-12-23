import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Mail,
  Copy,
  CheckCircle,
  Gift,
  Building2,
  Calculator,
  ClipboardCheck,
  TrendingUp,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InviteData {
  companyName: string;
  contactName: string;
  segment: string;
  pilotDays: string;
  customMessage: string;
}

const initialData: InviteData = {
  companyName: "",
  contactName: "",
  segment: "",
  pilotDays: "30",
  customMessage: "",
};

const segments = [
  { value: "transportadora", label: "Transportadora" },
  { value: "operador_logistico", label: "Operador Logistico" },
  { value: "industria", label: "Industria com Logistica" },
  { value: "armazem", label: "Armazem / CD" },
  { value: "embarcador", label: "Embarcador" },
  { value: "outro", label: "Outro" },
];

const benefitsList = [
  { icon: Calculator, text: "Calculadoras de frete e armazenagem profissionais" },
  { icon: ClipboardCheck, text: "Checklist completo para diagnostico de clientes" },
  { icon: Building2, text: "CRM especializado para logistica" },
  { icon: TrendingUp, text: "Dashboard com indicadores comerciais" },
  { icon: Calendar, text: "Calendario comercial integrado" },
  { icon: MessageSquare, text: "Suporte prioritario durante o piloto" },
];

export default function CampanhaPiloto() {
  const [data, setData] = useState<InviteData>(initialData);
  const [copied, setCopied] = useState<"email" | "whatsapp" | null>(null);
  const { toast } = useToast();

  const updateField = (field: keyof InviteData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const generateEmailTemplate = () => {
    const segmentLabel = segments.find((s) => s.value === data.segment)?.label || data.segment;
    
    return `Assunto: Convite Exclusivo - Programa Piloto MCG Consultoria

Prezado(a) ${data.contactName || "[Nome do Contato]"},

E um prazer entrar em contato com voce da ${data.companyName || "[Nome da Empresa]"}.

A MCG Consultoria esta selecionando empresas do segmento de ${segmentLabel || "logistica"} para participar do nosso Programa Piloto exclusivo, e acreditamos que sua empresa seria uma candidata ideal.

O QUE E O PROGRAMA PILOTO?

Durante ${data.pilotDays} dias, sua empresa tera acesso GRATUITO a nossa plataforma completa de gestao comercial para logistica, incluindo:

- Calculadoras profissionais de frete e armazenagem (com base ANTT)
- CRM especializado para operacoes logisticas
- Checklist de diagnostico para prospectos e clientes
- Dashboard com indicadores ABC, por estado e segmento
- Calendario comercial integrado
- Modulo de RFI (Request for Information) para participar de BIDs

O QUE ESPERAMOS EM TROCA?

Apenas seu feedback honesto sobre a plataforma:
- O que funcionou bem?
- O que pode melhorar?
- A ferramenta resolveu algum problema real?

Se autorizado, gostariaamos de usar seu depoimento como case de sucesso.

${data.customMessage ? `MENSAGEM PESSOAL:\n${data.customMessage}\n` : ""}
PROXIMO PASSO

Clique no link abaixo para criar sua conta gratuita e comecar o piloto:
[LINK DE CADASTRO]

Ou responda este email para agendarmos uma demonstracao de 20 minutos.

Estamos ansiosos para ter voces conosco nessa jornada!

Atenciosamente,

Equipe MCG Consultoria
comercial@mcgconsultoria.com.br

---
MCG Consultoria - Gestao Comercial para Logistica
www.mcgconsultoria.com.br`;
  };

  const generateWhatsAppTemplate = () => {
    const segmentLabel = segments.find((s) => s.value === data.segment)?.label || data.segment;
    
    return `Ola ${data.contactName || "[Nome]"}! Tudo bem?

Sou da MCG Consultoria e estamos selecionando empresas de *${segmentLabel || "logistica"}* para nosso *Programa Piloto*.

Durante *${data.pilotDays} dias GRATUITOS*, a ${data.companyName || "[Empresa]"} tera acesso a:

- Calculadoras de frete/armazenagem (base ANTT)
- CRM especializado para logistica
- Checklists de diagnostico comercial
- Dashboard com indicadores

*O que pedimos?* Apenas seu feedback honesto sobre a plataforma.

${data.customMessage ? `${data.customMessage}\n\n` : ""}Posso te contar mais detalhes? Ou prefere ja acessar direto pelo link?

Abracos!
Equipe MCG`;
  };

  const copyToClipboard = async (type: "email" | "whatsapp") => {
    const text = type === "email" ? generateEmailTemplate() : generateWhatsAppTemplate();
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast({
      title: "Copiado!",
      description: `Template de ${type === "email" ? "email" : "WhatsApp"} copiado para a area de transferencia.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PublicLayout 
      title="Campanha Piloto" 
      subtitle="Gere convites personalizados para empresas participarem do programa piloto"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados da Empresa Convidada
              </CardTitle>
              <CardDescription>
                Preencha as informacoes para personalizar o convite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Transporte Exemplo Ltda"
                  value={data.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactName">Nome do Contato</Label>
                <Input
                  id="contactName"
                  placeholder="Ex: Joao Silva"
                  value={data.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  data-testid="input-contact-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Segmento</Label>
                <Select
                  value={data.segment}
                  onValueChange={(value) => updateField("segment", value)}
                >
                  <SelectTrigger data-testid="select-segment">
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments.map((seg) => (
                      <SelectItem key={seg.value} value={seg.value}>
                        {seg.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pilotDays">Duracao do Piloto (dias)</Label>
                <Select
                  value={data.pilotDays}
                  onValueChange={(value) => updateField("pilotDays", value)}
                >
                  <SelectTrigger data-testid="select-pilot-days">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="45">45 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Mensagem Personalizada (opcional)</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Adicione uma mensagem pessoal ao convite..."
                  value={data.customMessage}
                  onChange={(e) => updateField("customMessage", e.target.value)}
                  rows={3}
                  data-testid="textarea-custom-message"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Beneficios do Programa Piloto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {benefitsList.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <benefit.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Template de Email
                </CardTitle>
                <CardDescription>
                  Convite formal por email
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard("email")}
                data-testid="button-copy-email"
              >
                {copied === "email" ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4 text-sm whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                {generateEmailTemplate()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Template de WhatsApp
                </CardTitle>
                <CardDescription>
                  Mensagem mais direta para WhatsApp
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard("whatsapp")}
                data-testid="button-copy-whatsapp"
              >
                {copied === "whatsapp" ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4 text-sm whitespace-pre-wrap font-mono max-h-[200px] overflow-y-auto">
                {generateWhatsAppTemplate()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dicas para o Programa Piloto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <Badge variant="outline" className="shrink-0">1</Badge>
                <span>Selecione 3-5 empresas para comecar - numero gerenciavel para coletar feedback</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="shrink-0">2</Badge>
                <span>Escolha empresas de diferentes segmentos para validar varios casos de uso</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="shrink-0">3</Badge>
                <span>Agende reunioes semanais de 15 min para acompanhar o uso e coletar feedback</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="shrink-0">4</Badge>
                <span>Documente os problemas que a ferramenta resolveu - isso vira material de vendas</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="shrink-0">5</Badge>
                <span>Ao final, peca um depoimento escrito ou em video (case de sucesso)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
