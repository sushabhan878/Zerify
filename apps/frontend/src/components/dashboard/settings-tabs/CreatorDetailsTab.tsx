'use client';

import React, { useState } from 'react';
import { Sliders, DollarSign, Languages, Tag, Plane, RefreshCw, Clock, Check, Sparkles } from 'lucide-react';

interface CreatorDetailsTabProps {
  onSaveSuccess?: () => void;
}

export default function CreatorDetailsTab({ onSaveSuccess }: CreatorDetailsTabProps) {
  const [categories, setCategories] = useState<string[]>(['Tech & AI', 'Lifestyle']);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi']);
  const [minAmount, setMinAmount] = useState('1500');
  const [currency, setCurrency] = useState('USD');
  const [collabTypes, setCollabTypes] = useState<string[]>(['Dedicated Video', 'Instagram Reel', 'Integrated Sponsorship']);
  const [barterAvailable, setBarterAvailable] = useState(false);
  const [travelReady, setTravelReady] = useState(true);
  const [responseTime, setResponseTime] = useState('Within 24 hours');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const categoryOptions = [
    'Tech & AI', 'Gaming', 'Lifestyle', 'Fashion & Apparel', 'Beauty & Skincare',
    'Fitness & Health', 'Food & Cooking', 'Travel & Vlogs', 'Business & Finance', 'Education'
  ];

  const languageOptions = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Multi-lingual'];

  const collabTypeOptions = [
    'Dedicated Video', 'Integrated Sponsorship', 'Instagram Reel', 'Story Series',
    'Product Unboxing & Review', 'Live Stream Host'
  ];

  const toggleArrayItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Content Niche & Language Preferences */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-400" />
          <span>Content Niche & Languages</span>
        </h3>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-2">
            Content Category (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => {
              const selected = categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleArrayItem(categories, setCategories, cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40 border border-purple-400/40'
                      : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline-block mr-1" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-2">
            Content Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((lang) => {
              const selected = languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleArrayItem(languages, setLanguages, lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40 border border-indigo-400/40'
                      : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline-block mr-1" />}
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing & Collaboration Details */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-purple-400" />
          <span>Pricing & Deal Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Minimum Collaboration Amount</label>
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-bold shrink-0"
              >
                <option value="USD">$ USD</option>
                <option value="INR">₹ INR</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
              </select>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Average Response Time</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="Within 1 hour">Within 1 hour</option>
                <option value="Within 24 hours">Within 24 hours</option>
                <option value="1-3 business days">1-3 business days</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-2">Accepted Collaboration Types</label>
          <div className="flex flex-wrap gap-2">
            {collabTypeOptions.map((type) => {
              const selected = collabTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayItem(collabTypes, setCollabTypes, type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    selected
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-950/40 border border-pink-400/40'
                      : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline-block mr-1" />}
                  {type}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Barter & Travel Readiness Toggles */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>Flexibility & Availability</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Barter Toggle */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                Available for Barter Deals?
              </span>
              <p className="text-[10.5px] text-slate-400">Accept product/service exchanges without cash fee.</p>
            </div>
            <button
              type="button"
              onClick={() => setBarterAvailable(!barterAvailable)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                barterAvailable ? 'bg-purple-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  barterAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Travel Ready Toggle */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-indigo-400" />
                Travel Ready for Shoots?
              </span>
              <p className="text-[10.5px] text-slate-400">Available to travel for brand events & video shoots.</p>
            </div>
            <button
              type="button"
              onClick={() => setTravelReady(!travelReady)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                travelReady ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  travelReady ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Trigger */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-4 h-4" /> Creator Details Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Creator Details'}</span>
        </button>
      </div>
    </form>
  );
}
