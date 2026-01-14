import { storage } from "./storage";
import { emailService } from "./emailService";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

const categoriaLabels: Record<string, string> = {
  contratos: "Contrato",
  tabelas: "Tabela",
  licencas: "Licenca",
  cnd: "CND",
  certificacoes: "Certificacao",
};

async function sendAttachmentExpiryReminders() {
  if (!emailService.isConfigured()) {
    console.log("Reminder service: Email not configured, skipping attachment reminders");
    return;
  }

  try {
    // Get attachments expiring in the next 15 days that haven't been notified
    const expiringAttachments = await storage.getExpiringAttachments(15);
    
    for (const attachment of expiringAttachments) {
      if (!attachment.emailsNotificacao || attachment.emailsNotificacao.length === 0) {
        continue;
      }

      const emails = attachment.emailsNotificacao as string[];
      const expiryDate = attachment.dataValidade ? new Date(attachment.dataValidade) : null;
      const daysUntilExpiry = expiryDate 
        ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / ONE_DAY_MS)
        : 0;

      try {
        const result = await emailService.send({
          to: emails,
          subject: `Aviso: ${categoriaLabels[attachment.categoria] || attachment.categoria} vence em ${daysUntilExpiry} dias - ${attachment.nome}`,
          html: `
            <h2>Aviso de Vencimento de Documento</h2>
            <p>O seguinte documento esta proximo do vencimento:</p>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 8px 0; color: #92400e;">${attachment.nome}</h3>
              <p style="margin: 0 0 8px 0; color: #78350f;">
                <strong>Tipo:</strong> ${categoriaLabels[attachment.categoria] || attachment.categoria}<br/>
                <strong>Data de Vencimento:</strong> ${expiryDate ? expiryDate.toLocaleDateString("pt-BR") : "-"}<br/>
                <strong>Dias Restantes:</strong> ${daysUntilExpiry} dias
              </p>
              ${attachment.descricao ? `<p style="margin: 0; color: #78350f;">${attachment.descricao}</p>` : ""}
            </div>
            <p><strong>Acao Recomendada:</strong> Por favor, providencie a renovacao ou atualizacao deste documento antes do vencimento.</p>
            <p><em>Este lembrete foi enviado automaticamente pelo MCG Consultoria.</em></p>
          `,
        });

        if (result.success) {
          await storage.updateChecklistAttachment(attachment.id, {
            lembrete15DiasEnviado: true,
            lembreteEnviadoEm: new Date(),
          });
          console.log(`Attachment expiry reminder sent for ${attachment.nome} to ${emails.join(", ")}`);
        } else {
          console.error(`Failed to send attachment reminder for ${attachment.id}: ${result.error}`);
        }
      } catch (err) {
        console.error(`Error processing attachment reminder for ${attachment.id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error in attachment expiry reminder service:", error);
  }
}

async function sendTaskReminders() {
  if (!emailService.isConfigured()) {
    console.log("Reminder service: Email not configured, skipping reminders");
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  try {
    // Get all pending tasks with due dates for tomorrow
    const tasks = await storage.getTasksDueTomorrow(tomorrow, dayAfterTomorrow);
    
    for (const task of tasks) {
      if (!task.assignedEmail || task.reminderSent) {
        continue;
      }

      try {
        const client = task.clientId ? await storage.getClient(task.clientId) : null;
        
        const result = await emailService.send({
          to: [task.assignedEmail],
          subject: `Lembrete: Tarefa vence amanha - ${task.title}`,
          html: `
            <h2>Lembrete de Tarefa</h2>
            <p>Voce tem uma tarefa que vence <strong>amanha</strong>:</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">${task.title}</h3>
              ${task.description ? `<p style="margin: 0 0 8px 0;">${task.description}</p>` : ""}
              <p style="margin: 0; color: #666;">
                <strong>Prazo:</strong> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString("pt-BR") : "-"}<br/>
                ${client ? `<strong>Cliente:</strong> ${client.name}<br/>` : ""}
                <strong>Prioridade:</strong> ${task.priority || "normal"}
              </p>
            </div>
            <p><em>Este lembrete foi enviado automaticamente pelo MCG Consultoria.</em></p>
          `,
        });

        if (result.success) {
          await storage.markTaskReminderSent(task.id);
          console.log(`Reminder sent for task ${task.id} to ${task.assignedEmail}`);
        } else {
          console.error(`Failed to send reminder for task ${task.id}: ${result.error}`);
        }
      } catch (err) {
        console.error(`Error processing reminder for task ${task.id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error in reminder service:", error);
  }
}

export function startReminderService() {
  console.log("Starting reminder services (tasks + attachment expiry)...");
  
  // Run immediately on startup
  sendTaskReminders().catch((err) => {
    console.error("Task reminder service startup error:", err);
  });
  
  sendAttachmentExpiryReminders().catch((err) => {
    console.error("Attachment expiry reminder service startup error:", err);
  });
  
  // Then run every hour
  setInterval(() => {
    sendTaskReminders().catch((err) => {
      console.error("Task reminder service interval error:", err);
    });
    
    sendAttachmentExpiryReminders().catch((err) => {
      console.error("Attachment expiry reminder service interval error:", err);
    });
  }, CHECK_INTERVAL_MS);
}
