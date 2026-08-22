'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Sparkles, DollarSign, ExternalLink, Send, CheckCircle, ShieldAlert } from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';

interface ApplicantDetailModalProps {
  application: CampaignApplicationItem | null;
  onClose: () => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
}

export default function ApplicantDetailModal({
  application,
  onClose,
  onSendOffer,
  onShortlist,
  onReject,
}: ApplicantDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!application || !mounted) return null;

  const profile: any = application.profileSnapshot || {};
  const match: any = application.matchSnapshot || { score: 85, eligibility: 'ELIGIBLE', reasons: [] };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h3 className="text-base font-black text-white">{profile.displayName || 'Creator'}</h3>
              <p className="text-xs text-slate-400">
                @{profile.username} • {profile.platform || 'INSTAGRAM'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Match Score & Reasons */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Algorithmic Match & Compatibility
              </span>
              <span className="text-xs font-black text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                {match.score}% Score
              </span>
            </div>

            {match.reasons && match.reasons.length > 0 && (
              <div className="space-y-1.5">
                {match.reasons.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {r.result === 'MATCHED' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-slate-300">
                      <strong className="text-white">{r.criterion}:</strong> {r.details}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal Message */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Application Pitch
            </h4>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {application.applicationMessage || 'No pitch text provided.'}
            </div>
          </div>

          {/* Content Idea & Quote */}
          {application.contentIdea && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Proposed Content Concept
              </h4>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
                {application.contentIdea}
              </div>
            </div>
          )}

          {/* Commercial Terms Quote */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Proposed Compensation:</span>
            <span className="text-base font-black text-emerald-400">
              {application.proposedAmount
                ? `${application.proposedCurrency || 'USD'} $${application.proposedAmount}`
                : 'Flexible / Standard Rate'}
            </span>
          </div>

          {/* Portfolio Links */}
          {application.portfolioUrls && application.portfolioUrls.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Relevant Past Work & Portfolio Links
              </h4>
              <div className="space-y-1.5">
                {application.portfolioUrls.map((url: string, idx: number) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-950 border border-white/5 hover:border-purple-500/40 text-xs text-purple-400 flex items-center justify-between transition-colors"
                  >
                    <span className="truncate pr-2">{url}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onReject(application.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-bold text-slate-400 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => {
                onShortlist(application.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-xs font-bold text-indigo-300 hover:text-white border border-indigo-500/40 transition-all"
            >
              Shortlist
            </button>
          </div>

          <button
            onClick={() => {
              onSendOffer(application);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-black text-white flex items-center gap-1.5 shadow-md transition-all"
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

