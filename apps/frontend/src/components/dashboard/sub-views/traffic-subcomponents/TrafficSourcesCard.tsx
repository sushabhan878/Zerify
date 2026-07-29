'use client';

import React from 'react';
import { Globe, Smartphone, Monitor, ShieldCheck } from 'lucide-react';

export default function TrafficSourcesCard() {
  const sources = [
    { name: 'Instagram Bio & Story Links', share: '42%', color: 'bg-pink-500' },
    { name: 'YouTube Video Placements', share: '34%', color: 'bg-purple-500' },
    { name: 'TikTok Creator Links', share: '14%', color: 'bg-indigo-500' },
    { name: 'Direct & QR Code Referrals', share: '6%', color: 'bg-emerald-500' },
    { name: 'Google & Search Engine', share: '4%', color: 'bg-cyan-500' },
  ];

  const devices = [
    { name: 'iOS App / Safari', pct: '58%', icon: Smartphone },
    { name: 'Android / Chrome Mobile', pct: '32%', icon: Smartphone },
    { name: 'Desktop Web', pct: '10%', icon: Monitor },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <span>Acquisition & Traffic Sources</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Attribution breakdown across UTM links and referral origins</p>
      </div>

      {/* Bar breakdown */}
      <div className="space-y-3">
        {sources.map((src, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">{src.name}</span>
              <span className="text-purple-300 font-bold">{src.share}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
              <div className={`h-full rounded-full ${src.color}`} style={{ width: src.share }} />
            </div>
          </div>
        ))}
      </div>

      {/* Device & OS breakdown */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <span className="text-xs font-bold text-slate-300">Device & Platform Share</span>
        <div className="grid grid-cols-3 gap-2">
          {devices.map((d, idx) => {
            const Icon = d.icon;
            return (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-center space-y-1">
                <Icon className="w-4 h-4 text-purple-400 mx-auto" />
                <div className="text-sm font-black text-white">{d.pct}</div>
                <div className="text-[10px] text-slate-400 truncate">{d.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
