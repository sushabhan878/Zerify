'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';

export type ApplicationSectionMode = 'OFFERS' | 'PITCHES';

interface ApplicationsViewSliderProps {
  activeMode: ApplicationSectionMode;
  onChangeMode: (mode: ApplicationSectionMode) => void;
  pendingOffersCount: number;
  myPitchesCount: number;
}

export default function ApplicationsViewSlider({
  activeMode,
  onChangeMode,
  pendingOffersCount,
  myPitchesCount,
}: ApplicationsViewSliderProps) {
  const tabs = [
    {
      id: 'OFFERS' as ApplicationSectionMode,
      label: 'Collaboration Offers',
      icon: Sparkles,
      count: pendingOffersCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'PITCHES' as ApplicationSectionMode,
      label: 'My Pitches & Applications',
      icon: Send,
      count: myPitchesCount,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
  ];

  return (
    <div className="flex items-center justify-center sm:justify-start w-full">
      <div className="relative flex items-center p-1.5 rounded-2xl bg-slate-950/70 border border-purple-500/20 backdrop-blur-xl shadow-lg w-full sm:w-auto">
        {tabs.map((tab) => {
          const isActive = activeMode === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeMode(tab.id)}
              type="button"
              className={`relative z-10 flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="applicationSliderIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md shadow-purple-950/50"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-200' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </span>

              <span
                className={`relative z-10 px-2 py-0.5 rounded-full text-[11px] font-extrabold border transition-all ${
                  isActive
                    ? 'bg-white/20 text-white border-white/30'
                    : `${tab.badgeColor}`
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
