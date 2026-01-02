import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import type { RegisterData, LoginData, User } from "@shared/schema";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function registerUser(data: RegisterData): Promise<{ user: User; sessionToken: string } | { error: string }> {
  // Verificar email duplicado
  const existingUser = await storage.getUserByEmail(data.email);
  if (existingUser) {
    return { error: "Email já cadastrado" };
  }

  // Verificar CNPJ/CPF duplicado (se informado)
  if (data.cnpj) {
    const cleanCnpj = data.cnpj.replace(/[^\d]/g, "");
    if (cleanCnpj.length >= 11) {
      const existingCnpj = await storage.getUserByCnpj(cleanCnpj);
      if (existingCnpj) {
        return { error: "CNPJ/CPF já cadastrado" };
      }
    }
  }

  const hashedPassword = await hashPassword(data.password);
  const sessionToken = generateSessionToken();

  // Determinar role baseado no perfil e email
  const isMcgEmail = data.email.toLowerCase().endsWith("@mcgconsultoria.com.br");
  let role: string;
  if (isMcgEmail) {
    role = "admin_mcg";
  } else if (data.perfilConta === "administrador") {
    role = "admin";
  } else {
    role = "user";
  }

  const user = await storage.createUserWithPassword({
    email: data.email,
    password: hashedPassword,
    razaoSocial: data.razaoSocial || null,
    nomeFantasia: data.nomeFantasia || null,
    cnpj: data.cnpj || null,
    inscricaoEstadual: data.inscricaoEstadual || null,
    inscricaoEstadualIsento: data.inscricaoEstadualIsento || false,
    inscricaoMunicipal: data.inscricaoMunicipal || null,
    firstName: data.firstName,
    lastName: data.lastName || null,
    userCategories: data.userCategories || null,
    tipoEmpresa: data.tipoEmpresa || null,
    segmentos: data.segmentos || null,
    segmento: data.segmento || null,
    departamento: data.departamento || null,
    vendedor: data.vendedor || null,
    perfilConta: data.perfilConta || "colaborador",
    phone: data.phone || null,
    activeSessionToken: sessionToken,
    subscriptionStatus: "free",
    role,
  });

  return { user, sessionToken };
}

export async function loginUser(data: LoginData): Promise<{ user: User; sessionToken: string } | { error: string }> {
  console.log("Login attempt for:", data.email);
  const user = await storage.getUserByEmail(data.email);
  if (!user || !user.password) {
    console.log("User not found or no password:", data.email);
    return { error: "Email ou senha inválidos" };
  }

  console.log("User found, verifying password. Hash starts with:", user.password?.substring(0, 20));
  const isValid = await verifyPassword(data.password, user.password);
  console.log("Password verification result:", isValid);
  if (!isValid) {
    return { error: "Email ou senha inválidos" };
  }

  const sessionToken = generateSessionToken();
  
  await storage.updateUserSessionToken(user.id, sessionToken);

  return { 
    user: { ...user, activeSessionToken: sessionToken }, 
    sessionToken 
  };
}

export async function validateSession(sessionToken: string): Promise<User | null> {
  if (!sessionToken) return null;
  
  const user = await storage.getUserBySessionToken(sessionToken);
  return user || null;
}

export async function logoutUser(userId: string): Promise<void> {
  await storage.updateUserSessionToken(userId, null);
}
