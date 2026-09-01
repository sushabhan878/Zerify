'use client';

import React, { useState } from 'react';

interface AddPortfolioModalProps {
  onAddItem: (item: { brandName: string; campaignTitle: string; deliverableLink: string; category: string }) => void;
  onCancel: () => void;
}

export default function AddPortfolioModal({ onAddItem, onCancel }: AddPortfolioModalProps) {
  const [newBrand, setNewBrand] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newCategory, setNewCategory] = useState('Tech Review');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newTitle) return;

    onAddItem({
      brandName: newBrand,
      campaignTitle: newTitle,
      deliverableLink: newLink || 'https://zerify.io/deliverable',
      category: newCategory,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg bg-slate-950/80 border border-purple-500/30 space-y-3 shadow-inner">
      <h4 className="text-xs font-bold text-white">New Collaboration Item</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1">
            Brand Name
          </label>
          <input
            type="text"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="e.g. Apex Tech"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 font-medium"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1">
            Campaign Title
          </label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Headphones Unboxing"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 font-medium"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1">
            Deliverable URL
          </label>
          <input
            type="text"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://youtube.com/..."
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 font-medium"
          />
        </div>

        <div>
          <label className="text-[10px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1">
            Category
          </label>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/80 font-medium"
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
          onClick={onCancel}
          className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold shadow-md"
        >
          Save Item
        </button>
      </div>
    </form>
  );
}
