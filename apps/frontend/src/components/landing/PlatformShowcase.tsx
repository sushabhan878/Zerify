'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ShowcaseTabs, { TabType } from './showcase/ShowcaseTabs';
import ReportingView from './showcase/ReportingView';
import DiscoverView from './showcase/DiscoverView';
import ManageView from './showcase/ManageView';
import AffiliateView from './showcase/AffiliateView';

export default function PlatformShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>('measure');

  return (
    <section className="py-24 relative overflow-hidden bg-[#07090E]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-600/05 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
            The all-in-one creator platform
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal">
            Everything your creator program needs, from first search to final report.
          </p>
        </div>

        {/* Tab Buttons Component */}
        <ShowcaseTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Dashboard Container */}
        <div className="relative rounded-3xl bg-slate-950/90 border border-white/15 backdrop-blur-2xl p-3 sm:p-6 shadow-2xl overflow-hidden min-h-[580px]">
          <AnimatePresence mode="wait">
            {activeTab === 'measure' && <ReportingView key="measure" />}
            {activeTab === 'discover' && <DiscoverView key="discover" />}
            {activeTab === 'manage' && <ManageView key="manage" />}
            {activeTab === 'affiliate' && <AffiliateView key="affiliate" />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
