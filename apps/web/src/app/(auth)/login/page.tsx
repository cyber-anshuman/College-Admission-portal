'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building,
} from 'lucide-react';
import { api, setStoredToken } from '../../../lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'staff' ? 'staff' : 'applicant';

  const [tab, setTab] = useState<'applicant' | 'staff'>(initialTab);
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [otpEnabled, setOtpEnabled] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  useEffect(() => {
    api
      .getConfig()
      .then((cfg) => {
        if (cfg && cfg.otpEnabled === false) {
          setOtpEnabled(false);
          setAuthMode('password');
        }
      })
      .catch(() => {
        // Fallback to password mode if config fails
      });
  }, []);

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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your email and password.');
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
      await api.sendOtp({ identifier });
      setOtpSent(true);
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
      if (resp.tokens && resp.tokens.accessToken) {
        setStoredToken(resp.tokens.accessToken);
        router.push('/dashboard');
      } else {
        setError('Verification successful, but no active applicant account found. Please register.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#bfe0f8] via-[#d7ecfb] to-[#ebf5fe] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Dreamy Sky Ambience & Concentric Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Soft cloud glow orbs */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-white/70 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-[600px] h-[400px] bg-white/80 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[400px] h-[400px] bg-sky-200/50 rounded-full blur-3xl" />

        {/* Concentric subtle wireframe orbit rings */}
        <div className="absolute w-[650px] h-[650px] rounded-full border border-white/50" />
        <div className="absolute w-[950px] h-[950px] rounded-full border border-white/35" />
        <div className="absolute w-[1250px] h-[1250px] rounded-full border border-white/20" />
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Role Selector Pill */}
        <div className="mb-4 flex items-center justify-center">
          <div className="bg-white/60 backdrop-blur-md p-1 rounded-2xl border border-white/80 shadow-sm flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setTab('applicant');
                setError(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'applicant'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Applicant
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('staff');
                setError(null);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tab === 'staff'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Officer / Staff
            </button>
          </div>
        </div>

        {/* Glass Container */}
        <div className="bg-white/75 backdrop-blur-2xl border border-white/80 rounded-[36px] shadow-[0_20px_60px_-15px_rgba(20,50,90,0.15)] p-7 sm:p-9 transition-all">
          {/* Top Floating Badge */}
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md shadow-sky-900/10 border border-white flex items-center justify-center mx-auto mb-4 p-2 transition-transform hover:scale-105">
            <Image
              src="/ltsu-logo.png"
              alt="LTSU Logo"
              width={44}
              height={44}
              className="w-full h-full object-contain"
              priority
            />
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {authMode === 'otp' ? 'Sign in with OTP' : 'Sign in with email'}
            </h1>
            <p className="text-xs text-slate-500 mt-2 max-w-[280px] mx-auto leading-relaxed">
              {tab === 'applicant'
                ? 'Access your centralized candidate admission portal for Session 2026-27.'
                : 'Administrative console for LTSU Admission Officers and Staff.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 shadow-sm animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {authMode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              {/* Email Input */}
              <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                <Mail className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tab === 'applicant' ? 'Email' : 'Officer Email'}
                  className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                  <Lock className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setError(
                        'To reset your password, contact admissions@ltsu.ac.in or helpline 01881-270693 / +91 8480005390'
                      )
                    }
                    className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-b from-[#23272f] to-[#121417] hover:from-[#181a20] hover:to-[#08090b] shadow-lg shadow-slate-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Get Started</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              {/* Phone / Email input */}
              <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                <Phone className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or Mobile (+91...)"
                  className="w-full px-3 py-3.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="mr-2 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors shrink-0"
                >
                  {otpSent ? 'Resend' : 'Send'}
                </button>
              </div>

              {/* 6-Digit OTP */}
              <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-Digit Verification Code"
                  className="w-full text-center px-4 py-3.5 bg-transparent text-base tracking-widest font-black text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl"
                />
              </div>

              {/* Submit OTP */}
              <button
                type="submit"
                disabled={loading || !otp}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-b from-[#23272f] to-[#121417] hover:from-[#181a20] hover:to-[#08090b] shadow-lg shadow-slate-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify &amp; Continue</span>
                )}
              </button>
            </form>
          )}

          {/* Dotted Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-300" />
            </div>
            <span className="relative px-3 text-xs text-slate-400 bg-white/70 backdrop-blur-sm rounded-full">
              Or sign in with
            </span>
          </div>

          {/* Social / Alternate Login Options (Matches Google, Facebook, Apple in reference) */}
          <div className="grid grid-cols-3 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => {
                if (tab === 'applicant') {
                  fillCredentials('applicant.rahul@example.com', 'Applicant@123');
                } else {
                  fillCredentials('officer@college.edu', 'Password@123');
                }
              }}
              title="Google Sign In (Auto-fills demo)"
              className="flex items-center justify-center py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-md transition-all active:scale-95 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            {/* OTP Mode Switch */}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'password' ? 'otp' : 'password');
                setError(null);
              }}
              title={authMode === 'password' ? 'Switch to OTP Login' : 'Switch to Password Login'}
              className="flex items-center justify-center py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-md transition-all active:scale-95 group text-blue-600"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => {
                if (tab === 'applicant') {
                  fillCredentials('applicant.rahul@example.com', 'Applicant@123');
                } else {
                  fillCredentials('admin@college.edu', 'Password@123');
                }
              }}
              title="Apple Sign In (Auto-fills demo)"
              className="flex items-center justify-center py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-md transition-all active:scale-95 group text-slate-900"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.49 2.65-1.24z" />
              </svg>
            </button>
          </div>

          {/* Bottom Switch to Register / Signup */}
          <div className="mt-7 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-slate-900 hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Quick Demo Pre-seed Access Trigger */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
              <button
                type="button"
                onClick={() => setShowDemoLogins(!showDemoLogins)}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold flex items-center justify-center gap-1 mx-auto"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{showDemoLogins ? 'Hide Demo Logins' : 'Quick Demo Logins'}</span>
              </button>

              {showDemoLogins && (
                <div className="mt-2 text-left space-y-1 bg-white/60 p-2 rounded-xl border border-slate-200/60 text-[10px]">
                  <p className="font-bold text-slate-600">Click to fill test credentials:</p>
                  <button
                    type="button"
                    onClick={() => fillCredentials('applicant.rahul@example.com', 'Applicant@123')}
                    className="w-full text-left p-1.5 rounded hover:bg-white text-slate-700 flex justify-between"
                  >
                    <span>Rahul Sharma (Applicant)</span>
                    <span className="text-blue-600 font-bold">Fill →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('staff');
                      fillCredentials('admin@college.edu', 'Password@123');
                    }}
                    className="w-full text-left p-1.5 rounded hover:bg-white text-slate-700 flex justify-between"
                  >
                    <span>Super Admin (Staff)</span>
                    <span className="text-blue-600 font-bold">Fill →</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('staff');
                      fillCredentials('officer@college.edu', 'Password@123');
                    }}
                    className="w-full text-left p-1.5 rounded hover:bg-white text-slate-700 flex justify-between"
                  >
                    <span>Admission Officer (Staff)</span>
                    <span className="text-blue-600 font-bold">Fill →</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
