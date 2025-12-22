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
