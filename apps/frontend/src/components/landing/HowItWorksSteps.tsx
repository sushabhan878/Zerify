'use client';

import React from 'react';
import StepOneSearch from './how-it-works/StepOneSearch';
import StepTwoVerify from './how-it-works/StepTwoVerify';
import StepThreeTrust from './how-it-works/StepThreeTrust';

export default function HowItWorksSteps() {
  return (
    <section className="py-28 relative overflow-hidden bg-[#07090E]">
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-28 sm:space-y-36">
        <StepOneSearch />
        <StepTwoVerify />
        <StepThreeTrust />
      </div>
    </section>
  );
}
