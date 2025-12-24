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

const manualItems: ManualItem[] = [
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
];

export default function ManualApp() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = manualItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {filteredItems.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum manual encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Em breve novos manuais estarão disponíveis
                </p>
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
