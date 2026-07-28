'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, Sparkles, Check } from 'lucide-react';
import MediaKitUploadCard from './subcomponents/MediaKitUploadCard';
import PortfolioItemCard, { PortfolioItem } from './subcomponents/PortfolioItemCard';
import AddPortfolioModal from './subcomponents/AddPortfolioModal';

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

  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddItem = (data: { brandName: string; campaignTitle: string; deliverableLink: string; category: string }) => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        brandName: data.brandName,
        campaignTitle: data.campaignTitle,
        deliverableLink: data.deliverableLink,
        reach: '25,000+ Engagement',
        category: data.category,
      },
    ]);
    setIsAdding(false);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
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
    <form onSubmit={handleSave} className="space-y-5">
      <MediaKitUploadCard />

      {/* Previous Brand Collaborations */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Past Brand Collaborations</span>
            </h3>
            <p className="text-xs text-slate-400/80">Showcase past deliverables and campaign ROI to prospective sponsors</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Deliverable</span>
          </button>
        </div>

        {isAdding && (
          <AddPortfolioModal
            onAddItem={handleAddItem}
            onCancel={() => setIsAdding(false)}
          />
        )}

        <div className="space-y-2.5">
          {items.map((item) => (
            <PortfolioItemCard
              key={item.id}
              item={item}
              onRemoveItem={removeItem}
            />
          ))}
        </div>
      </div>

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
