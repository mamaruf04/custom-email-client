import { EmailService } from './email-service';
import { EmailCredentials, EmailMessage } from './config';

// Mock user data for demonstration - in a real app, this would come from a user session
const mockUser: EmailCredentials = {
  email: process.env.DEFAULT_USER_EMAIL || 'test@trustguid.co',
  password: process.env.DEFAULT_USER_PASSWORD || '',
};

export interface Folder {
  name: string;
  thread_count: number;
}

export interface ThreadWithEmails {
  id: string;
  subject: string;
  lastActivityDate: Date;
  emails: EmailMessage[];
}

export interface SearchResult {
  id: string;
  subject: string;
  lastActivityDate: Date;
  folderName: string;
  latestEmail: EmailMessage;
}

// Helper function to get email service
function getEmailService(credentials?: EmailCredentials): EmailService {
  const userCredentials = credentials || mockUser;
  return new EmailService(userCredentials);
}

// Map frontend folder names to IMAP folder names
function mapFolderName(folderName: string): string {
  const folderMap: Record<string, string> = {
    'inbox': 'INBOX',
    'sent': 'Sent',
    'drafts': 'Drafts',
    'trash': 'Trash',
    'archive': 'Archive',
    'starred': 'Starred',
  };
  
  return folderMap[folderName.toLowerCase()] || folderName;
}

export async function getFoldersWithThreadCount(credentials?: EmailCredentials): Promise<{
  specialFolders: Folder[];
  otherFolders: Folder[];
}> {
  'use cache';

  try {
    const emailService = getEmailService(credentials);
    await emailService.connect();
    const folders = await emailService.getFolders();
    await emailService.disconnect();

    // Convert IMAP folders to our format
    const foldersWithCount: Folder[] = folders.map(folder => ({
      name: folder.name,
      thread_count: folder.count,
    }));

    // Define special folders order
    const specialFoldersOrder = ['INBOX', 'Sent', 'Drafts', 'Trash'];
    const specialFolders = specialFoldersOrder
      .map((name) => foldersWithCount.find((folder) => folder.name === name))
      .filter(Boolean) as Folder[];
    
    const otherFolders = foldersWithCount.filter(
      (folder) => !specialFoldersOrder.includes(folder.name),
    ) as Folder[];

    return { specialFolders, otherFolders };
  } catch (error) {
    console.error('Failed to get folders:', error);
    return { specialFolders: [], otherFolders: [] };
  }
}

export async function getThreadsForFolder(
  folderName: string, 
  credentials?: EmailCredentials
): Promise<ThreadWithEmails[]> {
  'use cache';

  try {
    const emailService = getEmailService(credentials);
    await emailService.connect();
    
    // Map the folder name to the actual IMAP folder name
    const imapFolderName = mapFolderName(folderName);
    const emails = await emailService.getEmails(imapFolderName, 50);
    await emailService.disconnect();

    // Group emails by subject to create threads
    const threadMap = new Map<string, ThreadWithEmails>();

    emails.forEach((email) => {
      const subject = email.subject || 'No Subject';
      const threadId = subject.toLowerCase().trim();

      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          id: threadId,
          subject: subject,
          lastActivityDate: email.date,
          emails: [],
        });
      }

      const thread = threadMap.get(threadId)!;
      thread.emails.push(email);
      
      // Update last activity date
      if (email.date > thread.lastActivityDate) {
        thread.lastActivityDate = email.date;
      }
    });

    // Convert to array and sort by last activity
    const threads = Array.from(threadMap.values()).sort(
      (a, b) => b.lastActivityDate.getTime() - a.lastActivityDate.getTime()
    );

    return threads;
  } catch (error) {
    console.error('Failed to get threads for folder:', error);
    return [];
  }
}

