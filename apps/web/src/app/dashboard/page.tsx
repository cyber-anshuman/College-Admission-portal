'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Layers,
  Settings,
  Database,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  clearStoredToken,
  api,
  setStoredToken,
  bootstrapSession,
} from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    let mounted = true;
    bootstrapSession()
      .then((userData) => {
        if (!mounted) return;
        if (!userData) {
          router.push('/login');
          return;
        }
        setUser(userData);
        setLoading(false);

        // If auditor or admin, fetch audit logs
        if (userData.role === 'AUDITOR' || userData.role === 'ADMIN') {
          fetchAuditLogs();
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Service temporarily unavailable. Retrying...');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const resp = await api.getAuditLogs(1, 20);
      if (resp && resp.items) {
        setAuditLogs(resp.items);
      }
    } catch (e) {
      console.warn('Could not fetch audit logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      clearStoredToken();
      router.push('/login');
    }
  };

  // Quick switcher to test other roles from within dashboard (tree-shaken in production)
  const switchRole = async (targetEmail: string, pass: string) => {
    try {
      const resp = await api.login({ email: targetEmail, password: pass });
      setStoredToken(resp.tokens.accessToken);
      setUser({
        ...resp.user,
        applicantProfile: resp.applicantProfile,
      });
      if (resp.user.role === 'AUDITOR' || resp.user.role === 'ADMIN') {
        fetchAuditLogs();
      }
    } catch (e: any) {
      alert('Failed to switch: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-institutional-600" />
      </div>
    );
  }

  if (!user) {
    if (error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full p-6 bg-white rounded-2xl border border-amber-200 shadow-sm text-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h2 className="text-base font-bold text-slate-900 mb-1">Service Temporarily Unavailable</h2>
            <p className="text-xs text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-institutional-700 text-white text-xs font-bold rounded-lg hover:bg-institutional-800"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Identity Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-institutional-800 to-institutional-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-institutional-800/20">
              {user.applicantProfile?.firstName ? (
                user.applicantProfile.firstName[0]
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {user.applicantProfile
                    ? `${user.applicantProfile.firstName} ${user.applicantProfile.lastName}`
                    : user.email}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-institutional-100 text-institutional-800 border border-institutional-200">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{user.email}</span>
                {user.phone && <span>• {user.phone}</span>}
                {user.applicantProfile?.category && (
                  <span>• Quota Category: {user.applicantProfile.category}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Role Simulator bar for pair programming & audit (stripped in production) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-slate-900 text-slate-300 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Role Simulation:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Admin', email: 'admin@college.edu', role: 'ADMIN' },
                { label: 'Admission Officer', email: 'officer@college.edu', role: 'ADMISSION_OFFICER' },
                { label: 'Reviewer (HOD)', email: 'hod.cse@college.edu', role: 'REVIEWER_HOD' },
                { label: 'Accounts', email: 'accounts@college.edu', role: 'ACCOUNTS' },
                { label: 'Auditor', email: 'auditor@college.edu', role: 'AUDITOR' },
                { label: 'Applicant (Rahul)', email: 'applicant.rahul@example.com', role: 'APPLICANT' },
              ].map((r) => (
                <button
                  key={r.email}
                  onClick={() =>
                    switchRole(
                      r.email,
                      r.role === 'APPLICANT' ? 'Applicant@123' : 'Password@123',
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    user.role === r.role && user.email === r.email
                      ? 'bg-institutional-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ROLE VIEW: APPLICANT */}
        {user.role === 'APPLICANT' && (
          <div className="space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  Admissions Status Lifecycle
                </h2>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Status: DRAFT
                </span>
              </div>

              {/* Progress Stepper */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
                {[
                  { step: '1. Registered', done: true },
                  { step: '2. Application Form', done: false, active: true },
                  { step: '3. Verification', done: false },
                  { step: '4. Merit Listed', done: false },
                  { step: '5. Seat Offered', done: false },
                  { step: '6. Fee Paid & Admitted', done: false },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center ${
                      s.done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : s.active
                        ? 'bg-institutional-50 border-institutional-300 text-institutional-900 ring-2 ring-institutional-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-center mb-1">
                      {s.done ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : s.active ? (
                        <Clock className="w-4 h-4 text-institutional-700 animate-pulse" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold block leading-tight">{s.step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 2 Scaffolding Callout */}
            <div className="bg-gradient-to-r from-institutional-900 to-institutional-800 text-white rounded-2xl p-6 shadow-sm">
              <div className="max-w-2xl">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Coming Up: Phase 2
                </span>
                <h3 className="text-lg font-bold mt-2">
                  Multi-Step Application & Private Document Verification
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Phase 2 will unlock your multi-step academic application form with automatic draft autosaving, private encrypted S3 document upload (10th/12th marksheets, caste certificate), and officer scrutiny notes.
                </p>
                <div className="mt-4">
                  <Link
                    href="/programs"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-institutional-900 hover:bg-slate-100 transition-colors"
                  >
                    Review Program Eligibility
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROLE VIEW: AUDITOR & ADMIN */}
        {(user.role === 'AUDITOR' || user.role === 'ADMIN') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Immutable Audit Log Trail (DPDP Act 2023 Compliance)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time recording of every state transition, login event, and quota change.
                </p>
              </div>
              <button
                onClick={fetchAuditLogs}
                disabled={loadingLogs}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor / Role</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {log.actor?.email || 'SYSTEM'} ({log.actorRole || 'SYSTEM'})
                        </td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                          {log.entityType} ({log.entityId.slice(0, 8)}...)
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                          {log.ipAddress || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        {loadingLogs ? 'Fetching audit records...' : 'No audit records found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ROLE VIEW: ADMISSION OFFICER / REVIEWER / ACCOUNTS */}
        {['ADMISSION_OFFICER', 'REVIEWER_HOD', 'ACCOUNTS'].includes(user.role) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              Officer Scrutiny & Operational Queue
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Assigned role permissions: <strong>{user.role}</strong>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-500 font-medium">Pending Verifications</span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">2 Candidates</p>
                <p className="text-[11px] text-slate-400 mt-1">Ready for Phase 2 scrutiny</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-500 font-medium">Verified Applications</span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">0</p>
                <p className="text-[11px] text-slate-400 mt-1">Awaiting review pipeline</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs text-slate-500 font-medium">Flagged / Returned</span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">0</p>
                <p className="text-[11px] text-slate-400 mt-1">Discrepancy notices</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
