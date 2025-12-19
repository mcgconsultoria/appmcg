import { storage } from "./storage";
import { emailService } from "./emailService";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every hour

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
  console.log("Starting task reminder service...");
  
  // Run immediately on startup
  sendTaskReminders().catch((err) => {
    console.error("Reminder service startup error:", err);
  });
  
  // Then run every hour
  setInterval(() => {
    sendTaskReminders().catch((err) => {
      console.error("Reminder service interval error:", err);
    });
  }, CHECK_INTERVAL_MS);
}
