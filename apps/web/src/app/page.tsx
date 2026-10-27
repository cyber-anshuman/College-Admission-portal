'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  AlertCircle,
  Search,
  Filter,
  Check,
  Building2,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { api, setStoredToken } from '../lib/api';

// Authentic LTSU Program Catalog
const LTSU_PROGRAMS_CATALOG = [
  {
    id: 'ltsu-btech-cse-ibm',
    code: 'BTECH-CSE-IBM',
    name: 'B.Tech in Computer Science & Engineering (IBM Collaboration)',
    school: 'University School of Engineering & Technology (USET)',
    category: 'ENGINEERING',
    partner: 'IBM India',
    partnerBadge: 'IBM Software Lab',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 120,
    punjabSeats: 36,
    allIndiaSeats: 84,
    baseFee: 145000,
    applicationFee: 1000,
    specializations: ['AI & Machine Learning', 'Cyber Security'],
    eligibility: '10+2 with Physics, Mathematics & Chem/CS (Min 60% aggregate) or JEE Main / LTSU-SET',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-btech-me-tata',
    code: 'BTECH-ME-TATA',
    name: 'B.Tech in Mechanical Engineering (Smart Manufacturing & EV Tech)',
    school: 'University School of Engineering & Technology (USET)',
    category: 'ENGINEERING',
    partner: 'Tata Technologies & Ansys',
    partnerBadge: 'Tata Tech CoE & Ansys Lab',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 18,
    allIndiaSeats: 42,
    baseFee: 110000,
    applicationFee: 1000,
    specializations: ['Electric Vehicles', 'Digital Manufacturing', 'Automotive Design', 'Robotics'],
    eligibility: '10+2 with Physics & Mathematics (Min 55% aggregate) or State CET / LTSU-SET',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-bca-cloud',
    code: 'BCA-AI',
    name: 'BCA - Bachelor of Computer Applications (AI & Cloud Services)',
    school: 'University School of Computing (USC)',
    category: 'COMPUTING',
    partner: 'Industry Skilling Partner',
    partnerBadge: 'Next-Gen IT Lab',
    durationYears: 3,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 18,
    allIndiaSeats: 42,
    baseFee: 65000,
    applicationFee: 800,
    specializations: ['Full Stack Web Dev', 'Cloud Computing', 'Generative AI Applications'],
    eligibility: '10+2 in any stream with Mathematics / Computer / Statistics (Min 50%)',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-mca',
    code: 'MCA-PRO',
    name: 'MCA - Master of Computer Applications',
    school: 'University School of Computing (USC)',
    category: 'COMPUTING',
    partner: 'Industry Mentors',
    partnerBadge: 'Advanced Software Engg',
    durationYears: 2,
    degreeLevel: 'POSTGRADUATE',
    totalSeats: 40,
    punjabSeats: 12,
    allIndiaSeats: 28,
    baseFee: 85000,
    applicationFee: 1000,
    specializations: ['Cloud Infrastructure', 'Enterprise AI', 'DevOps & Cyber Security'],
    eligibility: 'BCA / B.Sc (CS/IT) / B.Tech or equivalent graduation with min 50% marks',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-bpharm',
    code: 'BPHARM-RIP',
    name: 'B.Pharm - Bachelor of Pharmacy',
    school: 'Rayat Institute of Pharmacy (Approved by PCI)',
    category: 'PHARMACY',
    partner: 'Pharma Industry Alliance',
    partnerBadge: 'PCI Approved',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 18,
    allIndiaSeats: 42,
    baseFee: 95000,
    applicationFee: 1000,
    specializations: ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry'],
    eligibility: '10+2 with Physics, Chemistry & Biology/Mathematics (Min 50% aggregate)',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-dpharm',
    code: 'DPHARM-RIP',
    name: 'D.Pharm - Diploma in Pharmacy',
    school: 'Rayat Institute of Pharmacy (Approved by PCI)',
    category: 'PHARMACY',
    partner: 'Hospital & Clinical Tie-ups',
    partnerBadge: 'PCI Approved',
    durationYears: 2,
    degreeLevel: 'DIPLOMA',
    totalSeats: 60,
    punjabSeats: 18,
    allIndiaSeats: 42,
    baseFee: 60000,
    applicationFee: 800,
    specializations: ['Hospital Pharmacy', 'Drug Formulation'],
    eligibility: '10+2 with Physics, Chemistry & Biology/Mathematics (Min 45% aggregate)',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-bsc-nursing',
    code: 'BSC-NURSING',
    name: 'B.Sc. Nursing',
    school: 'University College of Nursing (PNRC & INC Recognized)',
    category: 'HEALTH',
    partner: 'Super-Specialty Hospital Network',
    partnerBadge: 'INC & PNRC Approved',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 50,
    punjabSeats: 15,
    allIndiaSeats: 35,
    baseFee: 90000,
    applicationFee: 1000,
    specializations: ['Critical Care', 'Community Health', 'Surgical Nursing'],
    eligibility: '10+2 with Physics, Chemistry, Biology & English (Min 50% aggregate) + PPMET / LTSU Entrance',
    status: 'ENTRANCE LIVE',
  },
  {
    id: 'ltsu-bba-fintech',
    code: 'BBA-FINTECH',
    name: 'BBA - Bachelor of Business Administration (FinTech & Digital Marketing)',
    school: 'University School of Commerce & Management (USCM)',
    category: 'MANAGEMENT',
    partner: 'Banking & Financial Institutions',
    partnerBadge: 'Corporate Immersion',
    durationYears: 3,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 18,
    allIndiaSeats: 42,
    baseFee: 60000,
    applicationFee: 800,
    specializations: ['FinTech', 'Digital Marketing & E-Commerce', 'Business Analytics'],
    eligibility: '10+2 in any stream (Science, Commerce, Arts) with min 50% marks',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-mba-strategy',
    code: 'MBA-INDUSTRY',
    name: 'MBA - Master of Business Administration (Industry Integrated)',
    school: 'University School of Commerce & Management (USCM)',
    category: 'MANAGEMENT',
    partner: 'Corporate Mentorship Board',
    partnerBadge: 'Dual Specialization',
    durationYears: 2,
    degreeLevel: 'POSTGRADUATE',
    totalSeats: 60,
    punjabSeats: 18,
    allIndiaSeats: 42,
    baseFee: 110000,
    applicationFee: 1000,
    specializations: ['Business Analytics', 'HR & Corporate Strategy', 'Supply Chain Management'],
    eligibility: 'Bachelor Degree in any discipline (Min 50%) + CAT/MAT/CMAT or LTSU-SET',
    status: 'ADMISSIONS OPEN',
  },
  {
    id: 'ltsu-polytechnic',
    code: 'DIPLOMA-ENGG',
    name: 'Diploma in Engineering (Mechanical / CSE / Electrical)',
    school: 'University School of Polytechnic (USOP)',
    category: 'POLYTECHNIC',
    partner: 'Skill India & Belrise Industries',
    partnerBadge: '100% Practical Training',
    durationYears: 3,
    degreeLevel: 'DIPLOMA',
    totalSeats: 90,
    punjabSeats: 27,
    allIndiaSeats: 63,
    baseFee: 45000,
    applicationFee: 500,
    specializations: ['Mechanical Workshop', 'Embedded Systems', 'Network Tech'],
    eligibility: '10th Standard with Mathematics & Science (Min 45%) or ITI 2-Year for Lateral Entry',
    status: 'ADMISSIONS OPEN',
  },
];

