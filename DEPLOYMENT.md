# 🚀 Secure Deployment Guide

## Deploying to Vercel Safely

### ⚠️ SECURITY CHECKLIST

Before deploying, ensure:

- ✅ `.env` file is NOT committed to Git
- ✅ All sensitive data is in environment variables
- ✅ Database migrations contain no sensitive test data
- ✅ No API keys or secrets in the code

### 🔧 Environment Variables Setup

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add these variables:

```
VITE_SUPABASE_PROJECT_ID = your_actual_project_id
VITE_SUPABASE_PUBLISHABLE_KEY = your_actual_publishable_key  
VITE_SUPABASE_URL = https://your_project_id.supabase.co
```

2. **For Local Development:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

### 🛡️ Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use Vercel's environment variables dashboard
   - Keep publishable keys only (never private keys)

2. **Supabase Security:**
   - Enable Row Level Security (RLS) on all tables
   - Set up proper authentication policies
   - Use publishable key only (anon key is safe for frontend)

3. **Database:**
   - Review all migrations before deployment
   - Remove any test/dummy data
   - Ensure proper access controls

### 🚀 Deployment Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit - production ready"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Connect your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

3. **Post-Deployment:**
   - Test all functionality
   - Verify environment variables are working
   - Check that no sensitive data is exposed

### 🔍 Files Excluded from Git

The following sensitive files are automatically ignored:
- `.env` (your actual credentials)
- `supabase/migrations/*.sql` (may contain sensitive data)
- `node_modules/` (large dependencies)
- `dist/` (build files)
- Various cache and log files

### 📝 Notes

- The `.env.example` file shows the structure but contains no real credentials
- Supabase publishable keys are safe for frontend use
- Always use HTTPS in production (Vercel provides this automatically)
