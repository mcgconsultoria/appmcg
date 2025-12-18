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
  registerSchema,
  loginSchema,
} from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: any;
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

  return httpServer;
}
