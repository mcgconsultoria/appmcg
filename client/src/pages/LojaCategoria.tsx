import { useState } from "react";
import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Gift,
  Search,
  ShoppingCart,
  Eye,
  Package,
  Shirt,
  CalendarDays,
  MousePointer2,
  AlertTriangle,
  Check,
  BookOpen,
  Briefcase,
  Store,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { StoreProduct, StoreProductCategory } from "@shared/schema";

export default function LojaCategoria() {
  const params = useParams();
  const categorySlug = params.slug as string;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showGiftWarning, setShowGiftWarning] = useState(false);
  const [giftAcknowledged, setGiftAcknowledged] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useQuery<StoreProductCategory[]>({
    queryKey: ["/api/store/categories"],
  });

  const category = categories?.find(c => c.slug === categorySlug);

  const { data: products, isLoading: productsLoading } = useQuery<StoreProduct[]>({
    queryKey: ["/api/store/products", categorySlug],
    queryFn: async () => {
      const res = await fetch(`/api/store/products?categorySlug=${categorySlug}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!categorySlug,
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatPrice = (priceAmount: string | null) => {
    if (!priceAmount) return "Consulte";
    const price = parseFloat(priceAmount);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getCategoryIcon = () => {
    switch (categorySlug) {
      case 'brindes':
        return Gift;
      case 'ebooks':
      case 'ebook':
        return BookOpen;
      case 'escritorio':
        return Briefcase;
      case 'vestuario':
        return Shirt;
      default:
        return Store;
    }
  };

  const getProductIcon = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes("camiseta") || name.includes("camisa")) return Shirt;
    if (name.includes("agenda") || name.includes("calendario")) return CalendarDays;
    if (name.includes("mouse")) return MousePointer2;
    return Package;
  };

  const handleBuyClick = (product: StoreProduct) => {
    if (categorySlug === 'brindes') {
      setSelectedProduct(product);
      setShowGiftWarning(true);
    } else {
      console.log("Buy product:", product.id);
    }
  };

  const handleConfirmPurchase = () => {
    setGiftAcknowledged(true);
    setShowGiftWarning(false);
  };

  const CategoryIcon = getCategoryIcon();
  const isLoading = categoriesLoading || productsLoading;

  return (
    <AppLayout
      title={category?.name || "Loja MCG"}
      subtitle={category?.description || "Produtos MCG Consultoria"}
    >
      <div className="space-y-6">
        {categorySlug === 'brindes' && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">
                    Importante sobre Brindes Corporativos
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Antes de presentear um cliente, verifique a politica de compliance da empresa dele.
                    Muitas empresas possuem regras sobre aceitar presentes de fornecedores.
                    Respeitar essas regras demonstra profissionalismo e etica.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-products"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-40 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const Icon = getProductIcon(product.name);
              return (
                <Card key={product.id} data-testid={`card-product-${product.id}`}>
                  <CardHeader className="pb-2">
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2">
                      {product.primaryImageUrl ? (
                        <img
                          src={product.primaryImageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Icon className="h-16 w-16 text-muted-foreground/50" />
                      )}
                    </div>
                    <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.priceAmount)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    {product.inventoryQty !== null && product.inventoryQty <= 5 && (
                      <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
                        Ultimas {product.inventoryQty} unidades
                      </Badge>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductDialog(true);
                      }}
                      data-testid={`button-view-${product.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleBuyClick(product)}
                      data-testid={`button-buy-${product.id}`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Comprar
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CategoryIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto disponivel</h3>
              <p className="text-muted-foreground">
                Em breve teremos novos produtos nesta categoria.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Os produtos estarao disponiveis assim que forem ativados pelo administrador.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>Detalhes do produto</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                {selectedProduct.primaryImageUrl ? (
                  <img
                    src={selectedProduct.primaryImageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <Package className="h-24 w-24 text-muted-foreground/30" />
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Descricao</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.longDescription || selectedProduct.shortDescription}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Preco</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(selectedProduct.priceAmount)}
                    </span>
                    {selectedProduct.compareAtPrice && (
                      <span className="text-muted-foreground line-through">
                        {formatPrice(selectedProduct.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>
                {selectedProduct.sku && (
                  <div>
                    <h4 className="font-medium mb-1">Codigo</h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.sku}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              Fechar
            </Button>
            <Button
              onClick={() => {
                setShowProductDialog(false);
                if (selectedProduct) handleBuyClick(selectedProduct);
              }}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Comprar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGiftWarning} onOpenChange={setShowGiftWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Aviso sobre Brindes Corporativos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Se voce esta comprando este produto para presentear um cliente, lembre-se:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                Verifique se a empresa do cliente permite receber presentes
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                Algumas empresas possuem limite de valor para brindes
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                Em caso de duvida, pergunte ao seu contato na empresa
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Respeitar as politicas de compliance dos clientes e uma pratica etica que
              fortalece o relacionamento comercial.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGiftWarning(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmPurchase}>
              Entendi, continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
