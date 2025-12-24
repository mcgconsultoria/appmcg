import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { registerUser, loginUser, validateSession, logoutUser } from "./customAuth";
import { consultarCNPJ } from "./cnpjService";
import { logAudit } from "./auditHelper";
import {
  insertClientSchema,
  insertChecklistSchema,
  insertChecklistItemSchema,
  insertChecklistAttachmentSchema,
  insertFreightCalculationSchema,
  insertStorageCalculationSchema,
  insertSavedRouteSchema,
  insertFinancialAccountSchema,
  insertMeetingRecordSchema,
  insertMeetingObjectiveSchema,
  insertMeetingActionItemSchema,
  insertCommercialEventSchema,
  insertProjectSchema,
  insertTaskSchema,
  insertRfiSchema,
  insertAdminLeadSchema,
  insertAdminProposalSchema,
  insertAdminContractSchema,
  insertAdminProjectSchema,
  insertAdminProjectPhaseSchema,
  insertAdminProjectDeliverableSchema,
  insertAdminPartnershipSchema,
  insertAdminPostSchema,
  insertAdminFinancialRecordSchema,
  insertCompanyTeamMemberSchema,
  insertSupportTicketSchema,
  insertSupportTicketMessageSchema,
  insertContractTemplateSchema,
  insertContractAgreementSchema,
  insertContractSignatureSchema,
  insertDiagnosticLeadSchema,
  insertDreAccountSchema,
  insertCostCenterSchema,
  insertBankAccountSchema,
  insertAccountingEntrySchema,
  insertBankIntegrationSchema,
  insertOperationBillingEntrySchema,
  insertOperationBillingGoalSchema,
  registerSchema,
  loginSchema,
  type User,
} from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

const SESSION_COOKIE_NAME = "mcg_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

