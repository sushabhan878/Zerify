'use client';

import React, { useState } from 'react';
import { Check, FlaskConical } from 'lucide-react';

export interface TestCard {
  id: string;
  network: 'VISA' | 'MASTERCARD' | 'RUPAY';
  type: 'Debit Card' | 'Credit Card';
  name: string;
  number: string;
  rawNumber: string;
  expiry: string;
  cvv: string;
  description: string;
}

export const CASHFREE_TEST_CARDS: TestCard[] = [
  {
    id: 'visa-debit',
    network: 'VISA',
    type: 'Debit Card',
    name: 'Alex Morgan',
    number: '4706 1312 1121 2123',
    rawNumber: '4706131211212123',
    expiry: '12 / 28',
    cvv: '123',
    description: 'Visa Retail Debit',
  },
  {
    id: 'visa-credit',
    network: 'VISA',
    type: 'Credit Card',
    name: 'Sophia Chen',
    number: '4576 2389 1277 1450',
    rawNumber: '4576238912771450',
    expiry: '12 / 28',
    cvv: '123',
    description: 'Visa Platinum Credit',
  },
  {
    id: 'mc-credit',
    network: 'MASTERCARD',
    type: 'Credit Card',
    name: 'Liam Vance',
    number: '5123 4567 8901 2346',
    rawNumber: '5123456789012346',
    expiry: '12 / 28',
    cvv: '123',
    description: 'Mastercard World Elite',
  },
  {
    id: 'mc-debit',
    network: 'MASTERCARD',
    type: 'Debit Card',
    name: 'Elena Rostova',
    number: '5123 4500 0000 0008',
    rawNumber: '5123450000000008',
    expiry: '12 / 28',
    cvv: '123',
    description: 'Mastercard Debit',
  },
  {
    id: 'rupay-debit',
    network: 'RUPAY',
    type: 'Debit Card',
    name: 'Aarav Sharma',
    number: '6074 8259 7208 3818',
    rawNumber: '6074825972083818',
    expiry: '12 / 28',
    cvv: '123',
    description: 'RuPay Classic Debit',
  },
  {
    id: 'rupay-credit',
    network: 'RUPAY',
    type: 'Credit Card',
    name: 'Priya Patel',
    number: '6528 5912 3454 3575',
    rawNumber: '6528591234543575',
    expiry: '12 / 28',
    cvv: '123',
    description: 'RuPay Select Credit',
  },
];

interface TestCardsSelectorProps {
  selectedCardNumber: string;
  onSelectCard: (card: TestCard) => void;
  isTestMode: boolean;
  setIsTestMode: (val: boolean) => void;
}

export default function TestCardsSelector({
  selectedCardNumber,
  onSelectCard,
  isTestMode,
  setIsTestMode,
}: TestCardsSelectorProps) {
  const [filterNetwork, setFilterNetwork] = useState<'ALL' | 'VISA' | 'MASTERCARD' | 'RUPAY'>('ALL');

  const filteredCards = CASHFREE_TEST_CARDS.filter((card) => {
    if (filterNetwork === 'ALL') return true;
    return card.network === filterNetwork;
  });

  const cleanSelected = selectedCardNumber.replace(/\D/g, '');

  return (
    <div className="rounded-xl border border-purple-200/90 bg-gradient-to-b from-purple-50/70 to-white p-2.5 space-y-2 shadow-sm">
      {/* Top Bar with Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-[11px] font-extrabold text-slate-800 tracking-tight">Test Cards Mode</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            Sandbox
          </span>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => setIsTestMode(!isTestMode)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
            isTestMode
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
          title="Toggle Test Cards Mode"
        >
          <span>{isTestMode ? 'Active' : 'Disabled'}</span>
        </button>
      </div>

      {isTestMode && (
        <div className="space-y-2">
          {/* Network Filter Pills */}
          <div className="flex items-center gap-1 text-[10px] font-semibold">
            {(['ALL', 'VISA', 'MASTERCARD', 'RUPAY'] as const).map((net) => (
              <button
                key={net}
                type="button"
                onClick={() => setFilterNetwork(net)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  filterNetwork === net
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {net === 'ALL' ? 'All' : net === 'MASTERCARD' ? 'Mastercard' : net === 'RUPAY' ? 'RuPay' : 'Visa'}
              </button>
            ))}
          </div>

          {/* Cards Scrollable List */}
          <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1.5 pr-0.5">
            {filteredCards.map((card) => {
              const isSelected = cleanSelected === card.rawNumber;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onSelectCard(card)}
                  className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-purple-100/90 border-purple-500 ring-1 ring-purple-500/40 shadow-xs'
                      : 'bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Network Badge */}
                    {card.network === 'VISA' && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-extrabold italic text-[9px] tracking-wider shrink-0 shadow-xs">
                        VISA
                      </span>
                    )}
                    {card.network === 'MASTERCARD' && (
                      <div className="flex items-center -space-x-1 shrink-0 px-1 py-0.5 rounded bg-slate-900 shadow-xs">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-90" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-90" />
                      </div>
                    )}
                    {card.network === 'RUPAY' && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-black text-[9px] tracking-wide shrink-0 shadow-xs">
                        RuPay
                      </span>
                    )}

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                          {card.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          •••• {card.number.slice(-4)}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        {card.description} • Exp {card.expiry}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator / Checkmark */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isSelected ? (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-300">
                        <Check className="w-2.5 h-2.5" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-[9px] text-purple-700 font-semibold px-1.5 py-0.5 rounded bg-purple-50 group-hover:bg-purple-100 transition-colors">
                        Use Card
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
