import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Palette, Type } from "lucide-react";
import logoMcg from "@assets/logo_mcg_principal.png";
import { AdminLayout } from "@/components/AdminLayout";

interface BrandKitProps {
  isAdmin?: boolean;
}

const colorPalette = [
  { name: "MCG Black", hex: "#0A0A0A", hsl: "0 0% 4%", usage: "Fundo escuro, textos principais" },
  { name: "MCG White", hex: "#FAFAFA", hsl: "0 0% 98%", usage: "Fundo claro, textos em modo escuro" },
  { name: "Technology Blue", hex: "#0EA5E9", hsl: "200 85% 45%", usage: "CTAs, destaques, links" },
  { name: "Technology Blue Light", hex: "#38BDF8", hsl: "200 85% 60%", usage: "Hover states, acentos" },
  { name: "Technology Blue Dark", hex: "#0284C7", hsl: "200 90% 40%", usage: "Active states" },
];

const typography = [
  { name: "Inter", usage: "Textos de interface (UI)", weights: "400, 500, 600, 700" },
  { name: "IBM Plex Sans", usage: "Titulos e headlines", weights: "500, 600, 700" },
  { name: "JetBrains Mono", usage: "Codigo e dados tecnicos", weights: "400, 500" },
];

export default function BrandKit({ isAdmin = false }: BrandKitProps) {
  const handleDownloadLogo = () => {
    const link = document.createElement("a");
    link.href = logoMcg;
    link.download = "mcg_logo_principal.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadManual = () => {
    window.open("/api/brand-kit/manual", "_blank");
  };

  const content = (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kit da Marca MCG</h1>
        <p className="text-muted-foreground">
          Recursos e diretrizes da identidade visual MCG Consultoria
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Logotipo Principal
            </CardTitle>
            <CardDescription>
              Use este logotipo em fundos claros e escuros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-8 bg-muted rounded-lg flex items-center justify-center">
                <img src={logoMcg} alt="MCG Logo" className="h-24 w-24 object-contain" />
              </div>
              <Button onClick={handleDownloadLogo} className="w-full" data-testid="button-download-logo">
                <Download className="h-4 w-4 mr-2" />
                Baixar Logo PNG
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Manual de Identidade Visual
            </CardTitle>
            <CardDescription>
              Guia completo de uso da marca MCG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>Uso correto do logotipo</li>
                  <li>Paleta de cores oficial</li>
                  <li>Tipografia e fontes</li>
                  <li>Aplicacoes e exemplos</li>
                </ul>
              </div>
              <Button onClick={handleDownloadManual} variant="outline" className="w-full" data-testid="button-download-manual">
                <Download className="h-4 w-4 mr-2" />
                Baixar Manual (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Paleta de Cores
          </CardTitle>
          <CardDescription>
            Cores oficiais da marca MCG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colorPalette.map((color) => (
              <div key={color.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div
                  className="w-12 h-12 rounded-md border border-border flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{color.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                  <p className="text-xs text-muted-foreground truncate">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Tipografia
          </CardTitle>
          <CardDescription>
            Familias tipograficas da marca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typography.map((font) => (
              <div key={font.name} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <p className="font-semibold" style={{ fontFamily: font.name }}>{font.name}</p>
                  <p className="text-sm text-muted-foreground">{font.usage}</p>
                  <p className="text-xs text-muted-foreground mt-1">Pesos: {font.weights}</p>
                </div>
                <div className="text-2xl" style={{ fontFamily: font.name }}>
                  Aa
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          Precisa de outros formatos ou materiais? Entre em contato com a equipe de marketing.
        </p>
      </div>
    </div>
  );

  if (isAdmin) {
    return <AdminLayout>{content}</AdminLayout>;
  }

  return content;
}
