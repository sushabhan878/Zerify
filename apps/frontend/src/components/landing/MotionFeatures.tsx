'use client';

import React from 'react';
import MatchRecruitCard from './motion-features/MatchRecruitCard';
import CampaignScaleCard from './motion-features/CampaignScaleCard';
import ContentOptimizeCard from './motion-features/ContentOptimizeCard';

export default function MotionFeatures() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-transparent">

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
