import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Target,
  Users,
  Calculator,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  Building2,
  Zap,
  Mail,
  Phone,
} from "lucide-react";
import logoMcg from "@assets/logo_mcg_principal.png";

interface Question {
  id: string;
  category: string;
  text: string;
  options: { value: number; label: string }[];
}

const questions: Question[] = [
  {
    id: "crm",
    category: "CRM e Organização",
    text: "Como você gerencia as informações dos seus clientes e prospects?",
    options: [
      { value: 0, label: "Não tenho controle, fica na cabeça do vendedor" },
      { value: 1, label: "Planilhas Excel ou Google Sheets" },
      { value: 2, label: "CRM genérico (Pipedrive, HubSpot, etc.)" },
      { value: 3, label: "CRM especializado para logística" },
    ],
  },
  {
    id: "pipeline",
    category: "Pipeline de Vendas",
    text: "Como você acompanha as oportunidades de venda em andamento?",
    options: [
      { value: 0, label: "Não acompanho de forma estruturada" },
      { value: 1, label: "Reuniões semanais com a equipe" },
      { value: 2, label: "Planilha com status de cada proposta" },
      { value: 3, label: "Pipeline visual com etapas definidas" },
    ],
  },
  {
    id: "cotacao",
    category: "Cotações",
    text: "Como você calcula e envia cotações de frete para clientes?",
    options: [
      { value: 0, label: "Na mão, sem padrão definido" },
      { value: 1, label: "Planilha com fórmulas básicas" },
      { value: 2, label: "Sistema próprio ou do embarcador" },
      { value: 3, label: "Calculadora integrada ao CRM com histórico" },
    ],
  },
  {
    id: "followup",
    category: "Follow-up",
    text: "Como você garante o acompanhamento de propostas enviadas?",
    options: [
      { value: 0, label: "Depende da memória do vendedor" },
      { value: 1, label: "Anotações em agenda ou caderno" },
      { value: 2, label: "Lembretes no celular ou e-mail" },
      { value: 3, label: "Sistema com alertas automáticos" },
    ],
  },
  {
    id: "histórico",
    category: "Histórico",
    text: "Quando um vendedor sai da empresa, o que acontece com os dados dos clientes dele?",
    options: [
      { value: 0, label: "Perdemos a maioria das informações" },
      { value: 1, label: "Ficam em planilhas desorganizadas" },
      { value: 2, label: "Temos backup mas difícil de acessar" },
      { value: 3, label: "Tudo fica registrado no sistema" },
    ],
  },
  {
    id: "indicadores",
    category: "Indicadores",
    text: "Você consegue ver rapidamente quantas propostas estão em aberto e qual o valor total?",
    options: [
      { value: 0, label: "Não tenho essa informação" },
      { value: 1, label: "Preciso consolidar manualmente" },
      { value: 2, label: "Tenho relatório semanal/mensal" },
      { value: 3, label: "Dashboard em tempo real" },
    ],
  },
  {
    id: "segmentacao",
    category: "Segmentação",
    text: "Você sabe quais clientes representam 80% da sua receita (Curva ABC)?",
    options: [
      { value: 0, label: "Não tenho essa análise" },
      { value: 1, label: "Tenho uma ideia geral" },
      { value: 2, label: "Faço análise eventual em planilha" },
      { value: 3, label: "Tenho análise automática atualizada" },
    ],
  },
  {
    id: "qualificacao",
    category: "Qualificação",
    text: "Como você avalia se um prospect tem potencial antes de investir tempo comercial?",
    options: [
      { value: 0, label: "Não tenho critérios definidos" },
      { value: 1, label: "Intuição e experiência do vendedor" },
      { value: 2, label: "Checklist básico de perguntas" },
      { value: 3, label: "Diagnóstico estruturado por área" },
    ],
  },
  {
    id: "propostas",
    category: "Propostas",
    text: "Como você padroniza as propostas comerciais enviadas?",
    options: [
      { value: 0, label: "Cada vendedor faz do seu jeito" },
      { value: 1, label: "Modelo em Word/PowerPoint" },
      { value: 2, label: "Template padronizado com dados manuais" },
      { value: 3, label: "Geração automática com dados do cliente" },
    ],
  },
  {
    id: "integração",
    category: "Integração",
    text: "Sua área comercial está integrada com a operação (TMS/WMS)?",
    options: [
      { value: 0, label: "Não há integração" },
      { value: 1, label: "Comunicação por e-mail/WhatsApp" },
      { value: 2, label: "Reuniões periódicas de alinhamento" },
      { value: 3, label: "Sistemas integrados com fluxo de dados" },
    ],
  },
];

