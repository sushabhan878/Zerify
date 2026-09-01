'use client';

import React, { useState } from 'react';
import { Users, CheckCircle, Check, Loader2, Sparkles, ShieldCheck, DollarSign, Calendar, Sliders } from 'lucide-react';

import CustomSelect, { SelectOption } from '../settings-tabs/subcomponents/CustomSelect';
import { useToast } from '@/components/ui/Toast';

interface BrandTargetInfluencersTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

const CREATOR_TIERS = [
  { id: 'Nano', label: 'Nano', range: '1K – 10K followers' },
  { id: 'Micro', label: 'Micro', range: '10K – 50K followers' },
  { id: 'Mid', label: 'Mid', range: '50K – 250K followers' },
  { id: 'Macro', label: 'Macro', range: '250K – 1M followers' },
  { id: 'Mega', label: 'Mega', range: '1M+ followers' },
];

const CREATOR_LOCATIONS = ['India', 'USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Global'];
const GENDER_PREFERENCES = ['Any', 'Female', 'Male', 'Non-Binary'];
const BUDGET_RANGES = ['<$1,000', '$1,000 – $5,000', '$5,000 – $20,000', '$20,000 – $50,000', '$50,000+'];
const FREQUENCY_OPTIONS = ['One-time Campaign', 'Monthly Recurring', 'Quarterly Campaigns', 'Ongoing Partnership'];

const BUDGET_SELECT_OPTIONS: SelectOption[] = BUDGET_RANGES.map((b) => ({
  value: b,
  label: b,
}));

const FREQUENCY_SELECT_OPTIONS: SelectOption[] = FREQUENCY_OPTIONS.map((f) => ({
  value: f,
  label: f,
}));

export default function BrandTargetInfluencersTab({ initialData, onSaveSuccess }: BrandTargetInfluencersTabProps) {
  const { toastSuccess, toastError } = useToast();

  const getCachedData = () => {
    if (initialData) return initialData;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zerify_brand_profile_cache');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  };

  const cached = getCachedData();

  const [selectedTiers, setSelectedTiers] = useState<string[]>(() => cached?.creatorTiers || []);
  const [locations, setLocations] = useState<string[]>(() => cached?.creatorLocations || []);
  const [preferredGender, setPreferredGender] = useState<string>(() => cached?.preferredCreatorGender || 'Any');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(() => cached?.verifiedOnly ?? false);
  const [minEngagement, setMinEngagement] = useState<number>(() => cached?.minEngagementRate ?? 2.0);
  const [budget, setBudget] = useState<string>(() => cached?.campaignBudget || '$5,000 – $20,000');
  const [frequency, setFrequency] = useState<string>(() => cached?.campaignFrequency || 'Monthly Recurring');

  // Sync state whenever initialData changes from backend API
  React.useEffect(() => {
    if (initialData) {
      if (initialData.creatorTiers !== undefined) setSelectedTiers(initialData.creatorTiers || []);
      if (initialData.creatorLocations !== undefined) setLocations(initialData.creatorLocations || []);
      if (initialData.preferredCreatorGender) setPreferredGender(initialData.preferredCreatorGender);
      if (initialData.verifiedOnly !== undefined) setVerifiedOnly(initialData.verifiedOnly);
      if (initialData.minEngagementRate !== undefined && initialData.minEngagementRate !== null) setMinEngagement(initialData.minEngagementRate);
      if (initialData.campaignBudget) setBudget(initialData.campaignBudget);
      if (initialData.campaignFrequency) setFrequency(initialData.campaignFrequency);
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

      const res = await fetch(`${apiUrl}/brand/target-influencers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          creatorTiers: selectedTiers,
          creatorLocations: locations,
          preferredCreatorGender: preferredGender,
          verifiedOnly,
          minEngagementRate: minEngagement,
          campaignBudget: budget,
          campaignFrequency: frequency,
        }),
      });

      const updatedProfile = await res.json();
      try {
        localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event('zerify_brand_profile_update'));
      } catch (e) {}

      toastSuccess('Targeted influencer preferences saved successfully!');
      onSaveSuccess?.();
    } catch (err: any) {
      toastError(err.message || 'Error saving requirements.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">

      {/* 1. Creator Tiers */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Creator Tiers & Audience Size</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CREATOR_TIERS.map((tier) => {
            const isSelected = selectedTiers.includes(tier.id);
            return (
              <button
                type="button"
                key={tier.id}
                onClick={() => toggleArrayItem(selectedTiers, tier.id, setSelectedTiers)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                    : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold">{tier.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <span className="text-[10px] text-slate-400">{tier.range}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Creator Location & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Target Creator Locations</label>
          <div className="flex flex-wrap gap-1.5">
            {CREATOR_LOCATIONS.map((loc) => {
              const isSelected = locations.includes(loc);
              return (
                <button
                  type="button"
                  key={loc}
                  onClick={() => toggleArrayItem(locations, loc, setLocations)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected ? 'bg-purple-600/30 border-purple-500 text-purple-200' : 'bg-slate-950/50 border-white/10 text-slate-400'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Preferred Creator Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_PREFERENCES.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setPreferredGender(g)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  preferredGender === g ? 'bg-purple-600/30 border-purple-500 text-purple-200' : 'bg-slate-950/50 border-white/10 text-slate-400'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Verified Toggle & Engagement Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/60 border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Verified Creators Only?
            </span>
            <p className="text-[11px] text-slate-400">Only match with identity & audience verified profiles</p>
          </div>

          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`w-11 h-6 rounded-full p-1 transition-colors ${verifiedOnly ? 'bg-purple-600' : 'bg-slate-800'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Min Engagement Rate: {minEngagement}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minEngagement}
            onChange={(e) => setMinEngagement(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>Any (0%)</span>
            <span>2.5%</span>
            <span>5.0%+</span>
          </div>
        </div>
      </div>

      {/* 4. Budget & Frequency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Estimated Campaign Budget Range
          </label>
          <CustomSelect
            options={BUDGET_SELECT_OPTIONS}
            value={budget}
            onChange={(val) => setBudget(val)}
            dropdownHeight="max-h-52"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Campaign Frequency
          </label>
          <CustomSelect
            options={FREQUENCY_SELECT_OPTIONS}
            value={frequency}
            onChange={(val) => setFrequency(val)}
            dropdownHeight="max-h-52"
          />
        </div>
      </div>

      <div className="pt-3 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          <span>Save Creator Preferences</span>
        </button>
      </div>
    </form>
  );
}
