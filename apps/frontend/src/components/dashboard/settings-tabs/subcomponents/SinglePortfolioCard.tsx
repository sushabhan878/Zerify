'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Sparkles,
  UploadCloud,
  FileText,
  ExternalLink,
  Trash2,
  Tag,
  Eye,
  CheckCircle2,
  X,
} from 'lucide-react';

export interface PortfolioItem {
  id: number;
  brandName: string;
  campaignTitle: string;
  deliverableLink: string;
  reach: string;
  category: string;
}

interface SinglePortfolioCardProps {
  items: PortfolioItem[];
  setItems: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
}

export default function SinglePortfolioCard({
  items,
  setItems,
}: SinglePortfolioCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [mediaKitFileName, setMediaKitFileName] = useState<string | null>(
    'Elena_UGC_MediaKit_2026.pdf'
  );

  // New Item Form State
  const [brandName, setBrandName] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [deliverableLink, setDeliverableLink] = useState('');
  const [category, setCategory] = useState('Tech Review');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !campaignTitle.trim()) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        brandName: brandName.trim(),
        campaignTitle: campaignTitle.trim(),
        deliverableLink: deliverableLink.trim() || 'https://youtube.com',
        reach: '35,000+ Impressions',
        category: category || 'General',
      },
    ]);

    setBrandName('');
    setCampaignTitle('');
    setDeliverableLink('');
    setIsAdding(false);
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaKitFileName(file.name);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-8 shadow-xl">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Creator Showcase & Portfolio</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </h3>
            <p className="text-[11px] text-slate-400/80">
              Upload past brand deliverables, campaign case studies & media kits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Work Sample</span>
        </button>
      </div>

      {/* 2. Media Kit Section */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>PDF Media Kit & Pitch Deck</span>
          </span>
          {mediaKitFileName && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Uploaded & Verified
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/60 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 shrink-0">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                {mediaKitFileName || 'No file selected'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                PDF format up to 25MB (Rate card, demographics & analytics)
              </span>
            </div>
          </div>

          <label className="px-3.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold cursor-pointer transition-all shrink-0">
            <span>Upload New PDF</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. Inline Add Deliverable Form */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <h4 className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Add Past Campaign Deliverable</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Sony Audio"
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/80"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Category / Type
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Tech Review, Beauty Reel"
                className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/80"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Campaign Title & Deliverable Summary
            </label>
            <input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              placeholder="e.g. ANC Headphones Unboxing & 60s Dedicated Review"
              className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/80"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Deliverable URL / Live Link
            </label>
            <input
              type="url"
              value={deliverableLink}
              onChange={(e) => setDeliverableLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/80"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-semibold hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
            >
              Add Sample
            </button>
          </div>
        </form>
      )}

      {/* 4. Past Brand Collaborations Grid */}
      <div className="space-y-3">
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-purple-400" />
          <span>Past Deliverables & Brand Work</span>
        </label>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-white">
                    {item.brandName}
                  </span>
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {item.campaignTitle}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <Eye className="w-3 h-3" />
                    {item.reach}
                  </span>
                  {item.deliverableLink && (
                    <a
                      href={item.deliverableLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 underline underline-offset-2"
                    >
                      <span>View Live Deliverable</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all self-end sm:self-center shrink-0"
                title="Remove Work Sample"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500 italic rounded-xl bg-slate-950/40 border border-white/5">
              No work samples added yet. Click "Add Work Sample" above to showcase past campaign ROI to brands.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
