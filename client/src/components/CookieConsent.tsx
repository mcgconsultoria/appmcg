import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4" data-testid="cookie-consent-banner">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Aviso de Cookies e LGPD</h3>
              <p className="text-sm text-muted-foreground">
                Utilizamos cookies para melhorar sua experiência de navegação e personalizar conteúdo.
                Ao continuar navegando, você concorda com nossa{" "}
                <Link href="/privacidade" className="text-primary underline">
                  Política de Privacidade
                </Link>{" "}
                e{" "}
                <Link href="/termos" className="text-primary underline">
                  Termos de Uso
                </Link>
                , em conformidade com a Lei Geral de Proteção de Dados (LGPD).
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={handleReject} data-testid="button-cookie-reject">
                Recusar
              </Button>
              <Button onClick={handleAccept} data-testid="button-cookie-accept">
                Aceitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
