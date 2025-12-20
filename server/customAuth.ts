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
  const existingUser = await storage.getUserByEmail(data.email);
  if (existingUser) {
    return { error: "Email já cadastrado" };
  }

  const hashedPassword = await hashPassword(data.password);
  const sessionToken = generateSessionToken();

  const user = await storage.createUserWithPassword({
    email: data.email,
    password: hashedPassword,
    razaoSocial: data.razaoSocial || null,
    cnpj: data.cnpj || null,
    firstName: data.firstName,
    lastName: data.lastName || null,
    tipoEmpresa: data.tipoEmpresa || null,
    segmento: data.segmento || null,
    departamento: data.departamento || null,
    vendedor: data.vendedor || null,
    perfilConta: data.perfilConta || "colaborador",
    phone: data.phone || null,
    activeSessionToken: sessionToken,
    subscriptionStatus: "free",
  });

  return { user, sessionToken };
}

export async function loginUser(data: LoginData): Promise<{ user: User; sessionToken: string } | { error: string }> {
  const user = await storage.getUserByEmail(data.email);
  if (!user || !user.password) {
    return { error: "Email ou senha inválidos" };
  }

  const isValid = await verifyPassword(data.password, user.password);
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
