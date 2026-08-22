'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  DollarSign,
  Link as LinkIcon,
  Clock,
  Gift,
  CheckCircle,
} from 'lucide-react';
import { CampaignItem } from './CampaignCard';
import { useToast } from '@/components/ui/Toast';

interface CampaignPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignItem | null;
  onSuccess?: () => void;
}

export default function CampaignPitchModal({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}: CampaignPitchModalProps) {
  const { toastSuccess, toastError } = useToast();
  const [mounted, setMounted] = useState(false);

  const [proposedRate, setProposedRate] = useState('');
  const [pitchMessage, setPitchMessage] = useState('');
  const [sampleLink, setSampleLink] = useState('');
  const [turnaroundDays, setTurnaroundDays] = useState('5');
  const [needsShipping, setNeedsShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (campaign) {
      setProposedRate(campaign.payoutAmount.split('–')[0].replace(/[^0-9]/g, '') || '500');
      setPitchMessage(
        `Hi ${campaign.brandName} team! I love your brand and would create an engaging, high-conversion ${campaign.deliverables[0] || 'deliverable'} demonstrating real results to my audience.`
      );
    }
  }, [campaign]);

  if (!isOpen || !campaign || !mounted) return null;

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
        applicationMessage: pitchMessage,
        portfolioUrls: sampleLink ? [sampleLink] : [],
        contentIdea: pitchMessage,
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
          className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0">
                <img
                  src={campaign.brandLogo}
                  alt={campaign.brandName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Apply to Campaign</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-xs">{campaign.title}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs no-scrollbar">
            {/* Proposed Rate */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Your Proposed Fee ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  placeholder="500"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>
              <span className="text-[10.5px] text-slate-500 mt-1 block">
                Brand budget guide: {campaign.payoutAmount}
              </span>
            </div>

            {/* Custom Pitch Note */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Creative Pitch & Concept
                </label>
                <span className="text-[10.5px] text-purple-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Enhanced
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={pitchMessage}
                onChange={(e) => setPitchMessage(e.target.value)}
                placeholder="Share your creative angle, script idea, or why you're a great fit for this campaign..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              />
            </div>

            {/* Sample Link */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Past Relevant Content / Reel Link (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={sampleLink}
                  onChange={(e) => setSampleLink(e.target.value)}
                  placeholder="https://instagram.com/reel/xyz or youtube.com/watch?v=xyz"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Turnaround Time */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Delivery Timeline
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={turnaroundDays}
                  onChange={(e) => setTurnaroundDays(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="3">Within 3 days of product receipt</option>
                  <option value="5">Within 5 days of product receipt</option>
                  <option value="7">Within 7 days of product receipt</option>
                  <option value="14">Within 14 days of product receipt</option>
                </select>
              </div>
            </div>

            {/* Shipping Checkbox */}
            {campaign.hasFreeProduct && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsShipping}
                  onChange={(e) => setNeedsShipping(e.target.checked)}
                  className="rounded border-white/20 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Gift className="w-3.5 h-3.5 text-purple-400" />
                    <span>Confirm Free Product Delivery</span>
                  </span>
                  <span className="text-[10.5px] text-slate-400 block">
                    Product will be shipped to your verified account address upon brand acceptance.
                  </span>
                </div>
              </label>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
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
