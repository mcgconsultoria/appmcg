import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Eye,
  FolderOpen,
  Truck,
  Building2,
  Package,
  ShoppingCart,
  Factory,
  ExternalLink,
} from "lucide-react";

const segments = [
  {
    id: "transportadora",
    name: "Transportadora",
    icon: Truck,
    materials: [
      { id: 1, title: "Proposta Comercial Transporte", type: "template" },
      { id: 2, title: "Checklist de Prospecção", type: "checklist" },
      { id: 3, title: "Argumentário de Vendas", type: "documento" },
      { id: 4, title: "Tabela de Fretes Modelo", type: "planilha" },
    ],
  },
  {
    id: "operador",
    name: "Operador Logístico",
    icon: Package,
    materials: [
      { id: 5, title: "Proposta Operação Integrada", type: "template" },
      { id: 6, title: "SLA de Serviços", type: "documento" },
      { id: 7, title: "Apresentação Institucional", type: "apresentação" },
    ],
  },
  {
    id: "industria",
    name: "Indústria",
    icon: Factory,
    materials: [
      { id: 8, title: "Proposta Supply Chain", type: "template" },
      { id: 9, title: "Estudo de Caso", type: "documento" },
      { id: 10, title: "ROI de Terceirização", type: "planilha" },
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    icon: ShoppingCart,
    materials: [
      { id: 11, title: "Proposta Fulfillment", type: "template" },
      { id: 12, title: "SLA Last Mile", type: "documento" },
      { id: 13, title: "Integração de Sistemas", type: "apresentação" },
    ],
  },
  {
    id: "distribuidor",
    name: "Distribuidor",
    icon: Building2,
    materials: [
      { id: 14, title: "Proposta Distribuição", type: "template" },
      { id: 15, title: "Modelo de Roteirização", type: "planilha" },
    ],
  },
];

function getTypeBadge(type: string) {
  const types: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    template: { label: "Template", variant: "default" },
    checklist: { label: "Checklist", variant: "secondary" },
    documento: { label: "Documento", variant: "outline" },
    planilha: { label: "Planilha", variant: "secondary" },
    apresentacao: { label: "Apresentação", variant: "outline" },
  };
  return types[type] || { label: type, variant: "outline" };
}

export default function Marketing() {
  return (
    <AppLayout title="Marketing" subtitle="Materiais de apoio por segmento">
      <div className="space-y-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Biblioteca de Materiais</h2>
                <p className="text-primary-foreground/80">
                  Acesse templates, checklists e documentos organizados por segmento de cliente
                </p>
              </div>
              <Button variant="secondary" data-testid="button-upload-material">
                <FileText className="h-4 w-4 mr-2" />
                Enviar Material
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {segments.map((segment) => (
            <Card key={segment.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <segment.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {segment.materials.length} materiais disponíveis
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Ver todos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {segment.materials.map((material) => {
                    const typeInfo = getTypeBadge(material.type);
                    return (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                        data-testid={`material-${material.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{material.title}</p>
                            <Badge variant={typeInfo.variant} size="sm" className="mt-1">
                              {typeInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-view-${material.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-download-${material.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Serviços MCG Consultoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Diagnóstico de Maturidade Comercial</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Avaliação completa da estrutura comercial com checklist de 15 departamentos
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Saiba mais
                </Button>
              </div>
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Estruturação de Vendas</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Implementação de processos comerciais eficientes da prospecção ao fechamento
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Saiba mais
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
