import { storage } from "./storage";
import type { InsertAuditLog } from "@shared/schema";
import type { Request } from "express";

export type AuditAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "view" 
  | "export" 
  | "login" 
  | "logout"
  | "import"
  | "send_email"
  | "generate_pdf";

export type AuditEntityType = 
  | "client"
  | "checklist"
  | "meeting_record"
  | "commercial_event"
  | "task"
  | "project"
  | "proposal"
  | "financial_account"
  | "team_member"
  | "rfi"
  | "user"
  | "company"
  | "store_order"
  | "store_product";

export async function logAudit(
  req: any,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId?: string | number,
  description?: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;
    
    if (!userId || !companyId) {
      console.warn("Audit log skipped: missing userId or companyId");
      return;
    }

    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.get("User-Agent") || null;

    const logData: InsertAuditLog = {
      userId,
      companyId,
      action,
      entityType,
      entityId: entityId?.toString() || null,
      description: description || null,
      details: details || null,
      ipAddress,
      userAgent,
    };

    await storage.createAuditLog(logData);
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
