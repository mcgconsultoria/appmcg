import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Calendario Comercial</h1>
        <p className="text-muted-foreground">Planeje suas atividades comerciais</p>
      </div>

      <Card className="p-12 text-center">
        <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          O calendario comercial com visao semanal, eventos, reunioes e integracao com o pipeline esta sendo desenvolvido.
        </p>
      </Card>
    </div>
  );
}