// Key Schedule Dates for Punjab Admission
const ADMISSION_SCHEDULE = [
  {
    event: 'Start of Online Candidate Registration & Choice Filling',
    startDate: 'March 01, 2026',
    endDate: 'Open (Active)',
    status: 'ACTIVE',
  },
  {
    event: 'LTSU-SET 2026 Scholarship Entrance Exam (Phase-1)',
    startDate: 'April 15, 2026',
    endDate: 'April 20, 2026',
    status: 'UPCOMING',
  },
  {
    event: 'First Round Merit List Declaration & Cutoff Display',
    startDate: 'May 05, 2026',
    endDate: 'May 08, 2026',
    status: 'UPCOMING',
  },
  {
    event: 'Online Provisional Seat Allotment (Round 1)',
    startDate: 'May 10, 2026',
    endDate: 'May 15, 2026',
    status: 'UPCOMING',
  },
  {
    event: 'Physical Document Verification & Fee Reconciliation (Railmajra Campus)',
    startDate: 'May 16, 2026',
    endDate: 'May 22, 2026',
    status: 'UPCOMING',
  },
  {
    event: 'Round 2 Vacancy Matrix & Spot Counselling',
    startDate: 'June 01, 2026',
    endDate: 'June 10, 2026',
    status: 'UPCOMING',
  },
];

