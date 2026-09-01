'use client';

import React from 'react';
import { Globe, Users, Clock } from 'lucide-react';

export default function AudienceDemographicsCard() {
  const ageDist = [
    { range: '18-24', pct: '38%', color: 'bg-purple-500' },
    { range: '25-34', pct: '44%', color: 'bg-pink-500' },
    { range: '35-44', pct: '12%', color: 'bg-indigo-500' },
    { range: '45+', pct: '6%', color: 'bg-cyan-500' },
  ];

  const genderDist = [
    { label: 'Female', pct: '62%', color: 'bg-pink-500' },
    { label: 'Male', pct: '34%', color: 'bg-purple-500' },
    { label: 'Other', pct: '4%', color: 'bg-indigo-500' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Audience Demographics</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Audience age, gender distribution, and peak active times</p>
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
            <span>Female 62%</span>
            <span>Male 34%</span>
            <span>Other 4%</span>
          </div>
        </div>

        {/* Active hours */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Peak Active Hours:
          </span>
          <span className="font-bold text-purple-300">7:00 PM - 10:00 PM EST</span>
        </div>
      </div>
    </div>
  );
}
