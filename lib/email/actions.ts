'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { EmailCredentials, SendEmailData } from './config';
import { EmailService } from './email-service';

// Schema for sending emails
const sendEmailSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  recipientEmail: z.string().email('Invalid email address'),
  userEmail: z.string().email('User email is required'),
  userPassword: z.string().min(1, 'User password is required'),
});

// Schema for email operations
const emailOperationSchema = z.object({
  userEmail: z.string().email('User email is required'),
  userPassword: z.string().min(1, 'User password is required'),
  folder: z.string().optional(),
  uid: z.number().optional(),
});

// Schema for creating email accounts
const createAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  quota: z.number().optional(),
});

// Helper function to get email service
function getEmailService(credentials: EmailCredentials): EmailService {
  return new EmailService(credentials);
}

export async function sendEmailAction(_: any, formData: FormData) {
  let rawFormData = {
    subject: formData.get('subject'),
    body: formData.get('body'),
    recipientEmail: formData.get('recipientEmail'),
    userEmail: formData.get('userEmail'),
    userPassword: formData.get('userPassword'),
  };

  try {
    let validatedFields = sendEmailSchema.parse(rawFormData);
    let { subject, body, recipientEmail, userEmail, userPassword } = validatedFields;

    const emailService = getEmailService({ email: userEmail, password: userPassword });

    const sendData: SendEmailData = {
      to: recipientEmail,
      subject,
      body,
      from: userEmail,
    };

    const result = await emailService.sendEmail(sendData);

    if (!result.success) {
      return {
        error: result.error || 'Failed to send email. Please check your SMTP settings.',
        previous: rawFormData,
      };
    }

    revalidatePath('/', 'layout');
    redirect(`/f/sent`);
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message, previous: rawFormData };
    }
    return {
      error: 'Failed to send email. Please try again.',
      previous: rawFormData,
    };
  }
}

export async function getEmailsAction(_: any, formData: FormData) {
  try {
    let validatedFields = emailOperationSchema.parse({
      userEmail: formData.get('userEmail'),
      userPassword: formData.get('userPassword'),
      folder: formData.get('folder') || 'INBOX',
    });

    const { userEmail, userPassword, folder } = validatedFields;
    const emailService = getEmailService({ email: userEmail, password: userPassword });

    await emailService.connect();
    const emails = await emailService.getEmails(folder, 50);
    await emailService.disconnect();

    return { success: true, emails };
  } catch (error) {
    console.error('Failed to get emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get emails',
    };
  }
}

export async function deleteEmailAction(_: any, formData: FormData) {
  try {
    let validatedFields = emailOperationSchema.parse({
      userEmail: formData.get('userEmail'),
      userPassword: formData.get('userPassword'),
      folder: formData.get('folder'),
      uid: formData.get('uid') ? parseInt(formData.get('uid') as string) : undefined,
    });

    const { userEmail, userPassword, folder, uid } = validatedFields;

    if (!folder || !uid) {
      return { success: false, error: 'Folder and UID are required' };
    }

    const emailService = getEmailService({ email: userEmail, password: userPassword });

    await emailService.connect();
    await emailService.deleteEmail(folder, uid);
    await emailService.disconnect();

    revalidatePath('/f/[name]');
    revalidatePath('/f/[name]/[id]');
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to delete email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete email',
    };
  }
}

export async function moveEmailAction(_: any, formData: FormData) {
  try {
    let validatedFields = z.object({
      userEmail: z.string().email('User email is required'),
      userPassword: z.string().min(1, 'User password is required'),
      folder: z.string(),
      uid: z.number(),
      targetFolder: z.string(),
    }).parse({
      userEmail: formData.get('userEmail'),
      userPassword: formData.get('userPassword'),
      folder: formData.get('folder'),
      uid: formData.get('uid') ? parseInt(formData.get('uid') as string) : undefined,
      targetFolder: formData.get('targetFolder'),
    });

    const { userEmail, userPassword, folder, uid, targetFolder } = validatedFields;

    const emailService = getEmailService({ email: userEmail, password: userPassword });

    await emailService.connect();
    await emailService.moveEmail(folder, uid, targetFolder);
    await emailService.disconnect();

    revalidatePath('/f/[name]');
    revalidatePath('/f/[name]/[id]');
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to move email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to move email',
    };
  }
}

export async function getFoldersAction(_: any, formData: FormData) {
  try {
    let validatedFields = emailOperationSchema.parse({
      userEmail: formData.get('userEmail'),
      userPassword: formData.get('userPassword'),
    });

    const { userEmail, userPassword } = validatedFields;
    const emailService = getEmailService({ email: userEmail, password: userPassword });

    await emailService.connect();
    const folders = await emailService.getFolders();
    await emailService.disconnect();

    return { success: true, folders };
  } catch (error) {
    console.error('Failed to get folders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get folders',
    };
  }
}

export async function createEmailAccountAction(_: any, formData: FormData) {
  try {
    let validatedFields = createAccountSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      quota: formData.get('quota') ? parseInt(formData.get('quota') as string) : undefined,
    });

    const { email, password, quota } = validatedFields;
    const emailService = getEmailService({ 
      email: process.env.CPANEL_USER || '', 
      password: process.env.CPANEL_PASSWORD || '' 
    });

    const result = await emailService.createEmailAccount(email, password, quota);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create email account',
    };
  }
}

export async function testConnectionAction(_: any, formData: FormData) {
  try {
    let validatedFields = emailOperationSchema.parse({
      userEmail: formData.get('userEmail'),
      userPassword: formData.get('userPassword'),
    });

    const { userEmail, userPassword } = validatedFields;
    const emailService = getEmailService({ email: userEmail, password: userPassword });

    const results = await emailService.testConnection();

    return { success: true, results };
  } catch (error) {
    console.error('Failed to test connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test connection',
    };
  }
}
