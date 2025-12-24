import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";

interface EbookItem {
  id: number;
  title: string;
  description: string;
  category: string;
  downloadUrl?: string;
  externalUrl?: string;
}

const ebookItems: EbookItem[] = [
  {
    id: 1,
    title: "Guia Completo de Logística",
    description: "Manual completo sobre gestão logística para empresas de transporte",
    category: "Logística",
  },
  {
    id: 2,
    title: "Boas Práticas em Armazenagem",
    description: "E-book com as melhores práticas para operações de armazenagem",
    category: "Armazenagem",
  },
  {
    id: 3,
    title: "Gestão de Frotas",
    description: "Guia prático para gestão eficiente de frotas de veículos",
    category: "Transporte",
  },
];

export default function Ebook() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = ebookItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout title="E-books" subtitle="Biblioteca de e-books e materiais digitais">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar e-books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-ebooks"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum e-book encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Em breve novos materiais estarão disponíveis
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} data-testid={`card-ebook-${item.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
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
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
