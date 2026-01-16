# Vercel Deployment Guide

## Overview

Your BlogPlatform is now configured for Vercel deployment with all necessary fixes applied.

## Current Status ✅

- ✅ Dynamic pages configured (`/`, `/categories`, `/sitemap.xml`)
- ✅ `vercel.json` properly configured
- ✅ API functions configured with 30-second timeout
- ✅ Build optimizations applied
- ✅ TypeScript compilation passes
- ✅ All dependencies resolved

## What's Been Fixed

### 1. Database Access at Build Time
**Problem**: Pages tried to fetch from database during build, but `DATABASE_URL` wasn't available
**Solution**: Pages now use `export const dynamic = 'force-dynamic'` to render on-demand

### 2. vercel.json Configuration  
**Problem**: Invalid JSON syntax with incorrect env and redirects sections
**Solution**: Corrected to valid Vercel configuration format

### 3. Prisma Setup
**Problem**: Environment variables not found during build
**Solution**: Pages skip pre-rendering and access DB on runtime

## Deployment Steps

### 1. Connect to Vercel
```bash
# If not already connected
npm i -g vercel
vercel link
```

### 2. Set Environment Variables in Vercel Dashboard

Go to **Project Settings → Environment Variables** and add:

```
DATABASE_URL=postgresql://user:password@host:5432/blogdb
NEXTAUTH_URL=https://yourdomain.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

**Optional OAuth Providers:**
```
GOOGLE_CLIENT_ID=your-value
GOOGLE_CLIENT_SECRET=your-value
GITHUB_CLIENT_ID=your-value
GITHUB_CLIENT_SECRET=your-value
```

### 3. Create PostgreSQL Database

Choose one:
- **Railway**: https://railway.app (Recommended)
- **Supabase**: https://supabase.com
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **PlanetScale**: https://planetscale.com

Copy the connection string as `DATABASE_URL`

### 4. Deploy

```bash
# Option 1: Via git push
git push origin main

# Option 2: Via Vercel CLI
vercel deploy --prod
```

### 5. Verify Deployment

After successful deployment:
1. Visit your site URL
2. Check `/admin` (should redirect to signin if not authenticated)
3. Monitor deployments at https://vercel.com/dashboard

## Important Notes

⚠️ **SQLite won't work on Vercel** - Use PostgreSQL or compatible database

⚠️ **First deployment may take longer** due to environment setup

✅ **Subsequent deployments are faster** with caching

## Database Migration

After first deployment:

```bash
# SSH into Vercel function (for first-time setup)
# Or run migrations manually with:
npx prisma migrate deploy --skip-generate
```

## Troubleshooting

### Build fails with "DATABASE_URL not found"
- ✅ Already fixed in current code
- Ensure DATABASE_URL is set in Vercel Environment Variables

### Page shows "Unable to load data"
- Check PostgreSQL connection string
- Verify database is running and accessible
- Check Network tab in browser dev tools

### API routes timing out
- Timeout set to 30 seconds (see vercel.json)
- Optimize database queries if needed
- Check PostgreSQL performance

## Rollback to Previous Version

```bash
# View previous deployments
vercel deployments

# Rollback to specific deployment
vercel rollback
```

## Support

For more details, see:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [API_DOCS.md](API_DOCS.md) - API reference
- [Vercel Docs](https://vercel.com/docs)
