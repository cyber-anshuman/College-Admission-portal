import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Award, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institutional Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg tracking-tight">
              Apex Institute of Technology & Management
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Approved by AICTE, Affiliated to State Technological University. Accredited NAAC Grade A++ and NBA for Engineering & Management.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Award className="w-4 h-4" />
              <span>NIRF Ranked Top 50 Engineering Institute</span>
            </div>
          </div>

          {/* Col 2: Admissions Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Admissions 2026-27
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">
                  B.Tech Engineering Programs
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">
                  Postgraduate (MBA / MCA)
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">
                  Seat Matrix & Reservations
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Applicant Portal Login
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Officers & Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Security */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Security & Compliance
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Compliant with India's Digital Personal Data Protection (DPDP) Act 2023.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Encrypted private document storage with time-bounded signed access.</span>
              </div>
              <p className="pt-2 text-[11px] text-slate-500">
                Audited transactional state machine with immutable logging.
              </p>
            </div>
          </div>

          {/* Col 4: Admissions Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
              Admissions Helpdesk
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>admissions@apex-institute.edu.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+91 (011) 2876-5400 / 01</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Institutional Area, Knowledge Park III, Tech Hub</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Apex Institute of Technology & Management. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-400">Terms of Admission</Link>
            <Link href="/programs" className="hover:text-slate-400">Eligibility Regulations</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
