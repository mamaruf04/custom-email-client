import { ImapFlow } from 'imapflow';
import { emailConfig, EmailCredentials, EmailMessage } from './config';

export class ImapService {
  private client: ImapFlow;

  constructor(credentials: EmailCredentials) {
    this.client = new ImapFlow({
      host: emailConfig.imap.host,
      port: emailConfig.imap.port,
      secure: emailConfig.imap.secure,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      },
      logger: false,
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.logout();
  }

  async getFolders(): Promise<Array<{ name: string; count: number }>> {
    const folders = [];
    
    try {
      const folderList = await this.client.list();
      for (const folder of folderList) {
        if (folder.subscribed) {
          const lock = await this.client.getMailboxLock(folder.path);
          try {
            const status = await this.client.status(folder.path, { messages: true });
            folders.push({
              name: folder.path,
              count: status.messages || 0,
            });
          } finally {
            lock.release();
          }
        }
      }
    } catch (error) {
      console.error('Error getting folders:', error);
    }

    return folders;
  }

  async getEmails(folder: string = 'INBOX', limit: number = 50): Promise<EmailMessage[]> {
    const emails: EmailMessage[] = [];

    try {
      const lock = await this.client.getMailboxLock(folder);
      
      try {
        // First, get the total number of messages
        const status = await this.client.status(folder, { messages: true });
        const totalMessages = status.messages || 0;
        
        if (totalMessages === 0) {
          return emails;
        }

        // Calculate the range to fetch (get the latest messages)
        const start = Math.max(1, totalMessages - limit + 1);
        const end = totalMessages;
        
        // Get the latest emails
        const allMessages = await this.client.fetch(
          `${start}:${end}`,
          {
            uid: true,
            envelope: true,
            source: true,
            flags: true,
          }
        );
        
        // Convert to array
        const messages = [];
        for await (const message of allMessages) {
          messages.push(message);
        }

        // Process messages in reverse order (newest first)
        for (const message of messages.reverse()) {
          const envelope = message.envelope;
          
          // For now, we'll use a simple approach to get the body
          let body = '';
          try {
            const part = await this.client.download(message.uid);
            if (part?.content) {
              body = part.content.toString();
            }
          } catch (error) {
            console.warn('Failed to download email body:', error);
          }

          emails.push({
            id: message.uid.toString(),
            subject: envelope?.subject || '',
            body: body,
            from: envelope?.from?.[0]?.address || '',
            to: (envelope?.to?.map(addr => addr.address).filter(Boolean) as string[]) || [],
            date: envelope?.date || new Date(),
            flags: message.flags ? Array.from(message.flags) : [],
            uid: message.uid,
          });
        }
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error(`Error getting emails from ${folder}:`, error);
    }

    return emails;
  }

  async deleteEmail(folder: string, uid: number): Promise<void> {
    try {
      const lock = await this.client.getMailboxLock(folder);
      try {
        await this.client.messageDelete(uid, { uid: true });
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Error deleting email:', error);
      throw error;
    }
  }

  async moveEmail(folder: string, uid: number, targetFolder: string): Promise<void> {
    try {
      const lock = await this.client.getMailboxLock(folder);
      try {
        await this.client.messageMove(uid, targetFolder, { uid: true });
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Error moving email:', error);
      throw error;
    }
  }

  async markAsRead(folder: string, uid: number): Promise<void> {
    try {
      const lock = await this.client.getMailboxLock(folder);
      try {
        await this.client.messageFlagsAdd(uid, ['\\Seen'], { uid: true });
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  async markAsUnread(folder: string, uid: number): Promise<void> {
    try {
      const lock = await this.client.getMailboxLock(folder);
      try {
        await this.client.messageFlagsRemove(uid, ['\\Seen'], { uid: true });
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error('Error marking email as unread:', error);
      throw error;
    }
  }
}
