import { Card } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Projetos</h1>
        <p className="text-muted-foreground">Gerencie projetos e iniciativas</p>
      </div>

      <Card className="p-12 text-center">
        <FolderKanban className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Em Desenvolvimento</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          O modulo de gestao de projetos com acompanhamento de progresso, tarefas e indicadores esta sendo desenvolvido.
        </p>
      </Card>
    </div>
  );
}
