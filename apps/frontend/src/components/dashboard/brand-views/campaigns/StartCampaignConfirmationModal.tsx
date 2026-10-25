'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ArrowRight, Lock, Users } from 'lucide-react';
import Money from '@/components/currency/Money';
import { useCurrency } from '@/context/CurrencyContext';

interface StartCampaignConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  participant?: any;
  filledSlots: number;
  totalSlots: number;
  onProceedToEscrow: () => void;
}

export default function StartCampaignConfirmationModal({
  isOpen,
  onClose,
  campaign,
  participant,
  filledSlots,
  totalSlots,
  onProceedToEscrow,
}: StartCampaignConfirmationModalProps) {
  const { currency, convert } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedContract, setAgreedContract] = useState(false);
  const [agreedEscrow, setAgreedEscrow] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset checkboxes whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setAgreedTerms(false);
      setAgreedPrivacy(false);
      setAgreedContract(false);
      setAgreedEscrow(false);
    }
  }, [isOpen]);

  // Calculate combined value of all selected candidates / active collabs for this campaign
  const { totalEscrowAmount, candidateCount } = useMemo(() => {
    const rawParticipants: any[] =
      Array.isArray(campaign?.participants) && campaign.participants.length > 0
        ? campaign.participants
        : participant
        ? [participant]
        : [];

    const activeList = rawParticipants.filter(
      (p) => p.status !== 'PARTICIPANT_CANCELLED' && p.status !== 'CANCELLED'
    );

    if (activeList.length === 0) {
      const fallback = campaign?.budgetTotalAmount || campaign?.budgetMinPerInfluencer || 5000;
      return { totalEscrowAmount: fallback, candidateCount: 0 };
    }

    const total = activeList.reduce((sum, p) => {
      const amt = Number(p.agreedAmount || 0);
      const fromCurr = p.agreedCurrency || campaign?.budgetCurrency || 'INR';
      const converted = convert ? convert(amt, fromCurr) : amt;
      return sum + converted;
    }, 0);

    return { totalEscrowAmount: total, candidateCount: activeList.length };
  }, [campaign, participant, convert]);

  if (!isOpen || !mounted) return null;

  const allAgreed = agreedTerms && agreedPrivacy && agreedContract && agreedEscrow;

  const handleSelectAll = () => {
    const nextState = !allAgreed;
    setAgreedTerms(nextState);
    setAgreedPrivacy(nextState);
    setAgreedContract(nextState);
    setAgreedEscrow(nextState);
  };


  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      {/* Background ambient glow */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="start-campaign-modal-title"
        className="relative z-10 w-full max-w-xl rounded-3xl bg-slate-900/95 border border-purple-500/30 shadow-2xl shadow-purple-950/50 p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
          aria-label="Close confirmation dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <h2 id="start-campaign-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Confirm Campaign Activation
          </h2>
          <p className="text-xs sm:text-sm text-purple-300 font-semibold">
            {campaign?.title || 'Campaign'}
          </p>
        </div>

        {/* Campaign & Escrow Financial Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-purple-950/30 border border-purple-500/25 hover:border-purple-500/40 backdrop-blur-2xl shadow-xl shadow-purple-950/30 transition-all duration-300 group">
          {/* Ambient Lighting Aura */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Section: Escrow Commitment Hero */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-white/5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Escrow Commitment
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold whitespace-nowrap shadow-sm shadow-emerald-950/40">
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  100% Protected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Funds held safely until deliverables are approved
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight leading-none block drop-shadow-[0_0_15px_rgba(52,211,153,0.35)]">
                <Money amount={totalEscrowAmount} currency={currency} />
              </span>
              <span className="text-[11px] font-medium text-slate-400 block pt-1.5">
                {candidateCount > 1
                  ? `Combined fee for ${candidateCount} active collabs`
                  : 'Agreed Creator Compensation'}
              </span>
            </div>
          </div>

          {/* Bottom Section: Slots Recruitment Status */}
          <div className="px-4 sm:px-5 py-3 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <Users className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-semibold text-slate-300">Creator Recruitment:</span>
              <span className="font-black text-white">
                {filledSlots} of {totalSlots} Slots Filled
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full sm:w-44 bg-slate-800/60 h-2 rounded-full overflow-hidden shrink-0 border border-white/5">
              <div
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                style={{
                  width: `${Math.min(100, Math.max(8, (filledSlots / Math.max(1, totalSlots)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Checkbox Acknowledgements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Required Confirmations
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-bold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer"
            >
              {allAgreed ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* Checkbox 1: Terms & Conditions */}
            <label className="flex items-start gap-3 py-1 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center shrink-0 border transition-all pointer-events-none ${
                  agreedTerms
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-900/60 border-slate-700 group-hover:border-purple-400 text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs text-slate-300 leading-snug group-hover:text-slate-200 transition-colors">
                I have read and agree to the <span className="text-purple-300 font-semibold underline">Terms & Conditions</span>, platform guidelines, and mutual dispute resolution rules.
              </span>
            </label>

            {/* Checkbox 2: Privacy Policy */}
            <label className="flex items-start gap-3 py-1 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center shrink-0 border transition-all pointer-events-none ${
                  agreedPrivacy
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-900/60 border-slate-700 group-hover:border-purple-400 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span className="text-xs text-slate-300 leading-snug group-hover:text-slate-200 transition-colors">
                I accept the <span className="text-purple-300 font-semibold underline">Privacy Policy</span> and acknowledge commercial usage licensing for all verified creator deliverables.
              </span>
            </label>

            {/* Checkbox 3: Contract Acknowledgement */}
            <label className="flex items-start gap-3 py-1 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreedContract}
                onChange={(e) => setAgreedContract(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center shrink-0 border transition-all pointer-events-none ${
                  agreedContract
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-900/60 border-slate-700 group-hover:border-purple-400 text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs text-slate-300 leading-snug group-hover:text-slate-200 transition-colors">
                I approve the <span className="text-white font-semibold">Contract & Deliverables Scope</span>, revision count limits, and publishing requirements for participating creators.
              </span>
            </label>

            {/* Checkbox 4: Escrow Commitment */}
            <label className="flex items-start gap-3 py-1 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={agreedEscrow}
                onChange={(e) => setAgreedEscrow(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 mt-0.5 rounded-md flex items-center justify-center shrink-0 border transition-all pointer-events-none ${
                  agreedEscrow
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-900/60 border-slate-700 group-hover:border-purple-400 text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span className="text-xs text-slate-300 leading-snug group-hover:text-slate-200 transition-colors">
                I understand that campaign funds will be <span className="text-emerald-400 font-semibold">safely reserved in Smart Escrow</span> and released to creators only upon review and approval.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!allAgreed}
            onClick={onProceedToEscrow}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-purple-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-purple-200" />
            <span>Continue with Escrow Reservation</span>
            <ArrowRight className="w-4 h-4 text-purple-200" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
