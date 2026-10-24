'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { getStoredUser, clearStoredToken } from '../lib/api';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    setUser(null);
    router.push('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ADMISSION_OFFICER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'REVIEWER_HOD':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'ACCOUNTS':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'AUDITOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & College Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-institutional-800 to-institutional-600 flex items-center justify-center text-white shadow-md shadow-institutional-900/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-lg leading-tight">
                  Apex Institute
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wide border border-emerald-200">
                  Admissions 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Technology & Management</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-institutional-700 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/programs"
              className="text-sm font-medium text-slate-600 hover:text-institutional-700 transition-colors"
            >
              Programs & Seat Matrix
            </Link>
            <Link
              href="/#status-workflow"
              className="text-sm font-medium text-slate-600 hover:text-institutional-700 transition-colors"
            >
              Admissions Workflow
            </Link>
          </nav>

          {/* User Controls / Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  Dashboard
                </Link>
                <div
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                    user.role,
                  )}`}
                >
                  {user.role}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-institutional-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-institutional-700 hover:bg-institutional-800 rounded-lg shadow-sm shadow-institutional-700/30 transition-all hover:shadow"
                >
                  Apply Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Home
          </Link>
          <Link
            href="/programs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-md"
          >
            Programs & Seat Matrix
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-institutional-700 bg-institutional-50 rounded-md"
              >
                Dashboard ({user.role})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-institutional-700 rounded-lg"
              >
                Apply Now
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
