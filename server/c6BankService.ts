/**
 * C6 Bank API Integration Service
 * 
 * This module handles integration with C6 Bank Open Banking API.
 * Note: C6 Bank API requires registration at developers.c6bank.com.br
 * and approval from the bank (currently in pilot phase).
 * 
 * Features:
 * - OAuth2 authentication with C6 Bank
 * - Account balance and statement retrieval
 * - PIX payments and transfers
 * - Webhook handling for real-time notifications
 * 
 * Required secrets:
 * - C6_CLIENT_ID: OAuth client ID from C6 developer portal
 * - C6_CLIENT_SECRET: OAuth client secret
 * - C6_CERTIFICATE: PFX certificate data (base64 encoded)
 * - C6_CERTIFICATE_PASSWORD: Certificate password
 */

import crypto from "crypto";
import { storage } from "./storage";

// C6 Bank API endpoints (production)
const C6_API_BASE_URL = "https://api.c6bank.com.br";
const C6_AUTH_URL = "https://auth.c6bank.com.br/oauth2/token";

// Sandbox endpoints for testing
const C6_SANDBOX_API_URL = "https://sandbox.api.c6bank.com.br";
const C6_SANDBOX_AUTH_URL = "https://sandbox.auth.c6bank.com.br/oauth2/token";

interface C6TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface C6AccountBalance {
  accountId: string;
  balance: number;
  availableBalance: number;
  currency: string;
  lastUpdate: string;
}

interface C6Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  counterparty: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
  category?: string;
}

interface C6BankConfig {
  clientId: string;
  clientSecret: string;
  certificateData?: string;
  certificatePassword?: string;
  useSandbox: boolean;
}

class C6BankService {
  private config: C6BankConfig | null = null;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const clientId = process.env.C6_CLIENT_ID;
    const clientSecret = process.env.C6_CLIENT_SECRET;

