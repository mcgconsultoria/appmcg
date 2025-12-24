import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquareHeart } from "lucide-react";

export default function Pesquisas() {
  return (
    <AppLayout title="Pesquisas de Satisfação" subtitle="Acompanhe o feedback dos seus clientes">
      <div className="p-6">
        <Card data-testid="card-pesquisas-info">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareHeart className="h-5 w-5" />
              Pesquisas de Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquareHeart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Modulo em Construcao</h3>
              <p className="max-w-md mx-auto">
                Esta pagina permitira criar e gerenciar pesquisas de satisfação 
                para medir a qualidade do atendimento pos-venda e fidelizacao de clientes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
