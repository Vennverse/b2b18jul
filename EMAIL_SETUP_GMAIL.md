# Gmail App Password Setup for B2B Market Email System

## Current Status
- Email system configured with `jj.tech.us.corp@gmail.com`
- Authentication failing: "Application-specific password required"
- Gmail requires App Password for SMTP when 2FA is enabled

## Quick Setup Steps

### Step 1: Generate Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)
3. Go to "App passwords" section
4. Select "Mail" as the app
5. Generate a 16-character password (example: `abcd efgh ijkl mnop`)

### Step 2: Update Environment Variable
Replace your current EMAIL_PASS with the new app password:
```
EMAIL_PASS=abcdefghijklmnop  # Remove spaces from the generated password
```

### Step 3: Test Email Delivery
The system will automatically use the new credentials and send real emails.

## Alternative: Use a Different Email Provider

If Gmail setup is difficult, you can use:

### Outlook/Hotmail
```
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-password
```

### SendGrid (Professional)
```
SENDGRID_API_KEY=SG.your-api-key-here
```

## Current Working Features
- Password reset tokens: ✅ Generated correctly
- Email templates: ✅ Professional HTML emails  
- Preview emails: ✅ Available at ethereal.email links
- Honest error reporting: ✅ No false success messages
- Direct reset links: ✅ Provided when email fails

## Next Steps
Once you provide the Gmail app password, the system will immediately start sending real emails to user inboxes.