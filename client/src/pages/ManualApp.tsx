import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  PlayCircle,
  BookOpen,
  Route,
  ChevronRight,
  ArrowLeft,
  Megaphone,
  TrendingUp,
  Calculator,
  Warehouse,
  LayoutDashboard,
  Users,
  Kanban,
  Calendar,
  FileEdit,
  ClipboardCheck,
  ClipboardList,
  ListTodo,
  FolderKanban,
  BarChart3,
  Settings2,
  MessageSquareHeart,
  Handshake,
} from "lucide-react";

interface ManualItem {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  type: "pdf" | "video" | "article";
  downloadUrl?: string;
  externalUrl?: string;
}

interface ManualSubCategory {
  id: string;
  title: string;
  description: string;
  icon: typeof Route;
  items: ManualItem[];
}

interface ManualCategory {
  id: string;
  title: string;
  description: string;
  icon: typeof Route;
  subCategories: ManualSubCategory[];
}

const manualCategories: ManualCategory[] = [
  {
    id: "roteiro-comercial",
    title: "Roteiro Comercial",
    description: "Guia completo do processo comercial da plataforma MCG",
    icon: Route,
    subCategories: [
      {
        id: "mkt",
        title: "MKT - Pré-Vendas",
        description: "Marketing e prospecção de clientes",
        icon: Megaphone,
        items: [
          {
            id: "mkt-marketing",
            title: "Marketing",
            description: "Estratégias de marketing e divulgação",
            icon: Megaphone,
            type: "pdf",
          },
          {
            id: "mkt-indicadores",
            title: "Indicadores de Pré-Vendas",
            description: "KPIs e métricas de marketing",
            icon: TrendingUp,
            type: "pdf",
          },
        ],
      },
      {
        id: "com",
        title: "COM - Vendas",
        description: "Processo comercial e gestão de vendas",
        icon: Handshake,
        items: [
          {
            id: "com-calcule-frete",
            title: "Calcule Frete",
            description: "Tutorial completo da calculadora de frete ANTT",
            icon: Calculator,
            type: "pdf",
          },
          {
            id: "com-calcule-armazenagem",
            title: "Calcule Armazenagem",
            description: "Como calcular custos de armazenagem",
            icon: Warehouse,
            type: "pdf",
          },
          {
            id: "com-dashboard",
            title: "Dashboard",
            description: "Visão geral e indicadores do painel",
            icon: LayoutDashboard,
            type: "pdf",
          },
          {
            id: "com-clientes",
            title: "Clientes (CRM)",
            description: "Como cadastrar e gerenciar clientes no sistema",
            icon: Users,
            type: "pdf",
          },
          {
            id: "com-pipeline",
            title: "Pipeline",
            description: "Gestão do funil de vendas",
            icon: Kanban,
            type: "pdf",
          },
          {
            id: "com-calendario",
            title: "Calendário",
            description: "Agenda comercial e eventos",
            icon: Calendar,
            type: "pdf",
          },
          {
            id: "com-rotas",
            title: "Rotas",
            description: "Planejamento de rotas comerciais",
            icon: Route,
            type: "pdf",
          },
          {
            id: "com-ata",
            title: "Ata Plano de Ação",
            description: "Criação e envio de atas de reunião com plano de ação",
            icon: FileEdit,
            type: "pdf",
          },
          {
            id: "com-checklist",
            title: "Checklist",
            description: "Como utilizar os checklists para diagnóstico de clientes",
            icon: ClipboardCheck,
            type: "pdf",
          },
          {
            id: "com-rfi",
            title: "RFI",
            description: "Request for Information - documentação técnica",
            icon: ClipboardList,
            type: "pdf",
          },
          {
            id: "com-tarefas",
            title: "Tarefas",
            description: "Gestão de tarefas e atividades",
            icon: ListTodo,
            type: "pdf",
          },
          {
            id: "com-projetos",
            title: "Projetos",
            description: "Gerenciamento de projetos comerciais",
            icon: FolderKanban,
            type: "pdf",
          },
          {
            id: "com-indicadores",
            title: "Indicadores de Vendas",
            description: "KPIs e métricas de vendas",
            icon: TrendingUp,
            type: "pdf",
          },
          {
            id: "com-relatorios",
            title: "Relatórios",
            description: "Como gerar e analisar relatórios",
            icon: BarChart3,
            type: "pdf",
          },
          {
            id: "com-metas",
            title: "Metas",
            description: "Definição e acompanhamento de metas",
            icon: Settings2,
            type: "pdf",
          },
        ],
      },
      {
        id: "cac",
        title: "CAC - Pós-Vendas",
        description: "Relacionamento e satisfação do cliente",
        icon: MessageSquareHeart,
        items: [
          {
            id: "cac-pesquisas",
            title: "Pesquisas de Satisfação",
            description: "Como criar e analisar pesquisas NPS",
            icon: MessageSquareHeart,
            type: "pdf",
          },
          {
            id: "cac-indicadores",
            title: "Indicadores de Pós-Vendas",
            description: "KPIs de satisfação e retenção",
            icon: TrendingUp,
            type: "pdf",
          },
        ],
      },
    ],
  },
];

