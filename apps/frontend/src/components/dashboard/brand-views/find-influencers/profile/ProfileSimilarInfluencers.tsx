'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Award, Camera } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';

interface ProfileSimilarInfluencersProps {
  creator: CreatorItem;
  onSelectCreator?: (creator: CreatorItem) => void;
}

interface SimilarCreatorItem {
  id: string;
  name: string;
  rating: number;
  role: string;
  price: string;
  location: string;
  reachBadge: string;
  isTopCreator?: boolean;
  avatarUrl: string;
}

export default function ProfileSimilarInfluencers({
  creator,
  onSelectCreator,
}: ProfileSimilarInfluencersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const similarCreators: SimilarCreatorItem[] = [
    {
      id: 'sim_1',
      name: 'Julia Zelg',
      rating: 5.0,
      role: 'Lifestyle, Beauty, Fashion & Vlog Creator',
      price: '$75',
      location: 'New York, NY, US',
      reachBadge: '77.2k',
      isTopCreator: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'sim_2',
      name: 'Anna Bee',
      rating: 4.9,
      role: 'UGC Creator / Tiktok, Reels Aesthetic',
      price: '$135',
      location: 'Denver, CO, US',
      reachBadge: 'UGC',
      isTopCreator: false,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'sim_3',
      name: 'Melody L Atkinson',
      rating: 5.0,
      role: 'Lgbtq Lifestyle & Editorial Content',
      price: '$200',
      location: 'Los Angeles, CA, US',
      reachBadge: '1.7k',
      isTopCreator: false,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'sim_4',
      name: 'Elena Rostova',
      rating: 4.8,
      role: 'High Fashion & Luxury Beauty Trends',
      price: '$180',
      location: 'Paris, France',
      reachBadge: '124k',
      isTopCreator: true,
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const relatedCategories = [
    'Find instagram Influencers',
    'Find tiktok Influencers',
    'Find UGC Influencers',
    'Find Fashion Influencers',
    'Find Beauty Influencers',
    'Find LGBTQ2+ Influencers',
    'Find Lifestyle Influencers',
  ];

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -320 : 320,
        behavior: 'smooth',
      });
    }
  };

  const handleCardClick = (sim: SimilarCreatorItem) => {
    if (onSelectCreator) {
      onSelectCreator({
        id: sim.id,
        name: sim.name,
        handle: `@${sim.name.toLowerCase().replace(/\s+/g, '')}`,
        role: sim.role,
        category: 'Fashion & Beauty',
        categories: ['Fashion & Beauty', 'Lifestyle'],
        bio: `${sim.name} is a verified creator specializing in ${sim.role}. Experienced in viral Reels, TikTok campaigns, and brand storytelling.`,
        startingRate: sim.price,
        rateNumber: parseInt(sim.price.replace('$', '')) || 100,
        reach: sim.reachBadge,
        reachNumber: 75000,
        engRate: '5.2%',
        engRateNumber: 5.2,
        rating: sim.rating,
        matchScore: 94,
        matchReasons: ['High audience affinity', 'Verified brand deal track record', 'Top responsiveness rating'],
        isVerified: true,
        location: sim.location,
        avatarUrl: sim.avatarUrl,
        platforms: ['Instagram', 'TikTok'],
        primaryPlatform: 'Instagram',
        skills: ['Reels', 'Product Modeling', 'Storytelling'],
        creatorTier: 'Rising Star',
      });
    }
  };

  return (
    <div className="space-y-10 pt-10">
      {/* 1. Similar Influencers Header & Navigation Arrows */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Influencers similar to {creator.name}
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Previous influencers"
              className="w-8 h-8 rounded-lg border border-white/15 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Next influencers"
              className="w-8 h-8 rounded-lg border border-white/15 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Similar Influencer Cards Horizontal Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {similarCreators.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="w-[240px] sm:w-[260px] shrink-0 space-y-2.5 cursor-pointer group"
            >
              {/* Image Container with Badges */}
              <div className="relative h-[290px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-lg group-hover:border-purple-500/40 transition-colors">
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Badge: Top Creator */}
                {item.isTopCreator && (
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-bold text-pink-300 flex items-center gap-1 shadow-md">
                    <Award className="w-3 h-3 text-pink-400" />
                    <span>Top Creator</span>
                  </div>
                )}

                {/* Bottom Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Overlay Info on Photo */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1">
                  {/* Reach/UGC Pill */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[10.5px] font-semibold text-slate-200 shadow-sm">
                    {item.reachBadge === 'UGC' ? (
                      <Camera className="w-3 h-3 text-slate-300" />
                    ) : (
                      <svg className="w-3 h-3 fill-current text-pink-400" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    )}
                    <span>{item.reachBadge}</span>
                  </span>

                  {/* Name & Star Rating */}
                  <div className="flex items-center gap-1 text-sm font-bold text-white">
                    <span className="truncate">{item.name}</span>
                    <span className="flex items-center text-amber-400 text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                      {item.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Info Below Photo */}
              <div className="space-y-1">
                <p className="text-xs text-slate-400 truncate font-medium">
                  {item.role}
                </p>
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="font-bold text-white text-sm">{item.price}</span>
                  <span className="text-slate-400 truncate max-w-[130px]">
                    {item.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Related Categories Pill Chips */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Related Categories
        </h3>

        <div className="flex items-center gap-2.5 flex-wrap">
          {relatedCategories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-purple-500/30 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