export async function searchThreads(
  search: string | undefined, 
  credentials?: EmailCredentials
): Promise<SearchResult[]> {
  if (!search) {
    return [];
  }

  try {
    const emailService = getEmailService(credentials);
    await emailService.connect();
    
    // Get emails from all folders for search
    const folders = await emailService.getFolders();
    const allEmails: Array<EmailMessage & { folderName: string }> = [];

    for (const folder of folders) {
      try {
        const emails = await emailService.getEmails(folder.name, 100);
        emails.forEach(email => {
          allEmails.push({ ...email, folderName: folder.name });
        });
      } catch (error) {
        console.warn(`Failed to get emails from folder ${folder.name}:`, error);
      }
    }

    await emailService.disconnect();

    // Filter emails based on search criteria
    const searchLower = search.toLowerCase();
    const filteredEmails = allEmails.filter(email => 
      email.subject.toLowerCase().includes(searchLower) ||
      email.body.toLowerCase().includes(searchLower) ||
      email.from.toLowerCase().includes(searchLower) ||
      email.to.some(to => to.toLowerCase().includes(searchLower))
    );

    // Group by subject to create search results
    const resultMap = new Map<string, SearchResult>();

    filteredEmails.forEach((email) => {
      const subject = email.subject || 'No Subject';
      const threadId = subject.toLowerCase().trim();

      if (!resultMap.has(threadId)) {
        resultMap.set(threadId, {
          id: threadId,
          subject: subject,
          lastActivityDate: email.date,
          folderName: email.folderName,
          latestEmail: email,
        });
      } else {
        const result = resultMap.get(threadId)!;
        if (email.date > result.lastActivityDate) {
          result.lastActivityDate = email.date;
          result.latestEmail = email;
        }
      }
    });

    return Array.from(resultMap.values()).sort(
      (a, b) => b.lastActivityDate.getTime() - a.lastActivityDate.getTime()
    );
  } catch (error) {
    console.error('Failed to search threads:', error);
    return [];
  }
}

export async function getThreadInFolder(
  folderName: string, 
  threadId: string, 
  credentials?: EmailCredentials
): Promise<ThreadWithEmails | null> {
  'use cache';

  try {
    const emailService = getEmailService(credentials);
    await emailService.connect();
    
    // Map the folder name to the actual IMAP folder name
    const imapFolderName = mapFolderName(folderName);
    const emails = await emailService.getEmails(imapFolderName, 100);
    await emailService.disconnect();

    // Find emails that match the thread ID (subject)
    const threadEmails = emails.filter(email => {
      const emailSubject = email.subject || 'No Subject';
      return emailSubject.toLowerCase().trim() === threadId.toLowerCase().trim();
    });

    if (threadEmails.length === 0) {
      return null;
    }

    // Sort emails by date
    threadEmails.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      id: threadId,
      subject: threadEmails[0].subject || 'No Subject',
      lastActivityDate: threadEmails[threadEmails.length - 1].date,
      emails: threadEmails,
    };
  } catch (error) {
    console.error('Failed to get thread in folder:', error);
    return null;
  }
}

export async function getEmailsForThread(
  threadId: string, 
  credentials?: EmailCredentials
): Promise<ThreadWithEmails | null> {
  'use cache';

  try {
    const emailService = getEmailService(credentials);
    await emailService.connect();
    
    // Search across all folders for emails with this subject
    const folders = await emailService.getFolders();
    const allEmails: EmailMessage[] = [];

    for (const folder of folders) {
      try {
        const emails = await emailService.getEmails(folder.name, 100);
        allEmails.push(...emails);
      } catch (error) {
        console.warn(`Failed to get emails from folder ${folder.name}:`, error);
      }
    }

    await emailService.disconnect();

    // Filter emails by subject
    const threadEmails = allEmails.filter(email => {
      const emailSubject = email.subject || 'No Subject';
      return emailSubject.toLowerCase().trim() === threadId.toLowerCase().trim();
    });

    if (threadEmails.length === 0) {
      return null;
    }

    // Sort emails by date
    threadEmails.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      id: threadId,
      subject: threadEmails[0].subject || 'No Subject',
      lastActivityDate: threadEmails[threadEmails.length - 1].date,
      emails: threadEmails,
    };
  } catch (error) {
    console.error('Failed to get emails for thread:', error);
    return null;
  }
}

export async function getAllEmailAddresses(credentials?: EmailCredentials): Promise<Array<{
  firstName: string;
  lastName: string;
  email: string;
}>> {
  'use cache';

  try {
    const emailService = getEmailService(credentials);
    await emailService.connect();
    const emails = await emailService.getEmails('INBOX', 100);
    await emailService.disconnect();

    // Extract unique email addresses from emails
    const emailSet = new Set<string>();
    emails.forEach(email => {
      emailSet.add(email.from);
      email.to.forEach(to => emailSet.add(to));
    });

    // Convert to the expected format
    return Array.from(emailSet).map(email => {
      const [localPart] = email.split('@');
      const nameParts = localPart.split('.');
      return {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: email,
      };
    });
  } catch (error) {
    console.error('Failed to get email addresses:', error);
    return [];
  }
}
