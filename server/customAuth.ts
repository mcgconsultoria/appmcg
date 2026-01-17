import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { emailService } from "./emailService";
import type { RegisterData, LoginData, User } from "@shared/schema";

const SALT_ROUNDS = 12;

export function extractCnpjRaiz(cnpj: string | null | undefined): string | null {
  if (!cnpj) return null;
  const cleanCnpj = cnpj.replace(/[^\d]/g, "");
  if (cleanCnpj.length >= 8) {
    return cleanCnpj.substring(0, 8);
  }
  return null;
}

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

  // Usuários MCG são aprovados automaticamente
  const accountStatus = isMcgEmail ? "approved" : "pending";

  // Extrair CNPJ raiz para agrupamento matriz/filiais
  const cnpjRaiz = extractCnpjRaiz(data.cnpj);

  // Verificar se já existe uma company com esse CNPJ raiz
  let companyId: number | null = null;
  if (cnpjRaiz && role === "admin") {
    const existingCompany = await storage.getCompanyByCnpjRaiz(cnpjRaiz);
    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      // Criar nova company para o administrador
      const newCompany = await storage.createCompany({
        name: data.razaoSocial || data.nomeFantasia || data.firstName,
        nomeFantasia: data.nomeFantasia || null,
        cnpj: data.cnpj || null,
        cnpjRaiz,
        tipoUnidade: "matriz",
        inscricaoEstadual: data.inscricaoEstadual || null,
        inscricaoEstadualIsento: data.inscricaoEstadualIsento || false,
        inscricaoMunicipal: data.inscricaoMunicipal || null,
        email: data.email,
        phone: data.phone || null,
        subscriptionStatus: "trial",
        selectedPlan: "free",
        maxUsers: 1,
        currentUsers: 1,
      });
      companyId = newCompany.id;
    }
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
    companyId,
    activeSessionToken: isMcgEmail ? sessionToken : null,
    subscriptionStatus: "free",
    role,
    accountStatus,
    selectedPlan: "free",
  });

  // Atualizar company com o ID do admin principal
  if (companyId && role === "admin") {
    await storage.updateCompany(companyId, { primaryAdminId: user.id });
  }

  // Enviar email para MCG sobre nova solicitação (exceto usuários MCG)
  if (!isMcgEmail) {
    await sendApprovalRequestEmail(user);
  }

  // Se for MCG, retorna com sessão ativa. Se não, retorna sem sessão (precisa aprovação)
  if (isMcgEmail) {
    return { user, sessionToken };
  } else {
    return { user, sessionToken: "", pendingApproval: true };
  }
}

async function sendApprovalRequestEmail(user: User): Promise<void> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">Nova Solicitação de Cadastro</h2>
        <p>Uma nova solicitação de cadastro foi recebida e aguarda aprovação:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f7fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Nome:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.firstName} ${user.lastName || ''}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.email}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">CNPJ:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.cnpj || 'Não informado'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Razão Social:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.razaoSocial || 'Não informado'}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Nome Fantasia:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.nomeFantasia || 'Não informado'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Telefone:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.phone || 'Não informado'}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Tipo de Empresa:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.tipoEmpresa || 'Não informado'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Categorias:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.userCategories?.join(', ') || 'Não informado'}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Perfil da Conta:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.perfilConta || 'colaborador'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Plano Selecionado:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${user.selectedPlan || 'free'}</td>
          </tr>
          <tr style="background-color: #f7fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Data do Cadastro:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
          </tr>
        </table>
        
        <p style="margin-top: 20px;">
          <strong>Ação necessária:</strong> Acesse o painel Admin MCG &gt; Comercial &gt; Aguardando Aprovação para revisar e aprovar esta solicitação.
        </p>
        
        <p style="color: #718096; font-size: 12px; margin-top: 30px;">
          Este é um email automático do sistema MCG Consultoria.
        </p>
      </div>
    `;

    await emailService.send({
      to: ['comercial@mcgconsultoria.com.br'],
      subject: `[MCG] Nova Solicitação de Cadastro - ${user.razaoSocial || user.firstName}`,
      html,
    });
    console.log("Email de aprovação enviado para comercial@mcgconsultoria.com.br");
  } catch (error) {
    console.error("Erro ao enviar email de aprovação:", error);
  }
}

export async function loginUser(data: LoginData): Promise<{ user: User; sessionToken: string } | { error: string }> {
  console.log("Login attempt for:", data.email);
  const user = await storage.getUserByEmail(data.email);
  if (!user || !user.password) {
    console.log("User not found or no password:", data.email);
    return { error: "Email ou senha inválidos" };
  }

  console.log("User found:", user.email, "accountStatus:", user.accountStatus, "role:", user.role);
  console.log("User found, verifying password. Hash starts with:", user.password?.substring(0, 20));
  const isValid = await verifyPassword(data.password, user.password);
  console.log("Password verification result:", isValid);
  if (!isValid) {
    return { error: "Email ou senha inválidos" };
  }

  // Verificar status da conta
  if (user.accountStatus === "pending") {
    return { error: "Sua conta está aguardando aprovação. Você receberá um email quando for aprovada." };
  }
  if (user.accountStatus === "rejected") {
    return { error: "Sua solicitação de cadastro foi recusada. Entre em contato com comercial@mcgconsultoria.com.br" };
  }
  if (user.accountStatus === "suspended") {
    return { error: "Sua conta foi suspensa. Entre em contato com comercial@mcgconsultoria.com.br" };
  }
  
  // Verificar se o usuario está ativo
  if (user.isActive === false) {
    return { error: "Sua conta foi desativada. Entre em contato com comercial@mcgconsultoria.com.br" };
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
