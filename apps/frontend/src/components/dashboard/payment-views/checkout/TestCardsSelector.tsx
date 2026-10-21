'use client';

import React, { useState } from 'react';
import { Check, FlaskConical, KeyRound, AlertTriangle } from 'lucide-react';

export interface TestCard {
  id: string;
  network: 'VISA' | 'MASTERCARD' | 'RUPAY' | 'USD';
  type: 'Debit Card' | 'Credit Card';
  name: string;
  number: string;
  rawNumber: string;
  expiry: string;
  cvv: string;
  otp: string;
  description: string;
  isFailureTest?: boolean;
}

export const CASHFREE_TEST_CARDS: TestCard[] = [
  {
    id: 'visa-debit-retail',
    network: 'VISA',
    type: 'Debit Card',
    name: 'Test',
    number: '4706 1312 1121 2123',
    rawNumber: '4706131211212123',
    expiry: '03 / 28',
    cvv: '123',
    otp: '111000',
    description: 'Visa Retail Debit',
  },
  {
    id: 'mc-debit-retail',
    network: 'MASTERCARD',
    type: 'Debit Card',
    name: 'Test',
    number: '5409 1626 6938 1034',
    rawNumber: '5409162669381034',
    expiry: '03 / 28',
    cvv: '123',
    otp: '111000',
    description: 'Mastercard Retail Debit',
  },
  {
    id: 'rupay-debit-retail',
    network: 'RUPAY',
    type: 'Debit Card',
    name: 'Test',
    number: '6074 8259 7208 3818',
    rawNumber: '6074825972083818',
    expiry: '03 / 28',
    cvv: '123',
    otp: '111000',
    description: 'RuPay Retail Debit',
  },
  {
    id: 'test-decline-simulation',
    network: 'VISA',
    type: 'Credit Card',
    name: 'Test',
    number: '4706 1312 1121 0005',
    rawNumber: '4706131211210005',
    expiry: '03 / 28',
    cvv: '123',
    otp: '111000',
    description: 'Simulated Card Decline (Error Test)',
    isFailureTest: true,
  },
  {
    id: 'usd-test-card',
    network: 'USD',
    type: 'Credit Card',
    name: 'Test',
    number: '7000 0083 1380 6604',
    rawNumber: '7000008313806604',
    expiry: '09 / 27',
    cvv: '581',
    otp: '111000',
    description: 'Cashfree USD Sandbox Card',
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
      {/* Top Header with Sandbox & OTP Banner */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-[11px] font-extrabold text-slate-800 tracking-tight">Test Cards</span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
            Sandbox
          </span>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <KeyRound className="w-2.5 h-2.5 text-amber-600" />
            <span>OTP: 111000</span>
          </div>
        </div>

        {/* Toggle Mode */}
        <button
          type="button"
          onClick={() => setIsTestMode(!isTestMode)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all shrink-0 ${
            isTestMode
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
          }`}
          title="Toggle Test Cards Mode"
        >
          {isTestMode ? 'Active' : 'Hidden'}
        </button>
      </div>

      {isTestMode && (
        <div className="space-y-1.5">
          {/* Filter Pills */}
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
                {net === 'ALL' ? 'All (3+)' : net === 'MASTERCARD' ? 'Mastercard' : net === 'RUPAY' ? 'RuPay' : 'Visa'}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="max-h-36 overflow-y-auto no-scrollbar space-y-1.5 pr-0.5">
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
                      : card.isFailureTest
                      ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                      : 'bg-white/90 border-slate-200 hover:bg-slate-50 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Network Badges */}
                    {card.network === 'VISA' && !card.isFailureTest && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-black italic text-[9px] tracking-wider shrink-0">
                        VISA
                      </span>
                    )}
                    {card.network === 'MASTERCARD' && (
                      <div className="flex items-center -space-x-1 shrink-0 px-1 py-0.5 rounded bg-slate-900">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-90" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-90" />
                      </div>
                    )}
                    {card.network === 'RUPAY' && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-black text-[9px] tracking-wide shrink-0">
                        RuPay
                      </span>
                    )}
                    {card.isFailureTest && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] shrink-0 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        FAIL
                      </span>
                    )}
                    {card.network === 'USD' && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-black text-[9px] shrink-0">
                        USD
                      </span>
                    )}

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                          {card.description}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          •••• {card.number.slice(-4)}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 block">
                        Exp {card.expiry} • CVV {card.cvv} • Name: {card.name} • OTP: {card.otp}
                      </span>
                    </div>
                  </div>

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
