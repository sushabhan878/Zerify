import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import PlatformShowcase from '@/components/landing/PlatformShowcase';
import TestimonialCta from '@/components/landing/TestimonialCta';
import FeatureGrid from '@/components/landing/FeatureGrid';
import ComparisonSection from '@/components/landing/ComparisonSection';
import FaqSection from '@/components/landing/FaqSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PlatformShowcase />
        <TestimonialCta />
        <FeatureGrid />
        <ComparisonSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
