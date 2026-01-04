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
  savedRoutes,
  clientOperations,
  operationBillingEntries,
  operationBillingGoals,
  meetingRecords,
  meetingActionItems,
  meetingObjectives,
  commercialEvents,
  projects,
  tasks,
  rfis,
  businessTypes,
  marketSegments,
  adminLeads,
  adminProposals,
  adminContracts,
  adminProjects,
  adminProjectPhases,
  adminProjectDeliverables,
  adminPartnerships,
  adminPosts,
  adminFinancialRecords,
  checklistTemplates,
  checklistTemplatePurchases,
  diagnosticLeads,
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
  type ChecklistAttachment,
  type InsertChecklistAttachment,
  checklistAttachments,
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
  type SavedRoute,
  type InsertSavedRoute,
  type ClientOperation,
  type InsertClientOperation,
  type OperationBillingEntry,
  type InsertOperationBillingEntry,
  type OperationBillingGoal,
  type InsertOperationBillingGoal,
  type MeetingRecord,
  type InsertMeetingRecord,
  type MeetingObjective,
  type InsertMeetingObjective,
  type MeetingActionItem,
  type InsertMeetingActionItem,
  type CommercialEvent,
  type InsertCommercialEvent,
  type Project,
  type InsertProject,
  type Task,
  type InsertTask,
  type Rfi,
  type InsertRfi,
  type BusinessType,
  type InsertBusinessType,
  type MarketSegment,
  type InsertMarketSegment,
  type AdminLead,
  type InsertAdminLead,
  type AdminProposal,
  type InsertAdminProposal,
  type AdminContract,
  type InsertAdminContract,
  type AdminProject,
  type InsertAdminProject,
  type AdminProjectPhase,
  type InsertAdminProjectPhase,
  type AdminProjectDeliverable,
  type InsertAdminProjectDeliverable,
  type AdminPartnership,
  type InsertAdminPartnership,
  type AdminPost,
  type InsertAdminPost,
  type AdminFinancialRecord,
  type InsertAdminFinancialRecord,
  companyTeamMembers,
  supportTickets,
  supportTicketMessages,
  contractTemplates,
  contractAgreements,
  contractSignatures,
  type CompanyTeamMember,
  type InsertCompanyTeamMember,
  type SupportTicket,
  type InsertSupportTicket,
  type SupportTicketMessage,
  type InsertSupportTicketMessage,
  type ContractTemplate,
  type InsertContractTemplate,
  type ContractAgreement,
  type InsertContractAgreement,
  type ContractSignature,
  type InsertContractSignature,
  type ChecklistTemplate,
  type InsertChecklistTemplate,
  type ChecklistTemplatePurchase,
  type InsertChecklistTemplatePurchase,
  type DiagnosticLead,
  type InsertDiagnosticLead,
  dreAccounts,
  costCenters,
  personalCostCenters,
  bankAccounts,
  digitalCertificates,
  accountingEntries,
  bankIntegrations,
  bankTransactions,
  type DreAccount,
  type InsertDreAccount,
  type CostCenter,
  type InsertCostCenter,
  type PersonalCostCenter,
  type InsertPersonalCostCenter,
  type BankAccount,
  type InsertBankAccount,
  type DigitalCertificate,
  type InsertDigitalCertificate,
  type AccountingEntry,
  type InsertAccountingEntry,
  type BankIntegration,
  type InsertBankIntegration,
  type BankTransaction,
  type InsertBankTransaction,
  storeProductCategories,
  storeProducts,
  storeOrders,
  storeOrderItems,
  ebookVolumes,
  auditLogs,
  type StoreProductCategory,
  type InsertStoreProductCategory,
  type StoreProduct,
  type InsertStoreProduct,
  type StoreOrder,
  type InsertStoreOrder,
  type StoreOrderItem,
  type InsertStoreOrderItem,
  type EbookVolume,
  type InsertEbookVolume,
  type AuditLog,
  type InsertAuditLog,
  whatsappJourneySteps,
  whatsappConfig,
  whatsappAgents,
  whatsappConversations,
  whatsappMessages,
  type WhatsappJourneyStep,
  type InsertWhatsappJourneyStep,
  type WhatsappConfig,
  type InsertWhatsappConfig,
  type WhatsappAgent,
  type InsertWhatsappAgent,
  type WhatsappConversation,
  type InsertWhatsappConversation,
  type WhatsappMessage,
  type InsertWhatsappMessage,
  personalCategories,
  personalAccounts,
  personalTransactions,
  irpfDeclarations,
  irpfIncomes,
  irpfDeductions,
  irpfDependents,
  irpfAssets,
  irpjSummaries,
  commercialFlowcharts,
  type CommercialFlowchart,
  irpjDasPayments,
  consultingQuoteRequests,
  type ConsultingQuoteRequest,
  type InsertConsultingQuoteRequest,
  type PersonalCategory,
  type InsertPersonalCategory,
  type PersonalAccount,
  type InsertPersonalAccount,
  type PersonalTransaction,
  type InsertPersonalTransaction,
  type IrpfDeclaration,
  type InsertIrpfDeclaration,
  type IrpfIncome,
  type InsertIrpfIncome,
  type IrpfDeduction,
  type InsertIrpfDeduction,
  type IrpfDependent,
  type InsertIrpfDependent,
  type IrpfAsset,
  type InsertIrpfAsset,
  type IrpjSummary,
  type InsertIrpjSummary,
  type IrpjDasPayment,
  type InsertIrpjDasPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lt, lte, ne } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByCnpj(cnpj: string): Promise<User | undefined>;
  getUserBySessionToken(token: string): Promise<User | undefined>;
  createUserWithPassword(userData: Partial<UpsertUser>): Promise<User>;
  updateUserSessionToken(userId: string, token: string | null): Promise<void>;
  updateUserProfile(userId: string, data: { profileImageUrl?: string; firstName?: string; lastName?: string }): Promise<User | undefined>;
  getPendingApprovalUsers(): Promise<User[]>;
  approveUser(userId: string, approvedBy: string): Promise<User | undefined>;
  rejectUser(userId: string, reason: string): Promise<User | undefined>;
  suspendUser(userId: string, reason: string): Promise<User | undefined>;
  updateUserRole(userId: string, role: string): Promise<User | undefined>;

  // Company operations
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByCnpjRaiz(cnpjRaiz: string): Promise<Company | undefined>;
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

  // Checklist attachment operations
  getChecklistAttachments(checklistId: number): Promise<ChecklistAttachment[]>;
  getChecklistAttachmentsByCompany(companyId: number): Promise<ChecklistAttachment[]>;
  getExpiringAttachments(daysAhead: number): Promise<ChecklistAttachment[]>;
  createChecklistAttachment(attachment: InsertChecklistAttachment): Promise<ChecklistAttachment>;
  updateChecklistAttachment(id: number, attachment: Partial<InsertChecklistAttachment>): Promise<ChecklistAttachment | undefined>;
  deleteChecklistAttachment(id: number): Promise<boolean>;

  // Freight calculation operations
  getFreightCalculations(companyId?: number): Promise<FreightCalculation[]>;
  createFreightCalculation(calc: InsertFreightCalculation): Promise<FreightCalculation>;

  // Storage calculation operations
  getStorageCalculations(companyId?: number): Promise<StorageCalculation[]>;
  createStorageCalculation(calc: InsertStorageCalculation): Promise<StorageCalculation>;

  // Saved route operations
  getSavedRoutes(companyId: number): Promise<SavedRoute[]>;
  getSavedRoute(id: number): Promise<SavedRoute | undefined>;
  createSavedRoute(route: InsertSavedRoute): Promise<SavedRoute>;
  updateSavedRoute(id: number, route: Partial<InsertSavedRoute>): Promise<SavedRoute | undefined>;
  deleteSavedRoute(id: number): Promise<boolean>;

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

  // Meeting objectives catalog
  getMeetingObjectives(companyId: number): Promise<MeetingObjective[]>;
  createMeetingObjective(objective: InsertMeetingObjective): Promise<MeetingObjective>;
  deleteMeetingObjective(id: number): Promise<boolean>;

  // Meeting record operations
  getMeetingRecords(companyId: number): Promise<MeetingRecord[]>;
  getMeetingRecord(id: number): Promise<MeetingRecord | undefined>;
  createMeetingRecord(record: InsertMeetingRecord): Promise<MeetingRecord>;
  updateMeetingRecord(id: number, record: Partial<InsertMeetingRecord>): Promise<MeetingRecord | undefined>;
  deleteMeetingRecord(id: number): Promise<boolean>;

  // Meeting action item operations
  getMeetingActionItems(meetingRecordId: number): Promise<MeetingActionItem[]>;
  createMeetingActionItem(item: InsertMeetingActionItem): Promise<MeetingActionItem>;
  updateMeetingActionItem(id: number, item: Partial<InsertMeetingActionItem>): Promise<MeetingActionItem | undefined>;
  deleteMeetingActionItem(id: number): Promise<boolean>;

  // Commercial event operations
  getCommercialEvents(companyId: number): Promise<CommercialEvent[]>;
  getCommercialEvent(id: number): Promise<CommercialEvent | undefined>;
  createCommercialEvent(event: InsertCommercialEvent): Promise<CommercialEvent>;
  updateCommercialEvent(id: number, event: Partial<InsertCommercialEvent>): Promise<CommercialEvent | undefined>;
  deleteCommercialEvent(id: number): Promise<boolean>;

  // Project operations
  getProjects(companyId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Task operations
  getTasks(companyId: number): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksDueTomorrow(startDate: Date, endDate: Date): Promise<Task[]>;
  markTaskReminderSent(id: number): Promise<void>;

  // Quota operations
  useCalculation(userId: string): Promise<void>;

  // RFI operations
  getRfis(companyId: number): Promise<Rfi[]>;
  getRfi(id: number): Promise<Rfi | undefined>;
  createRfi(rfi: InsertRfi): Promise<Rfi>;
  updateRfi(id: number, rfi: Partial<InsertRfi>): Promise<Rfi | undefined>;
  deleteRfi(id: number): Promise<boolean>;

  // Business type operations
  getBusinessTypes(): Promise<BusinessType[]>;
  createBusinessType(type: InsertBusinessType): Promise<BusinessType>;

  // Market segment operations
  getMarketSegments(): Promise<MarketSegment[]>;
  createMarketSegment(segment: InsertMarketSegment): Promise<MarketSegment>;

  // ============================================
  // ADMIN MCG OPERATIONS
  // ============================================

  // Admin Lead operations
  getAdminLeads(): Promise<AdminLead[]>;
  getAdminLead(id: number): Promise<AdminLead | undefined>;
  createAdminLead(lead: InsertAdminLead): Promise<AdminLead>;
  updateAdminLead(id: number, lead: Partial<InsertAdminLead>): Promise<AdminLead | undefined>;
  deleteAdminLead(id: number): Promise<boolean>;

  // Admin Proposal operations
  getAdminProposals(): Promise<AdminProposal[]>;
  getAdminProposal(id: number): Promise<AdminProposal | undefined>;
  createAdminProposal(proposal: InsertAdminProposal): Promise<AdminProposal>;
  updateAdminProposal(id: number, proposal: Partial<InsertAdminProposal>): Promise<AdminProposal | undefined>;
  deleteAdminProposal(id: number): Promise<boolean>;

  // Admin Contract operations
  getAdminContracts(): Promise<AdminContract[]>;
  getAdminContract(id: number): Promise<AdminContract | undefined>;
  createAdminContract(contract: InsertAdminContract): Promise<AdminContract>;
  updateAdminContract(id: number, contract: Partial<InsertAdminContract>): Promise<AdminContract | undefined>;
  deleteAdminContract(id: number): Promise<boolean>;

  // Admin Project operations
  getAdminProjects(): Promise<AdminProject[]>;
  getAdminProject(id: number): Promise<AdminProject | undefined>;
  createAdminProject(project: InsertAdminProject): Promise<AdminProject>;
  updateAdminProject(id: number, project: Partial<InsertAdminProject>): Promise<AdminProject | undefined>;
  deleteAdminProject(id: number): Promise<boolean>;

  // Admin Project Phase operations
  getAdminProjectPhases(projectId: number): Promise<AdminProjectPhase[]>;
  createAdminProjectPhase(phase: InsertAdminProjectPhase): Promise<AdminProjectPhase>;
  updateAdminProjectPhase(id: number, phase: Partial<InsertAdminProjectPhase>): Promise<AdminProjectPhase | undefined>;
  deleteAdminProjectPhase(id: number): Promise<boolean>;

  // Admin Project Deliverable operations
  getAdminProjectDeliverables(projectId: number): Promise<AdminProjectDeliverable[]>;
  createAdminProjectDeliverable(deliverable: InsertAdminProjectDeliverable): Promise<AdminProjectDeliverable>;
  updateAdminProjectDeliverable(id: number, deliverable: Partial<InsertAdminProjectDeliverable>): Promise<AdminProjectDeliverable | undefined>;
  deleteAdminProjectDeliverable(id: number): Promise<boolean>;

  // Admin Partnership operations
  getAdminPartnerships(): Promise<AdminPartnership[]>;
  getAdminPartnership(id: number): Promise<AdminPartnership | undefined>;
  createAdminPartnership(partnership: InsertAdminPartnership): Promise<AdminPartnership>;
  updateAdminPartnership(id: number, partnership: Partial<InsertAdminPartnership>): Promise<AdminPartnership | undefined>;
  deleteAdminPartnership(id: number): Promise<boolean>;

  // Admin Post operations
  getAdminPosts(): Promise<AdminPost[]>;
  getAdminPost(id: number): Promise<AdminPost | undefined>;
  createAdminPost(post: InsertAdminPost): Promise<AdminPost>;
  updateAdminPost(id: number, post: Partial<InsertAdminPost>): Promise<AdminPost | undefined>;
  deleteAdminPost(id: number): Promise<boolean>;

  // Admin Financial Record operations
  getAdminFinancialRecords(): Promise<AdminFinancialRecord[]>;
  getAdminFinancialRecord(id: number): Promise<AdminFinancialRecord | undefined>;
  createAdminFinancialRecord(record: InsertAdminFinancialRecord): Promise<AdminFinancialRecord>;
  updateAdminFinancialRecord(id: number, record: Partial<InsertAdminFinancialRecord>): Promise<AdminFinancialRecord | undefined>;
  deleteAdminFinancialRecord(id: number): Promise<boolean>;

  // Admin Dashboard stats
  getAdminDashboardStats(): Promise<{
    activeLeads: number;
    activeProjects: number;
    activeSubscriptions: number;
    estimatedRevenue: number;
  }>;

  // ============================================
  // CLIENT ADMIN - Company Team Management
  // ============================================

  // Company Team Member operations
  getCompanyTeamMembers(companyId: number): Promise<CompanyTeamMember[]>;
  getCompanyTeamMember(id: number): Promise<CompanyTeamMember | undefined>;
  getCompanyTeamMemberByUserId(companyId: number, userId: string): Promise<CompanyTeamMember | undefined>;
  createCompanyTeamMember(member: InsertCompanyTeamMember): Promise<CompanyTeamMember>;
  updateCompanyTeamMember(id: number, companyId: number, member: Partial<InsertCompanyTeamMember>): Promise<CompanyTeamMember | undefined>;
  deleteCompanyTeamMember(id: number, companyId: number): Promise<boolean>;

  // Support Ticket operations
  getSupportTickets(companyId?: number): Promise<SupportTicket[]>;
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, companyId: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined>;
  deleteSupportTicket(id: number, companyId: number): Promise<boolean>;

  // Support Ticket Message operations
  getSupportTicketMessages(ticketId: number): Promise<SupportTicketMessage[]>;
  createSupportTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage>;

  // ============================================
  // DIGITAL CONTRACTS - Assinatura Digital
  // ============================================

  // Contract Template operations
  getContractTemplates(): Promise<ContractTemplate[]>;
  getContractTemplate(id: number): Promise<ContractTemplate | undefined>;
  getContractTemplateByType(type: string): Promise<ContractTemplate | undefined>;
  createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate>;
  updateContractTemplate(id: number, template: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined>;
  deleteContractTemplate(id: number): Promise<boolean>;

  // Contract Agreement operations
  getContractAgreements(companyId?: number): Promise<ContractAgreement[]>;
  getContractAgreement(id: number): Promise<ContractAgreement | undefined>;
  getContractAgreementsByCompany(companyId: number): Promise<ContractAgreement[]>;
  createContractAgreement(agreement: InsertContractAgreement): Promise<ContractAgreement>;
  updateContractAgreement(id: number, agreement: Partial<InsertContractAgreement>): Promise<ContractAgreement | undefined>;
  deleteContractAgreement(id: number): Promise<boolean>;

  // Contract Signature operations
  getContractSignatures(agreementId: number): Promise<ContractSignature[]>;
  createContractSignature(signature: InsertContractSignature): Promise<ContractSignature>;
  updateContractSignature(id: number, signature: Partial<InsertContractSignature>): Promise<ContractSignature | undefined>;

  // ============================================
  // CHECKLIST TEMPLATE LIBRARY
  // ============================================

  // Checklist Template operations
  getChecklistTemplates(segment?: string): Promise<ChecklistTemplate[]>;
  getChecklistTemplate(id: number): Promise<ChecklistTemplate | undefined>;
  getChecklistTemplateSegments(): Promise<string[]>;
  createChecklistTemplate(template: InsertChecklistTemplate): Promise<ChecklistTemplate>;
  updateChecklistTemplate(id: number, template: Partial<InsertChecklistTemplate>): Promise<ChecklistTemplate | undefined>;
  deleteChecklistTemplate(id: number): Promise<boolean>;

  // Checklist Template Purchase operations
  getChecklistTemplatePurchases(userId: string): Promise<ChecklistTemplatePurchase[]>;
  getChecklistTemplatePurchaseByTemplateAndUser(templateId: number, userId: string): Promise<ChecklistTemplatePurchase | undefined>;
  createChecklistTemplatePurchase(purchase: InsertChecklistTemplatePurchase): Promise<ChecklistTemplatePurchase>;
  updateChecklistTemplatePurchase(id: number, purchase: Partial<InsertChecklistTemplatePurchase>): Promise<ChecklistTemplatePurchase | undefined>;

  // Diagnostic Lead operations
  getDiagnosticLeads(): Promise<DiagnosticLead[]>;
  getDiagnosticLead(id: number): Promise<DiagnosticLead | undefined>;
  createDiagnosticLead(lead: InsertDiagnosticLead): Promise<DiagnosticLead>;
  updateDiagnosticLead(id: number, lead: Partial<InsertDiagnosticLead>): Promise<DiagnosticLead | undefined>;
  deleteDiagnosticLead(id: number): Promise<boolean>;

  // Financial Module - DRE Accounts
  getDreAccounts(): Promise<DreAccount[]>;
  createDreAccount(account: InsertDreAccount): Promise<DreAccount>;
  updateDreAccount(id: number, account: Partial<InsertDreAccount>): Promise<DreAccount | undefined>;
  deleteDreAccount(id: number): Promise<boolean>;
  seedDefaultDreAccounts(): Promise<void>;

  // Financial Module - Cost Centers
  getCostCenters(): Promise<CostCenter[]>;
  createCostCenter(center: InsertCostCenter): Promise<CostCenter>;
  updateCostCenter(id: number, center: Partial<InsertCostCenter>): Promise<CostCenter | undefined>;
  deleteCostCenter(id: number): Promise<boolean>;
  seedDefaultCostCenters(): Promise<void>;

  // Personal Cost Centers (ADMIN PF)
  getPersonalCostCenters(userId: string): Promise<PersonalCostCenter[]>;
  getPersonalCostCenter(id: number, userId: string): Promise<PersonalCostCenter | undefined>;
  createPersonalCostCenter(center: InsertPersonalCostCenter): Promise<PersonalCostCenter>;
  updatePersonalCostCenter(id: number, userId: string, center: Partial<InsertPersonalCostCenter>): Promise<PersonalCostCenter | undefined>;
  deletePersonalCostCenter(id: number, userId: string): Promise<boolean>;
  seedPersonalCostCenters(userId: string): Promise<void>;

  // Financial Module - Bank Accounts
  getBankAccounts(): Promise<BankAccount[]>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: number): Promise<boolean>;

  // Financial Module - Digital Certificates
  getDigitalCertificates(): Promise<DigitalCertificate[]>;
  createDigitalCertificate(cert: InsertDigitalCertificate): Promise<DigitalCertificate>;
  deleteDigitalCertificate(id: number): Promise<boolean>;

  // Financial Module - Accounting Entries (Lançamentos Contábeis)
  getAccountingEntries(filters?: { startDate?: string; endDate?: string; dreAccountId?: number; costCenterId?: number }): Promise<AccountingEntry[]>;
  getAccountingEntry(id: number): Promise<AccountingEntry | undefined>;
  createAccountingEntry(entry: InsertAccountingEntry): Promise<AccountingEntry>;
  updateAccountingEntry(id: number, entry: Partial<InsertAccountingEntry>): Promise<AccountingEntry | undefined>;
  deleteAccountingEntry(id: number): Promise<boolean>;

  // Financial Module - Bank Integrations
  getBankIntegrations(): Promise<BankIntegration[]>;
  getBankIntegration(id: number): Promise<BankIntegration | undefined>;
  createBankIntegration(integration: InsertBankIntegration): Promise<BankIntegration>;
  updateBankIntegration(id: number, integration: Partial<InsertBankIntegration>): Promise<BankIntegration | undefined>;
  deleteBankIntegration(id: number): Promise<boolean>;

  // Financial Module - Bank Transactions
  getBankTransactions(bankAccountId?: number): Promise<BankTransaction[]>;
  createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction | null>;
  reconcileBankTransaction(id: number, accountingEntryId: number): Promise<BankTransaction | undefined>;

  // Store operations
  getStoreProductCategories(): Promise<StoreProductCategory[]>;
  getStoreProductCategory(id: number): Promise<StoreProductCategory | undefined>;
  createStoreProductCategory(category: InsertStoreProductCategory): Promise<StoreProductCategory>;
  updateStoreProductCategory(id: number, category: Partial<InsertStoreProductCategory>): Promise<StoreProductCategory | undefined>;
  deleteStoreProductCategory(id: number): Promise<boolean>;

  getStoreProducts(options?: { categoryId?: number; isActive?: boolean; productType?: string }): Promise<StoreProduct[]>;
  getStoreProduct(id: number): Promise<StoreProduct | undefined>;
  getStoreProductBySlug(slug: string): Promise<StoreProduct | undefined>;
  createStoreProduct(product: InsertStoreProduct): Promise<StoreProduct>;
  updateStoreProduct(id: number, product: Partial<InsertStoreProduct>): Promise<StoreProduct | undefined>;
  deleteStoreProduct(id: number): Promise<boolean>;

  getEbookVolumes(productId?: number): Promise<EbookVolume[]>;
  getEbookVolume(id: number): Promise<EbookVolume | undefined>;
  createEbookVolume(volume: InsertEbookVolume): Promise<EbookVolume>;
  updateEbookVolume(id: number, volume: Partial<InsertEbookVolume>): Promise<EbookVolume | undefined>;
  deleteEbookVolume(id: number): Promise<boolean>;

  getStoreOrders(options?: { companyId?: number; userId?: string; status?: string }): Promise<StoreOrder[]>;
  getStoreOrder(id: number): Promise<StoreOrder | undefined>;
  getStoreOrderByNumber(orderNumber: string): Promise<StoreOrder | undefined>;
  createStoreOrder(order: InsertStoreOrder): Promise<StoreOrder>;
  updateStoreOrder(id: number, order: Partial<InsertStoreOrder>): Promise<StoreOrder | undefined>;

  getStoreOrderItems(orderId: number): Promise<StoreOrderItem[]>;
  createStoreOrderItem(item: InsertStoreOrderItem): Promise<StoreOrderItem>;

  // Audit log operations
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(companyId: number, options?: { userId?: string; action?: string; limit?: number; offset?: number }): Promise<AuditLog[]>;
  getAuditLogsByUser(companyId: number, userId: string): Promise<AuditLog[]>;

  // WhatsApp Support Journey operations
  getWhatsappJourneySteps(): Promise<WhatsappJourneyStep[]>;
  getWhatsappJourneyStep(id: number): Promise<WhatsappJourneyStep | undefined>;
  createWhatsappJourneyStep(step: InsertWhatsappJourneyStep): Promise<WhatsappJourneyStep>;
  updateWhatsappJourneyStep(id: number, step: Partial<InsertWhatsappJourneyStep>): Promise<WhatsappJourneyStep | undefined>;
  deleteWhatsappJourneyStep(id: number): Promise<boolean>;

  getWhatsappConfig(): Promise<WhatsappConfig | undefined>;
  createWhatsappConfig(config: InsertWhatsappConfig): Promise<WhatsappConfig>;
  updateWhatsappConfig(id: number, config: Partial<InsertWhatsappConfig>): Promise<WhatsappConfig | undefined>;

  getWhatsappAgents(): Promise<WhatsappAgent[]>;
  createWhatsappAgent(agent: InsertWhatsappAgent): Promise<WhatsappAgent>;
  updateWhatsappAgent(id: number, agent: Partial<InsertWhatsappAgent>): Promise<WhatsappAgent | undefined>;
  deleteWhatsappAgent(id: number): Promise<boolean>;

  getWhatsappConversations(): Promise<WhatsappConversation[]>;
  createWhatsappConversation(conversation: InsertWhatsappConversation): Promise<WhatsappConversation>;
  updateWhatsappConversation(id: number, conversation: Partial<InsertWhatsappConversation>): Promise<WhatsappConversation | undefined>;

  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
  getWhatsappMessages(conversationId: number): Promise<WhatsappMessage[]>;

  // Commercial Flowchart operations
  getCommercialFlowchart(userId: string): Promise<CommercialFlowchart | undefined>;
  saveCommercialFlowchart(userId: string, nodes: any[], edges: any[]): Promise<CommercialFlowchart>;

  // Consulting Quote Request operations
  createConsultingQuoteRequest(data: InsertConsultingQuoteRequest): Promise<ConsultingQuoteRequest>;
  getConsultingQuoteRequests(): Promise<ConsultingQuoteRequest[]>;
  updateConsultingQuoteRequest(id: number, data: Partial<InsertConsultingQuoteRequest>): Promise<ConsultingQuoteRequest | undefined>;
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

  async getUserByCnpj(cnpj: string): Promise<User | undefined> {
    const cleanCnpj = cnpj.replace(/[^\d]/g, "");
    const [user] = await db
      .select()
      .from(users)
      .where(sql`REPLACE(REPLACE(REPLACE(${users.cnpj}, '.', ''), '-', ''), '/', '') = ${cleanCnpj}`);
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

  async updateUserProfile(userId: string, data: { profileImageUrl?: string; firstName?: string; lastName?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getPendingApprovalUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.accountStatus, "pending")).orderBy(desc(users.createdAt));
  }

  async approveUser(userId: string, approvedBy: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        accountStatus: "approved", 
        approvedAt: new Date(), 
        approvedBy,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async rejectUser(userId: string, reason: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        accountStatus: "rejected", 
        accountStatusReason: reason,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async suspendUser(userId: string, reason: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        accountStatus: "suspended", 
        accountStatusReason: reason,
        activeSessionToken: null,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        role,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await db
      .update(users)
      .set({ passwordResetToken: token, passwordResetExpiry: expiry, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token));
    return user;
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ passwordResetToken: null, passwordResetExpiry: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Company operations
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByCnpjRaiz(cnpjRaiz: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.cnpjRaiz, cnpjRaiz));
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

  // Checklist attachment operations
  async getChecklistAttachments(checklistId: number): Promise<ChecklistAttachment[]> {
    return db.select().from(checklistAttachments).where(eq(checklistAttachments.checklistId, checklistId));
  }

  async getChecklistAttachmentsByCompany(companyId: number): Promise<ChecklistAttachment[]> {
    return db.select().from(checklistAttachments).where(eq(checklistAttachments.companyId, companyId));
  }

  async getExpiringAttachments(daysAhead: number): Promise<ChecklistAttachment[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return db.select().from(checklistAttachments)
      .where(
        and(
          gte(checklistAttachments.dataValidade, today),
          lte(checklistAttachments.dataValidade, futureDate),
          eq(checklistAttachments.lembrete15DiasEnviado, false),
          eq(checklistAttachments.status, "active")
        )
      );
  }

  async createChecklistAttachment(attachment: InsertChecklistAttachment): Promise<ChecklistAttachment> {
    const [newAttachment] = await db.insert(checklistAttachments).values(attachment).returning();
    return newAttachment;
  }

  async updateChecklistAttachment(id: number, attachment: Partial<InsertChecklistAttachment>): Promise<ChecklistAttachment | undefined> {
    const [updated] = await db
      .update(checklistAttachments)
      .set({ ...attachment, updatedAt: new Date() })
      .where(eq(checklistAttachments.id, id))
      .returning();
    return updated;
  }

  async deleteChecklistAttachment(id: number): Promise<boolean> {
    await db.delete(checklistAttachments).where(eq(checklistAttachments.id, id));
    return true;
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

  // Saved route operations
  async getSavedRoutes(companyId: number): Promise<SavedRoute[]> {
    return db.select().from(savedRoutes).where(eq(savedRoutes.companyId, companyId)).orderBy(desc(savedRoutes.createdAt));
  }

  async getSavedRoute(id: number): Promise<SavedRoute | undefined> {
    const [route] = await db.select().from(savedRoutes).where(eq(savedRoutes.id, id));
    return route;
  }

  async createSavedRoute(route: InsertSavedRoute): Promise<SavedRoute> {
    // Generate next route number for this company
    const [maxResult] = await db
      .select({ maxNumber: sql<number>`COALESCE(MAX(route_number), 0)` })
      .from(savedRoutes)
      .where(eq(savedRoutes.companyId, route.companyId));
    const nextNumber = (maxResult?.maxNumber || 0) + 1;
    
    const [newRoute] = await db.insert(savedRoutes).values({
      ...route,
      routeNumber: nextNumber,
    }).returning();
    return newRoute;
  }

  async updateSavedRoute(id: number, route: Partial<InsertSavedRoute>): Promise<SavedRoute | undefined> {
    const [updated] = await db
      .update(savedRoutes)
      .set({ ...route, updatedAt: new Date() })
      .where(eq(savedRoutes.id, id))
      .returning();
    return updated;
  }

  async deleteSavedRoute(id: number): Promise<boolean> {
    await db.delete(savedRoutes).where(eq(savedRoutes.id, id));
    return true;
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

  async getAllClientOperations(companyId: number): Promise<ClientOperation[]> {
    return db.select().from(clientOperations).where(eq(clientOperations.companyId, companyId)).orderBy(desc(clientOperations.createdAt));
  }

  // Operation Billing Entries
  async getOperationBillingEntries(companyId: number, startDate: Date, endDate: Date): Promise<OperationBillingEntry[]> {
    return db.select().from(operationBillingEntries)
      .where(
        and(
          eq(operationBillingEntries.companyId, companyId),
          gte(operationBillingEntries.billingDate, startDate),
          lte(operationBillingEntries.billingDate, endDate)
        )
      )
      .orderBy(operationBillingEntries.billingDate);
  }

  async createOperationBillingEntry(entry: InsertOperationBillingEntry): Promise<OperationBillingEntry> {
    const [newEntry] = await db.insert(operationBillingEntries).values(entry).returning();
    return newEntry;
  }

  async updateOperationBillingEntry(id: number, entry: Partial<InsertOperationBillingEntry>): Promise<OperationBillingEntry | undefined> {
    const [updated] = await db
      .update(operationBillingEntries)
      .set(entry)
      .where(eq(operationBillingEntries.id, id))
      .returning();
    return updated;
  }

  async deleteOperationBillingEntry(id: number): Promise<boolean> {
    await db.delete(operationBillingEntries).where(eq(operationBillingEntries.id, id));
    return true;
  }

  // Operation Billing Goals
  async getOperationBillingGoals(companyId: number, goalMonth?: string): Promise<OperationBillingGoal[]> {
    if (goalMonth) {
      return db.select().from(operationBillingGoals)
        .where(
          and(
            eq(operationBillingGoals.companyId, companyId),
            eq(operationBillingGoals.goalMonth, goalMonth)
          )
        );
    }
    return db.select().from(operationBillingGoals)
      .where(eq(operationBillingGoals.companyId, companyId));
  }

  async createOperationBillingGoal(goal: InsertOperationBillingGoal): Promise<OperationBillingGoal> {
    const [newGoal] = await db.insert(operationBillingGoals).values(goal).returning();
    return newGoal;
  }

  async updateOperationBillingGoal(id: number, goal: Partial<InsertOperationBillingGoal>): Promise<OperationBillingGoal | undefined> {
    const [updated] = await db
      .update(operationBillingGoals)
      .set({ ...goal, updatedAt: new Date() })
      .where(eq(operationBillingGoals.id, id))
      .returning();
    return updated;
  }

  async deleteOperationBillingGoal(id: number): Promise<boolean> {
    await db.delete(operationBillingGoals).where(eq(operationBillingGoals.id, id));
    return true;
  }

  // Meeting objectives catalog
  async getMeetingObjectives(companyId: number): Promise<MeetingObjective[]> {
    return db.select().from(meetingObjectives)
      .where(eq(meetingObjectives.companyId, companyId))
      .orderBy(meetingObjectives.label);
  }

  async createMeetingObjective(objective: InsertMeetingObjective): Promise<MeetingObjective> {
    const [newObjective] = await db.insert(meetingObjectives).values(objective).returning();
    return newObjective;
  }

  async deleteMeetingObjective(id: number): Promise<boolean> {
    await db.delete(meetingObjectives).where(eq(meetingObjectives.id, id));
    return true;
  }

  // Meeting record operations
  async getMeetingRecords(companyId: number): Promise<MeetingRecord[]> {
    return db.select().from(meetingRecords).where(eq(meetingRecords.companyId, companyId)).orderBy(desc(meetingRecords.meetingDate));
  }

  async getMeetingRecord(id: number): Promise<MeetingRecord | undefined> {
    const [record] = await db.select().from(meetingRecords).where(eq(meetingRecords.id, id));
    return record;
  }

  async createMeetingRecord(record: InsertMeetingRecord): Promise<MeetingRecord> {
    const [newRecord] = await db.insert(meetingRecords).values(record).returning();
    return newRecord;
  }

  async updateMeetingRecord(id: number, record: Partial<InsertMeetingRecord>): Promise<MeetingRecord | undefined> {
    const [updated] = await db
      .update(meetingRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(meetingRecords.id, id))
      .returning();
    return updated;
  }

  async deleteMeetingRecord(id: number): Promise<boolean> {
    await db.delete(meetingActionItems).where(eq(meetingActionItems.meetingRecordId, id));
    await db.delete(meetingRecords).where(eq(meetingRecords.id, id));
    return true;
  }

  // Meeting action item operations
  async getMeetingActionItems(meetingRecordId: number): Promise<MeetingActionItem[]> {
    return db.select().from(meetingActionItems).where(eq(meetingActionItems.meetingRecordId, meetingRecordId)).orderBy(meetingActionItems.orderIndex);
  }

  async createMeetingActionItem(item: InsertMeetingActionItem): Promise<MeetingActionItem> {
    const [newItem] = await db.insert(meetingActionItems).values(item).returning();
    return newItem;
  }

  async updateMeetingActionItem(id: number, item: Partial<InsertMeetingActionItem>): Promise<MeetingActionItem | undefined> {
    const [updated] = await db
      .update(meetingActionItems)
      .set(item)
      .where(eq(meetingActionItems.id, id))
      .returning();
    return updated;
  }

  async deleteMeetingActionItem(id: number): Promise<boolean> {
    await db.delete(meetingActionItems).where(eq(meetingActionItems.id, id));
    return true;
  }

  // Commercial event operations
  async getCommercialEvents(companyId: number): Promise<CommercialEvent[]> {
    return db.select().from(commercialEvents).where(eq(commercialEvents.companyId, companyId)).orderBy(desc(commercialEvents.startDate));
  }

  async getCommercialEvent(id: number): Promise<CommercialEvent | undefined> {
    const [event] = await db.select().from(commercialEvents).where(eq(commercialEvents.id, id));
    return event;
  }

  async createCommercialEvent(event: InsertCommercialEvent): Promise<CommercialEvent> {
    const [newEvent] = await db.insert(commercialEvents).values(event).returning();
    return newEvent;
  }

  async updateCommercialEvent(id: number, event: Partial<InsertCommercialEvent>): Promise<CommercialEvent | undefined> {
    const [updated] = await db
      .update(commercialEvents)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(commercialEvents.id, id))
      .returning();
    return updated;
  }

  async deleteCommercialEvent(id: number): Promise<boolean> {
    await db.delete(commercialEvents).where(eq(commercialEvents.id, id));
    return true;
  }

  // Project operations
  async getProjects(companyId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.companyId, companyId)).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Task operations
  async getTasks(companyId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.companyId, companyId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  async getTasksDueTomorrow(startDate: Date, endDate: Date): Promise<Task[]> {
    return db.select().from(tasks).where(
      and(
        gte(tasks.dueDate, startDate),
        lt(tasks.dueDate, endDate),
        ne(tasks.status, "completed"),
        eq(tasks.reminderSent, false)
      )
    );
  }

  async markTaskReminderSent(id: number): Promise<void> {
    await db.update(tasks).set({ reminderSent: true }).where(eq(tasks.id, id));
  }

  // Quota operations
  async useCalculation(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        freeCalculationsRemaining: sql`GREATEST(0, COALESCE(free_calculations_remaining, 3) - 1)`,
        totalCalculationsUsed: sql`COALESCE(total_calculations_used, 0) + 1`,
        lastCalculationAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // RFI operations
  async getRfis(companyId: number): Promise<Rfi[]> {
    return db.select().from(rfis).where(eq(rfis.companyId, companyId)).orderBy(desc(rfis.createdAt));
  }

  async getRfi(id: number): Promise<Rfi | undefined> {
    const [rfi] = await db.select().from(rfis).where(eq(rfis.id, id));
    return rfi;
  }

  async createRfi(rfi: InsertRfi): Promise<Rfi> {
    const [newRfi] = await db.insert(rfis).values(rfi).returning();
    return newRfi;
  }

  async updateRfi(id: number, rfi: Partial<InsertRfi>): Promise<Rfi | undefined> {
    const [updated] = await db
      .update(rfis)
      .set({ ...rfi, updatedAt: new Date() })
      .where(eq(rfis.id, id))
      .returning();
    return updated;
  }

  async deleteRfi(id: number): Promise<boolean> {
    await db.delete(rfis).where(eq(rfis.id, id));
    return true;
  }

  // Business type operations
  async getBusinessTypes(): Promise<BusinessType[]> {
    return db.select().from(businessTypes).orderBy(businessTypes.name);
  }

  async createBusinessType(type: InsertBusinessType): Promise<BusinessType> {
    const [newType] = await db.insert(businessTypes).values(type).returning();
    return newType;
  }

  // Market segment operations
  async getMarketSegments(): Promise<MarketSegment[]> {
    return db.select().from(marketSegments).orderBy(marketSegments.name);
  }

  async createMarketSegment(segment: InsertMarketSegment): Promise<MarketSegment> {
    const [newSegment] = await db.insert(marketSegments).values(segment).returning();
    return newSegment;
  }

  // ============================================
  // ADMIN MCG OPERATIONS
  // ============================================

  // Admin Lead operations
  async getAdminLeads(): Promise<AdminLead[]> {
    return db.select().from(adminLeads).orderBy(desc(adminLeads.createdAt));
  }

  async getAdminLead(id: number): Promise<AdminLead | undefined> {
    const [lead] = await db.select().from(adminLeads).where(eq(adminLeads.id, id));
    return lead;
  }

  async createAdminLead(lead: InsertAdminLead): Promise<AdminLead> {
    const [newLead] = await db.insert(adminLeads).values(lead).returning();
    return newLead;
  }

  async updateAdminLead(id: number, lead: Partial<InsertAdminLead>): Promise<AdminLead | undefined> {
    const [updated] = await db
      .update(adminLeads)
      .set({ ...lead, updatedAt: new Date() })
      .where(eq(adminLeads.id, id))
      .returning();
    return updated;
  }

  async deleteAdminLead(id: number): Promise<boolean> {
    await db.delete(adminLeads).where(eq(adminLeads.id, id));
    return true;
  }

  // Admin Proposal operations
  async getAdminProposals(): Promise<AdminProposal[]> {
    return db.select().from(adminProposals).orderBy(desc(adminProposals.createdAt));
  }

  async getAdminProposal(id: number): Promise<AdminProposal | undefined> {
    const [proposal] = await db.select().from(adminProposals).where(eq(adminProposals.id, id));
    return proposal;
  }

  async createAdminProposal(proposal: InsertAdminProposal): Promise<AdminProposal> {
    const [newProposal] = await db.insert(adminProposals).values(proposal).returning();
    return newProposal;
  }

  async updateAdminProposal(id: number, proposal: Partial<InsertAdminProposal>): Promise<AdminProposal | undefined> {
    const [updated] = await db
      .update(adminProposals)
      .set({ ...proposal, updatedAt: new Date() })
      .where(eq(adminProposals.id, id))
      .returning();
    return updated;
  }

  async deleteAdminProposal(id: number): Promise<boolean> {
    await db.delete(adminProposals).where(eq(adminProposals.id, id));
    return true;
  }

  // Admin Contract operations
  async getAdminContracts(): Promise<AdminContract[]> {
    return db.select().from(adminContracts).orderBy(desc(adminContracts.createdAt));
  }

  async getAdminContract(id: number): Promise<AdminContract | undefined> {
    const [contract] = await db.select().from(adminContracts).where(eq(adminContracts.id, id));
    return contract;
  }

  async createAdminContract(contract: InsertAdminContract): Promise<AdminContract> {
    const [newContract] = await db.insert(adminContracts).values(contract).returning();
    return newContract;
  }

  async updateAdminContract(id: number, contract: Partial<InsertAdminContract>): Promise<AdminContract | undefined> {
    const [updated] = await db
      .update(adminContracts)
      .set({ ...contract, updatedAt: new Date() })
      .where(eq(adminContracts.id, id))
      .returning();
    return updated;
  }

  async deleteAdminContract(id: number): Promise<boolean> {
    await db.delete(adminContracts).where(eq(adminContracts.id, id));
    return true;
  }

  // Admin Project operations
  async getAdminProjects(): Promise<AdminProject[]> {
    return db.select().from(adminProjects).orderBy(desc(adminProjects.createdAt));
  }

  async getAdminProject(id: number): Promise<AdminProject | undefined> {
    const [project] = await db.select().from(adminProjects).where(eq(adminProjects.id, id));
    return project;
  }

  async createAdminProject(project: InsertAdminProject): Promise<AdminProject> {
    const [newProject] = await db.insert(adminProjects).values(project).returning();
    return newProject;
  }

  async updateAdminProject(id: number, project: Partial<InsertAdminProject>): Promise<AdminProject | undefined> {
    const [updated] = await db
      .update(adminProjects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(adminProjects.id, id))
      .returning();
    return updated;
  }

  async deleteAdminProject(id: number): Promise<boolean> {
    await db.delete(adminProjects).where(eq(adminProjects.id, id));
    return true;
  }

  // Admin Project Phase operations
  async getAdminProjectPhases(projectId: number): Promise<AdminProjectPhase[]> {
    return db.select().from(adminProjectPhases).where(eq(adminProjectPhases.projectId, projectId)).orderBy(adminProjectPhases.orderIndex);
  }

  async createAdminProjectPhase(phase: InsertAdminProjectPhase): Promise<AdminProjectPhase> {
    const [newPhase] = await db.insert(adminProjectPhases).values(phase).returning();
    return newPhase;
  }

  async updateAdminProjectPhase(id: number, phase: Partial<InsertAdminProjectPhase>): Promise<AdminProjectPhase | undefined> {
    const [updated] = await db
      .update(adminProjectPhases)
      .set({ ...phase, updatedAt: new Date() })
      .where(eq(adminProjectPhases.id, id))
      .returning();
    return updated;
  }

  async deleteAdminProjectPhase(id: number): Promise<boolean> {
    await db.delete(adminProjectPhases).where(eq(adminProjectPhases.id, id));
    return true;
  }

  // Admin Project Deliverable operations
  async getAdminProjectDeliverables(projectId: number): Promise<AdminProjectDeliverable[]> {
    return db.select().from(adminProjectDeliverables).where(eq(adminProjectDeliverables.projectId, projectId)).orderBy(desc(adminProjectDeliverables.createdAt));
  }

  async createAdminProjectDeliverable(deliverable: InsertAdminProjectDeliverable): Promise<AdminProjectDeliverable> {
    const [newDeliverable] = await db.insert(adminProjectDeliverables).values(deliverable).returning();
    return newDeliverable;
  }

  async updateAdminProjectDeliverable(id: number, deliverable: Partial<InsertAdminProjectDeliverable>): Promise<AdminProjectDeliverable | undefined> {
    const [updated] = await db
      .update(adminProjectDeliverables)
      .set({ ...deliverable, updatedAt: new Date() })
      .where(eq(adminProjectDeliverables.id, id))
      .returning();
    return updated;
  }

  async deleteAdminProjectDeliverable(id: number): Promise<boolean> {
    await db.delete(adminProjectDeliverables).where(eq(adminProjectDeliverables.id, id));
    return true;
  }

  // Admin Partnership operations
  async getAdminPartnerships(): Promise<AdminPartnership[]> {
    return db.select().from(adminPartnerships).orderBy(desc(adminPartnerships.createdAt));
  }

  async getAdminPartnership(id: number): Promise<AdminPartnership | undefined> {
    const [partnership] = await db.select().from(adminPartnerships).where(eq(adminPartnerships.id, id));
    return partnership;
  }

  async createAdminPartnership(partnership: InsertAdminPartnership): Promise<AdminPartnership> {
    const [newPartnership] = await db.insert(adminPartnerships).values(partnership).returning();
    return newPartnership;
  }

  async updateAdminPartnership(id: number, partnership: Partial<InsertAdminPartnership>): Promise<AdminPartnership | undefined> {
    const [updated] = await db
      .update(adminPartnerships)
      .set({ ...partnership, updatedAt: new Date() })
      .where(eq(adminPartnerships.id, id))
      .returning();
    return updated;
  }

  async deleteAdminPartnership(id: number): Promise<boolean> {
    await db.delete(adminPartnerships).where(eq(adminPartnerships.id, id));
    return true;
  }

  // Admin Post operations
  async getAdminPosts(): Promise<AdminPost[]> {
    return db.select().from(adminPosts).orderBy(desc(adminPosts.createdAt));
  }

  async getAdminPost(id: number): Promise<AdminPost | undefined> {
    const [post] = await db.select().from(adminPosts).where(eq(adminPosts.id, id));
    return post;
  }

  async createAdminPost(post: InsertAdminPost): Promise<AdminPost> {
    const [newPost] = await db.insert(adminPosts).values(post).returning();
    return newPost;
  }

  async updateAdminPost(id: number, post: Partial<InsertAdminPost>): Promise<AdminPost | undefined> {
    const [updated] = await db
      .update(adminPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(adminPosts.id, id))
      .returning();
    return updated;
  }

  async deleteAdminPost(id: number): Promise<boolean> {
    await db.delete(adminPosts).where(eq(adminPosts.id, id));
    return true;
  }

  // Admin Financial Record operations
  async getAdminFinancialRecords(): Promise<AdminFinancialRecord[]> {
    return db.select().from(adminFinancialRecords).orderBy(desc(adminFinancialRecords.createdAt));
  }

  async getAdminFinancialRecord(id: number): Promise<AdminFinancialRecord | undefined> {
    const [record] = await db.select().from(adminFinancialRecords).where(eq(adminFinancialRecords.id, id));
    return record;
  }

  async createAdminFinancialRecord(record: InsertAdminFinancialRecord): Promise<AdminFinancialRecord> {
    const [newRecord] = await db.insert(adminFinancialRecords).values(record).returning();
    return newRecord;
  }

  async updateAdminFinancialRecord(id: number, record: Partial<InsertAdminFinancialRecord>): Promise<AdminFinancialRecord | undefined> {
    const [updated] = await db
      .update(adminFinancialRecords)
      .set({ ...record, updatedAt: new Date() })
      .where(eq(adminFinancialRecords.id, id))
      .returning();
    return updated;
  }

  async deleteAdminFinancialRecord(id: number): Promise<boolean> {
    await db.delete(adminFinancialRecords).where(eq(adminFinancialRecords.id, id));
    return true;
  }

  // Admin Dashboard stats
  async getAdminDashboardStats(): Promise<{
    activeLeads: number;
    activeProjects: number;
    activeSubscriptions: number;
    estimatedRevenue: number;
  }> {
    const [leadsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminLeads)
      .where(and(
        ne(adminLeads.stage, 'closed_won'),
        ne(adminLeads.stage, 'closed_lost')
      ));

    const [projectsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(adminProjects)
      .where(eq(adminProjects.status, 'active'));

    const [subscriptionsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.subscriptionStatus, 'active'));

    const [revenueSum] = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(estimated_value AS numeric)), 0)` })
      .from(adminLeads)
      .where(and(
        ne(adminLeads.stage, 'closed_lost')
      ));

    return {
      activeLeads: Number(leadsCount?.count || 0),
      activeProjects: Number(projectsCount?.count || 0),
      activeSubscriptions: Number(subscriptionsCount?.count || 0),
      estimatedRevenue: Number(revenueSum?.total || 0),
    };
  }

  // ============================================
  // CLIENT ADMIN - Company Team Management
  // ============================================

  // Company Team Member operations
  async getCompanyTeamMembers(companyId: number): Promise<CompanyTeamMember[]> {
    return db.select().from(companyTeamMembers)
      .where(eq(companyTeamMembers.companyId, companyId))
      .orderBy(desc(companyTeamMembers.createdAt));
  }

  async getCompanyTeamMember(id: number): Promise<CompanyTeamMember | undefined> {
    const [member] = await db.select().from(companyTeamMembers).where(eq(companyTeamMembers.id, id));
    return member;
  }

  async getCompanyTeamMemberByUserId(companyId: number, userId: string): Promise<CompanyTeamMember | undefined> {
    const [member] = await db.select().from(companyTeamMembers)
      .where(and(
        eq(companyTeamMembers.companyId, companyId),
        eq(companyTeamMembers.userId, userId)
      ));
    return member;
  }

  async createCompanyTeamMember(member: InsertCompanyTeamMember): Promise<CompanyTeamMember> {
    const [newMember] = await db.insert(companyTeamMembers).values(member).returning();
    return newMember;
  }

  async updateCompanyTeamMember(id: number, companyId: number, member: Partial<InsertCompanyTeamMember>): Promise<CompanyTeamMember | undefined> {
    const [updated] = await db
      .update(companyTeamMembers)
      .set({ ...member, updatedAt: new Date() })
      .where(and(eq(companyTeamMembers.id, id), eq(companyTeamMembers.companyId, companyId)))
      .returning();
    return updated;
  }

  async deleteCompanyTeamMember(id: number, companyId: number): Promise<boolean> {
    const result = await db.delete(companyTeamMembers)
      .where(and(eq(companyTeamMembers.id, id), eq(companyTeamMembers.companyId, companyId)));
    return true;
  }

  // Support Ticket operations
  async getSupportTickets(companyId?: number): Promise<SupportTicket[]> {
    if (companyId) {
      return db.select().from(supportTickets)
        .where(eq(supportTickets.companyId, companyId))
        .orderBy(desc(supportTickets.createdAt));
    }
    return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
  }

  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.ticketNumber, ticketNumber));
    return ticket;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values(ticket).returning();
    return newTicket;
  }

  async updateSupportTicket(id: number, companyId: number, ticket: Partial<InsertSupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db
      .update(supportTickets)
      .set({ ...ticket, updatedAt: new Date() })
      .where(and(eq(supportTickets.id, id), eq(supportTickets.companyId, companyId)))
      .returning();
    return updated;
  }

  async deleteSupportTicket(id: number, companyId: number): Promise<boolean> {
    await db.delete(supportTickets)
      .where(and(eq(supportTickets.id, id), eq(supportTickets.companyId, companyId)));
    return true;
  }

  // Support Ticket Message operations
  async getSupportTicketMessages(ticketId: number): Promise<SupportTicketMessage[]> {
    return db.select().from(supportTicketMessages)
      .where(eq(supportTicketMessages.ticketId, ticketId))
      .orderBy(supportTicketMessages.createdAt);
  }

  async createSupportTicketMessage(message: InsertSupportTicketMessage): Promise<SupportTicketMessage> {
    const [newMessage] = await db.insert(supportTicketMessages).values(message).returning();
    return newMessage;
  }

  // ============================================
  // DIGITAL CONTRACTS - Assinatura Digital
  // ============================================

  // Contract Template operations
  async getContractTemplates(): Promise<ContractTemplate[]> {
    return db.select().from(contractTemplates).orderBy(desc(contractTemplates.createdAt));
  }

  async getContractTemplate(id: number): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
    return template;
  }

  async getContractTemplateByType(type: string): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates)
      .where(and(eq(contractTemplates.type, type), eq(contractTemplates.isActive, true)))
      .orderBy(desc(contractTemplates.createdAt));
    return template;
  }

  async createContractTemplate(template: InsertContractTemplate): Promise<ContractTemplate> {
    const [newTemplate] = await db.insert(contractTemplates).values(template).returning();
    return newTemplate;
  }

  async updateContractTemplate(id: number, template: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined> {
    const [updated] = await db
      .update(contractTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(contractTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteContractTemplate(id: number): Promise<boolean> {
    await db.delete(contractTemplates).where(eq(contractTemplates.id, id));
    return true;
  }

  // Contract Agreement operations
  async getContractAgreements(companyId?: number): Promise<ContractAgreement[]> {
    if (companyId) {
      return db.select().from(contractAgreements)
        .where(eq(contractAgreements.companyId, companyId))
        .orderBy(desc(contractAgreements.createdAt));
    }
    return db.select().from(contractAgreements).orderBy(desc(contractAgreements.createdAt));
  }

  async getContractAgreement(id: number): Promise<ContractAgreement | undefined> {
    const [agreement] = await db.select().from(contractAgreements).where(eq(contractAgreements.id, id));
    return agreement;
  }

  async getContractAgreementsByCompany(companyId: number): Promise<ContractAgreement[]> {
    return db.select().from(contractAgreements)
      .where(eq(contractAgreements.companyId, companyId))
      .orderBy(desc(contractAgreements.createdAt));
  }

  async createContractAgreement(agreement: InsertContractAgreement): Promise<ContractAgreement> {
    const [newAgreement] = await db.insert(contractAgreements).values(agreement).returning();
    return newAgreement;
  }

  async updateContractAgreement(id: number, agreement: Partial<InsertContractAgreement>): Promise<ContractAgreement | undefined> {
    const [updated] = await db
      .update(contractAgreements)
      .set({ ...agreement, updatedAt: new Date() })
      .where(eq(contractAgreements.id, id))
      .returning();
    return updated;
  }

  async deleteContractAgreement(id: number): Promise<boolean> {
    await db.delete(contractAgreements).where(eq(contractAgreements.id, id));
    return true;
  }

  // Contract Signature operations
  async getContractSignatures(agreementId: number): Promise<ContractSignature[]> {
    return db.select().from(contractSignatures)
      .where(eq(contractSignatures.agreementId, agreementId))
      .orderBy(contractSignatures.createdAt);
  }

  async createContractSignature(signature: InsertContractSignature): Promise<ContractSignature> {
    const [newSignature] = await db.insert(contractSignatures).values(signature).returning();
    return newSignature;
  }

  async updateContractSignature(id: number, signature: Partial<InsertContractSignature>): Promise<ContractSignature | undefined> {
    const [updated] = await db
      .update(contractSignatures)
      .set(signature)
      .where(eq(contractSignatures.id, id))
      .returning();
    return updated;
  }

  // ============================================
  // CHECKLIST TEMPLATE LIBRARY
  // ============================================

  async getChecklistTemplates(segment?: string): Promise<ChecklistTemplate[]> {
    if (segment) {
      return db.select().from(checklistTemplates)
        .where(and(
          eq(checklistTemplates.isActive, true),
          eq(checklistTemplates.segment, segment)
        ))
        .orderBy(checklistTemplates.name);
    }
    return db.select().from(checklistTemplates)
      .where(eq(checklistTemplates.isActive, true))
      .orderBy(checklistTemplates.segment, checklistTemplates.name);
  }

  async getChecklistTemplate(id: number): Promise<ChecklistTemplate | undefined> {
    const [template] = await db.select().from(checklistTemplates)
      .where(eq(checklistTemplates.id, id));
    return template;
  }

  async getChecklistTemplateSegments(): Promise<string[]> {
    const results = await db.selectDistinct({ segment: checklistTemplates.segment })
      .from(checklistTemplates)
      .where(eq(checklistTemplates.isActive, true))
      .orderBy(checklistTemplates.segment);
    return results.map(r => r.segment);
  }

  async createChecklistTemplate(template: InsertChecklistTemplate): Promise<ChecklistTemplate> {
    const [newTemplate] = await db.insert(checklistTemplates).values(template).returning();
    return newTemplate;
  }

  async updateChecklistTemplate(id: number, template: Partial<InsertChecklistTemplate>): Promise<ChecklistTemplate | undefined> {
    const [updated] = await db
      .update(checklistTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(checklistTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteChecklistTemplate(id: number): Promise<boolean> {
    await db.update(checklistTemplates)
      .set({ isActive: false })
      .where(eq(checklistTemplates.id, id));
    return true;
  }

  // Checklist Template Purchase operations
  async getChecklistTemplatePurchases(userId: string): Promise<ChecklistTemplatePurchase[]> {
    return db.select().from(checklistTemplatePurchases)
      .where(eq(checklistTemplatePurchases.userId, userId))
      .orderBy(desc(checklistTemplatePurchases.createdAt));
  }

  async getChecklistTemplatePurchaseByTemplateAndUser(templateId: number, userId: string): Promise<ChecklistTemplatePurchase | undefined> {
    const [purchase] = await db.select().from(checklistTemplatePurchases)
      .where(and(
        eq(checklistTemplatePurchases.templateId, templateId),
        eq(checklistTemplatePurchases.userId, userId)
      ));
    return purchase;
  }

  async createChecklistTemplatePurchase(purchase: InsertChecklistTemplatePurchase): Promise<ChecklistTemplatePurchase> {
    const [newPurchase] = await db.insert(checklistTemplatePurchases).values(purchase).returning();
    return newPurchase;
  }

  async updateChecklistTemplatePurchase(id: number, purchase: Partial<InsertChecklistTemplatePurchase>): Promise<ChecklistTemplatePurchase | undefined> {
    const [updated] = await db
      .update(checklistTemplatePurchases)
      .set(purchase)
      .where(eq(checklistTemplatePurchases.id, id))
      .returning();
    return updated;
  }

  // Diagnostic Lead operations
  async getDiagnosticLeads(): Promise<DiagnosticLead[]> {
    return db.select().from(diagnosticLeads).orderBy(desc(diagnosticLeads.createdAt));
  }

  async getDiagnosticLead(id: number): Promise<DiagnosticLead | undefined> {
    const [lead] = await db.select().from(diagnosticLeads).where(eq(diagnosticLeads.id, id));
    return lead;
  }

  async createDiagnosticLead(lead: InsertDiagnosticLead): Promise<DiagnosticLead> {
    const [newLead] = await db.insert(diagnosticLeads).values(lead).returning();
    return newLead;
  }

  async updateDiagnosticLead(id: number, lead: Partial<InsertDiagnosticLead>): Promise<DiagnosticLead | undefined> {
    const [updated] = await db
      .update(diagnosticLeads)
      .set({ ...lead, updatedAt: new Date() })
      .where(eq(diagnosticLeads.id, id))
      .returning();
    return updated;
  }

  async deleteDiagnosticLead(id: number): Promise<boolean> {
    await db.delete(diagnosticLeads).where(eq(diagnosticLeads.id, id));
    return true;
  }

  // ==========================================
  // FINANCIAL MODULE - DRE, Cost Centers, Banks
  // ==========================================

  // DRE Accounts
  async getDreAccounts(): Promise<DreAccount[]> {
    return db.select().from(dreAccounts).orderBy(dreAccounts.code);
  }

  async createDreAccount(account: InsertDreAccount): Promise<DreAccount> {
    const [newAccount] = await db.insert(dreAccounts).values(account).returning();
    return newAccount;
  }

  async updateDreAccount(id: number, account: Partial<InsertDreAccount>): Promise<DreAccount | undefined> {
    const [updated] = await db
      .update(dreAccounts)
      .set(account)
      .where(eq(dreAccounts.id, id))
      .returning();
    return updated;
  }

  async deleteDreAccount(id: number): Promise<boolean> {
    await db.delete(dreAccounts).where(eq(dreAccounts.id, id));
    return true;
  }

  async seedDefaultDreAccounts(): Promise<void> {
    const defaultAccounts = [
      { code: "1", name: "RECEITA BRUTA", nature: "receita", level: 1 },
      { code: "1.1", name: "Receita de Servicos", nature: "receita", level: 2 },
      { code: "1.1.1", name: "Consultoria", nature: "receita", level: 3 },
      { code: "1.1.2", name: "Licencas de Software", nature: "receita", level: 3 },
      { code: "1.1.3", name: "Treinamentos", nature: "receita", level: 3 },
      { code: "2", name: "(-) DEDUCOES DA RECEITA", nature: "custo", level: 1 },
      { code: "2.1", name: "Impostos sobre Servicos", nature: "custo", level: 2 },
      { code: "2.1.1", name: "ISS", nature: "custo", level: 3 },
      { code: "2.1.2", name: "PIS", nature: "custo", level: 3 },
      { code: "2.1.3", name: "COFINS", nature: "custo", level: 3 },
      { code: "3", name: "CUSTOS DOS SERVICOS PRESTADOS", nature: "custo", level: 1 },
      { code: "3.1", name: "Custos Diretos", nature: "custo", level: 2 },
      { code: "3.1.1", name: "Mao de Obra Direta", nature: "custo", level: 3 },
      { code: "3.1.2", name: "Materiais e Insumos", nature: "custo", level: 3 },
      { code: "4", name: "DESPESAS OPERACIONAIS", nature: "despesa", level: 1 },
      { code: "4.1", name: "Despesas Administrativas", nature: "despesa", level: 2 },
      { code: "4.1.1", name: "Salarios e Encargos", nature: "despesa", level: 3 },
      { code: "4.1.2", name: "Aluguel e Condominio", nature: "despesa", level: 3 },
      { code: "4.1.3", name: "Energia e Telecom", nature: "despesa", level: 3 },
      { code: "4.1.4", name: "Servicos de Terceiros", nature: "despesa", level: 3 },
      { code: "4.2", name: "Despesas Comerciais", nature: "despesa", level: 2 },
      { code: "4.2.1", name: "Marketing e Publicidade", nature: "despesa", level: 3 },
      { code: "4.2.2", name: "Comissoes de Vendas", nature: "despesa", level: 3 },
      { code: "4.3", name: "Despesas Financeiras", nature: "despesa", level: 2 },
      { code: "4.3.1", name: "Juros e Multas", nature: "despesa", level: 3 },
      { code: "4.3.2", name: "Tarifas Bancarias", nature: "despesa", level: 3 },
      { code: "5", name: "RESULTADO ANTES DO IR/CSLL", nature: "receita", level: 1 },
      { code: "6", name: "(-) IR/CSLL", nature: "custo", level: 1 },
      { code: "7", name: "RESULTADO LIQUIDO", nature: "receita", level: 1 },
    ];

    // Build parent ID mapping
    const insertedAccounts: Record<string, number> = {};
    
    for (const acc of defaultAccounts) {
      const parentCode = acc.code.includes(".") ? acc.code.split(".").slice(0, -1).join(".") : null;
      const parentId = parentCode ? insertedAccounts[parentCode] : null;
      
      const [inserted] = await db.insert(dreAccounts).values({
        ...acc,
        parentId,
      }).returning();
      
      insertedAccounts[acc.code] = inserted.id;
    }
  }

  // Cost Centers
  async getCostCenters(): Promise<CostCenter[]> {
    return db.select().from(costCenters).orderBy(costCenters.code);
  }

  async createCostCenter(center: InsertCostCenter): Promise<CostCenter> {
    const [newCenter] = await db.insert(costCenters).values(center).returning();
    return newCenter;
  }

  async updateCostCenter(id: number, center: Partial<InsertCostCenter>): Promise<CostCenter | undefined> {
    const [updated] = await db
      .update(costCenters)
      .set(center)
      .where(eq(costCenters.id, id))
      .returning();
    return updated;
  }

  async deleteCostCenter(id: number): Promise<boolean> {
    await db.delete(costCenters).where(eq(costCenters.id, id));
    return true;
  }

  async seedDefaultCostCenters(): Promise<void> {
    const defaultCenters = [
      { code: "ADM", name: "Administrativo", type: "administrativo" },
      { code: "ADM.01", name: "Recursos Humanos", type: "administrativo" },
      { code: "ADM.02", name: "Financeiro", type: "administrativo" },
      { code: "ADM.03", name: "Juridico", type: "administrativo" },
      { code: "COM", name: "Comercial", type: "comercial" },
      { code: "COM.01", name: "Vendas", type: "comercial" },
      { code: "COM.02", name: "Marketing", type: "comercial" },
      { code: "COM.03", name: "Relacionamento", type: "comercial" },
      { code: "OPE", name: "Operacional", type: "operacional" },
      { code: "OPE.01", name: "Consultoria", type: "operacional" },
      { code: "OPE.02", name: "Implantacao", type: "operacional" },
      { code: "OPE.03", name: "Suporte", type: "operacional" },
      { code: "PRJ", name: "Projetos", type: "projeto" },
      { code: "PRJ.01", name: "Desenvolvimento MCG", type: "projeto" },
      { code: "PRJ.02", name: "Parcerias", type: "projeto" },
    ];

    const insertedCenters: Record<string, number> = {};
    
    for (const center of defaultCenters) {
      const parentCode = center.code.includes(".") ? center.code.split(".")[0] : null;
      const parentId = parentCode ? insertedCenters[parentCode] : null;
      
      const [inserted] = await db.insert(costCenters).values({
        ...center,
        parentId,
      }).returning();
      
      insertedCenters[center.code] = inserted.id;
    }
  }

  // Personal Cost Centers (ADMIN PF)
  async getPersonalCostCenters(userId: string): Promise<PersonalCostCenter[]> {
    return db.select().from(personalCostCenters)
      .where(eq(personalCostCenters.ownerUserId, userId))
      .orderBy(personalCostCenters.code);
  }

  async getPersonalCostCenter(id: number, userId: string): Promise<PersonalCostCenter | undefined> {
    const [center] = await db.select().from(personalCostCenters)
      .where(and(eq(personalCostCenters.id, id), eq(personalCostCenters.ownerUserId, userId)));
    return center;
  }

  async createPersonalCostCenter(center: InsertPersonalCostCenter): Promise<PersonalCostCenter> {
    const [newCenter] = await db.insert(personalCostCenters).values(center).returning();
    return newCenter;
  }

  async updatePersonalCostCenter(id: number, userId: string, center: Partial<InsertPersonalCostCenter>): Promise<PersonalCostCenter | undefined> {
    const [updated] = await db
      .update(personalCostCenters)
      .set(center)
      .where(and(eq(personalCostCenters.id, id), eq(personalCostCenters.ownerUserId, userId)))
      .returning();
    return updated;
  }

  async deletePersonalCostCenter(id: number, userId: string): Promise<boolean> {
    await db.delete(personalCostCenters)
      .where(and(eq(personalCostCenters.id, id), eq(personalCostCenters.ownerUserId, userId)));
    return true;
  }

  async seedPersonalCostCenters(userId: string): Promise<void> {
    const existing = await db.select().from(personalCostCenters)
      .where(eq(personalCostCenters.ownerUserId, userId));
    if (existing.length > 0) return;

    const defaultCenters = [
      { code: "BAN", name: "Bancos", type: "bancos" },
      { code: "BAN.01", name: "Conta Corrente", type: "bancos" },
      { code: "BAN.02", name: "Poupanca", type: "bancos" },
      { code: "SAU", name: "Saude", type: "saude" },
      { code: "SAU.01", name: "Plano de Saude", type: "saude" },
      { code: "SAU.02", name: "Medicamentos", type: "saude" },
      { code: "ALI", name: "Alimentacao", type: "alimentacao" },
      { code: "ALI.01", name: "Supermercado", type: "alimentacao" },
      { code: "ALI.02", name: "Restaurantes", type: "alimentacao" },
      { code: "TRA", name: "Transporte", type: "transporte" },
      { code: "TRA.01", name: "Combustivel", type: "transporte" },
      { code: "TRA.02", name: "Manutencao Veiculo", type: "transporte" },
      { code: "MOR", name: "Moradia", type: "moradia" },
      { code: "MOR.01", name: "Aluguel/Financiamento", type: "moradia" },
      { code: "MOR.02", name: "Condominio", type: "moradia" },
      { code: "MOR.03", name: "Agua/Luz/Gas", type: "moradia" },
      { code: "EDU", name: "Educacao", type: "educacao" },
      { code: "EDU.01", name: "Cursos", type: "educacao" },
      { code: "EDU.02", name: "Livros", type: "educacao" },
      { code: "VES", name: "Vestuario", type: "vestuario" },
      { code: "VES.01", name: "Roupas", type: "vestuario" },
      { code: "VES.02", name: "Calcados", type: "vestuario" },
      { code: "LAZ", name: "Lazer", type: "lazer" },
      { code: "LAZ.01", name: "Viagens", type: "lazer" },
      { code: "LAZ.02", name: "Entretenimento", type: "lazer" },
      { code: "INV", name: "Investimentos", type: "investimentos" },
      { code: "INV.01", name: "Renda Fixa", type: "investimentos" },
      { code: "INV.02", name: "Renda Variavel", type: "investimentos" },
    ];

    const insertedCenters: Record<string, number> = {};
    
    for (const center of defaultCenters) {
      const parentCode = center.code.includes(".") ? center.code.split(".")[0] : null;
      const parentId = parentCode ? insertedCenters[parentCode] : null;
      
      const [inserted] = await db.insert(personalCostCenters).values({
        ...center,
        ownerUserId: userId,
        parentId,
      }).returning();
      
      insertedCenters[center.code] = inserted.id;
    }
  }

  // Bank Accounts
  async getBankAccounts(): Promise<BankAccount[]> {
    return db.select().from(bankAccounts).orderBy(desc(bankAccounts.isMain), bankAccounts.bankName);
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const [newAccount] = await db.insert(bankAccounts).values(account).returning();
    return newAccount;
  }

  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const [updated] = await db
      .update(bankAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(bankAccounts.id, id))
      .returning();
    return updated;
  }

  async deleteBankAccount(id: number): Promise<boolean> {
    await db.delete(bankAccounts).where(eq(bankAccounts.id, id));
    return true;
  }

  // Digital Certificates
  async getDigitalCertificates(): Promise<DigitalCertificate[]> {
    return db.select().from(digitalCertificates).orderBy(desc(digitalCertificates.isActive), digitalCertificates.name);
  }

  async createDigitalCertificate(cert: InsertDigitalCertificate): Promise<DigitalCertificate> {
    const [newCert] = await db.insert(digitalCertificates).values(cert).returning();
    return newCert;
  }

  async deleteDigitalCertificate(id: number): Promise<boolean> {
    await db.delete(digitalCertificates).where(eq(digitalCertificates.id, id));
    return true;
  }

  // Accounting Entries
  async getAccountingEntries(filters?: { startDate?: string; endDate?: string; dreAccountId?: number; costCenterId?: number }): Promise<AccountingEntry[]> {
    let query = db.select().from(accountingEntries);
    
    const conditions = [];
    if (filters?.dreAccountId) {
      conditions.push(eq(accountingEntries.dreAccountId, filters.dreAccountId));
    }
    if (filters?.costCenterId) {
      conditions.push(eq(accountingEntries.costCenterId, filters.costCenterId));
    }
    if (filters?.startDate) {
      conditions.push(gte(accountingEntries.competenceDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(accountingEntries.competenceDate, filters.endDate));
    }
    
    if (conditions.length > 0) {
      return db.select().from(accountingEntries).where(and(...conditions)).orderBy(desc(accountingEntries.competenceDate));
    }
    
    return db.select().from(accountingEntries).orderBy(desc(accountingEntries.competenceDate));
  }

  async getAccountingEntry(id: number): Promise<AccountingEntry | undefined> {
    const [entry] = await db.select().from(accountingEntries).where(eq(accountingEntries.id, id));
    return entry;
  }

  async createAccountingEntry(entry: InsertAccountingEntry): Promise<AccountingEntry> {
    const [newEntry] = await db.insert(accountingEntries).values(entry).returning();
    return newEntry;
  }

  async updateAccountingEntry(id: number, entry: Partial<InsertAccountingEntry>): Promise<AccountingEntry | undefined> {
    const [updated] = await db
      .update(accountingEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(accountingEntries.id, id))
      .returning();
    return updated;
  }

  async deleteAccountingEntry(id: number): Promise<boolean> {
    await db.delete(accountingEntries).where(eq(accountingEntries.id, id));
    return true;
  }

  // Bank Integrations
  async getBankIntegrations(): Promise<BankIntegration[]> {
    return db.select().from(bankIntegrations).orderBy(desc(bankIntegrations.isActive));
  }

  async getBankIntegration(id: number): Promise<BankIntegration | undefined> {
    const [integration] = await db.select().from(bankIntegrations).where(eq(bankIntegrations.id, id));
    return integration;
  }

  async createBankIntegration(integration: InsertBankIntegration): Promise<BankIntegration> {
    const [newIntegration] = await db.insert(bankIntegrations).values(integration).returning();
    return newIntegration;
  }

  async updateBankIntegration(id: number, integration: Partial<InsertBankIntegration>): Promise<BankIntegration | undefined> {
    const [updated] = await db
      .update(bankIntegrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(bankIntegrations.id, id))
      .returning();
    return updated;
  }

  async deleteBankIntegration(id: number): Promise<boolean> {
    await db.delete(bankIntegrations).where(eq(bankIntegrations.id, id));
    return true;
  }

  // Bank Transactions
  async getBankTransactions(bankAccountId?: number): Promise<BankTransaction[]> {
    if (bankAccountId) {
      return db.select().from(bankTransactions).where(eq(bankTransactions.bankAccountId, bankAccountId)).orderBy(desc(bankTransactions.transactionDate));
    }
    return db.select().from(bankTransactions).orderBy(desc(bankTransactions.transactionDate));
  }

  async createBankTransaction(transaction: InsertBankTransaction): Promise<BankTransaction | null> {
    try {
      const [newTransaction] = await db.insert(bankTransactions).values(transaction).returning();
      return newTransaction;
    } catch (error: any) {
      // Handle unique constraint violation (duplicate externalId for bankAccountId)
      if (error?.code === "23505" || error?.message?.includes("unique constraint")) {
        console.log(`[Storage] Duplicate bank transaction detected: ${transaction.externalId}`);
        return null;
      }
      throw error;
    }
  }

  async reconcileBankTransaction(id: number, accountingEntryId: number): Promise<BankTransaction | undefined> {
    const [updated] = await db
      .update(bankTransactions)
      .set({ 
        accountingEntryId, 
        reconciled: true, 
        reconciledAt: new Date() 
      })
      .where(eq(bankTransactions.id, id))
      .returning();
    return updated;
  }

  // Store Product Categories
  async getStoreProductCategories(): Promise<StoreProductCategory[]> {
    return db.select().from(storeProductCategories).orderBy(storeProductCategories.displayOrder);
  }

  async getStoreProductCategory(id: number): Promise<StoreProductCategory | undefined> {
    const [category] = await db.select().from(storeProductCategories).where(eq(storeProductCategories.id, id));
    return category;
  }

  async createStoreProductCategory(category: InsertStoreProductCategory): Promise<StoreProductCategory> {
    const [newCategory] = await db.insert(storeProductCategories).values(category).returning();
    return newCategory;
  }

  async updateStoreProductCategory(id: number, category: Partial<InsertStoreProductCategory>): Promise<StoreProductCategory | undefined> {
    const [updated] = await db
      .update(storeProductCategories)
      .set(category)
      .where(eq(storeProductCategories.id, id))
      .returning();
    return updated;
  }

  async deleteStoreProductCategory(id: number): Promise<boolean> {
    await db.delete(storeProductCategories).where(eq(storeProductCategories.id, id));
    return true;
  }

  // Store Products
  async getStoreProducts(options?: { categoryId?: number; isActive?: boolean; productType?: string }): Promise<StoreProduct[]> {
    let query = db.select().from(storeProducts);
    const conditions = [];
    
    if (options?.categoryId) {
      conditions.push(eq(storeProducts.categoryId, options.categoryId));
    }
    if (options?.isActive !== undefined) {
      conditions.push(eq(storeProducts.isActive, options.isActive));
    }
    if (options?.productType) {
      conditions.push(eq(storeProducts.productType, options.productType));
    }
    
    if (conditions.length > 0) {
      return db.select().from(storeProducts).where(and(...conditions)).orderBy(desc(storeProducts.createdAt));
    }
    return db.select().from(storeProducts).orderBy(desc(storeProducts.createdAt));
  }

  async getStoreProduct(id: number): Promise<StoreProduct | undefined> {
    const [product] = await db.select().from(storeProducts).where(eq(storeProducts.id, id));
    return product;
  }

  async getStoreProductBySlug(slug: string): Promise<StoreProduct | undefined> {
    const [product] = await db.select().from(storeProducts).where(eq(storeProducts.slug, slug));
    return product;
  }

  async createStoreProduct(product: InsertStoreProduct): Promise<StoreProduct> {
    const [newProduct] = await db.insert(storeProducts).values(product).returning();
    return newProduct;
  }

  async updateStoreProduct(id: number, product: Partial<InsertStoreProduct>): Promise<StoreProduct | undefined> {
    const [updated] = await db
      .update(storeProducts)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(storeProducts.id, id))
      .returning();
    return updated;
  }

  async deleteStoreProduct(id: number): Promise<boolean> {
    await db.delete(storeProducts).where(eq(storeProducts.id, id));
    return true;
  }

  // E-book Volumes
  async getEbookVolumes(productId?: number): Promise<EbookVolume[]> {
    if (productId) {
      return db.select().from(ebookVolumes).where(eq(ebookVolumes.productId, productId)).orderBy(ebookVolumes.volumeNumber);
    }
    return db.select().from(ebookVolumes).orderBy(ebookVolumes.volumeNumber);
  }

  async getEbookVolume(id: number): Promise<EbookVolume | undefined> {
    const [volume] = await db.select().from(ebookVolumes).where(eq(ebookVolumes.id, id));
    return volume;
  }

  async createEbookVolume(volume: InsertEbookVolume): Promise<EbookVolume> {
    const [newVolume] = await db.insert(ebookVolumes).values(volume).returning();
    return newVolume;
  }

  async updateEbookVolume(id: number, volume: Partial<InsertEbookVolume>): Promise<EbookVolume | undefined> {
    const [updated] = await db
      .update(ebookVolumes)
      .set({ ...volume, updatedAt: new Date() })
      .where(eq(ebookVolumes.id, id))
      .returning();
    return updated;
  }

  async deleteEbookVolume(id: number): Promise<boolean> {
    await db.delete(ebookVolumes).where(eq(ebookVolumes.id, id));
    return true;
  }

  // Store Orders
  async getStoreOrders(options?: { companyId?: number; userId?: string; status?: string }): Promise<StoreOrder[]> {
    const conditions = [];
    
    if (options?.companyId) {
      conditions.push(eq(storeOrders.companyId, options.companyId));
    }
    if (options?.userId) {
      conditions.push(eq(storeOrders.userId, options.userId));
    }
    if (options?.status) {
      conditions.push(eq(storeOrders.status, options.status));
    }
    
    if (conditions.length > 0) {
      return db.select().from(storeOrders).where(and(...conditions)).orderBy(desc(storeOrders.createdAt));
    }
    return db.select().from(storeOrders).orderBy(desc(storeOrders.createdAt));
  }

  async getStoreOrder(id: number): Promise<StoreOrder | undefined> {
    const [order] = await db.select().from(storeOrders).where(eq(storeOrders.id, id));
    return order;
  }

  async getStoreOrderByNumber(orderNumber: string): Promise<StoreOrder | undefined> {
    const [order] = await db.select().from(storeOrders).where(eq(storeOrders.orderNumber, orderNumber));
    return order;
  }

  async createStoreOrder(order: InsertStoreOrder): Promise<StoreOrder> {
    const [newOrder] = await db.insert(storeOrders).values(order).returning();
    return newOrder;
  }

  async updateStoreOrder(id: number, order: Partial<InsertStoreOrder>): Promise<StoreOrder | undefined> {
    const [updated] = await db
      .update(storeOrders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(storeOrders.id, id))
      .returning();
    return updated;
  }

  // Store Order Items
  async getStoreOrderItems(orderId: number): Promise<StoreOrderItem[]> {
    return db.select().from(storeOrderItems).where(eq(storeOrderItems.orderId, orderId));
  }

  async createStoreOrderItem(item: InsertStoreOrderItem): Promise<StoreOrderItem> {
    const [newItem] = await db.insert(storeOrderItems).values(item).returning();
    return newItem;
  }

  // Audit Log operations
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  async getAuditLogs(companyId: number, options?: { userId?: string; action?: string; limit?: number; offset?: number }): Promise<AuditLog[]> {
    const conditions = [eq(auditLogs.companyId, companyId)];
    if (options?.userId) {
      conditions.push(eq(auditLogs.userId, options.userId));
    }
    if (options?.action) {
      conditions.push(eq(auditLogs.action, options.action));
    }
    
    let query = db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt));
    
    if (options?.limit) {
      query = query.limit(options.limit) as typeof query;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as typeof query;
    }
    
    return query;
  }

  async getAuditLogsByUser(companyId: number, userId: string): Promise<AuditLog[]> {
    return db.select().from(auditLogs)
      .where(and(eq(auditLogs.companyId, companyId), eq(auditLogs.userId, userId)))
      .orderBy(desc(auditLogs.createdAt));
  }

  // WhatsApp Support Journey operations
  async getWhatsappJourneySteps(): Promise<WhatsappJourneyStep[]> {
    return db.select().from(whatsappJourneySteps).orderBy(whatsappJourneySteps.order);
  }

  async getWhatsappJourneyStep(id: number): Promise<WhatsappJourneyStep | undefined> {
    const [step] = await db.select().from(whatsappJourneySteps).where(eq(whatsappJourneySteps.id, id));
    return step;
  }

  async createWhatsappJourneyStep(step: InsertWhatsappJourneyStep): Promise<WhatsappJourneyStep> {
    const [newStep] = await db.insert(whatsappJourneySteps).values(step).returning();
    return newStep;
  }

  async updateWhatsappJourneyStep(id: number, step: Partial<InsertWhatsappJourneyStep>): Promise<WhatsappJourneyStep | undefined> {
    const [updated] = await db
      .update(whatsappJourneySteps)
      .set({ ...step, updatedAt: new Date() })
      .where(eq(whatsappJourneySteps.id, id))
      .returning();
    return updated;
  }

  async deleteWhatsappJourneyStep(id: number): Promise<boolean> {
    await db.delete(whatsappJourneySteps).where(eq(whatsappJourneySteps.id, id));
    return true;
  }

  async getWhatsappConfig(): Promise<WhatsappConfig | undefined> {
    const [config] = await db.select().from(whatsappConfig).limit(1);
    return config;
  }

  async createWhatsappConfig(config: InsertWhatsappConfig): Promise<WhatsappConfig> {
    const [newConfig] = await db.insert(whatsappConfig).values(config).returning();
    return newConfig;
  }

  async updateWhatsappConfig(id: number, config: Partial<InsertWhatsappConfig>): Promise<WhatsappConfig | undefined> {
    const [updated] = await db
      .update(whatsappConfig)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(whatsappConfig.id, id))
      .returning();
    return updated;
  }

  async getWhatsappAgents(): Promise<WhatsappAgent[]> {
    return db.select().from(whatsappAgents).orderBy(whatsappAgents.name);
  }

  async createWhatsappAgent(agent: InsertWhatsappAgent): Promise<WhatsappAgent> {
    const [newAgent] = await db.insert(whatsappAgents).values(agent).returning();
    return newAgent;
  }

  async updateWhatsappAgent(id: number, agent: Partial<InsertWhatsappAgent>): Promise<WhatsappAgent | undefined> {
    const [updated] = await db
      .update(whatsappAgents)
      .set({ ...agent, updatedAt: new Date() })
      .where(eq(whatsappAgents.id, id))
      .returning();
    return updated;
  }

  async deleteWhatsappAgent(id: number): Promise<boolean> {
    await db.delete(whatsappAgents).where(eq(whatsappAgents.id, id));
    return true;
  }

  async getWhatsappConversations(): Promise<WhatsappConversation[]> {
    return db.select().from(whatsappConversations).orderBy(desc(whatsappConversations.lastMessageAt));
  }

  async createWhatsappConversation(conversation: InsertWhatsappConversation): Promise<WhatsappConversation> {
    const [newConv] = await db.insert(whatsappConversations).values(conversation).returning();
    return newConv;
  }

  async updateWhatsappConversation(id: number, conversation: Partial<InsertWhatsappConversation>): Promise<WhatsappConversation | undefined> {
    const [updated] = await db
      .update(whatsappConversations)
      .set({ ...conversation, updatedAt: new Date() })
      .where(eq(whatsappConversations.id, id))
      .returning();
    return updated;
  }

  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const [newMsg] = await db.insert(whatsappMessages).values(message).returning();
    return newMsg;
  }

  async getWhatsappMessages(conversationId: number): Promise<WhatsappMessage[]> {
    return db.select().from(whatsappMessages)
      .where(eq(whatsappMessages.conversationId, conversationId))
      .orderBy(whatsappMessages.createdAt);
  }

  // ==================== Personal Finance Operations ====================
  
  async getPersonalCategories(userId: string): Promise<PersonalCategory[]> {
    return db.select().from(personalCategories)
      .where(eq(personalCategories.userId, userId))
      .orderBy(personalCategories.name);
  }

  async createPersonalCategory(category: InsertPersonalCategory): Promise<PersonalCategory> {
    const [newCategory] = await db.insert(personalCategories).values(category).returning();
    return newCategory;
  }

  async updatePersonalCategory(id: number, category: Partial<InsertPersonalCategory>): Promise<PersonalCategory | undefined> {
    const [updated] = await db.update(personalCategories)
      .set(category)
      .where(eq(personalCategories.id, id))
      .returning();
    return updated;
  }

  async deletePersonalCategory(id: number): Promise<boolean> {
    await db.delete(personalCategories).where(eq(personalCategories.id, id));
    return true;
  }

  async getPersonalAccounts(userId: string): Promise<PersonalAccount[]> {
    return db.select().from(personalAccounts)
      .where(eq(personalAccounts.userId, userId))
      .orderBy(personalAccounts.name);
  }

  async createPersonalAccount(account: InsertPersonalAccount): Promise<PersonalAccount> {
    const [newAccount] = await db.insert(personalAccounts).values(account).returning();
    return newAccount;
  }

  async updatePersonalAccount(id: number, account: Partial<InsertPersonalAccount>): Promise<PersonalAccount | undefined> {
    const [updated] = await db.update(personalAccounts)
      .set({ ...account, updatedAt: new Date() })
      .where(eq(personalAccounts.id, id))
      .returning();
    return updated;
  }

  async deletePersonalAccount(id: number): Promise<boolean> {
    await db.delete(personalAccounts).where(eq(personalAccounts.id, id));
    return true;
  }

  async getPersonalTransactions(userId: string, filters?: { accountId?: number; startDate?: string; endDate?: string }): Promise<PersonalTransaction[]> {
    const conditions = [eq(personalTransactions.userId, userId)];
    if (filters?.accountId) conditions.push(eq(personalTransactions.accountId, filters.accountId));
    if (filters?.startDate) conditions.push(gte(personalTransactions.date, filters.startDate));
    if (filters?.endDate) conditions.push(lte(personalTransactions.date, filters.endDate));
    return db.select().from(personalTransactions)
      .where(and(...conditions))
      .orderBy(desc(personalTransactions.date));
  }

  async createPersonalTransaction(transaction: InsertPersonalTransaction): Promise<PersonalTransaction> {
    const [newTransaction] = await db.insert(personalTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updatePersonalTransaction(id: number, transaction: Partial<InsertPersonalTransaction>): Promise<PersonalTransaction | undefined> {
    const [updated] = await db.update(personalTransactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(personalTransactions.id, id))
      .returning();
    return updated;
  }

  async deletePersonalTransaction(id: number): Promise<boolean> {
    await db.delete(personalTransactions).where(eq(personalTransactions.id, id));
    return true;
  }

  // ==================== IRPF Operations ====================

  async getIrpfDeclarations(userId: string): Promise<IrpfDeclaration[]> {
    return db.select().from(irpfDeclarations)
      .where(eq(irpfDeclarations.userId, userId))
      .orderBy(desc(irpfDeclarations.year));
  }

  async getIrpfDeclaration(id: number): Promise<IrpfDeclaration | undefined> {
    const [declaration] = await db.select().from(irpfDeclarations).where(eq(irpfDeclarations.id, id));
    return declaration;
  }

  async createIrpfDeclaration(declaration: InsertIrpfDeclaration): Promise<IrpfDeclaration> {
    const [newDeclaration] = await db.insert(irpfDeclarations).values(declaration).returning();
    return newDeclaration;
  }

  async updateIrpfDeclaration(id: number, declaration: Partial<InsertIrpfDeclaration>): Promise<IrpfDeclaration | undefined> {
    const [updated] = await db.update(irpfDeclarations)
      .set({ ...declaration, updatedAt: new Date() })
      .where(eq(irpfDeclarations.id, id))
      .returning();
    return updated;
  }

  async deleteIrpfDeclaration(id: number): Promise<boolean> {
    await db.delete(irpfIncomes).where(eq(irpfIncomes.declarationId, id));
    await db.delete(irpfDeductions).where(eq(irpfDeductions.declarationId, id));
    await db.delete(irpfDependents).where(eq(irpfDependents.declarationId, id));
    await db.delete(irpfAssets).where(eq(irpfAssets.declarationId, id));
    await db.delete(irpfDeclarations).where(eq(irpfDeclarations.id, id));
    return true;
  }

  async getIrpfIncomes(declarationId: number): Promise<IrpfIncome[]> {
    return db.select().from(irpfIncomes).where(eq(irpfIncomes.declarationId, declarationId));
  }

  async createIrpfIncome(income: InsertIrpfIncome): Promise<IrpfIncome> {
    const [newIncome] = await db.insert(irpfIncomes).values(income).returning();
    return newIncome;
  }

  async updateIrpfIncome(id: number, income: Partial<InsertIrpfIncome>): Promise<IrpfIncome | undefined> {
    const [updated] = await db.update(irpfIncomes).set(income).where(eq(irpfIncomes.id, id)).returning();
    return updated;
  }

  async deleteIrpfIncome(id: number): Promise<boolean> {
    await db.delete(irpfIncomes).where(eq(irpfIncomes.id, id));
    return true;
  }

  async getIrpfDeductions(declarationId: number): Promise<IrpfDeduction[]> {
    return db.select().from(irpfDeductions).where(eq(irpfDeductions.declarationId, declarationId));
  }

  async createIrpfDeduction(deduction: InsertIrpfDeduction): Promise<IrpfDeduction> {
    const [newDeduction] = await db.insert(irpfDeductions).values(deduction).returning();
    return newDeduction;
  }

  async updateIrpfDeduction(id: number, deduction: Partial<InsertIrpfDeduction>): Promise<IrpfDeduction | undefined> {
    const [updated] = await db.update(irpfDeductions).set(deduction).where(eq(irpfDeductions.id, id)).returning();
    return updated;
  }

  async deleteIrpfDeduction(id: number): Promise<boolean> {
    await db.delete(irpfDeductions).where(eq(irpfDeductions.id, id));
    return true;
  }

  async getIrpfDependents(declarationId: number): Promise<IrpfDependent[]> {
    return db.select().from(irpfDependents).where(eq(irpfDependents.declarationId, declarationId));
  }

  async createIrpfDependent(dependent: InsertIrpfDependent): Promise<IrpfDependent> {
    const [newDependent] = await db.insert(irpfDependents).values(dependent).returning();
    return newDependent;
  }

  async updateIrpfDependent(id: number, dependent: Partial<InsertIrpfDependent>): Promise<IrpfDependent | undefined> {
    const [updated] = await db.update(irpfDependents).set(dependent).where(eq(irpfDependents.id, id)).returning();
    return updated;
  }

  async deleteIrpfDependent(id: number): Promise<boolean> {
    await db.delete(irpfDependents).where(eq(irpfDependents.id, id));
    return true;
  }

  async getIrpfAssets(declarationId: number): Promise<IrpfAsset[]> {
    return db.select().from(irpfAssets).where(eq(irpfAssets.declarationId, declarationId));
  }

  async createIrpfAsset(asset: InsertIrpfAsset): Promise<IrpfAsset> {
    const [newAsset] = await db.insert(irpfAssets).values(asset).returning();
    return newAsset;
  }

  async updateIrpfAsset(id: number, asset: Partial<InsertIrpfAsset>): Promise<IrpfAsset | undefined> {
    const [updated] = await db.update(irpfAssets).set(asset).where(eq(irpfAssets.id, id)).returning();
    return updated;
  }

  async deleteIrpfAsset(id: number): Promise<boolean> {
    await db.delete(irpfAssets).where(eq(irpfAssets.id, id));
    return true;
  }

  // ==================== IRPJ Operations ====================

  async getIrpjSummaries(): Promise<IrpjSummary[]> {
    return db.select().from(irpjSummaries).orderBy(desc(irpjSummaries.year));
  }

  async getIrpjSummary(id: number): Promise<IrpjSummary | undefined> {
    const [summary] = await db.select().from(irpjSummaries).where(eq(irpjSummaries.id, id));
    return summary;
  }

  async getIrpjSummaryByYear(year: number): Promise<IrpjSummary | undefined> {
    const [summary] = await db.select().from(irpjSummaries).where(eq(irpjSummaries.year, year));
    return summary;
  }

  async createIrpjSummary(summary: InsertIrpjSummary): Promise<IrpjSummary> {
    const [newSummary] = await db.insert(irpjSummaries).values(summary).returning();
    return newSummary;
  }

  async updateIrpjSummary(id: number, summary: Partial<InsertIrpjSummary>): Promise<IrpjSummary | undefined> {
    const [updated] = await db.update(irpjSummaries)
      .set({ ...summary, updatedAt: new Date() })
      .where(eq(irpjSummaries.id, id))
      .returning();
    return updated;
  }

  async deleteIrpjSummary(id: number): Promise<boolean> {
    await db.delete(irpjDasPayments).where(eq(irpjDasPayments.summaryId, id));
    await db.delete(irpjSummaries).where(eq(irpjSummaries.id, id));
    return true;
  }

  async getIrpjDasPayments(summaryId: number): Promise<IrpjDasPayment[]> {
    return db.select().from(irpjDasPayments)
      .where(eq(irpjDasPayments.summaryId, summaryId))
      .orderBy(irpjDasPayments.competenceMonth);
  }

  async createIrpjDasPayment(payment: InsertIrpjDasPayment): Promise<IrpjDasPayment> {
    const [newPayment] = await db.insert(irpjDasPayments).values(payment).returning();
    return newPayment;
  }

  async updateIrpjDasPayment(id: number, payment: Partial<InsertIrpjDasPayment>): Promise<IrpjDasPayment | undefined> {
    const [updated] = await db.update(irpjDasPayments).set(payment).where(eq(irpjDasPayments.id, id)).returning();
    return updated;
  }

  async deleteIrpjDasPayment(id: number): Promise<boolean> {
    await db.delete(irpjDasPayments).where(eq(irpjDasPayments.id, id));
    return true;
  }

  // ==================== Commercial Flowchart Operations ====================

  async getCommercialFlowchart(userId: string): Promise<CommercialFlowchart | undefined> {
    const [flowchart] = await db.select().from(commercialFlowcharts).where(eq(commercialFlowcharts.userId, userId));
    return flowchart;
  }

  async saveCommercialFlowchart(userId: string, nodes: any[], edges: any[]): Promise<CommercialFlowchart> {
    const existing = await this.getCommercialFlowchart(userId);
    if (existing) {
      const [updated] = await db.update(commercialFlowcharts)
        .set({ nodes, edges, updatedAt: new Date() })
        .where(eq(commercialFlowcharts.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(commercialFlowcharts)
        .values({ userId, nodes, edges })
        .returning();
      return created;
    }
  }

  // ==================== Consulting Quote Request Operations ====================

  async createConsultingQuoteRequest(data: InsertConsultingQuoteRequest): Promise<ConsultingQuoteRequest> {
    const [request] = await db.insert(consultingQuoteRequests).values(data).returning();
    return request;
  }

  async getConsultingQuoteRequests(): Promise<ConsultingQuoteRequest[]> {
    return db.select().from(consultingQuoteRequests).orderBy(desc(consultingQuoteRequests.createdAt));
  }

  async updateConsultingQuoteRequest(id: number, data: Partial<InsertConsultingQuoteRequest>): Promise<ConsultingQuoteRequest | undefined> {
    const [updated] = await db.update(consultingQuoteRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consultingQuoteRequests.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
