'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Sparkles,
  Send,
  Heart,
  CheckCircle,
  TrendingUp,
  MapPin,
  Globe,
  Award,
  DollarSign,
  PieChart,
  Video,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Calendar,
  Layers,
} from 'lucide-react';
import { CreatorItem } from './CreatorCard';

interface CreatorDetailModalProps {
  creator: CreatorItem | null;
  onClose: () => void;
  onInvite: (creator: CreatorItem) => void;
}

export default function CreatorDetailModal({
  creator,
  onClose,
  onInvite,
}: CreatorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'works' | 'analytics' | 'rates'>('overview');

  if (!creator) return null;

  const mockPastWorks = [
    {
      title: `${creator.category} Product Launch Campaign`,
      brand: 'Aetheria Labs',
      type: 'Dedicated Reel / Video',
      views: '240K',
      likes: '18.4K',
      comments: '890',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'In-Depth Workflow Review & Demo',
      brand: 'CloudScale AI',
      type: 'Integration Video',
      views: '410K',
      likes: '32.1K',
      comments: '1,420',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Sponsored Story Sequence & Link',
      brand: 'NextGen Gear',
      type: 'Story Package',
      views: '95K',
      likes: '8.2K',
      comments: '310',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Sliding Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-50 w-full max-w-xl h-full bg-[#07090F] border-l border-white/10 shadow-2xl flex flex-col justify-between selection:bg-purple-500 selection:text-white"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0A0E18]/90 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/15 shadow-md"
                  />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-2xl ${creator.avatarBg || 'bg-purple-600'} text-white font-black text-xl flex items-center justify-center border-2 border-white/15 shadow-md`}
                  >
                    {creator.name.charAt(0)}
                  </div>
                )}
                {creator.isVerified && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-[#0A0E18] shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 fill-white text-purple-600" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">{creator.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[11px] font-black text-purple-300">
                    {creator.matchScore}% Match
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5" title={creator.location}>
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>
                    {creator.location && creator.location.length > 40
                      ? `${creator.location.slice(0, 40)}...`
                      : creator.location || 'Global'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-300 font-semibold">{creator.category}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              aria-label="Close profile"
              className="p-2.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="px-6 pt-3 pb-1 border-b border-white/5 flex items-center gap-2 shrink-0 bg-[#090C15] overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'works', label: 'Past Works & Portfolio' },
              { id: 'analytics', label: 'Engagement & Stats' },
              { id: 'rates', label: 'Rate Card' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 no-scrollbar">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Line Separated Stats */}
                <div className="grid grid-cols-4 divide-x divide-white/10 py-2.5 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">REACH</span>
                    <span className="text-base font-black text-white">{creator.reach}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">ENG. RATE</span>
                    <span className="text-base font-black text-emerald-400">{creator.engRate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">RATING</span>
                    <span className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {Number(creator.rating || 5.0).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">STARTS AT</span>
                    <span className="text-base font-black text-purple-300">{creator.startingRate}</span>
                  </div>
                </div>

                {/* About Bio */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">About Creator</h4>
                  <p className="leading-relaxed text-slate-300 text-[13px] bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                    {creator.bio}
                  </p>
                </div>

                {/* Niches & Skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Content Niches & Formats</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-xs">
                      {creator.category}
                    </span>
                    {creator.skills?.map((s) => (
                      <span key={s} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-semibold text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Match Reasons */}
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Why Zerify AI Recommends {creator.name}</span>
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-slate-300">
                    {(creator.matchReasons || []).map((reason: any, idx: number) => {
                      const reasonText =
                        typeof reason === 'string'
                          ? reason
                          : reason?.details ||
                            (reason?.criterion ? `${reason.criterion.replace(/_/g, ' ')} verified` : '') ||
                            reason?.description ||
                            'Verified match requirement met';
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{reasonText}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'works' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Verified Portfolio & Past Campaigns</h4>
                <div className="space-y-3">
                  {mockPastWorks.map((work, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-purple-500/30 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                          {work.brand} • {work.type}
                        </span>
                        <h5 className="text-sm font-bold text-white truncate">{work.title}</h5>
                        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1 font-semibold text-white">
                            <Eye className="w-3 h-3 text-slate-500" /> {work.views} views
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <ThumbsUp className="w-3 h-3 text-emerald-500" /> {work.likes}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-400">
                            <MessageSquare className="w-3 h-3 text-slate-500" /> {work.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audience Demographics & Performance</h4>
                
                {/* Age distribution */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-white block">Age Distribution</span>
                  <div className="space-y-2">
                    {[
                      { range: '18–24', pct: 32 },
                      { range: '25–34', pct: 54 },
                      { range: '35–44', pct: 11 },
                      { range: '45+', pct: 3 },
                    ].map((item) => (
                      <div key={item.range} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                          <span>{item.range} years</span>
                          <span>{item.pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Split */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                  <span className="text-xs font-bold text-white block">Audience Gender Split</span>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Female</span>
                      <span className="text-base font-black text-pink-400">62%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Male</span>
                      <span className="text-base font-black text-cyan-400">38%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rates' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Deliverable Packages & Rates</h4>
                <div className="space-y-2.5">
                  {[
                    { format: 'Dedicated 60s Reel / Short', rate: creator.startingRate, desc: 'Includes script, production, 1 revision & 30-day organic rights.' },
                    { format: 'YouTube 60-90s Dedicated Sponsor Segment', rate: `$${creator.rateNumber * 1.5}`, desc: 'Integrated ad read with description link and pinned comment.' },
                    { format: '3-Story Sequence with Direct Link', rate: `$${Math.round(creator.rateNumber * 0.4)}`, desc: '24h story sequence with CTA sticker and tracking link.' },
                    { format: 'Full UGC Video (Whitelisting Included)', rate: `$${creator.rateNumber * 1.2}`, desc: 'Raw high-res file for brand ad accounts with 90-day usage.' },
                  ].map((pkg, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <h5 className="text-xs font-bold text-white">{pkg.format}</h5>
                        <p className="text-[11px] text-slate-400">{pkg.desc}</p>
                      </div>
                      <span className="text-sm font-black text-purple-300 shrink-0">{pkg.rate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-white/10 bg-[#0A0E18] flex items-center gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onInvite(creator);
              }}
              type="button"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition-all active:scale-[0.98] border border-purple-400/20"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Invite to Campaign</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
