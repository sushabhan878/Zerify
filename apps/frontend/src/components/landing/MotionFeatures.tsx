'use client';

import React from 'react';
import MatchRecruitCard from './motion-features/MatchRecruitCard';
import CampaignScaleCard from './motion-features/CampaignScaleCard';
import ContentOptimizeCard from './motion-features/ContentOptimizeCard';

export default function MotionFeatures() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#07090E]">
      {/* Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-purple-600/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <MatchRecruitCard />
          <CampaignScaleCard />
          <ContentOptimizeCard />
        </div>
      </div>
    </section>
  );
}
