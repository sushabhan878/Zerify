'use client';

import React from 'react';
import { Globe, Users, Clock, MapPin } from 'lucide-react';

export interface DemographicRecord {
  type: string;
  key: string;
  label?: string | null;
  value: number;
}

interface AudienceDemographicsCardProps {
  demographics?: DemographicRecord[];
}

export default function AudienceDemographicsCard({ demographics = [] }: AudienceDemographicsCardProps) {
  // Parse dynamic demographics if available
  const ageRecords = demographics.filter((d) => d.type === 'AGE_GENDER');
  const countryRecords = demographics.filter((d) => d.type === 'COUNTRY');

  // Compute Age Distribution
  let ageDist = [
    { range: '18-24', pct: '38%', color: 'bg-purple-500' },
    { range: '25-34', pct: '44%', color: 'bg-pink-500' },
    { range: '35-44', pct: '12%', color: 'bg-indigo-500' },
    { range: '45+', pct: '6%', color: 'bg-cyan-500' },
  ];

  let femalePct = 62;
  let malePct = 34;
  let otherPct = 4;

  if (ageRecords.length > 0) {
    let fTotal = 0;
    let mTotal = 0;
    let oTotal = 0;

    let age1824 = 0;
    let age2534 = 0;
    let age3544 = 0;
    let age45plus = 0;

    for (const r of ageRecords) {
      const v = Number(r.value || 0);
      const k = (r.key || '').toUpperCase();

      if (k.includes('.F') || k.includes('FEMALE') || k.startsWith('F.')) {
        fTotal += v;
      } else if (k.includes('.M') || k.includes('MALE') || k.startsWith('M.')) {
        mTotal += v;
      } else {
        oTotal += v;
      }

      if (k.includes('18-24') || k.includes('18_24')) age1824 += v;
      else if (k.includes('25-34') || k.includes('25_34')) age2534 += v;
      else if (k.includes('35-44') || k.includes('35_44')) age3544 += v;
      else if (k.includes('45') || k.includes('55') || k.includes('65')) age45plus += v;
    }

    const totalGender = fTotal + mTotal + oTotal;
    if (totalGender > 0) {
      femalePct = Math.round((fTotal / totalGender) * 100);
      malePct = Math.round((mTotal / totalGender) * 100);
      otherPct = Math.max(0, 100 - femalePct - malePct);
    }

    const totalAge = age1824 + age2534 + age3544 + age45plus;
    if (totalAge > 0) {
      ageDist = [
        { range: '18-24', pct: `${Math.round((age1824 / totalAge) * 100)}%`, color: 'bg-purple-500' },
        { range: '25-34', pct: `${Math.round((age2534 / totalAge) * 100)}%`, color: 'bg-pink-500' },
        { range: '35-44', pct: `${Math.round((age3544 / totalAge) * 100)}%`, color: 'bg-indigo-500' },
        { range: '45+', pct: `${Math.round((age45plus / totalAge) * 100)}%`, color: 'bg-cyan-500' },
      ];
    }
  }

  const genderDist = [
    { label: 'Female', pct: `${femalePct}%`, color: 'bg-pink-500' },
    { label: 'Male', pct: `${malePct}%`, color: 'bg-purple-500' },
    { label: 'Other', pct: `${otherPct}%`, color: 'bg-indigo-500' },
  ];

  // Top Countries if available
  const topCountries = countryRecords.slice(0, 4);

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Audience Demographics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Audience age, gender distribution, and geographic reach</p>
        </div>
        {demographics.length > 0 && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Verified Insights
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Age breakdown */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300">Age Distribution</span>
          <div className="space-y-1.5">
            {ageDist.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">{item.range}</span>
                  <span className="text-purple-300 font-bold">{item.pct}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gender breakdown */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <span className="text-xs font-bold text-slate-300">Gender Split</span>
          <div className="flex rounded-full h-3 bg-slate-950 overflow-hidden border border-white/5">
            {genderDist.map((g, idx) => (
              <div key={idx} className={`h-full ${g.color}`} style={{ width: g.pct }} title={`${g.label}: ${g.pct}`} />
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-400">
            <span>Female {femalePct}%</span>
            <span>Male {malePct}%</span>
            {otherPct > 0 && <span>Other {otherPct}%</span>}
          </div>
        </div>

        {/* Top Locations if present */}
        {topCountries.length > 0 ? (
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-400" />
              Top Audience Locations
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {topCountries.map((c, i) => (
                <div key={i} className="flex justify-between items-center p-1.5 rounded bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400 truncate">{c.label || c.key}</span>
                  <span className="text-purple-300 font-bold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Peak Active Hours:
            </span>
            <span className="font-bold text-purple-300">7:00 PM - 10:00 PM EST</span>
          </div>
        )}
      </div>
    </div>
  );
}
