'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  GraduationCap,
  PhoneCall,
  MessageCircleQuestion,
  Sparkles,
  X,
  Check,
  CheckCircle2,
  Send,
  Building,
  Video,
} from 'lucide-react';

export default function MobileThumbBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [counselingMode, setCounselingMode] = useState<'online' | 'campus'>('online');
  const [form, setForm] = useState({ name: '', phone: '', program: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const isHome = pathname === '/';
  const isPrograms = pathname === '/programs';
  const isRegister = pathname === '/register' || pathname === '/signup';

  return (
    <>
      {/* =========================================================================
          1. STICKY BOTTOM THUMB NAVIGATION BAR (Visible on Mobile/Tablet only)
      ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071627]/95 backdrop-blur-xl border-t border-slate-700/80 shadow-[0_-10px_30px_rgba(0,0,0,0.45)] px-2 pt-2 pb-[max(env(safe-area-inset-bottom,8px),10px)] transition-all"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
          {/* 1. Home Button */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
              isHome
                ? 'text-amber-400 font-bold bg-white/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight tracking-tight">Home</span>
          </Link>

          {/* 2. Programs Button */}
          <Link
            href="/programs"
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
              isPrograms
                ? 'text-amber-400 font-bold bg-white/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
            }`}
          >
            <GraduationCap className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight tracking-tight">Courses</span>
          </Link>

          {/* 3. CENTER HIGHLIGHT: Apply Now (Prominent Thumb Action) */}
          <Link
            href="/register"
            className={`flex flex-col items-center justify-center -mt-3.5 group transition-all active:scale-95`}
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#dfad4b] via-[#e5b95c] to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-slate-900 group-hover:scale-105 transition-transform animate-pulse">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-extrabold text-amber-300 mt-1 drop-shadow-sm">
              Apply Now
            </span>
          </Link>

          {/* 4. Instant Call Helpline */}
          <a
            href="tel:01881270693"
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 font-medium transition-all active:scale-95"
            title="Call Admission Helpline"
          >
            <div className="relative">
              <PhoneCall className="w-5 h-5 mb-0.5 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[10px] leading-tight tracking-tight">Call Desk</span>
          </a>

          {/* 5. Quick Enquiry Bottom Sheet Trigger */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 font-medium transition-all active:scale-95"
            title="Book Free Counseling"
          >
            <MessageCircleQuestion className="w-5 h-5 mb-0.5 text-sky-400" />
            <span className="text-[10px] leading-tight tracking-tight">Enquire</span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          2. ERGONOMIC THUMB BOTTOM SHEET (Quick Admission Enquiry)
      ========================================================================= */}
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSheetOpen(false)}
          />

          {/* Slide-Up Bottom Sheet Card */}
          <div className="relative z-10 bg-white rounded-t-[32px] shadow-[0_-15px_40px_rgba(0,0,0,0.5)] border-t border-slate-200 px-5 pt-3 pb-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Top Drag Handle Indicator */}
            <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" />

            {/* Header with Close */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Quick Admission Enquiry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get a priority callback from an LTSU admission advisor
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors -mr-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Enquiry Received!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{form.name}</strong>. An LTSU admission advisor will call you at <strong className="text-slate-900">{form.phone}</strong> for your <strong className="uppercase text-amber-700">{counselingMode}</strong> counseling session.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: '', phone: '', program: '' });
                    setSheetOpen(false);
                  }}
                  className="mt-3 px-6 py-2.5 rounded-full text-xs font-bold bg-[#c59b46] hover:bg-[#b38a37] text-white shadow-md transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                {/* Counseling Mode Pill Toggle */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Counseling Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCounselingMode('online')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        counselingMode === 'online'
                          ? 'border-[#731f2b] bg-rose-50/40 text-[#731f2b] shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Online Video Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCounselingMode('campus')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        counselingMode === 'campus'
                          ? 'border-[#731f2b] bg-rose-50/40 text-[#731f2b] shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>Campus Visit</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter candidate's full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#c59b46] focus:ring-1 focus:ring-[#c59b46] bg-slate-50"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    10-Digit Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#c59b46] focus:ring-1 focus:ring-[#c59b46] bg-slate-50"
                  />
                </div>

                {/* Preferred Stream / Course */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Interested Program
                  </label>
                  <input
                    type="text"
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    placeholder="e.g. B.Tech IBM CSE, BCA, Pharmacy, MBA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#c59b46] focus:ring-1 focus:ring-[#c59b46] bg-slate-50"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 mt-2 rounded-full bg-gradient-to-r from-[#dfad4b] to-[#c59b46] hover:from-[#c59b46] hover:to-[#b38a37] active:scale-[0.98] text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Request Instant Callback</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
