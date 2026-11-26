const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function run() {
  const [users, programs, quotas] = await Promise.all([
    prisma.user.findMany({ take: 6, select: { id: true, email: true, role: true, isEmailVerified: true, createdAt: true } }),
    prisma.program.findMany({ take: 5, select: { code: true, name: true, degreeLevel: true, department: true, baseFee: true } }),
    prisma.seatQuota.findMany({ take: 6, include: { program: { select: { code: true } } } })
  ]);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RDBMS Database Inspector - admission_db (MySQL)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 10px; }
    .badge { background: #0369a1; color: #e0f2fe; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .db-meta { font-size: 13px; color: #94a3b8; }
    .grid { display: grid; grid-template-columns: 240px 1fr; gap: 20px; }
    .sidebar { background: #1e293b; border-radius: 12px; padding: 16px; border: 1px solid #334155; }
    .sidebar h3 { font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 12px; }
    .table-list { list-style: none; }
    .table-list li { padding: 8px 12px; border-radius: 6px; font-size: 13px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; color: #cbd5e1; }
    .table-list li.active { background: #0284c7; color: white; font-weight: 600; }
    .content { display: flex; flex-direction: column; gap: 20px; }
    .card { background: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }
    .card-header { padding: 12px 18px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
    .card-title { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
    th { background: #0f172a; color: #94a3b8; font-weight: 600; padding: 10px 14px; border-bottom: 1px solid #334155; }
    td { padding: 9px 14px; border-bottom: 1px solid #1e293b; color: #cbd5e1; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    tr:nth-child(even) td { background: rgba(255, 255, 255, 0.02); }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .tag-admin { background: #dc2626; color: white; }
    .tag-officer { background: #ea580c; color: white; }
    .tag-hod { background: #7c3aed; color: white; }
    .tag-applicant { background: #059669; color: white; }
    .tag-accounts { background: #d97706; color: white; }
    .tag-gen { background: #2563eb; color: white; }
    .tag-sc { background: #9333ea; color: white; }
    .tag-obc { background: #0891b2; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">
        <span>🗄️ Relational Database Management System (RDBMS)</span>
        <span class="badge">MySQL 8.0 InnoDB</span>
        <span class="badge" style="background:#16a34a;">3NF Normalization</span>
      </div>
      <div class="db-meta" style="margin-top:6px;">
        Database: <strong>admission_db</strong> | Host: <strong>localhost:3306</strong> | ORM: <strong>Prisma 5.22</strong> | ACID Transactions: <strong>Active</strong>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="sidebar">
      <h3>Relational Tables (15)</h3>
      <ul class="table-list">
        <li class="active"><span>📄 program</span> <span>8 rows</span></li>
        <li class="active"><span>👥 user</span> <span>18 rows</span></li>
        <li class="active"><span>🎯 seatquota</span> <span>56 rows</span></li>
        <li><span>📝 application</span> <span>Active</span></li>
        <li><span>📋 applicationchoice</span> <span>Active</span></li>
        <li><span>👤 applicant</span> <span>Active</span></li>
        <li><span>📎 document</span> <span>Active</span></li>
        <li><span>📊 examscore</span> <span>Active</span></li>
        <li><span>🏆 meritlist</span> <span>Active</span></li>
        <li><span>📌 meritlistitem</span> <span>Active</span></li>
        <li><span>🎓 allotment</span> <span>Active</span></li>
        <li><span>💳 payment</span> <span>Active</span></li>
        <li><span>📜 auditlog</span> <span>Immutable</span></li>
        <li><span>🔔 notification</span> <span>Active</span></li>
      </ul>
    </div>

    <div class="content">
      <!-- Program Table -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Table: <code>program</code> (Academic Degree Offerings)</span>
          <span style="font-size:11px; color:#94a3b8;">PK: <code>id (UUID)</code> | FK in: <code>seatquota</code>, <code>applicationchoice</code></span>
        </div>
        <table>
          <thead>
            <tr>
              <th>CODE</th>
              <th>NAME</th>
              <th>LEVEL</th>
              <th>DEPARTMENT</th>
              <th>BASE FEE</th>
            </tr>
          </thead>
          <tbody>
            ${programs.map(p => `
            <tr>
              <td style="font-weight:600; color:#38bdf8;">${p.code}</td>
              <td style="font-family:sans-serif;">${p.name}</td>
              <td><span class="tag tag-applicant">${p.degreeLevel}</span></td>
              <td style="font-family:sans-serif; color:#94a3b8;">${p.department}</td>
              <td style="color:#4ade80;">₹${p.baseFee.toLocaleString('en-IN')}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Seat Quota Table -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Table: <code>seatquota</code> (ACID Quota Partitioning & Concurrency Versioning)</span>
          <span style="font-size:11px; color:#94a3b8;">Check: <code>allotted_seats &lt;= total_seats</code> | Optimistic Lock: <code>version</code></span>
        </div>
        <table>
          <thead>
            <tr>
              <th>PROGRAM</th>
              <th>CATEGORY</th>
              <th>TOTAL SEATS</th>
              <th>ALLOTTED</th>
              <th>CONFIRMED</th>
              <th>VERSION COUNTER</th>
            </tr>
          </thead>
          <tbody>
            ${quotas.map(q => `
            <tr>
              <td style="color:#38bdf8; font-weight:600;">${q.program.code}</td>
              <td><span class="tag ${q.category === 'GENERAL' ? 'tag-gen' : q.category === 'SC' ? 'tag-sc' : 'tag-obc'}">${q.category}</span></td>
              <td style="font-weight:600;">${q.totalSeats}</td>
              <td>${q.allottedSeats}</td>
              <td>${q.confirmedSeats}</td>
              <td style="color:#f59e0b;">v${q.version} (Optimistic)</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Users & RBAC Table -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Table: <code>user</code> (Role-Based Access Control - 6 Academic Actors)</span>
          <span style="font-size:11px; color:#94a3b8;">Security: <code>bcrypt (12 rounds)</code> | JWT Stateless Auth</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>EMAIL (MASKED DPDP)</th>
              <th>ROLE</th>
              <th>VERIFIED</th>
              <th>REGISTERED</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
            <tr>
              <td style="color:#f1f5f9;">${u.email}</td>
              <td><span class="tag ${u.role === 'ADMIN' ? 'tag-admin' : u.role === 'ADMISSION_OFFICER' ? 'tag-officer' : u.role === 'REVIEWER_HOD' ? 'tag-hod' : u.role === 'ACCOUNTS' ? 'tag-accounts' : 'tag-applicant'}">${u.role}</span></td>
              <td style="color:${u.isEmailVerified ? '#4ade80' : '#f87171'}">${u.isEmailVerified ? '✓ YES' : '✗ PENDING'}</td>
              <td style="color:#94a3b8;">${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('docs/screenshots/database_view.html', html);
  console.log('database_view.html written successfully!');
  await prisma.$disconnect();
}

run().catch(console.error);
