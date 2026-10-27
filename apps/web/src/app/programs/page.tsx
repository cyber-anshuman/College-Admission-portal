'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  Award,
  Sparkles,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { api } from '../../lib/api';

// Comprehensive LTSU Academic Programs Catalog
const LTSU_FULL_PROGRAMS = [
  {
    id: 'ltsu-btech-cse-ibm',
    code: 'BTECH-CSE-IBM',
    name: 'B.Tech in Computer Science & Engineering (IBM Collaboration)',
    school: 'University School of Engineering & Technology (USET)',
    department: 'Computer Science & Engineering',
    category: 'ENGINEERING',
    partner: 'IBM India',
    partnerBadge: 'IBM Software Lab',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 120,
    punjabSeats: 102,
    allIndiaSeats: 18,
    baseFee: 145000,
    applicationFee: 1000,
    specializations: ['AI & Machine Learning', 'Cyber Security', 'Cloud Computing', 'Data Science'],
    eligibilityCriteria: {
      minScorePercentage: 60,
      requiredSubjects: ['Physics', 'Mathematics', 'Chemistry/CS'],
      entranceExamAccepted: ['JEE_MAIN', 'LTSU-SET', 'PUNJAB_CET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 51, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 26, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 10, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 10, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 3, allottedSeats: 0 },
      { category: 'PUNJAB_SPORTS_DEFENSE', totalSeats: 2, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 18, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-btech-me-tata',
    code: 'BTECH-ME-TATA',
    name: 'B.Tech in Mechanical Engineering (Smart Manufacturing & EV Tech)',
    school: 'University School of Engineering & Technology (USET)',
    department: 'Mechanical & Automation Engineering',
    category: 'ENGINEERING',
    partner: 'Tata Technologies & Ansys',
    partnerBadge: 'Tata Tech CoE & Ansys Lab',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 51,
    allIndiaSeats: 9,
    baseFee: 110000,
    applicationFee: 1000,
    specializations: ['Electric Vehicles', 'Digital Manufacturing', 'Automotive Design', 'Robotics'],
    eligibilityCriteria: {
      minScorePercentage: 55,
      requiredSubjects: ['Physics', 'Mathematics'],
      entranceExamAccepted: ['JEE_MAIN', 'LTSU-SET', 'STATE_CET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 26, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 13, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 2, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 9, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-bca-cloud',
    code: 'BCA-AI',
    name: 'BCA - Bachelor of Computer Applications (Cloud Computing & AI)',
    school: 'University School of Computing (USC)',
    department: 'Information Technology & Applications',
    category: 'COMPUTING',
    partner: 'Industry Cloud Alliance',
    partnerBadge: 'Next-Gen IT Lab',
    durationYears: 3,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 51,
    allIndiaSeats: 9,
    baseFee: 65000,
    applicationFee: 800,
    specializations: ['Full Stack Web Dev', 'Cloud Architecture', 'Generative AI Applications'],
    eligibilityCriteria: {
      minScorePercentage: 50,
      requiredSubjects: ['Mathematics / Statistics / Computer'],
      entranceExamAccepted: ['12th_MERIT', 'LTSU-SET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 26, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 13, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 2, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 9, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-mca',
    code: 'MCA-PRO',
    name: 'MCA - Master of Computer Applications',
    school: 'University School of Computing (USC)',
    department: 'Computer Applications',
    category: 'COMPUTING',
    partner: 'Software Industry Council',
    partnerBadge: 'Enterprise Tech',
    durationYears: 2,
    degreeLevel: 'POSTGRADUATE',
    totalSeats: 40,
    punjabSeats: 34,
    allIndiaSeats: 6,
    baseFee: 85000,
    applicationFee: 1000,
    specializations: ['Enterprise AI & Cloud', 'DevOps & Cyber Security'],
    eligibilityCriteria: {
      minScorePercentage: 50,
      requiredSubjects: ['BCA / B.Sc IT / B.Tech / Graduation with Maths'],
      entranceExamAccepted: ['GRADUATION_MERIT', 'LTSU-SET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 17, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 9, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 4, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 3, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 1, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 6, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-bpharm',
    code: 'BPHARM-RIP',
    name: 'B.Pharm - Bachelor of Pharmacy',
    school: 'Rayat Institute of Pharmacy (PCI Approved)',
    department: 'Pharmaceutical Sciences',
    category: 'PHARMACY',
    partner: 'Pharma Corporate Tie-ups',
    partnerBadge: 'PCI Approved',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 51,
    allIndiaSeats: 9,
    baseFee: 95000,
    applicationFee: 1000,
    specializations: ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry'],
    eligibilityCriteria: {
      minScorePercentage: 50,
      requiredSubjects: ['Physics', 'Chemistry', 'Biology / Mathematics'],
      entranceExamAccepted: ['12th_MERIT', 'NEET', 'LTSU-SET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 26, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 13, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 2, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 9, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-dpharm',
    code: 'DPHARM-RIP',
    name: 'D.Pharm - Diploma in Pharmacy',
    school: 'Rayat Institute of Pharmacy (PCI Approved)',
    department: 'Pharmaceutical Sciences',
    category: 'PHARMACY',
    partner: 'Hospital Pharmacy Network',
    partnerBadge: 'PCI Approved',
    durationYears: 2,
    degreeLevel: 'DIPLOMA',
    totalSeats: 60,
    punjabSeats: 51,
    allIndiaSeats: 9,
    baseFee: 60000,
    applicationFee: 800,
    specializations: ['Hospital Pharmacy', 'Drug Dispensing'],
    eligibilityCriteria: {
      minScorePercentage: 45,
      requiredSubjects: ['Physics', 'Chemistry', 'Biology / Mathematics'],
      entranceExamAccepted: ['12th_MERIT'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 26, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 13, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 5, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 9, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-bsc-nursing',
    code: 'BSC-NURSING',
    name: 'B.Sc. Nursing',
    school: 'University College of Nursing (PNRC & INC Recognized)',
    department: 'Nursing & Health Sciences',
    category: 'HEALTH',
    partner: 'Super-Specialty Clinical Hospitals',
    partnerBadge: 'INC & PNRC Approved',
    durationYears: 4,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 50,
    punjabSeats: 43,
    allIndiaSeats: 7,
    baseFee: 90000,
    applicationFee: 1000,
    specializations: ['Critical Care Nursing', 'Community Health', 'Obstetric Nursing'],
    eligibilityCriteria: {
      minScorePercentage: 50,
      requiredSubjects: ['Physics', 'Chemistry', 'Biology', 'English'],
      entranceExamAccepted: ['PPMET', 'LTSU_NURSING_ENTRANCE'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 22, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 11, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 4, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 4, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 2, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 7, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-bba-fintech',
    code: 'BBA-FINTECH',
    name: 'BBA - Bachelor of Business Administration (FinTech & Digital Marketing)',
    school: 'University School of Commerce & Management (USCM)',
    department: 'Management Studies',
    category: 'MANAGEMENT',
    partner: 'Banking & Financial Corporates',
    partnerBadge: 'Corporate Immersion',
    durationYears: 3,
    degreeLevel: 'UNDERGRADUATE',
    totalSeats: 60,
    punjabSeats: 51,
    allIndiaSeats: 9,
    baseFee: 60000,
    applicationFee: 800,
    specializations: ['FinTech', 'Digital Marketing & E-Commerce', 'Data Analytics'],
    eligibilityCriteria: {
      minScorePercentage: 50,
      requiredSubjects: ['10+2 Any Stream (Commerce/Science/Arts)'],
      entranceExamAccepted: ['12th_MERIT', 'LTSU-SET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 26, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 13, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 5, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 9, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-mba-strategy',
    code: 'MBA-INDUSTRY',
    name: 'MBA - Master of Business Administration (Industry Integrated)',
    school: 'University School of Commerce & Management (USCM)',
    department: 'Management Studies',
    category: 'MANAGEMENT',
    partner: 'Corporate Mentorship Board',
    partnerBadge: 'Dual Specialization',
    durationYears: 2,
    degreeLevel: 'POSTGRADUATE',
    totalSeats: 60,
    punjabSeats: 51,
    allIndiaSeats: 9,
    baseFee: 110000,
    applicationFee: 1000,
    specializations: ['Business Analytics', 'Financial Management', 'HR & Strategy'],
    eligibilityCriteria: {
      minScorePercentage: 50,
      requiredSubjects: ['Bachelor Degree in any discipline'],
      entranceExamAccepted: ['CAT', 'MAT', 'CMAT', 'LTSU-SET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 26, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 13, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 5, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 2, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 9, allottedSeats: 0 },
    ],
  },
  {
    id: 'ltsu-polytechnic',
    code: 'DIPLOMA-ENGG',
    name: 'Diploma in Engineering (Mechanical / CSE / Electrical)',
    school: 'University School of Polytechnic (USOP)',
    department: 'Polytechnic Engineering',
    category: 'POLYTECHNIC',
    partner: 'Belrise Industries & Skill India',
    partnerBadge: '100% Practical Training',
    durationYears: 3,
    degreeLevel: 'DIPLOMA',
    totalSeats: 90,
    punjabSeats: 77,
    allIndiaSeats: 13,
    baseFee: 45000,
    applicationFee: 500,
    specializations: ['Mechanical Workshop', 'Embedded Systems', 'Industrial Automation'],
    eligibilityCriteria: {
      minScorePercentage: 45,
      requiredSubjects: ['10th Standard with Maths & Science / 2-Year ITI'],
      entranceExamAccepted: ['10th_MERIT', 'PUNJAB_JET'],
    },
    quotas: [
      { category: 'PUNJAB_GENERAL', totalSeats: 39, allottedSeats: 0 },
      { category: 'PUNJAB_SC', totalSeats: 19, allottedSeats: 0 },
      { category: 'PUNJAB_BC', totalSeats: 8, allottedSeats: 0 },
      { category: 'PUNJAB_EWS', totalSeats: 8, allottedSeats: 0 },
      { category: 'PUNJAB_PWD', totalSeats: 3, allottedSeats: 0 },
      { category: 'ALL_INDIA_OPEN', totalSeats: 13, allottedSeats: 0 },
    ],
  },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>(LTSU_FULL_PROGRAMS);
  const [selectedDegree, setSelectedDegree] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    api
      .getPrograms()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // If the backend has programs, keep them or integrate
        }
      })
      .catch(() => {});
  }, []);

  const filteredPrograms = programs.filter((p) => {
    const matchesDegree = selectedDegree === 'ALL' || p.degreeLevel === selectedDegree;
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDegree && matchesCat && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lamrin Tech Skills University Punjab • Sanctioned Intake 2026-27</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Academic Programs &amp; Seat Matrix
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Centralized Seat Allotment for <strong>85% Punjab Resident Quota</strong> and <strong>15% All-India Open Quota</strong>. All industry-partnered degrees adhere to UGC and statutory council regulations.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-400/20 transition-all shrink-0"
            >
              <span>Start Online Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by program name, code (e.g. BTECH-CSE), or school..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#12283e] bg-slate-50/50"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto text-xs font-bold">
              {['ALL', 'UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDegree(lvl)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedDegree === lvl
                      ? 'bg-[#12283e] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Degrees' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="space-y-6">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6 md:p-7">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-black bg-slate-100 text-slate-800 border border-slate-200">
                        {prog.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {prog.partnerBadge}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        • {prog.durationYears} Years ({prog.degreeLevel})
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      {prog.name}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {prog.school} &bull; Dept. of {prog.department}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block font-medium">Semester Tuition Fee</span>
                    <span className="text-xl font-black text-[#12283e]">
                      ₹{prog.baseFee.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      PMS 100% Subsidy for Punjab SC/ST
                    </span>
                  </div>
                </div>

                {/* Eligibility & Specializations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <strong className="text-slate-900 block mb-1">Academic Eligibility Criteria:</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Minimum {prog.eligibilityCriteria.minScorePercentage}% aggregate marks in qualifying exam. Subjects: {prog.eligibilityCriteria.requiredSubjects.join(', ')}.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Accepted Exams: {prog.eligibilityCriteria.entranceExamAccepted.join(', ')}
                    </p>
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-1">Industry Specialization Tracks:</strong>
                    <div className="flex flex-wrap gap-1.5">
                      {prog.specializations.map((spec: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Seat Quota Matrix Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">
                      Sanctioned Intake Breakdown: <span className="text-blue-700">{prog.totalSeats} Total Seats</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-semibold">
                      Punjab Domicile: {prog.punjabSeats} Seats (85%) | All-India: {prog.allIndiaSeats} Seats (15%)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {prog.quotas.map((q: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white text-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block truncate">
                          {q.category.replace('PUNJAB_', 'PB ').replace('_', ' ')}
                        </span>
                        <span className="text-sm font-black text-slate-900 mt-0.5 block">
                          {q.totalSeats}
                        </span>
                        <span className="text-[9px] text-emerald-600 font-medium">Available</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Strip */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Auditable merit ranking &amp; transparent seat allocation.</span>
                  </div>
                  <Link
                    href={`/register?program=${prog.code}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#12283e] hover:bg-[#0b1c2d] shadow-sm transition-all"
                  >
                    <span>Apply for {prog.code}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
