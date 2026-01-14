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
} from "lucide-react";
import { getManualCategories } from "@/lib/featureRegistry";

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

const manualCategories = getManualCategories() as ManualCategory[];

export default function ManualApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ManualCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<ManualSubCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<ManualItem | null>(null);
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
          
          // Se tiver itemParam, encontrar e selecionar o item diretamente
          if (itemParam) {
            const item = subCategory.items.find(i => i.id === itemParam);
            if (item) {
              setSelectedItem(item);
            }
          }
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

  // Nível 4: Item específico selecionado
  if (selectedItem && selectedSubCategory) {
    const Icon = selectedItem.icon;
    return (
      <AppLayout title="Manual do APP" subtitle="Documentação e tutoriais da plataforma MCG">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedItem(null)}
              data-testid="button-back-item"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
              <p className="text-sm text-muted-foreground">{selectedSubCategory.title}</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{selectedItem.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">{selectedItem.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Tipo: {selectedItem.type === "pdf" ? "Documento PDF" : selectedItem.type === "video" ? "Vídeo Tutorial" : "Artigo"}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  {selectedItem.downloadUrl ? (
                    <Button asChild>
                      <a href={selectedItem.downloadUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Material
                      </a>
                    </Button>
                  ) : (
                    <Button disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Material em Produção
                    </Button>
                  )}
                  {selectedItem.externalUrl && (
                    <Button variant="outline" asChild>
                      <a href={selectedItem.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar Link
                      </a>
                    </Button>
                  )}
                </div>

                <div className="mt-6 p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Conteúdo do Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    O conteúdo detalhado deste manual estará disponível em breve. 
                    Estamos preparando materiais completos com instruções passo-a-passo, 
                    exemplos práticos e dicas de uso.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
