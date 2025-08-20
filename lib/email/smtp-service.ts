import nodemailer from 'nodemailer';
import { emailConfig, EmailCredentials, SendEmailData } from './config';

export class SmtpService {
  private transporter: nodemailer.Transporter;
  private userEmail: string;

  constructor(credentials: EmailCredentials) {
    this.userEmail = credentials.email;
    this.transporter = nodemailer.createTransport({
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      secure: emailConfig.smtp.secure,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      },
    });
  }

  async sendEmail(data: SendEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: data.from || this.userEmail,
        to: data.to,
        subject: data.subject,
        text: data.body,
        html: data.body.replace(/\n/g, '<br>'),
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('SMTP Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP Connection verification failed:', error);
      return false;
    }
  }
}