export default function HomePage() {
  const router = useRouter();

  // Programs state
  const [programsList, setProgramsList] = useState<any[]>(LTSU_PROGRAMS_CATALOG);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [totalIntake, setTotalIntake] = useState<number>(660);


  // Quick Enquiry Form state
  const [sessionMode, setSessionMode] = useState<'online' | 'offline'>('online');
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
  });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);
  const [enquiryLoading, setEnquiryLoading] = useState(false);


  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.phone) {
      alert('Please fill out your name and phone number.');
      return;
    }
    setEnquiryLoading(true);
    setTimeout(() => {
      setEnquiryLoading(false);
      setEnquirySubmitted(true);
    }, 600);
  };

  // Notice board active tab
  const [noticeTab, setNoticeTab] = useState<'notices' | 'downloads' | 'guidelines'>('notices');

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    // Try to load any dynamically configured programs from API if available
    api
      .getPrograms()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge API programs with our rich LTSU catalog
          const total = data.reduce((acc, p) => acc + (p.totalSeats || 0), 0);
          if (total > 0) setTotalIntake(total);
        }
      })
      .catch(() => {
        // Fallback to static catalog
      });
  }, []);

  const filteredPrograms = programsList.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

      {/* =========================================================================
          2. HERO SECTION: DUAL COLUMN WITH LTSU CAMPUS BACKDROP
      ========================================================================= */}
      <section className="relative text-white py-10 lg:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800 min-h-[580px] flex items-center">
        {/* Background Campus Photo properly aligned so building, signboard & entrance are visible */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/campus-building.jpg"
            alt="Lamrin Tech Skills University Punjab Campus"
            fill
            priority
            className="object-cover object-[center_55%] filter brightness-[0.70] contrast-[1.05]"
          />
          {/* Balanced gradient overlay so campus is clearly visible while text has high contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071728]/85 via-[#071728]/55 to-[#071728]/70" />
          <div className="absolute inset-0 bg-black/25" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Heading, Subtitle, Stats, Pill CTAs */}
            <div className="lg:col-span-7 space-y-4 lg:space-y-5">
              {/* Huge Bold Title with text drop-shadow for crystal-clear readability */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-white leading-[1.08] drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]">
                  Shape Your <br />
                  Future in <br />
                  <span className="text-[#dfad4b] drop-shadow-[0_2px_14px_rgba(223,173,75,0.45)]">Industry &amp;</span> <br />
                  <span className="text-[#dfad4b] drop-shadow-[0_2px_14px_rgba(223,173,75,0.45)]">Tech Leadership</span>
                </h1>
              </div>

              {/* Subtitle / Description */}
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed max-w-xl font-normal drop-shadow-[0_1px_5px_rgba(0,0,0,0.9)]">
                Join <strong>Lamrin Tech Skills University Punjab (LTSU)</strong> — India&apos;s pioneering skill university established with IBM, Tata Technologies, Ansys &amp; L&amp;T. Experience high-impact degree programs with 100% placement aid &amp; merit scholarships.
              </p>

              {/* Stats Row with big gold numbers */}
              <div className="grid grid-cols-3 sm:flex sm:items-center gap-4 sm:gap-10 pt-1">
                <div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#dfad4b] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">3560<span className="text-[#dfad4b]">+</span></p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Students</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#dfad4b] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">100<span className="text-[#dfad4b]">+</span></p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Acres Campus</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#dfad4b] tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">100<span className="text-[#dfad4b]">%</span></p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Placement Aid</p>
                </div>
              </div>

              {/* Dual Landing Page Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/register"
                  className="px-7 py-3 rounded-full text-xs sm:text-sm font-black text-slate-950 bg-[#e0b04c] hover:bg-[#d49f38] shadow-lg shadow-black/40 hover:scale-[1.03] active:scale-[0.98] transition-all text-center border border-amber-200 uppercase tracking-wide inline-flex items-center gap-2"
                >
                  <span>Apply for Admission 2026-27</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#programs"
                  className="px-7 py-3 rounded-full text-xs sm:text-sm font-bold text-white border border-sky-400/40 hover:border-sky-300 bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur shadow-lg shadow-black/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-center inline-flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-amber-300" />
                  <span>Explore Programs</span>
                </a>
              </div>
            </div>

            {/* Right Column: Floating White Card "Quick Enquiry" */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm sm:max-w-md bg-white rounded-[26px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-slate-800 border border-white/80">
                
                {/* Card Top: Quick Enquiry Header */}
                <div className="text-center pb-0.5">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Quick Admission Enquiry
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
                    Get an instant callback from our admission counselor
                  </p>
                </div>

                {enquirySubmitted ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Enquiry Submitted!</h3>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                      Thank you, <strong className="text-slate-900">{enquiryForm.name}</strong>. An LTSU admission advisor will contact you at <strong className="text-slate-900">{enquiryForm.phone}</strong> regarding your <strong className="uppercase text-amber-700">{sessionMode}</strong> counseling.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEnquirySubmitted(false);
                        setEnquiryForm({ name: '', email: '', phone: '', subject: '' });
                      }}
                      className="mt-2 px-5 py-2 rounded-full text-xs font-bold text-[#c59b46] border border-[#c59b46] hover:bg-[#c59b46] hover:text-white transition-all shadow-sm"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="mt-2.5 space-y-3">
                    {/* Subhead inside Card */}
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Book Free Counseling Session
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        Guidance for 2026-27 admissions, scholarships &amp; hostel
                      </p>
                    </div>

                    {/* Select Session Mode */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1.5">
                        Preferred Counseling Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {/* Online Option */}
                        <button
                          type="button"
                          onClick={() => setSessionMode('online')}
                          className={`relative flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            sessionMode === 'online'
                              ? 'border-2 border-[#731f2b] text-[#731f2b] bg-rose-50/20 shadow-sm'
                              : 'border border-slate-300 text-slate-600 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {sessionMode === 'online' && (
                            <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-[#731f2b] text-white flex items-center justify-center shadow">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                          <span>Online Video Call</span>
                        </button>

                        {/* Offline Option */}
                        <button
                          type="button"
                          onClick={() => setSessionMode('offline')}
                          className={`relative flex items-center justify-center py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            sessionMode === 'offline'
                              ? 'border-2 border-[#731f2b] text-[#731f2b] bg-rose-50/20 shadow-sm'
                              : 'border border-slate-300 text-slate-600 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {sessionMode === 'offline' && (
                            <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-[#731f2b] text-white flex items-center justify-center shadow">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                          <span>Campus Visit</span>
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-2 pt-0.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={enquiryForm.name}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                          placeholder="Enter your full name"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#c59b46] focus:ring-1 focus:ring-[#c59b46] transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={enquiryForm.email}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                          placeholder="Enter your email"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#c59b46] focus:ring-1 focus:ring-[#c59b46] transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                          Mobile / Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={enquiryForm.phone}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#c59b46] focus:ring-1 focus:ring-[#c59b46] transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                          Preferred Program / Stream
                        </label>
                        <input
                          type="text"
                          required
                          value={enquiryForm.subject}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, subject: e.target.value })}
                          placeholder="e.g. B.Tech IBM CSE, BCA, Pharmacy, MBA"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#c59b46] focus:ring-1 focus:ring-[#c59b46] transition-all bg-white"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={enquiryLoading}
                      className="w-full py-3 mt-1 rounded-full bg-[#c59b46] hover:bg-[#b38a37] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {enquiryLoading ? (
                        <span>Submitting...</span>
                      ) : (
                        <span>SUBMIT ADMISSION ENQUIRY</span>
                      )}
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. 4-STEP CENTRALIZED ADMISSION PROCEDURE (Punjab Gov Model)
      ========================================================================= */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Auditable &amp; Transparent Procedure
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              4-Step Centralized Online Admission Process
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Follow these simple sequential steps to submit your application, verify documents, and confirm your seat at Lamrin Tech Skills University Punjab.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all shadow-sm relative group">
              <div className="w-12 h-12 rounded-xl bg-[#12283e] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Candidate Registration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide personal details, active mobile number and email. Verify credentials via OTP and accept India DPDP 2023 data consent.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all shadow-sm relative group">
              <div className="w-12 h-12 rounded-xl bg-[#12283e] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Fill Form &amp; Course Choice
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter 10th/12th academic scores, JEE/SET entrance ranks, select school preference (IBM B.Tech, Pharmacy, etc.), and declare Punjab Domicile.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all shadow-sm relative group">
              <div className="w-12 h-12 rounded-xl bg-[#12283e] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Document Scrutiny &amp; Merit
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload encrypted marksheets and category certificates. Admission officers verify credentials and generate centralized merit lists.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all shadow-sm relative group">
              <div className="w-12 h-12 rounded-xl bg-[#12283e] text-amber-300 flex items-center justify-center font-black text-lg mb-4 shadow-md group-hover:scale-110 transition-transform">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                Seat Allotment &amp; Fee
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download your provisional allotment letter, pay admission fees through the secure gateway, and generate confirmed enrolment ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. INTERACTIVE PROGRAMS & SEAT MATRIX EXPLORER (With Real LTSU Offerings)
      ========================================================================= */}
      <section id="programs" className="py-14 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Session 2026-27 Intake
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                Academic Programs &amp; Seat Matrix
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore skill-based degrees anchored by industry partners. Total Sanctioned Seats: <strong>{totalIntake}</strong>
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs, schools, code..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#12283e] outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[
              { label: 'All Programs', val: 'ALL' },
              { label: 'Engineering (IBM/Tata)', val: 'ENGINEERING' },
              { label: 'Computing & AI', val: 'COMPUTING' },
              { label: 'Pharmacy (PCI)', val: 'PHARMACY' },
              { label: 'Nursing & Health', val: 'HEALTH' },
              { label: 'Commerce & Management', val: 'MANAGEMENT' },
              { label: 'Polytechnic (Diploma)', val: 'POLYTECHNIC' },
            ].map((tab) => (
              <button
                key={tab.val}
                type="button"
                onClick={() => setSelectedCategory(tab.val)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === tab.val
                    ? 'bg-[#12283e] text-amber-300 shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Top Partner Badge */}
                  {prog.partnerBadge && (
                    <div className="flex items-center justify-end mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                        {prog.partnerBadge}
                      </span>
                    </div>
                  )}

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug mb-1 group-hover:text-blue-700 transition-colors">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-1">
                    {prog.school}
                  </p>

                  {/* Specializations Tags */}
                  {prog.specializations && prog.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {prog.specializations.map((spec: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Eligibility */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                    <strong className="text-slate-900 block mb-0.5">Eligibility:</strong>
                    {prog.eligibility}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Semester Tuition</span>
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{prog.baseFee?.toLocaleString('en-IN')} / sem
                    </span>
                  </div>
                  <Link
                    href={`/register?program=${prog.code}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#12283e] hover:bg-[#0b1c2d] shadow-sm transition-all"
                  >
                    <span>Apply Online</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-200 border border-slate-300 shadow-sm transition-all"
            >
              <span>View Full Reservation Quota Matrix &amp; Seat Allotment Rules</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. ADMISSION SCHEDULE 2026-27 (Punjab Gov Standard Schedule Table)
      ========================================================================= */}
      <section id="schedule" className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Important Timelines
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Centralized Admission Schedule 2026-27
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              All dates are official and governed by the LTSU Central Admissions Committee.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12283e] text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Sr. No.</th>
                  <th className="py-3.5 px-5">Activity / Event Description</th>
                  <th className="py-3.5 px-5">Start Date</th>
                  <th className="py-3.5 px-5">End Date</th>
                  <th className="py-3.5 px-5 text-center">Current Status</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-200 bg-white">
                {ADMISSION_SCHEDULE.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900">
                      {item.event}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{item.startDate}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{item.endDate}</td>
                    <td className="py-3.5 px-5 text-center">
                      {item.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>ACTIVE NOW</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. PUNJAB STATE RESERVATION POLICY & SEAT BREAKDOWN
      ========================================================================= */}
      <section id="reservation" className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Statutory Reservation Quota
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Punjab Domicile Quota &amp; Category Reservation
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                As per the Punjab State Higher Education reservation policy and LTSU Act, <strong>30% of total sanctioned seats</strong> in all undergraduate and postgraduate programs are reserved for candidates having bona-fide domicile of Punjab. The remaining <strong>70% seats</strong> are open for All-India candidates on merit.
              </p>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Post Matric Scholarship (PMS) Scheme for Punjab SC/ST</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Eligible Scheduled Caste (SC) candidates from Punjab with parental annual income up to ₹2.5 Lakhs are eligible for zero-fee admission under Dr. B.R. Ambedkar Post Matric Scholarship Scheme.
                </p>
              </div>
            </div>

            {/* Quota Breakdown Table Cards */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { cat: 'Punjab General (Open)', pct: '50% of Punjab Seats', desc: 'Unreserved merit quota' },
                { cat: 'Scheduled Castes (SC)', pct: '25%', desc: 'Punjab domicile SC certificate' },
                { cat: 'Backward Classes (BC/OBC)', pct: '10%', desc: 'Creamy layer exclusion criteria' },
                { cat: 'Economically Weaker Section (EWS)', pct: '10%', desc: 'Valid income & asset certificate' },
                { cat: 'Persons with Disabilities (PwD)', pct: '3%', desc: 'Min 40% disability certificate' },
                { cat: 'Defense / Freedom Fighters', pct: '2%', desc: 'Wards of armed personnel' },
              ].map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-900 block leading-tight">{q.cat}</span>
                  <span className="text-base font-black text-blue-700 block mt-1">{q.pct}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{q.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. NOTICE BOARD & DOWNLOAD CENTER (Official Circulars & Prospectus)
      ========================================================================= */}
      <section id="downloads" className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Official Documents &amp; Circulars
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                Notice Board &amp; Download Center
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Download verified admission prospectus, fee charts, and government notifications.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setNoticeTab('notices')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  noticeTab === 'notices' ? 'bg-[#12283e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Notices &amp; Circulars
              </button>
              <button
                type="button"
                onClick={() => setNoticeTab('downloads')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  noticeTab === 'downloads' ? 'bg-[#12283e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Prospectus &amp; Forms
              </button>
              <button
                type="button"
                onClick={() => setNoticeTab('guidelines')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  noticeTab === 'guidelines' ? 'bg-[#12283e] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fee Structure
              </button>
            </div>
          </div>

          {/* Tab 1: Notices */}
          {noticeTab === 'notices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Notice for B.Tech CSE (IBM) Entrance Exam & Counselling Session 2026-27',
                  date: 'October 2026',
                  category: 'USET Engineering',
                  link: 'https://www.ltsu.ac.in/assets/frontend/pdf/LTSUAdmission-AY2026-2027.pdf',
                },
                {
                  title: 'Scholarship Entrance Test LTSU-SET 2026: Information Brochure & Syllabus',
                  date: 'Session 2026-27',
                  category: 'Scholarship Policy',
                  link: 'https://www.ltsu.ac.in/assets/frontend/pdf/LTSU_Scholarship_Policy-SET2026.pdf',
                },
                {
                  title: 'Rayat Institute of Pharmacy: Document Verification & Eligibility Scrutiny',
                  date: 'AY 2026-27',
                  category: 'PCI Approved',
                  link: 'https://www.ltsu.ac.in/assets/frontend/pdf/All_Course_LTSU_Fee_Structure_2026.pdf',
                },
                {
                  title: 'University College of Nursing: B.Sc. Nursing Entrance Examination Details',
                  date: 'AY 2026-27',
                  category: 'INC & PNRC',
                  link: 'https://www.ltsu.ac.in/assets/frontend/pdf/LTSUAdmission-AY2026-2027.pdf',
                },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/60 transition-all flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {doc.category}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{doc.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                  </div>
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:bg-slate-100 shrink-0"
                    title="Download Circular"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Downloads */}
          {noticeTab === 'downloads' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'LTSU Admission Prospectus 2026-27', size: '4.8 MB', format: 'PDF', url: 'https://www.ltsu.ac.in/assets/frontend/pdf/LTSUAdmission-AY2026-2027.pdf' },
                { title: 'Information Submitted to UGC (Sec 2(f))', size: '2.1 MB', format: 'PDF', url: 'https://www.ltsu.ac.in/assets/frontend/pdf/UGC-Information_LTSU.pdf' },
                { title: 'Hostel & Mess Tariff Structure 2026-27', size: '820 KB', format: 'PDF', url: 'https://www.ltsu.ac.in/assets/frontend/pdf/Hostel_fee_structure_2026-2027.pdf' },
              ].map((d, idx) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      {d.format} • {d.size}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-2">{d.title}</h4>
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#12283e] text-white text-xs font-bold hover:bg-[#0b1c2d] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Document</span>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Fees */}
          {noticeTab === 'guidelines' && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-2">
                Official Fee Structure &amp; UGC Refund Policy
              </h4>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Tuition and examination fees at Lamrin Tech Skills University Punjab are regulated in accordance with the Punjab State Private Universities Act. All candidate fee payments are acknowledged with instant digital receipt and GST invoices.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.ltsu.ac.in/assets/frontend/pdf/All_Course_LTSU_Fee_Structure_2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#12283e] text-amber-300 text-xs font-bold hover:bg-[#0b1c2d]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Complete Fee Structure 2026 (PDF)</span>
                </a>
                <a
                  href="https://www.ltsu.ac.in/refund-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-100"
                >
                  <span>Read UGC Refund Policy</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          8. ABOUT LTSU & CHANCELLOR'S VISION
      ========================================================================= */}
      <section id="about-ltsu" className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Institutional Profile
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                India&apos;s First Industry-Led Skill University
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Lamrin Tech Skills University Punjab is incubated by <strong>RERT</strong> as academic partner and <strong>IBM, Tata Technologies, and Ansys</strong> as industry partners. Situated on a lush 100-acre campus near Rupnagar (Ropar) along the Chandigarh–Jalandhar National Highway, LTSU bridges the gap between traditional higher education and high-demand industry skills.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Curriculum designed by global technology practitioners</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Real industry labs (IBM Cloud, Ansys CAE, Tata EV)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Pay-After-Placement and No-Cost EMI options</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>UGC recognized under Section 2(f) of UGC Act 1956</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-slate-100">
                  <Image
                    src="/chancellor.jpg"
                    alt="S. Nirmal Singh Rayat"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">S. NIRMAL SINGH RAYAT</h4>
                  <p className="text-xs text-slate-500">Chancellor, LTSU Punjab</p>
                  <p className="text-[10px] text-amber-700 font-semibold">President, Rayat Educational &amp; Research Trust (RERT)</p>
                </div>
              </div>
              <blockquote className="text-xs text-slate-600 italic border-l-2 border-amber-400 pl-3 leading-relaxed">
                &ldquo;Our vision at Lamrin is to make India the skill capital of the world. By embedding industry giants directly inside university labs, every student graduates not with mere textbook degrees, but with job-ready industrial competencies.&rdquo;
              </blockquote>
              <div className="pt-2 text-right">
                <a
                  href="https://www.ltsu.ac.in/chancellor-message"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Read Chancellor&apos;s Full Message</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. HELPDESK, FREQUENTLY ASKED QUESTIONS & CAMPUS REACH
      ========================================================================= */}
      <section id="helpdesk" className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Contact Box */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Candidate Support
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                  Admissions Helpdesk &amp; Inquiry
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Have questions about choice filling, fee payment, or hostel admission? Contact our central counselling team.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Helpline Phone Numbers:</strong>
                    <p className="text-slate-600">Admission Cell: <a href="tel:+918480005390" className="text-blue-700 font-semibold">+91 8480005390</a></p>
                    <p className="text-slate-600">IBM B.Tech Desk: <a href="tel:+919501012152" className="text-blue-700 font-semibold">+91 9501012152</a></p>
                    <p className="text-slate-600">Landline: 01881-270794, 270693</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Email Inquiries:</strong>
                    <p><a href="mailto:admissions@ltsu.ac.in" className="text-blue-700 font-semibold">admissions@ltsu.ac.in</a></p>
                    <p><a href="mailto:admission.btech@ltsu.ac.in" className="text-blue-700 font-semibold">admission.btech@ltsu.ac.in</a></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Campus Location:</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Lamrin Tech Skills University Punjab, Chandigarh–Jalandhar National Highway (NH 344A), Railmajra, Dist. SBS Nagar, Near Ropar (Punjab) – 144533.
                    </p>
                    <p className="text-[11px] text-amber-700 font-bold mt-1">
                      Distance: 40 min from Chandigarh | 6 KM from Ropar Railway Station
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="lg:col-span-7">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>Frequently Asked Questions (Admission 2026-27)</span>
              </h3>

              <div className="space-y-3">
                {[
                  {
                    q: 'Who is eligible under the 30% Punjab Resident Quota?',
                    a: 'Candidates who are bona-fide residents of Punjab, or whose parents have resided in Punjab for minimum 5 years, or candidates who completed their 10th and 12th schooling from a recognized institution located within the State of Punjab.',
                  },
                  {
                    q: 'What is the advantage of the IBM B.Tech CSE collaboration?',
                    a: 'Curriculum is co-developed by IBM subject matter experts. Students work with real IBM Cloud environments, complete certified industry badges, and undergo live capstone projects with industry mentorship.',
                  },
                  {
                    q: 'Are scholarships available for students?',
                    a: 'Yes. Up to 100% tuition scholarships are awarded based on LTSU-SET entrance scores and 12th board percentages. Punjab SC/ST students with family income under ₹2.5 Lakhs are covered under the 100% Post-Matric Scholarship.',
                  },
                  {
                    q: 'Can candidates apply for multiple courses with a single registration?',
                    a: 'Yes. Once registered on this centralized portal, candidates can select multiple course preferences across Engineering, Computing, Pharmacy, Management, and Polytechnic.',
                  },
                  {
                    q: 'Is hostel accommodation available on campus?',
                    a: 'Yes, LTSU provides separate air-conditioned and regular hostels for boys and girls on the 100-acre campus with 24/7 security, high-speed Wi-Fi, hygienic mess, gym, and medical care.',
                  },
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-100 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${
                          openFaqIndex === idx ? 'rotate-180 text-amber-600' : ''
                        }`}
                      />
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
