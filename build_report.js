const fs = require('fs');
const path = require('path');

function getBase64Image(filename) {
  const filePath = path.join(__dirname, 'docs', 'screenshots', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  const ext = path.extname(filename).replace('.', '');
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

const landingImg = getBase64Image('frontend_landing.png');
const programsImg = getBase64Image('frontend_programs.png');
const loginImg = getBase64Image('frontend_login.png');
const registerImg = getBase64Image('frontend_register.png');
const swaggerImg = getBase64Image('backend_swagger.png');
const dbSchemaImg = getBase64Image('backend_database_schema.png');
const apiRootImg = getBase64Image('backend_api_response.png');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>College Admission Management System - Project Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    @page {
      size: A4 portrait;
      margin: 8mm 12mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #cbd5e1;
      line-height: 1.35;
      font-size: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .page {
      background: #ffffff;
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      padding: 10mm 14mm 8mm 14mm;
      margin: 15px auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }

    @media print {
      body {
        background: transparent;
      }
      .page {
        margin: 0;
        box-shadow: none;
        width: 210mm;
        height: 297mm;
        padding: 8mm 12mm 6mm 12mm;
      }
    }

    /* Minimal Academic Header */
    .header {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 5px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .project-title {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .project-subtitle {
      font-size: 10.5px;
      font-weight: 600;
      color: #0369a1;
      margin-top: 1px;
    }

    .header-meta {
      text-align: right;
      font-size: 9px;
      color: #64748b;
      line-height: 1.3;
    }

    .header-meta strong {
      color: #0f172a;
    }

    /* Minimalist Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 7px;
      margin: 6px 0 9px 0;
    }

    .info-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 5px 8px;
    }

    .info-card-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 2px;
    }

    .info-card-text {
      font-size: 9px;
      color: #475569;
      line-height: 1.35;
    }

    /* Screenshot Cards - EXTRA LARGE */
    .screenshot-card {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .screenshot-header {
      background: #f8fafc;
      padding: 4px 8px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .screenshot-title {
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
    }

    .screenshot-url {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5px;
      color: #64748b;
      background: #e2e8f0;
      padding: 1px 5px;
      border-radius: 3px;
    }

    .screenshot-desc {
      padding: 4px 8px;
      font-size: 9px;
      color: #475569;
      line-height: 1.3;
      background: #ffffff;
    }

    /* Enlarged Image Heights */
    .img-page1-hero {
      width: 100%;
      height: 380px;
      object-fit: cover;
      object-position: top;
      display: block;
      border-bottom: 1px solid #e2e8f0;
    }

    .img-full-width {
      width: 100%;
      height: 250px;
      object-fit: cover;
      object-position: top;
      display: block;
      border-bottom: 1px solid #e2e8f0;
    }

    .img-split {
      width: 100%;
      height: 290px;
      object-fit: cover;
      object-position: top;
      display: block;
      border-bottom: 1px solid #e2e8f0;
    }

    .img-mini {
      width: 100%;
      height: 60px;
      object-fit: cover;
      object-position: top;
      display: block;
      border-bottom: 1px solid #e2e8f0;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 0;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- ========================================== -->
  <!-- PAGE 1: PROJECT OVERVIEW & PORTAL HOME     -->
  <!-- ========================================== -->
  <div class="page">
    <div class="header">
      <div>
        <div class="project-title">College Admission Management System</div>
        <div class="project-subtitle">Relational Database Management System (RDBMS) Course Project</div>
      </div>
      <div class="header-meta">
        B.Tech Computer Science &amp; Engineering<br>
        <strong>Project Report</strong>
      </div>
    </div>

    <!-- Brief 2-line Intro -->
    <p style="margin-bottom: 4px; font-size: 10px; color: #334155;">
      A full-stack web application designed to manage university admissions digitally. It replaces manual paperwork with an online workflow where students can view programs, submit applications with certificates, and track admission status, while university staff verify credentials, allocate category quota seats, and confirm fee payments.
    </p>

    <!-- 3-Column Compact Technical Highlights -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-card-title">Database Design</div>
        <div class="info-card-text">
          <strong>MySQL 8.0</strong> with 14 normalized tables (3NF). Uses <code>prisma.$transaction</code> and optimistic locking (<code>version</code> counter) to prevent seat over-allocation.
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-title">Technologies Used</div>
        <div class="info-card-text">
          <strong>Frontend:</strong> Next.js 14, React 18, Tailwind CSS.<br>
          <strong>Backend:</strong> NestJS 10, Prisma ORM 5.22, JWT, bcrypt, and Redis for OTP rate limits.
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-title">User Roles</div>
        <div class="info-card-text">
          Role-based access for 6 roles: <strong>Applicant</strong> (apply &amp; pay), <strong>Officer/HOD</strong> (verify), <strong>Accounts</strong> (fees), and <strong>Admin/Auditor</strong> (quotas &amp; logs).
        </div>
      </div>
    </div>

    <!-- Extra Large Hero Screenshot: Home Page -->
    <div class="screenshot-card" style="margin-bottom: 0;">
      <div class="screenshot-header">
        <span class="screenshot-title">Figure 1: University Admissions Portal (Home Page)</span>
        <span class="screenshot-url">http://localhost:3000/</span>
      </div>
      <img src="${landingImg}" class="img-page1-hero" alt="Admissions Portal Home Page" />
      <div class="screenshot-desc">
        <strong>Overview:</strong> The public admissions landing page outlining the 4-step admission process, active course statistics, and navigation links for applicant registration and login.
      </div>
    </div>

    <div class="footer">
      <span>College Admission Management System • Project Overview</span>
      <span>Page 1 of 3</span>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 2: FRONTEND USER INTERFACES           -->
  <!-- ========================================== -->
  <div class="page">
    <div class="header">
      <div>
        <div class="project-title">Frontend User Interfaces</div>
        <div class="project-subtitle">Student Admissions Portal &amp; Applicant Workflows (Next.js 14)</div>
      </div>
      <div class="header-meta">
        Client Application<br>
        <strong>Next.js 14 &amp; Tailwind CSS</strong>
      </div>
    </div>

    <!-- Figure 2: Programs Catalog (LARGE FULL WIDTH) -->
    <div class="screenshot-card">
      <div class="screenshot-header">
        <span class="screenshot-title">Figure 2: Academic Programs and Seat Matrix Catalog</span>
        <span class="screenshot-url">http://localhost:3000/programs</span>
      </div>
      <img src="${programsImg}" class="img-full-width" alt="Academic Programs Catalog" />
      <div class="screenshot-desc">
        <strong>Description:</strong> Course directory showing undergraduate and postgraduate degrees (B.Tech CSE, BCA, B.Pharm, MCA, MBA) with eligibility criteria, tuition fees, and category-wise seat quotas.
      </div>
    </div>

    <!-- Figures 3 & 4: Registration & Login Side-by-Side (LARGE SPLIT) -->
    <div class="grid-2">
      <!-- Registration -->
      <div class="screenshot-card" style="margin-bottom: 0;">
        <div class="screenshot-header">
          <span class="screenshot-title">Figure 3: Applicant Registration</span>
          <span class="screenshot-url">/register</span>
        </div>
        <img src="${registerImg}" class="img-split" alt="Applicant Registration Form" />
        <div class="screenshot-desc">
          <strong>Description:</strong> Student registration form collecting applicant profile details and reservation category.
        </div>
      </div>

      <!-- Login -->
      <div class="screenshot-card" style="margin-bottom: 0;">
        <div class="screenshot-header">
          <span class="screenshot-title">Figure 4: User Sign-In Portal</span>
          <span class="screenshot-url">/login</span>
        </div>
        <img src="${loginImg}" class="img-split" alt="User Sign-In Portal" />
        <div class="screenshot-desc">
          <strong>Description:</strong> Central login screen verifying bcrypt password hashes and returning role-based JWT tokens.
        </div>
      </div>
    </div>

    <div class="footer">
      <span>College Admission Management System • Frontend User Interfaces</span>
      <span>Page 2 of 3</span>
    </div>
  </div>

  <!-- ========================================== -->
  <!-- PAGE 3: BACKEND SERVICES & DATABASE        -->
  <!-- ========================================== -->
  <div class="page">
    <div class="header">
      <div>
        <div class="project-title">Backend Services &amp; Database Management</div>
        <div class="project-subtitle">NestJS REST API • MySQL 8.0 • Prisma ORM</div>
      </div>
      <div class="header-meta">
        Server &amp; Database Tier<br>
        <strong>Backend Architecture</strong>
      </div>
    </div>

    <!-- Figure 5: Swagger API Docs (LARGE FULL WIDTH) -->
    <div class="screenshot-card">
      <div class="screenshot-header">
        <span class="screenshot-title">Figure 5: REST API Documentation (OpenAPI / Swagger 3.0)</span>
        <span class="screenshot-url">http://localhost:4000/api/docs</span>
      </div>
      <img src="${swaggerImg}" class="img-full-width" alt="Swagger REST API Docs" />
      <div class="screenshot-desc">
        <strong>Description:</strong> Interactive Swagger UI documenting backend endpoints for authentication, academic programs, seat quotas, and applications.
      </div>
    </div>

    <!-- Figure 6: Database Inspector (LARGE FULL WIDTH) -->
    <div class="screenshot-card">
      <div class="screenshot-header">
        <span class="screenshot-title">Figure 6: MySQL Database Tables &amp; Sample Data</span>
        <span class="screenshot-url">Database: admission_db (MySQL 8.0)</span>
      </div>
      <img src="${dbSchemaImg}" class="img-full-width" alt="MySQL Database Tables" />
      <div class="screenshot-desc">
        <strong>Description:</strong> MySQL relational tables managed via Prisma ORM showing courses, seat quotas with optimistic locking version counters, and user accounts.
      </div>
    </div>

    <!-- Bottom Split: API Health Check + 1-Sentence Summary -->
    <div class="grid-2">
      <!-- API Health Check -->
      <div class="screenshot-card" style="margin-bottom: 0;">
        <div class="screenshot-header">
          <span class="screenshot-title">Figure 7: API Health Response</span>
          <span class="screenshot-url">http://localhost:4000/</span>
        </div>
        <img src="${apiRootImg}" class="img-mini" alt="API Root Health Response" />
        <div class="screenshot-desc">
          <strong>Description:</strong> JSON endpoint reporting server uptime and documentation paths.
        </div>
      </div>

      <!-- Project Summary -->
      <div class="info-card" style="display: flex; flex-direction: column; justify-content: center; background: #f8fafc; border-left: 3px solid #0284c7;">
        <div style="font-size: 9.5px; color: #0f172a; font-weight: 700; margin-bottom: 2px;">
          Project Summary
        </div>
        <div style="font-size: 8.5px; color: #475569; line-height: 1.35;">
          The system demonstrates full-stack admission management. Connecting Next.js with NestJS and a normalized MySQL database, it automates student applications and uses database transactions to prevent seat over-allocation.
        </div>
      </div>
    </div>

    <div class="footer">
      <span>College Admission Management System • Backend Services &amp; Database</span>
      <span>Page 3 of 3</span>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'PROJECT_REPORT_AND_SCREENSHOTS.html'), html);
console.log('Updated PROJECT_REPORT_AND_SCREENSHOTS.html with minimized text written successfully!');
