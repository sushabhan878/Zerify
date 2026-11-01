'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowDownLeft, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';

interface BrandEscrowKpiBarProps {
  availableBalanceStr: string;
  inEscrowStr: string;
  totalSettledStr: string;
  contractsCount: number;
  hasBillingDetails: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  onManageBilling: () => void;
}

export default function BrandEscrowKpiBar({
  availableBalanceStr,
  inEscrowStr,
  totalSettledStr,
  contractsCount,
  hasBillingDetails,
  onDeposit,
  onWithdraw,
  onManageBilling,
}: BrandEscrowKpiBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Available Campaign Balance */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-tr from-purple-950/60 to-slate-950 border border-purple-500/30 backdrop-blur-xl shadow-xl flex flex-col justify-between light:bg-none light:bg-white light:border-slate-200/80 light:shadow-sm"
      >
        <div>
          <span className="text-[11px] font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider block mb-1">
            Available Balance
          </span>
          <div className="text-2xl font-black text-white light:text-slate-900">{availableBalanceStr}</div>
          <p className="text-[10px] text-purple-300 light:text-purple-600 mt-1">Ready for creator hiring & milestone allocations</p>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={onDeposit}
            className="flex-1 py-1.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white keep-white text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deposit Funds</span>
          </button>
          <button
            onClick={onWithdraw}
            className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 light:bg-slate-100 light:hover:bg-slate-200 light:border-slate-200 light:text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
            title="Withdraw unspent funds back to bank"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Active Escrow Vault */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl bg-slate-950/60 border border-amber-500/30 backdrop-blur-xl shadow-xl flex flex-col justify-between light:bg-white light:border-slate-200/80 light:shadow-sm"
      >
        <div>
          <span className="text-[11px] font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider block mb-1">
            Locked in Escrow
          </span>
          <div className="text-2xl font-black text-amber-400 light:text-amber-600">{inEscrowStr}</div>
          <p className="text-[10px] text-slate-400 light:text-slate-500 mt-1">Milestones awaiting deliverable verification</p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 light:text-slate-500 mt-4 pt-3 border-t border-white/5 light:border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-400 light:text-emerald-600 shrink-0" />
          <span className="font-semibold text-white light:text-slate-700">Cashfree Smart Escrow</span>
        </div>
      </motion.div>

      {/* 3. Total Settled Payouts */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between light:bg-white light:border-slate-200/80 light:shadow-sm"
      >
        <div>
          <span className="text-[11px] font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider block mb-1">
            Total Released
          </span>
          <div className="text-2xl font-black text-emerald-400 light:text-emerald-600">{totalSettledStr}</div>
          <p className="text-[10px] text-slate-400 light:text-slate-500 mt-1">Direct to verified influencer bank / UPI</p>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-400 light:text-emerald-700 font-bold mt-4 pt-3 border-t border-white/5 light:border-slate-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{contractsCount} Completed Deals</span>
        </div>
      </motion.div>

      {/* 4. Optional Billing Information */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-xl flex flex-col justify-between light:bg-white light:border-slate-200/80 light:shadow-sm"
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 light:text-slate-500 uppercase tracking-wider">
              Billing Profile
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-white/5 light:bg-slate-100 light:text-slate-600 light:border-slate-200">
              Optional
            </span>
          </div>
          <div className="text-sm font-bold text-white light:text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400 light:text-purple-600" />
            <span>{hasBillingDetails ? 'GST / Tax ID Linked' : 'No Details Required'}</span>
          </div>
          <p className="text-[10px] text-slate-400 light:text-slate-500 mt-1">
            {hasBillingDetails
              ? 'Invoices include your corporate entity info'
              : 'Add anytime for formal corporate tax credits'}
          </p>
        </div>

        <button
          onClick={onManageBilling}
          className="mt-4 pt-3 border-t border-white/5 light:border-slate-100 text-[11px] font-bold text-purple-400 hover:text-purple-300 light:text-purple-600 light:hover:text-purple-700 text-left transition-colors flex items-center justify-between w-full cursor-pointer"
        >
          <span>{hasBillingDetails ? 'Edit Details' : 'Add Billing Info'}</span>
          <span>→</span>
        </button>
      </motion.div>
    </div>
  );
}
