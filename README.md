# Next.js Email Client

A modern email client built with Next.js 15 and real email protocols (IMAP/SMTP). This application demonstrates how to build a functional email client that connects to real email servers instead of using a database.

**Features:**
- Real IMAP/SMTP email integration
- cPanel API for email account management
- Modern React with Next.js App Router
- TypeScript for type safety
- Beautiful UI with Tailwind CSS

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Email Protocols**: [IMAPFlow](https://imapflow.com/) for IMAP, [Nodemailer](https://nodemailer.com/) for SMTP
- **cPanel Integration**: cPanel Web API for account management
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

```bash
git clone https://github.com/your-username/next-email-client
cd next-email-client
pnpm install
```

## Configuration

1. **Create environment file**: Copy the example configuration:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure email settings**: Edit `.env.local` with your email server details:
   ```env
   # Email Server Configuration
   IMAP_SERVER=mail.trustguid.co
   SMTP_SERVER=mail.trustguid.co
   
   # cPanel Configuration
   CPANEL_HOST=trustguid.co
   CPANEL_USER=your-cpanel-user@trustguid.co
   CPANEL_PASSWORD=your_cpanel_password
   
   # Default User Credentials (for development)
   DEFAULT_USER_EMAIL=test@trustguid.co
   DEFAULT_USER_PASSWORD=your_email_password
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

## Features

### ✅ Implemented
- **Email Authentication**: Secure login with email credentials
- **IMAP Integration**: Fetch and read emails from IMAP server
- **SMTP Integration**: Send emails via SMTP
- **Email Management**: Delete, move, and organize emails
- **Search**: Full-text search across all emails
- **Thread View**: Group emails by conversation
- **cPanel Integration**: Create and manage email accounts
- **Real-time Updates**: Live email notifications
- **Responsive Design**: Works on desktop and mobile

### 🔄 In Progress
- **Attachments**: File upload and download support
- **Email Drafts**: Save and edit draft emails
- **Email Templates**: Predefined email templates
- **Advanced Search**: Filters and advanced search options

### 📋 Planned
- **Email Signatures**: Custom email signatures
- **Email Rules**: Automatic email organization
- **Calendar Integration**: Email calendar events
- **Contact Management**: Address book integration
- **Dark Mode**: Dark theme support

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

## Architecture

The application is structured with:

- **`lib/email/`**: Email service layer (IMAP, SMTP, cPanel)
- **`app/components/`**: React components
- **`app/contexts/`**: React context for state management
- **`app/f/[name]/`**: Email folder pages
- **`app/search/`**: Search functionality

## Security

- All credentials are stored securely in environment variables
- HTTPS is required in production
- Email credentials are not stored in the database
- Session management with secure logout

## Troubleshooting

See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed setup instructions and troubleshooting guide.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
