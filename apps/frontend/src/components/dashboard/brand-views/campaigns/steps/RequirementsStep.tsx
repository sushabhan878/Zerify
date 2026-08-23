'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check, Plus, Sparkles, MapPin, Globe, ChevronDown, Users } from 'lucide-react';

const PLATFORM_OPTIONS = [
  { id: 'INSTAGRAM', label: 'Instagram' },
  { id: 'YOUTUBE', label: 'YouTube' },
  { id: 'TIKTOK', label: 'TikTok' },
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'TWITTER', label: 'X (Twitter)' },
  { id: 'TWITCH', label: 'Twitch' },
  { id: 'PINTEREST', label: 'Pinterest' },
  { id: 'THREADS', label: 'Threads' },
];

const FOLLOWER_TIERS = [
  { value: 1000, label: '1,000+ (Nano Creators)' },
  { value: 5000, label: '5,000+ (Nano/Micro)' },
  { value: 10000, label: '10,000+ (Micro Creators)' },
  { value: 25000, label: '25,000+ (Rising Creators)' },
  { value: 50000, label: '50,000+ (Mid-Tier Creators)' },
  { value: 100000, label: '100,000+ (Established Mid-Tier)' },
  { value: 250000, label: '250,000+ (Macro Creators)' },
  { value: 500000, label: '500,000+ (Top Macro)' },
  { value: 1000000, label: '1,000,000+ (Mega / Celebrity)' },
];

const SUGGESTED_COUNTRIES = [
  'Global / Anywhere',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'India',
  'Germany',
  'France',
  'Japan',
  'Brazil',
  'United Arab Emirates',
  'Singapore',
  'Netherlands',
  'Spain',
  'Italy',
  'Mexico',
];

interface RequirementsStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function RequirementsStep({ formData, onChange }: RequirementsStepProps) {
  const req = formData.requirements || {};
  const socialReq = req.social || {};
  const infReq = req.influencer || {};
  const [customCountryInput, setCustomCountryInput] = useState('');
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const followersDropdownRef = useRef<HTMLDivElement>(null);

