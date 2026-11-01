'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Check, Plus, X, Sparkles, ChevronDown, Search, AlertCircle } from 'lucide-react';
import { ALL_INDUSTRIES_GROUPED, SUGGESTED_OBJECTIVE_TAGS } from '@/constants/categories';

import CustomDatePicker from '@/components/ui/CustomDatePicker';

interface BasicInfoStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
  existingCampaignNames?: string[];
}


function addDays(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  const nextY = date.getFullYear();
  const nextM = String(date.getMonth() + 1).padStart(2, '0');
  const nextD = String(date.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
}

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BasicInfoStep({
  formData,
  onChange,
  existingCampaignNames = [],
}: BasicInfoStepProps) {
  const [customTagInput, setCustomTagInput] = useState('');
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const todayStr = getTodayString();

  const currentTitleTrimmed = (formData.title || '').trim().toLowerCase();
  const isDuplicateName = Boolean(
    currentTitleTrimmed &&
    existingCampaignNames &&
    existingCampaignNames.some((name) => name.trim().toLowerCase() === currentTitleTrimmed)
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsIndustryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Objectives array stored in objective column
  const selectedTags: string[] = Array.isArray(formData.objective)
    ? formData.objective
    : formData.objective
      ? [formData.objective]
      : Array.isArray(formData.categories)
        ? formData.categories
        : [];

  const toggleTag = (tag: string) => {
    let updated: string[];
    if (selectedTags.includes(tag)) {
      updated = selectedTags.filter((t) => t !== tag);
    } else {
      updated = [...selectedTags, tag];
    }
    onChange('objective', updated);
  };

  const handleAddCustomTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const newTag = customTagInput.trim();
      if (!selectedTags.includes(newTag)) {
        toggleTag(newTag);
      }
      setCustomTagInput('');
    }
  };

  // Filter industries by search
  const filteredIndustryGroups = ALL_INDUSTRIES_GROUPED.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.toLowerCase().includes(industrySearchQuery.toLowerCase().trim()),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Campaign Title & Industry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
            Campaign Name <span className="text-pink-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Q3 Next-Gen AI Workspace Launch"
            value={formData.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className={`w-full px-4 py-3 bg-slate-900/90 light:bg-white border rounded-xl text-sm text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-0 transition-colors ${
              isDuplicateName
                ? 'border-rose-500/80 bg-rose-500/5 focus:border-rose-500'
                : 'border-purple-400/20 light:border-slate-300 focus:border-white/20 light:focus:border-purple-500'
            }`}
          />
          {isDuplicateName && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>A campaign named &ldquo;{formData.title.trim()}&rdquo; already exists. Please choose a unique name.</span>
            </div>
          )}
        </div>

        {/* Custom Searchable Industry Dropdown */}
        <div className="relative sm:col-span-2" ref={dropdownRef}>
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
            Industry / Vertical <span className="text-pink-400">*</span>
          </label>
          <button
            type="button"
            onClick={() => setIsIndustryDropdownOpen((prev) => !prev)}
            className="w-full px-4 py-3 bg-slate-900/90 light:bg-white border border-purple-400/20 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 flex items-center justify-between focus:outline-none focus:ring-0 focus:border-white/20 light:focus:border-purple-500 transition-colors"
          >
            <span className={formData.industry ? 'text-white light:text-slate-900 font-medium' : 'text-slate-500 light:text-slate-400'}>
              {formData.industry || 'Select Industry / Vertical...'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isIndustryDropdownOpen ? 'rotate-180 text-purple-300 light:text-purple-600' : ''
                }`}
            />
          </button>

          {/* Dropdown Menu Popup */}
          <AnimatePresence>
            {isIndustryDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-slate-900 light:bg-white border border-white/10 light:border-slate-200 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl max-h-72 flex flex-col"
              >
                {/* Search in Dropdown */}
                <div className="p-2.5 border-b border-white/10 light:border-slate-200 bg-slate-950/60 light:bg-slate-50 sticky top-0 z-10 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-purple-300/70 light:text-purple-600 ml-1 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search industries (e.g. AI, Fashion, Crypto, Gaming)..."
                    value={industrySearchQuery}
                    onChange={(e) => setIndustrySearchQuery(e.target.value)}
                    className="w-full bg-transparent text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none"
                    autoFocus
                  />
                  {industrySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setIndustrySearchQuery('')}
                      className="p-1 text-slate-500 hover:text-slate-300 light:hover:text-slate-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Categorized Options List */}
                <div className="overflow-y-auto p-2 space-y-3 flex-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {filteredIndustryGroups.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No industries matching &quot;{industrySearchQuery}&quot;
                    </div>
                  ) : (
                    filteredIndustryGroups.map((group) => (
                      <div key={group.category} className="space-y-1">
                        <span className="text-[10px] font-black tracking-wider text-purple-300/70 light:text-purple-700 uppercase px-2.5 py-0.5 block">
                          {group.category}
                        </span>
                        <div className="space-y-0.5">
                          {group.items.map((item) => {
                            const isSelected = formData.industry === item;
                            return (
                              <button
                                type="button"
                                key={item}
                                onClick={() => {
                                  onChange('industry', item);
                                  setIsIndustryDropdownOpen(false);
                                  setIndustrySearchQuery('');
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors flex items-center justify-between ${isSelected
                                    ? 'bg-purple-500/20 light:bg-purple-100 text-purple-200 light:text-purple-900 font-bold'
                                    : 'text-slate-300 light:text-slate-700 hover:bg-slate-800 light:hover:bg-purple-50 hover:text-white light:hover:text-purple-900'
                                  }`}
                              >
                                <span>{item}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-600 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Campaign Objectives - Multiple Tags Picker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider">
            Campaign Objectives & Goals <span className="text-pink-400">*</span>
          </label>
          <span className="text-[11px] font-semibold text-purple-300/80 light:text-purple-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-300 light:text-purple-600" />
            <span>Select multiple tags</span>
          </span>
        </div>

        {/* Tags Cloud */}
        <div className="flex flex-wrap gap-x-3.5 gap-y-3 pt-1">
          {SUGGESTED_OBJECTIVE_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag);

            return (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${isSelected
                    ? 'bg-purple-500/20 light:bg-purple-100 border border-purple-400/60 light:border-purple-300 text-purple-100 light:text-purple-800 shadow-[0_0_10px_rgba(192,132,252,0.25)]'
                    : 'bg-slate-900/90 light:bg-slate-100 border border-white/10 light:border-slate-200 text-slate-400 light:text-slate-600 hover:border-purple-400/30 hover:text-purple-200 light:hover:text-purple-700 hover:bg-slate-800/80 light:hover:bg-purple-50'
                  }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-purple-300 light:text-purple-600 stroke-[2.5]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500 light:text-slate-400" />
                )}
                <span>{tag}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Tag Input */}
        <div className="pt-2 flex items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Tag className="w-3.5 h-3.5 text-purple-300/60 light:text-purple-600 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Add custom objective (press Enter)..."
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 light:bg-white border border-purple-400/20 light:border-slate-300 rounded-full text-xs text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 light:focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Description / Brief */}
      <div>
        <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
          Campaign Description & Brief <span className="text-pink-400">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Explain your campaign goals, brand background, tone of voice, and what you expect creators to communicate..."
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          className="w-full px-4 py-3 bg-slate-900/90 light:bg-white border border-purple-400/20 light:border-slate-300 rounded-xl text-sm text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-white/20 light:focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Timeline Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
            Application Deadline
          </label>
          <CustomDatePicker
            value={formData.applicationDeadline || ''}
            onChange={(val) => {
              onChange('applicationDeadline', val);
              if (val) {
                const nextStart = addDays(val, 1);
                const nextEnd = addDays(val, 2);
                onChange('startDate', nextStart);
                onChange('endDate', nextEnd);
              }
            }}
            placeholder="Select deadline"
            minDate={todayStr}
            position="top"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
            Campaign Start Date
          </label>
          <CustomDatePicker
            value={formData.startDate || ''}
            onChange={(val) => {
              onChange('startDate', val);
              if (val) {
                const nextEnd = addDays(val, 1);
                onChange('endDate', nextEnd);
              }
            }}
            placeholder="Select start date"
            minDate={formData.applicationDeadline ? addDays(formData.applicationDeadline, 1) : addDays(todayStr, 1)}
            position="top"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 light:text-slate-700 uppercase tracking-wider mb-1.5">
            Campaign End Date
          </label>
          <CustomDatePicker
            value={formData.endDate || ''}
            onChange={(val) => onChange('endDate', val)}
            placeholder="Select end date"
            minDate={
              formData.startDate
                ? addDays(formData.startDate, 1)
                : formData.applicationDeadline
                ? addDays(formData.applicationDeadline, 2)
                : addDays(todayStr, 2)
            }
            position="top"
            align="right"
          />
        </div>
      </div>

    </div>
  );
}
