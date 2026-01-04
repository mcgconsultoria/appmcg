/**
 * GitHub Integration Service
 * Provides backup and sync functionality with GitHub repositories
 * Uses Replit OAuth Connectors for authentication
 */

import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken(): Promise<string> {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Token de autenticacao nao encontrado');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub nao conectado');
  }
  return accessToken;
}

async function getGitHubClient(): Promise<Octokit> {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

export function isGitHubIntegrationAvailable(): boolean {
  return !!process.env.REPLIT_CONNECTORS_HOSTNAME;
}

export async function getAuthenticatedUser(): Promise<{ login: string; name: string | null; email: string | null } | null> {
  try {
    const octokit = await getGitHubClient();
    const { data } = await octokit.users.getAuthenticated();
    return {
      login: data.login,
      name: data.name,
      email: data.email
    };
  } catch (error) {
    console.error('Erro ao obter usuario GitHub:', error);
    return null;
  }
}

export async function listUserRepositories(): Promise<Array<{ name: string; fullName: string; private: boolean; url: string }>> {
  try {
    const octokit = await getGitHubClient();
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });
    
    return data.map(repo => ({
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      url: repo.html_url
    }));
  } catch (error) {
    console.error('Erro ao listar repositorios:', error);
    return [];
  }
}

export async function createRepository(name: string, description: string, isPrivate: boolean = true): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const octokit = await getGitHubClient();
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name,
      description,
      private: isPrivate,
      auto_init: true
    });
    
    return {
      success: true,
      url: data.html_url
    };
  } catch (error: any) {
    console.error('Erro ao criar repositorio:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function getRepositoryInfo(owner: string, repo: string): Promise<any> {
  try {
    const octokit = await getGitHubClient();
    const { data } = await octokit.repos.get({ owner, repo });
    return data;
  } catch (error) {
    console.error('Erro ao obter info do repositorio:', error);
    return null;
  }
}

// Backup configuration
let backupConfig = {
  enabled: false,
  repositoryOwner: '',
  repositoryName: 'mcg-backup',
  lastBackupAt: null as Date | null,
  lastBackupStatus: 'never' as 'success' | 'error' | 'never',
  lastBackupError: null as string | null,
  scheduledHour: 3, // 3 AM
};

export function getBackupConfig() {
  return { ...backupConfig };
}

export function setBackupConfig(config: Partial<typeof backupConfig>) {
  backupConfig = { ...backupConfig, ...config };
}

export async function createBackupFile(owner: string, repo: string, path: string, content: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const octokit = await getGitHubClient();
    
    // Check if file exists to get SHA
    let sha: string | undefined;
    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      if ('sha' in existingFile) {
        sha = existingFile.sha;
      }
    } catch (e) {
      // File doesn't exist, that's fine
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao criar arquivo de backup:', error);
    return { success: false, error: error.message };
  }
}

export async function runDatabaseBackup(): Promise<{ success: boolean; error?: string; files?: string[] }> {
  try {
    if (!backupConfig.repositoryOwner || !backupConfig.repositoryName) {
      backupConfig.lastBackupAt = new Date();
      backupConfig.lastBackupStatus = 'error';
      backupConfig.lastBackupError = 'Backup nao configurado';
      return { success: false, error: 'Backup nao configurado' };
    }

    const { storage } = await import('./storage');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dateFolder = new Date().toISOString().split('T')[0];
    const files: string[] = [];

    // Backup ALL users (without passwords) - using raw query to get all users
    const { db } = await import('./db');
    const { users: usersTable } = await import('@shared/schema');
    const allUsersRaw = await db.select().from(usersTable);
    const allUsers = allUsersRaw.map(u => {
      const { password, activeSessionToken, ...safeUser } = u;
      return safeUser;
    });
    
    const usersResult = await createBackupFile(
      backupConfig.repositoryOwner,
      backupConfig.repositoryName,
      `backups/${dateFolder}/users_${timestamp}.json`,
      JSON.stringify(allUsers, null, 2),
      `Backup usuarios - ${new Date().toLocaleString('pt-BR')}`
    );
    if (usersResult.success) files.push('users');

    // Backup clients
    const clients = await storage.getClients();
    const clientsResult = await createBackupFile(
      backupConfig.repositoryOwner,
      backupConfig.repositoryName,
      `backups/${dateFolder}/clients_${timestamp}.json`,
      JSON.stringify(clients, null, 2),
      `Backup clientes - ${new Date().toLocaleString('pt-BR')}`
    );
    if (clientsResult.success) files.push('clients');

    // Backup tasks
    const tasks = await storage.getTasks();
    const tasksResult = await createBackupFile(
      backupConfig.repositoryOwner,
      backupConfig.repositoryName,
      `backups/${dateFolder}/tasks_${timestamp}.json`,
      JSON.stringify(tasks, null, 2),
      `Backup tarefas - ${new Date().toLocaleString('pt-BR')}`
    );
    if (tasksResult.success) files.push('tasks');

    // Backup financial records
    const financial = await storage.getAdminFinancialRecords();
    const financialResult = await createBackupFile(
      backupConfig.repositoryOwner,
      backupConfig.repositoryName,
      `backups/${dateFolder}/financial_${timestamp}.json`,
      JSON.stringify(financial, null, 2),
      `Backup financeiro - ${new Date().toLocaleString('pt-BR')}`
    );
    if (financialResult.success) files.push('financial');

    // Backup meeting records
    const meetings = await storage.getMeetingRecords();
    const meetingsResult = await createBackupFile(
      backupConfig.repositoryOwner,
      backupConfig.repositoryName,
      `backups/${dateFolder}/meetings_${timestamp}.json`,
      JSON.stringify(meetings, null, 2),
      `Backup reunioes - ${new Date().toLocaleString('pt-BR')}`
    );
    if (meetingsResult.success) files.push('meetings');

    // Update backup status
    backupConfig.lastBackupAt = new Date();
    backupConfig.lastBackupStatus = 'success';
    backupConfig.lastBackupError = null;

    console.log(`Backup diario concluido: ${files.length} arquivos salvos em ${backupConfig.repositoryOwner}/${backupConfig.repositoryName}`);
    
    return { success: true, files };
  } catch (error: any) {
    console.error('Erro no backup diario:', error);
    backupConfig.lastBackupAt = new Date();
    backupConfig.lastBackupStatus = 'error';
    backupConfig.lastBackupError = error.message;
    return { success: false, error: error.message };
  }
}

// Backup scheduler
let backupInterval: NodeJS.Timeout | null = null;

export function startBackupScheduler() {
  if (backupInterval) {
    clearInterval(backupInterval);
  }

  // Check every hour if it's time for backup
  backupInterval = setInterval(async () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (backupConfig.enabled && currentHour === backupConfig.scheduledHour) {
      // Check if we already did backup today
      if (backupConfig.lastBackupAt) {
        const lastBackupDate = new Date(backupConfig.lastBackupAt).toDateString();
        const todayDate = now.toDateString();
        if (lastBackupDate === todayDate) {
          return; // Already backed up today
        }
      }
      
      console.log('Iniciando backup diario automatico...');
      await runDatabaseBackup();
    }
  }, 60 * 60 * 1000); // Check every hour

  console.log('Scheduler de backup iniciado');
}

export function stopBackupScheduler() {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log('Scheduler de backup parado');
  }
}
