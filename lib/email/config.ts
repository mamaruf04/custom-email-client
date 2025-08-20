export interface EmailConfig {
  imap: {
    host: string;
    port: number;
    secure: boolean;
  };
  smtp: {
    host: string;
    port: number;
    secure: boolean;
  };
  cpanel: {
    host: string;
    user: string;
    password: string;
  };
}

export const emailConfig: EmailConfig = {
  imap: {
    host: process.env.IMAP_SERVER || 'mail.trustguid.co',
    port: 993,
    secure: true,
  },
  smtp: {
    host: process.env.SMTP_SERVER || 'mail.trustguid.co',
    port: 465,
    secure: true,
  },
  cpanel: {
    host: process.env.CPANEL_HOST || 'trustguid.co',
    user: process.env.CPANEL_USER || 'masudul@trustguid.co',
    password: process.env.CPANEL_PASSWORD || '',
  },
};

export interface EmailCredentials {
  email: string;
  password: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string[];
  date: Date;
  flags: string[];
  uid: number;
}

export interface SendEmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}
