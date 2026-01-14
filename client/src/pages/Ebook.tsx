import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  ShoppingCart,
  BookMarked,
  Award,
  Users,
  MapPin,
  Calendar,
  Star,
  Quote,
  Truck,
  TrendingUp,
  Target,
  CheckCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { StoreProduct } from "@shared/schema";

export default function Ebook() {
  const { data: ebookProducts, isLoading } = useQuery<StoreProduct[]>({
    queryKey: ["/api/store/products?productType=ebook"],
  });

  const formatPrice = (priceAmount: string | null) => {
    if (!priceAmount) return "Consulte";
    const price = parseFloat(priceAmount);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <AppLayout title="E-book" subtitle="Conhecimento transformador em logistica comercial">
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
          <div className="relative p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <Badge className="bg-primary/20 text-primary border-none">
                  <Award className="h-3 w-3 mr-1" />
                  Lancamento Exclusivo
                </Badge>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                    A Arte do Comercial em Logistica
                  </h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    Uma trilogia sobre experiencia, estrategia e sucesso na area comercial logistica
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>MCG Consultoria</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Curitiba/PR</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>2025</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    Avaliacao dos leitores
                  </span>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-48 h-64 bg-gradient-to-br from-primary to-primary/70 rounded-md shadow-2xl flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="text-center text-white p-4">
                      <BookMarked className="h-12 w-12 mx-auto mb-3" />
                      <p className="font-bold text-sm">Volume I</p>
                      <p className="text-xs opacity-80">A Jornada Comercial</p>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-2 w-48 h-64 bg-gradient-to-br from-secondary to-secondary/70 rounded-md shadow-xl flex items-center justify-center transform -rotate-6 -z-10">
                    <div className="text-center p-4">
                      <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-bold text-sm opacity-50">Volume II</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-primary" />
              Sobre a Obra
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Fruto de anos de experiencia no mercado de logistica brasileiro, esta obra reune 
              conhecimentos praticos e estrategias testadas no campo de batalha comercial. O autor, 
              com mais de duas decadas atuando na area comercial de grandes operadores logisticos, 
              compartilha insights valiosos sobre como construir relacionamentos duradouros com clientes, 
              entender as nuances do mercado de transporte e armazenagem, e principalmente, como 
              transformar desafios em oportunidades de negocios.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Este e-book e o primeiro volume de uma trilogia que aborda desde a formacao do 
              profissional comercial ate as estrategias mais avancadas de gestao de carteira 
              e fidelizacao de clientes no setor logistico.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Experiencia Real</h3>
                <p className="text-sm text-muted-foreground">
                  Casos praticos vivenciados pelo autor em operadores logisticos de todo o Brasil
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Estrategia Comprovada</h3>
                <p className="text-sm text-muted-foreground">
                  Metodologias que ja geraram milhoes em novos negocios no setor logistico
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Foco no Resultado</h3>
                <p className="text-sm text-muted-foreground">
                  Orientacao pratica para alcançar metas comerciais de forma consistente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Conteudo do Volume I
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "O DNA do profissional comercial em logistica",
                "Entendendo o mercado brasileiro de transporte",
                "Construcao de relacionamentos de longo prazo",
                "A arte da prospecção: do lead ao contrato",
                "Negociacao de fretes e tarifas de armazenagem",
                "Gestao de carteira e fidelização de clientes",
                "Cases de sucesso e licoes aprendidas",
                "O futuro do comercial em logistica",
              ].map((chapter, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm pt-1">{chapter}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>A Trilogia Completa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Badge>Volume I</Badge>
                <h4 className="font-semibold">A Jornada Comercial</h4>
                <p className="text-sm text-muted-foreground">
                  Fundamentos e primeiros passos no comercial logistico
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Disponivel</span>
                </div>
              </div>
              <div className="space-y-3 opacity-60">
                <Badge variant="outline">Volume II</Badge>
                <h4 className="font-semibold">Estrategias Avancadas</h4>
                <p className="text-sm text-muted-foreground">
                  Tecnicas de negociação e gestao de grandes contas
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Lancamento 2025</span>
                </div>
              </div>
              <div className="space-y-3 opacity-60">
                <Badge variant="outline">Volume III</Badge>
                <h4 className="font-semibold">Lideranca Comercial</h4>
                <p className="text-sm text-muted-foreground">
                  Formacao de equipes e gestao de alta performance
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Lancamento 2026</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
                <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
              </div>
            </CardContent>
          </Card>
        ) : ebookProducts && ebookProducts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Adquira seu E-book
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {ebookProducts.map((product) => (
                  <Card key={product.id} className="border-2" data-testid={`card-ebook-${product.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.shortDescription}
                          </p>
                          <Badge variant="outline">
                            {product.fulfillmentType === "digital"
                              ? "Digital"
                              : product.fulfillmentType === "physical"
                              ? "Fisico"
                              : "Digital + Fisico"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          {product.compareAtPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.compareAtPrice)}
                            </p>
                          )}
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(product.priceAmount)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" data-testid={`button-buy-ebook-${product.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Comprar Agora
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold mb-2">Em Breve Disponivel</h3>
              <p className="text-muted-foreground text-sm mb-4">
                O e-book "A Arte do Comercial em Logistica" estara disponivel em breve para compra.
                Cadastre-se para ser notificado quando o lancamento acontecer.
              </p>
              <Button variant="outline" disabled>
                Notifique-me quando disponivel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
