# Security Policy

## 🎓 Academic Project Context
This software was engineered as an academic capstone / college project demonstrating Relational Database Management Systems (RDBMS), secure multi-tenant architectures, and state-of-the-art web application security.

---

## 🔒 Security Principles Enforced
1. **Zero Secret Leakage**: No credentials, private keys, or tokens are committed to source control. Environment configurations are managed via `.env.example` and isolated per environment.
2. **Data Privacy (DPDP Act 2023 Compliance)**:
   - Personal identification numbers (such as Aadhaar) are stored masked (`XXXX-XXXX-1234`).
   - Explicit DPDP digital consent timestamps are captured during applicant onboarding.
   - Access to personally identifiable information (PII) is restricted by role and logged immutably.
3. **Role-Based Access Control (RBAC)**: All API routes enforce server-side validation via NestJS `JwtAuthGuard` and `RolesGuard`.
4. **Concurrency & Data Integrity**: Seat quota allocations and transactional state changes execute inside ACID transactions with optimistic locking to prevent race conditions or over-subscription.
5. **Private Object Storage**: Verification documents are kept in private S3/MinIO buckets; access is granted only through short-lived presigned URLs (15-minute TTL).

---

## 🛡️ Reporting a Vulnerability
If you discover a security vulnerability or discrepancy within this project:
- Please **do not** open a public issue.
- Report the issue directly to the project author / student maintainer via email or submit a private security advisory through GitHub.
- Include detailed steps to reproduce the vulnerability.

We appreciate responsible disclosure and will review any academic or architectural vulnerability reports promptly.
