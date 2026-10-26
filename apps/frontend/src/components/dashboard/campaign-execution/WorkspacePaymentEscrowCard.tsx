'use client';

import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
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
  badge?: string;
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

  // 1. Calculate Completed Payments
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
      // Deliverable is considered complete once it is Ready to Publish, Approved, Published, or Verified!
      const isDeliverableReadyOrDone =
        ['READY_TO_PUBLISH', 'APPROVED', 'PUBLISHED', 'VERIFIED'].includes(d.status) || isComplete(d);
      const isUnderReview = d.status === 'SUBMITTED';

      const status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' = isDeliverableReadyOrDone
        ? 'COMPLETED'
        : isUnderReview
        ? 'IN_PROGRESS'
        : 'PENDING';

      const subtitle = ['PUBLISHED', 'VERIFIED'].includes(d.status)
        ? 'Deliverable published & verified'
        : ['READY_TO_PUBLISH', 'APPROVED'].includes(d.status)
        ? 'Deliverable approved & ready for release'
        : isUnderReview
        ? 'Submission submitted for brand review'
        : 'Awaiting content submission by creator';

      steps.push({
        id: `step-deliverable-${d.id || index}`,
        title: d.title || `Deliverable No. ${index + 1}`,
        subtitle,
        amount: milestoneShare,
        status,
      });
    });
  }

  // Final Settlement Step: Once published URL is sent, complete the escrow flow!
  const hasPublishedUrlSent =
    deliverables.length > 0 &&
    deliverables.every(
      (d) => ['PUBLISHED', 'VERIFIED'].includes(d.status) || Boolean(d.publishedUrl)
    );
  const isSettled =
    (completedAmount >= totalAmount && totalAmount > 0) ||
    hasPublishedUrlSent ||
    isParticipantDone;

  const isSettlementProcessing =
    allDeliverablesCompleted ||
    isParticipantDone ||
    processingAmount > 0 ||
    deliverables.some((d) => ['READY_TO_PUBLISH', 'APPROVED'].includes(d.status));

  steps.push({
    id: 'step-final-payout',
    title: 'Final Payout Release',
    subtitle: isSettled
      ? 'Published URL submitted · Escrow release authorized'
      : isSettlementProcessing
      ? 'Processing final bank release to creator'
      : 'Auto-released once all deliverables are verified',
    amount: totalAmount,
    status: isSettled ? 'COMPLETED' : isSettlementProcessing ? 'IN_PROGRESS' : 'PENDING',
  });

  return (
    <section id="campaign-payment" className={`${panel} space-y-5 p-6 sm:p-7 shadow-2xl shadow-purple-950/20`}>
      {/* Card Header */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug">Payment & escrow</h3>
          <span className="text-xs font-semibold text-purple-400 block mt-0.5">
            Protected by Zerify Escrow
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Value</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {formatCurrency(totalAmount, agreedCurrency)}
          </span>
        </div>
      </div>

      {/* Step-by-Step Vertical Payment Stepper */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">Payment Progression</span>
          <span className="text-xs font-semibold text-purple-400">Step-by-Step Releases</span>
        </div>

        <div className="relative pt-2 pl-1">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isCompleted = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';

            return (
              <div key={step.id} className="relative flex items-start gap-3.5 pb-6 last:pb-1 group">
                {/* Vertical Connector Line to Next Step */}
                {!isLast && (
                  <div
                    className={`absolute left-[13px] top-[26px] w-[2px] bottom-0 transition-colors duration-300 ${
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
                    <div className="w-7 h-7 rounded-full bg-slate-950 border-2 border-purple-400 ring-4 ring-purple-500/25 shadow-lg shadow-purple-950/80 flex items-center justify-center relative">
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-purple-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-950 border border-white/20 ring-4 ring-[#080B14] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="min-w-0 flex-1 pt-0.5 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isCompleted
                          ? 'text-white'
                          : isInProgress
                          ? 'text-purple-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-200 shrink-0">
                      {formatCurrency(step.amount, agreedCurrency)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="border-t border-white/10 pt-3.5 flex items-center gap-2.5 text-xs text-slate-400">
        <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <p className="leading-relaxed">
          Protected by Zerify Escrow. Funds are safely locked in custody and released upon verified deliverable approval.
        </p>
      </div>
    </section>
  );
}
