'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check, Plus, Sparkles, MapPin, Globe, ChevronDown, Users, BadgeCheck } from 'lucide-react';

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
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider">
            Target Social Platforms <span className="text-pink-400">*</span>
          </label>
          <span className="text-[11px] font-semibold text-purple-300/80 light:text-purple-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-300 light:text-purple-600" />
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
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${isSelected
                    ? 'bg-purple-500/20 border border-purple-400/60 text-purple-100 shadow-[0_0_10px_rgba(192,132,252,0.25)] light:bg-purple-100 light:border-purple-300 light:text-purple-800 light:shadow-sm'
                    : 'bg-slate-900/90 border border-white/10 text-slate-400 hover:border-purple-400/30 hover:text-purple-200 hover:bg-slate-800/80 light:bg-white light:border-slate-300 light:text-slate-700 light:hover:bg-purple-50 light:hover:text-purple-700'
                  }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-700 stroke-[2.5]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500 light:text-slate-400" />
                )}
                <span>{plat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Creator Follower & Engagement Criteria */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start pt-1">
        {/* Minimum Followers Custom Dropdown */}
        <div className="relative sm:col-span-5 md:col-span-4" ref={followersDropdownRef}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider">
              Minimum Followers
            </label>
            <span className="text-[11px] text-slate-400 light:text-slate-500 font-medium">
              {selectedFollowerTier ? selectedFollowerTier.label.split(' ')[0] : 'Any'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsFollowersOpen((prev) => !prev)}
            className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 hover:border-purple-400/40 rounded-xl text-xs text-white light:bg-white light:border-slate-300 light:text-slate-900 flex items-center justify-between focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          >
            <span className={selectedFollowerTier ? 'text-white light:text-slate-900 font-medium' : 'text-slate-500 light:text-slate-400'}>
              {selectedFollowerTier ? selectedFollowerTier.label : 'Select Minimum Followers...'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isFollowersOpen ? 'rotate-180 text-purple-300 light:text-purple-600' : ''
                }`}
            />
          </button>
          <p className="text-[10px] text-slate-400/90 light:text-slate-500 mt-2">
            Filter creator tiers by audience size (Nano, Micro, Mid-Tier, or Macro).
          </p>

          <AnimatePresence>
            {isFollowersOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 left-0 right-0 min-w-[260px] mt-1.5 bg-slate-900 border border-white/10 light:bg-white light:border-slate-200 light:shadow-2xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <button
                  type="button"
                  onClick={() => {
                    handleSocialChange('minFollowers', undefined);
                    setIsFollowersOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${!socialReq.minFollowers
                      ? 'bg-purple-500/20 text-purple-200 font-bold light:bg-purple-50 light:text-purple-700'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900'
                    }`}
                >
                  <span>Any / No Minimum Requirement</span>
                  {!socialReq.minFollowers && <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-700 stroke-[2.5]" />}
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
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${isSelected
                          ? 'bg-purple-500/20 text-purple-200 font-bold light:bg-purple-50 light:text-purple-700'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900'
                        }`}
                    >
                      <span>{tier.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-700 stroke-[2.5]" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimum Engagement Rate Slider (Extended Width) */}
        <div className="space-y-1.5 sm:col-span-7 md:col-span-8">
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider">
              Min Engagement Rate
            </label>
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 light:bg-purple-50 light:border-purple-200 light:text-purple-700 text-[11px] font-black">
              {Number(socialReq.minEngagementRate || 0) > 0
                ? `${Number(socialReq.minEngagementRate).toFixed(1)}%`
                : 'Any (0%)'}
            </span>
          </div>

          <div className="relative pt-1.5 pb-0.5">
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={Number(socialReq.minEngagementRate || 0)}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleSocialChange('minEngagementRate', val > 0 ? val : undefined);
              }}
              className="w-full h-2 bg-slate-800 light:bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(Number(socialReq.minEngagementRate || 0) / 5) * 100}%, #1e293b ${(Number(socialReq.minEngagementRate || 0) / 5) * 100}%, #1e293b 100%)`,
              }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 light:text-slate-500 font-semibold px-0.5 select-none">
            <span className="hover:text-purple-300 light:hover:text-purple-700 transition-colors cursor-pointer" onClick={() => handleSocialChange('minEngagementRate', undefined)}>Any (0%)</span>
            <span className="hover:text-purple-300 light:hover:text-purple-700 transition-colors cursor-pointer" onClick={() => handleSocialChange('minEngagementRate', 1.5)}>1.5%</span>
            <span className="hover:text-purple-300 light:hover:text-purple-700 transition-colors cursor-pointer" onClick={() => handleSocialChange('minEngagementRate', 2.5)}>2.5% (Avg)</span>
            <span className="hover:text-purple-300 light:hover:text-purple-700 transition-colors cursor-pointer" onClick={() => handleSocialChange('minEngagementRate', 3.5)}>3.5%</span>
            <span className="hover:text-purple-300 light:hover:text-purple-700 transition-colors cursor-pointer" onClick={() => handleSocialChange('minEngagementRate', 5.0)}>5.0% (Max)</span>
          </div>
          <p className="text-[10px] text-slate-400/90 light:text-slate-500 pt-0.5">
            Industry standard: 1.5%–3.5% healthy average; 5.0% represents top-tier creator engagement.
          </p>
        </div>
      </div>

      {/* Target Creator Locations - Multiple Choice Tag Cloud */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider">
            Target Creator Country / Region
          </label>
          <span className="text-[11px] font-semibold text-purple-300/80 light:text-purple-700 flex items-center gap-1">
            <Globe className="w-3 h-3 text-purple-300 light:text-purple-600" />
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${isSelected
                    ? 'bg-purple-500/20 border border-purple-400/60 text-purple-100 shadow-[0_0_10px_rgba(192,132,252,0.25)] light:bg-purple-100 light:border-purple-300 light:text-purple-800 light:shadow-sm'
                    : 'bg-slate-900/90 border border-white/10 text-slate-400 hover:border-purple-400/30 hover:text-purple-200 hover:bg-slate-800/80 light:bg-white light:border-slate-300 light:text-slate-700 light:hover:bg-purple-50 light:hover:text-purple-700'
                  }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-700 stroke-[2.5]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500 light:text-slate-400" />
                )}
                <span>{country}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Location Input */}
        <div className="pt-1 flex items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <MapPin className="w-3.5 h-3.5 text-purple-300/60 light:text-purple-600 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Add other country/city (press Enter)..."
              value={customCountryInput}
              onChange={(e) => setCustomCountryInput(e.target.value)}
              onKeyDown={handleAddCustomCountry}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-purple-400/20 rounded-full text-xs text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Verified Creators Only - Bottom Feature Banner */}
      <div className="pt-5 border-t border-purple-400/10 light:border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/25 text-purple-300 light:bg-purple-50 light:border-purple-200 light:text-purple-700 flex items-center justify-center flex-shrink-0">
            <BadgeCheck className="w-5 h-5 text-purple-300 light:text-purple-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white light:text-slate-900 block">Verified Creators Only</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  socialReq.verifiedOnly
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/30 light:bg-purple-50 light:text-purple-700 light:border-purple-200'
                    : 'bg-slate-800/60 text-slate-400 border-white/10 light:bg-slate-100 light:text-slate-600 light:border-slate-200'
                }`}
              >
                {socialReq.verifiedOnly ? 'Blue Badge Required' : 'Open to All Creators'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 light:text-slate-500 block mt-0.5">
              Require blue badge authentication. Restricts campaign pitch proposals exclusively to verified platform creators.
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={socialReq.verifiedOnly || false}
            onChange={(e) => handleSocialChange('verifiedOnly', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-800 light:bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500 cursor-pointer"></div>
        </label>
      </div>
    </div>
  );
}
