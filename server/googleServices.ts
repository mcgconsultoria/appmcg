import { google } from 'googleapis';

// Gmail Integration
let gmailConnectionSettings: any;

async function getGmailAccessToken() {
  if (gmailConnectionSettings && gmailConnectionSettings.settings.expires_at && new Date(gmailConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return gmailConnectionSettings.settings.access_token;
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

  gmailConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = gmailConnectionSettings?.settings?.access_token || gmailConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!gmailConnectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

export async function getGmailClient() {
  const accessToken = await getGmailAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Google Calendar Integration
let calendarConnectionSettings: any;

async function getCalendarAccessToken() {
  if (calendarConnectionSettings && calendarConnectionSettings.settings.expires_at && new Date(calendarConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return calendarConnectionSettings.settings.access_token;
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

  calendarConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = calendarConnectionSettings?.settings?.access_token || calendarConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!calendarConnectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

export async function getGoogleCalendarClient() {
  const accessToken = await getCalendarAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Google Drive Integration
let driveConnectionSettings: any;

async function getDriveAccessToken() {
  if (driveConnectionSettings && driveConnectionSettings.settings.expires_at && new Date(driveConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return driveConnectionSettings.settings.access_token;
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

  driveConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = driveConnectionSettings?.settings?.access_token || driveConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!driveConnectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

export async function getGoogleDriveClient() {
  const accessToken = await getDriveAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
}

// Google Sheets Integration
let sheetsConnectionSettings: any;

async function getSheetsAccessToken() {
  if (sheetsConnectionSettings && sheetsConnectionSettings.settings.expires_at && new Date(sheetsConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return sheetsConnectionSettings.settings.access_token;
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

  sheetsConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = sheetsConnectionSettings?.settings?.access_token || sheetsConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!sheetsConnectionSettings || !accessToken) {
    throw new Error('Google Sheets not connected');
  }
  return accessToken;
}

export async function getGoogleSheetsClient() {
  const accessToken = await getSheetsAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

// Helper functions for common operations

export async function sendEmailViaGmail(to: string[], subject: string, htmlBody: string, attachments?: Array<{filename: string, content: Buffer, mimeType: string}>) {
  try {
    const gmail = await getGmailClient();
    
    const boundary = 'boundary_' + Date.now();
    let emailParts: string[] = [];
    
    emailParts.push(`To: ${to.join(', ')}`);
    emailParts.push(`Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`);
    emailParts.push('MIME-Version: 1.0');
    
    if (attachments && attachments.length > 0) {
      emailParts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      emailParts.push('');
      emailParts.push(`--${boundary}`);
      emailParts.push('Content-Type: text/html; charset=UTF-8');
      emailParts.push('');
      emailParts.push(htmlBody);
      
      for (const attachment of attachments) {
        emailParts.push(`--${boundary}`);
        emailParts.push(`Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`);
        emailParts.push('Content-Transfer-Encoding: base64');
        emailParts.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
        emailParts.push('');
        emailParts.push(attachment.content.toString('base64'));
      }
      
      emailParts.push(`--${boundary}--`);
    } else {
      emailParts.push('Content-Type: text/html; charset=UTF-8');
      emailParts.push('');
      emailParts.push(htmlBody);
    }
    
    const rawEmail = emailParts.join('\r\n');
    const encodedEmail = Buffer.from(rawEmail).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });
    
    return { success: true, messageId: response.data.id };
  } catch (error: any) {
    console.error('Gmail send error:', error);
    return { success: false, error: error.message };
  }
}

export async function createCalendarEvent(summary: string, description: string, startTime: Date, endTime: Date, attendees?: string[]) {
  try {
    const calendar = await getGoogleCalendarClient();
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: attendees?.map(email => ({ email })),
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    return { success: true, eventId: response.data.id };
  } catch (error: any) {
    console.error('Calendar event creation error:', error);
    return { success: false, error: error.message };
  }
}

export async function getCalendarEvents(timeMin: Date, timeMax: Date) {
  try {
    const calendar = await getGoogleCalendarClient();
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return { success: true, events: response.data.items || [] };
  } catch (error: any) {
    console.error('Calendar events fetch error:', error);
    return { success: false, error: error.message, events: [] };
  }
}

export async function uploadFileToDrive(filename: string, content: Buffer, mimeType: string, folderId?: string) {
  try {
    const drive = await getGoogleDriveClient();
    
    const fileMetadata: any = {
      name: filename,
    };
    
    if (folderId) {
      fileMetadata.parents = [folderId];
    }
    
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: require('stream').Readable.from(content),
      },
      fields: 'id, webViewLink',
    });
    
    return { success: true, fileId: response.data.id, webViewLink: response.data.webViewLink };
  } catch (error: any) {
    console.error('Drive upload error:', error);
    return { success: false, error: error.message };
  }
}

export async function exportToGoogleSheets(spreadsheetName: string, data: any[][]) {
  try {
    const sheets = await getGoogleSheetsClient();
    const drive = await getGoogleDriveClient();
    
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: spreadsheetName,
        },
      },
    });
    
    const spreadsheetId = spreadsheet.data.spreadsheetId!;
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: data,
      },
    });
    
    return { 
      success: true, 
      spreadsheetId, 
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}` 
    };
  } catch (error: any) {
    console.error('Sheets export error:', error);
    return { success: false, error: error.message };
  }
}

export function isGoogleIntegrationAvailable(): boolean {
  return !!process.env.REPLIT_CONNECTORS_HOSTNAME;
}
