'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Link as LinkIcon,
  Clock,
  Gift,
  Check,
  ChevronDown,
} from 'lucide-react';
import { CampaignItem } from './CampaignCard';
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/context/CurrencyContext';

interface CampaignPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignItem | null;
  onSuccess?: () => void;
}

const TIMELINE_OPTIONS = [
  { value: '3', label: 'Within 3 days of product receipt / brief' },
  { value: '5', label: 'Within 5 days of product receipt / brief' },
  { value: '7', label: 'Within 7 days of product receipt / brief' },
  { value: '14', label: 'Within 14 days of product receipt / brief' },
];

export default function CampaignPitchModal({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}: CampaignPitchModalProps) {
  const { toastSuccess, toastError } = useToast();
  const { currency: userCurrency, symbol } = useCurrency();
  const [mounted, setMounted] = useState(false);

  const [proposedRate, setProposedRate] = useState('');
  const [pitchMessage, setPitchMessage] = useState('');
  const [contentIdea, setContentIdea] = useState('');
  const [sampleLink, setSampleLink] = useState('');
  const [turnaroundDays, setTurnaroundDays] = useState('5');
  const [isTimelineDropdownOpen, setIsTimelineDropdownOpen] = useState(false);
  const [needsShipping, setNeedsShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form with clean placeholders whenever modal opens for a campaign
  useEffect(() => {
    if (isOpen) {
      setProposedRate('');
      setPitchMessage('');
      setContentIdea('');
      setSampleLink('');
      setTurnaroundDays('5');
      setIsTimelineDropdownOpen(false);
      setNeedsShipping(true);
    }
  }, [isOpen, campaign]);

  if (!isOpen || !campaign || !mounted) return null;

  const isRupee = userCurrency === 'INR';
  const currencySymbol = symbol;
  const currencyLabel = `${symbol} ${userCurrency}`;

  const handleGenerateAiPitch = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      const delName = campaign.deliverables[0] || 'reel';
      const aiPitch = `Excited to partner on this campaign! My audience loves high-retention tech & lifestyle storytelling. I'll deliver engaging ${delName} with strong organic hooks and clear CTA.`;
      const aiConcept = `High-energy product unboxing & authentic workflow review showcasing 3 core benefits with seamless b-roll and custom music pacing.`;
      setPitchMessage(aiPitch.slice(0, 300));
      setContentIdea(aiConcept.slice(0, 300));
      setIsGeneratingAi(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Find connected social account
      let socialAccountId = '';
      const cached = typeof window !== 'undefined' ? localStorage.getItem('zerify_social_accounts_cache') : null;
      if (cached) {
        try {
          const accounts = JSON.parse(cached);
          if (Array.isArray(accounts) && accounts.length > 0) {
            socialAccountId = accounts[0].id;
          }
        } catch (_) {}
      }

      const { ApplicationService } = await import('@/services/application.service');
      await ApplicationService.applyToCampaign(campaign.id, {
        socialAccountId: socialAccountId || '00000000-0000-0000-0000-000000000000',
        proposedAmount: Number(proposedRate) || undefined,
        applicationMessage: pitchMessage.slice(0, 300),
        contentIdea: contentIdea.slice(0, 300) || pitchMessage.slice(0, 300),
        portfolioUrls: sampleLink ? [sampleLink] : [],
      });

      toastSuccess(`Application submitted to ${campaign.brandName}! They will review your proposal shortly.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTimelineObj = TIMELINE_OPTIONS.find((o) => o.value === turnaroundDays) || TIMELINE_OPTIONS[1];

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-slate-950/95 border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/50 overflow-hidden flex flex-col z-10 backdrop-blur-2xl"
        >
          {/* Floating Close Button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-5 right-5 z-20 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-purple-500/20 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4 text-xs no-scrollbar">
            {/* Header Title with AI Enhance */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="text-base font-black text-white">Apply to Campaign</h3>
                <p className="text-[11px] text-slate-400">Pitch to <strong className="text-purple-300">{campaign.brandName}</strong></p>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiPitch}
                disabled={isGeneratingAi}
                className="text-[11px] text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 hover:border-purple-400/50 transition-all shadow-sm mr-8"
              >
                <Sparkles className={`w-3 h-3 text-purple-300 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Drafting...' : 'AI Enhance Pitch'}</span>
              </button>
            </div>

            {/* Proposed Rate */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Your Proposed Fee ({currencyLabel})
              </label>
              <div className="relative">
                <span className="w-5 h-5 flex items-center justify-center text-purple-400 font-black text-sm absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  required
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder={isRupee ? 'e.g. 50,000' : 'e.g. 1,500'}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 font-bold transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-400 block pt-0.5">
                Brand budget guide: <strong className="text-purple-300 font-bold">{campaign.payoutAmount}</strong>
              </span>
            </div>

            {/* 1. Application Pitch (300 Char Limit) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Application Pitch
                </label>
                <span className={`text-[10.5px] font-semibold ${pitchMessage.length >= 280 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {pitchMessage.length}/300
                </span>
              </div>
              <textarea
                rows={3}
                required
                maxLength={300}
                value={pitchMessage}
                onChange={(e) => setPitchMessage(e.target.value)}
                placeholder="Briefly state why you're a great fit for this campaign (max 300 characters)..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* 2. Proposed Content Concept (300 Char Limit) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Proposed Content Concept
                </label>
                <span className={`text-[10.5px] font-semibold ${contentIdea.length >= 280 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {contentIdea.length}/300
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={contentIdea}
                onChange={(e) => setContentIdea(e.target.value)}
                placeholder="Describe the format, hooks, storytelling flow, or deliverables concept (max 300 characters)..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none leading-relaxed transition-colors"
              />
            </div>

            {/* Sample Link */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Past Relevant Content / Reel Link <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="url"
                  value={sampleLink}
                  onChange={(e) => setSampleLink(e.target.value)}
                  placeholder="https://instagram.com/reel/... or https://youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
            </div>

            {/* Custom Delivery Timeline Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Delivery Timeline
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsTimelineDropdownOpen(!isTimelineDropdownOpen)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 text-xs text-white focus:outline-none focus:border-purple-400 transition-colors flex items-center justify-between text-left"
                >
                  <Clock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <span className="font-semibold text-slate-200">{selectedTimelineObj.label}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTimelineDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isTimelineDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border border-purple-500/30 rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 backdrop-blur-2xl">
                    {TIMELINE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setTurnaroundDays(opt.value);
                          setIsTimelineDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                          turnaroundDays === opt.value
                            ? 'bg-purple-500/20 text-purple-200 font-bold border border-purple-500/30'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {turnaroundDays === opt.value && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Interactive Free Product Checkbox */}
            {campaign.hasFreeProduct && (
              <div
                onClick={() => setNeedsShipping(!needsShipping)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  needsShipping
                    ? 'bg-purple-950/30 border-purple-500/40 shadow-sm'
                    : 'bg-slate-900/40 border-purple-500/15 hover:border-purple-500/30'
                }`}
              >
                {/* Custom Checkbox Indicator */}
                <div
                  className={`w-5 h-5 rounded-lg border shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                    needsShipping
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-400 text-white shadow-sm'
                      : 'border-slate-600 bg-slate-900'
                  }`}
                >
                  {needsShipping && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-purple-300" />
                    <span>Confirm Free Product Delivery</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-relaxed">
                    Product sample will be dispatched to your verified creator shipping address upon brand acceptance.
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Campaign Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
