'use client';

import React, { useState } from 'react';
import { Sliders, Tag, Globe, RefreshCw, Plane, DollarSign, Clock, Plus, X, Sparkles } from 'lucide-react';
import CustomSelect from './CustomSelect';

interface SingleCreatorDetailsCardProps {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  languages: string[];
  setLanguages: React.Dispatch<React.SetStateAction<string[]>>;
  minAmount: string;
  setMinAmount: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  collabTypes: string[];
  setCollabTypes: React.Dispatch<React.SetStateAction<string[]>>;
  barterAvailable: boolean;
  setBarterAvailable: (val: boolean) => void;
  travelReady: boolean;
  setTravelReady: (val: boolean) => void;
  responseTime: string;
  setResponseTime: (val: string) => void;
}

// Master list of all possible content categories/tags
const ALL_CATEGORIES = [
  'Tech & AI',
  'Fashion & Beauty',
  'Fitness & Health',
  'Lifestyle & Travel',
  'Gaming & Esports',
  'Food & Cooking',
  'Business & Finance',
  'Entertainment & Vlogs',
  'Education & Career',
  'Photography & Art',
  'Parenting & Family',
  'Music & Dance',
  'Automotive & Tech',
  'Pets & Animals',
  'Crypto & Web3',
  'Home & Interior Design',
];

// Master list of collaboration types
const ALL_COLLAB_TYPES = [
  'Dedicated Video',
  'Instagram Reel',
  'TikTok Video',
  'Integrated Sponsorship',
  'Story Post (24h)',
  'Product Unboxing',
  'YouTube Short',
];

// Currency options
const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

// Response time options
const RESPONSE_TIME_OPTIONS = [
  { value: 'Within 1 hour', label: '⚡ Within 1 hour (Fastest)' },
  { value: 'Within 6 hours', label: '🚀 Within 6 hours' },
  { value: 'Within 24 hours', label: '✅ Within 24 hours (Standard)' },
  { value: 'Within 48 hours', label: '🕒 Within 48 hours' },
  { value: 'Within 3-5 days', label: '📅 Within 3-5 days' },
];

export default function SingleCreatorDetailsCard({
  categories,
  setCategories,
  languages,
  setLanguages,
  minAmount,
  setMinAmount,
  currency,
  setCurrency,
  collabTypes,
  setCollabTypes,
  barterAvailable,
  setBarterAvailable,
  travelReady,
  setTravelReady,
  responseTime,
  setResponseTime,
}: SingleCreatorDetailsCardProps) {
  const [languageInput, setLanguageInput] = useState('');

  // Toggle Category tag
  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  // Add Language Tag from text input
  const handleAddLanguage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = languageInput.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages((prev) => [...prev, trimmed]);
      setLanguageInput('');
    }
  };

  // Remove Language Tag
  const removeLanguage = (lang: string) => {
    setLanguages((prev) => prev.filter((item) => item !== lang));
  };

  // Quick toggle suggested language
  const toggleSuggestedLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      removeLanguage(lang);
    } else {
      setLanguages((prev) => [...prev, lang]);
    }
  };

  // Toggle Collaboration Type tag
  const toggleCollabType = (type: string) => {
    setCollabTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const SUGGESTED_LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Arabic'];

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-8 shadow-xl">
      {/* 1. Header Section */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Creator Niche, Rates & Preferences</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </h3>
          <p className="text-[11px] text-slate-400/80">
            Define your content categories, language fluency, pricing structure & collaboration flexibility.
          </p>
        </div>
      </div>

      {/* 2. Content Category — Show All Tags Possible */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>Content Categories / Niches</span>
          </label>
          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            {categories.length} Selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold border-purple-400/50 shadow-md shadow-purple-950/40 scale-[1.02]'
                    : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="text-[10px] font-black">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Content Language — Text Box to Add Tags */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>Content Languages</span>
        </label>

        {/* Text Input Box to Add Custom Language Tags */}
        <form onSubmit={handleAddLanguage} className="flex gap-2 mb-2.5">
          <input
            type="text"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            placeholder="Type a language (e.g. French, Japanese) and press Enter or click Add..."
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner font-medium"
          />
          <button
            type="button"
            onClick={() => handleAddLanguage()}
            className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tag</span>
          </button>
        </form>

        {/* Active Selected Language Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/30 text-xs font-semibold shadow-sm"
            >
              <span>{lang}</span>
              <button
                type="button"
                onClick={() => removeLanguage(lang)}
                className="hover:text-white transition-colors"
                title={`Remove ${lang}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {languages.length === 0 && (
            <span className="text-xs text-slate-500 italic py-0.5">No languages added yet. Type above to add tags.</span>
          )}
        </div>

        {/* Quick-Add Suggestions */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quick Suggestions:</span>
          {SUGGESTED_LANGUAGES.map((lang) => {
            const isSelected = languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleSuggestedLanguage(lang)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full transition-colors font-medium ${
                  isSelected
                    ? 'bg-purple-600/40 text-purple-200 border border-purple-400/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {isSelected ? `✓ ${lang}` : `+ ${lang}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 & 5. Toggles: Barter Deals & Travel Ready for Shoots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Barter Deal Toggle */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Available for Barter Deals</span>
              <span className="text-[10px] text-slate-400 block">Open to product exchange / gift collabs</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBarterAvailable(!barterAvailable)}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-1 ${
              barterAvailable ? 'bg-purple-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                barterAvailable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Travel Ready Toggle */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-white/10 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Travel Ready for Shoots</span>
              <span className="text-[10px] text-slate-400 block">Available for outdoor/destinations</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTravelReady(!travelReady)}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-1 ${
              travelReady ? 'bg-purple-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                travelReady ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 6. Collaboration Types & Pricing */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-purple-400" />
          <span>Collaboration Types & Minimum Pricing</span>
        </label>

        {/* Collab Types Tag Selection */}
        <div className="flex flex-wrap gap-2 mb-3">
          {ALL_COLLAB_TYPES.map((type) => {
            const isSelected = collabTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleCollabType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 font-bold shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                <span>{type}</span>
                {isSelected && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Minimum Rate Input, Currency Selector & Response Time in a Single Line */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Minimum Rate / Price
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                {currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
              </span>
              <input
                type="text"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="10000"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Currency
            </label>
            <CustomSelect
              options={CURRENCY_OPTIONS}
              value={currency}
              onChange={setCurrency}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-purple-400" />
              <span>Typical Response Time</span>
            </label>
            <CustomSelect
              options={RESPONSE_TIME_OPTIONS}
              value={responseTime}
              onChange={setResponseTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
