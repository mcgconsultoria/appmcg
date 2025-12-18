import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardCheck,
  Save,
  Download,
  Building2,
  Truck,
  DollarSign,
  ShieldCheck,
  Users,
  FileText,
  Scale,
  Briefcase,
  Package,
  Settings,
  Computer,
  Calculator,
  Gavel,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const departments = [
  { id: "cadastrais", label: "Cadastrais", icon: Building2 },
  { id: "operacoes", label: "Operações", icon: Settings },
  { id: "veiculos", label: "Veículos", icon: Truck },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "compras", label: "Compras", icon: Package },
  { id: "seguranca", label: "Segurança", icon: ShieldCheck },
  { id: "contabilidade", label: "Contabilidade", icon: Calculator },
  { id: "fiscal", label: "Fiscal", icon: FileText },
  { id: "negociacao", label: "Negociação", icon: Briefcase },
  { id: "rh", label: "RH", icon: Users },
  { id: "logistica", label: "Logística", icon: Package },
  { id: "operacional", label: "Operacional", icon: Settings },
  { id: "juridico", label: "Jurídico", icon: Gavel },
  { id: "ti", label: "TI", icon: Computer },
  { id: "expedicao", label: "Expedição", icon: Truck },
];

const checklistQuestions: Record<string, { id: string; question: string }[]> = {
  cadastrais: [
    { id: "c1", question: "Razão social e CNPJ atualizados?" },
    { id: "c2", question: "Inscrição estadual válida?" },
    { id: "c3", question: "Endereço fiscal correto?" },
    { id: "c4", question: "Contrato social atualizado?" },
    { id: "c5", question: "Certidões negativas em dia?" },
    { id: "c6", question: "RNTRC ativo?" },
    { id: "c7", question: "Licenças ambientais válidas?" },
  ],
  operacoes: [
    { id: "o1", question: "Processos operacionais documentados?" },
    { id: "o2", question: "Indicadores de performance definidos?" },
    { id: "o3", question: "SLA com clientes estabelecido?" },
    { id: "o4", question: "Sistema de gestão implementado?" },
    { id: "o5", question: "Plano de contingência definido?" },
    { id: "o6", question: "Roteirização otimizada?" },
  ],
  veiculos: [
    { id: "v1", question: "Frota própria ou terceirizada?" },
    { id: "v2", question: "Documentação dos veículos em dia?" },
    { id: "v3", question: "Manutenção preventiva programada?" },
    { id: "v4", question: "Rastreamento GPS instalado?" },
    { id: "v5", question: "Seguro de frota ativo?" },
    { id: "v6", question: "Controle de abastecimento?" },
  ],
  financeiro: [
    { id: "f1", question: "Fluxo de caixa controlado?" },
    { id: "f2", question: "Contas a pagar organizadas?" },
    { id: "f3", question: "Contas a receber em dia?" },
    { id: "f4", question: "Margem de contribuição calculada?" },
    { id: "f5", question: "Custos operacionais mapeados?" },
    { id: "f6", question: "DRE mensal elaborado?" },
  ],
  compras: [
    { id: "cp1", question: "Fornecedores homologados?" },
    { id: "cp2", question: "Processo de cotação definido?" },
    { id: "cp3", question: "Controle de estoque?" },
    { id: "cp4", question: "Contratos de fornecimento?" },
    { id: "cp5", question: "Avaliação de fornecedores?" },
  ],
  seguranca: [
    { id: "s1", question: "Política de segurança definida?" },
    { id: "s2", question: "Treinamentos de segurança?" },
    { id: "s3", question: "EPIs fornecidos?" },
    { id: "s4", question: "CIPA constituída?" },
    { id: "s5", question: "Plano de emergência?" },
    { id: "s6", question: "Gerenciamento de riscos?" },
  ],
  contabilidade: [
    { id: "ct1", question: "Escrituração contábil em dia?" },
    { id: "ct2", question: "Balancete mensal?" },
    { id: "ct3", question: "Conciliação bancária?" },
    { id: "ct4", question: "Provisões contábeis?" },
    { id: "ct5", question: "Relatórios gerenciais?" },
  ],
  fiscal: [
    { id: "fi1", question: "Apuração de impostos em dia?" },
    { id: "fi2", question: "Obrigações acessórias entregues?" },
    { id: "fi3", question: "SPED Fiscal configurado?" },
    { id: "fi4", question: "Créditos tributários aproveitados?" },
    { id: "fi5", question: "Planejamento tributário?" },
  ],
  negociacao: [
    { id: "n1", question: "Tabela de preços atualizada?" },
    { id: "n2", question: "Política comercial definida?" },
    { id: "n3", question: "Descontos pré-aprovados?" },
    { id: "n4", question: "Proposta padrão?" },
    { id: "n5", question: "Script de vendas?" },
    { id: "n6", question: "Argumentário de objeções?" },
  ],
  rh: [
    { id: "rh1", question: "Folha de pagamento em dia?" },
    { id: "rh2", question: "Contratos de trabalho atualizados?" },
    { id: "rh3", question: "Treinamentos programados?" },
    { id: "rh4", question: "Avaliação de desempenho?" },
    { id: "rh5", question: "Plano de cargos e salários?" },
    { id: "rh6", question: "Benefícios competitivos?" },
  ],
  logistica: [
    { id: "l1", question: "WMS implementado?" },
    { id: "l2", question: "TMS integrado?" },
    { id: "l3", question: "Rastreabilidade de cargas?" },
    { id: "l4", question: "Cross-docking estruturado?" },
    { id: "l5", question: "Last mile otimizado?" },
  ],
  operacional: [
    { id: "op1", question: "Procedimentos operacionais padrão?" },
    { id: "op2", question: "Controle de qualidade?" },
    { id: "op3", question: "Gestão de avarias?" },
    { id: "op4", question: "Indicadores operacionais?" },
    { id: "op5", question: "Reuniões de alinhamento?" },
  ],
  juridico: [
    { id: "j1", question: "Contratos de transporte atualizados?" },
    { id: "j2", question: "Seguro de responsabilidade civil?" },
    { id: "j3", question: "Compliance implementado?" },
    { id: "j4", question: "LGPD em conformidade?" },
    { id: "j5", question: "Processos judiciais acompanhados?" },
  ],
  ti: [
    { id: "ti1", question: "Sistemas integrados?" },
    { id: "ti2", question: "Backup automático?" },
    { id: "ti3", question: "Segurança da informação?" },
    { id: "ti4", question: "Suporte técnico?" },
    { id: "ti5", question: "Infraestrutura adequada?" },
  ],
  expedicao: [
    { id: "e1", question: "Conferência de cargas?" },
    { id: "e2", question: "Documentação de embarque?" },
    { id: "e3", question: "Comprovante de entrega digital?" },
    { id: "e4", question: "Gestão de devoluções?" },
    { id: "e5", question: "Controle de SLA de entrega?" },
  ],
};

