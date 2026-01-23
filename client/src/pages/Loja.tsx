import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Gift,
  BookOpen,
  Briefcase,
  Shirt,
  Store,
  Package,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { StoreProductCategory } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoMcg from "@assets/logo_mcg_principal.png";

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case 'brindes':
      return Gift;
    case 'ebooks':
    case 'ebook':
      return BookOpen;
    case 'escritorio':
      return Briefcase;
    case 'vestuario':
      return Shirt;
    case 'manuais':
      return Package;
    default:
      return Store;
  }
};

function LojaContent() {
  const { data: categories, isLoading } = useQuery<StoreProductCategory[]>({
    queryKey: ["/api/store/categories"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const activeCategories = categories?.filter(c => c.isActive) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Loja MCG</h1>
        <p className="text-muted-foreground">
          Encontre produtos exclusivos para o seu negócio
        </p>
      </div>

      {activeCategories.length === 0 ? (
        <div className="text-center py-16">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nenhuma categoria disponível</h2>
          <p className="text-muted-foreground">
            Em breve teremos produtos disponíveis para você.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCategories.map((category) => {
            const Icon = getCategoryIcon(category.slug);
            return (
              <Link key={category.id} href={`/loja/${category.slug}`}>
                <Card className="hover-elevate cursor-pointer transition-all h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-end text-sm text-primary font-medium">
                      Ver produtos <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-3">
          <img 
            src={logoMcg} 
            alt="MCG Consultoria" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">MCG</span>
            <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" data-testid="btn-login">
              Entrar
            </Button>
          </Link>
          <Link href="/registro">
            <Button size="sm" data-testid="btn-registro">
              Novo Acesso
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Loja() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <AppLayout>
        <LojaContent />
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <LojaContent />
    </div>
  );
}