async function customAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (sessionToken) {
    const user = await validateSession(sessionToken);
    if (user) {
      req.user = user;
    } else {
      res.clearCookie(SESSION_COOKIE_NAME);
    }
  }
  next();
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  next();
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Não autorizado" });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'admin_mcg') {
    return res.status(403).json({ message: "Acesso restrito a administradores MCG" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(customAuthMiddleware);
  
  await setupAuth(app);

  app.get('/api/brand-kit/manual', isAuthenticated, async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const manualPath = path.join(process.cwd(), 'attached_assets', 'MCG_Manual_Identidade_Visual.md');
      
      if (!fs.existsSync(manualPath)) {
        return res.status(404).json({ message: "Manual não encontrado" });
      }
      
      const content = fs.readFileSync(manualPath, 'utf-8');
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="MCG_Manual_Identidade_Visual.md"');
      res.send(content);
    } catch (error) {
      console.error("Error serving brand manual:", error);
      res.status(500).json({ message: "Erro ao baixar manual" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }

      const result = await registerUser(parsed.data);
      if ('error' in result) {
        return res.status(400).json({ message: result.error });
      }

      res.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });

      const { password, ...userWithoutPassword } = result.user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Erro ao criar conta" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }

      const result = await loginUser(parsed.data);
      if ('error' in result) {
        return res.status(401).json({ message: result.error });
      }

      res.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
      });

      const { password, ...userWithoutPassword } = result.user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Erro ao fazer login" });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      if (req.user?.id) {
        await logoutUser(req.user.id);
      }
      res.clearCookie(SESSION_COOKIE_NAME);
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Error logging out:", error);
      res.clearCookie(SESSION_COOKIE_NAME);
      res.json({ message: "Logout realizado com sucesso" });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email é obrigatório" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "Se o email existir, você receberá as instruções" });
      }

      const crypto = await import("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await storage.setPasswordResetToken(user.id, resetToken, resetTokenExpiry);

      const { emailService } = await import("./emailService");
      const resetUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://www.mcgconsultoria.com.br'}/redefinir-senha?token=${resetToken}`;
      
      console.log("Attempting to send password reset email to:", email);
      console.log("Email service configured:", emailService.isConfigured());
      console.log("Gmail configured:", emailService.isGmailConfigured());
      console.log("Resend configured:", emailService.isResendConfigured());
      
      const emailResult = await emailService.send({
        to: [email],
        subject: "Redefinir Senha - MCG Consultoria",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0EA5E9;">Redefinir Senha</h2>
            <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>
            <p><a href="${resetUrl}" style="background-color: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Redefinir Senha</a></p>
            <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
            <p style="color: #666; font-size: 14px;">Se você não solicitou esta redefinição, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">MCG Consultoria - Gestão Comercial Logística</p>
          </div>
        `,
      });
      
      console.log("Email result:", emailResult);
      
      if (!emailResult.success) {
        console.log("Email service error:", emailResult.error);
      }

      res.json({ message: "Se o email existir, você receberá as instruções" });
    } catch (error) {
      console.error("Error sending password reset:", error);
      res.json({ message: "Se o email existir, você receberá as instruções" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token e senha são obrigatórios" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ message: "Link inválido ou expirado" });
      }

      if (user.passwordResetExpiry && new Date() > new Date(user.passwordResetExpiry)) {
        await storage.clearPasswordResetToken(user.id);
        return res.status(400).json({ message: "Link expirado. Solicite um novo." });
      }

      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await storage.updateUserPassword(user.id, hashedPassword);
      await storage.clearPasswordResetToken(user.id);

      res.json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Erro ao redefinir senha" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const { password, ...userWithoutPassword } = req.user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile update (including profile image)
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const { profileImageUrl, firstName, lastName } = req.body;
      
      // Validate profile image if provided
      if (profileImageUrl) {
        if (!profileImageUrl.startsWith("data:image/")) {
          return res.status(400).json({ message: "Imagem deve ser um data URL valido" });
        }
        // Check size limit (500KB encoded ~ 700KB base64)
        const maxImageSize = 750000;
        if (profileImageUrl.length > maxImageSize) {
          return res.status(400).json({ message: "Imagem muito grande. Maximo 500KB" });
        }
      }
      
      const updateData: any = {};
      if (profileImageUrl !== undefined) updateData.profileImageUrl = profileImageUrl;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      
      const updatedUser = await storage.updateUserProfile(req.user.id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario nao encontrado" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
  });

  // CNPJ lookup (public - needed for registration)
  app.get('/api/cnpj/:cnpj', async (req, res) => {
    try {
      const { cnpj } = req.params;
      const data = await consultarCNPJ(cnpj);
      
      if (!data) {
        return res.status(404).json({ message: "CNPJ nao encontrado" });
      }
      
      // Return data in snake_case format expected by frontend
      res.json({
        razao_social: data.razaoSocial,
        nome_fantasia: data.nomeFantasia,
        situacao_cadastral: data.situacaoCadastral,
        endereco: data.endereco,
        cnae: data.cnae,
        cnae_descricao: data.cnaeDescricao,
        natureza_juridica: data.naturezaJuridica,
        data_abertura: data.dataAbertura,
        capital_social: data.capitalSocial,
      });
    } catch (error: any) {
      console.error("Erro ao consultar CNPJ:", error);
      res.status(500).json({ message: error.message || "Erro ao consultar CNPJ" });
    }
  });

  // Business types catalog (public - needed for registration)
  app.get('/api/business-types', async (req, res) => {
    try {
      const types = await storage.getBusinessTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching business types:", error);
      res.status(500).json({ message: "Erro ao buscar tipos de empresa" });
    }
  });

  app.post('/api/business-types', async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }
      const type = await storage.createBusinessType({ name, isDefault: false });
      res.status(201).json(type);
    } catch (error) {
      console.error("Error creating business type:", error);
      res.status(500).json({ message: "Erro ao criar tipo de empresa" });
    }
  });

  // Market segments catalog (public - needed for registration)
  app.get('/api/market-segments', async (req, res) => {
    try {
      const segments = await storage.getMarketSegments();
      res.json(segments);
    } catch (error) {
      console.error("Error fetching market segments:", error);
      res.status(500).json({ message: "Erro ao buscar segmentos" });
    }
  });

  app.post('/api/market-segments', async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }
      const segment = await storage.createMarketSegment({ name, isDefault: false });
      res.status(201).json(segment);
    } catch (error) {
      console.error("Error creating market segment:", error);
      res.status(500).json({ message: "Erro ao criar segmento" });
    }
  });

  // Client routes
  app.get("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const isAdministrador = user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";
      
      let clients = await storage.getClients();
      
      // Filtrar por vendedor se nao for administrador
      if (!isAdministrador && user?.email) {
        clients = clients.filter(client => 
          client.vendedor === user.email || 
          client.vendedor === `${user.firstName} ${user.lastName}`.trim() ||
          client.vendedor === user.firstName
        );
      }
      
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const isAdministrador = user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";
      
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Verificar acesso se nao for administrador
      if (!isAdministrador && user?.email) {
        const hasAccess = client.vendedor === user.email || 
          client.vendedor === `${user.firstName} ${user.lastName}`.trim() ||
          client.vendedor === user.firstName;
        if (!hasAccess) {
          return res.status(403).json({ message: "Acesso negado a este cliente" });
        }
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = insertClientSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid client data", errors: parsed.error.errors });
      }
      const client = await storage.createClient(parsed.data);
      
      await logAudit(req, "create", "client", client.id, `Cliente criado: ${client.razaoSocial}`);
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const isAdministrador = user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";
      
      // Verificar acesso antes de atualizar
      const existingClient = await storage.getClient(id);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (!isAdministrador && user?.email) {
        const hasAccess = existingClient.vendedor === user.email || 
          existingClient.vendedor === `${user.firstName} ${user.lastName}`.trim() ||
          existingClient.vendedor === user.firstName;
        if (!hasAccess) {
          return res.status(403).json({ message: "Acesso negado a este cliente" });
        }
      }
      
      const client = await storage.updateClient(id, req.body);
      
      await logAudit(req, "update", "client", client?.id, `Cliente atualizado: ${client?.razaoSocial}`);
      
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const isAdministrador = user?.role === "administrador" || user?.role === "admin" || user?.role === "admin_mcg";
      
      // Verificar acesso antes de deletar
      const existingClient = await storage.getClient(id);
      if (!existingClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      if (!isAdministrador && user?.email) {
        const hasAccess = existingClient.vendedor === user.email || 
          existingClient.vendedor === `${user.firstName} ${user.lastName}`.trim() ||
          existingClient.vendedor === user.firstName;
        if (!hasAccess) {
          return res.status(403).json({ message: "Acesso negado a este cliente" });
        }
      }
      
      await logAudit(req, "delete", "client", id, `Cliente excluido: ${existingClient.razaoSocial}`);
      
      await storage.deleteClient(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Company routes
  app.get("/api/company", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const company = await storage.getCompany(userCompanyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.patch("/api/company", isAuthenticated, async (req: any, res) => {
    try {
      console.log("PATCH /api/company - user:", req.user?.id, "companyId:", req.user?.companyId);
      console.log("PATCH /api/company - body fields:", Object.keys(req.body));
      
      // Use user's companyId or default to 1 for single-tenant MVP
      const userCompanyId = req.user?.companyId || 1;
      
      // Validate and sanitize allowed fields
      const allowedFields = ["name", "nomeFantasia", "cnpj", "inscricaoEstadual", "inscricaoEstadualIsento", "inscricaoMunicipal", "email", "phone", "address", "city", "state", "logo"];
      const sanitizedData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          sanitizedData[field] = req.body[field];
        }
      }
      
      console.log("PATCH /api/company - sanitized fields:", Object.keys(sanitizedData));
      
      // Validate logo if provided
      if (sanitizedData.logo) {
        if (!sanitizedData.logo.startsWith("data:image/")) {
          return res.status(400).json({ message: "Logo must be a valid image data URL" });
        }
        const maxLogoSize = 750000;
        if (sanitizedData.logo.length > maxLogoSize) {
          return res.status(400).json({ message: "Logo too large. Maximum size is 500KB" });
        }
      }
      
      const company = await storage.updateCompany(userCompanyId, sanitizedData);
      console.log("PATCH /api/company - result:", company ? "success" : "not found");
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Checklist routes
  app.get("/api/checklists", isAuthenticated, async (req, res) => {
    try {
      const checklists = await storage.getChecklists();
      res.json(checklists);
    } catch (error) {
      console.error("Error fetching checklists:", error);
      res.status(500).json({ message: "Failed to fetch checklists" });
    }
  });

  app.post("/api/checklists", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userCompanyId = user?.companyId || 1;
      
      const parsed = insertChecklistSchema.safeParse({
        ...req.body,
        companyId: userCompanyId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid checklist data", errors: parsed.error.errors });
      }
      const checklist = await storage.createChecklist(parsed.data);
      res.status(201).json(checklist);
    } catch (error) {
      console.error("Error creating checklist:", error);
      res.status(500).json({ message: "Failed to create checklist" });
    }
  });

  app.patch("/api/checklists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const checklist = await storage.updateChecklist(id, req.body);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      console.error("Error updating checklist:", error);
      res.status(500).json({ message: "Failed to update checklist" });
    }
  });

  app.delete("/api/checklists/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChecklist(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting checklist:", error);
      res.status(500).json({ message: "Failed to delete checklist" });
    }
  });

  // Checklist items routes
  app.get("/api/checklists/:checklistId/items", isAuthenticated, async (req, res) => {
    try {
      const checklistId = parseInt(req.params.checklistId);
      const items = await storage.getChecklistItems(checklistId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      res.status(500).json({ message: "Failed to fetch checklist items" });
    }
  });

  app.post("/api/checklists/:checklistId/items", isAuthenticated, async (req, res) => {
    try {
      const checklistId = parseInt(req.params.checklistId);
      const parsed = insertChecklistItemSchema.safeParse({ ...req.body, checklistId });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid item data", errors: parsed.error.errors });
      }
      const item = await storage.createChecklistItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating checklist item:", error);
      res.status(500).json({ message: "Failed to create checklist item" });
    }
  });

  app.patch("/api/checklist-items/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateChecklistItem(id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating checklist item:", error);
      res.status(500).json({ message: "Failed to update checklist item" });
    }
  });

  // Checklist attachments routes
  app.get("/api/checklists/:checklistId/attachments", isAuthenticated, async (req, res) => {
    try {
      const checklistId = parseInt(req.params.checklistId);
      const attachments = await storage.getChecklistAttachments(checklistId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching checklist attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.get("/api/company/:companyId/attachments", isAuthenticated, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const attachments = await storage.getChecklistAttachmentsByCompany(companyId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching company attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.get("/api/attachments/expiring", isAuthenticated, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 15;
      const attachments = await storage.getExpiringAttachments(days);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching expiring attachments:", error);
      res.status(500).json({ message: "Failed to fetch expiring attachments" });
    }
  });

  app.post("/api/checklists/:checklistId/attachments", isAuthenticated, async (req, res) => {
    try {
      const checklistId = parseInt(req.params.checklistId);
      const companyId = req.user?.companyId || 1;
      const parsed = insertChecklistAttachmentSchema.safeParse({ 
        ...req.body, 
        checklistId,
        companyId 
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid attachment data", errors: parsed.error.errors });
      }
      const attachment = await storage.createChecklistAttachment(parsed.data);
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error creating checklist attachment:", error);
      res.status(500).json({ message: "Failed to create attachment" });
    }
  });

  app.patch("/api/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attachment = await storage.updateChecklistAttachment(id, req.body);
      if (!attachment) {
        return res.status(404).json({ message: "Attachment not found" });
      }
      res.json(attachment);
    } catch (error) {
      console.error("Error updating attachment:", error);
      res.status(500).json({ message: "Failed to update attachment" });
    }
  });

  app.delete("/api/attachments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChecklistAttachment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Checklist Templates Library routes
  app.get("/api/checklist-templates", isAuthenticated, async (req, res) => {
    try {
      const segment = req.query.segment as string | undefined;
      const templates = await storage.getChecklistTemplates(segment);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching checklist templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get("/api/checklist-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getChecklistTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching checklist template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.get("/api/checklist-templates/segments/list", isAuthenticated, async (req, res) => {
    try {
      const segments = await storage.getChecklistTemplateSegments();
      res.json(segments);
    } catch (error) {
      console.error("Error fetching template segments:", error);
      res.status(500).json({ message: "Failed to fetch segments" });
    }
  });

  app.post("/api/checklist-templates", isAuthenticated, async (req, res) => {
    try {
      const isAdmin = req.user?.role === "admin" || req.user?.role === "admin_mcg";
      if (!isAdmin) {
        return res.status(403).json({ message: "Apenas administradores podem criar templates" });
      }
      const template = await storage.createChecklistTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating checklist template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.patch("/api/checklist-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const isAdmin = req.user?.role === "admin" || req.user?.role === "admin_mcg";
      if (!isAdmin) {
        return res.status(403).json({ message: "Apenas administradores podem editar templates" });
      }
      const id = parseInt(req.params.id);
      const template = await storage.updateChecklistTemplate(id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating checklist template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/checklist-templates/:id", isAuthenticated, async (req, res) => {
    try {
      const isAdmin = req.user?.role === "admin" || req.user?.role === "admin_mcg";
      if (!isAdmin) {
        return res.status(403).json({ message: "Apenas administradores podem excluir templates" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteChecklistTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting checklist template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Checklist Template Purchases
  app.get("/api/checklist-template-purchases", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const purchases = await storage.getChecklistTemplatePurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post("/api/checklist-templates/:id/purchase", isAuthenticated, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const userId = req.user!.id;
      const companyId = req.user?.companyId;
      const { currency = "brl" } = req.body;
      
      // Validate currency
      const validCurrencies = ["brl", "usd", "eur"];
      const selectedCurrency = validCurrencies.includes(currency.toLowerCase()) ? currency.toLowerCase() : "brl";
      
      const template = await storage.getChecklistTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Check if already purchased
      const existingPurchase = await storage.getChecklistTemplatePurchaseByTemplateAndUser(templateId, userId);
      if (existingPurchase && existingPurchase.status === "completed") {
        return res.status(400).json({ message: "Você já possui este template" });
      }

      // Create Stripe checkout session using Replit connector
      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripeClient = await getUncachableStripeClient();
      
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : 'https://www.mcgconsultoria.com.br';

      // Calculate price based on currency (approximate conversion rates)
      // BRL base price, convert to USD/EUR
      const basePriceInCents = template.priceInCents || 9900;
      let priceInCents = basePriceInCents;
      if (selectedCurrency === "usd") {
        priceInCents = Math.round(basePriceInCents / 5.0); // ~5 BRL per USD
      } else if (selectedCurrency === "eur") {
        priceInCents = Math.round(basePriceInCents / 6.2); // ~6.2 BRL per EUR
      }

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: selectedCurrency,
              product_data: {
                name: template.name,
                description: `Checklist Template - ${template.segment}`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/biblioteca-checklists?success=true&template=${templateId}`,
        cancel_url: `${baseUrl}/biblioteca-checklists?canceled=true`,
        metadata: {
          templateId: templateId.toString(),
          userId,
          type: "checklist_template",
        },
        // @ts-ignore - Disable adaptive pricing to prevent multiple currency options
        adaptive_pricing: {
          enabled: false,
        },
      });

      // Create pending purchase record
      await storage.createChecklistTemplatePurchase({
        templateId,
        userId,
        companyId: companyId || undefined,
        stripeSessionId: session.id,
        amountPaid: template.priceInCents || 9900,
        status: "pending",
      });

      res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error("Error creating template purchase:", error);
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  // Apply purchased template to a client
  app.post("/api/checklist-templates/:id/apply", isAuthenticated, async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const userId = req.user!.id;
      const companyId = req.user?.companyId;
      const { clientId } = req.body;

      if (!clientId) {
        return res.status(400).json({ message: "Cliente é obrigatório" });
      }

      // Verify purchase exists and is completed
      const purchase = await storage.getChecklistTemplatePurchaseByTemplateAndUser(templateId, userId);
      if (!purchase || purchase.status !== "completed") {
        return res.status(403).json({ message: "Você precisa adquirir este template primeiro" });
      }

      // Get template data
      const template = await storage.getChecklistTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template não encontrado" });
      }

      // Get client data
      const client = await storage.getClient(clientId);
      if (!client || client.companyId !== companyId) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      // Create checklist from template
      const templateData = template.templateData || {};
      const checklist = await storage.createChecklist({
        companyId: companyId!,
        clientId,
        name: `${template.name} - ${client.name}`,
        segment: template.segment,
        status: "in_progress",
        clienteNome: client.name,
        clienteCnpj: client.cnpj || undefined,
        historia: templateData.historia || undefined,
        localizacao: templateData.localizacao || undefined,
        segmentoDetalhado: templateData.segmentoDetalhado || undefined,
        produto: templateData.produto || undefined,
        numeros: templateData.numeros || undefined,
        noticias: templateData.noticias || undefined,
        mercado: templateData.mercado || undefined,
        oportunidades: templateData.oportunidades || undefined,
        pipeline: templateData.pipeline || undefined,
      });

      res.status(201).json({ 
        message: "Template aplicado com sucesso",
        checklist 
      });
    } catch (error) {
      console.error("Error applying template:", error);
      res.status(500).json({ message: "Failed to apply template" });
    }
  });

  // Route calculation API (QualP integration)
  app.post("/api/route-calculation", async (req, res) => {
    try {
      const { originCity, originState, destinationCity, destinationState, vehicleType, vehicleAxles } = req.body;
      
      if (!originCity || !originState || !destinationCity || !destinationState) {
        return res.status(400).json({ message: "Origem e destino sao obrigatorios" });
      }
      
      const token = process.env.QUALP_ACCESS_TOKEN;
      
      if (!token) {
        return res.status(503).json({ 
          message: "API de rotas nao configurada",
          configured: false,
          hint: "Configure QUALP_ACCESS_TOKEN para habilitar calculo automatico"
        });
      }
      
      const origin = `${originCity}, ${originState}`;
      const destination = `${destinationCity}, ${destinationState}`;
      
      const vehicleMap: Record<string, string> = {
        vuc: "caminhao",
        toco: "caminhao",
        truck: "caminhao",
        carreta: "caminhao",
        bitrem: "caminhao",
        rodotrem: "caminhao",
        van: "auto",
        fiorino: "auto",
      };
      
      const veiculo = vehicleMap[vehicleType] || "caminhao";
      const eixos = vehicleAxles || 2;
      
      const response = await fetch("https://api.qualp.com.br/rotas/v4/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Access-Token": token,
        },
        body: JSON.stringify({
          locations: [origin, destination],
          vehicleType: veiculo,
          vehicleAxis: eixos,
          showFreightTable: true,
          freightTableCategory: "A",
          freightTableLoad: "geral",
          freightTableAxis: "all",
        }),
      });
      
      if (!response.ok) {
        console.error("QualP API error:", response.status, response.statusText);
        const errorBody = await response.text().catch(() => "");
        console.error("QualP API error body:", errorBody);
        return res.status(502).json({ 
          message: "Erro ao consultar API de rotas",
          configured: true,
        });
      }
      
      const data = await response.json();
      
      if (!data || data.error) {
        return res.status(404).json({ 
          message: data?.error || "Rota nao encontrada",
          configured: true,
        });
      }
      
      let totalTolls = 0;
      if (data.tolls && Array.isArray(data.tolls)) {
        totalTolls = data.tolls.reduce((sum: number, toll: any) => sum + (toll.tariff || 0), 0);
      }
      
      res.json({
        configured: true,
        distanceKm: data.distance || 0,
        tollValue: totalTolls,
        duration: data.duration || "",
        tolls: data.tolls || [],
        freightTable: data.freight_table || null,
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      res.status(500).json({ message: "Erro ao calcular rota" });
    }
  });

  // Check if route API is configured
  app.get("/api/route-calculation/status", async (req, res) => {
    const token = process.env.QUALP_ACCESS_TOKEN;
    res.json({
      configured: !!token,
      provider: token ? "QualP" : null,
    });
  });

  // Freight calculation routes
  app.get("/api/freight-calculations", isAuthenticated, async (req, res) => {
    try {
      const calculations = await storage.getFreightCalculations();
      res.json(calculations);
    } catch (error) {
      console.error("Error fetching freight calculations:", error);
      res.status(500).json({ message: "Failed to fetch freight calculations" });
    }
  });

  app.post("/api/freight-calculations", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertFreightCalculationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid freight calculation data", errors: parsed.error.errors });
      }
      const calculation = await storage.createFreightCalculation(parsed.data);
      res.status(201).json(calculation);
    } catch (error) {
      console.error("Error creating freight calculation:", error);
      res.status(500).json({ message: "Failed to create freight calculation" });
    }
  });

  // Storage calculation routes
  app.get("/api/storage-calculations", isAuthenticated, async (req, res) => {
    try {
      const calculations = await storage.getStorageCalculations();
      res.json(calculations);
    } catch (error) {
      console.error("Error fetching storage calculations:", error);
      res.status(500).json({ message: "Failed to fetch storage calculations" });
    }
  });

  app.post("/api/storage-calculations", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertStorageCalculationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid storage calculation data", errors: parsed.error.errors });
      }
      const calculation = await storage.createStorageCalculation(parsed.data);
      res.status(201).json(calculation);
    } catch (error) {
      console.error("Error creating storage calculation:", error);
      res.status(500).json({ message: "Failed to create storage calculation" });
    }
  });

  // Saved routes - reuse KM and toll data for freight calculations
  app.get("/api/saved-routes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.companyId) {
        return res.status(400).json({ message: "Usuário não vinculado a uma empresa" });
      }
      const routes = await storage.getSavedRoutes(user.companyId);
      res.json(routes);
    } catch (error) {
      console.error("Error fetching saved routes:", error);
      res.status(500).json({ message: "Falha ao buscar rotas salvas" });
    }
  });

  app.get("/api/saved-routes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const route = await storage.getSavedRoute(id);
      if (!route) {
        return res.status(404).json({ message: "Rota não encontrada" });
      }
      res.json(route);
    } catch (error) {
      console.error("Error fetching saved route:", error);
      res.status(500).json({ message: "Falha ao buscar rota" });
    }
  });

  app.post("/api/saved-routes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.companyId) {
        return res.status(400).json({ message: "Usuário não vinculado a uma empresa" });
      }
      const body = { ...req.body, companyId: user.companyId };
      if (body.routeDate && typeof body.routeDate === "string") {
        body.routeDate = new Date(body.routeDate);
      }
      const parsed = insertSavedRouteSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      
      // Check for duplicate route (same origin, destination, and itinerary)
      const existingRoutes = await storage.getSavedRoutes(user.companyId);
      const isDuplicate = existingRoutes.some(r => 
        r.originCity === parsed.data.originCity &&
        r.originState === parsed.data.originState &&
        r.destinationCity === parsed.data.destinationCity &&
        r.destinationState === parsed.data.destinationState &&
        (r.itinerary || "") === (parsed.data.itinerary || "")
      );
      
      if (isDuplicate) {
        return res.status(400).json({ 
          message: "Já existe uma rota com a mesma origem, destino e itinerário" 
        });
      }
      
      const route = await storage.createSavedRoute(parsed.data);
      res.status(201).json(route);
    } catch (error) {
      console.error("Error creating saved route:", error);
      res.status(500).json({ message: "Falha ao criar rota" });
    }
  });

  app.patch("/api/saved-routes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as User;
      const body = { ...req.body };
      if (body.routeDate && typeof body.routeDate === "string") {
        body.routeDate = new Date(body.routeDate);
      }
      
      // Check for duplicate route on update (excluding current route)
      if (user.companyId && body.originCity && body.destinationCity) {
        const existingRoutes = await storage.getSavedRoutes(user.companyId);
        const isDuplicate = existingRoutes.some(r => 
          r.id !== id &&
          r.originCity === body.originCity &&
          r.originState === body.originState &&
          r.destinationCity === body.destinationCity &&
          r.destinationState === body.destinationState &&
          (r.itinerary || "") === (body.itinerary || "")
        );
        
        if (isDuplicate) {
          return res.status(400).json({ 
            message: "Já existe uma rota com a mesma origem, destino e itinerário" 
          });
        }
      }
      
      const route = await storage.updateSavedRoute(id, body);
      if (!route) {
        return res.status(404).json({ message: "Rota não encontrada" });
      }
      res.json(route);
    } catch (error) {
      console.error("Error updating saved route:", error);
      res.status(500).json({ message: "Falha ao atualizar rota" });
    }
  });

  app.delete("/api/saved-routes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSavedRoute(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting saved route:", error);
      res.status(500).json({ message: "Falha ao excluir rota" });
    }
  });

  // Financial account routes
  app.get("/api/financial", isAuthenticated, async (req, res) => {
    try {
      const accounts = await storage.getFinancialAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching financial accounts:", error);
      res.status(500).json({ message: "Failed to fetch financial accounts" });
    }
  });

  app.post("/api/financial", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertFinancialAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid financial account data", errors: parsed.error.errors });
      }
      const account = await storage.createFinancialAccount(parsed.data);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating financial account:", error);
      res.status(500).json({ message: "Failed to create financial account" });
    }
  });

  app.patch("/api/financial/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.updateFinancialAccount(id, req.body);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error updating financial account:", error);
      res.status(500).json({ message: "Failed to update financial account" });
    }
  });

  app.delete("/api/financial/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFinancialAccount(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting financial account:", error);
      res.status(500).json({ message: "Failed to delete financial account" });
    }
  });

  // Marketing materials routes
  app.get("/api/marketing", isAuthenticated, async (req, res) => {
    try {
      const materials = await storage.getMarketingMaterials();
      res.json(materials);
    } catch (error) {
      console.error("Error fetching marketing materials:", error);
      res.status(500).json({ message: "Failed to fetch marketing materials" });
    }
  });

  // Stripe routes
  app.get("/api/stripe/products", async (req, res) => {
    try {
      const rows = await storage.listStripeProductsWithPrices();
      const productsMap = new Map();
      for (const row of rows) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
            metadata: row.price_metadata,
          });
        }
      }
      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.json({ data: [] });
    }
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import("./stripeClient");
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error fetching publishable key:", error);
      res.status(500).json({ message: "Failed to fetch publishable key" });
    }
  });

  app.post("/api/stripe/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const { stripeService } = await import("./stripeService");
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { priceId } = req.body;
      if (!priceId) {
        return res.status(400).json({ message: "Price ID required" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(
          user.email || "",
          user.id,
          user.phone || undefined,
          user.cnpj || undefined
        );
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const session = await stripeService.createCheckoutSession(
        customerId,
        priceId,
        `${req.protocol}://${req.get("host")}/checkout/success`,
        `${req.protocol}://${req.get("host")}/checkout/cancel`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/portal", isAuthenticated, async (req: any, res) => {
    try {
      const { stripeService } = await import("./stripeService");
      const user = req.user;
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ message: "No subscription found" });
      }

      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${req.protocol}://${req.get("host")}/assinatura`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating portal session:", error);
      res.status(500).json({ message: "Failed to create portal session" });
    }
  });

  app.get("/api/subscription", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null, status: user?.subscriptionStatus || "free" });
      }

      const subscription = await storage.getStripeSubscription(user.stripeSubscriptionId);
      res.json({ subscription, status: user.subscriptionStatus });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Commercial proposals routes
  app.get("/api/commercial-proposals", isAuthenticated, async (req: any, res) => {
    try {
      const proposals = await storage.getCommercialProposals(req.user.companyId || 1);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get("/api/commercial-proposals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const proposal = await storage.getCommercialProposal(id);
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      if (proposal.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const routes = await storage.getProposalRoutes(id);
      res.json({ ...proposal, routes });
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  app.post("/api/commercial-proposals", isAuthenticated, async (req: any, res) => {
    try {
      const { routes, ...proposalData } = req.body;
      
      const proposalNumber = await storage.generateProposalNumber();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + (proposalData.validityDays || 15));
      
      const proposal = await storage.createCommercialProposal({
        companyId: req.user.companyId || 1,
        clientId: proposalData.clientId || null,
        proposalNumber,
        proposalType: proposalData.proposalType || "freight",
        clientName: proposalData.clientName,
        clientEmail: proposalData.clientEmail,
        clientPhone: proposalData.clientPhone,
        clientCnpj: proposalData.clientCnpj,
        status: "awaiting_approval",
        validUntil,
        contractType: proposalData.contractType,
        notes: proposalData.notes,
        totalValue: proposalData.totalValue,
        proposalData: proposalData.proposalData || null,
      });

      if (routes && routes.length > 0) {
        for (const route of routes) {
          await storage.createProposalRoute({
            proposalId: proposal.id,
            originCity: route.originCity,
            originState: route.originState,
            destinationCity: route.destinationCity,
            destinationState: route.destinationState,
            distanceKm: route.distanceKm,
            productType: route.productType,
            packagingType: route.packagingType,
            weight: route.weight,
            cargoValue: route.cargoValue,
            vehicleAxles: route.vehicleAxles,
            anttMinFreight: route.anttMinFreight,
            freightValue: route.freightValue,
            tollValue: route.tollValue,
            tollInIcmsBase: route.tollInIcmsBase,
            icmsRate: route.icmsRate,
            icmsValue: route.icmsValue,
            issRate: route.issRate,
            issValue: route.issValue,
            grisRate: route.grisRate,
            grisValue: route.grisValue,
            advRate: route.advRate,
            advValue: route.advValue,
            unloadingValue: route.unloadingValue,
            totalValue: route.totalValue,
            operationName: route.operationName,
          });
        }
      }

      res.status(201).json(proposal);
    } catch (error) {
      console.error("Error creating proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.patch("/api/commercial-proposals/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const { status } = req.body;
      
      const existingProposal = await storage.getCommercialProposal(id);
      if (!existingProposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      if (existingProposal.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const proposal = await storage.updateProposalStatus(id, status);
      
      if (status === "approved" && req.body.createOperations) {
        if (!proposal.clientId) {
          return res.status(400).json({ message: "Proposal must have a client to create operations" });
        }
        
        const routes = await storage.getProposalRoutes(id);
        const reviewMonths = proposal.contractType === "1_year" ? 12 : 6;
        const nextReviewDate = new Date();
        nextReviewDate.setMonth(nextReviewDate.getMonth() + reviewMonths);
        
        for (const route of routes) {
          await storage.createClientOperation({
            companyId: proposal.companyId,
            clientId: proposal.clientId,
            proposalId: proposal.id,
            operationName: route.operationName || `${route.originCity}/${route.originState} - ${route.destinationCity}/${route.destinationState}`,
            originCity: route.originCity,
            originState: route.originState,
            destinationCity: route.destinationCity,
            destinationState: route.destinationState,
            productType: route.productType,
            packagingType: route.packagingType,
            agreedFreight: route.totalValue,
            contractStartDate: new Date(),
            nextReviewDate,
            reviewPeriodMonths: reviewMonths,
            status: "active",
          });
        }
      }
      
      res.json(proposal);
    } catch (error) {
      console.error("Error updating proposal status:", error);
      res.status(500).json({ message: "Failed to update proposal status" });
    }
  });

  // Client operations routes
  app.get("/api/client-operations/:clientId", isAuthenticated, async (req: any, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const operations = await storage.getClientOperations(clientId);
      res.json(operations);
    } catch (error) {
      console.error("Error fetching client operations:", error);
      res.status(500).json({ message: "Failed to fetch client operations" });
    }
  });

  // PDF generation for proposals
  app.get("/api/commercial-proposals/:id/pdf", isAuthenticated, async (req: any, res) => {
    try {
      const PDFDocument = (await import("pdfkit")).default;
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const proposal = await storage.getCommercialProposal(id);
      
      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }
      if (proposal.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=proposta-${proposal.proposalNumber}.pdf`
      );
      
      doc.pipe(res);
      
      // Header based on proposal type
      const proposalType = (proposal as any).proposalType || "freight";
      const titleMap: Record<string, string> = {
        freight: "PROPOSTA COMERCIAL - FRETE",
        storage: "PROPOSTA COMERCIAL - ARMAZENAGEM",
        consulting: "PROPOSTA DE CONSULTORIA",
      };
      
      doc.fontSize(20).font("Helvetica-Bold").text(titleMap[proposalType] || "PROPOSTA COMERCIAL", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).font("Helvetica").text(`No: ${proposal.proposalNumber}`, { align: "center" });
      doc.moveDown(2);
      
      doc.fontSize(12).font("Helvetica-Bold").text("DADOS DO CLIENTE");
      doc.fontSize(10).font("Helvetica");
      doc.text(`Razao Social: ${proposal.clientName || "-"}`);
      doc.text(`CNPJ: ${proposal.clientCnpj || "-"}`);
      doc.text(`Email: ${proposal.clientEmail || "-"}`);
      doc.text(`Telefone: ${proposal.clientPhone || "-"}`);
      doc.moveDown();
      
      doc.fontSize(12).font("Helvetica-Bold").text("VALIDADE E CONDICOES");
      doc.fontSize(10).font("Helvetica");
      doc.text(`Data de Emissao: ${new Date(proposal.createdAt!).toLocaleDateString("pt-BR")}`);
      doc.text(`Valido ate: ${proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString("pt-BR") : "-"}`);
      
      // Type-specific content
      if (proposalType === "freight") {
        const contractLabel = proposal.contractType === "1_year" ? "Contrato 1 ano" : proposal.contractType === "6_months" ? "Contrato 6 meses" : "Spot (Avulso)";
        doc.text(`Tipo de Contrato: ${contractLabel}`);
        doc.moveDown();
        
        const routes = await storage.getProposalRoutes(id);
        doc.fontSize(12).font("Helvetica-Bold").text("ROTAS E VALORES");
        doc.moveDown(0.5);
        
        for (let i = 0; i < routes.length; i++) {
          const route = routes[i];
          doc.fontSize(11).font("Helvetica-Bold").text(`Rota ${i + 1}: ${route.operationName || `${route.originCity}/${route.originState} - ${route.destinationCity}/${route.destinationState}`}`);
          doc.fontSize(10).font("Helvetica");
          doc.text(`  Origem: ${route.originCity}/${route.originState}`);
          doc.text(`  Destino: ${route.destinationCity}/${route.destinationState}`);
          if (route.productType) doc.text(`  Tipo de Produto: ${route.productType}`);
          if (route.packagingType) doc.text(`  Embalagem: ${route.packagingType}`);
          if (route.weight) doc.text(`  Peso: ${route.weight} kg`);
          if (route.distanceKm) doc.text(`  Distancia: ${route.distanceKm} km`);
          doc.text(`  Frete Base: R$ ${parseFloat(String(route.freightValue || 0)).toFixed(2)}`);
          if (route.tollValue) doc.text(`  Pedagio: R$ ${parseFloat(String(route.tollValue)).toFixed(2)}`);
          if (route.grisValue) doc.text(`  GRIS: R$ ${parseFloat(String(route.grisValue)).toFixed(2)}`);
          if (route.advValue) doc.text(`  ADV: R$ ${parseFloat(String(route.advValue)).toFixed(2)}`);
          const taxType = route.icmsRate ? "ICMS" : "ISS";
          const taxRate = route.icmsRate || route.issRate || 0;
          const taxValue = route.icmsValue || route.issValue || 0;
          doc.text(`  ${taxType} (${taxRate}%): R$ ${parseFloat(String(taxValue)).toFixed(2)}`);
          doc.fontSize(11).font("Helvetica-Bold").text(`  TOTAL ROTA: R$ ${parseFloat(String(route.totalValue || 0)).toFixed(2)}`);
          doc.moveDown();
        }
      } else if (proposalType === "storage") {
        doc.moveDown();
        const data = (proposal as any).proposalData || {};
        
        doc.fontSize(12).font("Helvetica-Bold").text("DETALHES DA ARMAZENAGEM");
        doc.fontSize(10).font("Helvetica");
        doc.text(`Tipo de Armazenagem: ${data.storageTypeLabel || "-"}`);
        doc.text(`Area: ${data.area || 0} m²`);
        doc.text(`Periodo: ${data.period || 0} dias`);
        doc.text(`Taxa de Armazenagem: R$ ${data.storageRate || 0}/m² por mes`);
        doc.text(`Taxa de Movimentacao: R$ ${data.movementRate || 0}/m²`);
        doc.moveDown();
        
        if (data.calculations) {
          doc.fontSize(12).font("Helvetica-Bold").text("COMPOSICAO DE VALORES");
          doc.fontSize(10).font("Helvetica");
          doc.text(`Armazenagem: R$ ${parseFloat(String(data.calculations.storageValue || 0)).toFixed(2)}`);
          doc.text(`Movimentacao: R$ ${parseFloat(String(data.calculations.movementValue || 0)).toFixed(2)}`);
          doc.text(`Manuseio: R$ ${parseFloat(String(data.calculations.totalHandling || 0)).toFixed(2)}`);
          doc.text(`Seguro: R$ ${parseFloat(String(data.calculations.insuranceValue || 0)).toFixed(2)}`);
          doc.text(`Subtotal: R$ ${parseFloat(String(data.calculations.subtotal || 0)).toFixed(2)}`);
          doc.text(`Taxa Admin (10%): R$ ${parseFloat(String(data.calculations.adminFee || 0)).toFixed(2)}`);
          doc.moveDown();
        }
      } else if (proposalType === "consulting") {
        doc.moveDown();
        const data = (proposal as any).proposalData || {};
        
        doc.fontSize(12).font("Helvetica-Bold").text("FASES DE CONSULTORIA");
        doc.fontSize(10).font("Helvetica");
        
        if (data.phases && Array.isArray(data.phases)) {
          for (const phase of data.phases) {
            doc.text(`- ${phase.name}: R$ ${parseFloat(String(phase.price || 0)).toLocaleString("pt-BR")}${phase.commission ? ` + ${phase.commission}% sobre negocios fechados` : ""}`);
          }
        }
        
        if (data.contactName) {
          doc.moveDown();
          doc.text(`Contato: ${data.contactName}`);
        }
        doc.moveDown();
      }
      
      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").text(`VALOR TOTAL DA PROPOSTA: R$ ${parseFloat(String(proposal.totalValue || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, { align: "right" });
      doc.moveDown(2);
      
      if (proposal.notes) {
        doc.fontSize(12).font("Helvetica-Bold").text("OBSERVACOES");
        doc.fontSize(10).font("Helvetica").text(proposal.notes);
        doc.moveDown();
      }
      
      doc.fontSize(9).font("Helvetica").text("---", { align: "center" });
      doc.text("MCG Consultoria - Solucoes em Logistica", { align: "center" });
      doc.text("Este documento foi gerado automaticamente pela plataforma MCG.", { align: "center" });
      
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Quota management routes
  app.get("/api/calculations/quota", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const isPaid = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
      
      res.json({
        remaining: isPaid ? null : (user.freeCalculationsRemaining ?? 3),
        used: user.totalCalculationsUsed ?? 0,
        unlimited: isPaid,
        subscriptionStatus: user.subscriptionStatus,
      });
    } catch (error) {
      console.error("Error fetching quota:", error);
      res.status(500).json({ message: "Failed to fetch quota" });
    }
  });

  app.post("/api/calculations/use", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const isPaid = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
      
      if (!isPaid && (user.freeCalculationsRemaining ?? 3) <= 0) {
        return res.status(402).json({ 
          message: "Sem cálculos gratuitos restantes",
          requiresUpgrade: true,
        });
      }
      
      await storage.useCalculation(user.id);
      
      const updatedRemaining = isPaid ? null : Math.max(0, (user.freeCalculationsRemaining ?? 3) - 1);
      
      res.json({
        success: true,
        remaining: updatedRemaining,
        unlimited: isPaid,
      });
    } catch (error) {
      console.error("Error using calculation:", error);
      res.status(500).json({ message: "Failed to use calculation" });
    }
  });

  // Meeting objectives routes (catalog)
  app.get("/api/meeting-objectives", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user.companyId || 1;
      const objectives = await storage.getMeetingObjectives(companyId);
      res.json(objectives);
    } catch (error) {
      console.error("Error fetching meeting objectives:", error);
      res.status(500).json({ message: "Failed to fetch meeting objectives" });
    }
  });

  app.post("/api/meeting-objectives", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user.companyId || 1;
      const parsed = insertMeetingObjectiveSchema.safeParse({
        ...req.body,
        companyId,
        isCustom: true,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid objective data", errors: parsed.error.errors });
      }
      const objective = await storage.createMeetingObjective(parsed.data);
      res.status(201).json(objective);
    } catch (error) {
      console.error("Error creating meeting objective:", error);
      res.status(500).json({ message: "Failed to create meeting objective" });
    }
  });

  app.delete("/api/meeting-objectives/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMeetingObjective(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting meeting objective:", error);
      res.status(500).json({ message: "Failed to delete meeting objective" });
    }
  });

  // Meeting records routes (Ata Plano de Acao)
  app.get("/api/meeting-records", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user.companyId || 1;
      const records = await storage.getMeetingRecords(companyId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching meeting records:", error);
      res.status(500).json({ message: "Failed to fetch meeting records" });
    }
  });

  app.get("/api/meeting-records/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const record = await storage.getMeetingRecord(id);
      if (!record) {
        return res.status(404).json({ message: "Meeting record not found" });
      }
      if (record.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const actionItems = await storage.getMeetingActionItems(id);
      res.json({ ...record, actionItems });
    } catch (error) {
      console.error("Error fetching meeting record:", error);
      res.status(500).json({ message: "Failed to fetch meeting record" });
    }
  });

  app.post("/api/meeting-records", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const body = {
        ...req.body,
        companyId: userCompanyId,
        userId: req.user.id,
        meetingDate: req.body.meetingDate ? new Date(req.body.meetingDate) : undefined,
        nextReviewDate: req.body.nextReviewDate ? new Date(req.body.nextReviewDate) : undefined,
      };
      const parsed = insertMeetingRecordSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid meeting record data", errors: parsed.error.errors });
      }
      const record = await storage.createMeetingRecord(parsed.data);
      
      await logAudit(req, "create", "meeting_record", record.id, `Ata criada: ${record.title}`);
      
      // Create calendar event for meeting date
      if (record.meetingDate) {
        await storage.createCommercialEvent({
          companyId: userCompanyId,
          clientId: record.clientId,
          userId: req.user.id,
          title: `Reuniao: ${record.title}`,
          description: record.summary || "",
          eventType: "meeting",
          startDate: record.meetingDate,
          allDay: true,
          location: (record as any).meetingLocation || "",
          meetingRecordId: record.id,
          status: "scheduled",
        });
      }
      
      // Create calendar event for next review date
      if (record.nextReviewDate) {
        await storage.createCommercialEvent({
          companyId: userCompanyId,
          clientId: record.clientId,
          userId: req.user.id,
          title: `Revisao: ${record.title}`,
          description: `Proxima revisao da ata: ${record.title}`,
          eventType: "followup",
          startDate: record.nextReviewDate,
          allDay: true,
          meetingRecordId: record.id,
          status: "scheduled",
        });
      }
      
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating meeting record:", error);
      res.status(500).json({ message: "Failed to create meeting record" });
    }
  });

  app.patch("/api/meeting-records/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingRecord = await storage.getMeetingRecord(id);
      if (!existingRecord) {
        return res.status(404).json({ message: "Meeting record not found" });
      }
      if (existingRecord.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const body = {
        ...req.body,
        meetingDate: req.body.meetingDate ? new Date(req.body.meetingDate) : undefined,
        nextReviewDate: req.body.nextReviewDate ? new Date(req.body.nextReviewDate) : undefined,
      };
      const record = await storage.updateMeetingRecord(id, body);
      res.json(record);
    } catch (error) {
      console.error("Error updating meeting record:", error);
      res.status(500).json({ message: "Failed to update meeting record" });
    }
  });

  app.delete("/api/meeting-records/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingRecord = await storage.getMeetingRecord(id);
      if (!existingRecord) {
        return res.status(404).json({ message: "Meeting record not found" });
      }
      if (existingRecord.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteMeetingRecord(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting meeting record:", error);
      res.status(500).json({ message: "Failed to delete meeting record" });
    }
  });

  // Meeting record PDF generation
  app.get("/api/meeting-records/:id/pdf", isAuthenticated, async (req: any, res) => {
    try {
      const PDFDocument = (await import("pdfkit")).default;
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const record = await storage.getMeetingRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Meeting record not found" });
      }
      if (record.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const actionItems = await storage.getMeetingActionItems(id);
      const company = await storage.getCompany(userCompanyId);
      const client = record.clientId ? await storage.getClient(record.clientId) : null;
      
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=ata-${id}-${new Date().toISOString().split("T")[0]}.pdf`
      );
      
      doc.pipe(res);
      
      // Header with company logo if available
      if (company?.logo) {
        try {
          const base64Data = company.logo.split(",")[1] || company.logo;
          const logoBuffer = Buffer.from(base64Data, "base64");
          doc.image(logoBuffer, 50, 45, { width: 80 });
          doc.moveDown(3);
        } catch (e) {
          // Skip logo if error
        }
      }
      
      // Title
      doc.fontSize(20).font("Helvetica-Bold").text("ATA DE REUNIAO", { align: "center" });
      doc.moveDown();
      
      // Meeting info
      doc.fontSize(14).font("Helvetica-Bold").text(record.title);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Data: ${record.meetingDate ? new Date(record.meetingDate).toLocaleDateString("pt-BR") : "-"}`);
      const meetingMode = (record as any).meetingMode || "presencial";
      doc.text(`Modalidade: ${meetingMode === "online" ? "Online" : "Presencial"}`);
      if (meetingMode === "presencial" && (record as any).meetingLocation) {
        doc.text(`Local: ${(record as any).meetingLocation}`);
      }
      if (client) doc.text(`Cliente: ${client.name}`);
      doc.moveDown();
      
      // Participants
      if (record.participants) {
        doc.fontSize(12).font("Helvetica-Bold").text("Participantes:");
        doc.fontSize(10).font("Helvetica");
        try {
          const participants = JSON.parse(record.participants);
          participants.forEach((p: { name: string; email: string }) => {
            const displayName = p.name || p.email || "-";
            const displayEmail = p.email && p.name ? ` (${p.email})` : "";
            doc.text(`  - ${displayName}${displayEmail}`);
          });
        } catch {
          doc.text(`  ${record.participants}`);
        }
        doc.moveDown();
      }
      
      // Objectives
      const selectedObjectives = (record as any).selectedObjectives;
      if (selectedObjectives) {
        doc.fontSize(12).font("Helvetica-Bold").text("Objetivos:");
        doc.fontSize(10).font("Helvetica");
        try {
          const objectives = JSON.parse(selectedObjectives);
          objectives.forEach((obj: string) => {
            doc.text(`  - ${obj}`);
          });
        } catch {
          doc.text(`  ${selectedObjectives}`);
        }
        doc.moveDown();
      }
      
      // Summary
      if (record.summary) {
        doc.fontSize(12).font("Helvetica-Bold").text("Resumo / Pauta:");
        doc.fontSize(10).font("Helvetica").text(record.summary);
        doc.moveDown();
      }
      
      // Decisions
      if (record.decisions) {
        doc.fontSize(12).font("Helvetica-Bold").text("Decisoes Tomadas:");
        doc.fontSize(10).font("Helvetica").text(record.decisions);
        doc.moveDown();
      }
      
      // Action Items
      if (actionItems.length > 0) {
        doc.fontSize(12).font("Helvetica-Bold").text("Plano de Acao:");
        doc.fontSize(10).font("Helvetica");
        actionItems.forEach((item, index) => {
          doc.text(`  ${index + 1}. ${item.description}`);
          doc.text(`     Responsavel: ${item.responsible || "-"} | Prazo: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString("pt-BR") : "-"}`);
        });
        doc.moveDown();
      }
      
      // Next Steps
      if (record.nextSteps) {
        doc.fontSize(12).font("Helvetica-Bold").text("Proximos Passos:");
        doc.fontSize(10).font("Helvetica").text(record.nextSteps);
        doc.moveDown();
      }
      
      // Footer
      doc.fontSize(8).text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, { align: "right" });
      
      doc.end();
    } catch (error) {
      console.error("Error generating meeting record PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Send meeting record by email (requires email service configuration)
  app.post("/api/meeting-records/:id/send-email", isAuthenticated, async (req: any, res) => {
    try {
      const { emailService } = await import("./emailService");
      const PDFDocument = (await import("pdfkit")).default;
      
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const record = await storage.getMeetingRecord(id);
      
      if (!record) {
        return res.status(404).json({ message: "Meeting record not found" });
      }
      if (record.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if email service is configured
      if (!emailService.isConfigured()) {
        return res.status(503).json({ 
          message: "Servico de email nao configurado. Configure RESEND_API_KEY para habilitar o envio de emails.",
          emailServiceNotConfigured: true 
        });
      }
      
      // Parse participants to get emails
      let emails: string[] = [];
      try {
        const participants = JSON.parse(record.participants || "[]");
        emails = participants.filter((p: { email: string }) => p.email).map((p: { email: string }) => p.email);
      } catch {
        // No valid participants
      }
      
      if (emails.length === 0) {
        return res.status(400).json({ message: "Nenhum participante com email cadastrado" });
      }
      
      // Generate PDF buffer
      const actionItems = await storage.getMeetingActionItems(id);
      const company = await storage.getCompany(userCompanyId);
      const client = record.clientId ? await storage.getClient(record.clientId) : null;
      
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      
      const pdfPromise = new Promise<Buffer>((resolve) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
      });
      
      // Build PDF content
      if (company?.logo) {
        try {
          const base64Data = company.logo.split(",")[1] || company.logo;
          const logoBuffer = Buffer.from(base64Data, "base64");
          doc.image(logoBuffer, 50, 45, { width: 80 });
          doc.moveDown(3);
        } catch { /* skip logo */ }
      }
      
      doc.fontSize(20).font("Helvetica-Bold").text("ATA DE REUNIAO", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").text(record.title);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Data: ${record.meetingDate ? new Date(record.meetingDate).toLocaleDateString("pt-BR") : "-"}`);
      if (client) doc.text(`Cliente: ${client.name}`);
      doc.moveDown();
      
      if (record.participants) {
        doc.fontSize(12).font("Helvetica-Bold").text("Participantes:");
        doc.fontSize(10).font("Helvetica");
        try {
          const participants = JSON.parse(record.participants);
          participants.forEach((p: { name: string; email: string }) => {
            const displayName = p.name || p.email || "-";
            const displayEmail = p.email && p.name ? ` (${p.email})` : "";
            doc.text(`  - ${displayName}${displayEmail}`);
          });
        } catch {
          doc.text(`  ${record.participants}`);
        }
        doc.moveDown();
      }
      
      if (record.summary) {
        doc.fontSize(12).font("Helvetica-Bold").text("Resumo / Pauta:");
        doc.fontSize(10).font("Helvetica").text(record.summary);
        doc.moveDown();
      }
      
      if (record.decisions) {
        doc.fontSize(12).font("Helvetica-Bold").text("Decisoes Tomadas:");
        doc.fontSize(10).font("Helvetica").text(record.decisions);
        doc.moveDown();
      }
      
      if (actionItems.length > 0) {
        doc.fontSize(12).font("Helvetica-Bold").text("Plano de Acao:");
        doc.fontSize(10).font("Helvetica");
        actionItems.forEach((item, index) => {
          doc.text(`  ${index + 1}. ${item.description}`);
          doc.text(`     Responsavel: ${item.responsible || "-"} | Prazo: ${item.dueDate ? new Date(item.dueDate).toLocaleDateString("pt-BR") : "-"}`);
        });
        doc.moveDown();
      }
      
      if (record.nextSteps) {
        doc.fontSize(12).font("Helvetica-Bold").text("Proximos Passos:");
        doc.fontSize(10).font("Helvetica").text(record.nextSteps);
        doc.moveDown();
      }
      
      doc.fontSize(8).text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, { align: "right" });
      doc.end();
      
      const pdfBuffer = await pdfPromise;
      
      // Send email with PDF attachment
      const result = await emailService.send({
        to: emails,
        subject: `Ata de Reuniao: ${record.title}`,
        html: `
          <h2>Ata de Reuniao</h2>
          <p><strong>Titulo:</strong> ${record.title}</p>
          <p><strong>Data:</strong> ${record.meetingDate ? new Date(record.meetingDate).toLocaleDateString("pt-BR") : "-"}</p>
          ${client ? `<p><strong>Cliente:</strong> ${client.name}</p>` : ""}
          <p>Segue em anexo a ata completa em formato PDF.</p>
          <br/>
          <p><em>Este email foi enviado automaticamente pelo MCG Consultoria.</em></p>
        `,
        attachments: [{
          filename: `ata-${id}-${new Date().toISOString().split("T")[0]}.pdf`,
          content: pdfBuffer,
        }],
      });
      
      if (result.success) {
        await storage.updateMeetingRecord(id, { status: "sent" });
        res.json({ 
          success: true, 
          message: `Ata enviada com sucesso para ${emails.length} participante(s)`,
          recipients: emails 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: result.message,
          error: result.error 
        });
      }
    } catch (error) {
      console.error("Error sending meeting record email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Meeting action items routes
  app.get("/api/meeting-records/:id/action-items", isAuthenticated, async (req: any, res) => {
    try {
      const meetingRecordId = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const record = await storage.getMeetingRecord(meetingRecordId);
      if (!record) {
        return res.status(404).json({ message: "Meeting record not found" });
      }
      if (record.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const items = await storage.getMeetingActionItems(meetingRecordId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching meeting action items:", error);
      res.status(500).json({ message: "Failed to fetch meeting action items" });
    }
  });

  app.post("/api/meeting-records/:id/action-items", isAuthenticated, async (req: any, res) => {
    try {
      const meetingRecordId = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const record = await storage.getMeetingRecord(meetingRecordId);
      if (!record) {
        return res.status(404).json({ message: "Meeting record not found" });
      }
      if (record.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const body = {
        ...req.body,
        meetingRecordId,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      };
      const parsed = insertMeetingActionItemSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid action item data", errors: parsed.error.errors });
      }
      const item = await storage.createMeetingActionItem(parsed.data);
      
      if (item.dueDate) {
        const taskData = {
          companyId: userCompanyId,
          clientId: record.clientId,
          meetingRecordId: meetingRecordId,
          actionItemId: item.id,
          title: item.description,
          description: `Acao da ata: ${record.title}`,
          assignedTo: item.responsible,
          assignedEmail: item.responsibleEmail,
          priority: item.priority || "medium",
          status: "todo",
          dueDate: item.dueDate,
        };
        const task = await storage.createTask(taskData);
        await storage.updateMeetingActionItem(item.id, { linkedTaskId: task.id });
        
        // Create calendar event for task due date
        await storage.createCommercialEvent({
          companyId: userCompanyId,
          clientId: record.clientId,
          userId: req.user.id,
          title: `Tarefa: ${item.description}`,
          description: `Responsavel: ${item.responsible || "-"}\nAta: ${record.title}`,
          eventType: "deadline",
          startDate: item.dueDate,
          allDay: true,
          status: "scheduled",
        });
      }
      
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating meeting action item:", error);
      res.status(500).json({ message: "Failed to create meeting action item" });
    }
  });

  app.patch("/api/meeting-action-items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateMeetingActionItem(id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Action item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating meeting action item:", error);
      res.status(500).json({ message: "Failed to update meeting action item" });
    }
  });

  app.delete("/api/meeting-action-items/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMeetingActionItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting meeting action item:", error);
      res.status(500).json({ message: "Failed to delete meeting action item" });
    }
  });

  // Commercial events routes
  app.get("/api/commercial-events", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const events = await storage.getCommercialEvents(userCompanyId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching commercial events:", error);
      res.status(500).json({ message: "Failed to fetch commercial events" });
    }
  });

  app.get("/api/commercial-events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const event = await storage.getCommercialEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Commercial event not found" });
      }
      if (event.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching commercial event:", error);
      res.status(500).json({ message: "Failed to fetch commercial event" });
    }
  });

  app.post("/api/commercial-events", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const parsed = insertCommercialEventSchema.safeParse({
        ...req.body,
        companyId: userCompanyId,
        userId: req.user.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid commercial event data", errors: parsed.error.errors });
      }
      const event = await storage.createCommercialEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating commercial event:", error);
      res.status(500).json({ message: "Failed to create commercial event" });
    }
  });

  app.patch("/api/commercial-events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingEvent = await storage.getCommercialEvent(id);
      if (!existingEvent) {
        return res.status(404).json({ message: "Commercial event not found" });
      }
      if (existingEvent.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const event = await storage.updateCommercialEvent(id, req.body);
      res.json(event);
    } catch (error) {
      console.error("Error updating commercial event:", error);
      res.status(500).json({ message: "Failed to update commercial event" });
    }
  });

  app.delete("/api/commercial-events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingEvent = await storage.getCommercialEvent(id);
      if (!existingEvent) {
        return res.status(404).json({ message: "Commercial event not found" });
      }
      if (existingEvent.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteCommercialEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting commercial event:", error);
      res.status(500).json({ message: "Failed to delete commercial event" });
    }
  });

  // Google Calendar sync endpoint
  app.post("/api/commercial-events/:id/sync-google-calendar", isAuthenticated, async (req: any, res) => {
    try {
      const { createCalendarEvent, isGoogleIntegrationAvailable } = await import("./googleServices");
      
      if (!isGoogleIntegrationAvailable()) {
        return res.status(400).json({ message: "Integracao com Google Calendar nao configurada", configured: false });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de evento invalido" });
      }
      const userCompanyId = req.user?.companyId || 1;
      const event = await storage.getCommercialEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Evento nao encontrado" });
      }
      if (event.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const client = event.clientId ? await storage.getClient(event.clientId) : null;
      const description = `${event.description || ""}\n\nCliente: ${client?.name || "Nao especificado"}\nLocal: ${event.location || "Nao especificado"}`;
      
      const startDate = event.startDate ? new Date(event.startDate) : new Date();
      const endDate = event.endDate ? new Date(event.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000);

      const result = await createCalendarEvent(
        event.title,
        description,
        startDate,
        endDate
      );

      if (result.success) {
        res.json({ success: true, message: "Evento sincronizado com Google Calendar", eventId: result.eventId });
      } else {
        res.status(500).json({ success: false, message: "Erro ao sincronizar", error: result.error });
      }
    } catch (error: any) {
      console.error("Error syncing to Google Calendar:", error);
      res.status(500).json({ message: "Falha ao sincronizar com Google Calendar", error: error.message });
    }
  });

  // Google Sheets export endpoint
  app.post("/api/export/google-sheets", isAuthenticated, async (req: any, res) => {
    try {
      const { exportToGoogleSheets, isGoogleIntegrationAvailable } = await import("./googleServices");
      
      if (!isGoogleIntegrationAvailable()) {
        return res.status(400).json({ message: "Integracao com Google Sheets nao configurada", configured: false });
      }

      const { type } = req.body;
      if (!type || !["clients", "tasks", "events"].includes(type)) {
        return res.status(400).json({ message: "Tipo de exportacao invalido. Use: clients, tasks, events" });
      }
      const userCompanyId = req.user?.companyId || 1;
      let data: any[][] = [];
      let sheetName = "";

      switch (type) {
        case "clients":
          const clients = await storage.getClients(userCompanyId);
          sheetName = `MCG_Clientes_${new Date().toISOString().split('T')[0]}`;
          data = [
            ["Nome", "Nome Fantasia", "CNPJ", "Email", "Telefone", "Cidade", "Estado", "Segmento", "Status", "Estagio Pipeline"],
            ...clients.map(c => [
              c.name || "",
              c.tradeName || "",
              c.cnpj || "",
              c.email || "",
              c.phone || "",
              c.city || "",
              c.state || "",
              c.segment || "",
              c.status || "",
              c.pipelineStage || ""
            ])
          ];
          break;

        case "tasks":
          const tasks = await storage.getTasks(userCompanyId);
          sheetName = `MCG_Tarefas_${new Date().toISOString().split('T')[0]}`;
          data = [
            ["Titulo", "Descricao", "Prioridade", "Status", "Data Limite", "Responsavel"],
            ...tasks.map(t => [
              t.title || "",
              t.description || "",
              t.priority || "",
              t.status || "",
              t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : "",
              t.assignedTo || ""
            ])
          ];
          break;

        case "events":
          const events = await storage.getCommercialEvents(userCompanyId);
          sheetName = `MCG_Eventos_${new Date().toISOString().split('T')[0]}`;
          data = [
            ["Titulo", "Tipo", "Data Inicio", "Data Fim", "Local", "Descricao"],
            ...events.map(e => [
              e.title || "",
              e.eventType || "",
              e.startDate ? new Date(e.startDate).toLocaleString('pt-BR') : "",
              e.endDate ? new Date(e.endDate).toLocaleString('pt-BR') : "",
              e.location || "",
              e.description || ""
            ])
          ];
          break;

        default:
          return res.status(400).json({ message: "Tipo de exportacao invalido" });
      }

      const result = await exportToGoogleSheets(sheetName, data);

      if (result.success) {
        res.json({ 
          success: true, 
          message: "Dados exportados para Google Sheets", 
          spreadsheetUrl: result.spreadsheetUrl 
        });
      } else {
        res.status(500).json({ success: false, message: "Erro ao exportar", error: result.error });
      }
    } catch (error: any) {
      console.error("Error exporting to Google Sheets:", error);
      res.status(500).json({ message: "Falha ao exportar para Google Sheets", error: error.message });
    }
  });

  // Check Google integration status
  app.get("/api/google/status", isAuthenticated, async (req: any, res) => {
    try {
      const { isGoogleIntegrationAvailable } = await import("./googleServices");
      res.json({ 
        configured: isGoogleIntegrationAvailable(),
        services: {
          gmail: isGoogleIntegrationAvailable(),
          calendar: isGoogleIntegrationAvailable(),
          drive: isGoogleIntegrationAvailable(),
          sheets: isGoogleIntegrationAvailable()
        }
      });
    } catch (error) {
      res.json({ configured: false, services: {} });
    }
  });

  // GitHub integration routes
  app.get("/api/github/status", isAuthenticated, async (req: any, res) => {
    try {
      const { isGitHubIntegrationAvailable, getAuthenticatedUser } = await import("./githubService");
      const configured = isGitHubIntegrationAvailable();
      let user = null;
      if (configured) {
        user = await getAuthenticatedUser();
      }
      res.json({ configured, user });
    } catch (error) {
      res.json({ configured: false, user: null });
    }
  });

  app.get("/api/github/repositories", isAuthenticated, async (req: any, res) => {
    try {
      const { listUserRepositories, isGitHubIntegrationAvailable } = await import("./githubService");
      if (!isGitHubIntegrationAvailable()) {
        return res.status(400).json({ message: "GitHub nao configurado" });
      }
      const repos = await listUserRepositories();
      res.json(repos);
    } catch (error: any) {
      console.error("Error listing GitHub repos:", error);
      res.status(500).json({ message: "Erro ao listar repositorios", error: error.message });
    }
  });

  app.post("/api/github/create-repository", isAuthenticated, async (req: any, res) => {
    try {
      const { createRepository, isGitHubIntegrationAvailable } = await import("./githubService");
      if (!isGitHubIntegrationAvailable()) {
        return res.status(400).json({ message: "GitHub nao configurado" });
      }
      const { name, description, isPrivate } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Nome do repositorio e obrigatorio" });
      }
      const result = await createRepository(name, description || "", isPrivate !== false);
      if (result.success) {
        res.json({ success: true, url: result.url });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      console.error("Error creating GitHub repo:", error);
      res.status(500).json({ message: "Erro ao criar repositorio", error: error.message });
    }
  });

  // Projects routes
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const projects = await storage.getProjects(userCompanyId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const parsed = insertProjectSchema.safeParse({
        ...req.body,
        companyId: userCompanyId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid project data", errors: parsed.error.errors });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingProject = await storage.getProject(id);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (existingProject.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const project = await storage.updateProject(id, req.body);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingProject = await storage.getProject(id);
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (existingProject.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const tasks = await storage.getTasks(userCompanyId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/projects/:id/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const tasks = await storage.getTasksByProject(projectId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (task.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const parsed = insertTaskSchema.safeParse({
        ...req.body,
        companyId: userCompanyId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid task data", errors: parsed.error.errors });
      }
      const task = await storage.createTask(parsed.data);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (existingTask.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const task = await storage.updateTask(id, req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingTask = await storage.getTask(id);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (existingTask.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // RFI routes
  app.get("/api/rfis", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const rfis = await storage.getRfis(userCompanyId);
      res.json(rfis);
    } catch (error) {
      console.error("Error fetching RFIs:", error);
      res.status(500).json({ message: "Failed to fetch RFIs" });
    }
  });

  app.get("/api/rfis/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const rfi = await storage.getRfi(id);
      if (!rfi) {
        return res.status(404).json({ message: "RFI not found" });
      }
      if (rfi.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(rfi);
    } catch (error) {
      console.error("Error fetching RFI:", error);
      res.status(500).json({ message: "Failed to fetch RFI" });
    }
  });

  app.post("/api/rfis", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const parsed = insertRfiSchema.safeParse({
        ...req.body,
        companyId: userCompanyId,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid RFI data", errors: parsed.error.errors });
      }
      const rfi = await storage.createRfi(parsed.data);
      res.status(201).json(rfi);
    } catch (error) {
      console.error("Error creating RFI:", error);
      res.status(500).json({ message: "Failed to create RFI" });
    }
  });

  app.patch("/api/rfis/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingRfi = await storage.getRfi(id);
      if (!existingRfi) {
        return res.status(404).json({ message: "RFI not found" });
      }
      if (existingRfi.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const rfi = await storage.updateRfi(id, req.body);
      res.json(rfi);
    } catch (error) {
      console.error("Error updating RFI:", error);
      res.status(500).json({ message: "Failed to update RFI" });
    }
  });

  app.delete("/api/rfis/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      const existingRfi = await storage.getRfi(id);
      if (!existingRfi) {
        return res.status(404).json({ message: "RFI not found" });
      }
      if (existingRfi.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteRfi(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting RFI:", error);
      res.status(500).json({ message: "Failed to delete RFI" });
    }
  });

  // ============================================
  // BILLING PACE (RITMO DE FATURAMENTO) ROUTES
  // ============================================

  // Get billing pace data for dashboard
  app.get("/api/dashboard/billing-pace", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const monthParam = req.query.month as string; // YYYY-MM format
      
      // Parse the month or default to current month
      const now = new Date();
      let year: number, month: number;
      
      if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
        [year, month] = monthParam.split("-").map(Number);
      } else {
        year = now.getFullYear();
        month = now.getMonth() + 1;
      }
      
      // Calculate date ranges
      const currentMonthStart = new Date(year, month - 1, 1);
      const currentMonthEnd = new Date(year, month, 0); // Last day of month
      const daysInMonth = currentMonthEnd.getDate();
      
      // For "ritmo" calculation: sum from day 1 to day before today (or end of month if past)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let ritmoEndDate: Date;
      if (year === today.getFullYear() && month === today.getMonth() + 1) {
        // Current month: use yesterday
        ritmoEndDate = new Date(today);
        ritmoEndDate.setDate(ritmoEndDate.getDate() - 1);
      } else {
        // Past or future month: use last day of that month
        ritmoEndDate = new Date(currentMonthEnd);
      }
      
      // Previous year same month
      const prevYearStart = new Date(year - 1, month - 1, 1);
      const prevYearEnd = new Date(year - 1, month, 0);
      
      // Last 3 months (not including current)
      const threeMonthsAgo = new Date(year, month - 4, 1);
      const oneMonthAgo = new Date(year, month - 1, 0);
      
      // Get all client operations for this company
      const operations = await storage.getAllClientOperations(userCompanyId);
      
      // Get billing entries for various periods
      const currentMonthEntries = await storage.getOperationBillingEntries(
        userCompanyId,
        currentMonthStart,
        currentMonthEnd
      );
      
      const prevYearEntries = await storage.getOperationBillingEntries(
        userCompanyId,
        prevYearStart,
        prevYearEnd
      );
      
      const last3MonthsEntries = await storage.getOperationBillingEntries(
        userCompanyId,
        threeMonthsAgo,
        oneMonthAgo
      );
      
      // Get goals for current month
      const goalMonth = `${year}-${String(month).padStart(2, "0")}`;
      const goals = await storage.getOperationBillingGoals(userCompanyId, goalMonth);
      const goalsMap = new Map(goals.map(g => [g.operationId, Number(g.goalAmount)]));
      
      // Get clients for names
      const clients = await storage.getClients(userCompanyId);
      const clientsMap = new Map(clients.map(c => [c.id, c.name]));
      
      // Aggregate data by operation
      const billingPaceData = operations.map(op => {
        // Current month total
        const currentMonthTotal = currentMonthEntries
          .filter(e => e.operationId === op.id)
          .reduce((sum, e) => sum + Number(e.amount), 0);
        
        // Entries up to ritmoEndDate for ritmo calculation
        const ritmoEntries = currentMonthEntries.filter(e => {
          const entryDate = new Date(e.billingDate);
          return e.operationId === op.id && entryDate <= ritmoEndDate;
        });
        const ritmoSum = ritmoEntries.reduce((sum, e) => sum + Number(e.amount), 0);
        
        // Ritmo = (sum of days 1 to cutoff) / elapsed days * total days in month = projected monthly total
        const elapsedDays = Math.max(1, ritmoEndDate.getDate());
        const ritmo = daysInMonth > 0 ? (ritmoSum / elapsedDays) * daysInMonth : 0;
        
        // Previous year same month
        const prevYearTotal = prevYearEntries
          .filter(e => e.operationId === op.id)
          .reduce((sum, e) => sum + Number(e.amount), 0);
        
        // Last 3 months average
        const last3MonthsTotal = last3MonthsEntries
          .filter(e => e.operationId === op.id)
          .reduce((sum, e) => sum + Number(e.amount), 0);
        const avg3Months = last3MonthsTotal / 3;
        
        // Goal
        const goal = goalsMap.get(op.id) || 0;
        
        return {
          operationId: op.id,
          operationName: op.operationName,
          clientId: op.clientId,
          clientName: clientsMap.get(op.clientId) || "Cliente",
          avg3Months,
          prevYearSameMonth: prevYearTotal,
          currentMonth: currentMonthTotal,
          ritmo,
          goal,
        };
      });
      
      res.json({
        month: goalMonth,
        daysInMonth,
        ritmoCalculatedUntilDay: ritmoEndDate.getDate(),
        data: billingPaceData,
      });
    } catch (error) {
      console.error("Error fetching billing pace:", error);
      res.status(500).json({ message: "Failed to fetch billing pace data" });
    }
  });

  // Billing Entries CRUD
  app.get("/api/billing-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const entries = await storage.getOperationBillingEntries(userCompanyId, start, end);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching billing entries:", error);
      res.status(500).json({ message: "Failed to fetch billing entries" });
    }
  });

  app.post("/api/billing-entries", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const parsed = insertOperationBillingEntrySchema.safeParse({
        ...req.body,
        companyId: userCompanyId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      
      const entry = await storage.createOperationBillingEntry(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating billing entry:", error);
      res.status(500).json({ message: "Failed to create billing entry" });
    }
  });

  app.patch("/api/billing-entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      
      // Verify ownership by fetching entries for this company and checking if the ID exists
      const allEntries = await storage.getOperationBillingEntries(userCompanyId, new Date(2000, 0, 1), new Date(2100, 0, 1));
      const existingEntry = allEntries.find(e => e.id === id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      const entry = await storage.updateOperationBillingEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error updating billing entry:", error);
      res.status(500).json({ message: "Failed to update billing entry" });
    }
  });

  app.delete("/api/billing-entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      
      // Verify ownership
      const allEntries = await storage.getOperationBillingEntries(userCompanyId, new Date(2000, 0, 1), new Date(2100, 0, 1));
      const existingEntry = allEntries.find(e => e.id === id);
      if (!existingEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      await storage.deleteOperationBillingEntry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting billing entry:", error);
      res.status(500).json({ message: "Failed to delete billing entry" });
    }
  });

  // Billing Goals CRUD
  app.get("/api/billing-goals", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const goalMonth = req.query.month as string | undefined;
      
      const goals = await storage.getOperationBillingGoals(userCompanyId, goalMonth);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching billing goals:", error);
      res.status(500).json({ message: "Failed to fetch billing goals" });
    }
  });

  app.post("/api/billing-goals", isAuthenticated, async (req: any, res) => {
    try {
      const userCompanyId = req.user.companyId || 1;
      const parsed = insertOperationBillingGoalSchema.safeParse({
        ...req.body,
        companyId: userCompanyId,
      });
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      
      const goal = await storage.createOperationBillingGoal(parsed.data);
      res.status(201).json(goal);
    } catch (error) {
      console.error("Error creating billing goal:", error);
      res.status(500).json({ message: "Failed to create billing goal" });
    }
  });

  app.patch("/api/billing-goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      
      // Verify ownership
      const allGoals = await storage.getOperationBillingGoals(userCompanyId);
      const existingGoal = allGoals.find(g => g.id === id);
      if (!existingGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const goal = await storage.updateOperationBillingGoal(id, req.body);
      res.json(goal);
    } catch (error) {
      console.error("Error updating billing goal:", error);
      res.status(500).json({ message: "Failed to update billing goal" });
    }
  });

  app.delete("/api/billing-goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userCompanyId = req.user.companyId || 1;
      
      // Verify ownership
      const allGoals = await storage.getOperationBillingGoals(userCompanyId);
      const existingGoal = allGoals.find(g => g.id === id);
      if (!existingGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      await storage.deleteOperationBillingGoal(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting billing goal:", error);
      res.status(500).json({ message: "Failed to delete billing goal" });
    }
  });

  // ============================================
  // ADMIN MCG ROUTES
  // ============================================

  // Admin Dashboard
  app.get("/api/admin/dashboard", isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Admin Leads
  app.get("/api/admin/leads", isAdmin, async (req: any, res) => {
    try {
      const leads = await storage.getAdminLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching admin leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/admin/leads/:id", isAdmin, async (req: any, res) => {
    try {
      const lead = await storage.getAdminLead(parseInt(req.params.id));
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (error) {
      console.error("Error fetching admin lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post("/api/admin/leads", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const lead = await storage.createAdminLead(parsed.data);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating admin lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/admin/leads/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminLeadSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const lead = await storage.updateAdminLead(parseInt(req.params.id), parsed.data);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (error) {
      console.error("Error updating admin lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/admin/leads/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminLead(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Admin Proposals
  app.get("/api/admin/proposals", isAdmin, async (req: any, res) => {
    try {
      const proposals = await storage.getAdminProposals();
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching admin proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get("/api/admin/proposals/:id", isAdmin, async (req: any, res) => {
    try {
      const proposal = await storage.getAdminProposal(parseInt(req.params.id));
      if (!proposal) return res.status(404).json({ message: "Proposal not found" });
      res.json(proposal);
    } catch (error) {
      console.error("Error fetching admin proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  app.post("/api/admin/proposals", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProposalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const proposal = await storage.createAdminProposal(parsed.data);
      res.status(201).json(proposal);
    } catch (error) {
      console.error("Error creating admin proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.patch("/api/admin/proposals/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProposalSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const proposal = await storage.updateAdminProposal(parseInt(req.params.id), parsed.data);
      if (!proposal) return res.status(404).json({ message: "Proposal not found" });
      res.json(proposal);
    } catch (error) {
      console.error("Error updating admin proposal:", error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  app.delete("/api/admin/proposals/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminProposal(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin proposal:", error);
      res.status(500).json({ message: "Failed to delete proposal" });
    }
  });

  // Admin Contracts
  app.get("/api/admin/contracts", isAdmin, async (req: any, res) => {
    try {
      const contracts = await storage.getAdminContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching admin contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get("/api/admin/contracts/:id", isAdmin, async (req: any, res) => {
    try {
      const contract = await storage.getAdminContract(parseInt(req.params.id));
      if (!contract) return res.status(404).json({ message: "Contract not found" });
      res.json(contract);
    } catch (error) {
      console.error("Error fetching admin contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post("/api/admin/contracts", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminContractSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const contract = await storage.createAdminContract(parsed.data);
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating admin contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.patch("/api/admin/contracts/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminContractSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const contract = await storage.updateAdminContract(parseInt(req.params.id), parsed.data);
      if (!contract) return res.status(404).json({ message: "Contract not found" });
      res.json(contract);
    } catch (error) {
      console.error("Error updating admin contract:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  app.delete("/api/admin/contracts/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminContract(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin contract:", error);
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Admin Projects
  app.get("/api/admin/projects", isAdmin, async (req: any, res) => {
    try {
      const projects = await storage.getAdminProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching admin projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/admin/projects/:id", isAdmin, async (req: any, res) => {
    try {
      const project = await storage.getAdminProject(parseInt(req.params.id));
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (error) {
      console.error("Error fetching admin project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/admin/projects", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const project = await storage.createAdminProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating admin project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/admin/projects/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProjectSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const project = await storage.updateAdminProject(parseInt(req.params.id), parsed.data);
      if (!project) return res.status(404).json({ message: "Project not found" });
      res.json(project);
    } catch (error) {
      console.error("Error updating admin project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminProject(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Admin Project Phases
  app.get("/api/admin/projects/:projectId/phases", isAdmin, async (req: any, res) => {
    try {
      const phases = await storage.getAdminProjectPhases(parseInt(req.params.projectId));
      res.json(phases);
    } catch (error) {
      console.error("Error fetching admin project phases:", error);
      res.status(500).json({ message: "Failed to fetch phases" });
    }
  });

  app.post("/api/admin/project-phases", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProjectPhaseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const phase = await storage.createAdminProjectPhase(parsed.data);
      res.status(201).json(phase);
    } catch (error) {
      console.error("Error creating admin project phase:", error);
      res.status(500).json({ message: "Failed to create phase" });
    }
  });

  app.patch("/api/admin/project-phases/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProjectPhaseSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const phase = await storage.updateAdminProjectPhase(parseInt(req.params.id), parsed.data);
      if (!phase) return res.status(404).json({ message: "Phase not found" });
      res.json(phase);
    } catch (error) {
      console.error("Error updating admin project phase:", error);
      res.status(500).json({ message: "Failed to update phase" });
    }
  });

  app.delete("/api/admin/project-phases/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminProjectPhase(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin project phase:", error);
      res.status(500).json({ message: "Failed to delete phase" });
    }
  });

  // Admin Project Deliverables
  app.get("/api/admin/projects/:projectId/deliverables", isAdmin, async (req: any, res) => {
    try {
      const deliverables = await storage.getAdminProjectDeliverables(parseInt(req.params.projectId));
      res.json(deliverables);
    } catch (error) {
      console.error("Error fetching admin project deliverables:", error);
      res.status(500).json({ message: "Failed to fetch deliverables" });
    }
  });

  app.post("/api/admin/project-deliverables", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProjectDeliverableSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const deliverable = await storage.createAdminProjectDeliverable(parsed.data);
      res.status(201).json(deliverable);
    } catch (error) {
      console.error("Error creating admin project deliverable:", error);
      res.status(500).json({ message: "Failed to create deliverable" });
    }
  });

  app.patch("/api/admin/project-deliverables/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminProjectDeliverableSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const deliverable = await storage.updateAdminProjectDeliverable(parseInt(req.params.id), parsed.data);
      if (!deliverable) return res.status(404).json({ message: "Deliverable not found" });
      res.json(deliverable);
    } catch (error) {
      console.error("Error updating admin project deliverable:", error);
      res.status(500).json({ message: "Failed to update deliverable" });
    }
  });

  app.delete("/api/admin/project-deliverables/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminProjectDeliverable(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin project deliverable:", error);
      res.status(500).json({ message: "Failed to delete deliverable" });
    }
  });

  // Admin Partnerships
  app.get("/api/admin/partnerships", isAdmin, async (req: any, res) => {
    try {
      const partnerships = await storage.getAdminPartnerships();
      res.json(partnerships);
    } catch (error) {
      console.error("Error fetching admin partnerships:", error);
      res.status(500).json({ message: "Failed to fetch partnerships" });
    }
  });

  app.get("/api/admin/partnerships/:id", isAdmin, async (req: any, res) => {
    try {
      const partnership = await storage.getAdminPartnership(parseInt(req.params.id));
      if (!partnership) return res.status(404).json({ message: "Partnership not found" });
      res.json(partnership);
    } catch (error) {
      console.error("Error fetching admin partnership:", error);
      res.status(500).json({ message: "Failed to fetch partnership" });
    }
  });

  app.post("/api/admin/partnerships", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminPartnershipSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const partnership = await storage.createAdminPartnership(parsed.data);
      res.status(201).json(partnership);
    } catch (error) {
      console.error("Error creating admin partnership:", error);
      res.status(500).json({ message: "Failed to create partnership" });
    }
  });

  app.patch("/api/admin/partnerships/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminPartnershipSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const partnership = await storage.updateAdminPartnership(parseInt(req.params.id), parsed.data);
      if (!partnership) return res.status(404).json({ message: "Partnership not found" });
      res.json(partnership);
    } catch (error) {
      console.error("Error updating admin partnership:", error);
      res.status(500).json({ message: "Failed to update partnership" });
    }
  });

  app.delete("/api/admin/partnerships/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminPartnership(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin partnership:", error);
      res.status(500).json({ message: "Failed to delete partnership" });
    }
  });

  // Admin Posts (Blog)
  app.get("/api/admin/posts", isAdmin, async (req: any, res) => {
    try {
      const posts = await storage.getAdminPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/admin/posts/:id", isAdmin, async (req: any, res) => {
    try {
      const post = await storage.getAdminPost(parseInt(req.params.id));
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (error) {
      console.error("Error fetching admin post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/admin/posts", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const post = await storage.createAdminPost(parsed.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating admin post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.patch("/api/admin/posts/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminPostSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const post = await storage.updateAdminPost(parseInt(req.params.id), parsed.data);
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (error) {
      console.error("Error updating admin post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/admin/posts/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminPost(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Admin Financial Records
  app.get("/api/admin/financial", isAdmin, async (req: any, res) => {
    try {
      const records = await storage.getAdminFinancialRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching admin financial records:", error);
      res.status(500).json({ message: "Failed to fetch financial records" });
    }
  });

  app.get("/api/admin/financial/:id", isAdmin, async (req: any, res) => {
    try {
      const record = await storage.getAdminFinancialRecord(parseInt(req.params.id));
      if (!record) return res.status(404).json({ message: "Record not found" });
      res.json(record);
    } catch (error) {
      console.error("Error fetching admin financial record:", error);
      res.status(500).json({ message: "Failed to fetch financial record" });
    }
  });

  app.post("/api/admin/financial", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminFinancialRecordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const record = await storage.createAdminFinancialRecord(parsed.data);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating admin financial record:", error);
      res.status(500).json({ message: "Failed to create financial record" });
    }
  });

  app.patch("/api/admin/financial/:id", isAdmin, async (req: any, res) => {
    try {
      const parsed = insertAdminFinancialRecordSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const record = await storage.updateAdminFinancialRecord(parseInt(req.params.id), parsed.data);
      if (!record) return res.status(404).json({ message: "Record not found" });
      res.json(record);
    } catch (error) {
      console.error("Error updating admin financial record:", error);
      res.status(500).json({ message: "Failed to update financial record" });
    }
  });

  app.delete("/api/admin/financial/:id", isAdmin, async (req: any, res) => {
    try {
      await storage.deleteAdminFinancialRecord(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting admin financial record:", error);
      res.status(500).json({ message: "Failed to delete financial record" });
    }
  });

  // Admin Users (list all users for subscription management)
  app.get("/api/admin/users", isAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getClients();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users for admin:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // ============================================
  // CLIENT ADMIN - Company Team Management APIs
  // ============================================

  // Company Team Members
  app.get("/api/company-team", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) return res.status(400).json({ message: "Company not found" });
      const members = await storage.getCompanyTeamMembers(companyId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/company-team/:id", isAuthenticated, async (req: any, res) => {
    try {
      const member = await storage.getCompanyTeamMember(parseInt(req.params.id));
      if (!member) return res.status(404).json({ message: "Member not found" });
      res.json(member);
    } catch (error) {
      console.error("Error fetching team member:", error);
      res.status(500).json({ message: "Failed to fetch team member" });
    }
  });

  app.post("/api/company-team", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) return res.status(400).json({ message: "Company not found" });
      
      // Check if company enforces email domain
      const company = await storage.getCompany(companyId);
      if (company?.enforceEmailDomain && company.allowedEmailDomain && req.body.email) {
        const emailDomain = req.body.email.split('@')[1]?.toLowerCase();
        if (emailDomain !== company.allowedEmailDomain.toLowerCase()) {
          return res.status(400).json({ 
            message: `Email deve usar o dominio @${company.allowedEmailDomain}` 
          });
        }
      }
      
      // If userId is provided, validate it belongs to the same company
      if (req.body.userId) {
        const targetUser = await storage.getUser(req.body.userId);
        if (!targetUser) {
          return res.status(400).json({ message: "User not found" });
        }
        if (targetUser.companyId !== companyId) {
          return res.status(403).json({ message: "Cannot add user from another company" });
        }
      }
      
      const parsed = insertCompanyTeamMemberSchema.safeParse({
        ...req.body,
        companyId,
        invitedBy: req.user?.id,
        invitedAt: new Date(),
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const member = await storage.createCompanyTeamMember(parsed.data);
      
      await logAudit(req, "create", "team_member", member.id, `Membro adicionado: ${member.name}`);
      
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.patch("/api/company-team/:id", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) return res.status(400).json({ message: "Company not found" });
      
      // If userId is being updated, validate it belongs to the same company
      if (req.body.userId) {
        const targetUser = await storage.getUser(req.body.userId);
        if (!targetUser) {
          return res.status(400).json({ message: "User not found" });
        }
        if (targetUser.companyId !== companyId) {
          return res.status(403).json({ message: "Cannot link user from another company" });
        }
      }
      
      const parsed = insertCompanyTeamMemberSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      
      // Strip companyId from payload to prevent cross-tenant reassignment
      const { companyId: _, ...updateData } = parsed.data;
      const member = await storage.updateCompanyTeamMember(parseInt(req.params.id), companyId, updateData);
      if (!member) return res.status(404).json({ message: "Member not found" });
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  app.delete("/api/company-team/:id", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) return res.status(400).json({ message: "Company not found" });
      
      await storage.deleteCompanyTeamMember(parseInt(req.params.id), companyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });

  // Audit Logs
  app.get("/api/audit-logs", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      const perfilConta = req.user?.perfilConta;
      const role = req.user?.role;
      
      if (!companyId) return res.status(400).json({ message: "Company not found" });
      const isAuthorized = perfilConta === "admin" || perfilConta === "gestor" || 
                           role === "administrador" || role === "admin" || role === "admin_mcg";
      if (!isAuthorized) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const { userId, action, limit, offset } = req.query;
      const logs = await storage.getAuditLogs(companyId, {
        userId: userId as string | undefined,
        action: action as string | undefined,
        limit: limit ? parseInt(limit as string) : 100,
        offset: offset ? parseInt(offset as string) : 0,
      });
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/audit-logs/user/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      const perfilConta = req.user?.perfilConta;
      const role = req.user?.role;
      
      if (!companyId) return res.status(400).json({ message: "Company not found" });
      const isAuthorized = perfilConta === "admin" || perfilConta === "gestor" || 
                           role === "administrador" || role === "admin" || role === "admin_mcg";
      if (!isAuthorized) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const logs = await storage.getAuditLogsByUser(companyId, req.params.userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching user audit logs:", error);
      res.status(500).json({ message: "Failed to fetch user audit logs" });
    }
  });

  // Support Tickets
  app.get("/api/support-tickets", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      
      // Admin can see all tickets, regular users only see their company's tickets
      const tickets = await storage.getSupportTickets(isAdmin ? undefined : companyId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get("/api/support-tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const ticket = await storage.getSupportTicket(parseInt(req.params.id));
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching support ticket:", error);
      res.status(500).json({ message: "Failed to fetch support ticket" });
    }
  });

  app.post("/api/support-tickets", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) return res.status(400).json({ message: "Company not found" });
      
      // Generate ticket number
      const ticketNumber = `MCG-${Date.now().toString(36).toUpperCase()}`;
      
      const parsed = insertSupportTicketSchema.safeParse({
        ...req.body,
        companyId,
        userId: req.user?.id,
        ticketNumber,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const ticket = await storage.createSupportTicket(parsed.data);
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ message: "Failed to create support ticket" });
    }
  });

  app.patch("/api/support-tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      
      // Regular users can only update their company's tickets
      if (!companyId && !isAdmin) return res.status(400).json({ message: "Company not found" });
      
      const parsed = insertSupportTicketSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      
      // Strip companyId from payload to prevent cross-tenant reassignment
      const { companyId: payloadCompanyId, ...safeData } = parsed.data;
      
      // Add resolution timestamps if status changes
      const updates: any = { ...safeData };
      if (safeData.status === 'resolved' && !updates.resolvedAt) {
        updates.resolvedAt = new Date();
      }
      if (safeData.status === 'closed' && !updates.closedAt) {
        updates.closedAt = new Date();
      }
      
      // Admin can update any ticket, regular users only their company's
      let ticket;
      if (isAdmin) {
        // Get ticket first to find its companyId for update
        const existingTicket = await storage.getSupportTicket(parseInt(req.params.id));
        if (!existingTicket) return res.status(404).json({ message: "Ticket not found" });
        ticket = await storage.updateSupportTicket(parseInt(req.params.id), existingTicket.companyId, updates);
      } else {
        ticket = await storage.updateSupportTicket(parseInt(req.params.id), companyId, updates);
      }
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      res.json(ticket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  app.delete("/api/support-tickets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      
      // Regular users can only delete their company's tickets
      if (!companyId && !isAdmin) return res.status(400).json({ message: "Company not found" });
      
      if (isAdmin) {
        // Admin can delete any ticket - first get it to find companyId
        const ticket = await storage.getSupportTicket(parseInt(req.params.id));
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });
        await storage.deleteSupportTicket(parseInt(req.params.id), ticket.companyId);
      } else {
        await storage.deleteSupportTicket(parseInt(req.params.id), companyId);
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting support ticket:", error);
      res.status(500).json({ message: "Failed to delete support ticket" });
    }
  });

  // Support Ticket Messages
  app.get("/api/support-tickets/:ticketId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      
      // Verify the ticket belongs to the user's company (or user is admin)
      const ticket = await storage.getSupportTicket(parseInt(req.params.ticketId));
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      
      if (!isAdmin && ticket.companyId !== companyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getSupportTicketMessages(parseInt(req.params.ticketId));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching ticket messages:", error);
      res.status(500).json({ message: "Failed to fetch ticket messages" });
    }
  });

  app.post("/api/support-tickets/:ticketId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      const isAdmin = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      
      // Verify the ticket belongs to the user's company (or user is admin)
      const ticket = await storage.getSupportTicket(parseInt(req.params.ticketId));
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      
      if (!isAdmin && ticket.companyId !== companyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const parsed = insertSupportTicketMessageSchema.safeParse({
        ...req.body,
        ticketId: parseInt(req.params.ticketId),
        userId: req.user?.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const message = await storage.createSupportTicketMessage(parsed.data);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating ticket message:", error);
      res.status(500).json({ message: "Failed to create ticket message" });
    }
  });

  // ============================================
  // DIGITAL CONTRACTS - Assinatura Digital APIs
  // ============================================

  // Contract Templates (Admin MCG only)
  app.get("/api/contract-templates", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const templates = await storage.getContractTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching contract templates:", error);
      res.status(500).json({ message: "Falha ao buscar modelos de contrato" });
    }
  });

  app.get("/api/contract-templates/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const template = await storage.getContractTemplate(parseInt(req.params.id));
      if (!template) {
        return res.status(404).json({ message: "Modelo não encontrado" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching contract template:", error);
      res.status(500).json({ message: "Falha ao buscar modelo de contrato" });
    }
  });

  app.post("/api/contract-templates", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = insertContractTemplateSchema.safeParse({
        ...req.body,
        createdBy: req.user?.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const template = await storage.createContractTemplate(parsed.data);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating contract template:", error);
      res.status(500).json({ message: "Falha ao criar modelo de contrato" });
    }
  });

  app.patch("/api/contract-templates/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const template = await storage.updateContractTemplate(parseInt(req.params.id), req.body);
      if (!template) {
        return res.status(404).json({ message: "Modelo não encontrado" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating contract template:", error);
      res.status(500).json({ message: "Falha ao atualizar modelo de contrato" });
    }
  });

  app.delete("/api/contract-templates/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.deleteContractTemplate(parseInt(req.params.id));
      res.json({ message: "Modelo excluído com sucesso" });
    } catch (error) {
      console.error("Error deleting contract template:", error);
      res.status(500).json({ message: "Falha ao excluir modelo de contrato" });
    }
  });

  // Contract Agreements - Admin MCG can see all, clients see their own
  app.get("/api/contract-agreements", isAuthenticated, async (req: any, res) => {
    try {
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      const companyId = isAdminUser ? undefined : req.user?.companyId;
      const agreements = await storage.getContractAgreements(companyId);
      res.json(agreements);
    } catch (error) {
      console.error("Error fetching contract agreements:", error);
      res.status(500).json({ message: "Falha ao buscar contratos" });
    }
  });

  app.get("/api/contract-agreements/:id", isAuthenticated, async (req: any, res) => {
    try {
      const agreement = await storage.getContractAgreement(parseInt(req.params.id));
      if (!agreement) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }
      
      // Check access
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      if (!isAdminUser && agreement.companyId !== req.user?.companyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      res.json(agreement);
    } catch (error) {
      console.error("Error fetching contract agreement:", error);
      res.status(500).json({ message: "Falha ao buscar contrato" });
    }
  });

  // Admin MCG creates agreements for companies
  app.post("/api/contract-agreements", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = insertContractAgreementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const agreement = await storage.createContractAgreement({
        ...parsed.data,
        status: "pending",
        issuedAt: new Date(),
      });
      res.status(201).json(agreement);
    } catch (error) {
      console.error("Error creating contract agreement:", error);
      res.status(500).json({ message: "Falha ao criar contrato" });
    }
  });

  app.patch("/api/contract-agreements/:id", isAuthenticated, async (req: any, res) => {
    try {
      const agreement = await storage.getContractAgreement(parseInt(req.params.id));
      if (!agreement) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }
      
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      if (!isAdminUser && agreement.companyId !== req.user?.companyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const updated = await storage.updateContractAgreement(parseInt(req.params.id), req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating contract agreement:", error);
      res.status(500).json({ message: "Falha ao atualizar contrato" });
    }
  });

  // Mark agreement as viewed (client action)
  app.post("/api/contract-agreements/:id/view", isAuthenticated, async (req: any, res) => {
    try {
      const agreement = await storage.getContractAgreement(parseInt(req.params.id));
      if (!agreement) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }
      
      if (agreement.companyId !== req.user?.companyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const updated = await storage.updateContractAgreement(parseInt(req.params.id), {
        status: "viewed",
        viewedAt: new Date(),
      });
      res.json(updated);
    } catch (error) {
      console.error("Error marking agreement as viewed:", error);
      res.status(500).json({ message: "Falha ao registrar visualização" });
    }
  });

  // Contract Signatures
  app.get("/api/contract-agreements/:agreementId/signatures", isAuthenticated, async (req: any, res) => {
    try {
      const agreement = await storage.getContractAgreement(parseInt(req.params.agreementId));
      if (!agreement) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }
      
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      if (!isAdminUser && agreement.companyId !== req.user?.companyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const signatures = await storage.getContractSignatures(parseInt(req.params.agreementId));
      res.json(signatures);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      res.status(500).json({ message: "Falha ao buscar assinaturas" });
    }
  });

  // Create signature record (used when client signs)
  app.post("/api/contract-agreements/:agreementId/sign", isAuthenticated, async (req: any, res) => {
    try {
      const agreement = await storage.getContractAgreement(parseInt(req.params.agreementId));
      if (!agreement) {
        return res.status(404).json({ message: "Contrato não encontrado" });
      }
      
      // Verify access
      const isAdminUser = req.user?.role === 'admin' || req.user?.role === 'admin_mcg';
      const signerRole = isAdminUser ? 'mcg' : 'cliente';
      
      if (!isAdminUser && agreement.companyId !== req.user?.companyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      // Create signature record
      const signatureData = {
        agreementId: parseInt(req.params.agreementId),
        signerRole,
        signerUserId: req.user?.id,
        signerName: req.body.signerName || req.user?.firstName + ' ' + req.user?.lastName,
        signerEmail: req.body.signerEmail || req.user?.email,
        signerCpf: req.body.signerCpf,
        signatureType: req.body.signatureType || 'eletronica',
        signedAt: new Date(),
        ipAddress: req.ip,
        status: 'signed',
      };
      
      const parsed = insertContractSignatureSchema.safeParse(signatureData);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      
      const signature = await storage.createContractSignature(parsed.data);
      
      // Check if all required signatures are complete
      const allSignatures = await storage.getContractSignatures(parseInt(req.params.agreementId));
      const hasMcgSignature = allSignatures.some(s => s.signerRole === 'mcg' && s.status === 'signed');
      const hasClientSignature = allSignatures.some(s => s.signerRole === 'cliente' && s.status === 'signed');
      
      if (hasMcgSignature && hasClientSignature) {
        await storage.updateContractAgreement(parseInt(req.params.agreementId), {
          status: 'signed',
          signedAt: new Date(),
        });
      }
      
      res.status(201).json(signature);
    } catch (error) {
      console.error("Error creating signature:", error);
      res.status(500).json({ message: "Falha ao registrar assinatura" });
    }
  });

  // Get company's contracts for Client Admin
  app.get("/api/my-contracts", isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Empresa não encontrada" });
      }
      const agreements = await storage.getContractAgreementsByCompany(companyId);
      res.json(agreements);
    } catch (error) {
      console.error("Error fetching my contracts:", error);
      res.status(500).json({ message: "Falha ao buscar meus contratos" });
    }
  });

  // ============================================
  // Diagnostic Leads Routes (Admin MCG)
  // ============================================

  // Create diagnostic lead (public - from diagnostic form)
  app.post("/api/diagnostic-leads", async (req, res) => {
    try {
      const parsed = insertDiagnosticLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: parsed.error.errors });
      }
      const lead = await storage.createDiagnosticLead(parsed.data);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating diagnostic lead:", error);
      res.status(500).json({ message: "Falha ao salvar lead" });
    }
  });

  // Get all diagnostic leads (admin only)
  app.get("/api/diagnostic-leads", isAdmin, async (req, res) => {
    try {
      const leads = await storage.getDiagnosticLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching diagnostic leads:", error);
      res.status(500).json({ message: "Falha ao buscar leads" });
    }
  });

  // Get single diagnostic lead (admin only)
  app.get("/api/diagnostic-leads/:id", isAdmin, async (req, res) => {
    try {
      const lead = await storage.getDiagnosticLead(parseInt(req.params.id));
      if (!lead) {
        return res.status(404).json({ message: "Lead não encontrado" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching diagnostic lead:", error);
      res.status(500).json({ message: "Falha ao buscar lead" });
    }
  });

  // Update diagnostic lead (admin only)
  app.patch("/api/diagnostic-leads/:id", isAdmin, async (req, res) => {
    try {
      const updated = await storage.updateDiagnosticLead(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Lead não encontrado" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating diagnostic lead:", error);
      res.status(500).json({ message: "Falha ao atualizar lead" });
    }
  });

  // Delete diagnostic lead (admin only)
  app.delete("/api/diagnostic-leads/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteDiagnosticLead(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting diagnostic lead:", error);
      res.status(500).json({ message: "Falha ao excluir lead" });
    }
  });

  // ==========================================
  // FINANCIAL MODULE ROUTES
  // ==========================================

  // DRE Accounts routes
  app.get("/api/dre-accounts", isAdmin, async (req, res) => {
    try {
      const accounts = await storage.getDreAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching DRE accounts:", error);
      res.status(500).json({ message: "Falha ao buscar contas DRE" });
    }
  });

  app.post("/api/dre-accounts", isAdmin, async (req, res) => {
    try {
      const parsed = insertDreAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const account = await storage.createDreAccount(parsed.data);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating DRE account:", error);
      res.status(500).json({ message: "Falha ao criar conta DRE" });
    }
  });

  app.post("/api/dre-accounts/seed", isAdmin, async (req, res) => {
    try {
      await storage.seedDefaultDreAccounts();
      res.json({ success: true });
    } catch (error) {
      console.error("Error seeding DRE accounts:", error);
      res.status(500).json({ message: "Falha ao criar plano de contas" });
    }
  });

  app.patch("/api/dre-accounts/:id", isAdmin, async (req, res) => {
    try {
      const parsed = insertDreAccountSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const updated = await storage.updateDreAccount(parseInt(req.params.id), parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Conta não encontrada" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating DRE account:", error);
      res.status(500).json({ message: "Falha ao atualizar conta DRE" });
    }
  });

  app.delete("/api/dre-accounts/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteDreAccount(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting DRE account:", error);
      res.status(500).json({ message: "Falha ao excluir conta DRE" });
    }
  });

  // Cost Centers routes
  app.get("/api/cost-centers", isAdmin, async (req, res) => {
    try {
      const centers = await storage.getCostCenters();
      res.json(centers);
    } catch (error) {
      console.error("Error fetching cost centers:", error);
      res.status(500).json({ message: "Falha ao buscar centros de custo" });
    }
  });

  app.post("/api/cost-centers", isAdmin, async (req, res) => {
    try {
      const parsed = insertCostCenterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const center = await storage.createCostCenter(parsed.data);
      res.status(201).json(center);
    } catch (error) {
      console.error("Error creating cost center:", error);
      res.status(500).json({ message: "Falha ao criar centro de custo" });
    }
  });

  app.post("/api/cost-centers/seed", isAdmin, async (req, res) => {
    try {
      await storage.seedDefaultCostCenters();
      res.json({ success: true });
    } catch (error) {
      console.error("Error seeding cost centers:", error);
      res.status(500).json({ message: "Falha ao criar estrutura de centros de custo" });
    }
  });

  app.patch("/api/cost-centers/:id", isAdmin, async (req, res) => {
    try {
      const parsed = insertCostCenterSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const updated = await storage.updateCostCenter(parseInt(req.params.id), parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Centro de custo não encontrado" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating cost center:", error);
      res.status(500).json({ message: "Falha ao atualizar centro de custo" });
    }
  });

  app.delete("/api/cost-centers/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteCostCenter(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting cost center:", error);
      res.status(500).json({ message: "Falha ao excluir centro de custo" });
    }
  });

  // Bank Accounts routes
  app.get("/api/bank-accounts", isAdmin, async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ message: "Falha ao buscar contas bancarias" });
    }
  });

  app.post("/api/bank-accounts", isAdmin, async (req, res) => {
    try {
      const parsed = insertBankAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const account = await storage.createBankAccount(parsed.data);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating bank account:", error);
      res.status(500).json({ message: "Falha ao criar conta bancaria" });
    }
  });

  app.patch("/api/bank-accounts/:id", isAdmin, async (req, res) => {
    try {
      const parsed = insertBankAccountSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const updated = await storage.updateBankAccount(parseInt(req.params.id), parsed.data);
      if (!updated) {
        return res.status(404).json({ message: "Conta bancaria não encontrada" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating bank account:", error);
      res.status(500).json({ message: "Falha ao atualizar conta bancaria" });
    }
  });

  app.delete("/api/bank-accounts/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteBankAccount(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bank account:", error);
      res.status(500).json({ message: "Falha ao excluir conta bancária" });
    }
  });

  // Digital Certificates routes
  app.get("/api/digital-certificates", isAdmin, async (req, res) => {
    try {
      const certificates = await storage.getDigitalCertificates();
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching digital certificates:", error);
      res.status(500).json({ message: "Falha ao buscar certificados" });
    }
  });

  app.post("/api/digital-certificates", isAdmin, async (req, res) => {
    try {
      // For now, handle JSON data (file upload would require multer)
      const data = {
        name: req.body.name || "Certificado",
        type: req.body.type || "A1",
        cnpj: req.body.cnpj || null,
        certificateData: req.body.certificateData || null,
        validFrom: req.body.validFrom ? new Date(req.body.validFrom) : null,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        issuer: req.body.issuer || null,
        isActive: true,
      };
      const certificate = await storage.createDigitalCertificate(data);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error creating digital certificate:", error);
      res.status(500).json({ message: "Falha ao criar certificado" });
    }
  });

  app.delete("/api/digital-certificates/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteDigitalCertificate(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting digital certificate:", error);
      res.status(500).json({ message: "Falha ao excluir certificado" });
    }
  });

  // ============ Accounting Entries (Lançamentos Contábeis) ============
  app.get("/api/accounting-entries", isAdmin, async (req, res) => {
    try {
      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        dreAccountId: req.query.dreAccountId ? parseInt(req.query.dreAccountId as string) : undefined,
        costCenterId: req.query.costCenterId ? parseInt(req.query.costCenterId as string) : undefined,
      };
      const entries = await storage.getAccountingEntries(filters);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching accounting entries:", error);
      res.status(500).json({ message: "Falha ao buscar lancamentos" });
    }
  });

  app.get("/api/accounting-entries/:id", isAdmin, async (req, res) => {
    try {
      const entry = await storage.getAccountingEntry(parseInt(req.params.id));
      if (!entry) {
        return res.status(404).json({ message: "Lancamento nao encontrado" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching accounting entry:", error);
      res.status(500).json({ message: "Falha ao buscar lancamento" });
    }
  });

  app.post("/api/accounting-entries", isAdmin, async (req, res) => {
    try {
      const parsed = insertAccountingEntrySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const entry = await storage.createAccountingEntry(parsed.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating accounting entry:", error);
      res.status(500).json({ message: "Falha ao criar lancamento" });
    }
  });

  app.patch("/api/accounting-entries/:id", isAdmin, async (req, res) => {
    try {
      const parsed = insertAccountingEntrySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const entry = await storage.updateAccountingEntry(parseInt(req.params.id), parsed.data);
      if (!entry) {
        return res.status(404).json({ message: "Lancamento nao encontrado" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error updating accounting entry:", error);
      res.status(500).json({ message: "Falha ao atualizar lancamento" });
    }
  });

  app.delete("/api/accounting-entries/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteAccountingEntry(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting accounting entry:", error);
      res.status(500).json({ message: "Falha ao excluir lancamento" });
    }
  });

  // DRE Report endpoint - consolidated monthly report
  app.get("/api/dre-report", isAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const entries = await storage.getAccountingEntries({
        startDate: startDate as string,
        endDate: endDate as string,
      });
      const accounts = await storage.getDreAccounts();
      
      // Group entries by DRE account and calculate totals
      const accountTotals: Record<number, { credito: number; debito: number }> = {};
      
      entries.forEach(entry => {
        if (!accountTotals[entry.dreAccountId]) {
          accountTotals[entry.dreAccountId] = { credito: 0, debito: 0 };
        }
        const value = parseFloat(entry.value || "0");
        if (entry.entryType === "credito") {
          accountTotals[entry.dreAccountId].credito += value;
        } else {
          accountTotals[entry.dreAccountId].debito += value;
        }
      });
      
      // Build report with account names
      const report = accounts.map(account => ({
        ...account,
        credito: accountTotals[account.id]?.credito || 0,
        debito: accountTotals[account.id]?.debito || 0,
        saldo: (accountTotals[account.id]?.credito || 0) - (accountTotals[account.id]?.debito || 0),
      }));
      
      res.json(report);
    } catch (error) {
      console.error("Error generating DRE report:", error);
      res.status(500).json({ message: "Falha ao gerar relatorio DRE" });
    }
  });

  // ============ Bank Integrations ============
  app.get("/api/bank-integrations", isAdmin, async (req, res) => {
    try {
      const integrations = await storage.getBankIntegrations();
      res.json(integrations);
    } catch (error) {
      console.error("Error fetching bank integrations:", error);
      res.status(500).json({ message: "Falha ao buscar integracoes bancarias" });
    }
  });

  app.get("/api/bank-integrations/:id", isAdmin, async (req, res) => {
    try {
      const integration = await storage.getBankIntegration(parseInt(req.params.id));
      if (!integration) {
        return res.status(404).json({ message: "Integracao nao encontrada" });
      }
      res.json(integration);
    } catch (error) {
      console.error("Error fetching bank integration:", error);
      res.status(500).json({ message: "Falha ao buscar integracao" });
    }
  });

  app.post("/api/bank-integrations", isAdmin, async (req, res) => {
    try {
      const parsed = insertBankIntegrationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const integration = await storage.createBankIntegration(parsed.data);
      res.status(201).json(integration);
    } catch (error) {
      console.error("Error creating bank integration:", error);
      res.status(500).json({ message: "Falha ao criar integracao" });
    }
  });

  app.patch("/api/bank-integrations/:id", isAdmin, async (req, res) => {
    try {
      const parsed = insertBankIntegrationSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Dados invalidos", errors: parsed.error.errors });
      }
      const integration = await storage.updateBankIntegration(parseInt(req.params.id), parsed.data);
      if (!integration) {
        return res.status(404).json({ message: "Integracao nao encontrada" });
      }
      res.json(integration);
    } catch (error) {
      console.error("Error updating bank integration:", error);
      res.status(500).json({ message: "Falha ao atualizar integracao" });
    }
  });

  app.delete("/api/bank-integrations/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteBankIntegration(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bank integration:", error);
      res.status(500).json({ message: "Falha ao excluir integracao" });
    }
  });

  // ============ NFS-e (Nota Fiscal de Servicos Eletronica) ============
  const { nfseService } = await import("./nfseService");

  // Get NFS-e service status
  app.get("/api/nfse/status", isAdmin, async (req, res) => {
    try {
      const status = await nfseService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting NFS-e status:", error);
      res.status(500).json({ message: "Falha ao verificar status NFS-e" });
    }
  });

  // Get available service codes
  app.get("/api/nfse/codigos-servico", isAdmin, async (req, res) => {
    try {
      const codigos = nfseService.getCodigosServico();
      res.json(codigos);
    } catch (error) {
      console.error("Error getting service codes:", error);
      res.status(500).json({ message: "Falha ao buscar codigos de servico" });
    }
  });

  // Emit NFS-e
  app.post("/api/nfse/emitir", isAdmin, async (req, res) => {
    try {
      const result = await nfseService.emitirNfse(req.body);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error emitting NFS-e:", error);
      res.status(500).json({ message: "Falha ao emitir NFS-e" });
    }
  });

  // Query NFS-e by RPS
  app.get("/api/nfse/consultar/:numero/:serie/:tipo", isAdmin, async (req, res) => {
    try {
      const { numero, serie, tipo } = req.params;
      const result = await nfseService.consultarPorRps(
        parseInt(numero),
        serie,
        parseInt(tipo)
      );
      res.json(result);
    } catch (error) {
      console.error("Error querying NFS-e:", error);
      res.status(500).json({ message: "Falha ao consultar NFS-e" });
    }
  });

  // Cancel NFS-e
  app.post("/api/nfse/cancelar", isAdmin, async (req, res) => {
    try {
      const { numeroNfse, codigoVerificacao, motivoCancelamento } = req.body;
      if (!numeroNfse || !codigoVerificacao || !motivoCancelamento) {
        return res.status(400).json({ message: "Dados obrigatorios: numeroNfse, codigoVerificacao, motivoCancelamento" });
      }
      const result = await nfseService.cancelarNfse(
        numeroNfse,
        codigoVerificacao,
        motivoCancelamento
      );
      res.json(result);
    } catch (error) {
      console.error("Error cancelling NFS-e:", error);
      res.status(500).json({ message: "Falha ao cancelar NFS-e" });
    }
  });

  // ============ C6 Bank Integration ============
  // Import c6BankService
  const { c6BankService } = await import("./c6BankService");

  // Get C6 Bank integration status
  app.get("/api/c6bank/status", isAdmin, async (req, res) => {
    try {
      const status = c6BankService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting C6 Bank status:", error);
      res.status(500).json({ message: "Falha ao verificar status C6 Bank" });
    }
  });

  // Sync transactions from C6 Bank
  app.post("/api/c6bank/sync/:bankAccountId", isAdmin, async (req, res) => {
    try {
      const bankAccountId = parseInt(req.params.bankAccountId);
      if (isNaN(bankAccountId)) {
        return res.status(400).json({ message: "ID da conta bancaria invalido" });
      }

      const { externalAccountId, startDate, endDate } = req.body;
      if (!externalAccountId) {
        return res.status(400).json({ message: "externalAccountId e obrigatorio" });
      }

      if (!c6BankService.isConfigured()) {
        return res.status(400).json({ 
          message: "C6 Bank nao configurado. Configure as credenciais em Secrets." 
        });
      }

      // Verify the bank account exists and belongs to the authenticated user's company
      const bankAccountsList = await storage.getBankAccounts();
      const account = bankAccountsList.find(a => a.id === bankAccountId);
      if (!account) {
        return res.status(404).json({ message: "Conta bancaria nao encontrada" });
      }

      // Tenant isolation: verify account belongs to user's company
      const user = req.user as Express.User;
      if (user.companyId && account.companyId && account.companyId !== user.companyId) {
        console.warn(`[C6 Bank] User ${user.id} attempted to sync account ${bankAccountId} belonging to company ${account.companyId}`);
        return res.status(403).json({ message: "Acesso negado - conta pertence a outra empresa" });
      }

      // Validate that the external account is linked to this bank account
      const isLinked = await c6BankService.validateAccountLink(bankAccountId, externalAccountId, storage);
      if (!isLinked) {
        return res.status(400).json({ 
          message: "ID da conta externa nao corresponde a conta bancaria. Configure o campo 'ID Externo' na conta bancaria com o ID fornecido pelo C6 Bank." 
        });
      }

      // Sync and save transactions using the service
      const result = await c6BankService.syncAndSaveTransactions(
        bankAccountId,
        externalAccountId,
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate || new Date().toISOString().split("T")[0]
      );

      res.json({ 
        success: true, 
        saved: result.saved,
        skipped: result.skipped,
        errors: result.errors,
        message: `${result.saved} transacoes sincronizadas${result.skipped > 0 ? `, ${result.skipped} duplicadas ignoradas` : ""}${result.errors > 0 ? `, ${result.errors} erros` : ""}`
      });
    } catch (error) {
      console.error("Error syncing C6 Bank transactions:", error);
      res.status(500).json({ message: "Falha ao sincronizar transacoes" });
    }
  });

  // Get balance from C6 Bank
  app.get("/api/c6bank/balance/:accountId", isAdmin, async (req, res) => {
    try {
      const { accountId } = req.params;

      if (!c6BankService.isConfigured()) {
        return res.status(400).json({ 
          message: "C6 Bank nao configurado. Configure as credenciais em Secrets." 
        });
      }

      const balance = await c6BankService.getBalance(accountId);
      if (!balance) {
        return res.status(500).json({ message: "Falha ao obter saldo" });
      }

      res.json(balance);
    } catch (error) {
      console.error("Error getting C6 Bank balance:", error);
      res.status(500).json({ message: "Falha ao obter saldo" });
    }
  });

  // C6 Bank webhook endpoint (public - no auth required)
  // The rawBody is captured by express.json verify callback in index.ts
  app.post("/api/webhooks/c6bank", async (req, res) => {
    try {
      const signature = req.headers["x-c6-signature"] as string;
      
      // Use raw body captured by express.json middleware verify callback
      // This is set in server/index.ts via express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } })
      const rawBody = (req as any).rawBody as Buffer | undefined;
      
      // When C6 Bank is configured, signature verification is MANDATORY
      if (c6BankService.isConfigured()) {
        // Reject requests without signature header
        if (!signature || signature.trim() === "") {
          console.warn("[C6 Bank] Missing signature header - rejecting webhook");
          return res.status(401).json({ message: "Missing signature" });
        }
        
        // Reject if no raw body available
        if (!rawBody) {
          console.warn("[C6 Bank] No raw body available for signature verification");
          return res.status(401).json({ message: "Invalid request - no body" });
        }
        
        // Verify signature
        const isValid = c6BankService.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
          console.warn("[C6 Bank] Invalid webhook signature");
          return res.status(401).json({ message: "Invalid signature" });
        }
      } else {
        // C6 Bank not configured - reject all webhooks
        console.warn("[C6 Bank] Received webhook but service not configured");
        return res.status(503).json({ message: "Service not configured" });
      }

      // Process the webhook event - now with bank account mapping
      const result = await c6BankService.processWebhookEvent(req.body, storage);
      res.json(result);
    } catch (error) {
      console.error("Error processing C6 Bank webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // ============ Bank Transactions ============
  app.get("/api/bank-transactions", isAdmin, async (req, res) => {
    try {
      const bankAccountId = req.query.bankAccountId ? parseInt(req.query.bankAccountId as string) : undefined;
      const transactions = await storage.getBankTransactions(bankAccountId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching bank transactions:", error);
      res.status(500).json({ message: "Falha ao buscar transacoes" });
    }
  });

  app.post("/api/bank-transactions/:id/reconcile", isAdmin, async (req, res) => {
    try {
      const { accountingEntryId } = req.body;
      if (!accountingEntryId) {
        return res.status(400).json({ message: "accountingEntryId obrigatorio" });
      }
      const transaction = await storage.reconcileBankTransaction(parseInt(req.params.id), accountingEntryId);
      if (!transaction) {
        return res.status(404).json({ message: "Transacao nao encontrada" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error reconciling bank transaction:", error);
      res.status(500).json({ message: "Falha ao conciliar transacao" });
    }
  });

  // ============ MCG Store API ============
  
  // Product Categories (Admin)
  app.get("/api/store/categories", async (req, res) => {
    try {
      const categories = await storage.getStoreProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching store categories:", error);
      res.status(500).json({ message: "Falha ao buscar categorias" });
    }
  });

  app.post("/api/admin/store/categories", isAdmin, async (req, res) => {
    try {
      const category = await storage.createStoreProductCategory(req.body);
      res.json(category);
    } catch (error) {
      console.error("Error creating store category:", error);
      res.status(500).json({ message: "Falha ao criar categoria" });
    }
  });

  app.patch("/api/admin/store/categories/:id", isAdmin, async (req, res) => {
    try {
      const category = await storage.updateStoreProductCategory(parseInt(req.params.id), req.body);
      if (!category) {
        return res.status(404).json({ message: "Categoria nao encontrada" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating store category:", error);
      res.status(500).json({ message: "Falha ao atualizar categoria" });
    }
  });

  app.delete("/api/admin/store/categories/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteStoreProductCategory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting store category:", error);
      res.status(500).json({ message: "Falha ao excluir categoria" });
    }
  });

  // Store Products (Public - only active products)
  app.get("/api/store/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const productType = req.query.productType as string | undefined;
      const products = await storage.getStoreProducts({ 
        categoryId, 
        isActive: true,
        productType 
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching store products:", error);
      res.status(500).json({ message: "Falha ao buscar produtos" });
    }
  });

  app.get("/api/store/products/:slug", async (req, res) => {
    try {
      const product = await storage.getStoreProductBySlug(req.params.slug);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: "Produto nao encontrado" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching store product:", error);
      res.status(500).json({ message: "Falha ao buscar produto" });
    }
  });

  // Store Products (Admin - all products)
  app.get("/api/admin/store/products", isAdmin, async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const productType = req.query.productType as string | undefined;
      const products = await storage.getStoreProducts({ categoryId, productType });
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin store products:", error);
      res.status(500).json({ message: "Falha ao buscar produtos" });
    }
  });

  app.post("/api/admin/store/products", isAdmin, async (req, res) => {
    try {
      const product = await storage.createStoreProduct(req.body);
      res.json(product);
    } catch (error) {
      console.error("Error creating store product:", error);
      res.status(500).json({ message: "Falha ao criar produto" });
    }
  });

  app.patch("/api/admin/store/products/:id", isAdmin, async (req, res) => {
    try {
      const product = await storage.updateStoreProduct(parseInt(req.params.id), req.body);
      if (!product) {
        return res.status(404).json({ message: "Produto nao encontrado" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating store product:", error);
      res.status(500).json({ message: "Falha ao atualizar produto" });
    }
  });

  app.delete("/api/admin/store/products/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteStoreProduct(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting store product:", error);
      res.status(500).json({ message: "Falha ao excluir produto" });
    }
  });

  // E-book Volumes (Admin)
  app.get("/api/admin/store/ebook-volumes", isAdmin, async (req, res) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      const volumes = await storage.getEbookVolumes(productId);
      res.json(volumes);
    } catch (error) {
      console.error("Error fetching ebook volumes:", error);
      res.status(500).json({ message: "Falha ao buscar volumes" });
    }
  });

  app.post("/api/admin/store/ebook-volumes", isAdmin, async (req, res) => {
    try {
      const volume = await storage.createEbookVolume(req.body);
      res.json(volume);
    } catch (error) {
      console.error("Error creating ebook volume:", error);
      res.status(500).json({ message: "Falha ao criar volume" });
    }
  });

  app.patch("/api/admin/store/ebook-volumes/:id", isAdmin, async (req, res) => {
    try {
      const volume = await storage.updateEbookVolume(parseInt(req.params.id), req.body);
      if (!volume) {
        return res.status(404).json({ message: "Volume nao encontrado" });
      }
      res.json(volume);
    } catch (error) {
      console.error("Error updating ebook volume:", error);
      res.status(500).json({ message: "Falha ao atualizar volume" });
    }
  });

  app.delete("/api/admin/store/ebook-volumes/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteEbookVolume(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ebook volume:", error);
      res.status(500).json({ message: "Falha ao excluir volume" });
    }
  });

  // Store Orders (Admin)
  app.get("/api/admin/store/orders", isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const orders = await storage.getStoreOrders({ status });
      res.json(orders);
    } catch (error) {
      console.error("Error fetching store orders:", error);
      res.status(500).json({ message: "Falha ao buscar pedidos" });
    }
  });

  app.get("/api/admin/store/orders/:id", isAdmin, async (req, res) => {
    try {
      const order = await storage.getStoreOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Pedido nao encontrado" });
      }
      const items = await storage.getStoreOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      console.error("Error fetching store order:", error);
      res.status(500).json({ message: "Falha ao buscar pedido" });
    }
  });

  app.patch("/api/admin/store/orders/:id", isAdmin, async (req, res) => {
    try {
      const order = await storage.updateStoreOrder(parseInt(req.params.id), req.body);
      if (!order) {
        return res.status(404).json({ message: "Pedido nao encontrado" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating store order:", error);
      res.status(500).json({ message: "Falha ao atualizar pedido" });
    }
  });

  // WhatsApp Support Journey API
  app.get("/api/admin/whatsapp/journey-steps", isAdmin, async (req, res) => {
    try {
      const steps = await storage.getWhatsappJourneySteps();
      res.json(steps);
    } catch (error) {
      console.error("Error fetching journey steps:", error);
      res.status(500).json({ message: "Falha ao buscar etapas" });
    }
  });

  app.post("/api/admin/whatsapp/journey-steps", isAdmin, async (req, res) => {
    try {
      const step = await storage.createWhatsappJourneyStep(req.body);
      res.json(step);
    } catch (error) {
      console.error("Error creating journey step:", error);
      res.status(500).json({ message: "Falha ao criar etapa" });
    }
  });

  app.patch("/api/admin/whatsapp/journey-steps/:id", isAdmin, async (req, res) => {
    try {
      const step = await storage.updateWhatsappJourneyStep(parseInt(req.params.id), req.body);
      if (!step) return res.status(404).json({ message: "Etapa nao encontrada" });
      res.json(step);
    } catch (error) {
      console.error("Error updating journey step:", error);
      res.status(500).json({ message: "Falha ao atualizar etapa" });
    }
  });

  app.delete("/api/admin/whatsapp/journey-steps/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteWhatsappJourneyStep(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting journey step:", error);
      res.status(500).json({ message: "Falha ao excluir etapa" });
    }
  });

  // WhatsApp Config
  app.get("/api/admin/whatsapp/config", isAdmin, async (req, res) => {
    try {
      const config = await storage.getWhatsappConfig();
      res.json(config || null);
    } catch (error) {
      console.error("Error fetching whatsapp config:", error);
      res.status(500).json({ message: "Falha ao buscar configuracao" });
    }
  });

  app.post("/api/admin/whatsapp/config", isAdmin, async (req, res) => {
    try {
      const config = await storage.createWhatsappConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Error creating whatsapp config:", error);
      res.status(500).json({ message: "Falha ao criar configuracao" });
    }
  });

  app.patch("/api/admin/whatsapp/config/:id", isAdmin, async (req, res) => {
    try {
      const config = await storage.updateWhatsappConfig(parseInt(req.params.id), req.body);
      if (!config) return res.status(404).json({ message: "Configuracao nao encontrada" });
      res.json(config);
    } catch (error) {
      console.error("Error updating whatsapp config:", error);
      res.status(500).json({ message: "Falha ao atualizar configuracao" });
    }
  });

  // WhatsApp Agents
  app.get("/api/admin/whatsapp/agents", isAdmin, async (req, res) => {
    try {
      const agents = await storage.getWhatsappAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching whatsapp agents:", error);
      res.status(500).json({ message: "Falha ao buscar agentes" });
    }
  });

  app.post("/api/admin/whatsapp/agents", isAdmin, async (req, res) => {
    try {
      const agent = await storage.createWhatsappAgent(req.body);
      res.json(agent);
    } catch (error) {
      console.error("Error creating whatsapp agent:", error);
      res.status(500).json({ message: "Falha ao criar agente" });
    }
  });

  app.patch("/api/admin/whatsapp/agents/:id", isAdmin, async (req, res) => {
    try {
      const agent = await storage.updateWhatsappAgent(parseInt(req.params.id), req.body);
      if (!agent) return res.status(404).json({ message: "Agente nao encontrado" });
      res.json(agent);
    } catch (error) {
      console.error("Error updating whatsapp agent:", error);
      res.status(500).json({ message: "Falha ao atualizar agente" });
    }
  });

  app.delete("/api/admin/whatsapp/agents/:id", isAdmin, async (req, res) => {
    try {
      await storage.deleteWhatsappAgent(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting whatsapp agent:", error);
      res.status(500).json({ message: "Falha ao excluir agente" });
    }
  });

  // WhatsApp Conversations
  app.get("/api/admin/whatsapp/conversations", isAdmin, async (req, res) => {
    try {
      const conversations = await storage.getWhatsappConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching whatsapp conversations:", error);
      res.status(500).json({ message: "Falha ao buscar conversas" });
    }
  });

  return httpServer;
}
