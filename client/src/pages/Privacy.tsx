import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl" data-testid="text-privacy-title">
              Política de Privacidade
            </CardTitle>
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Introdução</h2>
            <p>
              A MCG Consultoria ("nós", "nosso" ou "Empresa") está comprometida com a proteção
              da privacidade e dos dados pessoais de nossos usuários. Esta Política de Privacidade
              explica como coletamos, usamos, armazenamos e protegemos suas informações pessoais
              em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>

            <h2>2. Dados Coletados</h2>
            <p>Coletamos os seguintes tipos de dados:</p>
            <ul>
              <li><strong>Dados de identificação:</strong> Nome, email, telefone, CNPJ da empresa</li>
              <li><strong>Dados de navegação:</strong> IP, cookies, páginas acessadas, tempo de navegação</li>
              <li><strong>Dados de pagamento:</strong> Processados de forma segura pelo Stripe</li>
              <li><strong>Dados de uso:</strong> Informações sobre como você utiliza nossos serviços</li>
            </ul>

            <h2>3. Finalidade do Tratamento</h2>
            <p>Seus dados são utilizados para:</p>
            <ul>
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Processar pagamentos e gerenciar assinaturas</li>
              <li>Enviar comunicações relevantes sobre nossos serviços</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>

            <h2>4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos seus dados pessoais. Compartilhamos informações apenas com:
            </p>
            <ul>
              <li>Processadores de pagamento (Stripe) para transações financeiras</li>
              <li>Provedores de infraestrutura tecnológica (Replit)</li>
              <li>Autoridades públicas quando exigido por lei</li>
            </ul>

            <h2>5. Segurança dos Dados</h2>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul>
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controle de acesso restrito</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares</li>
            </ul>

            <h2>6. Seus Direitos (LGPD)</h2>
            <p>De acordo com a LGPD, você tem direito a:</p>
            <ul>
              <li>Confirmar a existência de tratamento de dados</li>
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a eliminação de dados desnecessários</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos dados</li>
            </ul>

            <h2>7. Cookies</h2>
            <p>
              Utilizamos cookies para melhorar sua experiência. Você pode gerenciar
              suas preferências de cookies através das configurações do navegador.
            </p>

            <h2>8. Retenção de Dados</h2>
            <p>
              Mantemos seus dados pelo tempo necessário para cumprir as finalidades
              descritas nesta política ou conforme exigido por lei.
            </p>

            <h2>9. Contato do Encarregado (DPO)</h2>
            <p>
              Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento
              de dados pessoais, entre em contato:
            </p>
            <p>
              <strong>Email:</strong> privacidade@mcgconsultoria.com.br<br />
              <strong>Telefone:</strong> (11) 99999-9999
            </p>

            <h2>10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre
              mudanças significativas através do email cadastrado ou aviso na plataforma.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
