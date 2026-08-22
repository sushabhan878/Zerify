'use client';

import React from 'react';
import { DollarSign, Shield, Percent, Gift, Scale } from 'lucide-react';

const PAYMENT_MODELS = [
  { value: 'FIXED', label: 'Fixed Fee', desc: 'Equal set compensation for each hired creator' },
  { value: 'NEGOTIABLE', label: 'Negotiable / Pitch', desc: 'Creators propose their custom rate when applying' },
  { value: 'RANGE', label: 'Budget Range', desc: 'Min and Max target per creator' },
  { value: 'PERFORMANCE_BASED', label: 'Performance', desc: 'Compensation tied to CPM / Views / Conversions' },
  { value: 'BARTER', label: 'Product Barter', desc: 'Free gifting in exchange for deliverables' },
  { value: 'HYBRID', label: 'Hybrid (Fee + Product)', desc: 'Base payout plus free product shipment' },
];

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD'];

interface BudgetStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function BudgetStep({ formData, onChange }: BudgetStepProps) {
  return (
    <div className="space-y-6">
      {/* Payment Model Selection */}
      <div>
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
          Payment & Compensation Model <span className="text-pink-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PAYMENT_MODELS.map((pm) => {
            const isSelected = formData.budgetPaymentModel === pm.value;
            return (
              <button
                type="button"
                key={pm.value}
                onClick={() => onChange('budgetPaymentModel', pm.value)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 ${
                  isSelected
                    ? 'bg-purple-500/25 border-purple-300/60 text-white shadow-[0_0_14px_rgba(192,132,252,0.35)] ring-1 ring-purple-300/40 scale-[1.02]'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-purple-300/30 hover:text-purple-200'
                }`}
              >
                <span className="block text-xs font-bold text-white">{pm.label}</span>
                <span className="block text-[10px] text-slate-400 mt-1">{pm.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md">
        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Total Campaign Budget
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="10000"
              value={formData.budgetTotalAmount || ''}
              onChange={(e) => onChange('budgetTotalAmount', Number(e.target.value) || undefined)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
            <DollarSign className="w-3.5 h-3.5 text-purple-300/70 absolute left-3 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Currency
          </label>
          <select
            value={formData.budgetCurrency || 'USD'}
            onChange={(e) => onChange('budgetCurrency', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Budget Per Creator
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={formData.budgetMinPerInfluencer || ''}
              onChange={(e) => onChange('budgetMinPerInfluencer', Number(e.target.value) || undefined)}
              className="w-full px-3 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
            <input
              type="number"
              placeholder="Max"
              value={formData.budgetMaxPerInfluencer || ''}
              onChange={(e) => onChange('budgetMaxPerInfluencer', Number(e.target.value) || undefined)}
              className="w-full px-3 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </div>


      {/* Escrow Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="text-xs font-extrabold text-white">Escrow Payment Security</h5>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Campaign funds are held securely in Zerify escrow upon offer acceptance and only released when you approve completed deliverables.
          </p>
        </div>
      </div>
    </div>
  );
}
