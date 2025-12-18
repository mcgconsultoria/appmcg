import {
  users,
  companies,
  clients,
  checklists,
  checklistItems,
  freightCalculations,
  storageCalculations,
  financialAccounts,
  marketingMaterials,
  commercialProposals,
  proposalRoutes,
  clientOperations,
  type User,
  type UpsertUser,
  type Company,
  type InsertCompany,
  type Client,
  type InsertClient,
  type Checklist,
  type InsertChecklist,
  type ChecklistItem,
  type InsertChecklistItem,
  type FreightCalculation,
  type InsertFreightCalculation,
  type StorageCalculation,
  type InsertStorageCalculation,
  type FinancialAccount,
  type InsertFinancialAccount,
  type MarketingMaterial,
  type InsertMarketingMaterial,
  type CommercialProposal,
  type InsertCommercialProposal,
  type ProposalRoute,
  type InsertProposalRoute,
  type ClientOperation,
  type InsertClientOperation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserBySessionToken(token: string): Promise<User | undefined>;
  createUserWithPassword(userData: Partial<UpsertUser>): Promise<User>;
  updateUserSessionToken(userId: string, token: string | null): Promise<void>;

  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;

  // Client operations
  getClients(companyId?: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Checklist operations
  getChecklists(companyId?: number): Promise<Checklist[]>;
  getChecklist(id: number): Promise<Checklist | undefined>;
  createChecklist(checklist: InsertChecklist): Promise<Checklist>;
  updateChecklist(id: number, checklist: Partial<InsertChecklist>): Promise<Checklist | undefined>;
  deleteChecklist(id: number): Promise<boolean>;

  // Checklist item operations
  getChecklistItems(checklistId: number): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: number, item: Partial<InsertChecklistItem>): Promise<ChecklistItem | undefined>;

  // Freight calculation operations
  getFreightCalculations(companyId?: number): Promise<FreightCalculation[]>;
  createFreightCalculation(calc: InsertFreightCalculation): Promise<FreightCalculation>;

  // Storage calculation operations
  getStorageCalculations(companyId?: number): Promise<StorageCalculation[]>;
  createStorageCalculation(calc: InsertStorageCalculation): Promise<StorageCalculation>;

  // Financial account operations
  getFinancialAccounts(companyId?: number): Promise<FinancialAccount[]>;
  getFinancialAccount(id: number): Promise<FinancialAccount | undefined>;
  createFinancialAccount(account: InsertFinancialAccount): Promise<FinancialAccount>;
  updateFinancialAccount(id: number, account: Partial<InsertFinancialAccount>): Promise<FinancialAccount | undefined>;
  deleteFinancialAccount(id: number): Promise<boolean>;

  // Marketing material operations
  getMarketingMaterials(companyId?: number): Promise<MarketingMaterial[]>;
  createMarketingMaterial(material: InsertMarketingMaterial): Promise<MarketingMaterial>;

  // Stripe operations
  getStripeProduct(productId: string): Promise<any>;
  getStripeSubscription(subscriptionId: string): Promise<any>;
  listStripeProducts(active?: boolean, limit?: number, offset?: number): Promise<any[]>;
  listStripeProductsWithPrices(active?: boolean, limit?: number, offset?: number): Promise<any[]>;
  updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionStatus?: string }): Promise<User | undefined>;

  // Commercial proposal operations
  getCommercialProposals(companyId: number): Promise<CommercialProposal[]>;
  getCommercialProposal(id: number): Promise<CommercialProposal | undefined>;
  createCommercialProposal(proposal: InsertCommercialProposal): Promise<CommercialProposal>;
  updateProposalStatus(id: number, status: string): Promise<CommercialProposal>;
  generateProposalNumber(): Promise<string>;

  // Proposal route operations
  getProposalRoutes(proposalId: number): Promise<ProposalRoute[]>;
  createProposalRoute(route: InsertProposalRoute): Promise<ProposalRoute>;

  // Client operation operations
  getClientOperations(clientId: number): Promise<ClientOperation[]>;
  createClientOperation(operation: InsertClientOperation): Promise<ClientOperation>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserBySessionToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.activeSessionToken, token));
    return user;
  }

  async createUserWithPassword(userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db.insert(users).values(userData as UpsertUser).returning();
    return user;
  }

  async updateUserSessionToken(userId: string, token: string | null): Promise<void> {
    await db
      .update(users)
      .set({ activeSessionToken: token, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updated] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updated;
  }

  // Client operations
  async getClients(companyId?: number): Promise<Client[]> {
    if (companyId) {
      return db.select().from(clients).where(eq(clients.companyId, companyId)).orderBy(desc(clients.createdAt));
    }
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  // Checklist operations
  async getChecklists(companyId?: number): Promise<Checklist[]> {
    if (companyId) {
      return db.select().from(checklists).where(eq(checklists.companyId, companyId)).orderBy(desc(checklists.createdAt));
    }
    return db.select().from(checklists).orderBy(desc(checklists.createdAt));
  }

  async getChecklist(id: number): Promise<Checklist | undefined> {
    const [checklist] = await db.select().from(checklists).where(eq(checklists.id, id));
    return checklist;
  }

  async createChecklist(checklist: InsertChecklist): Promise<Checklist> {
    const [newChecklist] = await db.insert(checklists).values(checklist).returning();
    return newChecklist;
  }

  async updateChecklist(id: number, checklist: Partial<InsertChecklist>): Promise<Checklist | undefined> {
    const [updated] = await db
      .update(checklists)
      .set({ ...checklist, updatedAt: new Date() })
      .where(eq(checklists.id, id))
      .returning();
    return updated;
  }

  async deleteChecklist(id: number): Promise<boolean> {
    await db.delete(checklistItems).where(eq(checklistItems.checklistId, id));
    await db.delete(checklists).where(eq(checklists.id, id));
    return true;
  }

  // Checklist item operations
  async getChecklistItems(checklistId: number): Promise<ChecklistItem[]> {
    return db.select().from(checklistItems).where(eq(checklistItems.checklistId, checklistId));
  }

  async createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem> {
    const [newItem] = await db.insert(checklistItems).values(item).returning();
    return newItem;
  }

  async updateChecklistItem(id: number, item: Partial<InsertChecklistItem>): Promise<ChecklistItem | undefined> {
    const [updated] = await db
      .update(checklistItems)
      .set(item)
      .where(eq(checklistItems.id, id))
      .returning();
    return updated;
  }

  // Freight calculation operations
  async getFreightCalculations(companyId?: number): Promise<FreightCalculation[]> {
    if (companyId) {
      return db.select().from(freightCalculations).where(eq(freightCalculations.companyId, companyId)).orderBy(desc(freightCalculations.createdAt));
    }
    return db.select().from(freightCalculations).orderBy(desc(freightCalculations.createdAt));
  }

  async createFreightCalculation(calc: InsertFreightCalculation): Promise<FreightCalculation> {
    const [newCalc] = await db.insert(freightCalculations).values(calc).returning();
    return newCalc;
  }

  // Storage calculation operations
  async getStorageCalculations(companyId?: number): Promise<StorageCalculation[]> {
    if (companyId) {
      return db.select().from(storageCalculations).where(eq(storageCalculations.companyId, companyId)).orderBy(desc(storageCalculations.createdAt));
    }
    return db.select().from(storageCalculations).orderBy(desc(storageCalculations.createdAt));
  }

  async createStorageCalculation(calc: InsertStorageCalculation): Promise<StorageCalculation> {
    const [newCalc] = await db.insert(storageCalculations).values(calc).returning();
    return newCalc;
  }

  // Financial account operations
  async getFinancialAccounts(companyId?: number): Promise<FinancialAccount[]> {
    if (companyId) {
      return db.select().from(financialAccounts).where(eq(financialAccounts.companyId, companyId)).orderBy(desc(financialAccounts.createdAt));
    }
    return db.select().from(financialAccounts).orderBy(desc(financialAccounts.createdAt));
  }

  async getFinancialAccount(id: number): Promise<FinancialAccount | undefined> {
    const [account] = await db.select().from(financialAccounts).where(eq(financialAccounts.id, id));
    return account;
  }

  async createFinancialAccount(account: InsertFinancialAccount): Promise<FinancialAccount> {
    const [newAccount] = await db.insert(financialAccounts).values(account).returning();
    return newAccount;
  }

  async updateFinancialAccount(id: number, account: Partial<InsertFinancialAccount>): Promise<FinancialAccount | undefined> {
    const [updated] = await db
      .update(financialAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(financialAccounts.id, id))
      .returning();
    return updated;
  }

  async deleteFinancialAccount(id: number): Promise<boolean> {
    await db.delete(financialAccounts).where(eq(financialAccounts.id, id));
    return true;
  }

  // Marketing material operations
  async getMarketingMaterials(companyId?: number): Promise<MarketingMaterial[]> {
    if (companyId) {
      return db.select().from(marketingMaterials).where(eq(marketingMaterials.companyId, companyId)).orderBy(desc(marketingMaterials.createdAt));
    }
    return db.select().from(marketingMaterials).orderBy(desc(marketingMaterials.createdAt));
  }

  async createMarketingMaterial(material: InsertMarketingMaterial): Promise<MarketingMaterial> {
    const [newMaterial] = await db.insert(marketingMaterials).values(material).returning();
    return newMaterial;
  }

  // Stripe operations
  async getStripeProduct(productId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async getStripeSubscription(subscriptionId: string): Promise<any> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  async listStripeProducts(active = true, limit = 20, offset = 0): Promise<any[]> {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active} LIMIT ${limit} OFFSET ${offset}`
    );
    return result.rows;
  }

  async listStripeProductsWithPrices(active = true, limit = 20, offset = 0): Promise<any[]> {
    const result = await db.execute(
      sql`
        WITH paginated_products AS (
          SELECT id, name, description, metadata, active
          FROM stripe.products
          WHERE active = ${active}
          ORDER BY id
          LIMIT ${limit} OFFSET ${offset}
        )
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.recurring,
          pr.active as price_active,
          pr.metadata as price_metadata
        FROM paginated_products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        ORDER BY p.id, pr.unit_amount
      `
    );
    return result.rows;
  }

  async updateUserStripeInfo(userId: string, stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionStatus?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...stripeInfo, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Commercial proposal operations
  async getCommercialProposals(companyId: number): Promise<CommercialProposal[]> {
    return db.select().from(commercialProposals).where(eq(commercialProposals.companyId, companyId)).orderBy(desc(commercialProposals.createdAt));
  }

  async getCommercialProposal(id: number): Promise<CommercialProposal | undefined> {
    const [proposal] = await db.select().from(commercialProposals).where(eq(commercialProposals.id, id));
    return proposal;
  }

  async createCommercialProposal(proposal: InsertCommercialProposal): Promise<CommercialProposal> {
    const [newProposal] = await db.insert(commercialProposals).values(proposal).returning();
    return newProposal;
  }

  async updateProposalStatus(id: number, status: string): Promise<CommercialProposal> {
    const updateData: any = { status, updatedAt: new Date() };
    if (status === "approved") {
      updateData.approvedAt = new Date();
    }
    const [updated] = await db
      .update(commercialProposals)
      .set(updateData)
      .where(eq(commercialProposals.id, id))
      .returning();
    return updated;
  }

  async generateProposalNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM commercial_proposals WHERE EXTRACT(YEAR FROM created_at) = ${year}`
    );
    const count = parseInt(String(result.rows[0]?.count || 0)) + 1;
    return `MCG-${year}-${count.toString().padStart(5, '0')}`;
  }

  // Proposal route operations
  async getProposalRoutes(proposalId: number): Promise<ProposalRoute[]> {
    return db.select().from(proposalRoutes).where(eq(proposalRoutes.proposalId, proposalId));
  }

  async createProposalRoute(route: InsertProposalRoute): Promise<ProposalRoute> {
    const [newRoute] = await db.insert(proposalRoutes).values(route).returning();
    return newRoute;
  }

  // Client operation operations
  async getClientOperations(clientId: number): Promise<ClientOperation[]> {
    return db.select().from(clientOperations).where(eq(clientOperations.clientId, clientId)).orderBy(desc(clientOperations.createdAt));
  }

  async createClientOperation(operation: InsertClientOperation): Promise<ClientOperation> {
    const [newOperation] = await db.insert(clientOperations).values(operation).returning();
    return newOperation;
  }
}

export const storage = new DatabaseStorage();
