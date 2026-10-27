import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Lock, Award, Mail, Phone, MapPin, ExternalLink, GraduationCap, Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#091522] text-slate-300 border-t border-slate-800">
      {/* Upper Help & Enquiry Strip */}
      <div className="bg-[#0e2034] py-4 px-4 sm:px-6 lg:px-8 border-b border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Centralized Admission Helpdesk Active (9:00 AM – 5:00 PM IST)</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="tel:+918480005390" className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Admissions: +91 8480005390 / +91 9501012152</span>
            </a>
            <a href="tel:01881270693" className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Landline: 01881-270794 / 270693</span>
            </a>
            <a href="mailto:admissions@ltsu.ac.in" className="flex items-center gap-1.5 text-slate-300 hover:text-amber-300 transition-colors">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>admissions@ltsu.ac.in</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: University Statutory Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white overflow-hidden shrink-0 border border-slate-300 shadow-sm flex items-center justify-center">
                <Image
                  src="/ltsu-logo.png"
                  alt="LTSU Seal"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight leading-tight">
                  Lamrin Tech Skills University
                </h3>
                <p className="text-[11px] text-amber-400 font-semibold">Punjab, India (Ropar)</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              First-of-its-kind Industry-Led Skill University in India, established under <strong className="text-slate-200">Punjab State Act No. 22 of 2021</strong> and recognized by the University Grants Commission (UGC) under Section 2(f) of the UGC Act 1956.
            </p>

            <div className="pt-1 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Industry Anchors: IBM, Tata Tech, Ansys, L&amp;T</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Building2 className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>100-Acre State-of-the-art Green Campus</span>
              </div>
            </div>
          </div>

          {/* Col 2: Academic Schools & Admissions */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider border-b border-slate-800 pb-1.5 text-amber-400">
              Academic Schools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/programs?school=USET" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>School of Engineering &amp; Tech (IBM)</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">B.Tech</span>
                </Link>
              </li>
              <li>
                <Link href="/programs?school=COMPUTING" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>School of Computing &amp; AI</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">BCA/MCA</span>
                </Link>
              </li>
              <li>
                <Link href="/programs?school=COMMERCE" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>School of Commerce &amp; Management</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">BBA/MBA</span>
                </Link>
              </li>
              <li>
                <Link href="/programs?school=PHARMACY" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>Rayat Institute of Pharmacy</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">B.Pharm</span>
                </Link>
              </li>
              <li>
                <Link href="/programs?school=NURSING" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>University College of Nursing</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">B.Sc</span>
                </Link>
              </li>
              <li>
                <Link href="/programs?school=POLYTECHNIC" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                  <span>University School of Polytechnic</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">Diploma</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Portals & Statutory Compliance */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider border-b border-slate-800 pb-1.5 text-amber-400">
              Official Portal Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://erp.ltsu.in/student-portal/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>LTSU Student ERP Login</span>
                </a>
              </li>
              <li>
                <a
                  href="https://app.jodo.in/lamrin/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>Online Fee Payment (Jodo Portal)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://nad.digilocker.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>National Academic Depository (NAD)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://esanad.nic.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>e-Sanad Document Verification</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.ltsu.ac.in/anti-ragging"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-amber-300"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Anti-Ragging Helpline (Toll Free: 1800-180-5522)</span>
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-0.5">DPDP Act 2023 Compliant</span>
                Applicant data and academic transcripts are encrypted and protected under national data privacy provisions.
              </div>
            </div>
          </div>

          {/* Col 4: University Campus Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider border-b border-slate-800 pb-1.5 text-amber-400">
              Campus Address &amp; Reach
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Lamrin Tech Skills University Punjab</strong><br />
                  Chandigarh–Jalandhar National Highway (NH 344A),<br />
                  Railmajra, Near Ropar (Rupnagar),<br />
                  Dist: Shaheed Bhagat Singh Nagar, Punjab – 144533.
                </span>
              </div>
              <div className="text-[11px] bg-slate-800/80 p-2 rounded border border-slate-700 text-slate-300">
                <span className="text-amber-300 font-semibold">Location Highlights:</span> 40 min drive from Chandigarh &amp; 6 KM drive from Ropar.
              </div>
              <div className="pt-1">
                <a
                  href="https://www.ltsu.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Official Website: www.ltsu.ac.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © 2026 Lamrin Tech Skills University Punjab, Ropar. All Rights Reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <Link href="/#reservation" className="hover:text-slate-300 transition-colors">
              Punjab 30% Reservation Norms
            </Link>
            <span>•</span>
            <Link href="/#scholarships" className="hover:text-slate-300 transition-colors">
              Scholarship Policy (SET-2026)
            </Link>
            <span>•</span>
            <a href="https://www.ltsu.ac.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="https://www.ltsu.ac.in/mandatory-disclosure" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">
              Mandatory Disclosure
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