const segments = [
  "Transportadora",
  "Operador Logístico",
  "Indústria",
  "E-commerce",
  "Distribuidor",
];

export default function Checklist() {
  const [activeDepartment, setActiveDepartment] = useState("cadastrais");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [checklistName, setChecklistName] = useState("");
  const [answers, setAnswers] = useState<Record<string, { checked: boolean; notes: string }>>({});
  const { toast } = useToast();

  const questions = checklistQuestions[activeDepartment] || [];

  const handleCheck = (questionId: string, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], checked, notes: prev[questionId]?.notes || "" },
    }));
  };

  const handleNotes = (questionId: string, notes: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], notes, checked: prev[questionId]?.checked || false },
    }));
  };

  const calculateProgress = () => {
    const allQuestions = Object.values(checklistQuestions).flat();
    const answered = allQuestions.filter((q) => answers[q.id]?.checked).length;
    return Math.round((answered / allQuestions.length) * 100);
  };

  const getDepartmentProgress = (deptId: string) => {
    const deptQuestions = checklistQuestions[deptId] || [];
    const answered = deptQuestions.filter((q) => answers[q.id]?.checked).length;
    return deptQuestions.length > 0 ? Math.round((answered / deptQuestions.length) * 100) : 0;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        companyId: 1,
        name: checklistName || `Checklist ${new Date().toLocaleDateString("pt-BR")}`,
        segment: selectedSegment,
        status: calculateProgress() === 100 ? "completed" : "in_progress",
      };
      return apiRequest("POST", "/api/checklists", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      toast({ title: "Checklist salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar checklist", variant: "destructive" });
    },
  });

  const handleReset = () => {
    setAnswers({});
    setChecklistName("");
    setSelectedSegment("");
    toast({ title: "Checklist reiniciado" });
  };

  const progress = calculateProgress();

  return (
    <AppLayout title="Checklist" subtitle="Diagnóstico completo por departamento">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Departamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-2 space-y-1">
                  {departments.map((dept) => {
                    const deptProgress = getDepartmentProgress(dept.id);
                    const isActive = activeDepartment === dept.id;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setActiveDepartment(dept.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover-elevate"
                        }`}
                        data-testid={`tab-${dept.id}`}
                      >
                        <dept.icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{dept.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={deptProgress} className="h-1 flex-1" />
                            <span className="text-xs">{deptProgress}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-lg">
                  {departments.find((d) => d.id === activeDepartment)?.label}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {questions.length} questões neste departamento
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={progress === 100 ? "default" : "secondary"}>
                  {progress}% completo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                <div className="space-y-2">
                  <Label htmlFor="checklistName">Nome do Checklist</Label>
                  <Input
                    id="checklistName"
                    placeholder="Ex: Diagnóstico ABC Transportes"
                    value={checklistName}
                    onChange={(e) => setChecklistName(e.target.value)}
                    data-testid="input-checklist-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento do Cliente</Label>
                  <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                    <SelectTrigger id="segment" data-testid="select-checklist-segment">
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((seg) => (
                        <SelectItem key={seg} value={seg}>
                          {seg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border bg-card"
                    data-testid={`question-${q.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={q.id}
                        checked={answers[q.id]?.checked || false}
                        onCheckedChange={(checked) =>
                          handleCheck(q.id, checked as boolean)
                        }
                        className="mt-1"
                        data-testid={`checkbox-${q.id}`}
                      />
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor={q.id}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {index + 1}. {q.question}
                        </Label>
                        <Textarea
                          placeholder="Observações..."
                          value={answers[q.id]?.notes || ""}
                          onChange={(e) => handleNotes(q.id, e.target.value)}
                          className="text-sm"
                          rows={2}
                          data-testid={`notes-${q.id}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              data-testid="button-reset-checklist"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              data-testid="button-save-checklist"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar Checklist"}
            </Button>
            <Button variant="outline" data-testid="button-export-checklist">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
