# College Admission Management System
### Relational Database Management System (RDBMS) Course Project Report

**Academic Context:** B.Tech Computer Science & Engineering — Database Systems Project  
**Submission Documents:**
- 📝 **Editable MS Word Document (.docx):** [PROJECT_REPORT_AND_SCREENSHOTS.docx](file:///C:/Users/itz_Ansh/Documents/RDBMS/PROJECT_REPORT_AND_SCREENSHOTS.docx) *(Fully editable in Microsoft Word / Google Docs)*
- 📄 **Print-Ready PDF (Exact 3 Pages, Large Screenshots, Minimal Text):** [PROJECT_REPORT_AND_SCREENSHOTS.pdf](file:///C:/Users/itz_Ansh/Documents/RDBMS/PROJECT_REPORT_AND_SCREENSHOTS.pdf)
- 🌐 **Interactive Standalone HTML:** [PROJECT_REPORT_AND_SCREENSHOTS.html](file:///C:/Users/itz_Ansh/Documents/RDBMS/PROJECT_REPORT_AND_SCREENSHOTS.html)
- 🖼️ **Screenshots Directory:** [docs/screenshots/](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/)

---

## Page 1: Project Overview & Main Portal Interface

### 1. Project Brief
A full-stack web application designed to manage university admissions digitally. It replaces manual paperwork with an online workflow where students can view programs, submit applications with certificates, and track admission status, while university staff verify credentials, allocate category quota seats, and confirm fee payments.

### 2. Quick Technical Highlights
- **Database Design:** **MySQL 8.0** with 14 normalized tables in 3NF. Uses `prisma.$transaction` and optimistic locking (`version` counter on `SeatQuota`) to prevent seat over-allocation.
- **Technologies Used:**
  - **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS.
  - **Backend & Database:** NestJS 10, Prisma ORM 5.22, JWT (access/refresh tokens), bcrypt hashing, and Redis for OTP rate limits.
- **User Roles:** Role-based access for 6 roles: **Applicant** (apply & pay), **Officer / HOD** (verify), **Accounts** (fees), and **Admin / Auditor** (quotas & logs).

### 3. Figure 1: University Admissions Portal (Home Page)
- **URL:** `http://localhost:3000/`
- **Screenshot:** ![University Admissions Portal Home Page](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/frontend_landing.png)
- **Overview:** The public admissions landing page outlining the 4-step admission process, active course statistics, and navigation links for applicant registration and login.

---

## Page 2: Frontend User Interfaces

### Figure 2: Academic Programs and Seat Matrix Catalog
- **URL:** `http://localhost:3000/programs`
- **Screenshot:** ![Academic Programs and Seat Matrix](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/frontend_programs.png)
- **Description:** Course directory showing undergraduate and postgraduate degrees (B.Tech CSE, BCA, B.Pharm, MCA, MBA) with eligibility criteria, tuition fees, and category-wise seat quotas.

### Figure 3: Applicant Registration
- **URL:** `http://localhost:3000/register`
- **Screenshot:** ![Applicant Registration Form](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/frontend_register.png)
- **Description:** Student registration form collecting applicant profile details and reservation category.

### Figure 4: User Sign-In Portal
- **URL:** `http://localhost:3000/login`
- **Screenshot:** ![User Sign-In Portal](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/frontend_login.png)
- **Description:** Central login screen verifying bcrypt password hashes and returning role-based JWT tokens.

---

## Page 3: Backend Services & Database Management

### Figure 5: REST API Documentation (OpenAPI / Swagger 3.0)
- **URL:** `http://localhost:4000/api/docs`
- **Screenshot:** ![Swagger REST API Docs](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/backend_swagger.png)
- **Description:** Interactive Swagger UI documenting backend endpoints for authentication, academic programs, seat quotas, and applications.

### Figure 6: MySQL Database Tables & Sample Data
- **Database:** `admission_db` (MySQL 8.0 via Prisma ORM)
- **Screenshot:** ![MySQL Database Tables](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/backend_database_schema.png)
- **Description:** MySQL relational tables managed via Prisma ORM showing courses, seat quotas with optimistic locking version counters, and user accounts.

### Figure 7: API Health Response
- **URL:** `http://localhost:4000/`
- **Screenshot:** ![API Root Health Response](file:///C:/Users/itz_Ansh/Documents/RDBMS/docs/screenshots/backend_api_response.png)
- **Description:** JSON endpoint reporting server uptime and documentation paths.

### Project Summary
The system demonstrates full-stack admission management. Connecting Next.js with NestJS and a normalized MySQL database, it automates student applications and uses database transactions to prevent seat over-allocation.
