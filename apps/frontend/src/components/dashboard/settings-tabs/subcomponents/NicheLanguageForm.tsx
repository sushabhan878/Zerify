'use client';

import React from 'react';
import { Tag, Check } from 'lucide-react';

interface NicheLanguageFormProps {
  categories: string[];
  setCategories: (val: string[]) => void;
  languages: string[];
  setLanguages: (val: string[]) => void;
}

export default function NicheLanguageForm({
  categories,
  setCategories,
  languages,
  setLanguages,
}: NicheLanguageFormProps) {
  const categoryOptions = [
    'Tech & AI', 'Gaming', 'Lifestyle', 'Fashion & Apparel', 'Beauty & Skincare',
    'Fitness & Health', 'Food & Cooking', 'Travel & Vlogs', 'Business & Finance', 'Education'
  ];

  const languageOptions = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Multi-lingual'];

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
        <Tag className="w-4 h-4 text-purple-400" />
        <span>Content Niche & Languages</span>
      </h3>

      <div>
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-2">
          Content Category (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((cat) => {
            const selected = categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleItem(categories, setCategories, cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selected
                    ? 'bg-purple-600/90 text-white shadow-md border border-purple-400/30 font-semibold'
                    : 'bg-slate-950/60 border border-white/10 text-slate-400/90 hover:text-white hover:border-white/20'
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
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-2">
          Content Languages
        </label>
        <div className="flex flex-wrap gap-2">
          {languageOptions.map((lang) => {
            const selected = languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleItem(languages, setLanguages, lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selected
                    ? 'bg-indigo-600/90 text-white shadow-md border border-indigo-400/30 font-semibold'
                    : 'bg-slate-950/60 border border-white/10 text-slate-400/90 hover:text-white hover:border-white/20'
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
  );
}
