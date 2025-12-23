import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logoMcg from "@assets/logo_mcg_principal.png";

interface PublicLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function PublicLayout({ children, title, subtitle }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-border bg-background sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-home">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src={logoMcg} alt="MCG Consultoria" className="h-10 w-auto" />
            </div>
          </Link>
        </div>
        <div>
          <h1 className="text-lg font-semibold" data-testid="text-page-title">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground hidden md:block">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm" data-testid="button-login">
              Entrar
            </Button>
          </Link>
        </div>
      </header>
      <main className="p-4 md:p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
