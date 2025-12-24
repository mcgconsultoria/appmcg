import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminLead, AdminProposal, AdminContract } from "@shared/schema";

const stageLabels: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualificado",
  proposal: "Proposta",
  negotiation: "Negociação",
  closed_won: "Fechado Ganho",
  closed_lost: "Fechado Perdido",
};

const stageColors: Record<string, string> = {
  lead: "bg-gray-500",
  qualified: "bg-blue-500",
  proposal: "bg-yellow-500",
  negotiation: "bg-purple-500",
  closed_won: "bg-green-500",
  closed_lost: "bg-red-500",
};

export default function AdminComercial() {
  const { toast } = useToast();
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<AdminLead | null>(null);
  const [leadForm, setLeadForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    city: "",
    state: "",
    segment: "",
    source: "",
    interest: "",
    stage: "lead",
    estimatedValue: "",
    notes: "",
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<AdminLead[]>({
    queryKey: ["/api/admin/leads"],
  });

  const { data: proposals = [] } = useQuery<AdminProposal[]>({
    queryKey: ["/api/admin/proposals"],
  });

  const { data: contracts = [] } = useQuery<AdminContract[]>({
    queryKey: ["/api/admin/contracts"],
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/admin/leads", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsLeadDialogOpen(false);
      resetForm();
      toast({ title: "Lead criado com sucesso" });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/leads/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setIsLeadDialogOpen(false);
      setEditingLead(null);
      resetForm();
      toast({ title: "Lead atualizado com sucesso" });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/leads/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      toast({ title: "Lead removido com sucesso" });
    },
  });

  const resetForm = () => {
    setLeadForm({
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      city: "",
      state: "",
      segment: "",
      source: "",
      interest: "",
      stage: "lead",
      estimatedValue: "",
      notes: "",
    });
  };

  const handleEditLead = (lead: AdminLead) => {
    setEditingLead(lead);
    setLeadForm({
      companyName: lead.companyName,
      contactName: lead.contactName || "",
      contactEmail: lead.contactEmail || "",
      contactPhone: lead.contactPhone || "",
      city: lead.city || "",
      state: lead.state || "",
      segment: lead.segment || "",
      source: lead.source || "",
      interest: lead.interest || "",
      stage: lead.stage || "lead",
      estimatedValue: lead.estimatedValue || "",
      notes: lead.notes || "",
    });
    setIsLeadDialogOpen(true);
  };

  const handleSubmitLead = () => {
    const data = {
      ...leadForm,
      estimatedValue: leadForm.estimatedValue || null,
    };

    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, data });
    } else {
      createLeadMutation.mutate(data);
    }
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  return (
    <AppLayout title="Gestão Comercial MCG" subtitle="Leads, propostas e contratos">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-admin-comercial-title">Gestão Comercial MCG</h1>
            <p className="text-muted-foreground">Leads, Pipeline, Propostas e Contratos</p>
          </div>
        </div>

        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
            <TabsTrigger value="proposals">Propostas ({proposals.length})</TabsTrigger>
            <TabsTrigger value="contracts">Contratos ({contracts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle>Leads</CardTitle>
                <Dialog open={isLeadDialogOpen} onOpenChange={(open) => {
                  setIsLeadDialogOpen(open);
                  if (!open) {
                    setEditingLead(null);
                    resetForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-lead">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Empresa *</Label>
                          <Input
                            value={leadForm.companyName}
                            onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                            data-testid="input-lead-company"
                          />
                        </div>
                        <div>
                          <Label>Contato</Label>
                          <Input
                            value={leadForm.contactName}
                            onChange={(e) => setLeadForm({ ...leadForm, contactName: e.target.value })}
                            data-testid="input-lead-contact"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={leadForm.contactEmail}
                            onChange={(e) => setLeadForm({ ...leadForm, contactEmail: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Telefone</Label>
                          <Input
                            value={leadForm.contactPhone}
                            onChange={(e) => setLeadForm({ ...leadForm, contactPhone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Cidade</Label>
                          <Input
                            value={leadForm.city}
                            onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>UF</Label>
                          <Input
                            value={leadForm.state}
                            onChange={(e) => setLeadForm({ ...leadForm, state: e.target.value })}
                            maxLength={2}
                          />
                        </div>
                        <div>
                          <Label>Segmento</Label>
                          <Input
                            value={leadForm.segment}
                            onChange={(e) => setLeadForm({ ...leadForm, segment: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Origem</Label>
                          <Select
                            value={leadForm.source}
                            onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="indicação">Indicacao</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="evento">Evento</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Interesse</Label>
                          <Select
                            value={leadForm.interest}
                            onValueChange={(v) => setLeadForm({ ...leadForm, interest: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assinatura">Assinatura</SelectItem>
                              <SelectItem value="consultoria">Consultoria</SelectItem>
                              <SelectItem value="ambos">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Estagio</Label>
                          <Select
                            value={leadForm.stage}
                            onValueChange={(v) => setLeadForm({ ...leadForm, stage: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lead">Lead</SelectItem>
                              <SelectItem value="qualified">Qualificado</SelectItem>
                              <SelectItem value="proposal">Proposta</SelectItem>
                              <SelectItem value="negotiation">Negociação</SelectItem>
                              <SelectItem value="closed_won">Fechado Ganho</SelectItem>
                              <SelectItem value="closed_lost">Fechado Perdido</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Valor Estimado (R$)</Label>
                        <Input
                          type="number"
                          value={leadForm.estimatedValue}
                          onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Observações</Label>
                        <Textarea
                          value={leadForm.notes}
                          onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsLeadDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSubmitLead}
                        disabled={!leadForm.companyName || createLeadMutation.isPending || updateLeadMutation.isPending}
                        data-testid="button-save-lead"
                      >
                        {editingLead ? "Atualizar" : "Criar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {leadsLoading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : leads.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum lead cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between gap-4 p-3 border rounded-md"
                        data-testid={`card-lead-${lead.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{lead.companyName}</p>
                            <Badge className={`${stageColors[lead.stage || "lead"]} text-white text-xs`}>
                              {stageLabels[lead.stage || "lead"]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {lead.contactName} {lead.city && `- ${lead.city}/${lead.state}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(lead.estimatedValue)}</p>
                          <p className="text-xs text-muted-foreground">{lead.interest}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEditLead(lead)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("Remover este lead?")) {
                                deleteLeadMutation.mutate(lead.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proposals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Propostas</CardTitle>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <p className="text-muted-foreground">Nenhuma proposta cadastrada</p>
                ) : (
                  <div className="space-y-2">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{proposal.title}</p>
                          <Badge variant="outline">{proposal.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{proposal.clientName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Contratos</CardTitle>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum contrato cadastrado</p>
                ) : (
                  <div className="space-y-2">
                    {contracts.map((contract) => (
                      <div key={contract.id} className="p-3 border rounded-md">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{contract.clientName}</p>
                          <Badge variant="outline">{contract.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{contract.serviceType}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
