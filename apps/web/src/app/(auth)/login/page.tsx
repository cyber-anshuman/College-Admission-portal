'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  Mail,
  Smartphone,
  ArrowRight,
  AlertCircle,
  KeyRound,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { api, setStoredToken, setStoredUser } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'applicant' | 'staff'>('applicant');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick filler for demo
  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      setStoredToken(response.tokens.accessToken);
      setStoredUser({
        ...response.user,
        applicantProfile: response.applicantProfile,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!identifier) {
      setError('Please enter your registered email or phone number to receive OTP');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const resp = await api.sendOtp({ identifier });
      setOtpSent(true);
      if (resp.simulatedOtp) {
        setSimulatedOtp(resp.simulatedOtp);
        setOtp(resp.simulatedOtp); // Auto-populate in dev for effortless testing
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const resp = await api.verifyOtp({ identifier, otp });
      if (resp.tokens) {
        setStoredToken(resp.tokens.accessToken);
        setStoredUser({
          ...resp.user,
          applicantProfile: resp.applicantProfile,
        });
        router.push('/dashboard');
      } else {
        setError('Identifier verified, but no active account was found. Please register first.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-institutional-800 to-institutional-600 flex items-center justify-center text-white shadow-lg shadow-institutional-800/30">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
          Admissions Portal Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Apex Institute of Technology & Management
        </p>

        {/* Portal Mode Tabs */}
        <div className="mt-6 flex rounded-xl bg-slate-200/80 p-1">
          <button
            type="button"
            onClick={() => {
              setTab('applicant');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'applicant'
                ? 'bg-white text-institutional-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Applicant Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('staff');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'staff'
                ? 'bg-white text-institutional-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Staff & Officers Portal
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: APPLICANT LOGIN */}
          {tab === 'applicant' && (
            <div>
              {/* Applicant Submode Switch: Password vs OTP */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                <span className="text-xs font-semibold text-slate-700">Authentication Method:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setError(null);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      authMode === 'password'
                        ? 'bg-institutional-100 text-institutional-800'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp');
                      setError(null);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      authMode === 'otp'
                        ? 'bg-institutional-100 text-institutional-800'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    OTP Login
                  </button>
                </div>
              </div>

              {authMode === 'password' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Applicant Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="applicant.rahul@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-institutional-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-institutional-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-institutional-700 hover:bg-institutional-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Application Portal'}
                  </button>

                  {/* One-click demo filler */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick Demo Credentials:</p>
                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials('applicant.rahul@example.com', 'Applicant@123')
                      }
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] text-slate-700 flex items-center justify-between"
                    >
                      <span>Rahul Sharma (Verified OBC)</span>
                      <span className="text-institutional-600 font-bold">Fill →</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email or Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="applicant.rahul@example.com or +919811122233"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-institutional-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 shrink-0"
                      >
                        {otpSent ? 'Resend' : 'Send Code'}
                      </button>
                    </div>
                  </div>

                  {simulatedOtp && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                      <span>Simulated OTP: <strong>{simulatedOtp}</strong></span>
                      <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Auto-filled</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full tracking-widest text-center px-3 py-2 text-sm font-bold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-institutional-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !otp}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-institutional-700 hover:bg-institutional-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center text-xs text-slate-500">
                New candidate?{' '}
                <Link href="/register" className="font-bold text-institutional-700 hover:underline">
                  Register for Admissions 2026-27
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: STAFF & OFFICERS LOGIN */}
          {tab === 'staff' && (
            <div>
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@college.edu"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-institutional-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-institutional-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Staff Console'}
                </button>
              </form>

              {/* Demo Quick-Role Switcher */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>One-Click Role Testers (Pre-seeded Accounts):</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  {[
                    { role: 'Super Admin', email: 'admin@college.edu' },
                    { role: 'Admission Officer', email: 'officer@college.edu' },
                    { role: 'Reviewer / HOD (CSE)', email: 'hod.cse@college.edu' },
                    { role: 'Accounts Officer', email: 'accounts@college.edu' },
                    { role: 'Auditor', email: 'auditor@college.edu' },
                  ].map((staff) => (
                    <button
                      key={staff.email}
                      type="button"
                      onClick={() => fillCredentials(staff.email, 'Password@123')}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[11px] flex items-center justify-between text-slate-700"
                    >
                      <span className="font-semibold">{staff.role}</span>
                      <span className="text-slate-400 font-mono text-[10px]">{staff.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
