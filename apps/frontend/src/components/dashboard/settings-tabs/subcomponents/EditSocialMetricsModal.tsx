'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Users, TrendingUp, Check } from 'lucide-react';
import { SocialAccountItem } from './SingleSocialAccountsCard';

interface EditSocialMetricsModalProps {
  account: SocialAccountItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (followers: string, engagementRate: string) => Promise<void>;
  isSaving: boolean;
}

export default function EditSocialMetricsModal({
  account,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: EditSocialMetricsModalProps) {
  const [followers, setFollowers] = useState('500+');
  const [engagementRate, setEngagementRate] = useState('3.4');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (account) {
      const rawFollowers = account.followers ? String(account.followers).replace(/,/g, '') : '';
      setFollowers(rawFollowers || '500+');

      const rawEr = account.engagementRate !== undefined && account.engagementRate !== null
        ? String(account.engagementRate).replace(/%/g, '')
        : '';
      const numEr = parseFloat(rawEr);
      setEngagementRate(numEr > 0 ? String(rawEr) : '3.4');
    }
  }, [account]);

  if (!isOpen || !account || !mounted) return null;

  const isLinkedIn = (account.id || '').toLowerCase().includes('linkedin') || (account.platform || '').toLowerCase().includes('linkedin');
  const isTwitter = (account.id || '').toLowerCase().includes('x') || (account.id || '').toLowerCase().includes('twitter') || (account.platform || '').toLowerCase().includes('twitter');

  const handleErChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val !== '' && !isNaN(Number(val))) {
      if (Number(val) > 10.0) {
        val = '10.0';
      }
      if (Number(val) < 0) {
        val = '0';
      }
    }
    setEngagementRate(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(followers, engagementRate);
  };

  const modalMarkup = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-slate-900/95 border border-white/15 rounded-2xl p-6 shadow-2xl shadow-purple-950/50 space-y-4 backdrop-blur-xl"
        >
          {/* Top row with Close Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {account.handle || account.userName || account.name}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Info note */}
          {(isLinkedIn || isTwitter) && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed">
              <p className="font-semibold text-purple-300 mb-0.5">Platform API Note</p>
              {isLinkedIn && (
                <p className="text-slate-300">
                  LinkedIn standard sign-in restricts private network size. You can specify your exact connections count and engagement rate below.
                </p>
              )}
              {isTwitter && (
                <p className="text-slate-300">
                  If tweet timeline access is restricted by your X API tier, you can fine-tune your verified audience reach and engagement rate below.
                </p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>{isLinkedIn ? 'Connections / Followers' : 'Followers Count'}</span>
              </label>
              <input
                type="text"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="500+"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/80 font-medium transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1">Default: 500+ connections</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Engagement Rate (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10.0"
                value={engagementRate}
                onChange={handleErChange}
                placeholder="3.4"
                required
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/15 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/80 font-medium transition-all"
              />
              <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Standard limit: 0.0% – 10.0%</span>
                <span>Default baseline: 3.4%</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Metrics</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalMarkup, document.body);
}