const categoryIcons: Record<string, any> = {
  "CRM e Organização": Users,
  "Pipeline de Vendas": TrendingUp,
  "Cotações": Calculator,
  "Follow-up": Target,
  "Histórico": ClipboardCheck,
  "Indicadores": BarChart3,
  "Segmentação": Building2,
  "Qualificação": ClipboardCheck,
  "Propostas": Zap,
  "Integração": Building2,
};

interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export default function DiagnósticoComercial() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  const totalQuestions = questions.length;
  const progress = ((currentStep + 1) / totalQuestions) * 100;

  const getMaturityLevel = (percentage: number) => {
    if (percentage >= 75) return "avancado";
    if (percentage >= 50) return "intermediário";
    if (percentage >= 25) return "basico";
    return "iniciante";
  };

  const saveLead = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      company: string;
      phone: string;
      score: number;
      maxScore: number;
      percentage: number;
      maturityLevel: string;
      answers: Record<string, number>;
    }) => {
      const res = await apiRequest("POST", "/api/diagnostic-leads", data);
      return res.json();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleAnswer = (value: string) => {
    const question = questions[currentStep];
    setAnswers((prev) => ({
      ...prev,
      [question.id]: parseInt(value),
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowLeadForm(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = totalQuestions * 3;
    const percentage = Math.round((total / maxScore) * 100);
    const maturityLevel = getMaturityLevel(percentage);
    
    await saveLead.mutateAsync({
      name: leadData.name,
      email: leadData.email,
      company: leadData.company,
      phone: leadData.phone || "",
      score: total,
      maxScore,
      percentage,
      maturityLevel,
      answers,
    });
    
    setShowLeadForm(false);
    setShowResult(true);
  };

  const calculateScore = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const maxScore = totalQuestions * 3;
    return Math.round((total / maxScore) * 100);
  };

  const getScoreLevel = (score: number) => {
    if (score >= 75) return { level: "Avançado", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle };
    if (score >= 50) return { level: "Intermediário", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: AlertTriangle };
    if (score >= 25) return { level: "Inicial", color: "text-orange-600", bgColor: "bg-orange-100", icon: AlertTriangle };
    return { level: "Crítico", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle };
  };

  const getRecommendations = (score: number) => {
    const recommendations = [];
    
    if (answers.crm < 2) {
      recommendations.push({
        title: "Implemente um CRM",
        description: "Centralize as informações dos clientes em um sistema organizado",
        tool: "CRM MCG",
        link: "/registro",
      });
    }
    if (answers.cotacao < 2) {
      recommendations.push({
        title: "Padronize suas cotações",
        description: "Use calculadoras com ICMS, GRIS e ADV integrados",
        tool: "Calculadora de Frete",
        link: "/calculadora-frete",
      });
    }
    if (answers.qualificacao < 2) {
      recommendations.push({
        title: "Qualifique melhor seus prospects",
        description: "Use checklists diagnósticos antes de investir tempo comercial",
        tool: "Checklists MCG",
        link: "/registro",
      });
    }
    if (answers.indicadores < 2) {
      recommendations.push({
        title: "Tenha visibilidade do funil",
        description: "Dashboard em tempo real com pipeline e indicadores",
        tool: "Dashboard MCG",
        link: "/registro",
      });
    }
    if (answers.integração < 2) {
      recommendations.push({
        title: "Integre comercial e operação",
        description: "Conecte seu CRM com os sistemas operacionais",
        tool: "RFI e Integrações",
        link: "/registro",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Evolua para o próximo nível",
        description: "Sua operação está madura. Vamos otimizar ainda mais?",
        tool: "Consultoria MCG",
        link: "/registro",
      });
    }

    return recommendations.slice(0, 3);
  };

  const currentQuestion = questions[currentStep];
  const CategoryIcon = categoryIcons[currentQuestion?.category] || Target;

  if (showResult) {
    const score = calculateScore();
    const scoreLevel = getScoreLevel(score);
    const ScoreIcon = scoreLevel.icon;
    const recommendations = getRecommendations(score);

    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoMcg} alt="MCG Consultoria" className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">MCG</span>
                <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="pt-24 pb-12 px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${scoreLevel.bgColor}`}>
                <ScoreIcon className={`w-12 h-12 ${scoreLevel.color}`} />
              </div>
              <h1 className="text-3xl font-bold">Sua Maturidade Comercial</h1>
              <div className="flex items-center justify-center gap-4">
                <span className={`text-6xl font-bold ${scoreLevel.color}`}>{score}%</span>
                <span className={`text-xl font-medium ${scoreLevel.color}`}>{scoreLevel.level}</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recomendações para sua empresa</CardTitle>
                <CardDescription>
                  Com base nas suas respostas, identificamos estas oportunidades de melhoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <Link href={rec.link}>
                        <Button variant="ghost" className="p-0 h-auto text-primary">
                          Conhecer {rec.tool} <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold">Quer evoluir sua gestão comercial?</h3>
                    <p className="text-muted-foreground">
                      Experimente grátis o MCG Consultoria por 14 dias. Todas as ferramentas que você precisa em um só lugar.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/registro">
                      <Button size="lg" data-testid="button-start-trial">
                        Começar Grátis
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button size="lg" variant="outline" data-testid="button-learn-more">
                        Saiba Mais
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button variant="ghost" onClick={() => {
                setCurrentStep(0);
                setAnswers({});
                setShowResult(false);
                setShowLeadForm(false);
              }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Refazer Diagnóstico
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showLeadForm) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src={logoMcg} alt="MCG Consultoria" className="h-10 w-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">MCG</span>
                <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="pt-24 pb-12 px-6">
          <div className="max-w-lg mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Quase lá!</CardTitle>
                <CardDescription>
                  Para ver seu resultado personalizado, preencha seus dados abaixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu Nome *</Label>
                    <Input
                      id="name"
                      value={leadData.name}
                      onChange={(e) => setLeadData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="João Silva"
                      required
                      data-testid="input-lead-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail Corporativo *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={leadData.email}
                        onChange={(e) => setLeadData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="joao@empresa.com.br"
                        className="pl-10"
                        required
                        data-testid="input-lead-email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={leadData.phone}
                        onChange={(e) => setLeadData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        data-testid="input-lead-phone"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="company"
                        value={leadData.company}
                        onChange={(e) => setLeadData((prev) => ({ ...prev, company: e.target.value }))}
                        placeholder="Nome da sua empresa"
                        className="pl-10"
                        required
                        data-testid="input-lead-company"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    disabled={saveLead.isPending}
                    data-testid="button-see-result"
                  >
                    {saveLead.isPending ? "Processando..." : "Ver Meu Resultado"}
                    {!saveLead.isPending && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Seus dados estão protegidos conforme nossa{" "}
                    <Link href="/privacidade" className="underline">
                      Política de Privacidade
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src={logoMcg} alt="MCG Consultoria" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">MCG</span>
              <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {currentStep === 0 && (
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-3xl font-bold">Diagnóstico de Maturidade Comercial</h1>
              <p className="text-lg text-muted-foreground">
                Descubra em 3 minutos como está sua gestão comercial logística
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Pergunta {currentStep + 1} de {totalQuestions}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CategoryIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardDescription>{currentQuestion.category}</CardDescription>
                  <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion.id]?.toString()}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 p-4 rounded-lg border hover-elevate cursor-pointer"
                  >
                    <RadioGroupItem
                      value={option.value.toString()}
                      id={`${currentQuestion.id}-${option.value}`}
                      data-testid={`radio-answer-${option.value}`}
                    />
                    <Label
                      htmlFor={`${currentQuestion.id}-${option.value}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion.id] === undefined}
              data-testid="button-next"
            >
              {currentStep === totalQuestions - 1 ? "Ver Resultado" : "Próxima"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
