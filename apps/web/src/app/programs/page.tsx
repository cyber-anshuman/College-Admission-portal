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
} from 'lucide-react';
import { api } from '../../lib/api';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDegree, setSelectedDegree] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    api
      .getPrograms()
      .then((data) => {
        if (Array.isArray(data)) {
          setPrograms(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load programs:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPrograms = programs.filter((p) => {
    const matchesDegree =
      selectedDegree === 'ALL' || p.degreeLevel === selectedDegree;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDegree && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-institutional-50 text-institutional-700 text-xs font-semibold mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Sanctioned Intake & Reservation Quotas 2026-27</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Academic Programs & Seat Matrix
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Browse all AICTE/University approved undergraduate and postgraduate courses. Real-time quota allocations are updated atomically to prevent oversubscription.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-institutional-700 hover:bg-institutional-800 shadow-sm transition-all"
            >
              Start Online Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search programs by name, code (e.g. BTECH-CSE), or department..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-institutional-500 bg-slate-50/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs font-medium text-slate-500">Degree:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['ALL', 'UNDERGRADUATE', 'POSTGRADUATE'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDegree(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedDegree === lvl
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lvl === 'ALL'
                      ? 'All'
                      : lvl === 'UNDERGRADUATE'
                      ? 'UG (B.Tech)'
                      : 'PG (MBA/MCA)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Programs Listing */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-institutional-600 mb-3" />
            <p className="text-sm">Loading programs and seat matrix...</p>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-700">No programs matched your filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try searching with a different keyword or reset degree level.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPrograms.map((p) => (
              <div
                key={p.code}
                id={p.code}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-colors"
              >
                {/* Header Row */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-institutional-100 text-institutional-800">
                        {p.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {p.degreeLevel} • {p.durationYears} Years Duration
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      {p.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Department: {p.department}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-xs text-slate-400">Total Sanctioned Seats</span>
                      <p className="text-lg font-bold text-slate-900">{p.totalSeats} Seats</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Annual Base Fee</span>
                      <p className="text-lg font-bold text-emerald-700">
                        ₹{p.baseFee?.toLocaleString('en-IN') || '0'}/year
                      </p>
                    </div>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-institutional-700 hover:bg-institutional-800 transition-colors shrink-0"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>

                {/* Quota Breakdown Table */}
                <div className="p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Category Reservation Breakdown (Central / State Quota Compliance)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-3">Quota Category</th>
                          <th className="py-2.5 px-3 text-center">Sanctioned Seats</th>
                          <th className="py-2.5 px-3 text-center">Allotted Seats</th>
                          <th className="py-2.5 px-3 text-center">Confirmed Seats</th>
                          <th className="py-2.5 px-3 text-center">Available Seats</th>
                          <th className="py-2.5 px-3 text-right">Seat Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {p.quotas && p.quotas.length > 0 ? (
                          p.quotas.map((q: any) => {
                            const available = q.availableSeats ?? Math.max(0, q.totalSeats - q.allottedSeats);
                            return (
                              <tr key={q.category} className="hover:bg-slate-50/50">
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {q.category.replace('_', '-')}
                                </td>
                                <td className="py-2 px-3 text-center font-medium">
                                  {q.totalSeats}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-500">
                                  {q.allottedSeats}
                                </td>
                                <td className="py-2 px-3 text-center text-slate-500">
                                  {q.confirmedSeats}
                                </td>
                                <td className="py-2 px-3 text-center font-bold text-slate-900">
                                  {available}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {available > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle className="w-3 h-3" />
                                      Seats Open
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                      Quota Full
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-slate-400">
                              Quota breakdown not yet published for this course
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Eligibility Criteria Box */}
                  {p.eligibilityCriteria && (
                    <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex flex-wrap gap-4 items-center">
                      <span className="font-semibold text-slate-800">Eligibility Criteria:</span>
                      {p.eligibilityCriteria.minScorePercentage && (
                        <span>Min. {p.eligibilityCriteria.minScorePercentage}% aggregate in qualifying examination.</span>
                      )}
                      {p.eligibilityCriteria.requiredSubjects && (
                        <span>Mandatory Subjects: {p.eligibilityCriteria.requiredSubjects.join(', ')}.</span>
                      )}
                      {p.eligibilityCriteria.entranceExamAccepted && (
                        <span>Accepted Entrance Scores: {p.eligibilityCriteria.entranceExamAccepted.join(', ')}.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
