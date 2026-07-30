'use client';

import React from 'react';
import StepOneSearch from './how-it-works/StepOneSearch';
import StepTwoVerify from './how-it-works/StepTwoVerify';
import StepThreeTrust from './how-it-works/StepThreeTrust';

export default function HowItWorksSteps() {
  return (
    <section id="how-it-works" className="py-28 relative overflow-hidden bg-transparent">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-28 sm:space-y-36">
        <StepOneSearch />
        <StepTwoVerify />
        <StepThreeTrust />
      </div>
    </section>
  );
}
