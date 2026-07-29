'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Sparkles,
  Zap,
  Briefcase,
  Brain,
  LucideIcon,
} from 'lucide-react';

export type TabType =
  | 'analytics'
  | 'brand-discovery'
  | 'creator-match'
  | 'workspace'
  | 'earnings-insights';

export interface TabItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

export const SHOWCASE_TABS: TabItem[] = [
  { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
  { id: 'brand-discovery', label: 'AI Brand Discovery', icon: Sparkles },
  { id: 'creator-match', label: 'AI Creator Match', icon: Zap },
  { id: 'workspace', label: 'Campaign Workspace', icon: Briefcase },
  { id: 'earnings-insights', label: 'Earnings + AI Insights', icon: Brain },
];

interface ShowcaseTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function ShowcaseTabs({ activeTab, onTabChange }: ShowcaseTabsProps) {
  return (
    <div className="flex justify-center mb-14">
      {/* Outer Glowing Wrapper with Circular Spinning Conic Gradient */}
      <div className="relative p-[1.5px] rounded-full overflow-hidden max-w-full shadow-[0_0_30px_rgba(168,85,247,0.25)]">
        {/* Animated Circular Spinning Conic Glow Border */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#c084fc,#f472b6,#818cf8,#38bdf8,#c084fc)] opacity-80 blur-[2px]"
        />

        {/* Inner Pill Container */}
        <div className="relative z-10 inline-flex p-2 sm:p-2.5 rounded-full bg-[#0b0f19]/95 backdrop-blur-2xl gap-1.5 sm:gap-2 overflow-x-auto max-w-full">
          {SHOWCASE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-300 flex items-center gap-2 whitespace-nowrap relative z-10 ${
                  isActive ? 'text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-slate-100 rounded-full shadow-xl shadow-white/10 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
