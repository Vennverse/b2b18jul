# Database Connection Information

## Current Working Database URL (for Netlify setup)

Your database is working properly in Replit because the DATABASE_URL environment variable is automatically set.

**For Netlify deployment, you need to:**

1. Copy your DATABASE_URL from Neon dashboard
2. Add it to Netlify environment variables
3. Also add a JWT_SECRET (any random string)

## Setting up in Netlify:

1. Go to your Netlify site settings
2. Navigate to "Environment variables"
3. Add these variables:
   - `DATABASE_URL` = Your Neon connection string
   - `JWT_SECRET` = Any random secret (e.g., "your-secret-key-2025")

## Database Schema Migration

If your Neon database doesn't have the tables yet, run this command locally:
```bash
npm run db:push
```

This will create all the necessary tables in your Neon database.

## Sample Data

The system includes sample franchise data that gets loaded automatically. If you need to add initial data, you can do so through the admin panel at `/admin` after setting up authentication.

## Troubleshooting

- If franchises don't show: Check DATABASE_URL is correctly set in Netlify
- If sign up doesn't work: Check JWT_SECRET is set in Netlify
- If functions fail: Check Netlify function logs for specific errors