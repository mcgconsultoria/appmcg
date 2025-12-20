import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Vendedores() {
  return (
    <AppLayout title="Vendedores">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserRound className="h-6 w-6" />
              Vendedores
            </h1>
            <p className="text-muted-foreground">
              Gerencie sua equipe de vendas
            </p>
          </div>
          <Button data-testid="button-add-vendedor">
            <Plus className="h-4 w-4 mr-2" />
            Novo Vendedor
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar vendedor..." 
              className="pl-9"
              data-testid="input-search-vendedor"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendedores</CardTitle>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
              <UserRound className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta do Mes</CardTitle>
              <UserRound className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">R$ 0</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendedores</CardTitle>
            <CardDescription>
              Cadastre e gerencie os vendedores da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <UserRound className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vendedor cadastrado</p>
              <p className="text-sm mt-2">Clique em "Novo Vendedor" para comecar</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
