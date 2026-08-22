'use client';

import React from 'react';
import { ShieldCheck, Users, MapPin, Globe, Sparkles, Check } from 'lucide-react';

const PLATFORMS = ['INSTAGRAM', 'YOUTUBE', 'TIKTOK', 'LINKEDIN', 'TWITTER'];

const COUNTRIES = ['United States', 'India', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Global / Any'];

interface RequirementsStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function RequirementsStep({ formData, onChange }: RequirementsStepProps) {
  const req = formData.requirements || {};
  const socialReq = req.social || {};
  const infReq = req.influencer || {};

  const handleSocialChange = (field: string, val: any) => {
    onChange('requirements', {
      ...req,
      social: { ...socialReq, [field]: val },
    });
  };

  const handleInfChange = (field: string, val: any) => {
    onChange('requirements', {
      ...req,
      influencer: { ...infReq, [field]: val },
    });
  };

  const togglePlatform = (p: string) => {
    const current = formData.platforms || [];
    const updated = current.includes(p) ? current.filter((x: string) => x !== p) : [...current, p];
    onChange('platforms', updated);
  };

  return (
    <div className="space-y-6">
      {/* Target Platforms */}
      <div>
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
          Target Social Platforms <span className="text-pink-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2.5">
          {PLATFORMS.map((plat) => {
            const isSelected = (formData.platforms || []).includes(plat);
            return (
              <button
                type="button"
                key={plat}
                onClick={() => togglePlatform(plat)}
                className={`px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-purple-500/25 border-purple-300/60 text-purple-100 shadow-[0_0_14px_rgba(192,132,252,0.35)] ring-1 ring-purple-300/40 scale-105'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-purple-300/30 hover:text-purple-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-purple-200 stroke-[3]" />}
                <span>{plat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Requirements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md">
        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Minimum Followers
          </label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={socialReq.minFollowers || ''}
            onChange={(e) => handleSocialChange('minFollowers', Number(e.target.value) || undefined)}
            className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Maximum Followers (Optional)
          </label>
          <input
            type="number"
            placeholder="e.g. 500000"
            value={socialReq.maxFollowers || ''}
            onChange={(e) => handleSocialChange('maxFollowers', Number(e.target.value) || undefined)}
            className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Minimum Engagement Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 2.5"
            value={socialReq.minEngagementRate || ''}
            onChange={(e) => handleSocialChange('minEngagementRate', Number(e.target.value) || undefined)}
            className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={socialReq.verifiedOnly || false}
              onChange={(e) => handleSocialChange('verifiedOnly', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
          <div>
            <span className="text-xs font-bold text-white block">Verified Creators Only</span>
            <span className="text-[10px] text-purple-300/70 block">Require blue badge authentication</span>
          </div>
        </div>
      </div>

      {/* Creator Location Preference */}
      <div>
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
          Target Creator Country / Region
        </label>
        <select
          value={(infReq.countries && infReq.countries[0]) || ''}
          onChange={(e) => handleInfChange('countries', e.target.value ? [e.target.value] : [])}
          className="w-full px-4 py-3 bg-slate-900/90 border border-purple-400/20 rounded-xl text-sm text-white focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
        >

          <option value="">Any Country / Global</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Strict vs Flexible Eligibility */}
      <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-extrabold text-white">Eligibility Mode</span>
          </div>
          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-300/40">
            {req.strictEligibility ? 'Strict Filter' : 'Flexible Match (Recommended)'}
          </span>
        </div>
        <p className="text-[11px] text-slate-300">
          {req.strictEligibility
            ? 'Only creators who meet 100% of minimum followers and platform criteria can submit proposals.'
            : 'Creators can apply even if they fall slightly outside preferred criteria. Zerify calculates a transparent Match Score and highlights strengths.'}
        </p>
        <button
          type="button"
          onClick={() => onChange('requirements', { ...req, strictEligibility: !req.strictEligibility })}
          className="text-xs font-bold text-purple-300 hover:text-purple-200 underline transition-colors"
        >
          Switch to {req.strictEligibility ? 'Flexible Match' : 'Strict Eligibility'}
        </button>
      </div>
    </div>
  );
}
