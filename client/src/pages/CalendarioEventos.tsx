import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock, ExternalLink } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { EventoComercial } from "@shared/schema";

const statusColors: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  realizado: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  adiado: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const catColors: Record<string, string> = {
  "Ligação": "bg-gray-200 dark:bg-gray-700",
  "Reunião Online": "bg-indigo-200 dark:bg-indigo-800",
  "Reunião Presencial": "bg-blue-200 dark:bg-blue-800",
  "Visita Comercial": "bg-teal-200 dark:bg-teal-800",
  "Feira": "bg-purple-200 dark:bg-purple-800",
  "Evento": "bg-pink-200 dark:bg-pink-800",
  "Convenção": "bg-orange-200 dark:bg-orange-800",
  "Lançamento": "bg-yellow-200 dark:bg-yellow-800",
  "BID": "bg-red-200 dark:bg-red-800",
  "Licitação": "bg-rose-200 dark:bg-rose-800",
};

export default function CalendarioEventos() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: eventos = [], isLoading } = useQuery<EventoComercial[]>({
    queryKey: ["/api/eventos-comerciais"],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { locale: ptBR });
  const calEnd = endOfWeek(monthEnd, { locale: ptBR });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const eventosDoMes = eventos.filter((e) => {
    const d = new Date(e.dataInicio);
    return d >= monthStart && d <= monthEnd;
  });

  function getEventosDoDia(day: Date) {
    return eventos.filter((e) => isSameDay(new Date(e.dataInicio), day));
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendário Comercial</h1>
            <p className="text-muted-foreground mt-1">Visão consolidada dos eventos e compromissos comerciais</p>
          </div>
          <Link href="/eventos-comerciais">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Gerenciar Eventos
            </Button>
          </Link>
        </div>

        {/* Month navigation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg capitalize">
                {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week header */}
            <div className="grid grid-cols-7 mb-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 border-l border-t">
              {days.map((day) => {
                const evs = getEventosDoDia(day);
                const isCurrentMonth = day >= monthStart && day <= monthEnd;
                return (
                  <div
                    key={day.toISOString()}
                    className={`border-r border-b min-h-[80px] p-1 ${isCurrentMonth ? "" : "bg-muted/30"} ${isToday(day) ? "bg-primary/5" : ""}`}
                    data-testid={`day-${format(day, "yyyy-MM-dd")}`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday(day) ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center" : isCurrentMonth ? "text-foreground" : "text-muted-foreground"}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {evs.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className={`text-xs px-1 rounded truncate cursor-default ${catColors[e.categoria] ?? "bg-gray-200 dark:bg-gray-700"}`}
                          title={`${e.titulo} — ${e.categoria}`}
                        >
                          {e.titulo}
                        </div>
                      ))}
                      {evs.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">+{evs.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Events list for this month */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Eventos em {format(currentMonth, "MMMM", { locale: ptBR })} ({eventosDoMes.length})
          </h2>

          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse"><CardContent className="h-16 p-4" /></Card>
              ))}
            </div>
          )}

          {!isLoading && eventosDoMes.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-2">
                <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">Nenhum evento cadastrado neste mês</p>
                <Link href="/eventos-comerciais">
                  <Button variant="outline" size="sm" className="mt-1">Cadastrar Evento</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            {eventosDoMes
              .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
              .map((e) => (
                <Card key={e.id} className="hover:shadow-sm transition-shadow" data-testid={`evento-mes-${e.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[40px]">
                        <div className="text-xs text-muted-foreground uppercase">
                          {format(new Date(e.dataInicio), "MMM", { locale: ptBR })}
                        </div>
                        <div className="text-lg font-bold leading-tight">
                          {format(new Date(e.dataInicio), "dd")}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{e.titulo}</span>
                          <Badge variant="outline" className="text-xs shrink-0">{e.categoria}</Badge>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${statusColors[e.status ?? "agendado"]}`}>
                            {e.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(e.dataInicio), "HH:mm")}
                            {e.dataFim && ` — ${format(new Date(e.dataFim), "HH:mm")}`}
                          </span>
                          {e.local && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {e.local}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
