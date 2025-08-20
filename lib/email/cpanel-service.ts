import { emailConfig } from './config';

export interface CreateEmailAccountData {
  email: string;
  password: string;
  quota?: number; // in MB
}

export class CpanelService {
  private baseUrl: string;
  private credentials: { user: string; password: string };

  constructor() {
    this.baseUrl = `https://${emailConfig.cpanel.host}:2083/execute/Email`;
    this.credentials = {
      user: emailConfig.cpanel.user,
      password: emailConfig.cpanel.password,
    };
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(this.baseUrl + endpoint);
    
    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.credentials.user}:${this.credentials.password}`).toString('base64')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`cPanel API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('cPanel API request failed:', error);
      throw error;
    }
  }

  async createEmailAccount(data: CreateEmailAccountData): Promise<{ success: boolean; error?: string }> {
    try {
      const params: Record<string, any> = {
        email: data.email,
        pass: data.password,
        domain: data.email.split('@')[1],
      };

      if (data.quota) {
        params.quota = data.quota;
      }

      await this.makeRequest('/add_pop', params);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create email account',
      };
    }
  }

  async deleteEmailAccount(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest('/del_pop', {
        email: email,
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete email account',
      };
    }
  }

  async listEmailAccounts(): Promise<{ success: boolean; accounts?: string[]; error?: string }> {
    try {
      const data = await this.makeRequest('/list_pops');
      
      if (data.data && Array.isArray(data.data)) {
        const accounts = data.data.map((account: any) => account.email);
        return { success: true, accounts };
      }
      
      return { success: true, accounts: [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list email accounts',
      };
    }
  }

  async changePassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest('/passwd_pop', {
        email: email,
        pass: newPassword,
      });
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password',
      };
    }
  }
}
