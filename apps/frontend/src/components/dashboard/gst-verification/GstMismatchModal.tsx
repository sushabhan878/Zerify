'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { GstRegistration } from './types';

interface GstMismatchModalProps {
  isOpen: boolean;
  registration: GstRegistration | null;
  onClose: () => void;
  onResolve: (acceptProviderName: boolean, updatedName?: string) => Promise<void>;
}

export default function GstMismatchModal({
  isOpen,
  registration,
  onClose,
  onResolve,
}: GstMismatchModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [correctName, setCorrectName] = useState('');

  if (!isOpen || !registration) return null;

  const userEnteredName = registration.legalName || 'User Submitted Business Name';
  const providerLegalName = registration.legalName || 'Provider Returned Legal Name';
  const providerTradeName = registration.tradeName;

  const handleAcceptLegalName = async () => {
    setSubmitting(true);
    try {
      await onResolve(true);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctName.trim()) return;
    setSubmitting(true);
    try {
      await onResolve(false, correctName.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-950/95 border border-amber-500/30 shadow-2xl p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Business Name Mismatch</h3>
                <p className="text-xs text-slate-400">
                  Government GST record does not precisely match your entered name
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comparison Cards */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Official Registered Name on GSTIN ({registration.gstin})
              </span>
              <p className="text-sm font-bold text-emerald-400 font-mono">
                {providerLegalName}
              </p>
              {providerTradeName && (
                <p className="text-xs text-slate-400">
                  Trade Name: <span className="text-white font-medium">{providerTradeName}</span>
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Name You Entered in Zerify
              </span>
              <p className="text-sm font-semibold text-slate-300">
                {userEnteredName}
              </p>
            </div>
          </div>

          {/* Decision Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleAcceptLegalName}
              className="w-full p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Accept Official Name as Primary Billing Entity</span>
              </div>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative flex items-center justify-center my-3">
              <span className="bg-slate-950 px-3 text-[10px] font-bold uppercase text-slate-500 z-10">
                Or Correct & Re-verify
              </span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-3">
              <input
                type="text"
                value={correctName}
                onChange={(e) => setCorrectName(e.target.value)}
                placeholder="Enter exact registered business name..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={submitting || !correctName.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Re-verify with Updated Name</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
