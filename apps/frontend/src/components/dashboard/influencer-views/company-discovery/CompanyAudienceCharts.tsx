'use client';

import React from 'react';
import { Users, PieChart as PieIcon, BarChart3, Globe2, Sparkles } from 'lucide-react';

interface CompanyAudienceChartsProps {
  genderData?: { label: string; percentage: number; color: string }[];
  ageData?: { range: string; percentage: number }[];
  locationData?: { country: string; percentage: number }[];
  platformData?: { platform: string; percentage: number; color: string }[];
}

export default function CompanyAudienceCharts({
  genderData = [
    { label: 'Female', percentage: 58, color: '#c084fc' }, // purple-400
    { label: 'Male', percentage: 34, color: '#818cf8' },   // indigo-400
    { label: 'Non-Binary', percentage: 8, color: '#f472b6' } // pink-400
  ],
  ageData = [
    { range: '18-24', percentage: 44 },
    { range: '25-34', percentage: 38 },
    { range: '35-44', percentage: 13 },
    { range: '45+', percentage: 5 }
  ],
  locationData = [
    { country: 'United States', percentage: 54 },
    { country: 'United Kingdom', percentage: 18 },
    { country: 'Canada', percentage: 14 },
    { country: 'Germany / EU', percentage: 9 },
    { country: 'Other Global', percentage: 5 }
  ],
  platformData = [
    { platform: 'Instagram', percentage: 48, color: '#ec4899' },
    { platform: 'YouTube', percentage: 32, color: '#ef4444' },
    { platform: 'TikTok', percentage: 20, color: '#a855f7' }
  ]
}: CompanyAudienceChartsProps) {
  // SVG Donut Chart Calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <PieIcon className="w-4 h-4 text-purple-400" />
          <span>Audience Demographics & Intelligence</span>
        </h3>
        <span className="text-[11px] text-purple-300/80 font-semibold flex items-center gap-1 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
          <Sparkles className="w-3 h-3 text-purple-400" /> AI Verified Analytics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Gender Demographics Donut Chart */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Gender Breakdown
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Primary Audience</span>
          </div>

          <div className="flex items-center gap-6 justify-around py-1">
            {/* SVG Donut Chart */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-slate-900/60"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                />
                {genderData.map((item, idx) => {
                  const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                  accumulatedPercent += item.percentage;

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={item.color}
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 hover:opacity-80"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-white">58%</span>
                <span className="text-[9px] font-bold text-purple-300 uppercase">Female</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 flex-1 min-w-0">
              {genderData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 truncate font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-white pl-2">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Age Distribution Horizontal Bar Chart */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Age Group Distribution
            </span>
            <span className="text-[10px] text-purple-300 font-bold">18-34 (82%)</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {ageData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{item.range} years</span>
                  <span className="text-white font-bold">{item.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Platform Distribution & Top Geographic Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Platform Share */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">Platform Engagement Share</span>
            <span className="text-[10px] text-slate-400">Target Reach</span>
          </div>
          <div className="space-y-2">
            {platformData.map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{p.platform}</span>
                  <span className="text-white font-bold">{p.percentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Geographic Markets */}
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-md space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-purple-400" /> Geographic Audience
            </span>
            <span className="text-[10px] text-slate-400">Top Regions</span>
          </div>
          <div className="space-y-1.5">
            {locationData.map((loc, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-900/40 border border-white/5">
                <span className="text-slate-300 truncate">{loc.country}</span>
                <span className="text-purple-300 font-bold ml-2">{loc.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
