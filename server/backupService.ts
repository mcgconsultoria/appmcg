import { google } from 'googleapis';
import { db } from './db';
import { 
  clients, companies, users, tasks, projects, commercialEvents,
  adminLeads, adminProposals, adminContracts, adminProjects, adminFinancialRecords,
  personalTransactions, personalCategories, personalAccounts, bankAccounts,
  irpfDeclarations, irpfIncomes, irpfDeductions, irpfAssets,
  storeOrders, storeProducts, storeProductCategories,
  checklists, meetingRecords, rfis
} from '@shared/schema';

let connectionSettings: any;

async function getAccessToken() {
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
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

async function getGoogleDriveClient() {
  const accessToken = await getAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function findOrCreateBackupFolder(drive: any): Promise<string> {
  const folderName = 'MCG_Backups';
  
  const response = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id;
  }

  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
}

async function uploadJsonToGoogleDrive(drive: any, folderId: string, fileName: string, data: any) {
  const jsonContent = JSON.stringify(data, null, 2);
  
  const existingFiles = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });

  if (existingFiles.data.files && existingFiles.data.files.length > 0) {
    await drive.files.update({
      fileId: existingFiles.data.files[0].id,
      media: {
        mimeType: 'application/json',
        body: jsonContent,
      },
    });
    console.log(`Updated backup: ${fileName}`);
  } else {
    await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
      },
      media: {
        mimeType: 'application/json',
        body: jsonContent,
      },
    });
    console.log(`Created backup: ${fileName}`);
  }
}

export async function performFullBackup(): Promise<{ success: boolean; message: string; timestamp: string }> {
  const timestamp = new Date().toISOString();
  const dateStr = new Date().toISOString().split('T')[0];
  
  try {
    const drive = await getGoogleDriveClient();
    const folderId = await findOrCreateBackupFolder(drive);

    const allClients = await db.select().from(clients);
    const allCompanies = await db.select().from(companies);
    const allUsers = await db.select().from(users);
    const allTasks = await db.select().from(tasks);
    const allProjects = await db.select().from(projects);
    const allEvents = await db.select().from(commercialEvents);
    const allLeads = await db.select().from(adminLeads);
    const allProposals = await db.select().from(adminProposals);
    const allContracts = await db.select().from(adminContracts);
    const allAdminProjects = await db.select().from(adminProjects);
    const allFinancialRecords = await db.select().from(adminFinancialRecords);
    const allPersonalTransactions = await db.select().from(personalTransactions);
    const allPersonalCategories = await db.select().from(personalCategories);
    const allPersonalAccounts = await db.select().from(personalAccounts);
    const allBankAccounts = await db.select().from(bankAccounts);
    const allIrpfDeclarations = await db.select().from(irpfDeclarations);
    const allIrpfIncomes = await db.select().from(irpfIncomes);
    const allIrpfDeductions = await db.select().from(irpfDeductions);
    const allIrpfAssets = await db.select().from(irpfAssets);
    const allOrders = await db.select().from(storeOrders);
    const allProducts = await db.select().from(storeProducts);
    const allCategories = await db.select().from(storeProductCategories);
    const allChecklists = await db.select().from(checklists);
    const allMeetingRecords = await db.select().from(meetingRecords);
    const allRfis = await db.select().from(rfis);

    const backupData = {
      backupDate: timestamp,
      data: {
        clients: allClients,
        companies: allCompanies,
        users: allUsers.map(u => ({ ...u, password: '[PROTECTED]' })),
        tasks: allTasks,
        projects: allProjects,
        commercialEvents: allEvents,
        adminPJ: {
          leads: allLeads,
          proposals: allProposals,
          contracts: allContracts,
          projects: allAdminProjects,
          financialRecords: allFinancialRecords,
        },
        adminPF: {
          transactions: allPersonalTransactions,
          categories: allPersonalCategories,
          accounts: allPersonalAccounts,
          bankAccounts: allBankAccounts,
          irpf: {
            declarations: allIrpfDeclarations,
            incomes: allIrpfIncomes,
            deductions: allIrpfDeductions,
            assets: allIrpfAssets,
          },
        },
        loja: {
          orders: allOrders,
          products: allProducts,
          categories: allCategories,
        },
        checklists: allChecklists,
        meetingRecords: allMeetingRecords,
        rfis: allRfis,
      },
      statistics: {
        totalClients: allClients.length,
        totalCompanies: allCompanies.length,
        totalUsers: allUsers.length,
        totalTasks: allTasks.length,
        totalProjects: allProjects.length,
        totalLeads: allLeads.length,
        totalOrders: allOrders.length,
      }
    };

    await uploadJsonToGoogleDrive(drive, folderId, `backup_completo_${dateStr}.json`, backupData);

    console.log(`Full backup completed successfully at ${timestamp}`);
    return { 
      success: true, 
      message: `Backup completo realizado com sucesso! Salvo na pasta MCG_Backups do Google Drive.`,
      timestamp 
    };
  } catch (error: any) {
    console.error('Backup error:', error);
    return { 
      success: false, 
      message: `Erro no backup: ${error.message}`,
      timestamp 
    };
  }
}

let backupInterval: NodeJS.Timeout | null = null;

export function startAutomaticBackup(intervalHours: number = 24) {
  if (backupInterval) {
    clearInterval(backupInterval);
  }
  
  performFullBackup().catch(console.error);
  
  backupInterval = setInterval(() => {
    performFullBackup().catch(console.error);
  }, intervalHours * 60 * 60 * 1000);
  
  console.log(`Automatic backup started. Running every ${intervalHours} hours.`);
}

export function stopAutomaticBackup() {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    console.log('Automatic backup stopped.');
  }
}
