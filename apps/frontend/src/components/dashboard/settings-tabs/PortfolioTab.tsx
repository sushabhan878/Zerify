'use client';

import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import SinglePortfolioCard, { PortfolioItem } from './subcomponents/SinglePortfolioCard';

interface PortfolioTabProps {
  onSaveSuccess?: () => void;
}

export default function PortfolioTab({ onSaveSuccess }: PortfolioTabProps) {
  const [items, setItems] = useState<PortfolioItem[]>([
    {
      id: 1,
      brandName: 'Apex Audio Technologies',
      campaignTitle: 'ANC Wireless Headphones Unboxing & Sound Test',
      deliverableLink: 'https://youtube.com/watch?v=example1',
      reach: '420,000 Views',
      category: 'Tech Review',
    },
    {
      id: 2,
      brandName: 'GlowSkin Skincare Co.',
      campaignTitle: '7-Day Morning Skincare Routine Reel',
      deliverableLink: 'https://instagram.com/reel/example2',
      reach: '185,000 Impressions',
      category: 'Beauty',
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    <form onSubmit={handleSave} className="space-y-5">
      <SinglePortfolioCard
        items={items}
        setItems={setItems}
      />

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" /> Portfolio Showcase Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Portfolio'}</span>
        </button>
      </div>
    </form>
  );
}

