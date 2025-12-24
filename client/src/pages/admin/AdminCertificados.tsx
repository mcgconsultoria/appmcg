import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Key,
  Plus,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, isPast } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DigitalCertificate } from "@shared/schema";

export default function AdminCertificados() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "A1",
    cnpj: "",
    password: "",
    file: null as File | null,
  });

  const { data: certificates = [], isLoading } = useQuery<DigitalCertificate[]>({
    queryKey: ["/api/digital-certificates"],
  });

  const uploadCertificate = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/digital-certificates", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/digital-certificates"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Certificado carregado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao carregar certificado", description: error.message, variant: "destructive" });
    },
  });

  const deleteCertificate = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/digital-certificates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/digital-certificates"] });
      toast({ title: "Certificado removido com sucesso" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "A1",
      cnpj: "",
      password: "",
      file: null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
  };

  const handleSubmit = () => {
    if (!formData.file) {
      toast({ title: "Selecione um arquivo de certificado", variant: "destructive" });
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("cnpj", formData.cnpj);
    data.append("password", formData.password);
    data.append("certificate", formData.file);

    uploadCertificate.mutate(data);
  };

  const getCertificateStatus = (cert: DigitalCertificate) => {
    if (!cert.validUntil) return { status: "unknown", label: "Status desconhecido", color: "text-muted-foreground" };
    
    const validUntil = new Date(cert.validUntil);
    const daysRemaining = differenceInDays(validUntil, new Date());
    
    if (isPast(validUntil)) {
      return { status: "expired", label: "Expirado", color: "text-red-600", icon: AlertTriangle };
    }
    if (daysRemaining <= 30) {
      return { status: "expiring", label: `Expira em ${daysRemaining} dias`, color: "text-amber-600", icon: Clock };
    }
    return { status: "valid", label: "Válido", color: "text-emerald-600", icon: CheckCircle2 };
  };

  return (
    <AppLayout title="Admin MCG">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Certificados Digitais
            </h1>
            <p className="text-muted-foreground">
              Gerencie certificados A1/A3 para emissao de NFS-e
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
            data-testid="button-add-certificate"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Certificado
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sobre Certificados Digitais</CardTitle>
            <CardDescription>
              O certificado digital e necessario para emitir Notas Fiscais de Serviço Eletronicas (NFS-e)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-md">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4" />
                  Certificado A1
                </h4>
                <p className="text-sm text-muted-foreground">
                  Arquivo digital (.pfx ou .p12) armazenado no computador. Validade de 1 ano. 
                  Mais pratico para sistemas automatizados.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-md">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Certificado A3
                </h4>
                <p className="text-sm text-muted-foreground">
                  Armazenado em token USB ou smart card. Validade de 1 a 3 anos.
                  Mais seguro, mas requer hardware especifico.
                </p>
              </div>
            </div>
            <div className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-md">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Importante:</strong> Para emissao de NFS-e em Curitiba/PR, voce precisara de um certificado 
                  digital e-CNPJ válido. Recomendamos adquirir de uma Autoridade Certificadora credenciada pelo ICP-Brasil 
                  (como Serasa, Certisign, ou outras).
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum certificado digital cadastrado.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione um certificado A1 (.pfx ou .p12) para habilitar a emissao de NFS-e.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => {
              const status = getCertificateStatus(cert);
              const StatusIcon = status.icon || CheckCircle2;
              
              return (
                <Card key={cert.id} data-testid={`card-certificate-${cert.id}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        {cert.name}
                      </span>
                      <Badge variant={cert.type === "A1" ? "default" : "secondary"}>
                        {cert.type}
                      </Badge>
                    </CardTitle>
                    {cert.cnpj && (
                      <CardDescription>CNPJ: {cert.cnpj}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cert.issuer && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Emissor:</span>
                        <p className="font-medium">{cert.issuer}</p>
                      </div>
                    )}
                    {cert.validFrom && cert.validUntil && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Validade:</span>
                        <p>
                          {format(new Date(cert.validFrom), "dd/MM/yyyy", { locale: ptBR })} a{" "}
                          {format(new Date(cert.validUntil), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    )}
                    <div className={`flex items-center gap-2 p-2 rounded-md bg-muted/50 ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{status.label}</span>
                    </div>
                    <div className="flex items-center justify-end pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Remover este certificado?")) {
                            deleteCertificate.mutate(cert.id);
                          }
                        }}
                        data-testid={`button-delete-certificate-${cert.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Carregar Certificado Digital</DialogTitle>
              <DialogDescription>
                Selecione o arquivo do certificado (.pfx ou .p12) e informe a senha
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Certificado</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Certificado MCG Consultoria"
                  data-testid="input-certificate-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger data-testid="select-certificate-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A1">A1 (Arquivo)</SelectItem>
                      <SelectItem value="A3">A3 (Token/Cartao)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    data-testid="input-certificate-cnpj"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Arquivo do Certificado (.pfx ou .p12)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pfx,.p12"
                    onChange={handleFileChange}
                    className="flex-1"
                    data-testid="input-certificate-file"
                  />
                </div>
                {formData.file && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {formData.file.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Senha do Certificado</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Senha fornecida pela Autoridade Certificadora"
                  data-testid="input-certificate-password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploadCertificate.isPending}
                  data-testid="button-save-certificate"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadCertificate.isPending ? "Carregando..." : "Carregar Certificado"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
