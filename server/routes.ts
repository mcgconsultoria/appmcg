import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { registerUser, loginUser, validateSession, logoutUser } from "./customAuth";
import {
  insertClientSchema,
  insertChecklistSchema,
  insertChecklistItemSchema,
  insertFreightCalculationSchema,
  insertStorageCalculationSchema,
  insertFinancialAccountSchema,
  insertMeetingRecordSchema,
  insertMeetingObjectiveSchema,
  insertMeetingActionItemSchema,
  insertCommercialEventSchema,
  insertProjectSchema,
  insertTaskSchema,
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(customAuthMiddleware);
  
  await setupAuth(app);

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
        sameSite: 'strict',
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
        sameSite: 'strict',
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

  app.post('/api/auth/logout', isAuthenticated, async (req: any, res) => {
    try {
      await logoutUser(req.user.id);
      res.clearCookie(SESSION_COOKIE_NAME);
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Error logging out:", error);
      res.status(500).json({ message: "Erro ao fazer logout" });
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

  // Client routes
  app.get("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertClientSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid client data", errors: parsed.error.errors });
      }
      const client = await storage.createClient(parsed.data);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.updateClient(id, req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
      // Use user's companyId or default to 1 for single-tenant MVP
      const userCompanyId = req.user.companyId || 1;
      
      // Security: Verify user has access to this company
      if (req.user.companyId && req.user.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Validate and sanitize allowed fields
      const allowedFields = ["name", "cnpj", "email", "phone", "address", "city", "state", "logo"];
      const sanitizedData: Record<string, any> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          sanitizedData[field] = req.body[field];
        }
      }
      
      // Validate logo if provided
      if (sanitizedData.logo) {
        // Check if it's a valid data URL
        if (!sanitizedData.logo.startsWith("data:image/")) {
          return res.status(400).json({ message: "Logo must be a valid image data URL" });
        }
        // Check size limit (500KB encoded ~ 700KB base64)
        const maxLogoSize = 750000; // ~500KB image becomes ~700KB base64
        if (sanitizedData.logo.length > maxLogoSize) {
          return res.status(400).json({ message: "Logo too large. Maximum size is 500KB" });
        }
      }
      
      const company = await storage.updateCompany(userCompanyId, sanitizedData);
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
      const parsed = insertChecklistSchema.safeParse(req.body);
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
        clientName: proposalData.clientName,
        clientEmail: proposalData.clientEmail,
        clientPhone: proposalData.clientPhone,
        clientCnpj: proposalData.clientCnpj,
        status: "draft",
        validUntil,
        contractType: proposalData.contractType,
        notes: proposalData.notes,
        totalValue: proposalData.totalValue,
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
      
      const routes = await storage.getProposalRoutes(id);
      
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=proposta-${proposal.proposalNumber}.pdf`
      );
      
      doc.pipe(res);
      
      doc.fontSize(20).font("Helvetica-Bold").text("PROPOSTA COMERCIAL", { align: "center" });
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
      const contractLabel = proposal.contractType === "1_year" ? "Contrato 1 ano" : proposal.contractType === "6_months" ? "Contrato 6 meses" : "Spot (Avulso)";
      doc.text(`Tipo de Contrato: ${contractLabel}`);
      doc.moveDown();
      
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
      
      doc.moveDown();
      doc.fontSize(14).font("Helvetica-Bold").text(`VALOR TOTAL DA PROPOSTA: R$ ${parseFloat(String(proposal.totalValue || 0)).toFixed(2)}`, { align: "right" });
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
      const parsed = insertMeetingRecordSchema.safeParse({
        ...req.body,
        companyId: req.user.companyId || 1,
        userId: req.user.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid meeting record data", errors: parsed.error.errors });
      }
      const record = await storage.createMeetingRecord(parsed.data);
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
      const record = await storage.updateMeetingRecord(id, req.body);
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
      if (client) doc.text(`Cliente: ${client.name}`);
      doc.moveDown();
      
      // Participants
      if (record.participants) {
        doc.fontSize(12).font("Helvetica-Bold").text("Participantes:");
        doc.fontSize(10).font("Helvetica");
        try {
          const participants = JSON.parse(record.participants);
          participants.forEach((p: { name: string; email: string }) => {
            doc.text(`  - ${p.name}${p.email ? ` (${p.email})` : ""}`);
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
            doc.text(`  - ${p.name}${p.email ? ` (${p.email})` : ""}`);
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
      const parsed = insertMeetingActionItemSchema.safeParse({
        ...req.body,
        meetingRecordId,
      });
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

  return httpServer;
}
