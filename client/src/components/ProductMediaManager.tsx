import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Plus,
  Loader2,
  GripVertical,
  Download,
} from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProductMedia } from "@shared/schema";

interface ProductMediaManagerProps {
  productId: number;
  onPrimaryImageChange?: (url: string) => void;
}

export function ProductMediaManager({
  productId,
  onPrimaryImageChange,
}: ProductMediaManagerProps) {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [urlInput, setUrlInput] = useState("");
  const [altText, setAltText] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<number>(1);

  const { data: media, isLoading } = useQuery<ProductMedia[]>({
    queryKey: ["/api/admin/store/products", productId, "media"],
  });

  const [pendingFileInfo, setPendingFileInfo] = useState<{ size: number; type: string } | null>(null);

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await createMediaMutation.mutateAsync({
        mediaType,
        url: response.objectPath,
        position: selectedPosition,
        altText: altText || undefined,
        fileSize: pendingFileInfo?.size,
        mimeType: pendingFileInfo?.type,
      });
      setPendingFileInfo(null);
      resetDialog();
    },
    onError: (error) => {
      setPendingFileInfo(null);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMediaMutation = useMutation({
    mutationFn: (data: {
      mediaType: string;
      url: string;
      position: number;
      altText?: string;
      fileSize?: number;
      mimeType?: string;
    }) =>
      apiRequest(`/api/admin/store/products/${productId}/media`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/store/products", productId, "media"],
      });
      toast({ title: "Mídia adicionada com sucesso" });
      if (variables.position === 1 && variables.mediaType === "image") {
        onPrimaryImageChange?.(variables.url);
      }
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/store/products", productId, "media"],
      });
      const message = error?.message || "Erro ao adicionar mídia";
      toast({ title: message, variant: "destructive" });
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: number) =>
      apiRequest(`/api/admin/store/products/${productId}/media/${mediaId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/store/products", productId, "media"],
      });
      toast({ title: "Mídia removida" });
    },
    onError: () => {
      toast({ title: "Erro ao remover mídia", variant: "destructive" });
    },
  });

  const resetDialog = () => {
    setShowAddDialog(false);
    setMediaType("image");
    setUrlInput("");
    setAltText("");
    setSelectedPosition(getNextAvailablePosition());
  };

  const getNextAvailablePosition = () => {
    if (!media || media.length === 0) return 1;
    const usedPositions = media.map((m) => m.position);
    for (let i = 1; i <= 10; i++) {
      if (!usedPositions.includes(i)) return i;
    }
    return 1;
  };

  const getAvailablePositions = () => {
    const usedPositions = media?.map((m) => m.position) || [];
    const positions = [];
    for (let i = 1; i <= 10; i++) {
      if (!usedPositions.includes(i)) {
        positions.push(i);
      }
    }
    return positions;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione uma imagem ou vídeo.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: isVideo
          ? "Vídeos devem ter no máximo 200 MB."
          : "Imagens devem ter no máximo 10 MB.",
        variant: "destructive",
      });
      return;
    }

    setMediaType(isVideo ? "video" : "image");
    setPendingFileInfo({ size: file.size, type: file.type });
    await uploadFile(file);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    await createMediaMutation.mutateAsync({
      mediaType,
      url: urlInput.trim(),
      position: selectedPosition,
      altText: altText || undefined,
    });
    resetDialog();
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Label>Galeria de Mídia</Label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  const sortedMedia = [...(media || [])].sort((a, b) => a.position - b.position);
  const canAddMore = (media?.length || 0) < 10;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Galeria de Mídia ({media?.length || 0}/10)</Label>
        {canAddMore && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedPosition(getNextAvailablePosition());
              setShowAddDialog(true);
            }}
            data-testid="button-add-media"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {sortedMedia.map((item) => (
          <Card
            key={item.id}
            className="relative group overflow-visible"
            data-testid={`media-item-${item.id}`}
          >
            <CardContent className="p-0">
              <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
                {item.mediaType === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.altText || `Imagem ${item.position}`}
                    className="w-full h-full object-cover"
                  />
                )}
                <Badge
                  className="absolute top-1 left-1 text-xs"
                  variant="secondary"
                >
                  {item.position}
                </Badge>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.mediaType === "video" && (
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-6 w-6"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = item.url;
                        link.download = `video-${item.position}.mp4`;
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      data-testid={`button-download-media-${item.id}`}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-6 w-6"
                    onClick={() => deleteMediaMutation.mutate(item.id)}
                    disabled={deleteMediaMutation.isPending}
                    data-testid={`button-delete-media-${item.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => {
              setSelectedPosition(getNextAvailablePosition());
              setShowAddDialog(true);
            }}
            className="aspect-square rounded-md border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover-elevate cursor-pointer"
            data-testid="button-add-media-slot"
          >
            <Plus className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Adicionar</span>
          </button>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Mídia</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Posição</Label>
                <Select
                  value={selectedPosition.toString()}
                  onValueChange={(val) => setSelectedPosition(parseInt(val))}
                >
                  <SelectTrigger data-testid="select-media-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePositions().map((pos) => (
                      <SelectItem key={pos} value={pos.toString()}>
                        {pos === 1 ? "1 (Principal)" : pos.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={mediaType}
                  onValueChange={(val) => setMediaType(val as "image" | "video")}
                >
                  <SelectTrigger data-testid="select-media-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Imagem
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Vídeo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Texto Alternativo (opcional)</Label>
              <Input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Descrição da mídia..."
                data-testid="input-media-alt"
              />
            </div>

            <div className="space-y-3">
              <Label>Fazer Upload</Label>
              <div className="relative">
                <input
                  type="file"
                  accept={mediaType === "video" ? "video/*" : "image/*"}
                  onChange={handleFileChange}
                  disabled={isUploading || createMediaMutation.isPending}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  data-testid="input-media-file"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full pointer-events-none"
                  disabled={isUploading || createMediaMutation.isPending}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando... {progress}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar{" "}
                      {mediaType === "video" ? "Vídeo (até 200 MB)" : "Imagem (até 10 MB)"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou cole uma URL
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1"
                data-testid="input-media-url"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || createMediaMutation.isPending}
                data-testid="button-add-url"
              >
                {createMediaMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Adicionar"
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetDialog}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
