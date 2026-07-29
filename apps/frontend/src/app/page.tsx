import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import PlatformShowcase from '@/components/landing/PlatformShowcase';
import TestimonialCta from '@/components/landing/TestimonialCta';
import MotionFeatures from '@/components/landing/MotionFeatures';
import HowItWorksSteps from '@/components/landing/HowItWorksSteps';
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
        <MotionFeatures />
        <HowItWorksSteps />
        <ComparisonSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
