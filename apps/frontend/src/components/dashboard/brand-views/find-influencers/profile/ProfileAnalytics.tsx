'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';

interface ProfileAnalyticsProps {
  creator: CreatorItem;
}

export default function ProfileAnalytics({ creator }: ProfileAnalyticsProps) {
  const [activePlatform, setActivePlatform] = useState<'instagram' | 'tiktok'>('instagram');

  // Platform specific data (customizable or from creator)
  const isInsta = activePlatform === 'instagram';

  const followerDisplay = isInsta ? creator.reach || '1.6k' : '2.6k';
  const avgViews = isInsta ? '5.1k' : '8.4k';
  const engagement = isInsta ? (creator.engRate || '4.9%') : '6.2%';

  // Audience Location Data
  const locationData = [
    { country: 'United States', code: 'US', pct: 92 },
    { country: 'Viet Nam', code: 'VN', pct: 1 },
    { country: 'Australia', code: 'AU', pct: 1 },
    { country: 'Other', code: '', pct: 2 },
  ];

  // Audience Age Data
  const ageData = [
    { range: '13-17', pct: 13 },
    { range: '18-24', pct: 51 },
    { range: '25-34', pct: 32 },
    { range: '35-44', pct: 2 },
    { range: '45-64', pct: 1 },
    { range: '65+', pct: 0 },
  ];

  // Audience Gender
  const femalePct = 57;
  const malePct = 43;

  // SVG Donut calculation (radius: 40, circumference: 2 * PI * 40 = 251.32)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const femaleStrokeDash = (femalePct / 100) * circumference;
  const maleStrokeDash = (malePct / 100) * circumference;

  return (
    <div className="space-y-8 pt-4 border-t border-white/10">
      {/* 1. Header & Platform Tabs */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Analytics
        </h2>

        {/* Platform Tabs */}
        <div className="flex items-center gap-6 border-b border-white/10">
          <button
            type="button"
            onClick={() => setActivePlatform('instagram')}
            className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative ${
              activePlatform === 'instagram'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Instagram</span>
            {activePlatform === 'instagram' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePlatform('tiktok')}
            className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative ${
              activePlatform === 'tiktok'
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V12.9a8.28 8.28 0 0 0 5.73 2.25V11.7a4.84 4.84 0 0 1-3.77-1.57A4.85 4.85 0 0 1 19.59 6.69z" />
            </svg>
            <span>TikTok</span>
            {activePlatform === 'tiktok' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Top 3 KPI Stats */}
      <div className="grid grid-cols-3 gap-6 max-w-lg">
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {followerDisplay}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Followers
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {avgViews}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Average Views
          </div>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            <span>{engagement}</span>
            <Info className="w-4 h-4 text-slate-400 cursor-help" />
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Engagement
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Location & Age in 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-2">
        {/* Audience Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Audience Location
          </h3>

          <div className="space-y-4">
            {locationData.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    {item.code && (
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {item.code}
                      </span>
                    )}
                    <span>{item.country}</span>
                  </div>
                  <span className="font-bold text-white">{item.pct}%</span>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.pct > 10 ? '#7c9dfc' : '#a5b4fc',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Age */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight">
            Audience Age
          </h3>

          {/* Vertical Bar Chart */}
          <div className="grid grid-cols-6 gap-2 sm:gap-3 items-end h-[170px] pt-4">
            {ageData.map((item, idx) => {
              const heightPct = Math.max(item.pct, 3);
              const isHighlight = item.pct >= 30;

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  {/* Percentage label above bar */}
                  <span className="text-xs font-bold text-slate-200 mb-1.5">
                    {item.pct}%
                  </span>

                  {/* Vertical bar container */}
                  <div className="w-full max-w-[28px] h-[105px] bg-slate-800/70 rounded-full flex items-end overflow-hidden">
                    <div
                      className="w-full rounded-full transition-all duration-700"
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: isHighlight ? '#7c9dfc' : '#93c5fd',
                      }}
                    />
                  </div>

                  {/* Age bracket label below bar */}
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-2 whitespace-nowrap">
                    {item.range}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Audience Gender */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-bold text-white tracking-tight">
          Audience Gender
        </h3>

        <div className="flex items-center gap-8">
          {/* Circular Donut Chart */}
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Full Track (Male part) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="14"
                fill="transparent"
              />

              {/* Female Arc (Blue) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#7c9dfc"
                strokeWidth="14"
                strokeDasharray={`${femaleStrokeDash} ${circumference - femaleStrokeDash}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {/* Female */}
            <div className="flex items-center gap-3 text-sm">
              <span className="w-3 h-3 rounded-full bg-[#7c9dfc] shrink-0" />
              <span className="text-slate-300 font-medium">Female</span>
              <span className="font-extrabold text-white">{femalePct}%</span>
            </div>

            {/* Male */}
            <div className="flex items-center gap-3 text-sm">
              <span className="w-3 h-3 rounded-full bg-slate-700 shrink-0" />
              <span className="text-slate-300 font-medium">Male</span>
              <span className="font-extrabold text-white">{malePct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
