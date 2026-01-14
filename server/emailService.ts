import { Resend } from "resend";
import nodemailer from "nodemailer";
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
  private smtpTransporter: nodemailer.Transporter | null = null;
  private lastSmtpUser: string | undefined;
  private lastSmtpPassword: string | undefined;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }

    this.refreshSmtpTransporter();
  }

  private refreshSmtpTransporter() {
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPassword = process.env.SMTP_PASSWORD?.trim();
    
    if (smtpUser && smtpPassword && 
        (smtpUser !== this.lastSmtpUser || smtpPassword !== this.lastSmtpPassword)) {
      console.log("Configuring SMTP transporter for:", smtpUser);
      this.smtpTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
      this.lastSmtpUser = smtpUser;
      this.lastSmtpPassword = smtpPassword;
    }
  }

  isConfigured(): boolean {
    return this.smtpTransporter !== null || this.resend !== null || isGoogleIntegrationAvailable();
  }

  isGmailConfigured(): boolean {
    return isGoogleIntegrationAvailable();
  }

  isResendConfigured(): boolean {
    return this.resend !== null;
  }

  isSmtpConfigured(): boolean {
    return this.smtpTransporter !== null;
  }

  async send(options: SendEmailOptions): Promise<EmailResult> {
    this.refreshSmtpTransporter();
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production, prioritize Gmail OAuth (more reliable than SMTP from cloud servers)
    if (isProduction && isGoogleIntegrationAvailable()) {
      console.log("Using Gmail OAuth for production email");
      return this.sendViaGmail(options);
    }
    
    // In development, SMTP works fine
    if (this.smtpTransporter) {
      console.log("Using SMTP for email");
      return this.sendViaSmtp(options);
    }

    // Fallback to Gmail OAuth if available
    if (isGoogleIntegrationAvailable()) {
      console.log("Using Gmail OAuth as fallback");
      return this.sendViaGmail(options);
    }

    if (this.resend) {
      console.log("Using Resend for email");
      return this.sendViaResend(options);
    }

    console.log("Email service not configured. SMTP_USER:", process.env.SMTP_USER ? "set" : "not set", 
                "SMTP_PASSWORD:", process.env.SMTP_PASSWORD ? "set" : "not set");
    return {
      success: false,
      message: "Servico de email nao configurado",
      error: "Configure SMTP_USER/SMTP_PASSWORD, integracao Gmail ou RESEND_API_KEY para habilitar envio de emails",
    };
  }

  private async sendViaSmtp(options: SendEmailOptions): Promise<EmailResult> {
    try {
      const smtpUser = process.env.SMTP_USER || "";
      const fromName = process.env.SMTP_FROM_NAME || "MCG Consultoria";
      
      const mailOptions: nodemailer.SendMailOptions = {
        from: `${fromName} <${smtpUser}>`,
        to: options.to.join(", "),
        subject: options.subject,
        html: options.html,
        attachments: options.attachments?.map(a => ({
          filename: a.filename,
          content: a.content,
        })),
      };

      await this.smtpTransporter!.sendMail(mailOptions);
      
      console.log("Email sent successfully via SMTP to:", options.to);
      return {
        success: true,
        message: `Email enviado com sucesso via SMTP para ${options.to.length} destinatario(s)`,
      };
    } catch (error: any) {
      console.error("SMTP send error:", error);
      return {
        success: false,
        message: "Erro ao enviar email via SMTP",
        error: error.message || "Erro desconhecido",
      };
    }
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