export default function ManualApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ManualCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ManualSubCategory | null>(null);
  const searchString = useSearch();
  const [, setLocation] = useLocation();

  // Processar parâmetros da URL para navegação direta
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const subParam = params.get("sub");
    const itemParam = params.get("item");
    
    if (subParam) {
      // Encontrar a categoria principal (Roteiro Comercial)
      const category = manualCategories.find(cat => 
        cat.subCategories.some(sub => sub.id === subParam)
      );
      
      if (category) {
        setSelectedCategory(category);
        
        // Encontrar a subcategoria
        const subCategory = category.subCategories.find(sub => sub.id === subParam);
        if (subCategory) {
          setSelectedSubCategory(subCategory);
        }
      }
      
      // Limpar os parâmetros da URL após processar
      setLocation("/manual-app", { replace: true });
    }
  }, [searchString, setLocation]);

  const filteredItems = selectedSubCategory?.items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredSubCategories = selectedCategory?.subCategories.filter((sub) =>
    sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.items.some(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const filteredCategories = manualCategories.filter((cat) =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.subCategories.some(sub => 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  // Nível 3: Itens da subcategoria
  if (selectedSubCategory) {
    return (
      <AppLayout title="Manual do APP" subtitle="Documentação e tutoriais da plataforma MCG">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedSubCategory(null)}
              data-testid="button-back-subcategory"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedSubCategory.title}</h2>
              <p className="text-sm text-muted-foreground">{selectedSubCategory.description}</p>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar manuais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-manual"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum manual encontrado</p>
                </CardContent>
              </Card>
            ) : (
              filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.id} data-testid={`card-manual-${item.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                      <div className="flex gap-2">
                        {item.downloadUrl ? (
                          <Button size="sm" variant="outline" asChild>
                            <a href={item.downloadUrl} download>
                              <Download className="h-4 w-4 mr-1" />
                              Baixar
                            </a>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <Download className="h-4 w-4 mr-1" />
                            Em breve
                          </Button>
                        )}
                        {item.externalUrl && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Abrir
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Nível 2: Subcategorias (MKT, COM, CAC)
  if (selectedCategory) {
    return (
      <AppLayout title="Manual do APP" subtitle="Documentação e tutoriais da plataforma MCG">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedCategory(null)}
              data-testid="button-back-category"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedCategory.title}</h2>
              <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-subcategory"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {filteredSubCategories.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma subcategoria encontrada</p>
                </CardContent>
              </Card>
            ) : (
              filteredSubCategories.map((sub) => {
                const Icon = sub.icon;
                return (
                  <Card 
                    key={sub.id} 
                    className="cursor-pointer hover-elevate transition-all"
                    onClick={() => setSelectedSubCategory(sub)}
                    data-testid={`card-subcategory-${sub.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base">{sub.title}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {sub.items.length} {sub.items.length === 1 ? 'item' : 'itens'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">{sub.description}</p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Nível 1: Categorias principais (Roteiro Comercial)
  return (
    <AppLayout title="Manual do APP" subtitle="Documentação e tutoriais da plataforma MCG">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar manuais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-manual"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => {
              const Icon = category.icon;
              const totalItems = category.subCategories.reduce((acc, sub) => acc + sub.items.length, 0);
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover-elevate transition-all"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`card-category-${category.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{category.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            {category.subCategories.length} seções • {totalItems} itens
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
