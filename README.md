# College Admission Management System

An enterprise-grade, auditable admissions portal engineered for higher education institutions. Streamlines the student lifecycle from application and document verification to merit generation, seat allotment, and fee reconciliation.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v20+ or v24+
- **npm**: v10+
- **Docker & Docker Compose**: v24+

### 2. Environment Configuration
Copy the sample environment file to `.env`:
```bash
cp .env.example .env
```

### 3. Start Infrastructure (PostgreSQL & Redis)
Ensure Docker Desktop is running, then start the database and cache services:
```bash
npm run docker:up
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Build Shared Packages & Run Migrations
```bash
# Generate Prisma Client & Run DB Migrations
npm run db:generate
npm run db:migrate

# Seed Deterministic Test Data (Programs, Seats, Staff & Applicants)
npm run db:seed
```

### 6. Start the Development Servers
```bash
npm run dev
```
- **Web Portal**: [http://localhost:3000](http://localhost:3000)
- **API Server**: [http://localhost:4000](http://localhost:4000)
- **Swagger OpenAPI Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 👥 Seed Credentials & Test Accounts

All accounts are pre-seeded with sample profiles and role assignments:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Password@123` | Institutional manager, quotas, programs, cut-offs |
| **Admission Officer** | `officer@college.edu` | `Password@123` | Document verifier, status transitions, review notes |
| **Reviewer / HOD** | `hod.cse@college.edu` | `Password@123` | Department chair for shortlisted applications |
| **Accounts** | `accounts@college.edu` | `Password@123` | Payment reconciliation, receipts, fee refunds |
| **Auditor** | `auditor@college.edu` | `Password@123` | Read-only audit log access and compliance reporting |
| **Applicant (Verified)** | `applicant.rahul@example.com` | `Applicant@123` | Pre-verified OBC candidate (Rahul Sharma) |
| **Applicant (Draft)** | `applicant.priya@example.com` | `Applicant@123` | General candidate with active draft application |

---

## 🧪 Testing

```bash
# Run unit tests across workspaces
npm run test

# Run API integration and RBAC test suite
npm run --workspace=apps/api test
```

---

## 🏛️ Architecture & Documentation
For full architectural blueprints, data flow diagrams, concurrency controls, and state transitions, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
