import { useState } from "react";
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
} from "lucide-react";

interface ManualItem {
  id: number;
  title: string;
  description: string;
  category: string;
  type: "pdf" | "video" | "article";
  downloadUrl?: string;
  externalUrl?: string;
}

interface ManualCategory {
  id: string;
  title: string;
  description: string;
  icon: typeof Route;
  items: ManualItem[];
}

const manualCategories: ManualCategory[] = [
  {
    id: "roteiro-comercial",
    title: "Roteiro Comercial",
    description: "Guia completo do processo comercial da plataforma MCG",
    icon: Route,
    items: [
      {
        id: 1,
        title: "Primeiros Passos",
        description: "Guia de início rápido para novos usuários da plataforma MCG",
        category: "Introdução",
        type: "pdf",
      },
      {
        id: 2,
        title: "Gestão de Clientes (CRM)",
        description: "Como cadastrar e gerenciar clientes no sistema",
        category: "CRM",
        type: "pdf",
      },
      {
        id: 3,
        title: "Calculadora de Frete",
        description: "Tutorial completo da calculadora de frete ANTT",
        category: "Ferramentas",
        type: "pdf",
      },
      {
        id: 4,
        title: "Checklist Comercial",
        description: "Como utilizar os checklists para diagnóstico de clientes",
        category: "Comercial",
        type: "pdf",
      },
      {
        id: 5,
        title: "Ata de Reunião",
        description: "Criação e envio de atas de reunião com plano de ação",
        category: "Comercial",
        type: "pdf",
      },
      {
        id: 6,
        title: "Indicadores e Relatórios",
        description: "Entenda os indicadores e como gerar relatórios",
        category: "Análises",
        type: "pdf",
      },
    ],
  },
];

export default function ManualApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ManualCategory | null>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return PlayCircle;
      case "article":
        return BookOpen;
      default:
        return FileText;
    }
  };

  const filteredItems = selectedCategory?.items.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredCategories = manualCategories.filter((cat) =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.items.some(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
                const Icon = getIcon(item.type);
                return (
                  <Card key={item.id} data-testid={`card-manual-${item.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
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
                            {category.items.length} {category.items.length === 1 ? 'item' : 'itens'}
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
