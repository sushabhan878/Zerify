'use client';

import React, { useState } from 'react';
import { Target, Share2, Users, Check, Loader2, Sparkles, Instagram, Youtube, Linkedin, Twitter, Facebook, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface BrandCampaignGoalsTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

export const PRIMARY_GOALS_OPTIONS = [
  'Brand Awareness',
  'Lead Generation',
  'Sales & Conversions',
  'User Acquisition',
  'Content Creation',
  'Product Launch',
  'Community Building',
  'App Downloads & Installs',
  'Affiliate Marketing',
  'Event Promotion',
  'SEO & Backlinks',
  'Influencer Seeding & Gifting',
];

const PLATFORMS_OPTIONS = [
  { id: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  { id: 'YouTube', label: 'YouTube', icon: Youtube, color: 'text-rose-500' },
  { id: 'TikTok', label: 'TikTok', icon: Share2, color: 'text-cyan-400' },
  { id: 'LinkedIn', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400' },
  { id: 'Twitter', label: 'Twitter / X', icon: Twitter, color: 'text-sky-400' },
  { id: 'Facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
];

const AGE_RANGE_OPTIONS = ['18-24', '25-34', '35-44', '45-54', '55+'];
const GENDER_OPTIONS = ['All', 'Female', 'Male', 'Non-Binary'];
export const AUDIENCE_LOCATIONS = ['India', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'United Arab Emirates', 'Singapore', 'Global / Worldwide'];
export const INTEREST_TAGS = [
  'Fashion & Apparel',
  'Tech & Gadgets',
  'Fitness & Health',
  'Beauty & Skincare',
  'Gaming & Esports',
  'Travel & Lifestyle',
  'Food & Gourmet Dining',
  'Finance & Investing',
  'Artificial Intelligence & SaaS',
  'Crypto & Web3',
  'E-Commerce & Shopping',
  'Luxury & Designer Goods',
  'Jewelry & Accessories',
  'Footwear & Sneakers',
  'Haircare & Styling',
  'Wellness & Yoga',
  'Supplements & Nutrition',
  'Parenting & Family',
  'Pets & Animal Care',
  'Home Decor & Interiors',
  'Real Estate',
  'Automotive & EV',
  'Outdoor & Camping',
  'Photography & Videography',
  'Music & Podcasts',
  'Movies & Entertainment',
  'Education & EdTech',
  'Books & Literature',
  'Business & Entrepreneurship',
  'Career & Productivity',
  'Clean Energy & Sustainability',
  'Art & Creative Design',
  'DIY & Crafting',
  'Events & Nightlife',
  'Sports & Athletics',
];

export default function BrandCampaignGoalsTab({ initialData, onSaveSuccess }: BrandCampaignGoalsTabProps) {
  const { toastSuccess, toastError } = useToast();
  const [goals, setGoals] = useState<string[]>(initialData?.primaryGoals || ['Brand Awareness', 'Sales & Conversions']);
  const [platforms, setPlatforms] = useState<string[]>(initialData?.targetPlatforms || ['Instagram', 'YouTube']);
  
  const audience = initialData?.targetAudience || {};
  const [ageRanges, setAgeRanges] = useState<string[]>(audience.ageRanges || ['18-24', '25-34']);
  const [targetGender, setTargetGender] = useState<string>(audience.gender || 'All');
  const [locations, setLocations] = useState<string[]>(audience.locations || ['India', 'USA']);
  const [interests, setInterests] = useState<string[]>(audience.interests || ['Fashion & Apparel', 'Tech & Gadgets']);
  const [customNicheInput, setCustomNicheInput] = useState('');
  const [extraTags, setExtraTags] = useState<string[]>([]);

  // Dynamically include any custom selected interest tags not in preset list
  const allInterestTags = Array.from(new Set([...INTEREST_TAGS, ...extraTags, ...interests]));

  const handleAddCustomNiche = () => {
    const trimmed = customNicheInput.trim();
    if (!trimmed) return;
    if (!interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
    }
    if (!extraTags.includes(trimmed)) {
      setExtraTags((prev) => [...prev, trimmed]);
    }
    setCustomNicheInput('');
  };

  const [customGoalInput, setCustomGoalInput] = useState('');
  const [extraGoals, setExtraGoals] = useState<string[]>([]);
  const allPrimaryGoals = Array.from(new Set([...PRIMARY_GOALS_OPTIONS, ...extraGoals, ...goals]));

  const handleAddCustomGoal = () => {
    const trimmed = customGoalInput.trim();
    if (!trimmed) return;
    if (!goals.includes(trimmed)) setGoals((prev) => [...prev, trimmed]);
    if (!extraGoals.includes(trimmed)) setExtraGoals((prev) => [...prev, trimmed]);
    setCustomGoalInput('');
  };

  const [customLocationInput, setCustomLocationInput] = useState('');
  const [extraLocations, setExtraLocations] = useState<string[]>([]);
  const allAudienceLocations = Array.from(new Set([...AUDIENCE_LOCATIONS, ...extraLocations, ...locations]));

  const handleAddCustomLocation = () => {
    const trimmed = customLocationInput.trim();
    if (!trimmed) return;
    if (!locations.includes(trimmed)) setLocations((prev) => [...prev, trimmed]);
    if (!extraLocations.includes(trimmed)) setExtraLocations((prev) => [...prev, trimmed]);
    setCustomLocationInput('');
  };

  // Sync state whenever initialData changes from backend API
  React.useEffect(() => {
    if (initialData) {
      if (initialData.primaryGoals && initialData.primaryGoals.length > 0) setGoals(initialData.primaryGoals);
      if (initialData.targetPlatforms && initialData.targetPlatforms.length > 0) setPlatforms(initialData.targetPlatforms);
      if (initialData.targetAudience) {
        const aud = initialData.targetAudience;
        if (aud.ageRanges && aud.ageRanges.length > 0) setAgeRanges(aud.ageRanges);
        if (aud.gender) setTargetGender(aud.gender);
        if (aud.locations && aud.locations.length > 0) setLocations(aud.locations);
        if (aud.interests && aud.interests.length > 0) setInterests(aud.interests);
      }
    }
  }, [initialData]);

  const [saving, setSaving] = useState(false);

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/brand/campaign-goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          primaryGoals: goals,
          targetPlatforms: platforms,
          targetAudience: {
            ageRanges,
            gender: targetGender,
            locations,
            interests,
          },
        }),
      });

      const updatedProfile = await res.json();
      try {
        localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event('zerify_brand_profile_update'));
      } catch (e) {}

      toastSuccess('Campaign goals and targeted audience saved successfully!');
      onSaveSuccess?.();
    } catch (err: any) {
      toastError(err.message || 'Error saving campaign goals.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">

      {/* 1. Primary Goals */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-300">Primary Campaign Objectives</label>
          <span className="text-[11px] text-purple-400 font-semibold">{goals.length} Selected</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {allPrimaryGoals.map((goal) => {
            const isSelected = goals.includes(goal);
            return (
              <button
                type="button"
                key={goal}
                onClick={() => toggleArrayItem(goals, goal, setGoals)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-500/60 text-purple-200 shadow-sm scale-[1.02]'
                    : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                <span>{goal}</span>
              </button>
            );
          })}
        </div>

        {/* Add Custom Goal Input */}
        <div className="flex items-center gap-2 max-w-md pt-1">
          <input
            type="text"
            value={customGoalInput}
            onChange={(e) => setCustomGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomGoal();
              }
            }}
            placeholder="Add custom campaign objective..."
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={handleAddCustomGoal}
            className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* 2. Target Platforms */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-300">Target Marketing Platforms</label>
          <span className="text-[11px] text-purple-400 font-semibold">{platforms.length} Selected</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PLATFORMS_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = platforms.includes(item.id);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => toggleArrayItem(platforms, item.id, setPlatforms)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-purple-500/60 text-white shadow-md scale-[1.02]'
                    : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-purple-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Targeted Audience Demographics */}
      <div className="space-y-4 pt-3 border-t border-white/10">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Target Audience Demographics</span>
        </h4>

        {/* Age Groups */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">Target Age Groups</label>
            <span className="text-[11px] text-purple-400 font-semibold">{ageRanges.length} Selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGE_OPTIONS.map((age) => {
              const isSelected = ageRanges.includes(age);
              return (
                <button
                  type="button"
                  key={age}
                  onClick={() => toggleArrayItem(ageRanges, age, setAgeRanges)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500/60 text-purple-200 shadow-sm scale-[1.02]'
                      : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                  <span>{age}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gender Preference */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((g) => {
              const isSelected = targetGender === g;
              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => setTargetGender(g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500/60 text-purple-200 shadow-sm scale-[1.02]'
                      : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                  <span>{g}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Locations */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">Target Audience Locations</label>
            <span className="text-[11px] text-purple-400 font-semibold">{locations.length} Selected</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {allAudienceLocations.map((loc) => {
              const isSelected = locations.includes(loc);
              return (
                <button
                  type="button"
                  key={loc}
                  onClick={() => toggleArrayItem(locations, loc, setLocations)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500/60 text-purple-200 shadow-sm scale-[1.02]'
                      : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                  <span>{loc}</span>
                </button>
              );
            })}
          </div>

          {/* Add Custom Location Input */}
          <div className="flex items-center gap-2 max-w-md pt-1">
            <input
              type="text"
              value={customLocationInput}
              onChange={(e) => setCustomLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomLocation();
                }
              }}
              placeholder="Add custom target location (e.g. Brazil)..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleAddCustomLocation}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Target Interests & Niches */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">Target Interests & Niches</label>
            <span className="text-[11px] text-purple-400 font-semibold">{interests.length} Selected</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {allInterestTags.map((tag) => {
              const isSelected = interests.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleArrayItem(interests, tag, setInterests)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500/60 text-purple-200 shadow-sm scale-[1.02]'
                      : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>

          {/* Add Custom Niche Tag Input */}
          <div className="flex items-center gap-2 max-w-md pt-1">
            <input
              type="text"
              value={customNicheInput}
              onChange={(e) => setCustomNicheInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomNiche();
                }
              }}
              placeholder="Add custom niche tag (e.g. Vintage Watches)..."
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleAddCustomNiche}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tag</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-3 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>Save Campaign Goals</span>
        </button>
      </div>
    </form>
  );
}
