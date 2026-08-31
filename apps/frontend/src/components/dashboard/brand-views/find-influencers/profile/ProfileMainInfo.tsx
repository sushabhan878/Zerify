'use client';

import React from 'react';
import { Star, Award, MapPin } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';

interface ProfileMainInfoProps {
  creator: CreatorItem;
}

export default function ProfileMainInfo({ creator }: ProfileMainInfoProps) {
  const defaultAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="space-y-7">
      {/* Creator Identity Header */}
      <div className="flex items-start gap-4">
        <img
          src={creator.avatarUrl || defaultAvatar}
          alt={creator.name}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/15 shadow-md shrink-0"
        />

        <div className="space-y-1.5 min-w-0">
          {/* Name & Star Rating */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {creator.name}
            </h2>
            <div className="flex items-center gap-1 text-sm font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{Number(creator.rating || 5.0).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">·</span>
              <span className="text-slate-300 font-semibold underline underline-offset-2">
                4 Reviews
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{creator.location || 'Garden Grove, CA, United States'}</span>
          </div>

          {/* Social Followers Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {/* Instagram Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/25 text-pink-400 text-xs font-semibold shadow-sm">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>{creator.reach || '1.6k'} Followers</span>
            </span>

            {/* TikTok Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold shadow-sm">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46V12.9a8.28 8.28 0 0 0 5.73 2.25V11.7a4.84 4.84 0 0 1-3.77-1.57A4.85 4.85 0 0 1 19.59 6.69z"/>
              </svg>
              <span>2.6k Followers</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top Creator Rosette Badge */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
        <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/25 shrink-0 mt-0.5">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            {creator.name} is a Top Creator
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 leading-normal">
            Top creators have completed multiple orders and have a high rating from brands.
          </p>
        </div>
      </div>

      {/* Bio Description */}
      <div className="space-y-2">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {creator.bio}
        </p>
      </div>
    </div>
  );
}
