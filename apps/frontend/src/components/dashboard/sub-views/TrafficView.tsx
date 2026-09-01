'use client';

import React from 'react';
import { TrendingUp, Globe, Eye, ArrowUpRight, Smartphone, Monitor } from 'lucide-react';
import RealTimeTrafficCard from './traffic-subcomponents/RealTimeTrafficCard';
import TrafficSourcesCard from './traffic-subcomponents/TrafficSourcesCard';
import TrafficFunnelCard from './traffic-subcomponents/TrafficFunnelCard';

export default function TrafficView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span>Traffic & Conversion Analytics</span>
        </h2>
        <p className="text-xs text-slate-400">Track real-time visitor origins, link CTRs, and conversion funnel drop-off</p>
      </div>

      {/* 1. Real-Time Analytics Bar */}
      <RealTimeTrafficCard />

      {/* 2. Acquisition Sources & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSourcesCard />
        <TrafficFunnelCard />
      </div>

      {/* 3. Link Analytics Overview */}
      <div className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white">Campaign & Bio Link Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Instagram Bio Link</span>
            <div className="text-xl font-black text-white">6,420 Clicks</div>
            <span className="text-[10px] font-bold text-emerald-400">5.8% CTR • 4.8K Unique</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">YouTube Video Description</span>
            <div className="text-xl font-black text-white">2,850 Clicks</div>
            <span className="text-[10px] font-bold text-emerald-400">8.4% CTR • 2.1K Unique</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Affiliate Tracking Links</span>
            <div className="text-xl font-black text-white">1,180 Clicks</div>
            <span className="text-[10px] font-bold text-purple-400">12.2% Conv • $4.2K Sales</span>
          </div>
        </div>
      </div>
    </div>
  );
}
