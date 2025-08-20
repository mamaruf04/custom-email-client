import { ImapService } from './imap-service';
import { SmtpService } from './smtp-service';
import { CpanelService } from './cpanel-service';
import { EmailCredentials, EmailMessage, SendEmailData } from './config';

export class EmailService {
  private imapService: ImapService;
  private smtpService: SmtpService;
  private cpanelService: CpanelService;
  private credentials: EmailCredentials;

  constructor(credentials: EmailCredentials) {
    this.credentials = credentials;
    this.imapService = new ImapService(credentials);
    this.smtpService = new SmtpService(credentials);
    this.cpanelService = new CpanelService();
  }

  // IMAP Operations
  async connect(): Promise<void> {
    await this.imapService.connect();
  }

  async disconnect(): Promise<void> {
    await this.imapService.disconnect();
  }

  async getFolders(): Promise<Array<{ name: string; count: number }>> {
    return await this.imapService.getFolders();
  }

  async getEmails(folder: string = 'INBOX', limit: number = 50): Promise<EmailMessage[]> {
    return await this.imapService.getEmails(folder, limit);
  }

  async deleteEmail(folder: string, uid: number): Promise<void> {
    await this.imapService.deleteEmail(folder, uid);
  }

  async moveEmail(folder: string, uid: number, targetFolder: string): Promise<void> {
    await this.imapService.moveEmail(folder, uid, targetFolder);
  }

  async markAsRead(folder: string, uid: number): Promise<void> {
    await this.imapService.markAsRead(folder, uid);
  }

  async markAsUnread(folder: string, uid: number): Promise<void> {
    await this.imapService.markAsUnread(folder, uid);
  }

  // SMTP Operations
  async sendEmail(data: SendEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await this.smtpService.sendEmail(data);
  }

  async verifySmtpConnection(): Promise<boolean> {
    return await this.smtpService.verifyConnection();
  }

  // cPanel Operations
  async createEmailAccount(email: string, password: string, quota?: number): Promise<{ success: boolean; error?: string }> {
    return await this.cpanelService.createEmailAccount({ email, password, quota });
  }

  async deleteEmailAccount(email: string): Promise<{ success: boolean; error?: string }> {
    return await this.cpanelService.deleteEmailAccount(email);
  }

  async listEmailAccounts(): Promise<{ success: boolean; accounts?: string[]; error?: string }> {
    return await this.cpanelService.listEmailAccounts();
  }

  async changePassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    return await this.cpanelService.changePassword(email, newPassword);
  }

  // Utility methods
  async testConnection(): Promise<{ imap: boolean; smtp: boolean; cpanel: boolean }> {
    const results = {
      imap: false,
      smtp: false,
      cpanel: false,
    };

    try {
      await this.imapService.connect();
      await this.imapService.disconnect();
      results.imap = true;
    } catch (error) {
      console.error('IMAP connection test failed:', error);
    }

    try {
      results.smtp = await this.smtpService.verifyConnection();
    } catch (error) {
      console.error('SMTP connection test failed:', error);
    }

    try {
      const result = await this.cpanelService.listEmailAccounts();
      results.cpanel = result.success;
    } catch (error) {
      console.error('cPanel connection test failed:', error);
    }

    return results;
  }
}
