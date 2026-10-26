# Production Deployment Guide: College Admission Management System

This guide outlines the production deployment strategy for the monorepo on **Vercel** and managed cloud infrastructure.

---

## 1. Required Cloud Infrastructure & Accounts

Before deploying to Vercel, provision the following external managed services:

| Component | Recommended Managed Services | Notes |
| :--- | :--- | :--- |
| **Hosting Platform** | [Vercel](https://vercel.com) | Pro or Hobby account with GitHub integration. |
| **Relational Database** | AWS RDS MySQL 8.0, PlanetScale, Aiven, or DigitalOcean Managed MySQL | Must support MySQL 8.0 with InnoDB and SSL/TLS. |
| **Cache & Session Store** | [Upstash Redis](https://upstash.com), Redis Cloud, or AWS ElastiCache | TLS connection string (`rediss://...`) required for serverless connections. |
| **Private Document Storage** | AWS S3 or Cloudflare R2 | Private buckets for student marksheets, ID proof, and fee receipts. |
| **SMS/OTP Gateway** (Optional) | Twilio, AWS SNS, or MSG91 | Required if OTP login is enabled in production (`OTP_PROVIDER != log`). |

---

## 2. Environment Variables Configuration

Set these environment variables in your **Vercel Project Settings > Environment Variables**:

### A. API Service (`apps/api`)
```ini
NODE_ENV=production
PORT=4000
API_PREFIX=api

# Database connection pool (Include connection_limit for serverless)
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl={"rejectUnauthorized":true}&connection_limit=10

# Managed Redis (Upstash / Redis Cloud)
REDIS_URL=rediss://default:PASSWORD@HOST:PORT
REDIS_TLS=true

# Cryptographically Secure JWT Secrets (Generate with: openssl rand -hex 32)
JWT_SECRET=<64_character_hex_string_1>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<64_character_hex_string_2>
JWT_REFRESH_EXPIRES_IN=7d

# S3 / MinIO Private Document Storage
S3_ENDPOINT=s3.amazonaws.com
S3_PORT=443
S3_USE_SSL=true
S3_ACCESS_KEY=<aws_access_key>
S3_SECRET_KEY=<aws_secret_key>
S3_BUCKET_DOCUMENTS=college-admission-documents-prod
S3_BUCKET_RECEIPTS=college-admission-receipts-prod

# Security & Reverse Proxy
CORS_ORIGIN=https://admission.yourdomain.com
THROTTLE_TTL=60
THROTTLE_LIMIT=100
TRUST_PROXY=1
OTP_PROVIDER=log
ENABLE_SWAGGER=false
```

### B. Web Frontend (`apps/web`)
```ini
NEXT_PUBLIC_APP_NAME="Apex Institute of Technology"
NEXT_PUBLIC_API_URL=https://admission.yourdomain.com/api
INTERNAL_API_URL=https://admission.yourdomain.com
```

---

## 3. Local Development Commands

```powershell
# 1. Install monorepo dependencies
npm install

# 2. Start local Redis container
docker compose -f infra/docker-compose.yml up -d redis

# 3. Generate Prisma ORM client
npm run db:generate

# 4. Start local development servers (Next.js :3000 and NestJS :4000)
npm run dev
```

---

## 4. Database Migration Workflow

### Local Development Migrations
When modifying `packages/database/prisma/schema.prisma`:
```powershell
npx prisma migrate dev --name <migration_name> --schema=packages/database/prisma/schema.prisma
```

### Production Deployment Migrations (CI/CD Pipeline)
Never run `prisma migrate dev` against production databases. Always use `migrate deploy`:
```powershell
npx prisma migrate deploy --schema=packages/database/prisma/schema.prisma
```

---

## 5. Build and Test Validation

Verify that all packages compile and test cleanly:
```powershell
# 1. Compile all workspaces (Turborepo)
npm run build

# 2. Run unit tests
npm test

# 3. Run end-to-end test suite
npm run --workspace=@admission/api test:e2e
```

---

## 6. Vercel Deployment Instructions

### Architecture Option A: Single-Project Vercel Services (Recommended)
The repository includes a root `vercel.json` configured for Vercel Services:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "web": {
      "root": "apps/web",
      "framework": "nextjs"
    },
    "api": {
      "root": "apps/api"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": { "service": "api" }
    },
    {
      "source": "/(.*)",
      "destination": { "service": "web" }
    }
  ]
}
```
1. In Vercel, select **Add New Project** and import the GitHub repository: `https://github.com/cyber-anshuman/College-Admission-portal`.
2. Keep the **Root Directory** as `./` (repository root).
3. Add the production environment variables listed in Section 2.
4. Click **Deploy**. Vercel will build both services and map `/api/*` to the NestJS backend and all remaining routes to the Next.js frontend under your single production domain.

### Architecture Option B: Two Independent Vercel Projects
If your Vercel plan does not have Vercel Services enabled:
1. **Frontend Project:**
   - Root directory: `apps/web`.
   - Framework preset: `Next.js`.
   - Set `INTERNAL_API_URL` to your API service domain (e.g. `https://api.yourdomain.com`). Next.js rewrite in `next.config.mjs` will proxy `/api/*` requests.
2. **Backend API Project:**
   - Root directory: `apps/api`.
   - Build command: `npm run build`.
   - Output directory: `dist`.

---

## 7. Production Health & Observability Probes

The NestJS backend includes standard observability endpoints:
- **Liveness Probe**: `GET /api/health/live`
  - Returns `200 OK` (`{ status: "up" }`) indicating the application instance is alive.
- **Readiness Probe**: `GET /api/health/ready`
  - Queries MySQL (`SELECT 1`) and verifies Redis status (`ready`).
  - Returns `200 OK` if both services are healthy. Returns `503 Service Unavailable` if either is unreachable.

---

## 8. Redis & Background Worker Deployment

> [!IMPORTANT]
> **Vercel Serverless Function Execution Model:**
> Vercel executes serverless functions on-demand with execution timeouts (10s to 60s). Persistent background daemons, long-running WebSocket connections, and persistent queue consumers (such as BullMQ workers listening for events) **cannot** run inside Vercel serverless functions.

**Recommended Solution:**
1. **Cache & Session Management:**
   - Use [Upstash Redis](https://upstash.com) or Redis Cloud with TLS (`REDIS_URL=rediss://...`).
   - The application uses Redis for refresh token rotation, concurrency grace windows, OTP storage, and rate limiting.
2. **Background Jobs & Email/SMS Notifications:**
   - Deploy background workers as a lightweight container service on [Railway](https://railway.app), [Render](https://render.com), or AWS ECS connecting to the shared Redis instance.
   - Alternatively, trigger webhook jobs using **Upstash QStash** or **Vercel Cron Jobs** targeting API endpoints (e.g. `POST /api/jobs/process-allotments`).

---

## 9. Rollback and Disaster Recovery Guidance

1. **Database Backups:**
   - Enable automated point-in-time recovery (PITR) on your managed MySQL database.
   - The repository preserves PostgreSQL rollback archives in `packages/database/prisma/migrations.postgresql.backup/`.
2. **Vercel Instant Rollback:**
   - In the Vercel Dashboard, go to **Deployments**.
   - Select any previous deployment and click **Rollback to this Deployment** for instant zero-downtime rollback.
