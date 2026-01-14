import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: string | number;
  type: string;
}

interface FinancialCalendarProps {
  transactions: Transaction[];
  title?: string;
  className?: string;
}

const monthNames = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function FinancialCalendar({ transactions, title = "Calendario Financeiro", className }: FinancialCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const transactionsByDate = useMemo(() => {
    const map: Record<string, { income: number; expense: number; count: number }> = {};
    transactions.forEach(t => {
      const dateKey = new Date(t.date).toISOString().split("T")[0];
      if (!map[dateKey]) {
        map[dateKey] = { income: 0, expense: 0, count: 0 };
      }
      const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
      if (t.type === "income" || t.type === "receita") {
        map[dateKey].income += amount;
      } else {
        map[dateKey].expense += amount;
      }
      map[dateKey].count++;
    });
    return map;
  }, [transactions]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const getDateKey = (day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString().split("T")[0];
  };

  const monthTotal = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount;
        if (t.type === "income" || t.type === "receita") {
          income += amount;
        } else {
          expense += amount;
        }
      }
    });
    return { income, expense };
  }, [transactions, year, month]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-600">{formatCurrency(monthTotal.income)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-red-600">{formatCurrency(monthTotal.expense)}</span>
          </div>
          <Badge variant={monthTotal.income - monthTotal.expense >= 0 ? "default" : "destructive"}>
            {formatCurrency(monthTotal.income - monthTotal.expense)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground p-1">
              {d}
            </div>
          ))}
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="p-1" />;
            }
            const dateKey = getDateKey(day);
            const dayData = transactionsByDate[dateKey];
            const hasTransactions = dayData && dayData.count > 0;

            return (
              <div
                key={day}
                className={cn(
                  "p-1 text-center rounded-md text-sm relative min-h-[40px] flex flex-col items-center justify-start",
                  isToday(day) && "bg-primary/10 font-bold",
                  hasTransactions && "bg-muted/50"
                )}
              >
                <span className={cn(
                  "text-xs",
                  isToday(day) && "text-primary"
                )}>
                  {day}
                </span>
                {hasTransactions && (
                  <div className="flex flex-col items-center gap-0.5 mt-0.5">
                    {dayData.income > 0 && (
                      <span className="text-[10px] text-green-600 font-medium">
                        +{(dayData.income / 1000).toFixed(0)}k
                      </span>
                    )}
                    {dayData.expense > 0 && (
                      <span className="text-[10px] text-red-600 font-medium">
                        -{(dayData.expense / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
