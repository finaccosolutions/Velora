# SMTP Email Configuration Guide

This guide will help you configure SMTP settings for sending order confirmation emails to customers and admins.

## Overview

The application uses Supabase Edge Functions to send emails. To enable email functionality, you need to configure SMTP environment variables in your Supabase project.

## Required Environment Variables

The following environment variables need to be configured in your Supabase project:

1. **SMTP_HOST** - Your SMTP server hostname (e.g., `smtp.gmail.com`, `smtp.smtp2go.com`)
2. **SMTP_PORT** - SMTP server port (typically `587` for TLS or `465` for SSL)
3. **SMTP_USER** - Your SMTP username (usually your email address)
4. **SMTP_PASSWORD** - Your SMTP password or API key
5. **SMTP_FROM_EMAIL** - The email address that will appear as the sender
6. **SMTP_FROM_NAME** - The name that will appear as the sender (e.g., "Velora Tradings")

## Step-by-Step Setup

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions**
3. Scroll down to **Environment Variables**
4. Click **Add variable** for each of the required variables above
5. Save your changes
6. Your edge functions will automatically use these variables

### Option 2: Using Supabase CLI (Local Development)

1. Create a `.env` file in your `supabase/functions` directory:
   ```bash
   cd supabase/functions
   touch .env
   ```

2. Add the following content to the `.env` file:
   ```
   SMTP_HOST=your-smtp-host.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASSWORD=your-password-or-api-key
   SMTP_FROM_EMAIL=noreply@veloratradings.com
   SMTP_FROM_NAME=Velora Tradings
   ```

3. Make sure `.env` is listed in your `.gitignore` to prevent committing sensitive credentials

## SMTP Provider Examples

### Gmail

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Velora Tradings
```

**Note:** For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833) instead of using your regular Gmail password.

### SMTP2GO (Recommended)

```
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=your-smtp2go-username
SMTP_PASSWORD=your-smtp2go-api-key
SMTP_FROM_EMAIL=orders@veloratradings.com
SMTP_FROM_NAME=Velora Tradings
```

SMTP2GO offers a free tier with 1,000 emails per month and is optimized for transactional emails.

### SendGrid

```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM_EMAIL=orders@veloratradings.com
SMTP_FROM_NAME=Velora Tradings
```

### Mailgun

```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
SMTP_FROM_EMAIL=orders@veloratradings.com
SMTP_FROM_NAME=Velora Tradings
```

## Admin Email Configuration

The admin email address that receives order notifications can be configured through the **Admin Panel**:

1. Log in to the admin panel at `/adminlogin`
2. Navigate to **Site Settings** → **Email Settings**
3. Update the **Admin Email Address** field
4. Click **Save Settings**

This email address will receive all new order notifications.

## Testing Your Configuration

After configuring SMTP settings:

1. Place a test order on your website
2. Check if both customer and admin receive confirmation emails
3. If emails are not being sent, check the Supabase Edge Function logs:
   - Go to **Edge Functions** in Supabase Dashboard
   - Click on `send-order-email` function
   - Check the **Logs** tab for any errors

## Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials** - Verify all environment variables are correct
2. **Check port and authentication** - Make sure you're using the correct port (587 for TLS, 465 for SSL)
3. **Check spam folders** - Emails might be landing in spam
4. **Review Edge Function logs** - Check for specific error messages in Supabase logs
5. **Verify sender email** - Some SMTP providers require sender verification

### Common Error Messages

- **"SMTP configuration missing"** - One or more environment variables are not set
- **"Authentication failed"** - Incorrect SMTP username or password
- **"Connection timeout"** - Wrong SMTP host or port, or firewall blocking connection
- **"Sender not verified"** - The FROM email address needs to be verified with your SMTP provider

## Security Best Practices

1. **Never commit SMTP credentials** - Always use environment variables
2. **Use app-specific passwords** - For services like Gmail, use app passwords instead of your main password
3. **Enable 2FA** - Enable two-factor authentication on your SMTP provider account
4. **Rotate credentials regularly** - Change your SMTP password periodically
5. **Monitor usage** - Keep an eye on your SMTP provider dashboard for unusual activity

## Rate Limits

Different SMTP providers have different rate limits:

- **Gmail**: 100 emails per day (free), 2000/day (Google Workspace)
- **SMTP2GO**: 1,000 emails per month (free tier)
- **SendGrid**: 100 emails per day (free tier)
- **Mailgun**: 5,000 emails per month (free tier)

Choose a provider based on your expected email volume.

## Support

If you continue to experience issues:

1. Check your SMTP provider's documentation
2. Review Supabase Edge Function logs for specific error messages
3. Test your SMTP credentials using a tool like [smtp-test.com](https://www.smtp-test.com/)
4. Contact your SMTP provider's support team

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [SMTP2GO Getting Started](https://www.smtp2go.com/docs/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
