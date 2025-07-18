# Quick Netlify Setup Guide

## Step 1: Get Your Database URL from Neon

1. Go to [neon.tech](https://neon.tech) and log in
2. Select your database project
3. Navigate to **Dashboard** → **Connection Details**
4. Copy the **Connection string** (this is your `DATABASE_URL`)
5. It looks like: `postgresql://username:password@hostname/database?sslmode=require`

## Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Deploy to Netlify"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## Step 3: Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) and click **"New site from Git"**
2. Choose **GitHub** and select your repository
3. Netlify will auto-detect settings from `netlify.toml`
4. Click **"Deploy site"**

## Step 4: Add Environment Variables

In your Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add:

**Required:**
- `DATABASE_URL` = Your Neon connection string
- `JWT_SECRET` = Any random secret key (generate at randomkeygen.com)

**Optional:**
- `STRIPE_SECRET_KEY` = Your Stripe key (for payments)
- `SENDGRID_API_KEY` = Your SendGrid key (for emails)

## Step 5: Create Database Tables

On your local machine:
```bash
npm run db:push
```

## Your Site is Ready!

Your B2B Market platform will be live at: `https://your-site-name.netlify.app`

## What Works on Netlify

✅ All pages and navigation
✅ Franchise and business listings
✅ Search functionality
✅ User authentication (login/register)
✅ Admin dashboard
✅ Payment processing (if Stripe configured)
✅ Email features (if SendGrid configured)
✅ Mobile responsive design
✅ Fast loading with CDN

## Need Help?

- Check Netlify function logs for any errors
- Verify your DATABASE_URL is correct
- Make sure all environment variables are set
- Database tables are created with `npm run db:push`