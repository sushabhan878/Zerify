'use client';

import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { DealItem } from './deal-types';
import { useCurrency } from '@/context/CurrencyContext';

interface DealsKpiBannerProps {
  deals: DealItem[];
}

export default function DealsKpiBanner({ deals }: DealsKpiBannerProps) {
  const { format } = useCurrency();

  const activeDeals = deals.filter((d) => d.status === 'ACTIVE');
  const completedDeals = deals.filter((d) => d.status === 'COMPLETED');
  const cancelledDeals = deals.filter((d) => d.status === 'CANCELLED');

  const activeEscrowAmount = activeDeals.reduce((sum, d) => sum + d.agreedAmount, 0);
  const completedAmount = completedDeals.reduce((sum, d) => sum + d.agreedAmount, 0);
  const totalVolume = deals.reduce((sum, d) => sum + d.agreedAmount, 0);

  const kpis = [
    {
      label: 'Total Deals Placed',
      val: String(deals.length),
      subtext: `${format(totalVolume)} Lifetime Volume`,
      icon: FileText,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Active Contracts',
      val: String(activeDeals.length),
      subtext: `${format(activeEscrowAmount)} Secured in Escrow`,
      icon: ShieldCheck,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Completed & Delivered',
      val: String(completedDeals.length),
      subtext: `${format(completedAmount)} Paid to Creators`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Cancelled / Refunded',
      val: String(cancelledDeals.length),
      subtext: '100% Escrow Protected',
      icon: AlertCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-[#090C15]/95 border border-white/[0.08] backdrop-blur-2xl space-y-2 hover:border-purple-500/30 transition-all shadow-md shadow-purple-950/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {kpi.label}
              </span>
              <div className={`p-2 rounded-xl border ${kpi.bg}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-xl sm:text-2xl font-black text-white block">
                {kpi.val}
              </span>
              <span className="text-[11px] font-medium text-slate-400 block truncate">
                {kpi.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
