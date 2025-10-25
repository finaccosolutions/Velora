# Supabase Edge Function Secrets Configuration

The following secrets need to be configured in your Supabase Dashboard for the email functionality to work.

**IMPORTANT**: These secrets are separate from the `.env` file and must be configured in the Supabase Dashboard. The `.env` file contains commented-out values for reference only.

## How to Add Secrets

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `gklsxoaymsvqgnxkinty`
3. Navigate to: **Edge Functions > Manage Secrets** (or Project Settings > Edge Functions)
4. Add the following secrets:

## Required Secrets

### SMTP_HOST
- **Value**: `smtp.hostinger.com`
- **Description**: SMTP server hostname

### SMTP_PORT
- **Value**: `465`
- **Description**: SMTP server port

### SMTP_USER
- **Value**: `orders@veloratradings.com`
- **Description**: SMTP username/email

### SMTP_PASSWORD
- **Value**: Your SMTP API key from Hostinger
- **Description**: SMTP password or API key

### SMTP_FROM_EMAIL
- **Value**: `orders@veloratradings.com`
- **Description**: Email address to send from

### SMTP_FROM_NAME
- **Value**: `Velora Tradings`
- **Description**: Display name for outgoing emails

## Important Notes

- These secrets are stored securely and are only accessible by your Edge Functions
- Secrets are NOT committed to your repository
- After adding secrets, your Edge Function will automatically have access to them via `Deno.env.get('SECRET_NAME')`
- The Edge Function will send order confirmation emails to both customers and the owner (orders@veloratradings.com)
