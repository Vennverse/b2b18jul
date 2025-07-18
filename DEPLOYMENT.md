# Netlify Deployment Guide

## Overview
This project has been configured for static site deployment on Netlify with serverless functions handling the backend API.

## Prerequisites
1. Netlify account
2. Neon PostgreSQL database
3. Environment variables configured

## Environment Variables Required

### Database
- `DATABASE_URL` - Your Neon PostgreSQL connection string

### Authentication
- `JWT_SECRET` - Secret key for JWT token generation

### Payment Processing (Optional)
- `STRIPE_SECRET_KEY` - Stripe secret key for payment processing

### Email Service (Optional)
- `SENDGRID_API_KEY` - SendGrid API key for email services

## Deployment Steps

### 1. Push Code to GitHub
First, push your code to a GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit for Netlify deployment"
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### 2. Connect Repository to Netlify
1. Go to [netlify.com](https://netlify.com) and log in
2. Click **"New site from Git"**
3. Choose **"GitHub"** as your Git provider
4. Select your repository from the list
5. Netlify will automatically detect the build settings from `netlify.toml`

### 3. Configure Environment Variables
**This is where you put your database URL:**

1. In your Netlify dashboard, go to **Site settings**
2. Click on **"Environment variables"** in the left sidebar
3. Click **"Add a variable"**
4. Add these variables one by one:

**Required Variables:**
- **Key**: `DATABASE_URL`
  **Value**: Your Neon database connection string (looks like: `postgresql://username:password@hostname/database?sslmode=require`)

- **Key**: `JWT_SECRET`
  **Value**: A random secret key (generate one at: https://randomkeygen.com/)

**Optional Variables (for full functionality):**
- **Key**: `STRIPE_SECRET_KEY`
  **Value**: Your Stripe secret key (if using payments)

- **Key**: `SENDGRID_API_KEY` 
  **Value**: Your SendGrid API key (if using email features)

### 4. Get Your Neon Database URL
1. Go to [neon.tech](https://neon.tech) and log in
2. Select your database project
3. Go to **"Dashboard"** → **"Connection Details"**
4. Copy the **"Connection string"** - this is your `DATABASE_URL`
5. The format looks like: `postgresql://username:password@hostname/database?sslmode=require`

### 5. Deploy Your Site
1. After setting environment variables, click **"Deploy site"**
2. Netlify will automatically:
   - Install dependencies
   - Build your React app
   - Compile serverless functions
   - Deploy everything to CDN
3. Your site will be live at: `https://your-site-name.netlify.app`

### 6. Database Schema Setup
After deployment, you need to create the database tables:
1. In your local project, make sure your `DATABASE_URL` points to your Neon database
2. Run: `npm run db:push`
3. This creates all necessary tables in your Neon database

## Quick Setup Checklist

✅ **Step 1**: Push code to GitHub
✅ **Step 2**: Connect GitHub repo to Netlify  
✅ **Step 3**: Add `DATABASE_URL` to Netlify environment variables
✅ **Step 4**: Add `JWT_SECRET` to Netlify environment variables
✅ **Step 5**: Deploy site
✅ **Step 6**: Run `npm run db:push` to create database tables

## File Structure for Deployment

```
project/
├── netlify/
│   └── functions/          # Serverless functions
│       ├── auth.ts         # Authentication endpoints
│       ├── franchises.ts   # Franchise API
│       ├── businesses.ts   # Business API
│       ├── advertisements.ts # Advertisement API
│       ├── inquiries.ts    # Inquiry API
│       ├── payments.ts     # Payment processing
│       └── admin.ts        # Admin functions
├── dist/
│   └── public/             # Static site files
├── netlify.toml            # Netlify configuration
├── _redirects             # URL redirects
└── build-functions.js      # Function build script
```

## API Endpoints

All API endpoints are automatically routed through Netlify Functions:

- `GET/POST /api/franchises` - Franchise operations
- `GET/POST /api/businesses` - Business operations
- `GET/POST /api/advertisements` - Advertisement operations
- `GET/POST /api/inquiries` - Inquiry operations
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Password reset confirmation
- `GET /api/auth/verify` - Token verification
- `POST /api/payments/create-payment-intent` - Payment processing
- `POST /api/payments/create-subscription` - Subscription creation
- `GET /api/admin/*` - Admin operations
- `PUT /api/admin/*/status` - Status updates

## Security Features

1. **CORS Configuration**: Properly configured for cross-origin requests
2. **Authentication**: JWT-based authentication with secure token handling
3. **Database Security**: Connection pooling and prepared statements
4. **Environment Variables**: Sensitive data stored in environment variables
5. **HTTPS**: Automatic HTTPS through Netlify

## Performance Optimizations

1. **Connection Pooling**: Minimal database connections for serverless
2. **Caching**: Netlify CDN caching for static assets
3. **Code Splitting**: Optimized JavaScript bundles
4. **Serverless Functions**: Auto-scaling based on demand

## Monitoring and Debugging

1. **Netlify Functions**: Check function logs in Netlify dashboard
2. **Database**: Monitor Neon database performance
3. **Error Tracking**: Console logs available in Netlify function logs
4. **Performance**: Netlify Analytics for site performance

## Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificates are automatically provisioned

## Troubleshooting

### Common Issues

1. **Function Timeout**: Increase timeout in netlify.toml if needed
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Environment Variables**: Ensure all required variables are set
4. **Build Errors**: Check build logs in Netlify dashboard

### Support

- Netlify Documentation: https://docs.netlify.com/
- Neon Documentation: https://neon.tech/docs
- Project Issues: Check repository issues page