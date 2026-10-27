'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { api, setStoredToken } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+91',
    category: 'GENERAL',
    password: '',
    confirmPassword: '',
    dpdpConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 10) {
      setError('Password must be at least 10 characters long');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    if (!formData.dpdpConsent) {
      setError('You must give explicit consent under India DPDP Act 2023 to proceed');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        password: formData.password,
        dpdpConsent: formData.dpdpConsent,
      });

      setStoredToken(response.tokens.accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
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
        <div className="absolute w-[750px] h-[750px] rounded-full border border-white/50" />
        <div className="absolute w-[1050px] h-[1050px] rounded-full border border-white/35" />
        <div className="absolute w-[1350px] h-[1350px] rounded-full border border-white/20" />
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[500px]">
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
              Create an account
            </h1>
            <p className="text-xs text-slate-500 mt-2 max-w-[320px] mx-auto leading-relaxed">
              Start your centralized admission application for Session 2026-27 at LTSU Punjab.
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Names Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                <User className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full px-2.5 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
                />
              </div>

              <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full px-3.5 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
              <Mail className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
              />
            </div>

            {/* Phone & Category Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                <Phone className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Mobile (+91...)"
                  className="w-full px-2.5 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
                />
              </div>

              <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-3 bg-transparent text-xs font-semibold text-slate-800 outline-none rounded-2xl cursor-pointer"
                >
                  <option value="GENERAL">General (Open)</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="BC">BC (Backward Class)</option>
                  <option value="OBC">OBC (Other Backward)</option>
                  <option value="EWS">EWS (Economically Weaker)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
              <Lock className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min 10 chars, A-Z, 0-9)"
                className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative flex items-center bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 border border-slate-200/60 rounded-2xl transition-all">
              <Lock className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full px-3 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none rounded-2xl font-medium"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-3 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* DPDP Consent */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="dpdpConsent"
                  checked={formData.dpdpConsent}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I consent to processing my personal and academic data for admissions scrutiny under the{' '}
                  <strong className="text-slate-800">India DPDP Act 2023</strong>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-b from-[#23272f] to-[#121417] hover:from-[#181a20] hover:to-[#08090b] shadow-lg shadow-slate-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Get Started</span>
              )}
            </button>
          </form>

          {/* Dotted Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-300" />
            </div>
            <span className="relative px-3 text-xs text-slate-400 bg-white/70 backdrop-blur-sm rounded-full">
              Or sign up with
            </span>
          </div>

          {/* Social / Alternate Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  firstName: 'Rahul',
                  lastName: 'Sharma',
                  email: 'applicant.rahul@example.com',
                  phone: '+919811122233',
                  category: 'OBC',
                  password: 'Applicant@123',
                  confirmPassword: 'Applicant@123',
                  dpdpConsent: true,
                });
              }}
              title="Quick Google Demo Auto-fill"
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

            {/* Facebook / Alternate */}
            <button
              type="button"
              onClick={() => {
                setFormData({
                  firstName: 'Priya',
                  lastName: 'Kaur',
                  email: 'priya.kaur@example.com',
                  phone: '+919876543210',
                  category: 'SC',
                  password: 'Applicant@123',
                  confirmPassword: 'Applicant@123',
                  dpdpConsent: true,
                });
              }}
              title="Quick Demo Auto-fill"
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
                setFormData({
                  firstName: 'Aman',
                  lastName: 'Singh',
                  email: 'aman.singh@example.com',
                  phone: '+919812345678',
                  category: 'GENERAL',
                  password: 'Applicant@123',
                  confirmPassword: 'Applicant@123',
                  dpdpConsent: true,
                });
              }}
              title="Quick Demo Auto-fill"
              className="flex items-center justify-center py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-xs hover:shadow-md transition-all active:scale-95 group text-slate-900"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.03-.49 2.65-1.24z" />
              </svg>
            </button>
          </div>

          {/* Bottom Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-slate-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
