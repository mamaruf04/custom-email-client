# Email Client Troubleshooting Guide

This guide will help you resolve the authentication and connection issues you're experiencing.

## Current Issues & Solutions

### 1. Authentication Problems

**Symptoms:**
- "Authentication failed" errors
- "Invalid login: 535 Incorrect authentication data"
- Cannot send emails

**Solutions:**

#### A. Check Email Credentials
1. **Verify your email and password are correct**
2. **Use app-specific passwords** (if your email provider requires them)
3. **Enable IMAP/SMTP access** in your email account settings

#### B. Email Provider Settings
Different email providers have different requirements:

**Gmail:**
- Enable 2-factor authentication
- Generate an "App Password" (not your regular password)
- Use the app password for authentication

**Outlook/Hotmail:**
- Enable "Less secure app access" or use app passwords
- Check if IMAP/SMTP is enabled in account settings

**cPanel/Web Hosting:**
- Use the email credentials provided by your hosting provider
- Ensure IMAP/SMTP services are enabled

### 2. Folder Structure Issues

**Symptoms:**
- "Mailbox doesn't exist: INBOX.sent"
- "Mailbox doesn't exist: INBOX.trash"
- Empty folders

**Solutions:**

#### A. Check Actual Folder Names
The app now maps folder names correctly, but you may need to:

1. **Check your actual IMAP folder structure** using the connection test
2. **Create missing folders** in your email account if needed
3. **Use the correct folder names** for your email provider

#### B. Common Folder Names
Different email providers use different folder names:

- **Sent**: `Sent`, `Sent Items`, `Sent Mail`
- **Drafts**: `Drafts`, `Draft`
- **Trash**: `Trash`, `Deleted Items`, `Bin`
- **Archive**: `Archive`, `All Mail`

### 3. Connection Issues

**Symptoms:**
- Connection timeouts
- "Command failed" errors
- Cannot fetch emails

**Solutions:**

#### A. Network/Firewall Issues
1. **Check if ports are blocked:**
   - IMAP: Port 993 (SSL)
   - SMTP: Port 465 (SSL)
2. **Check firewall settings**
3. **Try from a different network**

#### B. Server Configuration
1. **Verify server addresses:**
   - IMAP: `mail.trustguid.co:993`
   - SMTP: `mail.trustguid.co:465`
2. **Check SSL/TLS settings**
3. **Contact your hosting provider** if issues persist

## Step-by-Step Debugging

### 1. Use the Connection Test

1. **Navigate to the main page** (`/`)
2. **Click "Test Connection"** in the Connection Test panel
3. **Check the results** for each service (IMAP, SMTP, cPanel)

### 2. Check Environment Variables

Ensure your `.env.local` file has the correct values:

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
```

### 3. Test Individual Services

#### Test IMAP Connection
```bash
# Using telnet (if available)
telnet mail.trustguid.co 993

# Using openssl
openssl s_client -connect mail.trustguid.co:993
```

#### Test SMTP Connection
```bash
# Using telnet (if available)
telnet mail.trustguid.co 465

# Using openssl
openssl s_client -connect mail.trustguid.co:465
```

## Common Error Messages & Solutions

### "Authentication failed"
- **Cause**: Wrong credentials or authentication method
- **Solution**: Double-check email/password, use app passwords if needed

### "Invalid login: 535 Incorrect authentication data"
- **Cause**: SMTP authentication failure
- **Solution**: Verify SMTP credentials, check if SMTP is enabled

### "Mailbox doesn't exist"
- **Cause**: Folder doesn't exist on the server
- **Solution**: Create the folder or use existing folder names

### "Invalid messageset"
- **Cause**: Trying to fetch from empty mailbox
- **Solution**: This is now handled gracefully - empty folders will show no emails

### "Request cannot be constructed from a URL that includes credentials"
- **Cause**: cPanel API URL construction issue
- **Solution**: Fixed in the latest code - credentials are now sent via headers

## Email Provider Specific Instructions

### Gmail
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password instead of your regular password
4. Enable IMAP in Gmail settings

### Outlook/Hotmail
1. Enable IMAP in account settings
2. Use app passwords if 2FA is enabled
3. Check "Less secure app access" settings

### cPanel/Web Hosting
1. Use the email credentials from your hosting control panel
2. Ensure IMAP/SMTP services are enabled
3. Check with your hosting provider for specific settings

## Getting Help

If you're still experiencing issues:

1. **Check the browser console** for JavaScript errors
2. **Check the terminal** for server-side errors
3. **Use the Connection Test** to isolate the problem
4. **Contact your email provider** for account-specific issues
5. **Check your hosting provider's documentation** for email settings

## Testing the Fixes

After making changes:

1. **Restart the development server**: `pnpm dev`
2. **Clear browser cache** and cookies
3. **Test the connection** using the Connection Test component
4. **Try logging in** with your credentials
5. **Test sending an email** to verify SMTP is working
6. **Check different folders** to ensure IMAP is working

## Next Steps

Once authentication is working:

1. **Test email sending** - compose and send a test email
2. **Check folder navigation** - browse through different folders
3. **Test email viewing** - click on emails to view their content
4. **Test search functionality** - search for emails
5. **Test email actions** - delete, move, or archive emails
