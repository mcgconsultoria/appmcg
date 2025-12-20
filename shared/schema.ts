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
  cnpj: varchar("cnpj", { length: 18 }),
  inscricaoEstadual: varchar("inscricao_estadual", { length: 20 }),
  inscricaoEstadualIsento: boolean("inscricao_estadual_isento").default(false),
  inscricaoMunicipal: varchar("inscricao_municipal", { length: 20 }),
  razaoSocial: varchar("razao_social", { length: 255 }),
  nomeFantasia: varchar("nome_fantasia", { length: 255 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  tipoEmpresa: varchar("tipo_empresa", { length: 100 }),
  segmento: varchar("segmento", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  vendedor: varchar("vendedor", { length: 255 }),
  perfilConta: varchar("perfil_conta", { length: 50 }).default("colaborador"),
  profileImageUrl: varchar("profile_image_url"),
  phone: varchar("phone", { length: 20 }),
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

// Custom business types catalog
export const businessTypes = pgTable("business_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom market segments catalog
export const marketSegments = pgTable("market_segments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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
  logo: text("logo"),
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
  tipoEmpresa: varchar("tipo_empresa", { length: 100 }),
  vendedor: varchar("vendedor", { length: 255 }),
  status: varchar("status").default("prospect"),
  pipelineStage: varchar("pipeline_stage").default("lead"),
  notes: text("notes"),
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email"),
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }),
  metaValor: decimal("meta_valor", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Checklists table - Enhanced structure with client profile
export const checklists = pgTable("checklists", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  name: varchar("name", { length: 255 }).notNull(),
  segment: varchar("segment", { length: 100 }),
  status: varchar("status").default("in_progress"),
  
  // Capa/Perfil do Cliente
  clienteNome: varchar("cliente_nome", { length: 255 }),
  clienteCnpj: varchar("cliente_cnpj", { length: 18 }),
  focalPointNome: varchar("focal_point_nome", { length: 255 }),
  focalPointEmail: varchar("focal_point_email", { length: 255 }),
  focalPointCelular: varchar("focal_point_celular", { length: 20 }),
  focalPointRegiao: varchar("focal_point_regiao", { length: 100 }),
  
  // História e Perfil
  historia: text("historia"),
  localizacao: text("localizacao"),
  segmentoDetalhado: text("segmento_detalhado"),
  produto: text("produto"),
  numeros: text("numeros"),
  noticias: text("noticias"),
  
  // Contatos
  site: varchar("site", { length: 255 }),
  linkedIn: varchar("linkedin", { length: 255 }),
  emailComercial: varchar("email_comercial", { length: 255 }),
  contatoComercial: text("contato_comercial"),
  
  // Abrangência
  abrangenciaNacional: boolean("abrangencia_nacional").default(false),
  abrangenciaRegional: boolean("abrangencia_regional").default(false),
  abrangenciaInternacional: boolean("abrangencia_internacional").default(false),
  
  // Market Share
  marketShare: text("market_share"),
  posicaoMercado: text("posicao_mercado"),
  
  // Oportunidades
  oportunidades: jsonb("oportunidades").$type<string[]>(),
  
  // Pipeline Overview
  pipelineSegmento: varchar("pipeline_segmento", { length: 100 }),
  pipelineProduto: varchar("pipeline_produto", { length: 255 }),
  pipelineVolume: varchar("pipeline_volume", { length: 100 }),
  pipelineTarget: decimal("pipeline_target", { precision: 15, scale: 2 }),
  
  // Contatos do Cliente (por setor)
  contatosCliente: jsonb("contatos_cliente").$type<{
    nome: string;
    celular: string;
    email: string;
    setor: string;
    aniversario: string;
    funcao: string;
  }[]>(),
  
  // Portais e Senhas
  portaisSenhas: jsonb("portais_senhas").$type<{
    portal: string;
    link: string;
    login: string;
    observacao: string;
  }[]>(),
  
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Checklist sections table - Each department/section with responsible party
export const checklistSections = pgTable("checklist_sections", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id").notNull(),
  sectionKey: varchar("section_key", { length: 50 }).notNull(),
  sectionName: varchar("section_name", { length: 100 }).notNull(),
  
  // Responsável
  responsavelNome: varchar("responsavel_nome", { length: 255 }),
  responsavelEmail: varchar("responsavel_email", { length: 255 }),
  dataRecebimento: timestamp("data_recebimento"),
  dataRetorno: timestamp("data_retorno"),
  
  // Parecer
  isPerfil: boolean("is_perfil"),
  parecer: text("parecer"),
  
  // Documentos
  documentosAtualizados: boolean("documentos_atualizados").default(false),
  documentosObservacao: text("documentos_observacao"),
  
  // Status da seção
  status: varchar("status").default("pending"),
  progress: integer("progress").default(0),
  
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Checklist items table - Questions within sections
export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id").notNull(),
  sectionId: integer("section_id"),
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
  proposalType: varchar("proposal_type", { length: 20 }).default("freight"), // freight, storage, consulting
  clientName: varchar("client_name", { length: 255 }),
  clientEmail: varchar("client_email"),
  clientPhone: varchar("client_phone", { length: 20 }),
  clientCnpj: varchar("client_cnpj", { length: 18 }),
  status: varchar("status").default("awaiting_approval"), // awaiting_approval, sent, approved, rejected, expired
  validUntil: timestamp("valid_until"),
  approvedAt: timestamp("approved_at"),
  contractType: varchar("contract_type"), // spot, 6_months, 1_year
  nextReviewDate: timestamp("next_review_date"),
  notes: text("notes"),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  proposalData: jsonb("proposal_data"), // Store proposal-specific data (storage details, consulting phases, etc.)
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

// Meeting Objectives Catalog
export const meetingObjectives = pgTable("meeting_objectives", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  isCustom: boolean("is_custom").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meeting Records (Ata Plano de Acao)
export const meetingRecords = pgTable("meeting_records", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  userId: varchar("user_id"),
  title: varchar("title", { length: 255 }).notNull(),
  meetingType: varchar("meeting_type", { length: 50 }).default("client"), // client, internal, strategic
  meetingMode: varchar("meeting_mode", { length: 20 }).default("presencial"), // online, presencial
  meetingLocation: text("meeting_location"), // Local da reuniao se presencial
  meetingDate: timestamp("meeting_date").notNull(),
  participants: text("participants"), // JSON array: [{name: string, email: string}]
  summary: text("summary"),
  objectives: text("objectives"), // Legacy text field
  selectedObjectives: text("selected_objectives"), // JSON array of objective labels
  decisions: text("decisions"),
  nextSteps: text("next_steps"),
  nextReviewDate: timestamp("next_review_date"),
  pipelineStage: varchar("pipeline_stage", { length: 50 }),
  status: varchar("status").default("draft"), // draft, finalized, sent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meeting Action Items (Itens do Plano de Acao)
export const meetingActionItems = pgTable("meeting_action_items", {
  id: serial("id").primaryKey(),
  meetingRecordId: integer("meeting_record_id").notNull(),
  description: text("description").notNull(),
  responsible: varchar("responsible", { length: 255 }),
  responsibleEmail: varchar("responsible_email", { length: 255 }),
  responsibleUserId: varchar("responsible_user_id"),
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  status: varchar("status").default("pending"), // pending, in_progress, completed, cancelled
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  orderIndex: integer("order_index").default(0),
  linkedTaskId: integer("linked_task_id"), // Link to auto-created task
  createdAt: timestamp("created_at").defaultNow(),
});

// Commercial Events (Calendario Comercial)
export const commercialEvents = pgTable("commercial_events", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  userId: varchar("user_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: varchar("event_type", { length: 50 }).default("meeting"), // meeting, call, visit, followup, deadline, reminder
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  allDay: boolean("all_day").default(false),
  location: varchar("location", { length: 255 }),
  pipelineStage: varchar("pipeline_stage", { length: 50 }),
  meetingRecordId: integer("meeting_record_id"),
  recurrence: varchar("recurrence", { length: 50 }), // none, daily, weekly, monthly
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  clientId: integer("client_id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status").default("active"), // active, paused, completed, cancelled
  priority: varchar("priority", { length: 20 }).default("medium"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  projectId: integer("project_id"),
  clientId: integer("client_id"),
  meetingRecordId: integer("meeting_record_id"),
  actionItemId: integer("action_item_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to"),
  assignedEmail: varchar("assigned_email", { length: 255 }),
  assignedUserId: varchar("assigned_user_id"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status").default("todo"), // todo, in_progress, review, done
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  tags: text("tags"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// RFI (Request for Information) - Company technical profile for bids
export const rfis = pgTable("rfis", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  
  // Basic Company Data
  razaoSocial: varchar("razao_social", { length: 255 }).notNull(),
  nomeFantasia: varchar("nome_fantasia", { length: 255 }),
  cnpj: varchar("cnpj", { length: 18 }),
  endereco: text("endereco"),
  bairro: varchar("bairro", { length: 100 }),
  cep: varchar("cep", { length: 10 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  contato: varchar("contato", { length: 255 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email"),
  site: varchar("site"),
  ramoAtividade: varchar("ramo_atividade", { length: 100 }),
  inicioAtividades: varchar("inicio_atividades", { length: 10 }),
  
  // Financial Data (annual revenue by year)
  faturamentoAnual: jsonb("faturamento_anual"), // { "2022": 1000000, "2023": 1200000, etc }
  
  // Units/Branches
  unidades: jsonb("unidades"), // [{ local, endereco, telefone, contato }]
  
  // Suppliers
  fornecedores: jsonb("fornecedores"), // [{ nome, ramoAtuacao }]
  
  // Competitors
  concorrentes: jsonb("concorrentes"), // [{ nome }]
  
  // Main Clients
  principaisClientes: jsonb("principais_clientes"), // [{ nome, percentualFaturamento, segmento }]
  
  // Product/Service Description
  linhaProdutos: text("linha_produtos"),
  frequenciaColeta: text("frequencia_coleta"),
  procedimentosEmbarque: text("procedimentos_embarque"),
  
  // Regional Coverage (states served)
  coberturaRegional: jsonb("cobertura_regional"), // { sul: [], sudeste: [], etc }
  
  // Regional Details (deadlines, values, volumes by region)
  detalhesRegionais: jsonb("detalhes_regionais"), // [{ regiao, prazo, valorMedio, volumeMedio }]
  
  // Operational Requirements
  permiteTerceirizacao: boolean("permite_terceirizacao"),
  tiposVeiculos: jsonb("tipos_veiculos"), // { climatizado: true, seco: true }
  perfilVeiculos: jsonb("perfil_veiculos"), // { "3/4": true, toco: true, truck: true, carreta: true }
  disponibilizaXml: boolean("disponibiliza_xml"),
  prazoPagamento: varchar("prazo_pagamento", { length: 20 }),
  
  // Scope of Operation
  segmentosAtuacao: jsonb("segmentos_atuacao"), // { alimentosBebidas: true, automobilistica: true, etc }
  modaisAtuacao: jsonb("modais_atuacao"), // { aereo: true, rodoviario: true, etc }
  tiposAcondicionamento: jsonb("tipos_acondicionamento"), // { seca: true, perigosa: true, etc }
  tiposOperacao: jsonb("tipos_operacao"), // { transferencia: true, distribuicaoUrbana: true, etc }
  
  // Fleet Information
  frota: jsonb("frota"), // [{ tipoVeiculo, quantidade, idadeMedia }]
  
  // Contact responsible for filling
  responsavelPreenchimento: varchar("responsavel_preenchimento", { length: 255 }),
  cargoResponsavel: varchar("cargo_responsavel", { length: 100 }),
  telefoneResponsavel: varchar("telefone_responsavel", { length: 20 }),
  emailResponsavel: varchar("email_responsavel"),
  
  // Status and metadata
  status: varchar("status").default("draft"), // draft, completed, submitted
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  sections: many(checklistSections),
  items: many(checklistItems),
}));

export const checklistSectionsRelations = relations(checklistSections, ({ one, many }) => ({
  checklist: one(checklists, {
    fields: [checklistSections.checklistId],
    references: [checklists.id],
  }),
  items: many(checklistItems),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  checklist: one(checklists, {
    fields: [checklistItems.checklistId],
    references: [checklists.id],
  }),
  section: one(checklistSections, {
    fields: [checklistItems.sectionId],
    references: [checklistSections.id],
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

export const insertChecklistSectionSchema = createInsertSchema(checklistSections).omit({
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
}).extend({
  proposalType: z.string().optional().default("freight"),
  proposalData: z.any().optional().nullable(),
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

export const insertMeetingObjectiveSchema = createInsertSchema(meetingObjectives).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingRecordSchema = createInsertSchema(meetingRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingActionItemSchema = createInsertSchema(meetingActionItems).omit({
  id: true,
  createdAt: true,
});

export const insertCommercialEventSchema = createInsertSchema(commercialEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRfiSchema = createInsertSchema(rfis).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Business types and market segments insert schemas
export const insertBusinessTypeSchema = createInsertSchema(businessTypes).omit({
  id: true,
  createdAt: true,
});

export const insertMarketSegmentSchema = createInsertSchema(marketSegments).omit({
  id: true,
  createdAt: true,
});

// ============================================
// ADMIN MCG TABLES
// ============================================

// Admin Leads - MCG's potential clients for platform/consulting
export const adminLeads = pgTable("admin_leads", {
  id: serial("id").primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  tradeName: varchar("trade_name", { length: 255 }),
  cnpj: varchar("cnpj", { length: 18 }),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone", { length: 20 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  segment: varchar("segment", { length: 100 }),
  source: varchar("source", { length: 100 }), // Website, Indicação, LinkedIn, etc
  interest: varchar("interest", { length: 100 }), // Assinatura, Consultoria, Ambos
  stage: varchar("stage").default("lead"), // lead, qualified, proposal, negotiation, closed_won, closed_lost
  estimatedValue: decimal("estimated_value", { precision: 15, scale: 2 }),
  probability: integer("probability").default(0),
  notes: text("notes"),
  nextFollowUp: timestamp("next_follow_up"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  lostReason: varchar("lost_reason", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Proposals - MCG's proposals for services
export const adminProposals = pgTable("admin_proposals", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id"),
  proposalNumber: varchar("proposal_number", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  clientName: varchar("client_name", { length: 255 }),
  serviceType: varchar("service_type", { length: 100 }), // Assinatura, Diagnóstico, Implementação, Execução, Expansão
  description: text("description"),
  value: decimal("value", { precision: 15, scale: 2 }),
  discount: decimal("discount", { precision: 5, scale: 2 }),
  finalValue: decimal("final_value", { precision: 15, scale: 2 }),
  validUntil: timestamp("valid_until"),
  status: varchar("status").default("draft"), // draft, sent, accepted, rejected, expired
  sentAt: timestamp("sent_at"),
  acceptedAt: timestamp("accepted_at"),
  rejectedReason: varchar("rejected_reason", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Contracts - MCG's contracts
export const adminContracts = pgTable("admin_contracts", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id"),
  leadId: integer("lead_id"),
  contractNumber: varchar("contract_number", { length: 50 }),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientCnpj: varchar("client_cnpj", { length: 18 }),
  serviceType: varchar("service_type", { length: 100 }),
  description: text("description"),
  value: decimal("value", { precision: 15, scale: 2 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: varchar("status").default("active"), // active, completed, cancelled, suspended
  signedAt: timestamp("signed_at"),
  signedBy: varchar("signed_by", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Projects - MCG's consulting projects
export const adminProjects = pgTable("admin_projects", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id"),
  leadId: integer("lead_id"),
  name: varchar("name", { length: 255 }).notNull(),
  clientName: varchar("client_name", { length: 255 }),
  projectType: varchar("project_type", { length: 100 }), // Diagnóstico, Implementação, Execução, Expansão
  description: text("description"),
  startDate: timestamp("start_date"),
  targetEndDate: timestamp("target_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  status: varchar("status").default("planning"), // planning, active, on_hold, completed, cancelled
  progress: integer("progress").default(0),
  value: decimal("value", { precision: 15, scale: 2 }),
  assignedTo: varchar("assigned_to", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Project Phases - Phases within consulting projects
export const adminProjectPhases = pgTable("admin_project_phases", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  startDate: timestamp("start_date"),
  targetEndDate: timestamp("target_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  status: varchar("status").default("pending"), // pending, in_progress, completed, blocked
  progress: integer("progress").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Project Deliverables - Deliverables for each phase
export const adminProjectDeliverables = pgTable("admin_project_deliverables", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  phaseId: integer("phase_id"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  status: varchar("status").default("pending"), // pending, in_progress, completed, approved
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Partnerships - MCG's partnerships
export const adminPartnerships = pgTable("admin_partnerships", {
  id: serial("id").primaryKey(),
  partnerName: varchar("partner_name", { length: 255 }).notNull(),
  partnerType: varchar("partner_type", { length: 100 }), // Tecnologia, Sindicato, Escola, Revenda
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  benefits: text("benefits"),
  status: varchar("status").default("prospecting"), // prospecting, negotiating, active, paused, ended
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  ownerName: varchar("owner_name", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Posts - Blog/Content management
export const adminPosts = pgTable("admin_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  content: text("content"),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 100 }),
  tags: jsonb("tags").$type<string[]>(),
  targetAudience: jsonb("target_audience").$type<string[]>(), // Transportadores, Embarcadores, Operadores, etc
  featuredImage: text("featured_image"),
  status: varchar("status").default("draft"), // draft, scheduled, published, archived
  publishAt: timestamp("publish_at"),
  publishedAt: timestamp("published_at"),
  authorName: varchar("author_name", { length: 255 }),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin Financial Records - MCG's financial tracking
export const adminFinancialRecords = pgTable("admin_financial_records", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // receita, despesa
  category: varchar("category", { length: 100 }), // Assinatura, Consultoria, Salários, Impostos, etc
  subcategory: varchar("subcategory", { length: 100 }),
  description: varchar("description", { length: 255 }),
  clientName: varchar("client_name", { length: 255 }),
  contractId: integer("contract_id"),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  status: varchar("status").default("pending"), // pending, paid, overdue, cancelled
  paymentMethod: varchar("payment_method", { length: 100 }),
  nfseNumber: varchar("nfse_number", { length: 50 }),
  nfseIssuedAt: timestamp("nfse_issued_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for admin tables
export const insertAdminLeadSchema = createInsertSchema(adminLeads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminProposalSchema = createInsertSchema(adminProposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminContractSchema = createInsertSchema(adminContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminProjectSchema = createInsertSchema(adminProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminProjectPhaseSchema = createInsertSchema(adminProjectPhases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminProjectDeliverableSchema = createInsertSchema(adminProjectDeliverables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminPartnershipSchema = createInsertSchema(adminPartnerships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminPostSchema = createInsertSchema(adminPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminFinancialRecordSchema = createInsertSchema(adminFinancialRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// CLIENT ADMIN - Company Team Management
// ============================================

// Company team members - users within a company
export const companyTeamMembers = pgTable("company_team_members", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role", { length: 50 }).default("member"), // admin, manager, member
  department: varchar("department", { length: 100 }), // Comercial, Operacao, Financeiro, SAC
  permissions: jsonb("permissions").$type<string[]>().default([]), // ['crm', 'checklist', 'calculator', 'rfi', 'financial']
  isActive: boolean("is_active").default(true),
  invitedBy: varchar("invited_by"),
  invitedAt: timestamp("invited_at"),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support tickets for client companies
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: varchar("user_id").notNull(),
  ticketNumber: varchar("ticket_number", { length: 20 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // suporte, financeiro, comercial, tecnico
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  status: varchar("status", { length: 20 }).default("open"), // open, in_progress, waiting_customer, resolved, closed
  assignedTo: varchar("assigned_to"), // MCG team member
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support ticket messages
export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  isInternal: boolean("is_internal").default(false), // Internal MCG notes
  attachments: jsonb("attachments").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Client Admin insert schemas
export const insertCompanyTeamMemberSchema = createInsertSchema(companyTeamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().optional(),
  tipoEmpresa: z.string().optional(),
  segmento: z.string().optional(),
  departamento: z.string().optional(),
  vendedor: z.string().optional(),
  perfilConta: z.string().optional().default("colaborador"),
  phone: z.string().optional(),
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
export type ChecklistSection = typeof checklistSections.$inferSelect;
export type InsertChecklistSection = z.infer<typeof insertChecklistSectionSchema>;
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
export type MeetingRecord = typeof meetingRecords.$inferSelect;
export type InsertMeetingRecord = z.infer<typeof insertMeetingRecordSchema>;
export type MeetingObjective = typeof meetingObjectives.$inferSelect;
export type InsertMeetingObjective = z.infer<typeof insertMeetingObjectiveSchema>;
export type MeetingActionItem = typeof meetingActionItems.$inferSelect;
export type InsertMeetingActionItem = z.infer<typeof insertMeetingActionItemSchema>;
export type CommercialEvent = typeof commercialEvents.$inferSelect;
export type InsertCommercialEvent = z.infer<typeof insertCommercialEventSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Rfi = typeof rfis.$inferSelect;
export type InsertRfi = z.infer<typeof insertRfiSchema>;
export type BusinessType = typeof businessTypes.$inferSelect;
export type InsertBusinessType = z.infer<typeof insertBusinessTypeSchema>;
export type MarketSegment = typeof marketSegments.$inferSelect;
export type InsertMarketSegment = z.infer<typeof insertMarketSegmentSchema>;

// Admin MCG Types
export type AdminLead = typeof adminLeads.$inferSelect;
export type InsertAdminLead = z.infer<typeof insertAdminLeadSchema>;
export type AdminProposal = typeof adminProposals.$inferSelect;
export type InsertAdminProposal = z.infer<typeof insertAdminProposalSchema>;
export type AdminContract = typeof adminContracts.$inferSelect;
export type InsertAdminContract = z.infer<typeof insertAdminContractSchema>;
export type AdminProject = typeof adminProjects.$inferSelect;
export type InsertAdminProject = z.infer<typeof insertAdminProjectSchema>;
export type AdminProjectPhase = typeof adminProjectPhases.$inferSelect;
export type InsertAdminProjectPhase = z.infer<typeof insertAdminProjectPhaseSchema>;
export type AdminProjectDeliverable = typeof adminProjectDeliverables.$inferSelect;
export type InsertAdminProjectDeliverable = z.infer<typeof insertAdminProjectDeliverableSchema>;
export type AdminPartnership = typeof adminPartnerships.$inferSelect;
export type InsertAdminPartnership = z.infer<typeof insertAdminPartnershipSchema>;
export type AdminPost = typeof adminPosts.$inferSelect;
export type InsertAdminPost = z.infer<typeof insertAdminPostSchema>;
export type AdminFinancialRecord = typeof adminFinancialRecords.$inferSelect;
export type InsertAdminFinancialRecord = z.infer<typeof insertAdminFinancialRecordSchema>;

// Client Admin Types
export type CompanyTeamMember = typeof companyTeamMembers.$inferSelect;
export type InsertCompanyTeamMember = z.infer<typeof insertCompanyTeamMemberSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;
