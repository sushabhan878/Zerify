'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ShowcaseTabs, { TabType } from './showcase/ShowcaseTabs';
import DashboardShowcaseView from './showcase/DashboardShowcaseView';

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

        {/* Dashboard Screenshots Showcase Area */}
        <div className="relative min-h-[520px]">
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <DashboardShowcaseView
                key="analytics"
                imageSrc="/dashboard/Analytics Dashboard.png"
                title="Analytics Dashboard"
                urlPath="dashboard/analytics"
                badgeText="Real-Time ROAS & Reach Tracking"
                badgeIcon="sparkles"
              />
            )}
            {activeTab === 'brand-discovery' && (
              <DashboardShowcaseView
                key="brand-discovery"
                imageSrc="/dashboard/AI Brand Discovery.png"
                title="AI Brand Discovery"
                urlPath="dashboard/discovery"
                badgeText="AI Niche & Brand Matching"
                badgeIcon="zap"
              />
            )}
            {activeTab === 'creator-match' && (
              <DashboardShowcaseView
                key="creator-match"
                imageSrc="/dashboard/AI Creator Match.png"
                title="AI Creator Match"
                urlPath="dashboard/match"
                badgeText="98% Audience Fit Confidence"
                badgeIcon="shield"
              />
            )}
            {activeTab === 'workspace' && (
              <DashboardShowcaseView
                key="workspace"
                imageSrc="/dashboard/Campaign Workspace.png"
                title="Campaign Workspace"
                urlPath="dashboard/workspace"
                badgeText="Automated Briefing & Escrow Protection"
                badgeIcon="lock"
              />
            )}
            {activeTab === 'earnings-insights' && (
              <DashboardShowcaseView
                key="earnings-insights"
                imageSrc="/dashboard/Analytics Dashboard.png"
                title="Earnings & AI Insights"
                urlPath="dashboard/insights"
                badgeText="Predictive ROAS & Creator Growth"
                badgeIcon="sparkles"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
