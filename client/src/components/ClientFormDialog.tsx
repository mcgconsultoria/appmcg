import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Search, CheckCircle2 } from "lucide-react";
import { TaxIdField } from "@/components/TaxIdField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { brazilStates } from "@/lib/brazilStates";
import type { Client, InsertClient } from "@shared/schema";

const clientFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  tradeName: z.string().optional(),
  cnpj: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoEstadualIsento: z.boolean().optional().default(false),
  inscricaoMunicipal: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  segment: z.string().optional(),
  status: z.string().optional(),
  pipelineStage: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  estimatedValue: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

const segments = [
  "Transportadora",
  "Operador Logístico",
  "Indústria",
  "Varejo",
  "E-commerce",
  "Armazenagem",
  "Distribuidor",
  "Outro",
];

const statusOptions = [
  { value: "prospect", label: "Prospecto" },
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
];

const pipelineStages = [
  { value: "lead", label: "Lead" },
  { value: "contact", label: "Contato" },
  { value: "proposal", label: "Proposta" },
  { value: "negotiation", label: "Negociação" },
  { value: "closed", label: "Fechado" },
];

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingClient?: Client | null;
  onSuccess?: (client: Client) => void;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  editingClient = null,
  onSuccess,
}: ClientFormDialogProps) {
  const { toast } = useToast();

  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjFound, setCnpjFound] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      tradeName: "",
      cnpj: "",
      inscricaoEstadual: "",
      inscricaoEstadualIsento: false,
      inscricaoMunicipal: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      segment: "",
      status: "prospect",
      pipelineStage: "lead",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      estimatedValue: "",
      notes: "",
    },
  });

  const watchIEIsento = form.watch("inscricaoEstadualIsento");

  const handleCnpjLookup = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/[^\d]/g, "");
    if (cleanCnpj.length !== 14) return;

    setCnpjLoading(true);
    setCnpjFound(false);
    try {
      const response = await fetch(`/api/cnpj/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        if (data.razao_social) {
          form.setValue("name", data.razao_social);
        }
        if (data.nome_fantasia) {
          form.setValue("tradeName", data.nome_fantasia);
        }
        setCnpjFound(true);
        toast({ title: "Dados encontrados na Receita Federal" });
      } else {
        toast({ title: "CNPJ nao encontrado", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao consultar CNPJ", variant: "destructive" });
    } finally {
      setCnpjLoading(false);
    }
  };

  useEffect(() => {
    if (open && editingClient) {
      form.reset({
        name: editingClient.name,
        tradeName: editingClient.tradeName || "",
        cnpj: editingClient.cnpj || "",
        inscricaoEstadual: editingClient.inscricaoEstadual || "",
        inscricaoEstadualIsento: editingClient.inscricaoEstadualIsento || false,
        inscricaoMunicipal: editingClient.inscricaoMunicipal || "",
        email: editingClient.email || "",
        phone: editingClient.phone || "",
        address: editingClient.address || "",
        city: editingClient.city || "",
        state: editingClient.state || "",
        segment: editingClient.segment || "",
        status: editingClient.status || "prospect",
        pipelineStage: editingClient.pipelineStage || "lead",
        contactName: editingClient.contactName || "",
        contactPhone: editingClient.contactPhone || "",
        contactEmail: editingClient.contactEmail || "",
        estimatedValue: editingClient.estimatedValue?.toString() || "",
        notes: editingClient.notes || "",
      });
      setCnpjFound(false);
    } else if (open && !editingClient) {
      form.reset({
        name: "",
        tradeName: "",
        cnpj: "",
        inscricaoEstadual: "",
        inscricaoEstadualIsento: false,
        inscricaoMunicipal: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        segment: "",
        status: "prospect",
        pipelineStage: "lead",
        contactName: "",
        contactPhone: "",
        contactEmail: "",
        estimatedValue: "",
        notes: "",
      });
      setCnpjFound(false);
    }
  }, [open, editingClient, form]);

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const payload: InsertClient = {
        ...data,
        companyId: 1,
        estimatedValue: data.estimatedValue || undefined,
      };
      const response = await apiRequest("POST", "/api/clients", payload);
      return response.json();
    },
    onSuccess: (newClient: Client) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      onOpenChange(false);
      form.reset();
      toast({ title: "Cliente criado com sucesso!" });
      onSuccess?.(newClient);
    },
    onError: () => {
      toast({ title: "Erro ao criar cliente", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      if (!editingClient) return;
      const response = await apiRequest("PATCH", `/api/clients/${editingClient.id}`, data);
      return response.json();
    },
    onSuccess: (updatedClient: Client) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      onOpenChange(false);
      form.reset();
      toast({ title: "Cliente atualizado com sucesso!" });
      onSuccess?.(updatedClient);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar cliente", variant: "destructive" });
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingClient ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {editingClient
              ? "Atualize as informações do cliente"
              : "Preencha os dados para cadastrar um novo cliente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ/CPF</FormLabel>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <TaxIdField
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                          setCnpjFound(false);
                        }}
                        label=""
                        data-testid="input-client-cnpj"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCnpjLookup(field.value || "")}
                      disabled={cnpjLoading || !field.value || field.value.replace(/[^\d]/g, "").length !== 14}
                      data-testid="button-client-cnpj-lookup"
                    >
                      {cnpjLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : cnpjFound ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Digite o CNPJ e clique na lupa para buscar dados automaticamente</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="inscricaoEstadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscricao Estadual (I.E.)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={watchIEIsento ? "ISENTO" : "Inscricao Estadual"}
                        disabled={watchIEIsento}
                        data-testid="input-client-ie"
                        {...field}
                        value={watchIEIsento ? "" : field.value}
                      />
                    </FormControl>
                    <div className="flex items-center gap-2 mt-1">
                      <Checkbox
                        id="client-ie-isento"
                        checked={form.watch("inscricaoEstadualIsento")}
                        onCheckedChange={(checked) => {
                          form.setValue("inscricaoEstadualIsento", !!checked);
                          if (checked) form.setValue("inscricaoEstadual", "");
                        }}
                        data-testid="checkbox-client-ie-isento"
                      />
                      <label htmlFor="client-ie-isento" className="text-xs text-muted-foreground cursor-pointer">
                        Isento
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inscricaoMunicipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscricao Municipal (I.M.)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Inscricao Municipal"
                        data-testid="input-client-im"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razao Social *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-trade-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segmento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client-segment">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {segments.map((seg) => (
                          <SelectItem key={seg} value={seg}>
                            {seg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-client-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(00) 00000-0000" data-testid="input-client-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-client-city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client-state">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brazilStates.map((state) => (
                          <SelectItem key={state.uf} value={state.uf}>
                            {state.uf} - {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client-status">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pipelineStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etapa do Pipeline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-client-pipeline">
                          <SelectValue placeholder="Etapa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pipelineStages.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Estimado (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} data-testid="input-client-value" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Contato Principal</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} data-testid="textarea-client-notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-save-client">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingClient ? (
                  "Atualizar"
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