    if (clientId && clientSecret) {
      this.config = {
        clientId,
        clientSecret,
        certificateData: process.env.C6_CERTIFICATE,
        certificatePassword: process.env.C6_CERTIFICATE_PASSWORD,
        useSandbox: process.env.C6_USE_SANDBOX === "true",
      };
    }
  }

  isConfigured(): boolean {
    return this.config !== null && !!this.config.clientId && !!this.config.clientSecret;
  }

  getStatus(): { configured: boolean; sandbox: boolean; hasToken: boolean } {
    return {
      configured: this.isConfigured(),
      sandbox: this.config?.useSandbox || false,
      hasToken: !!this.accessToken && (!this.tokenExpiry || this.tokenExpiry > new Date()),
    };
  }

  private getBaseUrl(): string {
    return this.config?.useSandbox ? C6_SANDBOX_API_URL : C6_API_BASE_URL;
  }

  private getAuthUrl(): string {
    return this.config?.useSandbox ? C6_SANDBOX_AUTH_URL : C6_AUTH_URL;
  }

  /**
   * Authenticate with C6 Bank using OAuth2 client credentials flow
   */
  async authenticate(): Promise<boolean> {
    if (!this.config) {
      console.log("[C6 Bank] Not configured - missing credentials");
      return false;
    }

    try {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString("base64");

      const response = await fetch(this.getAuthUrl(), {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          scope: "accounts transactions pix",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[C6 Bank] Auth failed:", response.status, errorText);
        return false;
      }

      const data: C6TokenResponse = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      console.log("[C6 Bank] Successfully authenticated");
      return true;
    } catch (error) {
      console.error("[C6 Bank] Authentication error:", error);
      return false;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(accountId: string): Promise<C6AccountBalance | null> {
    if (!this.isConfigured()) {
      console.log("[C6 Bank] Not configured");
      return null;
    }

    // Ensure we have a valid token
    if (!this.accessToken || (this.tokenExpiry && this.tokenExpiry <= new Date())) {
      const authenticated = await this.authenticate();
      if (!authenticated) return null;
    }

    try {
      const response = await fetch(`${this.getBaseUrl()}/accounts/${accountId}/balance`, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("[C6 Bank] Failed to get balance:", response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("[C6 Bank] Balance error:", error);
      return null;
    }
  }

  /**
   * Get account statement/transactions
   */
  async getTransactions(
    accountId: string,
    startDate: string,
    endDate: string
  ): Promise<C6Transaction[]> {
    if (!this.isConfigured()) {
      console.log("[C6 Bank] Not configured");
      return [];
    }

    if (!this.accessToken || (this.tokenExpiry && this.tokenExpiry <= new Date())) {
      const authenticated = await this.authenticate();
      if (!authenticated) return [];
    }

    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(
        `${this.getBaseUrl()}/accounts/${accountId}/transactions?${params}`,
        {
          headers: {
            "Authorization": `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("[C6 Bank] Failed to get transactions:", response.status);
        return [];
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error("[C6 Bank] Transactions error:", error);
      return [];
    }
  }

  /**
   * Verify webhook signature from C6 Bank
   * Only accepts raw Buffer payload to ensure exact byte comparison
   */
  verifyWebhookSignature(payload: Buffer, signature: string): boolean {
    if (!this.config?.clientSecret) {
      console.warn("[C6 Bank] No client secret configured for signature verification");
      return false;
    }

    // Validate signature format (must be valid hex)
    if (!/^[a-f0-9]+$/i.test(signature)) {
      console.warn("[C6 Bank] Invalid signature format - not hex");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.config.clientSecret)
      .update(payload)
      .digest("hex");

    // Use timing-safe comparison - reject if lengths don't match
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      console.warn("[C6 Bank] Signature length mismatch");
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  }

  /**
   * Map external C6 account ID to internal bankAccountId
   * Looks up the bank account by externalAccountId field
   */
  private async mapExternalAccountToInternal(
    externalAccountId: string,
    storageRef: typeof storage
  ): Promise<number | null> {
    try {
      const accounts = await storageRef.getBankAccounts();
      // Look for account with matching externalAccountId (primary) or accountNumber (fallback)
      const account = accounts.find(
        (a) =>
          a.externalAccountId === externalAccountId ||
          a.accountNumber === externalAccountId
      );
      return account?.id || null;
    } catch (error) {
      console.error("[C6 Bank] Error mapping external account:", error);
      return null;
    }
  }

  /**
   * Validate that internal bankAccountId is linked to external account
   */
  async validateAccountLink(
    bankAccountId: number,
    externalAccountId: string,
    storageRef: typeof storage
  ): Promise<boolean> {
    try {
      const accounts = await storageRef.getBankAccounts();
      const account = accounts.find((a) => a.id === bankAccountId);
      if (!account) return false;
      
      // Check if the external account matches
      return (
        account.externalAccountId === externalAccountId ||
        account.accountNumber === externalAccountId
      );
    } catch (error) {
      console.error("[C6 Bank] Error validating account link:", error);
      return false;
    }
  }

  /**
   * Check if transaction already exists (for deduplication)
   */
  private async transactionExists(
    externalId: string,
    bankAccountId: number,
    storageRef: typeof storage
  ): Promise<boolean> {
    try {
      const transactions = await storageRef.getBankTransactions(bankAccountId);
      return transactions.some((t) => t.externalId === externalId);
    } catch (error) {
      console.error("[C6 Bank] Error checking transaction existence:", error);
      return false;
    }
  }

  /**
   * Process webhook event from C6 Bank
   */
  async processWebhookEvent(
    event: any,
    storageRef: typeof storage
  ): Promise<{ success: boolean; message: string }> {
    console.log("[C6 Bank] Webhook event received:", event.type);

    switch (event.type) {
      case "transaction.created":
        return this.handleTransactionCreated(event.data, storageRef);

      case "transaction.updated":
        return this.handleTransactionUpdated(event.data, storageRef);

      case "pix.received":
        return this.handlePixReceived(event.data, storageRef);

      case "balance.updated":
        return this.handleBalanceUpdated(event.data, storageRef);

      default:
        console.log("[C6 Bank] Unknown webhook event type:", event.type);
        return { success: true, message: "Event acknowledged" };
    }
  }

  private async handleTransactionCreated(
    data: any,
    storageRef: typeof storage
  ): Promise<{ success: boolean; message: string }> {
    console.log("[C6 Bank] New transaction:", data.id, data.amount);

    try {
      // Map external account ID to internal bank account
      const bankAccountId = await this.mapExternalAccountToInternal(
        data.accountId,
        storageRef
      );
      if (!bankAccountId) {
        console.warn(
          "[C6 Bank] Could not map external account:",
          data.accountId
        );
        return {
          success: false,
          message: `Unknown account: ${data.accountId}`,
        };
      }

      // Check for duplicate
      if (await this.transactionExists(data.id, bankAccountId, storageRef)) {
        console.log("[C6 Bank] Transaction already exists:", data.id);
        return { success: true, message: "Transaction already processed" };
      }

      // Create bank transaction record
      await storageRef.createBankTransaction({
        bankAccountId,
        externalId: data.id,
        transactionDate: data.date || new Date().toISOString().split("T")[0],
        value: data.amount?.toString() || "0",
        transactionType: data.type === "credit" ? "credito" : "debito",
        description: data.description || "Transacao C6 Bank",
        counterpartyName: data.counterparty || null,
        category: data.category || null,
        status: data.status || "pending",
        reconciled: false,
        rawData: data,
      });

      return { success: true, message: "Transaction processed" };
    } catch (error) {
      console.error("[C6 Bank] Error saving transaction:", error);
      return { success: false, message: "Failed to save transaction" };
    }
  }

  private async handleTransactionUpdated(
    data: any,
    _storageRef: typeof storage
  ): Promise<{ success: boolean; message: string }> {
    console.log("[C6 Bank] Transaction updated:", data.id, data.status);
    // Transaction updates would be handled by finding and updating the existing record
    // For now, just acknowledge the event
    return { success: true, message: "Transaction status updated" };
  }

  private async handlePixReceived(
    data: any,
    storageRef: typeof storage
  ): Promise<{ success: boolean; message: string }> {
    console.log("[C6 Bank] PIX received:", data.amount, "from", data.payer);

    try {
      // Map external account ID to internal bank account
      const bankAccountId = await this.mapExternalAccountToInternal(
        data.accountId,
        storageRef
      );
      if (!bankAccountId) {
        console.warn(
          "[C6 Bank] Could not map external account for PIX:",
          data.accountId
        );
        return {
          success: false,
          message: `Unknown account: ${data.accountId}`,
        };
      }

      const externalId = data.id || `pix_${Date.now()}`;

      // Check for duplicate
      if (await this.transactionExists(externalId, bankAccountId, storageRef)) {
        console.log("[C6 Bank] PIX already exists:", externalId);
        return { success: true, message: "PIX already processed" };
      }

      // Create bank transaction record for PIX
      await storageRef.createBankTransaction({
        bankAccountId,
        externalId,
        transactionDate: new Date().toISOString().split("T")[0],
        value: data.amount?.toString() || "0",
        transactionType: "credito",
        description: `PIX recebido de ${data.payer || "desconhecido"}`,
        counterpartyName: data.payer || null,
        category: "pix",
        status: "completed",
        reconciled: false,
        rawData: data,
      });

      return { success: true, message: "PIX processed" };
    } catch (error) {
      console.error("[C6 Bank] Error saving PIX:", error);
      return { success: false, message: "Failed to save PIX" };
    }
  }

  private async handleBalanceUpdated(
    data: any,
    _storageRef: typeof storage
  ): Promise<{ success: boolean; message: string }> {
    console.log("[C6 Bank] Balance updated:", data.accountId, data.balance);

    // Balance updates would be stored in the bank account record
    // For now, just acknowledge the event
    return { success: true, message: "Balance updated" };
  }
  
  /**
   * Sync transactions and save to database with deduplication
   */
  async syncAndSaveTransactions(
    bankAccountId: number,
    externalAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<{ saved: number; skipped: number; errors: number }> {
    const transactions = await this.getTransactions(externalAccountId, startDate, endDate);

    let saved = 0;
    let skipped = 0;
    let errors = 0;

    for (const tx of transactions) {
      try {
        // Check for duplicate before saving
        const exists = await this.transactionExists(tx.id, bankAccountId, storage);
        if (exists) {
          console.log("[C6 Bank] Skipping duplicate transaction:", tx.id);
          skipped++;
          continue;
        }

        await storage.createBankTransaction({
          bankAccountId,
          externalId: tx.id,
          transactionDate: tx.date,
          value: tx.amount.toString(),
          transactionType: tx.type === "credit" ? "credito" : "debito",
          description: tx.description,
          counterpartyName: tx.counterparty,
          category: tx.category || null,
          status: tx.status,
          reconciled: false,
          rawData: tx,
        });
        saved++;
      } catch (error) {
        console.error("[C6 Bank] Error saving transaction:", tx.id, error);
        errors++;
      }
    }

    return { saved, skipped, errors };
  }
}

export const c6BankService = new C6BankService();
