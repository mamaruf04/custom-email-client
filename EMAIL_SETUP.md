# Email Client Setup Guide

This guide will help you configure the email client to work with your email server.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Email Server Configuration
IMAP_SERVER=mail.trustguid.co
SMTP_SERVER=mail.trustguid.co

# cPanel Configuration
CPANEL_HOST=trustguid.co
CPANEL_USER=masudul@trustguid.co
CPANEL_PASSWORD=your_cpanel_password

# Default User Credentials (for development/testing)
DEFAULT_USER_EMAIL=test@trustguid.co
DEFAULT_USER_PASSWORD=your_email_password

# Database Configuration (if still needed for other features)
DATABASE_URL=postgresql://username:password@localhost:5432/email_client
```

## Email Server Configuration

### IMAP Settings
- **Server**: mail.trustguid.co
- **Port**: 993
- **Security**: SSL/TLS
- **Authentication**: Username and password

### SMTP Settings
- **Server**: mail.trustguid.co
- **Port**: 465
- **Security**: SSL/TLS
- **Authentication**: Username and password

## cPanel API Configuration

The application uses cPanel's Web API to manage email accounts. Make sure you have:

1. cPanel access with API enabled
2. Valid cPanel username and password
3. Permission to create/manage email accounts

## Features

### ✅ Implemented
- **Email Authentication**: Login with email credentials
- **IMAP Integration**: Fetch emails from IMAP server
- **SMTP Integration**: Send emails via SMTP
- **Email Management**: Read, delete, and move emails
- **Search**: Search across all emails
- **Thread View**: Group emails by subject
- **cPanel Integration**: Create email accounts via cPanel API

### 🔄 In Progress
- **Real-time Updates**: Live email notifications
- **Attachments**: File upload and download
- **Email Drafts**: Save and edit drafts
- **Email Templates**: Predefined email templates

### 📋 Planned
- **Email Signatures**: Custom email signatures
- **Email Rules**: Automatic email organization
- **Calendar Integration**: Email calendar events
- **Contact Management**: Address book integration

## Usage

1. **Start the application**:
   ```bash
   pnpm dev
   ```

2. **Login**: Enter your email credentials on the login page

3. **Send Email**: Click the compose button to send new emails

4. **Manage Emails**: Use the interface to read, delete, and organize emails

## Troubleshooting

### Connection Issues
- Verify your email server settings
- Check firewall settings
- Ensure SSL/TLS is properly configured

### Authentication Errors
- Verify email credentials
- Check if the email account exists
- Ensure the account is not locked

### cPanel API Errors
- Verify cPanel credentials
- Check API access permissions
- Ensure the domain is properly configured

## Security Notes

- Store sensitive credentials in environment variables
- Use HTTPS in production
- Implement proper session management
- Consider implementing 2FA for additional security

## Development

The application is built with:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **IMAPFlow** for IMAP operations
- **Nodemailer** for SMTP operations
- **Tailwind CSS** for styling
