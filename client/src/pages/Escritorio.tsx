import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Briefcase,
  Search,
  ShoppingCart,
  Eye,
  Package,
  Pen,
  Notebook,
  Laptop,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { StoreProduct, StoreProductCategory } from "@shared/schema";

export default function Escritorio() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery<StoreProduct[]>({
    queryKey: ["/api/store/products?productType=escritorio"],
  });

  const { data: categories } = useQuery<StoreProductCategory[]>({
    queryKey: ["/api/store/categories"],
  });

  const filteredProducts = products?.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.categoryId.toString() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatPrice = (priceAmount: string | null) => {
    if (!priceAmount) return "Consulte";
    const price = parseFloat(priceAmount);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getProductIcon = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes("caneta") || name.includes("pen")) return Pen;
    if (name.includes("caderno") || name.includes("bloco")) return Notebook;
    if (name.includes("notebook") || name.includes("laptop")) return Laptop;
    return Package;
  };

  return (
    <AppLayout
      title="Produtos de Escritório MCG"
      subtitle="Materiais e acessórios para seu ambiente de trabalho"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos de escritório..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-escritorio"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {productsLoading ? (
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
                        Últimas {product.inventoryQty} unidades
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
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum produto disponível</h3>
              <p className="text-muted-foreground">
                Em breve teremos novos produtos de escritório MCG para seu ambiente de trabalho.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Os produtos estarão disponíveis assim que forem ativados pelo administrador.
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
                  <h4 className="font-medium mb-1">Descrição</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.longDescription || selectedProduct.shortDescription}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Preço</h4>
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
                    <h4 className="font-medium mb-1">Código</h4>
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
            <Button>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Comprar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
