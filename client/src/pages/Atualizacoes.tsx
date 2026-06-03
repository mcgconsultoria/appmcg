import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, CalendarDays } from "lucide-react";
import { appUpdates } from "@/lib/appUpdates";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export default function Atualizacoes() {
  const [search, setSearch] = useState("");

  const filtered = appUpdates.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.menu.toLowerCase().includes(q) ||
      (u.submenu || "").toLowerCase().includes(q) ||
      u.item.toLowerCase().includes(q) ||
      u.description.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout title="Atualizações" subtitle="Histórico de novas funcionalidades e melhorias da plataforma">
      <div className="space-y-6 max-w-4xl">

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por menu, item ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-atualizacoes"
          />
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Nenhuma atualização encontrada.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((update, idx) => (
              <Card key={idx} data-testid={`card-update-${idx}`} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatDate(update.date)}</span>
                    </div>
                    <Badge variant="outline" className="text-xs" data-testid={`badge-menu-${idx}`}>
                      {update.menu}
                    </Badge>
                    {update.submenu && (
                      <Badge variant="secondary" className="text-xs" data-testid={`badge-submenu-${idx}`}>
                        {update.submenu}
                      </Badge>
                    )}
                    <span className="font-semibold text-sm" data-testid={`text-item-${idx}`}>
                      {update.item}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4 pt-0">
                  <p className="text-sm text-muted-foreground" data-testid={`text-desc-${idx}`}>
                    {update.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
