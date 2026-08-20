'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Gift,
  Check,
  AlertTriangle,
  Send,
  Video,
  ExternalLink,
  Users,
  Target,
} from 'lucide-react';
import { CampaignItem } from './CampaignCard';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignItem | null;
  onApply: (campaign: CampaignItem) => void;
}

export default function CampaignDetailModal({
  isOpen,
  onClose,
  campaign,
  onApply,
}: CampaignDetailModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !campaign || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header Banner */}
          <div className="relative h-28 sm:h-32 w-full overflow-hidden shrink-0">
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="w-full h-full object-cover brightness-[0.4]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

            <button
              onClick={onClose}
              type="button"
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Logo & Basic Info Over Banner */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-white/20 overflow-hidden shadow-lg shrink-0">
                  <img
                    src={campaign.brandLogo}
                    alt={campaign.brandName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">{campaign.brandName}</h4>
                    {campaign.isVerifiedBrand && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-purple-300 font-semibold">{campaign.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/80 border border-purple-500/40 text-xs font-bold text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{campaign.matchScore}% Match</span>
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-300 no-scrollbar">
            {/* Title & Description */}
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-snug mb-2">
                {campaign.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {campaign.description}
              </p>
            </div>

            {/* Key Deal Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Compensation
                </span>
                <span className="text-sm font-black text-white block">{campaign.payoutAmount}</span>
                <span className="text-[10px] text-purple-400 font-medium">{campaign.payoutModel}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Spots Available
                </span>
                <span className="text-sm font-black text-white block">
                  {campaign.slotsTotal - campaign.slotsFilled} left
                </span>
                <span className="text-[10px] text-slate-400">{campaign.slotsTotal} total slots</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                  Application Deadline
                </span>
                <span className="text-sm font-black text-amber-400 block">
                  {campaign.daysRemaining} days remaining
                </span>
                <span className="text-[10px] text-slate-400">{campaign.deadline}</span>
              </div>
            </div>

            {/* Required Deliverables */}
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-400" />
                <span>Required Deliverables</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campaign.deliverables.map((del, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-semibold text-white">{del}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Guidelines: Dos & Don'ts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Key Dos & Brand Requirements</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {campaign.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Strict Don&apos;ts & Exclusions</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {campaign.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Escrow Guarantee Box */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Zerify 100% Escrow Protection Guaranteed
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  100% of the campaign budget is pre-funded into smart escrow before deliverables begin. Payout is released automatically upon brief milestone verification.
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTA Bar */}
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-slate-950/60 shrink-0">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
            >
              Close Brief
            </button>

            <button
              onClick={() => {
                onClose();
                onApply(campaign);
              }}
              type="button"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-950/50 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply & Submit Pitch</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
