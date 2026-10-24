'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  FileText,
  CreditCard,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  Clock,
  Lock,
} from 'lucide-react';
import { api } from '../lib/api';

export default function HomePage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [totalSeats, setTotalSeats] = useState<number>(360);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPrograms()
      .then((data) => {
        if (Array.isArray(data)) {
          setPrograms(data);
          const total = data.reduce((acc, p) => acc + (p.totalSeats || 0), 0);
          setTotalSeats(total || 360);
        }
      })
      .catch((err) => {
        console.warn('Using initial static program catalog:', err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const workflowSteps = [
    { title: '1. Register & Profile', desc: 'OTP/Password signup with DPDP consent' },
    { title: '2. Multi-Step Form', desc: 'Academic scores, preferences & drafts' },
    { title: '3. Document Upload', desc: 'Encrypted S3 private document vault' },
    { title: '4. Officer Verification', desc: 'Scrutiny, approval or return notes' },
    { title: '5. Merit Ranking', desc: 'Configurable criteria & category lists' },
    { title: '6. Seat Allotment', desc: 'Atomic transactional allocation' },
    { title: '7. Fee Payment', desc: 'Integrated gateway & digital receipts' },
    { title: '8. Enrolment', desc: 'Admitted student ID & confirmation' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative mesh-gradient text-white overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-emerald-300 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Centralized Admissions Portal • Academic Session 2026-27</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              One Portal from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">Enquiry to Confirmed Seat</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
              Apex Institute of Technology & Management presents a fully digital, auditable admissions workflow. Apply online, upload encrypted credentials, track real-time merit status, and complete fee reconciliation seamlessly.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
              >
                Start Online Application
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur transition-all"
              >
                Track Status & Sign In
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Explore Seat Matrix
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{totalSeats}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Total Sanctioned Seats</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white tracking-tight">5</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Degree Programs</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">100%</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Paperless & Auditable</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-blue-400 tracking-tight">DPDP 2023</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Data Privacy Protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admissions Status Workflow Section */}
      <section id="status-workflow" className="py-16 sm:py-20 bg-slate-50 px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-institutional-600 bg-institutional-100 px-3 py-1 rounded-full">
              Transparent Lifecycle
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">
              State-Machine Governed Admission Journey
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every status transition is validated server-side, immutably recorded in the audit log, and instant notifications are dispatched to applicants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-institutional-50 text-institutional-700 flex items-center justify-center font-bold text-xs mb-3 border border-institutional-200">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{step.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Preview Section */}
      <section className="py-16 sm:py-20 bg-white px-4 sm:px-6 lg:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Offered Programs
              </span>
              <h2 className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">
                Academic Programs & Quota Matrix
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Explore engineering and management programs with reservation quotas (General, OBC-NCL, SC, ST, EWS).
              </p>
            </div>
            <Link
              href="/programs"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-semibold text-institutional-700 hover:text-institutional-900"
            >
              View Full Seat Matrix Table
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(programs.length > 0 ? programs.slice(0, 3) : [
              {
                code: 'BTECH-CSE',
                name: 'B.Tech in Computer Science and Engineering',
                department: 'Computer Science & Engineering',
                durationYears: 4,
                baseFee: 125000,
                totalSeats: 120,
              },
              {
                code: 'BTECH-ECE',
                name: 'B.Tech in Electronics & Communication',
                department: 'Electronics & Communication',
                durationYears: 4,
                baseFee: 115000,
                totalSeats: 60,
              },
              {
                code: 'MBA-GEN',
                name: 'Master of Business Administration (MBA)',
                department: 'Management Studies',
                durationYears: 2,
                baseFee: 175000,
                totalSeats: 60,
              },
            ]).map((prog) => (
              <div
                key={prog.code}
                className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-institutional-300 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {prog.code}
                    </span>
                    <span>{prog.durationYears} Years Full-Time</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{prog.department}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Total Seats</span>
                      <p className="font-bold text-slate-800 text-sm">{prog.totalSeats} Seats</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Annual Tuition</span>
                      <p className="font-bold text-institutional-700 text-sm">
                        ₹{prog.baseFee?.toLocaleString('en-IN') || '1,25,000'}/yr
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/programs#${prog.code}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    View Quota Breakdown
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portals by Actor Role */}
      <section className="py-16 bg-slate-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Role-Based Portals & Access Control
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Dedicated interfaces enforcing fine-grained RBAC with audit logging.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { role: 'Applicant', color: 'blue', desc: 'Application, uploads & payments' },
              { role: 'Admission Officer', color: 'indigo', desc: 'Document verification' },
              { role: 'Reviewer / HOD', color: 'violet', desc: 'Departmental review' },
              { role: 'Accounts', color: 'amber', desc: 'Payment reconciliation' },
              { role: 'Admin', color: 'purple', desc: 'Courses, quotas & cut-offs' },
              { role: 'Auditor', color: 'emerald', desc: 'Read-only audit trails' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                    {item.role}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">{item.desc}</p>
                </div>
                <Link
                  href="/login"
                  className="mt-3 text-[11px] font-semibold text-institutional-600 hover:underline"
                >
                  Portal Login →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
