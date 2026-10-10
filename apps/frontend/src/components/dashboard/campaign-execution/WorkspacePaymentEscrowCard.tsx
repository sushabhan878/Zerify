'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, Coins, Lock } from 'lucide-react';
import { formatCurrency, convertCurrency } from '@/utils/currency';
import { useCurrency } from '@/context/CurrencyContext';
import { isComplete } from '@/services/deliverable-workflow';
import { ParticipantDeliverableItem } from '@/services/deliverable.service';
import { panel } from './ExecutionUi';

export interface PayoutItem {
  id: string;
  status: string;
  currency: string;
  amount?: number;
  failureReason?: string | null;
  createdAt: string;
}

interface WorkspacePaymentEscrowCardProps {
  agreedAmount?: number;
  agreedCurrency?: string;
  originalAmount?: number;
  originalCurrency?: string;
  payouts?: PayoutItem[];
  deliverables?: ParticipantDeliverableItem[];
  participantStatus?: string;
}

interface PaymentTimelineStep {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  badge: string;
}

export default function WorkspacePaymentEscrowCard({
  agreedAmount = 0,
  agreedCurrency = 'INR',
  originalAmount,
  originalCurrency,
  payouts = [],
  deliverables = [],
  participantStatus,
}: WorkspacePaymentEscrowCardProps) {
  const { rates } = useCurrency();
  const totalAmount = Number(agreedAmount) || 0;

  // 1. Calculate Completed Payments (converting payout currency if needed)
  const completedPayouts = payouts.filter(
    (p) => p.status === 'SUCCESS' || p.status === 'COMPLETED'
  );
  const completedAmount = completedPayouts.reduce(
    (sum, p) =>
      sum +
      convertCurrency(p.amount || 0, p.currency || agreedCurrency, agreedCurrency, rates),
    0
  );

  // 2. Calculate Processing Payments
  const processingPayouts = payouts.filter(
    (p) => p.status === 'PROCESSING' || p.status === 'PENDING'
  );
  const processingPayoutsAmount = processingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  const allDeliverablesCompleted =
    deliverables.length > 0 && deliverables.every(isComplete);
  const isParticipantDone = participantStatus === 'PARTICIPANT_COMPLETED';

  let processingAmount = processingPayoutsAmount;
  if (processingAmount === 0 && (allDeliverablesCompleted || isParticipantDone)) {
    processingAmount = Math.max(0, totalAmount - completedAmount);
  }

  // 3. Calculate Due Amount
  const dueAmount = Math.max(0, totalAmount - completedAmount - processingAmount);

  // Milestone allocation
  const deliverableCount = deliverables.length || 1;
  const milestoneShare = totalAmount / deliverableCount;

  // Build Step-by-Step Payment Pipeline
  const steps: PaymentTimelineStep[] = [
    {
      id: 'step-escrow-funded',
      title: 'Escrow Deposit Secured',
      subtitle: 'Brand locked 100% contract funds into Zerify Escrow',
      amount: totalAmount,
      status: 'COMPLETED',
      badge: 'Escrow Locked',
    },
  ];

  if (deliverables.length > 0) {
    deliverables.forEach((d, index) => {
      const isDone = isComplete(d);
      const isUnderReview = d.status === 'SUBMITTED' || d.status === 'PUBLISHED';
      const status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' = isDone
        ? 'COMPLETED'
        : isUnderReview
        ? 'IN_PROGRESS'
        : 'PENDING';

      const badge = isDone
        ? 'Approved for Payout'
        : isUnderReview
        ? 'Under Review'
        : 'Pending Delivery';

      const subtitle = isDone
        ? 'Deliverable approved & release authorized'
        : isUnderReview
        ? 'Submission submitted for brand review'
        : 'Awaiting content submission by creator';

      steps.push({
        id: `step-deliverable-${d.id || index}`,
        title: d.title || `Deliverable #${index + 1}`,
        subtitle,
        amount: milestoneShare,
        status,
        badge,
      });
    });
  }

  // Final Settlement Step
  const isSettled = completedAmount >= totalAmount && totalAmount > 0;
  const isSettlementProcessing = allDeliverablesCompleted || isParticipantDone || processingAmount > 0;
  steps.push({
    id: 'step-final-payout',
    title: 'Final Payout Release',
    subtitle: isSettled
      ? 'All funds successfully disbursed to creator'
      : isSettlementProcessing
      ? 'Processing final bank release to creator'
      : 'Auto-released once all deliverables are verified',
    amount: totalAmount,
    status: isSettled ? 'COMPLETED' : isSettlementProcessing ? 'IN_PROGRESS' : 'PENDING',
    badge: isSettled ? 'Disbursed' : isSettlementProcessing ? 'Processing' : 'Scheduled',
  });

  return (
    <section id="campaign-payment" className={`${panel} space-y-4 p-5 sm:p-6`}>
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base leading-snug">Payment & escrow</h3>
            <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
              Protected by Zerify Escrow
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Value</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(totalAmount, agreedCurrency)}
          </span>
          {originalCurrency && originalCurrency.toUpperCase() !== agreedCurrency.toUpperCase() && (
            <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
              ≈ {formatCurrency(originalAmount || 0, originalCurrency)}
            </span>
          )}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 space-y-0.5">
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            Completed
          </span>
          <p className="text-xs sm:text-sm font-black text-white truncate">
            {formatCurrency(completedAmount, agreedCurrency)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-purple-500/20 space-y-0.5">
          <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            Processing
          </span>
          <p className="text-xs sm:text-sm font-black text-white truncate">
            {formatCurrency(processingAmount, agreedCurrency)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 space-y-0.5">
          <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
            <Coins className="w-3 h-3 shrink-0" />
            Due
          </span>
          <p className="text-xs sm:text-sm font-black text-white truncate">
            {formatCurrency(dueAmount, agreedCurrency)}
          </p>
        </div>
      </div>

      {/* Step-by-Step Vertical Payment Stepper */}
      <div className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">Payment Progression</span>
          <span className="text-[10px] font-semibold text-purple-400">Step-by-Step Releases</span>
        </div>

        <div className="relative pt-1 pl-1">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isCompleted = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';

            return (
              <div key={step.id} className="relative flex items-start gap-3 pb-5 last:pb-1 group">
                {/* Vertical Connector Line to Next Step */}
                {!isLast && (
                  <div
                    className={`absolute left-[13px] top-[26px] w-[2.5px] bottom-0 transition-colors duration-300 ${
                      isCompleted
                        ? 'bg-gradient-to-b from-purple-500 to-purple-600 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                        : 'bg-white/10'
                    }`}
                  />
                )}

                {/* Node Indicator */}
                <div className="relative z-10 shrink-0">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/60 shadow-lg shadow-purple-950/80 ring-4 ring-[#080B14] flex items-center justify-center text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </div>
                  ) : isInProgress ? (
                    <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-purple-400 ring-4 ring-[#080B14] shadow-lg shadow-purple-950/80 flex items-center justify-center relative">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping absolute" />
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-950 border border-white/15 ring-4 ring-[#080B14] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="min-w-0 flex-1 pt-0.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold truncate ${
                        isCompleted
                          ? 'text-white'
                          : isInProgress
                          ? 'text-purple-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-xs font-black text-slate-200 shrink-0">
                      {formatCurrency(step.amount, agreedCurrency)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {step.subtitle}
                  </p>

                  <div className="pt-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                        isCompleted
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : isInProgress
                          ? 'bg-purple-900/30 text-purple-200 border-purple-400/50 shadow-sm shadow-purple-900/50 animate-pulse'
                          : 'bg-slate-900/80 text-slate-500 border-white/10'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="border-t border-white/5 pt-3 flex items-center gap-2 text-[11px] text-slate-400">
        <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <p className="leading-relaxed">
          {originalCurrency && originalCurrency.toUpperCase() !== agreedCurrency.toUpperCase()
            ? `Protected by Zerify Escrow. Amounts converted from ${originalCurrency} to ${agreedCurrency} using live market FX rates.`
            : 'Protected by Zerify Escrow. Funds are automatically transferred upon deliverable completion & brand review.'}
        </p>
      </div>
    </section>
  );
}
