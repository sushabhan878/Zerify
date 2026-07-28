'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Briefcase, ExternalLink, Plus, Trash2, FileText, Upload, Sparkles, Check } from 'lucide-react';

interface PortfolioItem {
  id: number;
  brandName: string;
  campaignTitle: string;
  deliverableLink: string;
  reach: string;
  category: string;
}

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

  const [newBrand, setNewBrand] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newCategory, setNewCategory] = useState('Tech Review');
  const [isAdding, setIsAdding] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newTitle) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        brandName: newBrand,
        campaignTitle: newTitle,
        deliverableLink: newLink || 'https://zerify.io/deliverable',
        reach: '25,000+ Engagement',
        category: newCategory,
      },
    ]);

    setNewBrand('');
    setNewTitle('');
    setNewLink('');
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
    <form onSubmit={handleSave} className="space-y-6">
      {/* Media Kit PDF Attachment Section */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Media Kit & Press Attachments</span>
        </h3>

        <div className="p-4 rounded-xl bg-slate-950 border border-dashed border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Media Kit (PDF)</h4>
              <p className="text-[11px] text-slate-400">Upload your latest media kit, rate sheet, or audience deck.</p>
            </div>
          </div>

          <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black cursor-pointer transition-all shrink-0 shadow-md">
            <span>Upload File</span>
            <input type="file" accept=".pdf,.png,.jpg" className="hidden" />
          </label>
        </div>
      </div>

      {/* Previous Brand Collaborations */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Past Brand Collaborations Showcase</span>
            </h3>
            <p className="text-xs text-slate-400">Add deliverables to demonstrate campaign ROI to prospective sponsors</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/40 text-purple-300 text-xs font-black flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Add Brand Deal</span>
          </button>
        </div>

        {/* Add Item Inline Form */}
        {isAdding && (
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
            <h4 className="text-xs font-black text-white">New Brand Collaboration Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Brand Name</label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="e.g. Apex Tech"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Headphones Unboxing"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Deliverable Link (URL)</label>
                <input
                  type="text"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                >
                  <option value="Tech Review">Tech Review</option>
                  <option value="Beauty & Fashion">Beauty & Fashion</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-black shadow-md"
              >
                Save Item
              </button>
            </div>
          </div>
        )}

        {/* Existing Portfolio Showcase Grid */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-start justify-between gap-4 hover:border-purple-500/30 transition-all group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{item.brandName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9.5px] font-extrabold">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{item.campaignTitle}</p>
                <div className="flex items-center gap-3 text-[10.5px] font-semibold text-slate-400 pt-1">
                  <span>{item.reach}</span>
                  <span>•</span>
                  <a
                    href={item.deliverableLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>View Deliverable</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 rounded-xl text-slate-500 hover:text-pink-400 hover:bg-white/5 transition-colors"
                title="Remove Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Trigger */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-4 h-4" /> Portfolio Showcase Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Portfolio'}</span>
        </button>
      </div>
    </form>
  );
}
