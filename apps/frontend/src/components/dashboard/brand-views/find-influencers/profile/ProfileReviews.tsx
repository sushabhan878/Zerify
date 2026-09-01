'use client';

import React from 'react';
import { Star, MessageCircle, Clock, CheckCircle2, ShieldCheck, Quote } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';

interface ProfileReviewsProps {
  creator: CreatorItem;
}

interface ReviewItem {
  id: string;
  author: string;
  avatarLetter: string;
  avatarBg: string;
  orderType: string;
  rating: number;
  date: string;
  comment: string;
}

export default function ProfileReviews({ creator }: ProfileReviewsProps) {
  const reviews: ReviewItem[] = [
    {
      id: 'r1',
      author: 'Yunki Studio',
      avatarLetter: 'Y',
      avatarBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      orderType: '1 TikTok Video (30 Seconds)',
      rating: 5,
      date: 'October 2024',
      comment: `${creator.name} delivered outstanding content ahead of schedule! The hook was super creative and engagement exceeded our targets.`,
    },
    {
      id: 'r2',
      author: 'Aura Lifestyle',
      avatarLetter: 'A',
      avatarBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      orderType: '1 Instagram Photo Feed Post',
      rating: 5,
      date: 'September 2024',
      comment: `Seamless communication and gorgeous aesthetics. Product styling matched our brand guidelines perfectly.`,
    },
    {
      id: 'r3',
      author: 'Velox Athletics',
      avatarLetter: 'V',
      avatarBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      orderType: '1 TikTok Video (30 Seconds)',
      rating: 5,
      date: 'August 2024',
      comment: `${creator.name} left a 5.0 star review. Incredible creator to work with! Turnaround was swift and authentic.`,
    },
    {
      id: 'r4',
      author: 'Glow Botanical',
      avatarLetter: 'G',
      avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      orderType: 'Dedicated 60s Reel / Integration',
      rating: 5,
      date: 'May 2024',
      comment: `High ROI campaign! Prompt turnaround and high quality raw 4K footage delivered. Exceeded our reach expectations.`,
    },
  ];

  return (
    <div className="space-y-8 pt-4">
      {/* 1. Header: Reviews Count & Overall Star Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Brand Reviews
          </h2>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>5.0</span>
            <span className="text-slate-400 font-normal">({reviews.length})</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Verified Brand Collaborations</span>
        </div>
      </div>

      {/* 2. Top Metric Ratings: Communication, Timeliness, Satisfaction in 3 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Communication */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-sm">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Communication</div>
            <div className="text-lg font-black text-white">5.0 / 5.0</div>
          </div>
        </div>

        {/* Timeliness */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-sm">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Timeliness</div>
            <div className="text-lg font-black text-white">5.0 / 5.0</div>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/70 border border-white/10 shadow-sm">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Satisfaction</div>
            <div className="text-lg font-black text-white">5.0 / 5.0</div>
          </div>
        </div>
      </div>

      {/* 3. Balanced 2-Column Responsive Grid of Review Cards spanning Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 pt-1">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/30 transition-all shadow-md flex flex-col justify-between space-y-4 group"
          >
            {/* Header: Author Avatar, Name, Deliverable Tag & Rating */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${rev.avatarBg}`}
                >
                  {rev.avatarLetter}
                </div>

                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-bold text-white leading-tight truncate">
                    {rev.author}
                  </div>
                  <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                    {rev.orderType}
                  </div>
                </div>
              </div>

              {/* Star Rating & Date */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5 text-amber-400 justify-end">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {rev.date}
                </div>
              </div>
            </div>

            {/* Review Comment */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "{rev.comment}"
            </p>

            {/* Bottom Meta Pill */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Deliverable</span>
              </span>
              <span className="text-slate-500">Order completed via Zerify</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
