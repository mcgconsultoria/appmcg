import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
            <CardTitle className="text-3xl" data-testid="text-terms-title">
              Termos de Uso
            </CardTitle>
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar a plataforma MCG Consultoria, você concorda com estes
              Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize
              nossos serviços.
            </p>

            <h2>2. Descrição dos Serviços</h2>
            <p>A MCG Consultoria oferece:</p>
            <ul>
              <li><strong>Calculadoras gratuitas:</strong> Frete e armazenagem (acesso livre)</li>
              <li><strong>Plano Profissional:</strong> CRM, Pipeline, Checklists, Financeiro, Marketing</li>
              <li><strong>Plano Empresarial:</strong> Recursos avançados e multi-usuários</li>
            </ul>

            <h2>3. Cadastro e Conta</h2>
            <p>Para acessar recursos pagos, você deve:</p>
            <ul>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais</li>
              <li>Notificar imediatamente sobre uso não autorizado</li>
              <li>Utilizar apenas uma sessão ativa por conta</li>
            </ul>

            <h2>4. Assinaturas e Pagamentos</h2>
            <ul>
              <li>Os pagamentos são processados mensalmente/anualmente via Stripe</li>
              <li>Aceitamos cartão de crédito, PIX e boleto bancário</li>
              <li>Você pode cancelar sua assinatura a qualquer momento</li>
              <li>Não há reembolso proporcional para cancelamentos</li>
              <li>Os preços podem ser alterados com aviso prévio de 30 dias</li>
            </ul>

            <h2>5. Uso Aceitável</h2>
            <p>Você concorda em não:</p>
            <ul>
              <li>Violar leis ou regulamentos aplicáveis</li>
              <li>Compartilhar credenciais de acesso</li>
              <li>Tentar acessar sistemas não autorizados</li>
              <li>Usar a plataforma para fins ilegais</li>
              <li>Fazer engenharia reversa do software</li>
            </ul>

            <h2>6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma, incluindo textos, gráficos, logos,
              ícones, imagens e software, é de propriedade da MCG Consultoria
              e está protegido por leis de propriedade intelectual.
            </p>

            <h2>7. Limitação de Responsabilidade</h2>
            <p>
              A MCG Consultoria não se responsabiliza por:
            </p>
            <ul>
              <li>Decisões tomadas com base nos cálculos da plataforma</li>
              <li>Interrupções temporárias do serviço</li>
              <li>Perda de dados por uso inadequado</li>
              <li>Danos indiretos ou consequenciais</li>
            </ul>

            <h2>8. Disponibilidade do Serviço</h2>
            <p>
              Nos empenhamos para manter o serviço disponível 24/7, mas não garantimos
              disponibilidade ininterrupta. Manutenções programadas serão comunicadas
              com antecedência.
            </p>

            <h2>9. Modificações nos Termos</h2>
            <p>
              Podemos modificar estes termos a qualquer momento. Alterações significativas
              serão comunicadas por email ou através da plataforma.
            </p>

            <h2>10. Rescisão</h2>
            <p>
              Podemos suspender ou encerrar sua conta se você violar estes termos.
              Você pode encerrar sua conta a qualquer momento através das configurações.
            </p>

            <h2>11. Lei Aplicável</h2>
            <p>
              Estes termos são regidos pelas leis da República Federativa do Brasil.
              Qualquer disputa será resolvida no foro da Comarca de São Paulo/SP.
            </p>

            <h2>12. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato:
            </p>
            <p>
              <strong>Email:</strong> contato@mcgconsultoria.com.br<br />
              <strong>Telefone:</strong> (11) 99999-9999
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
