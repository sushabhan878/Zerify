'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import {
  X,
  Sparkles,
  ExternalLink,
  Send,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { mapApplicationToCreator } from './mapApplicationToCreator';

interface ApplicantDetailModalProps {
  application: CampaignApplicationItem | null;
  onClose: () => void;
  onViewProfile?: (creator: CreatorItem) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
}

export default function ApplicantDetailModal({
  application,
  onClose,
  onViewProfile,
  onSendOffer,
  onShortlist,
  onReject,
}: ApplicantDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const creatorItem = useMemo(() => {
    return application ? mapApplicationToCreator(application) : null;
  }, [application]);

  if (!application || !mounted || !creatorItem) return null;

  const match: any = application.matchSnapshot || { score: 100, eligibility: 'ELIGIBLE', reasons: [] };

  const handleOpenCreatorProfile = () => {
    onClose();
    if (onViewProfile) {
      onViewProfile(creatorItem);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-2xl bg-[#090D16] border border-purple-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl p-6 sm:p-8 space-y-6 relative"
      >
        {/* Top Header: In-Platform Creator Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            {/* Profile Picture (84px) - Clickable to open in-platform profile */}
            <button
              type="button"
              onClick={handleOpenCreatorProfile}
              title={`View ${creatorItem.name}'s platform profile`}
              className="relative shrink-0 block group/avatar cursor-pointer text-left"
            >
              <div className="w-20 h-20 sm:w-[84px] sm:h-[84px] rounded-2xl overflow-hidden border-2 border-purple-500/40 group-hover/avatar:border-purple-400 bg-slate-950 flex items-center justify-center text-white font-black shadow-xl shadow-purple-950/50 transition-all group-hover/avatar:scale-105">
                {creatorItem.avatarUrl && !imageError ? (
                  <img
                    src={creatorItem.avatarUrl}
                    alt={creatorItem.name}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white font-black text-2xl shadow-inner select-none">
                    {creatorItem.name ? creatorItem.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center border-2 border-[#090D16] shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 fill-white text-purple-600" />
              </span>
            </button>

            {/* Creator Name, In-Platform Badge & Niches */}
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={handleOpenCreatorProfile}
                  title={`View ${creatorItem.name}'s platform profile`}
                  className="inline-flex items-center gap-2 min-w-0 group/name cursor-pointer max-w-full text-left"
                >
                  <h3 className="text-2xl sm:text-3xl font-black text-white group-hover/name:text-purple-300 tracking-tight leading-tight truncate transition-colors">
                    {creatorItem.name}
                  </h3>
                  <span className="p-1 rounded-lg bg-purple-500/10 group-hover/name:bg-purple-500/25 border border-purple-500/20 text-purple-400 group-hover/name:text-purple-300 transition-all flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4 group-hover/name:translate-x-0.5 group-hover/name:-translate-y-0.5 transition-transform" />
                  </span>
                </button>
              </div>

              {/* In-Platform Creator Details & View Full Profile Button */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleOpenCreatorProfile}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>View Full Platform Profile</span>
                </button>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Creator</span>
                </span>
              </div>

              {/* Niches Tags */}
              <div className="flex items-center gap-1.5 flex-nowrap min-w-0 pt-0.5">
                {(creatorItem.categories || [creatorItem.category]).slice(0, 2).map((n) => (
                  <span
                    key={n}
                    className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-900/90 border border-white/10 text-[11px] font-semibold text-slate-300 shadow-sm shrink-0"
                  >
                    {n}
                  </span>
                ))}
                {(creatorItem.categories || [creatorItem.category]).length > 2 && (
                  <span
                    className="text-slate-400 text-xs font-black tracking-widest px-0.5 select-none shrink-0"
                    title={(creatorItem.categories || [creatorItem.category]).slice(2).join(', ')}
                  >
                    ...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Match Score Badge */}
          <div className="flex items-center shrink-0">
            <div className="px-3.5 py-1.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center gap-1.5 text-xs font-black text-purple-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>{match.score || 100}% Match</span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body with Hidden Scrollbar */}
        <div
          className="overflow-y-auto space-y-5 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5"
        >
          {/* Application Pitch */}
          <div className="space-y-1">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Application Pitch
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {application.applicationMessage || 'No pitch text provided.'}
            </p>
          </div>

          {/* Proposed Content Concept */}
          {application.contentIdea && (
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Proposed Content Concept
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {application.contentIdea}
              </p>
            </div>
          )}

          {/* Proposed Compensation */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-bold text-slate-400">
              Proposed Compensation:
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400 tracking-tight">
              {application.proposedAmount
                ? `${application.proposedCurrency || 'USD'} $${Number(application.proposedAmount).toLocaleString()}`
                : 'Flexible / Standard Rate'}
            </span>
          </div>

          {/* Relevant Past Work & Portfolio Links */}
          {application.portfolioUrls && application.portfolioUrls.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Relevant Past Work & Portfolio Links
              </h4>
              <div className="space-y-1.5">
                {application.portfolioUrls.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 hover:underline transition-all group font-medium"
                  >
                    <span className="truncate">{url}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Seamless in same container without dark background or divider line */}
        <div className="flex items-center justify-between pt-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                onReject(application.id);
                onClose();
              }}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-bold text-slate-400 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={() => {
                onShortlist(application.id);
                onClose();
              }}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-xs font-bold text-indigo-300 hover:text-white border border-indigo-500/35 transition-all cursor-pointer"
            >
              Shortlist
            </button>
          </div>

          <button
            onClick={() => {
              onSendOffer(application);
              onClose();
            }}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-purple-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Collaboration Offer</span>
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
