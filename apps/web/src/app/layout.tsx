import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Apex Institute Admissions Portal 2026-27 | Higher Education Admission System',
  description:
    'Official centralized online admission management system for undergraduate engineering and postgraduate management programs. Auditable workflow from application to confirmed seat.',
  keywords: [
    'College Admissions',
    'B.Tech Admission 2026',
    'Engineering College Admissions',
    'MBA Admissions',
    'Merit Seat Allotment',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
