import { Link } from "wouter";
import { Calculator, Warehouse, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import logoMcg from "@assets/logo_mcg_principal.png";

const calculators = [
  {
    icon: Calculator,
    title: "Calculadora de Frete",
    description: "Calcule o valor do frete com ICMS, GRIS, ADV, pedágio e demais componentes de forma precisa e detalhada.",
    href: "/calculadora-frete",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Warehouse,
    title: "Calculadora de Armazenagem",
    description: "Calcule custos de armazenagem incluindo movimentação, seguro, taxas administrativas e custos operacionais.",
    href: "/calculadora-armazenagem",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
];

export default function Calculadoras() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = "/"}
              data-testid="button-back"
              title="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <img 
                src={logoMcg} 
                alt="MCG Consultoria" 
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">MCG</span>
                <span className="text-xs text-muted-foreground leading-tight">Consultoria</span>
              </div>
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Calculadoras</h1>
            <p className="text-muted-foreground">
              Escolha a calculadora que deseja utilizar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {calculators.map((calc) => (
              <Link key={calc.href} href={calc.href}>
                <Card className="h-full hover-elevate cursor-pointer transition-all" data-testid={`card-${calc.href.replace('/', '')}`}>
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto p-4 rounded-full ${calc.bgColor} mb-2`}>
                      <calc.icon className={`h-10 w-10 ${calc.color}`} />
                    </div>
                    <CardTitle className="text-xl">{calc.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-sm">
                      {calc.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Estas calculadoras são gratuitas e podem ser utilizadas sem necessidade de cadastro.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