  // Close followers dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (followersDropdownRef.current && !followersDropdownRef.current.contains(event.target as Node)) {
        setIsFollowersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedPlatforms: string[] = Array.isArray(formData.platforms) ? formData.platforms : [];
  const selectedCountries: string[] = infReq.countries && infReq.countries.length > 0
    ? infReq.countries
    : [];

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
    let updated: string[];
    if (selectedPlatforms.includes(p)) {
      updated = selectedPlatforms.filter((x) => x !== p);
    } else {
      updated = [...selectedPlatforms, p];
    }
    onChange('platforms', updated);
  };

  const toggleCountry = (country: string) => {
    let updated: string[];
    if (country === 'Global / Anywhere') {
      if (selectedCountries.includes('Global / Anywhere')) {
        updated = [];
      } else {
        updated = ['Global / Anywhere'];
      }
    } else {
      const withoutGlobal = selectedCountries.filter((c) => c !== 'Global / Anywhere');
      if (withoutGlobal.includes(country)) {
        updated = withoutGlobal.filter((c) => c !== country);
      } else {
        updated = [...withoutGlobal, country];
      }
    }
    handleInfChange('countries', updated);
  };

  const handleAddCustomCountry = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customCountryInput.trim()) {
      e.preventDefault();
      const newCountry = customCountryInput.trim();
      const withoutGlobal = selectedCountries.filter((c) => c !== 'Global / Anywhere');
      if (!withoutGlobal.includes(newCountry)) {
        handleInfChange('countries', [...withoutGlobal, newCountry]);
      }
      setCustomCountryInput('');
    }
  };

  const selectedFollowerTier = FOLLOWER_TIERS.find((t) => t.value === socialReq.minFollowers);

  return (
    <div className="space-y-6">
      {/* Target Platforms */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
            Target Social Platforms <span className="text-pink-400">*</span>
          </label>
          <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-300" />
            <span>Select multiple</span>
          </span>
        </div>

        {/* Platforms Cloud */}
        <div className="flex flex-wrap gap-x-3.5 gap-y-3">
          {PLATFORM_OPTIONS.map((plat) => {
            const isSelected = selectedPlatforms.includes(plat.id);

            return (
              <button
                type="button"
                key={plat.id}
                onClick={() => togglePlatform(plat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-500/20 border border-purple-400/60 text-purple-100 shadow-[0_0_10px_rgba(192,132,252,0.25)]'
                    : 'bg-slate-900/90 border border-white/10 text-slate-400 hover:border-purple-400/30 hover:text-purple-200 hover:bg-slate-800/80'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-purple-300 stroke-[2.5]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{plat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Creator Follower & Engagement Criteria */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-1">
        {/* Minimum Followers Custom Dropdown */}
        <div className="relative" ref={followersDropdownRef}>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Minimum Followers
          </label>
          <button
            type="button"
            onClick={() => setIsFollowersOpen((prev) => !prev)}
            className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white flex items-center justify-between focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          >
            <span className={selectedFollowerTier ? 'text-white font-medium' : 'text-slate-500'}>
              {selectedFollowerTier ? selectedFollowerTier.label : 'Select Minimum Followers...'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isFollowersOpen ? 'rotate-180 text-purple-300' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isFollowersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleSocialChange('minFollowers', undefined);
                    setIsFollowersOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between ${
                    !socialReq.minFollowers
                      ? 'bg-purple-500/20 text-purple-200 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>Any / No Minimum Requirement</span>
                  {!socialReq.minFollowers && <Check className="w-3.5 h-3.5 text-purple-300 stroke-[2.5]" />}
                </button>
                {FOLLOWER_TIERS.map((tier) => {
                  const isSelected = socialReq.minFollowers === tier.value;
                  return (
                    <button
                      type="button"
                      key={tier.value}
                      onClick={() => {
                        handleSocialChange('minFollowers', tier.value);
                        setIsFollowersOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-500/20 text-purple-200 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{tier.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Minimum Engagement Rate (%)
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 2.5"
            value={socialReq.minEngagementRate || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, '');
              handleSocialChange('minEngagementRate', val ? Number(val) : undefined);
            }}
            className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 pb-1">
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
            <span className="text-[10px] text-slate-400 block">Require blue badge authentication</span>
          </div>
        </div>
      </div>

      {/* Target Creator Locations - Multiple Choice Tag Cloud */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
            Target Creator Country / Region
          </label>
          <span className="text-[11px] font-semibold text-purple-300/80 flex items-center gap-1">
            <Globe className="w-3 h-3 text-purple-300" />
            <span>Multiple selection</span>
          </span>
        </div>

        {/* Location Tags Cloud */}
        <div className="flex flex-wrap gap-x-3 gap-y-2.5">
          {SUGGESTED_COUNTRIES.map((country) => {
            const isSelected = selectedCountries.includes(country);

            return (
              <button
                type="button"
                key={country}
                onClick={() => toggleCountry(country)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-500/20 border border-purple-400/60 text-purple-100 shadow-[0_0_10px_rgba(192,132,252,0.25)]'
                    : 'bg-slate-900/90 border border-white/10 text-slate-400 hover:border-purple-400/30 hover:text-purple-200 hover:bg-slate-800/80'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-purple-300 stroke-[2.5]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{country}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Location Input */}
        <div className="pt-1 flex items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <MapPin className="w-3.5 h-3.5 text-purple-300/60 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Add other country/city (press Enter)..."
              value={customCountryInput}
              onChange={(e) => setCustomCountryInput(e.target.value)}
              onKeyDown={handleAddCustomCountry}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-purple-400/20 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Strict vs Flexible Eligibility Mode - Toggle Switch */}
      <div className="pt-6 border-t border-purple-400/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white block">Strict Eligibility Filter</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  req.strictEligibility
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/30'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
                }`}
              >
                {req.strictEligibility ? 'Strict Filter Active' : 'Flexible Match (Recommended)'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {req.strictEligibility
                ? 'Only creators who meet 100% of minimum followers, platforms, and locations can submit pitches'
                : 'Creators slightly outside criteria can still apply. Zerify AI calculates a transparent Match Score'}
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={req.strictEligibility || false}
            onChange={(e) => onChange('requirements', { ...req, strictEligibility: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
        </label>
      </div>
    </div>
  );
}
