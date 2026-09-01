'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, DollarSign, CheckCircle2, Loader2 } from 'lucide-react';
import { CompanyItem } from './CompanyCard';

interface CompanyPitchModalProps {
  company: CompanyItem | null;
  onClose: () => void;
  onSubmitPitch: (pitchData: any) => void;
}

export default function CompanyPitchModal({ company, onClose, onSubmitPitch }: CompanyPitchModalProps) {
  const [pitchMessage, setPitchMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [selectedDeliverable, setSelectedDeliverable] = useState('Instagram Reel');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!company || !mounted) return null;

  const handleApplyTemplate = () => {
    setPitchMessage(
      `Hi ${company.companyName} Team!\n\nI'm a content creator specializing in ${company.industry}. My audience aligns strongly with your target demographic (${company.targetAudience?.gender || 'All'} | ${company.targetAudience?.locations?.join(', ') || 'Global'}).\n\nI'd love to collaborate on a high-performing ${selectedDeliverable} showcasing your products!`
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSubmitPitch({
          companyId: company.id,
          pitchMessage,
          proposedRate,
          selectedDeliverable,
        });
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-400" />
              <span>Pitch {company.companyName}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Submit your collaboration proposal directly to {company.companyName}'s marketing team.
            </p>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Proposal Sent Successfully!</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                {company.companyName} has received your pitch and will get back to you within 24–48 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Deliverable & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Deliverable Format</label>
                  <select
                    value={selectedDeliverable}
                    onChange={(e) => setSelectedDeliverable(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Instagram Reel">Instagram Reel</option>
                    <option value="TikTok Video">TikTok Video</option>
                    <option value="YouTube Dedicated Video">YouTube Dedicated Video</option>
                    <option value="YouTube Integration">YouTube Integration</option>
                    <option value="UGC Video Creation">UGC Video Creation</option>
                    <option value="LinkedIn Sponsored Post">LinkedIn Sponsored Post</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Proposed Rate ($ USD)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      placeholder="e.g. 750"
                      value={proposedRate}
                      onChange={(e) => setProposedRate(e.target.value)}
                      required
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pitch Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Your Pitch Proposal</label>
                  <button
                    type="button"
                    onClick={handleApplyTemplate}
                    className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Fill AI Template</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder="Introduce yourself, mention why your audience fits this brand, and outline your content idea..."
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-extrabold text-white flex items-center gap-2 shadow-lg shadow-purple-950/50 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Pitch...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Proposal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
