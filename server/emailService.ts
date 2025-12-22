import { Resend } from "resend";
import { sendEmailViaGmail, isGoogleIntegrationAvailable } from "./googleServices";

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
    return this.resend !== null || isGoogleIntegrationAvailable();
  }

  isGmailConfigured(): boolean {
    return isGoogleIntegrationAvailable();
  }

  isResendConfigured(): boolean {
    return this.resend !== null;
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    if (isGoogleIntegrationAvailable()) {
      return this.sendViaGmail(options);
    }

    if (this.resend) {
      return this.sendViaResend(options);
    }

    return {
      success: false,
      message: "Servico de email nao configurado",
      error: "Configure a integracao com Gmail ou RESEND_API_KEY para habilitar o envio de emails",
    };
  }

  private async sendViaGmail(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const attachments = options.attachments?.map(a => ({
        filename: a.filename,
        content: a.content,
        mimeType: a.filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'
      }));

      const result = await sendEmailViaGmail(
        options.to,
        options.subject,
        options.html,
        attachments
      );

      if (result.success) {
        return {
          success: true,
          message: `Email enviado com sucesso via Gmail para ${options.to.length} destinatario(s)`,
        };
      } else {
        return {
          success: false,
          message: "Erro ao enviar email via Gmail",
          error: result.error,
        };
      }
    } catch (error: any) {
      console.error("Gmail send error:", error);
      return {
        success: false,
        message: "Erro ao enviar email via Gmail",
        error: error.message || "Erro desconhecido",
      };
    }
  }

  private async sendViaResend(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const result = await this.resend!.emails.send({
        from: "MCG Consultoria <noreply@mcgconsultoria.com.br>",
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString("base64"),
        })),
      });

      if (result.error) {
        return {
          success: false,
          message: "Erro ao enviar email via Resend",
          error: result.error.message,
        };
      }

      return {
        success: true,
        message: `Email enviado com sucesso via Resend para ${options.to.length} destinatario(s)`,
      };
    } catch (error: any) {
      console.error("Resend send error:", error);
      return {
        success: false,
        message: "Erro ao enviar email via Resend",
        error: error.message || "Erro desconhecido",
      };
    }
  }
}

export const emailService = new EmailService();
