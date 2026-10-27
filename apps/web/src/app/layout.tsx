import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'LTSU Centralized Admissions Portal 2026-27 | Lamrin Tech Skills University Punjab',
  description:
    'Official Centralized Online Admission Management System for Lamrin Tech Skills University (LTSU) Punjab, Ropar. First Industry-led Skill University in India, Estd. under Punjab State Act No. 22 of 2021 | UGC Recognized.',
  keywords: [
    'Lamrin Tech Skills University',
    'LTSU Punjab Admission 2026',
    'LTSU Ropar',
    'Punjab College Admissions',
    'B.Tech CSE IBM LTSU',
    'Rayat Institute of Pharmacy',
    'Centralized Admission Punjab',
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
