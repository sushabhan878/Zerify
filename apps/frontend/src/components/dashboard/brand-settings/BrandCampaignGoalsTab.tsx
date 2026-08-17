'use client';

import React, { useState } from 'react';
import { Target, Share2, Users, Check, Loader2, Sparkles, Instagram, Youtube, Linkedin, Twitter, Facebook } from 'lucide-react';

interface BrandCampaignGoalsTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

const PRIMARY_GOALS_OPTIONS = [
  'Brand Awareness',
  'Lead Generation',
  'Sales & Conversions',
  'User Acquisition',
  'Content Creation',
  'Product Launch',
  'Community Building',
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
const AUDIENCE_LOCATIONS = ['India', 'USA', 'Canada', 'UK', 'Australia', 'Germany', 'Global'];
const INTEREST_TAGS = ['Fashion & Apparel', 'Tech & Gadgets', 'Fitness & Health', 'Beauty & Skincare', 'Gaming', 'Travel', 'Food & Dining', 'Finance'];

export default function BrandCampaignGoalsTab({ initialData, onSaveSuccess }: BrandCampaignGoalsTabProps) {
  const [goals, setGoals] = useState<string[]>(initialData?.primaryGoals || ['Brand Awareness', 'Sales & Conversions']);
  const [platforms, setPlatforms] = useState<string[]>(initialData?.targetPlatforms || ['Instagram', 'YouTube']);
  
  const audience = initialData?.targetAudience || {};
  const [ageRanges, setAgeRanges] = useState<string[]>(audience.ageRanges || ['18-24', '25-34']);
  const [targetGender, setTargetGender] = useState<string>(audience.gender || 'All');
  const [locations, setLocations] = useState<string[]>(audience.locations || ['India', 'USA']);
  const [interests, setInterests] = useState<string[]>(audience.interests || ['Fashion & Apparel', 'Tech & Gadgets']);

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
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
        throw new Error(msg || 'Failed to update campaign goals.');
      }

      setStatusMsg({ type: 'success', text: 'Campaign goals and targeted audience saved successfully!' });
      onSaveSuccess?.();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving campaign goals.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">


      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs font-medium ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* 1. Primary Goals */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Primary Campaign Objectives</label>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_GOALS_OPTIONS.map((goal) => {
            const isSelected = goals.includes(goal);
            return (
              <button
                type="button"
                key={goal}
                onClick={() => toggleArrayItem(goals, goal, setGoals)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-200 shadow-sm'
                    : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                <span>{goal}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Target Platforms */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Target Marketing Platforms</label>
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
                    ? 'bg-slate-950 border-indigo-500/60 text-white shadow-md'
                    : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Targeted Audience Demographics */}
      <div className="space-y-4 pt-3 border-t border-white/10">
        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Target Audience Demographics</span>
        </h4>

        {/* Age Groups */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Age Groups</label>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGE_OPTIONS.map((age) => {
              const isSelected = ageRanges.includes(age);
              return (
                <button
                  type="button"
                  key={age}
                  onClick={() => toggleArrayItem(ageRanges, age, setAgeRanges)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950/50 border-white/10 text-slate-400'
                  }`}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gender Preference */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setTargetGender(g)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  targetGender === g ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950/50 border-white/10 text-slate-400'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Target Locations */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Audience Locations</label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_LOCATIONS.map((loc) => {
              const isSelected = locations.includes(loc);
              return (
                <button
                  type="button"
                  key={loc}
                  onClick={() => toggleArrayItem(locations, loc, setLocations)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950/50 border-white/10 text-slate-400'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Interests */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Interests & Niches</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const isSelected = interests.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleArrayItem(interests, tag, setInterests)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected ? 'bg-indigo-600/30 border-indigo-500 text-white' : 'bg-slate-950/50 border-white/10 text-slate-400'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
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
