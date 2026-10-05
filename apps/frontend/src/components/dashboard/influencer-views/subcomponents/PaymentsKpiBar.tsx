'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Lock, TrendingUp, Download, ArrowUpRight, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PaymentsKpiBarProps {
  availableBalance: string;
  inEscrow: string;
  lifetimeEarnings: string;
  beneficiary?: any;
  beneficiaryAccount?: any;
  disputeCount?: number;
  onWithdraw: () => void;
  onOpenLinkModal?: () => void;
  onLinkCredentials?: () => void;
  onViewDisputes?: () => void;
}

export default function PaymentsKpiBar({
  availableBalance,
  inEscrow,
  lifetimeEarnings,
  beneficiary,
  beneficiaryAccount,
  disputeCount = 0,
  onWithdraw,
  onOpenLinkModal,
  onLinkCredentials,
  onViewDisputes,
}: PaymentsKpiBarProps) {
  const activeBeneficiary = beneficiaryAccount || beneficiary;
  const handleOpenLink = onLinkCredentials || onOpenLinkModal || (() => {});
  const hasBeneficiary = Boolean(
    activeBeneficiary && (activeBeneficiary.accountLast4 || activeBeneficiary.accountHolderName || activeBeneficiary.upiId)
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Available Balance Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/40 backdrop-blur-xl shadow-xl space-y-3 relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300">Available Balance</span>
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">{availableBalance}</div>
          <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">Cleared for instant claim</span>
        </div>
        <button
          onClick={onWithdraw}
          className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-extrabold text-white shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Claim Earnings</span>
        </button>
      </motion.div>

      {/* 2. Escrow Funds Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-3 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Locked in Escrow</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-amber-400">{inEscrow}</div>
          <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">Released upon deliverable approval</span>
        </div>
        <div className="pt-2 border-t border-white/5 text-[11px] font-semibold text-slate-400">
          Milestones held in Cashfree escrow
        </div>
      </motion.div>

      {/* 3. Payout Destination Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-3 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Payout Credentials</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div>
          {hasBeneficiary ? (
            <>
              <div className="text-sm font-bold text-white truncate">
                {activeBeneficiary.bankName ? `${activeBeneficiary.bankName}` : 'UPI Account'}
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{activeBeneficiary.accountLast4 ? `•••• ${activeBeneficiary.accountLast4}` : activeBeneficiary.upiId || 'Verified'}</span>
              </span>
            </>
          ) : (
            <>
              <div className="text-xs font-bold text-amber-400">No Account Linked</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Link bank to receive payouts</span>
            </>
          )}
        </div>
        <button
          onClick={handleOpenLink}
          className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-purple-300 border border-white/10 transition-colors"
        >
          {hasBeneficiary ? 'Edit Account' : 'Link Payout Account'}
        </button>
      </motion.div>

      {/* 4. Lifetime Earnings / Disputes Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-3 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Total Settled</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-white">{lifetimeEarnings}</div>
          {disputeCount > 0 ? (
            <button
              onClick={onViewDisputes}
              className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{disputeCount} active dispute{disputeCount > 1 ? 's' : ''}</span>
            </button>
          ) : (
            <span className="text-[11px] font-bold text-emerald-400 mt-0.5 block">100% on-time settlement</span>
          )}
        </div>
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>Escrow Protected</span>
          <span className="text-purple-400 font-bold">Cashfree Verified</span>
        </div>
      </motion.div>
    </div>
  );
}
