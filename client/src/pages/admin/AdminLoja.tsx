import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Store,
  Plus,
  Edit,
  Trash2,
  Package,
  Tag,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Upload,
  ImageIcon,
  Palette,
  PlusCircle,
  X,
  Ruler,
} from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { StoreProduct, StoreProductCategory, StoreOrder } from "@shared/schema";
import { brazilianSizes } from "@shared/schema";
import { ProductMediaManager } from "@/components/ProductMediaManager";

const productFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  slug: z.string().min(1, "Slug obrigatorio"),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  productType: z.enum(["merch", "ebook", "escritorio", "vestuario"]),
  fulfillmentType: z.enum(["physical", "digital", "hybrid"]),
  categoryId: z.number().optional(),
  modelo: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sku: z.string().optional(),
  priceAmount: z.string().optional(),
  priceCurrency: z.string().default("BRL"),
  compareAtPrice: z.string().optional(),
  inventoryQty: z.number().optional(),
  primaryImageUrl: z.string().optional(),
  isActive: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

const modeloOptions = [
  "Camiseta",
  "Camisa", 
  "Camisetao",
  "Vestido",
  "Saia",
  "Calca",
  "Shorts",
  "Casaco",
];

type ProductFormValues = z.infer<typeof productFormSchema>;

const categoryFormSchema = z.object({
  name: z.string().min(1, "Nome obrigatorio"),
  slug: z.string().min(1, "Slug obrigatorio"),
  code: z.string().max(10, "Maximo 10 caracteres").optional(),
  description: z.string().optional(),
  parentId: z.number().optional().nullable(),
  displayOrder: z.number().default(0),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function AdminLoja() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [editingCategory, setEditingCategory] = useState<StoreProductCategory | null>(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<StoreProduct | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<StoreProductCategory | null>(null);
  const [availableColors, setAvailableColors] = useState<string[]>([
    "Preto", "Branco", "Azul", "Vermelho", "Verde", "Amarelo", "Cinza", "Marrom", "Rosa", "Laranja"
  ]);
  const [newColorInput, setNewColorInput] = useState("");

  const { data: products, isLoading: productsLoading } = useQuery<StoreProduct[]>({
    queryKey: ["/api/admin/store/products"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<StoreProductCategory[]>({
    queryKey: ["/api/store/categories"],
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<StoreOrder[]>({
    queryKey: ["/api/admin/store/orders"],
  });

  const {
    uploadFile: uploadPrimaryImage,
    isUploading: isPrimaryImageUploading,
    progress: primaryImageProgress,
  } = useUpload({
    onSuccess: (response) => {
      productForm.setValue("primaryImageUrl", response.objectPath);
      toast({
        title: "Imagem enviada",
        description: "A imagem foi carregada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePrimaryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPrimaryImage(file);
    }
  };

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      longDescription: "",
      productType: "",
      fulfillmentType: "",
      categoryId: undefined,
      modelo: "",
      sizes: [],
      colors: [],
      priceAmount: "",
      priceCurrency: "BRL",
      compareAtPrice: "",
      sku: "",
      inventoryQty: 0,
      primaryImageUrl: "",
      isActive: false,
      isFeatured: false,
    },
  });
  
  const watchedProductType = productForm.watch("productType");

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      displayOrder: 0,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ProductFormValues) =>
      apiRequest("POST", "/api/admin/store/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store/products"] });
      setShowProductDialog(false);
      productForm.reset();
      toast({ title: "Produto criado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar produto", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormValues> }) =>
      apiRequest("PATCH", `/api/admin/store/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store/products"] });
      setShowProductDialog(false);
      setEditingProduct(null);
      productForm.reset();
      toast({ title: "Produto atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar produto", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/store/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store/products"] });
      setDeleteConfirmProduct(null);
      toast({ title: "Produto excluido" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir produto", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormValues) =>
      apiRequest("POST", "/api/admin/store/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/categories"] });
      setShowCategoryDialog(false);
      categoryForm.reset();
      toast({ title: "Categoria criada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao criar categoria", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormValues> }) =>
      apiRequest("PATCH", `/api/admin/store/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/categories"] });
      setShowCategoryDialog(false);
      setEditingCategory(null);
      categoryForm.reset();
      toast({ title: "Categoria atualizada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar categoria", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/store/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/categories"] });
      setDeleteConfirmCategory(null);
      toast({ title: "Categoria excluida" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir categoria", variant: "destructive" });
    },
  });

  const toggleProductActive = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PATCH", `/api/admin/store/products/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store/products"] });
      toast({ title: "Status do produto atualizado" });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    },
  });

  const fetchNextSku = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/admin/store/next-sku/${categoryId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        return data.sku;
      }
    } catch (error) {
      console.error("Error fetching next SKU:", error);
    }
    return null;
  };

  const handleCategoryChange = async (categoryId: number | undefined) => {
    productForm.setValue("categoryId", categoryId);
    if (categoryId && !editingProduct) {
      const nextSku = await fetchNextSku(categoryId);
      if (nextSku) {
        productForm.setValue("sku", nextSku);
      }
    }
  };

  const openProductDialog = (product?: StoreProduct) => {
    if (product) {
      setEditingProduct(product);
      productForm.reset({
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription || "",
        longDescription: product.longDescription || "",
        productType: (product.productType === "manual" ? "escritorio" : product.productType) as "merch" | "ebook" | "escritorio" | "vestuario",
        fulfillmentType: product.fulfillmentType as "physical" | "digital" | "hybrid",
        categoryId: product.categoryId || undefined,
        sizes: (product as any).sizes || [],
        colors: (product as any).colors || [],
        modelo: (product as any).modelo || "",
        sku: product.sku || "",
        priceAmount: product.priceAmount || "",
        priceCurrency: product.priceCurrency || "BRL",
        compareAtPrice: product.compareAtPrice || "",
        inventoryQty: product.inventoryQty || 0,
        primaryImageUrl: product.primaryImageUrl || "",
        isActive: product.isActive || false,
        isFeatured: product.isFeatured || false,
      });
    } else {
      setEditingProduct(null);
      productForm.reset();
    }
    setShowProductDialog(true);
  };

  const openCategoryDialog = (category?: StoreProductCategory) => {
    if (category) {
      setEditingCategory(category);
      categoryForm.reset({
        name: category.name,
        slug: category.slug,
        code: category.code || "",
        description: category.description || "",
        parentId: category.parentId,
        displayOrder: category.displayOrder || 0,
      });
    } else {
      setEditingCategory(null);
      categoryForm.reset();
    }
    setShowCategoryDialog(true);
  };

  const onProductSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const onCategorySubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  const formatPrice = (priceAmount: string | null) => {
    if (!priceAmount) return "-";
    const price = parseFloat(priceAmount);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getProductTypeBadge = (type: string) => {
    switch (type) {
      case "merch":
        return <Badge variant="secondary">Brindes</Badge>;
      case "ebook":
        return <Badge>E-book</Badge>;
      case "escritorio":
        return <Badge variant="outline">Escritório</Badge>;
      case "vestuario":
        return <Badge variant="secondary">Vestuário</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "paid":
        return <Badge className="bg-green-600">Pago</Badge>;
      case "shipped":
        return <Badge className="bg-blue-600">Enviado</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-600">Entregue</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout
      title="Loja MCG"
      subtitle="Gerenciamento de produtos, categorias e pedidos"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products" data-testid="tab-products">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <Tag className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Pedidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos da Loja
              </CardTitle>
              <Button onClick={() => openProductDialog()} data-testid="button-new-product">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Preco</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead className="text-center">Ativo</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                              {product.primaryImageUrl ? (
                                <img
                                  src={product.primaryImageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-cover rounded"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.sku || "-"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getProductTypeBadge(product.productType)}</TableCell>
                        <TableCell>{formatPrice(product.priceAmount)}</TableCell>
                        <TableCell>
                          {product.inventoryQty !== null ? product.inventoryQty : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={product.isActive || false}
                            onCheckedChange={(checked) =>
                              toggleProductActive.mutate({ id: product.id, isActive: checked })
                            }
                            data-testid={`switch-active-${product.id}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openProductDialog(product)}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteConfirmProduct(product)}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Nenhum produto cadastrado</p>
                  <Button
                    className="mt-4"
                    onClick={() => openProductDialog()}
                    data-testid="button-first-product"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Produto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categorias
              </CardTitle>
              <Button onClick={() => openCategoryDialog()} data-testid="button-new-category">
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : categories && categories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Sigla</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell><Badge variant="outline">{category.code || "-"}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                        <TableCell>{category.displayOrder}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openCategoryDialog(category)}
                              data-testid={`button-edit-category-${category.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteConfirmCategory(category)}
                              data-testid={`button-delete-category-${category.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
                  <Button
                    className="mt-4"
                    onClick={() => openCategoryDialog()}
                    data-testid="button-first-category"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Categoria
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : orders && orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p>{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("pt-BR")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Nenhum pedido registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informacoes do produto
            </DialogDescription>
          </DialogHeader>
          <Form {...productForm}>
            <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={productForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nome do produto" 
                          data-testid="input-product-name"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!editingProduct) {
                              const slug = e.target.value
                                .toLowerCase()
                                .normalize("NFD")
                                .replace(/[\u0300-\u036f]/g, "")
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "");
                              productForm.setValue("slug", slug);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Slug (automatico)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="nome-do-produto" 
                          data-testid="input-product-slug"
                          readOnly
                          className="bg-muted text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={(val) => handleCategoryChange(val ? parseInt(val) : undefined)}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name} {cat.code && `(${cat.code})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">SKU (automatico)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Selecione categoria" 
                          data-testid="input-sku"
                          readOnly
                          className="bg-muted text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={productForm.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descricao Curta</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Breve descricao" data-testid="input-short-desc" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={productForm.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descricao Completa</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descricao detalhada" data-testid="input-long-desc" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={productForm.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Produto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product-type">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="merch">Brindes</SelectItem>
                          <SelectItem value="ebook">E-book</SelectItem>
                          <SelectItem value="escritorio">Escritorio</SelectItem>
                          <SelectItem value="vestuario">Vestuario</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="modelo"
                  render={({ field }) => {
                    const isVestuario = watchedProductType === "vestuario";
                    return (
                      <FormItem>
                        <FormLabel className={!isVestuario ? "text-muted-foreground" : ""}>Modelo</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                          disabled={!isVestuario}
                        >
                          <FormControl>
                            <SelectTrigger 
                              data-testid="select-modelo"
                              className={!isVestuario ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              <SelectValue placeholder={isVestuario ? "Selecione" : "Disponivel apenas para Vestuario"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {modeloOptions.map((modelo) => (
                              <SelectItem key={modelo} value={modelo}>
                                {modelo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              {/* Size and Color selection - always visible but disabled for non-clothing */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Sizes */}
                <FormField
                  control={productForm.control}
                  name="sizes"
                  render={({ field }) => {
                    const isVestuario = watchedProductType === "vestuario";
                    return (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className={!isVestuario ? "text-muted-foreground" : ""}>
                            Tamanhos Disponiveis
                          </FormLabel>
                        </div>
                        <FormDescription className={!isVestuario ? "text-muted-foreground/60" : ""}>
                          {isVestuario 
                            ? "Selecione os tamanhos disponiveis" 
                            : "Disponivel apenas para Vestuario"}
                        </FormDescription>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {brazilianSizes.map((size) => {
                              const isSelected = field.value?.includes(size);
                              return (
                                <Button
                                  key={size}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  className={`min-w-[48px] h-10 font-semibold ${!isVestuario ? "opacity-50 cursor-not-allowed" : ""}`}
                                  data-testid={`size-${size.toLowerCase()}`}
                                  disabled={!isVestuario}
                                  onClick={() => {
                                    if (!isVestuario) return;
                                    const currentSizes = field.value || [];
                                    if (isSelected) {
                                      field.onChange(currentSizes.filter(s => s !== size));
                                    } else {
                                      field.onChange([...currentSizes, size]);
                                    }
                                  }}
                                >
                                  {size}
                                </Button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* Colors */}
                <FormField
                  control={productForm.control}
                  name="colors"
                  render={({ field }) => {
                    const isVestuario = watchedProductType === "vestuario";
                    return (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <FormLabel className={!isVestuario ? "text-muted-foreground" : ""}>
                            Cores Disponiveis
                          </FormLabel>
                        </div>
                        <FormDescription className={!isVestuario ? "text-muted-foreground/60" : ""}>
                          {isVestuario 
                            ? "Selecione ou crie novas cores" 
                            : "Disponivel apenas para Vestuario"}
                        </FormDescription>
                        <FormControl>
                          <div className="space-y-3">
                            {/* Color buttons */}
                            <div className="flex flex-wrap gap-2">
                              {availableColors.map((color) => {
                                const isSelected = field.value?.includes(color);
                                return (
                                  <Button
                                    key={color}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className={`h-10 font-semibold ${!isVestuario ? "opacity-50 cursor-not-allowed" : ""}`}
                                    data-testid={`color-${color.toLowerCase()}`}
                                    disabled={!isVestuario}
                                    onClick={() => {
                                      if (!isVestuario) return;
                                      const currentColors = field.value || [];
                                      if (isSelected) {
                                        field.onChange(currentColors.filter(c => c !== color));
                                      } else {
                                        field.onChange([...currentColors, color]);
                                      }
                                    }}
                                  >
                                    {color}
                                  </Button>
                                );
                              })}
                            </div>
                            {/* Add new color input */}
                            {isVestuario && (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Nova cor..."
                                  value={newColorInput}
                                  onChange={(e) => setNewColorInput(e.target.value)}
                                  className="max-w-[150px]"
                                  data-testid="input-new-color"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      if (newColorInput.trim() && !availableColors.includes(newColorInput.trim())) {
                                        const newColor = newColorInput.trim();
                                        setAvailableColors(prev => [...prev, newColor]);
                                        field.onChange([...(field.value || []), newColor]);
                                        setNewColorInput("");
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-10"
                                  data-testid="button-add-color"
                                  onClick={() => {
                                    if (newColorInput.trim() && !availableColors.includes(newColorInput.trim())) {
                                      const newColor = newColorInput.trim();
                                      setAvailableColors(prev => [...prev, newColor]);
                                      field.onChange([...(field.value || []), newColor]);
                                      setNewColorInput("");
                                    }
                                  }}
                                >
                                  <PlusCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <FormField
                  control={productForm.control}
                  name="priceAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preco (R$)</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="99.90" data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preco Anterior</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="149.90" data-testid="input-compare-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="fulfillmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrega</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-fulfillment">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="physical">Fisico</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                          <SelectItem value="hybrid">Hibrido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="inventoryQty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-inventory"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={productForm.control}
                name="primaryImageUrl"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem do Produto (Principal)</FormLabel>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePrimaryImageChange}
                              disabled={isPrimaryImageUploading}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              data-testid="input-image-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isPrimaryImageUploading}
                              className="pointer-events-none"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {isPrimaryImageUploading ? `Enviando... ${primaryImageProgress}%` : "Fazer Upload"}
                            </Button>
                          </div>
                          {field.value && (
                            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                              <img
                                src={field.value}
                                alt="Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">ou cole uma URL:</span>
                          <Input
                            {...field}
                            placeholder="https://..."
                            className="flex-1"
                            data-testid="input-image-url"
                          />
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                )}
              />

              {editingProduct && (
                <div className="pt-2 border-t">
                  <ProductMediaManager
                    productId={editingProduct.id}
                    onPrimaryImageChange={(url) => productForm.setValue("primaryImageUrl", url)}
                  />
                </div>
              )}

              <div className="flex gap-6">
                <FormField
                  control={productForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-product-active"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Ativo (visivel para clientes)</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={productForm.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-product-featured"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Destaque</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {editingProduct ? "Salvar" : "Criar Produto"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informacoes da categoria
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome da categoria" data-testid="input-category-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="nome-da-categoria" data-testid="input-category-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sigla para SKU</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="EBK" 
                        maxLength={10}
                        className="uppercase"
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        data-testid="input-category-code" 
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Ex: EBK, BRDS, VEST (max 10 caracteres)</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descricao</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descricao da categoria" data-testid="input-category-desc" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem de Exibicao</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-category-order"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCategoryDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {editingCategory ? "Salvar" : "Criar Categoria"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmProduct} onOpenChange={() => setDeleteConfirmProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Produto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{deleteConfirmProduct?.name}"? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmProduct(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmProduct && deleteProductMutation.mutate(deleteConfirmProduct.id)}
              disabled={deleteProductMutation.isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmCategory} onOpenChange={() => setDeleteConfirmCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Categoria</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir "{deleteConfirmCategory?.name}"? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmCategory(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmCategory && deleteCategoryMutation.mutate(deleteConfirmCategory.id)}
              disabled={deleteCategoryMutation.isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
