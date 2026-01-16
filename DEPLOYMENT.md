# BlogPlatform Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

Create a `.env` file with the following required variables:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:password@localhost:5432/blogdb"  # PostgreSQL for production

# Next Auth
NEXTAUTH_URL="https://yourdomain.com"  # Your production URL
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# Email Notifications (Optional)
NOTIFY_EMAIL="your-email@gmail.com"
NOTIFY_EMAIL_PASS="your-app-password"
```

### 2. Vercel Deployment

> ⚠️ **Important**: This application requires a database connection. SQLite won't work on Vercel (serverless environment). Use PostgreSQL or similar.

#### Setup Steps:

1. **Create a PostgreSQL database** on Railway, Supabase, or similar
2. **Add Environment Variables to Vercel**:
   - Go to Project Settings → Environment Variables
   - Add all required variables (see `.env.example`)
   - For production: Use PostgreSQL DATABASE_URL, not SQLite

3. **Example Vercel Environment Variables**:
```
DATABASE_URL=postgresql://user:password@host:5432/blogdb
NEXTAUTH_URL=https://yourdomain.vercel.app
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
```

4. **Deploy**:
```bash
vercel deploy
```

The build will now work because:
- Database is available during build
- Pages with `export const dynamic = 'force-dynamic'` skip pre-rendering
- API routes work on demand with database access

### 3. Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

### 4. Database Setup

#### For SQLite (Development Only)
```bash
npm run db:push
npm run db:seed
```

#### For PostgreSQL (Production)
```bash
# Update DATABASE_URL in .env with PostgreSQL connection string
npm run db:push
npm run db:seed
```

### 4. Create Admin User

```bash
npm run create:admin
```

This will prompt you to create an admin account.

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/blogplatform.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Configure Database**
   - Use Vercel Postgres or external PostgreSQL
   - Update DATABASE_URL in Vercel environment variables

### Option 2: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)

2. **Create New Project**
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add PostgreSQL Database**
   - Add PostgreSQL from Railway marketplace
   - Copy DATABASE_URL

4. **Configure Environment Variables**
   - Add all required environment variables
   - Save and deploy

### Option 3: Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   RUN npx prisma generate
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and Run**
   ```bash
   docker build -t blogplatform .
   docker run -p 3000:3000 --env-file .env blogplatform
   ```

### Option 4: VPS (Ubuntu)

1. **Install Node.js and dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Clone and Setup**
   ```bash
   git clone https://github.com/yourusername/blogplatform.git
   cd blogplatform
   npm install
   npm run build
   ```

3. **Run with PM2**
   ```bash
   pm2 start npm --name "blogplatform" -- start
   pm2 save
   pm2 startup
   ```

4. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Setup SSL with Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Post-Deployment Configuration

### 1. Update Site Settings

Navigate to `/admin/settings` and configure:
- Site name and description
- Logo and favicon
- Social media links
- Google Analytics ID (optional)

### 2. Configure Task Reminders

Set up a cron job to run task reminders:

```bash
# Add to crontab
crontab -e

# Run task reminders daily at 9 AM
0 9 * * * cd /path/to/blogplatform && npm run task:reminders
```

Or use a service like cron-job.org to hit the reminder endpoint.

### 3. Setup Automatic Backups

#### Database Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_URL="your-database-url"

# For PostgreSQL
pg_dump $DB_URL > $BACKUP_DIR/backup_$DATE.sql

# For SQLite
cp ./prisma/dev.db $BACKUP_DIR/backup_$DATE.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*" -mtime +7 -delete
```

### 4. Configure Email Service

For production, use a dedicated email service:
- **SendGrid**: For transactional emails
- **AWS SES**: Cost-effective for high volume
- **Mailgun**: Developer-friendly
- **Gmail**: For development only

## Performance Optimization

### 1. Enable Caching

Add caching headers in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

### 2. Image Optimization

- Use Next.js Image component for automatic optimization
- Store images in a CDN (Cloudinary, AWS S3, etc.)
- Enable WebP format

### 3. Database Optimization

- Add indexes for frequently queried fields
- Use connection pooling
- Enable query caching

## Security Checklist

- [ ] Use strong NEXTAUTH_SECRET (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie settings
- [ ] Implement rate limiting on APIs
- [ ] Sanitize user inputs
- [ ] Enable CORS only for trusted domains
- [ ] Regular dependency updates (`npm audit fix`)
- [ ] Implement CSP headers
- [ ] Regular database backups
- [ ] Monitor error logs

## Monitoring

### Setup Error Tracking

1. **Sentry** (Recommended)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Add `@vercel/analytics` package

### Health Checks

Create a health check endpoint at `/api/health`:

```typescript
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify database is accessible
   - Run `npx prisma generate`

2. **NextAuth Session Error**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Clear cookies and try again

3. **Build Failures**
   - Check Node.js version (18+)
   - Clear `.next` folder and rebuild
   - Check for TypeScript errors

4. **Image Upload Issues**
   - Verify `public/uploads` directory exists
   - Check file permissions
   - Verify disk space

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/blogplatform/issues
- Documentation: https://yourdomain.com/docs
- Email: support@yourdomain.com
