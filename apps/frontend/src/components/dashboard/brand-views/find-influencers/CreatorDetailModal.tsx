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
  Eye,
  TrendingUp,
  MapPin,
  Globe,
  Award,
  DollarSign,
  PieChart,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'rates'>('overview');

  if (!creator) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Sliding Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-50 w-full max-w-lg h-full bg-slate-950 border-l border-white/10 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${creator.avatarBg || 'bg-purple-600'} text-white font-black text-lg flex items-center justify-center border border-white/20 shadow-md`}
              >
                {creator.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-black text-white">{creator.name}</h3>
                  {creator.isVerified && <CheckCircle className="w-4 h-4 text-purple-400" />}
                </div>
                <span className="text-xs text-purple-400 font-semibold">{creator.handle}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="px-5 pt-3 pb-1 border-b border-white/5 flex items-center gap-2 shrink-0 bg-slate-950">
            {[
              { id: 'overview', label: 'Creator Profile' },
              { id: 'audience', label: 'Audience & Demographics' },
              { id: 'rates', label: 'Media Kit & Rates' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 text-slate-200">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* AI Match Reasons */}
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Compatibility Assessment
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-xs">
                      {creator.matchScore}% Match
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {creator.matchReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Reach</span>
                    <span className="text-base font-black text-white">{creator.reach}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg. Engagement</span>
                    <span className="text-base font-black text-emerald-400">{creator.engRate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Creator Rating</span>
                    <span className="text-base font-black text-amber-400 flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {creator.rating}
                    </span>
                  </div>
                </div>

                {/* Bio & Niche */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Creator</h4>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                    {creator.bio}
                  </p>
                </div>

                {/* Skills & Formats */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Formats</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {creator.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audience' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-purple-400" />
                    Audience Demographics Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">Top Age Bracket</span>
                      <span className="font-black text-white">{creator.topAudienceAge || '25-34 (62%)'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">Gender Ratio</span>
                      <span className="font-black text-white">{creator.topAudienceGender || '68% Female / 32% Male'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold">Top Geography</span>
                    <span className="font-bold text-slate-200">United States (54%), UK (22%), Canada (14%)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rates' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Estimated Rate Card
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="font-semibold text-slate-300">Dedicated Video (YouTube)</span>
                      <span className="font-black text-white">$1,500 - $2,500</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="font-semibold text-slate-300">Reel / TikTok Integration</span>
                      <span className="font-black text-white">$650 - $950</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="font-semibold text-slate-300">Story Series (3 Frames)</span>
                      <span className="font-black text-white">$350 - $500</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 flex items-center gap-3 bg-slate-950 shrink-0">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onInvite(creator);
              }}
              type="button"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invite to Campaign</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
