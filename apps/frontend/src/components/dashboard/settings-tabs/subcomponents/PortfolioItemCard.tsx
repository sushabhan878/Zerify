'use client';

import React from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';

export interface PortfolioItem {
  id: number;
  brandName: string;
  campaignTitle: string;
  deliverableLink: string;
  reach: string;
  category: string;
}

interface PortfolioItemCardProps {
  item: PortfolioItem;
  onRemoveItem: (id: number) => void;
}

export default function PortfolioItemCard({ item, onRemoveItem }: PortfolioItemCardProps) {
  return (
    <div className="p-3.5 rounded-lg bg-slate-950/70 border border-white/10 flex items-start justify-between gap-4 hover:border-purple-500/30 transition-all group shadow-inner">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">{item.brandName}</span>
          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9.5px] font-semibold">
            {item.category}
          </span>
        </div>
        <p className="text-xs text-slate-300/90 font-normal">{item.campaignTitle}</p>
        <div className="flex items-center gap-3 text-[10.5px] font-medium text-slate-400/80 pt-0.5">
          <span>{item.reach}</span>
          <span>•</span>
          <a
            href={item.deliverableLink}
            target="_blank"
            rel="noreferrer"
            className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View Deliverable</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemoveItem(item.id)}
        className="p-1.5 rounded-lg text-slate-500 hover:text-pink-400 hover:bg-white/5 transition-colors"
        title="Remove Item"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
