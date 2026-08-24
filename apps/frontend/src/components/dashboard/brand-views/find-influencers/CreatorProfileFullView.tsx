'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Sparkles,
  Send,
  Heart,
  CheckCircle,
  MapPin,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Calendar,
  Layers,
  ShieldCheck,
  Zap,
  Clock,
  TrendingUp,
  Award,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { CreatorItem } from './CreatorCard';

interface CreatorProfileFullViewProps {
  creator: CreatorItem;
  onBack: () => void;
  onInvite: (creator: CreatorItem) => void;
  onToggleBookmark: (creatorId: string) => void;
}

export default function CreatorProfileFullView({
  creator,
  onBack,
  onInvite,
  onToggleBookmark,
}: CreatorProfileFullViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'analytics' | 'rates'>('overview');
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  const categoryList =
    creator.categories && creator.categories.length > 0
      ? creator.categories
      : [creator.category];

  const handleHeartClick = async () => {
    setIsLiking(true);
    setTimeout(() => setIsLiking(false), 400);
    onToggleBookmark(creator.id);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      await fetch(`${apiUrl}/brand/saved-creators/${creator.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.warn('Could not persist bookmark to DB:', err);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mockPastWorks = [
    {
      title: `${creator.category} Flagship Campaign`,
      brand: 'Aetheria Labs',
      type: 'Dedicated 60s Reel / Video',
      views: '340K',
      likes: '24.8K',
      comments: '1,240',
      roi: '4.2x ROI',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Workflow Integration & Deep Teardown',
      brand: 'Pulse AI Studios',
      type: 'Sponsored Video Segment',
      views: '512K',
      likes: '39.4K',
      comments: '2,180',
      roi: '5.8x ROI',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Organic Conversion & Story Sequence',
      brand: 'Hyperion Gear',
      type: 'Multi-Story Package',
      views: '128K',
      likes: '11.6K',
      comments: '430',
      roi: '3.9x ROI',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-6 pb-16"
    >
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-purple-500/30 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400" />
          <span>Back to Influencer Discovery</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Find Influencers</span>
          <span>/</span>
          <span className="text-purple-300 font-bold">{creator.name}</span>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090D16]/95 border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Identity Info */}
          <div className="flex items-center gap-5 sm:gap-6 min-w-0">
            <div className="relative shrink-0">
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-white/20 shadow-xl"
                />
              ) : (
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl ${creator.avatarBg || 'bg-purple-600'} text-white font-black text-3xl flex items-center justify-center border-2 border-white/20 shadow-xl`}
                >
                  {creator.name.charAt(0)}
                </div>
              )}
              {creator.isVerified && (
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-[#090D16] shadow-md">
                  <CheckCircle className="w-4 h-4 fill-white text-purple-600" />
                </span>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{creator.name}</h1>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/35 text-xs font-black text-purple-300 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  {creator.matchScore}% Match
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Creator
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {creator.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Avg Response: &lt; 2 hrs
                </span>
              </div>

              {/* All Niches */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {categoryList.map((cat) => (
                  <span
                    key={cat}
                    className="inline-block px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 shadow-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleShare}
              type="button"
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all relative"
              title="Share profile link"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-purple-600 text-[10px] text-white font-bold whitespace-nowrap shadow-md">
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={handleHeartClick}
              type="button"
              aria-label="Save creator"
              className={`p-3.5 rounded-2xl border transition-all duration-300 ${creator.isBookmarked
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/30'
                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-rose-400'
                } ${isLiking ? 'scale-125' : ''}`}
            >
              <Heart className={`w-4 h-4 ${creator.isBookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => onInvite(creator)}
              type="button"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-black flex items-center gap-2 shadow-xl shadow-purple-950/60 border border-purple-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Invite to Campaign</span>
            </button>
          </div>
        </div>

        {/* 4 Line Separated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 pt-6 border-t border-white/10 text-center gap-y-4 md:gap-y-0">
          <div className="px-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">TOTAL REACH</span>
            <span className="text-2xl sm:text-3xl font-black text-white">{creator.reach}</span>
          </div>
          <div className="px-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">ENG. RATE</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{creator.engRate}</span>
          </div>
          <div className="px-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">RATING</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 flex items-center justify-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              {Number(creator.rating || 5.0).toFixed(1)}
            </span>
          </div>
          <div className="px-4">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">STARTS AT</span>
            <span className="text-2xl sm:text-3xl font-black text-purple-300">{creator.startingRate}</span>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Bio' },
          { id: 'portfolio', label: 'Past Campaigns & Portfolio' },
          { id: 'analytics', label: 'Audience Demographics' },
          { id: 'rates', label: 'Deliverable Rate Cards' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            type="button"
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 ${activeTab === tab.id
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-950/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panes */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Bio & AI Matching */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">About the Creator</h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                {creator.bio}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-purple-950/20 border border-purple-500/25 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-purple-300 font-black text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Zerify AI Match Breakdown ({creator.matchScore}% Compatibility)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {creator.matchReasons.map((reason, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <p className="text-xs text-slate-300 leading-normal">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Quick Facts & Socials */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Connected Platforms</h3>
              <div className="space-y-3">
                {creator.platforms.map((plat) => (
                  <div
                    key={plat}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-white">{plat}</span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Connected
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockPastWorks.map((work, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-[#090D16]/90 border border-white/10 overflow-hidden shadow-xl hover:border-purple-500/40 transition-all group flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-black text-purple-300">
                    {work.roi}
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                      {work.brand} • {work.type}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {work.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-white font-semibold">
                      <Eye className="w-3.5 h-3.5 text-slate-500" /> {work.views}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ThumbsUp className="w-3.5 h-3.5" /> {work.likes}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" /> {work.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Age Distribution</h3>
            <div className="space-y-3">
              {[
                { range: '18–24 years', pct: 34 },
                { range: '25–34 years', pct: 52 },
                { range: '35–44 years', pct: 10 },
                { range: '45+ years', pct: 4 },
              ].map((item) => (
                <div key={item.range} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>{item.range}</span>
                    <span className="font-bold text-purple-300">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Audience Gender Split</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Female Audience</span>
                <span className="text-2xl font-black text-pink-400 block">62%</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Male Audience</span>
                <span className="text-2xl font-black text-cyan-400 block">38%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              format: 'Dedicated 60s Reel / Short',
              rate: creator.startingRate,
              desc: 'High-production 60-second vertical video with branded hook, product demo, call to action, and 30-day organic usage rights.',
            },
            {
              format: 'YouTube Sponsored Segment',
              rate: `$${creator.rateNumber * 1.5}`,
              desc: '60–90 second integrated sponsorship read in an upcoming long-form video with pinned comment and link in bio.',
            },
            {
              format: '3-Story Sequence with Direct Link',
              rate: `$${Math.round(creator.rateNumber * 0.4)}`,
              desc: '3 sequential interactive story frames with swipe-up/link sticker, discount promo code, and analytics report.',
            },
            {
              format: 'Full UGC Video Package (Whitelisting Included)',
              rate: `$${creator.rateNumber * 1.2}`,
              desc: 'High-res raw deliverables tailored for paid TikTok & Meta ad campaigns with 90-day creator licensing included.',
            },
          ].map((pkg, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{pkg.format}</h4>
                  <span className="text-lg font-black text-purple-300">{pkg.rate}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{pkg.desc}</p>
              </div>

              <button
                onClick={() => onInvite(creator)}
                type="button"
                className="w-full py-3 rounded-2xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-xs font-black text-purple-200 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Book / Invite with this Package</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
