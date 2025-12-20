import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminPartnership } from "@shared/schema";

const partnerTypes = [
  { value: "tecnologia", label: "Tecnologia" },
  { value: "sindicato", label: "Sindicato" },
  { value: "escola", label: "Escola/Instituicao" },
  { value: "revenda", label: "Revenda" },
  { value: "outro", label: "Outro" },
];

const statusLabels: Record<string, string> = {
  prospecting: "Prospecao",
  negotiating: "Negociando",
  active: "Ativo",
  paused: "Pausado",
  ended: "Encerrado",
};

const statusColors: Record<string, string> = {
  prospecting: "bg-gray-500",
  negotiating: "bg-yellow-500",
  active: "bg-green-500",
  paused: "bg-orange-500",
  ended: "bg-red-500",
};

export default function AdminParcerias() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<AdminPartnership | null>(null);
  const [form, setForm] = useState({
    partnerName: "",
    partnerType: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    description: "",
    benefits: "",
    status: "prospecting",
    ownerName: "",
    notes: "",
  });

  const { data: partnerships = [], isLoading } = useQuery<AdminPartnership[]>({
    queryKey: ["/api/admin/partnerships"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/partnerships", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partnerships"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Parceria criada com sucesso" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/partnerships/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partnerships"] });
      setIsDialogOpen(false);
      setEditingPartnership(null);
      resetForm();
      toast({ title: "Parceria atualizada com sucesso" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/partnerships/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/partnerships"] });
      toast({ title: "Parceria removida com sucesso" });
    },
  });

  const resetForm = () => {
    setForm({
      partnerName: "",
      partnerType: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      description: "",
      benefits: "",
      status: "prospecting",
      ownerName: "",
      notes: "",
    });
  };

  const handleEdit = (partnership: AdminPartnership) => {
    setEditingPartnership(partnership);
    setForm({
      partnerName: partnership.partnerName,
      partnerType: partnership.partnerType || "",
      contactName: partnership.contactName || "",
      contactEmail: partnership.contactEmail || "",
      contactPhone: partnership.contactPhone || "",
      website: partnership.website || "",
      description: partnership.description || "",
      benefits: partnership.benefits || "",
      status: partnership.status || "prospecting",
      ownerName: partnership.ownerName || "",
      notes: partnership.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingPartnership) {
      updateMutation.mutate({ id: editingPartnership.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const groupedPartnerships = partnerships.reduce((acc, p) => {
    const type = p.partnerType || "outro";
    if (!acc[type]) acc[type] = [];
    acc[type].push(p);
    return acc;
  }, {} as Record<string, AdminPartnership[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-parcerias-title">Parcerias</h1>
            <p className="text-muted-foreground">Gestao de parcerias estrategicas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingPartnership(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-partnership">
                <Plus className="h-4 w-4 mr-2" />
                Nova Parceria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPartnership ? "Editar Parceria" : "Nova Parceria"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Parceiro *</Label>
                    <Input
                      value={form.partnerName}
                      onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
                      data-testid="input-partner-name"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={form.partnerType}
                      onValueChange={(v) => setForm({ ...form, partnerType: v })}
                    >
                      <SelectTrigger data-testid="select-partner-type">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {partnerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Contato</Label>
                    <Input
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      data-testid="input-partner-contact"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      data-testid="input-partner-email"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      data-testid="input-partner-phone"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      data-testid="input-partner-website"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) => setForm({ ...form, status: v })}
                    >
                      <SelectTrigger data-testid="select-partner-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospecting">Prospecao</SelectItem>
                        <SelectItem value="negotiating">Negociando</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="paused">Pausado</SelectItem>
                        <SelectItem value="ended">Encerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Descricao da Parceria</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Beneficios</Label>
                  <Textarea
                    value={form.benefits}
                    onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Responsavel MCG</Label>
                    <Input
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Observacoes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!form.partnerName || createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-partnership"
                >
                  {editingPartnership ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : partnerships.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma parceria cadastrada
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedPartnerships).map(([type, items]) => (
              <div key={type}>
                <h2 className="text-lg font-semibold mb-3 capitalize">
                  {partnerTypes.find((t) => t.value === type)?.label || type}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((partnership) => (
                    <Card key={partnership.id} data-testid={`card-partnership-${partnership.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{partnership.partnerName}</CardTitle>
                          <Badge className={`${statusColors[partnership.status || "prospecting"]} text-white text-xs`}>
                            {statusLabels[partnership.status || "prospecting"]}
                          </Badge>
                        </div>
                        {partnership.description && (
                          <CardDescription className="line-clamp-2">{partnership.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          {partnership.contactName && (
                            <p><span className="text-muted-foreground">Contato:</span> {partnership.contactName}</p>
                          )}
                          {partnership.ownerName && (
                            <p><span className="text-muted-foreground">Responsavel:</span> {partnership.ownerName}</p>
                          )}
                          {partnership.website && (
                            <a
                              href={partnership.website.startsWith("http") ? partnership.website : `https://${partnership.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Website
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(partnership)}>
                            <Pencil className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm("Remover esta parceria?")) {
                                deleteMutation.mutate(partnership.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
