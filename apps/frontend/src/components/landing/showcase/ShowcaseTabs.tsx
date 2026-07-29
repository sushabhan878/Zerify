'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart2, Target, Sliders, LucideIcon } from 'lucide-react';

export type TabType = 'discover' | 'manage' | 'affiliate' | 'measure';

export interface TabItem {
  id: TabType;
  label: string;
  icon: LucideIcon;
}

export const SHOWCASE_TABS: TabItem[] = [
  { id: 'discover', label: 'Discover & Nurture', icon: Search },
  { id: 'manage', label: 'Manage & Scale', icon: BarChart2 },
  { id: 'affiliate', label: 'Affiliate & Ad', icon: Target },
  { id: 'measure', label: 'Measure & Refine', icon: Sliders },
];

interface ShowcaseTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function ShowcaseTabs({ activeTab, onTabChange }: ShowcaseTabsProps) {
  return (
    <div className="flex justify-center mb-14">
      <div className="inline-flex p-2 sm:p-2.5 rounded-full bg-slate-900/90 border border-white/15 backdrop-blur-xl gap-2 sm:gap-3 shadow-2xl overflow-x-auto max-w-full">
        {SHOWCASE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-bold transition-colors duration-300 flex items-center gap-2.5 whitespace-nowrap relative z-10 ${
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
              <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
