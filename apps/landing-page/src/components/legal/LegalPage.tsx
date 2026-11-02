import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

interface LegalPageProps {
  title: string;
  description: string;
  effectiveDate: string;
  currentPath: '/terms-of-service' | '/privacy-policy';
  children: ReactNode;
}

const legalLinks = [
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

export default function LegalPage({ title, description, effectiveDate, currentPath, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        <div aria-hidden="true" className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-900/20 via-pink-900/10 to-transparent blur-[160px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07090E]">
            <ArrowLeft aria-hidden="true" className="w-4 h-4" />
            Back to home
          </Link>
          <header className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Zerify <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">{title}</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg">{description}</p>
            <p className="text-xs font-mono text-purple-300/80 bg-purple-950/40 inline-block px-3 py-1 rounded-md border border-purple-800/30">
              Effective Date: {effectiveDate}
            </p>
          </header>
          <nav aria-label="Legal pages" className="flex flex-wrap justify-center gap-3">
            {legalLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={currentPath === href ? 'page' : undefined}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07090E] ${currentPath === href ? 'border-purple-500/40 bg-purple-500/15 text-purple-200' : 'border-white/10 text-slate-400 hover:border-purple-400 hover:text-white'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="space-y-8 [&_section]:scroll-mt-32 [&_a]:break-words [&_a]:focus-visible:outline-purple-400">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
