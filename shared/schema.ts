import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password", { length: 255 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone", { length: 20 }),
  cnpj: varchar("cnpj", { length: 18 }),
  companyId: integer("company_id"),
  role: varchar("role").default("user"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  activeSessionToken: varchar("active_session_token"),
  lgpdConsentAt: timestamp("lgpd_consent_at"),
  cookieConsentAt: timestamp("cookie_consent_at"),
  freeCalculationsRemaining: integer("free_calculations_remaining").default(3),
  totalCalculationsUsed: integer("total_calculations_used").default(0),
  lastCalculationAt: timestamp("last_calculation_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table for multi-tenant architecture
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 18 }),
  email: varchar("email"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  subscriptionStatus: varchar("subscription_status").default("trial"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Clients (CRM) table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  tradeName: varchar("trade_name", { length: 255 }),
  cnpj: varchar("cnpj", { length: 18 }),
  email: varchar("email"),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  segment: varchar("segment", { length: 100 }),
  status: varchar("status").default("prospect"),
  pipelineStage: varchar("pipeline_stage").default("lead"),
  notes: text("notes"),
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email"),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Checklists table
export const checklists = pgTable("checklists", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  name: varchar("name", { length: 255 }).notNull(),
  segment: varchar("segment", { length: 100 }),
  status: varchar("status").default("in_progress"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Checklist items table
export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id").notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  checked: boolean("checked").default(false),
  notes: text("notes"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Freight calculations table
export const freightCalculations = pgTable("freight_calculations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  originCity: varchar("origin_city", { length: 100 }),
  originState: varchar("origin_state", { length: 2 }),
  destinationCity: varchar("destination_city", { length: 100 }),
  destinationState: varchar("destination_state", { length: 2 }),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  cargoValue: decimal("cargo_value", { precision: 15, scale: 2 }),
  freightValue: decimal("freight_value", { precision: 15, scale: 2 }),
  icmsRate: decimal("icms_rate", { precision: 5, scale: 2 }),
  icmsValue: decimal("icms_value", { precision: 15, scale: 2 }),
  grisRate: decimal("gris_rate", { precision: 5, scale: 4 }),
  grisValue: decimal("gris_value", { precision: 15, scale: 2 }),
  advRate: decimal("adv_rate", { precision: 5, scale: 4 }),
  advValue: decimal("adv_value", { precision: 15, scale: 2 }),
  tollValue: decimal("toll_value", { precision: 15, scale: 2 }),
  unloadingValue: decimal("unloading_value", { precision: 15, scale: 2 }),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Storage calculations table
export const storageCalculations = pgTable("storage_calculations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  area: decimal("area", { precision: 10, scale: 2 }),
  period: integer("period"),
  productType: varchar("product_type", { length: 100 }),
  movementRate: decimal("movement_rate", { precision: 10, scale: 2 }),
  storageRate: decimal("storage_rate", { precision: 10, scale: 2 }),
  handlingValue: decimal("handling_value", { precision: 15, scale: 2 }),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Financial accounts table
export const financialAccounts = pgTable("financial_accounts", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  type: varchar("type", { length: 20 }).notNull(),
  description: text("description").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  status: varchar("status").default("pending"),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing materials table
export const marketingMaterials = pgTable("marketing_materials", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  segment: varchar("segment", { length: 100 }),
  type: varchar("type", { length: 50 }),
  fileUrl: text("file_url"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Commercial proposals table
export const commercialProposals = pgTable("commercial_proposals", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  proposalNumber: varchar("proposal_number", { length: 20 }).notNull().unique(),
  clientName: varchar("client_name", { length: 255 }),
  clientEmail: varchar("client_email"),
  clientPhone: varchar("client_phone", { length: 20 }),
  clientCnpj: varchar("client_cnpj", { length: 18 }),
  status: varchar("status").default("draft"), // draft, sent, approved, rejected, expired
  validUntil: timestamp("valid_until"),
  approvedAt: timestamp("approved_at"),
  contractType: varchar("contract_type"), // spot, 6_months, 1_year
  nextReviewDate: timestamp("next_review_date"),
  notes: text("notes"),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Proposal routes (multiple routes per proposal)
export const proposalRoutes = pgTable("proposal_routes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull(),
  originCity: varchar("origin_city", { length: 100 }).notNull(),
  originState: varchar("origin_state", { length: 2 }).notNull(),
  destinationCity: varchar("destination_city", { length: 100 }).notNull(),
  destinationState: varchar("destination_state", { length: 2 }).notNull(),
  distanceKm: decimal("distance_km", { precision: 10, scale: 2 }),
  productType: varchar("product_type", { length: 100 }),
  packagingType: varchar("packaging_type", { length: 100 }),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  cargoValue: decimal("cargo_value", { precision: 15, scale: 2 }),
  vehicleAxles: integer("vehicle_axles").default(5),
  anttMinFreight: decimal("antt_min_freight", { precision: 15, scale: 2 }),
  freightValue: decimal("freight_value", { precision: 15, scale: 2 }),
  tollValue: decimal("toll_value", { precision: 15, scale: 2 }),
  tollInIcmsBase: boolean("toll_in_icms_base").default(true),
  icmsRate: decimal("icms_rate", { precision: 5, scale: 2 }),
  icmsValue: decimal("icms_value", { precision: 15, scale: 2 }),
  issRate: decimal("iss_rate", { precision: 5, scale: 2 }),
  issValue: decimal("iss_value", { precision: 15, scale: 2 }),
  grisRate: decimal("gris_rate", { precision: 5, scale: 4 }),
  grisValue: decimal("gris_value", { precision: 15, scale: 2 }),
  advRate: decimal("adv_rate", { precision: 5, scale: 4 }),
  advValue: decimal("adv_value", { precision: 15, scale: 2 }),
  unloadingValue: decimal("unloading_value", { precision: 15, scale: 2 }),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  operationName: varchar("operation_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fixed operations (approved proposals become fixed operations)
export const clientOperations = pgTable("client_operations", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id").notNull(),
  proposalId: integer("proposal_id"),
  operationName: varchar("operation_name", { length: 255 }).notNull(),
  originCity: varchar("origin_city", { length: 100 }).notNull(),
  originState: varchar("origin_state", { length: 2 }).notNull(),
  destinationCity: varchar("destination_city", { length: 100 }).notNull(),
  destinationState: varchar("destination_state", { length: 2 }).notNull(),
  productType: varchar("product_type", { length: 100 }),
  packagingType: varchar("packaging_type", { length: 100 }),
  agreedFreight: decimal("agreed_freight", { precision: 15, scale: 2 }),
  contractStartDate: timestamp("contract_start_date"),
  contractEndDate: timestamp("contract_end_date"),
  nextReviewDate: timestamp("next_review_date"),
  reviewPeriodMonths: integer("review_period_months").default(6),
  status: varchar("status").default("active"), // active, suspended, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ANTT freight reference table
export const anttFreightTable = pgTable("antt_freight_table", {
  id: serial("id").primaryKey(),
  operationType: varchar("operation_type", { length: 1 }).notNull(), // A, B, C, D
  cargoType: varchar("cargo_type", { length: 100 }).notNull(),
  axles: integer("axles").notNull(),
  ccd: decimal("ccd", { precision: 10, scale: 4 }).notNull(), // Coeficiente de Custo de Deslocamento (R$/km)
  cc: decimal("cc", { precision: 10, scale: 2 }).notNull(), // Coeficiente de Carga (R$)
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  clients: many(clients),
  checklists: many(checklists),
  freightCalculations: many(freightCalculations),
  storageCalculations: many(storageCalculations),
  financialAccounts: many(financialAccounts),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  company: one(companies, {
    fields: [clients.companyId],
    references: [companies.id],
  }),
  checklists: many(checklists),
  freightCalculations: many(freightCalculations),
  financialAccounts: many(financialAccounts),
}));

export const checklistsRelations = relations(checklists, ({ one, many }) => ({
  company: one(companies, {
    fields: [checklists.companyId],
    references: [companies.id],
  }),
  client: one(clients, {
    fields: [checklists.clientId],
    references: [clients.id],
  }),
  items: many(checklistItems),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  checklist: one(checklists, {
    fields: [checklistItems.checklistId],
    references: [checklists.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChecklistSchema = createInsertSchema(checklists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  createdAt: true,
});

export const insertFreightCalculationSchema = createInsertSchema(freightCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertStorageCalculationSchema = createInsertSchema(storageCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertFinancialAccountSchema = createInsertSchema(financialAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketingMaterialSchema = createInsertSchema(marketingMaterials).omit({
  id: true,
  createdAt: true,
});

export const insertCommercialProposalSchema = createInsertSchema(commercialProposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProposalRouteSchema = createInsertSchema(proposalRoutes).omit({
  id: true,
  createdAt: true,
});

export const insertClientOperationSchema = createInsertSchema(clientOperations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnttFreightTableSchema = createInsertSchema(anttFreightTable).omit({
  id: true,
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = z.infer<typeof insertChecklistSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type FreightCalculation = typeof freightCalculations.$inferSelect;
export type InsertFreightCalculation = z.infer<typeof insertFreightCalculationSchema>;
export type StorageCalculation = typeof storageCalculations.$inferSelect;
export type InsertStorageCalculation = z.infer<typeof insertStorageCalculationSchema>;
export type FinancialAccount = typeof financialAccounts.$inferSelect;
export type InsertFinancialAccount = z.infer<typeof insertFinancialAccountSchema>;
export type MarketingMaterial = typeof marketingMaterials.$inferSelect;
export type InsertMarketingMaterial = z.infer<typeof insertMarketingMaterialSchema>;
export type CommercialProposal = typeof commercialProposals.$inferSelect;
export type InsertCommercialProposal = z.infer<typeof insertCommercialProposalSchema>;
export type ProposalRoute = typeof proposalRoutes.$inferSelect;
export type InsertProposalRoute = z.infer<typeof insertProposalRouteSchema>;
export type ClientOperation = typeof clientOperations.$inferSelect;
export type InsertClientOperation = z.infer<typeof insertClientOperationSchema>;
export type AnttFreightTable = typeof anttFreightTable.$inferSelect;
export type InsertAnttFreightTable = z.infer<typeof insertAnttFreightTableSchema>;
