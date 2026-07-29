'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ShowcaseTabs, { TabType } from './showcase/ShowcaseTabs';
import ReportingView from './showcase/ReportingView';
import DiscoverView from './showcase/DiscoverView';
import ManageView from './showcase/ManageView';
import AffiliateView from './showcase/AffiliateView';

export default function PlatformShowcase() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  return (
    <section className="py-24 relative overflow-hidden bg-transparent">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
            The All-in-One Platform for Brands &amp; Creators
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal">
            Everything brands and creators need to connect, collaborate, scale campaigns, and track real-time ROI.
          </p>
        </div>

        {/* Tab Buttons Component with 5 Tabs */}
        <ShowcaseTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Floating View Area */}
        <div className="relative min-h-[520px]">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && <ReportingView key="analytics" />}
            {activeTab === 'brand-discovery' && <DiscoverView key="brand-discovery" />}
            {activeTab === 'creator-match' && <DiscoverView key="creator-match" />}
            {activeTab === 'workspace' && <ManageView key="workspace" />}
            {activeTab === 'earnings-insights' && <AffiliateView key="earnings-insights" />}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
