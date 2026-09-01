'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check, DollarSign, Megaphone, Loader2 } from 'lucide-react';
import { CreatorItem } from './CreatorCard';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import { useCurrency } from '@/context/CurrencyContext';

interface CreatorInviteModalProps {
  creator: CreatorItem | null;
  onClose: () => void;
}

export default function CreatorInviteModal({ creator, onClose }: CreatorInviteModalProps) {
  const { currency, symbol, convert } = useCurrency();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [proposedBudget, setProposedBudget] = useState<string>(() => {
    const rawRate = creator?.rateNumber || 250;
    return String(Math.round(convert(rawRate, 'USD', currency)));
  });
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    CampaignService.getBrandCampaigns()
      .then((data) => {
        if (data && data.length > 0) {
          setCampaigns(data);
          setSelectedCampaignId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  if (!creator) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }, 800);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-50 w-full max-w-md bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Invite {creator.name}</h3>
              <p className="text-xs text-slate-400">Send an official brand collaboration invitation</p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Invitation Sent!</h4>
              <p className="text-xs text-slate-400">{creator.name} has been notified with your offer.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Campaign Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Select Target Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                >
                  {campaigns.length > 0 ? (
                    campaigns.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-950 text-white">
                        {c.title}
                      </option>
                    ))
                  ) : (
                    <option value="default" className="bg-slate-950 text-white">
                      Summer Skincare Launch (Active)
                    </option>
                  )}
                </select>
              </div>

              {/* Proposed Budget */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Proposed Deliverable Budget ({symbol} {currency})</label>
                <input
                  type="number"
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value)}
                  placeholder={currency === 'INR' ? 'e.g. 50000' : 'e.g. 750'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Personal Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Custom Message / Brief</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Hi ${creator.name}, we love your recent content and would love to collaborate on our upcoming launch!`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  type="button"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/50 disabled:opacity-50 transition-all"
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Invitation</span>
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
