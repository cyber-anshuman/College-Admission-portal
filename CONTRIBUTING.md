# Contributing to the College Admission Management System

Thank you for your interest in contributing to the **College Admission Management System**, an academic capstone and RDBMS project.

---

## 🎓 Academic Guidelines & Integrity
This repository serves as a coursework project for a university curriculum. Contributors must uphold high standards of academic integrity and engineering quality:
- Ensure database normalization (3NF) and foreign-key integrity are preserved.
- Never hardcode mock secrets or passwords in commit history.
- Ensure all business operations that modify seat counts or payments are wrapped in database transactions.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or `v24.x`
- **npm**: `v10.x` or `v11.x`
- **Docker & Docker Compose**: PostgreSQL 16 & Redis 7

### 2. Monorepo Workflow
We utilize **Turborepo** with npm workspaces:

```bash
# Clone the repository
git clone https://github.com/cyber-anshuman/College-Admission-portal.git
cd College-Admission-portal

# Install dependencies across all workspaces
npm install

# Setup environment variables
cp .env.example .env

# Start local PostgreSQL & Redis via Docker
npm run docker:up

# Generate Prisma client and run database migrations
npm run db:generate
npm run db:migrate

# Seed test database with academic programs & test accounts
npm run db:seed

# Start development servers (Next.js web: 3000, NestJS API: 4000)
npm run dev
```

---

## 🌿 Branching & Git Conventions

### Branch Naming
- `feature/phase-X-feature-name` (e.g. `feature/phase-2-document-upload`)
- `fix/issue-description` (e.g. `fix/seat-quota-constraint`)
- `docs/documentation-update` (e.g. `docs/er-diagram-update`)

### Commit Messages (Conventional Commits)
Please adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat(scope)`: A new feature or phase deliverable
- `fix(scope)`: A bug fix
- `docs(scope)`: Documentation changes only
- `test(scope)`: Adding or correcting tests
- `refactor(scope)`: Code change that neither fixes a bug nor adds a feature

*Example*: `feat(phase-2): add applicant multi-step form with auto-save draft`

---

## 🧪 Testing Requirements
Before submitting a pull request, verify that all checks pass:

```bash
# Run monorepo unit tests
npm test

# Verify production builds for shared, API, and Web
npm run build
```

---

## 📬 Submitting a Pull Request
1. Fork and create a feature branch.
2. Commit your changes following Conventional Commits.
3. Push to your fork and submit a Pull Request against `master`.
4. Fill out the [Pull Request Template](.github/pull_request_template.md).
