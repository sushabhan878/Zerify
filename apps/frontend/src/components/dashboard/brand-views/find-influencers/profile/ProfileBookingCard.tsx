'use client';

import React, { useState } from 'react';
import { ChevronDown, Send, Check } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';

interface ProfileBookingCardProps {
  creator: CreatorItem;
  onInvite: (creator: CreatorItem) => void;
}

interface PackageOption {
  id: string;
  name: string;
  price: number;
  platformIcon: 'instagram' | 'tiktok' | 'youtube' | 'bundle';
  description: string;
}

export default function ProfileBookingCard({
  creator,
  onInvite,
}: ProfileBookingCardProps) {
  const baseRate = creator.rateNumber || 200;

  const packages: PackageOption[] = [
    {
      id: 'p1',
      name: '1 Instagram Photo Feed Post',
      price: baseRate,
      platformIcon: 'instagram',
      description:
        'One carousel post featuring 3-10 Photos within the carousel with brand products will tag the brand in the cover photo and caption.',
    },
    {
      id: 'p2',
      name: '1 Dedicated Instagram / TikTok Reel',
      price: Math.round(baseRate * 1.5),
      platformIcon: 'tiktok',
      description:
        'High-energy 30–60 second vertical reel featuring full product unboxing, live styling, key features showcase, and pinned comment link.',
    },
    {
      id: 'p3',
      name: '1 YouTube Video Integration',
      price: Math.round(baseRate * 2.2),
      platformIcon: 'youtube',
      description:
        'Dedicated 60–90 second sponsored segment in long-form video with product link and trackable promo discount code in description.',
    },
    {
      id: 'p4',
      name: 'Full Multi-Platform Campaign Bundle',
      price: Math.round(baseRate * 3.0),
      platformIcon: 'bundle',
      description:
        'All-in-one package: 1 Feed Carousel, 2 Story sequences, 1 Reel, and 90-day organic usage rights for digital ad boosting.',
    },
  ];

  const [selectedPkg, setSelectedPkg] = useState<PackageOption>(packages[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="sticky top-20 rounded-2xl sm:rounded-3xl bg-[#090C15]/95 border border-white/10 p-6 space-y-5 shadow-2xl backdrop-blur-xl">
      {/* Price Display */}
      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        ${selectedPkg.price}
      </div>

      {/* Package Dropdown Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/15 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white transition-all shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <svg className="w-4 h-4 text-pink-400 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="truncate">{selectedPkg.name}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
              isDropdownOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl bg-[#0e1320] border border-white/15 shadow-2xl z-30 space-y-1">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => {
                  setSelectedPkg(pkg);
                  setIsDropdownOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs font-semibold transition-all ${
                  selectedPkg.id === pkg.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="block truncate">{pkg.name}</span>
                  <span className="text-[11px] text-slate-400 font-normal">${pkg.price}</span>
                </div>
                {selectedPkg.id === pkg.id && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Package Description */}
      <p className="text-xs text-slate-400 leading-relaxed">
        {selectedPkg.description}
      </p>

      {/* Primary Action Button */}
      <button
        onClick={() => onInvite(creator)}
        type="button"
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-pink-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] border border-pink-400/20"
      >
        Add to Cart
      </button>

      {/* Or Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-white/10 w-full" />
        <span className="bg-[#090C15] px-3 text-xs text-slate-500 font-medium">or</span>
        <div className="border-t border-white/10 w-full" />
      </div>

      {/* Secondary Action: Negotiate a Package */}
      <button
        onClick={() => onInvite(creator)}
        type="button"
        className="w-full text-center text-xs sm:text-sm font-bold text-slate-300 hover:text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
      >
        Negotiate a Package
      </button>
    </div>
  );
}
