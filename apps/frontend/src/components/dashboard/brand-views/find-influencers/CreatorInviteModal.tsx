'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check, Loader2, AlertCircle } from 'lucide-react';
import { CreatorItem } from './CreatorCard';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import { OfferService } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';
import CampaignSelectDropdown from './invite/CampaignSelectDropdown';
import {
  getInvitedCampaignIdsForCreator,
  recordCampaignInvite,
} from './invite/invitationTracker';

interface CreatorInviteModalProps {
  creator: CreatorItem | null;
  onClose: () => void;
}

export default function CreatorInviteModal({ creator, onClose }: CreatorInviteModalProps) {
  const { currency, symbol, convert } = useCurrency();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [proposedBudget, setProposedBudget] = useState<string>(() => {
    const rawRate = creator?.rateNumber || 250;
    return String(Math.round(convert(rawRate, 'USD')));
  });
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Sync invited campaign IDs for this creator from DB + localStorage
  useEffect(() => {
    if (creator?.id) {
      const persisted = getInvitedCampaignIdsForCreator(creator.id);
      const fromCreator = (creator as any).invitedCampaignIds || [];
      const initial = Array.from(new Set([...persisted, ...fromCreator]));
      setInvitedIds(initial);

      // Fetch from database
      OfferService.getInvitedCampaignIds(creator.id)
        .then((dbInvited) => {
          if (Array.isArray(dbInvited) && dbInvited.length > 0) {
            setInvitedIds((prev) => Array.from(new Set([...prev, ...dbInvited])));
          }
        })
        .catch(() => {});
    }
  }, [creator]);

  useEffect(() => {
    CampaignService.getBrandCampaigns()
      .then((data) => {
        if (data && data.length > 0) {
          // Strictly filter for active campaigns only (ACTIVE, OPEN, FILLING)
          const activeCampaigns = data.filter(
            (c) => c.status === 'ACTIVE' || c.status === 'OPEN' || c.status === 'FILLING'
          );
          setCampaigns(activeCampaigns);
          // Pick the first active campaign that hasn't already been invited
          const firstAvailable = activeCampaigns.find((c) => !invitedIds.includes(c.id)) || null;
          setSelectedCampaign(firstAvailable || activeCampaigns[0] || null);
        } else {
          setCampaigns([]);
          setSelectedCampaign(null);
        }
      })
      .catch(() => {
        setCampaigns([]);
        setSelectedCampaign(null);
      });
  }, [invitedIds]);

  if (!creator) return null;

  const handleSend = async () => {
    if (!selectedCampaign || !creator) return;

    setIsSending(true);
    setSendError(null);
    try {
      // Call backend API to persist offer in the PostgreSQL database
      await OfferService.inviteCreatorToCampaign(selectedCampaign.id, {
        influencerProfileId: creator.id,
        compensationAmount: Number(proposedBudget) || 250,
        compensationCurrency: currency || 'USD',
        customNotes: message.trim() || undefined,
      });

      // Also record in local registry
      recordCampaignInvite(creator.id, selectedCampaign.id);
      setInvitedIds((prev) => [...prev, selectedCampaign.id]);

      // Trigger instantaneous live refresh for any open campaign dashboards
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('zerify_offers_updated'));
      }

      setIsSending(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    } catch (err: any) {
      setIsSending(false);
      setSendError(err.message || 'Failed to send invitation. Please try again.');
    }
  };

  const isSelectedAlreadyInvited = Boolean(
    selectedCampaign && invitedIds.includes(selectedCampaign.id)
  );

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-50 w-full max-w-md bg-[#0c091f]/95 border border-purple-500/20 rounded-2xl shadow-2xl p-6 space-y-4 backdrop-blur-2xl overflow-hidden"
        >
          {/* Subtle Top Glow Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent blur-xs pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Invite {creator.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Send an official brand collaboration invitation
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-bold text-white">Invitation Sent!</h4>
              <p className="text-xs text-slate-400">
                {creator.name} has been notified with your offer for{' '}
                <span className="text-purple-300 font-semibold">{selectedCampaign?.title}</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Field 1: Select Target Campaign (Custom Dropdown with Already Invited validation) */}
              <CampaignSelectDropdown
                campaigns={campaigns}
                selectedCampaign={selectedCampaign}
                onSelect={(c) => setSelectedCampaign(c)}
                invitedCampaignIds={invitedIds}
              />

              {/* Field 2: Proposed Deliverable Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Proposed Deliverable Budget ({symbol} {currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 select-none">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    value={proposedBudget}
                    onChange={(e) => setProposedBudget(e.target.value)}
                    placeholder={currency === 'INR' ? 'e.g. 50000' : 'e.g. 250'}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 3: Custom Message / Brief */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Custom Message / Brief
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${creator.name}, we love your recent content and would love to collaborate on our upcoming launch!`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none transition-colors leading-relaxed"
                />
              </div>

              {/* Error Message if Send Fails */}
              <AnimatePresence>
                {sendError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="flex-1">{sendError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center justify-end gap-2.5">
                <button
                  onClick={onClose}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || !selectedCampaign || isSelectedAlreadyInvited}
                  type="button"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/50 hover:shadow-purple-600/30 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
