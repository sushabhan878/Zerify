'use client';

import React from 'react';
import { Star, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
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
      comment: `${creator.name} left a 5.0 star review. Incredible creator to work with!`,
    },
    {
      id: 'r4',
      author: 'Glow Botanical',
      avatarLetter: 'G',
      avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      orderType: 'Dedicated 60s Reel / Integration',
      rating: 5,
      date: 'May 2024',
      comment: `High ROI campaign! Prompt turnaround and high quality raw 4K footage delivered.`,
    },
  ];

  return (
    <div className="space-y-7 pt-6 border-t border-white/10">
      {/* 1. Header: Reviews Count & Overall Star Rating */}
      <div className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        <span>4 Reviews</span>
        <span className="text-slate-500 font-normal">·</span>
        <div className="flex items-center gap-1.5 text-amber-400">
          <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          <span>5.0</span>
        </div>
      </div>

      {/* 2. Top Metric Ratings: Communication, Timeliness, Satisfaction */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Communication */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Communication</div>
            <div className="text-base font-black text-white">5.0</div>
          </div>
        </div>

        {/* Timeliness */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Timeliness</div>
            <div className="text-base font-black text-white">5.0</div>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 shadow-sm">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Satisfaction</div>
            <div className="text-base font-black text-white">5.0</div>
          </div>
        </div>
      </div>

      {/* 3. List of Individual Brand Reviews */}
      <div className="space-y-6 pt-2">
        {reviews.map((rev) => (
          <div key={rev.id} className="space-y-2.5">
            {/* Reviewer Header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${rev.avatarBg}`}
              >
                {rev.avatarLetter}
              </div>

              <div>
                <div className="text-sm sm:text-base font-bold text-white leading-tight">
                  {rev.author}
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {rev.orderType}
                </div>
              </div>
            </div>

            {/* Stars & Date */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-medium">{rev.date}</span>
            </div>

            {/* Comment */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {rev.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
