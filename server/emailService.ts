import { Resend } from "resend";

interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendEmailOptions {
  to: string[];
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

interface EmailResult {
  success: boolean;
  message: string;
  error?: string;
}

class EmailService {
  private resend: Resend | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }
  }

  isConfigured(): boolean {
    return this.resend !== null;
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: "Servico de email nao configurado",
        error: "Configure RESEND_API_KEY para habilitar o envio de emails",
      };
    }

    try {
      const result = await this.resend!.emails.send({
        from: "MCG Consultoria <noreply@mcgconsultoria.com.br>",
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
        })),
      });

      if (result.error) {
        return {
          success: false,
          message: "Erro ao enviar email",
          error: result.error.message,
        };
      }

      return {
        success: true,
        message: `Email enviado com sucesso para ${options.to.length} destinatario(s)`,
      };
    } catch (error: any) {
      console.error("Email send error:", error);
      return {
        success: false,
        message: "Erro ao enviar email",
        error: error.message || "Erro desconhecido",
      };
    }
  }
}

export const emailService = new EmailService();
