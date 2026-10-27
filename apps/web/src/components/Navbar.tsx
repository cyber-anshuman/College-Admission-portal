'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Phone,
  Mail,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { api } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1); // 0 = A-, 1 = A, 2 = A+

  useEffect(() => {
    api.getMe()
      .then((res) => {
        if (res.data) setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
    router.push('/login');
  };

  const cycleFontSize = (level: number) => {
    setFontSizeLevel(level);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (level === 0) root.style.fontSize = '14px';
      else if (level === 2) root.style.fontSize = '18px';
      else root.style.fontSize = '16px';
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. Punjab Government / State Top Bar (Matching admission.punjab.gov.in) */}
      <div className="bg-[#0b1c2d] text-slate-300 text-xs border-b border-slate-700/60 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Statutory Recognition */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium text-xs">
              Estd. Under Punjab State Act No. 22 of 2021 • UGC Recognized under Sec 2(f)
            </span>
          </div>

          {/* Quick Helplines & Accessibility */}
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="tel:01881270693"
              className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Helpline: 01881-270693 / +91 8480005390</span>
            </a>
            <a
              href="mailto:admissions@ltsu.ac.in"
              className="hidden lg:flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors"
            >
              <Mail className="w-3 h-3 text-blue-400" />
              <span>admissions@ltsu.ac.in</span>
            </a>

            {/* Accessibility Font Size Switcher */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              <span className="text-[10px] text-slate-400 mr-1">Text:</span>
              <button
                type="button"
                onClick={() => cycleFontSize(0)}
                className={`px-1 rounded font-bold hover:text-white ${fontSizeLevel === 0 ? 'text-amber-400' : 'text-slate-400'}`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => cycleFontSize(1)}
                className={`px-1 rounded font-bold hover:text-white ${fontSizeLevel === 1 ? 'text-amber-400' : 'text-slate-400'}`}
                title="Normal font size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => cycleFontSize(2)}
                className={`px-1 rounded font-bold hover:text-white ${fontSizeLevel === 2 ? 'text-amber-400' : 'text-slate-400'}`}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Institutional Branding Header */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* LTSU Logo & Title */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
            {/* LTSU Official Seal / Logo */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-md bg-white border border-slate-200 flex items-center justify-center">
              <Image
                src="/ltsu-logo.png"
                alt="Lamrin Tech Skills University Punjab"
                width={56}
                height={56}
                className="w-full h-full object-contain p-0.5"
                priority
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl lg:text-2xl leading-tight">
                  Lamrin Tech Skills University Punjab
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                  Session 2026-27
                </span>
              </div>
            </div>
          </Link>

          {/* Industry Anchor Badges & Quick Action CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Industry Partners Strip */}
            <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-extrabold tracking-wider border border-slate-200">
                IBM
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                ANSYS
              </span>
              <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                L&amp;T
              </span>
            </div>

            {/* Auth / Action Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#163a5f] hover:bg-[#0b1c2d] transition-all shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 transition-all shadow-md shadow-amber-500/20 animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New Candidate Registration</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Bar (Centralized Admission Portal Theme: Deep Navy & Gold) */}
      <nav className="bg-[#12283e] text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs font-semibold">
            <div className="flex items-center space-x-1 lg:space-x-2">
              <Link
                href="/"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-amber-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#about-ltsu"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                About LTSU
              </Link>
              <Link
                href="/programs"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                Programs &amp; Seat Matrix
              </Link>
              <Link
                href="/#schedule"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                Admission Schedule 2026-27
              </Link>
              <Link
                href="/#reservation"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                Punjab Quota (30%) &amp; Reservations
              </Link>
              <Link
                href="/#scholarships"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                LTSU-SET &amp; Scholarships
              </Link>
              <Link
                href="/#downloads"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                Prospectus &amp; Notices
              </Link>
              <Link
                href="/#helpdesk"
                className="px-3 py-1.5 rounded hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
              >
                Helpdesk
              </Link>
            </div>


          </div>
        </div>
      </nav>

      {/* 4. Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0b1c2d] text-white border-b border-slate-700 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded bg-white/10 text-amber-300 text-sm font-semibold"
            >
              Home
            </Link>
            <Link
              href="/#about-ltsu"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded hover:bg-white/5 text-slate-200 text-sm font-medium"
            >
              About LTSU
            </Link>
            <Link
              href="/programs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded hover:bg-white/5 text-slate-200 text-sm font-medium"
            >
              Programs &amp; Seat Matrix
            </Link>
            <Link
              href="/#schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded hover:bg-white/5 text-slate-200 text-sm font-medium"
            >
              Admission Schedule 2026-27
            </Link>
            <Link
              href="/#reservation"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded hover:bg-white/5 text-slate-200 text-sm font-medium"
            >
              Punjab Quota (30%) &amp; Reservation
            </Link>
            <Link
              href="/#scholarships"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded hover:bg-white/5 text-slate-200 text-sm font-medium"
            >
              LTSU-SET 2026 Scholarship
            </Link>
            <Link
              href="/#downloads"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded hover:bg-white/5 text-slate-200 text-sm font-medium"
            >
              Prospectus &amp; Circulars
            </Link>
            <Link
              href="/#helpdesk"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded hover:bg-white/5 text-slate-200 text-sm font-medium"
            >
              Contact &amp; Helpline
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-700 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm"
                >
                  Go to Candidate Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-rose-600/30 text-rose-300 font-semibold text-sm border border-rose-500/40"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md"
                >
                  New Candidate Registration
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-600"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
