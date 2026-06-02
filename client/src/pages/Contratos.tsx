import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Clock, CheckCircle2, XCircle, Eye, AlertCircle } from "lucide-react";
import type { ContractAgreement } from "@shared/schema";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Pendente",    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  sent:      { label: "Enviado",     color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: AlertCircle },
  viewed:    { label: "Visualizado", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Eye },
  signed:    { label: "Assinado",    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  expired:   { label: "Expirado",    color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", icon: XCircle },
  cancelled: { label: "Cancelado",   color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

function formatDate(date: string | Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

function typeLabel(type: string) {
  if (type === "consultoria") return "Consultoria";
  if (type === "aplicativo") return "Aplicativo";
  return type;
}

export default function Contratos() {
  const { data: agreements = [], isLoading } = useQuery<ContractAgreement[]>({
    queryKey: ["/api/contract-agreements"],
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Contratos</h1>
          <p className="text-muted-foreground mt-1">Visualize e acompanhe seus contratos com a MCG Consultoria</p>
        </div>

        {isLoading && (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        )}

        {!isLoading && agreements.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <FileText className="h-12 w-12 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">Nenhum contrato encontrado</p>
              <p className="text-sm text-muted-foreground">
                Quando contratos forem emitidos, eles aparecerão aqui para assinatura e consulta.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {agreements.map((agreement) => {
            const status = statusConfig[agreement.status ?? "pending"] ?? statusConfig["pending"];
            const StatusIcon = status.icon;

            return (
              <Card key={agreement.id} data-testid={`card-contrato-${agreement.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          Contrato de {typeLabel(agreement.contractType)}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Emitido em {formatDate(agreement.issuedAt ?? agreement.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${status.color} border-0 flex items-center gap-1 shrink-0`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-1">
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <p className="font-medium">{typeLabel(agreement.contractType)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Visualizado em</p>
                      <p className="font-medium">{formatDate(agreement.viewedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Assinado em</p>
                      <p className="font-medium">{formatDate(agreement.signedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Validade</p>
                      <p className="font-medium">{formatDate(agreement.expiresAt)}</p>
                    </div>
                  </div>

                  {(agreement.providerSignUrl || agreement.signedPdfUrl) && (
                    <div className="flex gap-2 mt-4">
                      {agreement.providerSignUrl && agreement.status !== "signed" && (
                        <Button
                          size="sm"
                          data-testid={`button-assinar-${agreement.id}`}
                          onClick={() => window.open(agreement.providerSignUrl!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Assinar Contrato
                        </Button>
                      )}
                      {agreement.signedPdfUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-pdf-${agreement.id}`}
                          onClick={() => window.open(agreement.signedPdfUrl!, "_blank")}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver PDF Assinado
                        </Button>
                      )}
                    </div>
                  )}

                  {agreement.notes && (
                    <p className="mt-3 text-sm text-muted-foreground border-t pt-3">{agreement.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
