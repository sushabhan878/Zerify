'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface CardPaymentTabProps {
  cardNumber: string;
  setCardNumber: (val: string) => void;
  cardHolderName: string;
  setCardHolderName: (val: string) => void;
  expiryDate: string;
  setExpiryDate: (val: string) => void;
  cvv: string;
  setCvv: (val: string) => void;
}

export default function CardPaymentTab({
  cardNumber,
  setCardNumber,
  cardHolderName,
  setCardHolderName,
  expiryDate,
  setExpiryDate,
  cvv,
  setCvv,
}: CardPaymentTabProps) {
  const [showCardNumber, setShowCardNumber] = useState(false);

  // Format card number with spaces (#### #### #### ####)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Expiry MM / YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = `${raw.slice(0, 2)} / ${raw.slice(2)}`;
    }
    setExpiryDate(raw);
  };

  // Detect card network
  const detectBrand = () => {
    const clean = cardNumber.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD';
    if (/^(60|65|81|82)/.test(clean)) return 'RUPAY';
    return null;
  };

  const brand = detectBrand();

  return (
    <div className="space-y-2.5 text-left">
      {/* Card Number Field */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Card Number <span className="text-purple-600 font-bold">*</span>
        </label>
        <div className="relative">
          <input
            type={showCardNumber ? 'text' : 'password'}
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="5678  ****  ****  1267"
            className="w-full h-9 px-3 pr-16 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all"
            required
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {brand && (
              <span className="px-1 py-0.2 rounded bg-purple-50 text-[9px] font-black text-purple-700 border border-purple-200 uppercase">
                {brand}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
              title={showCardNumber ? 'Hide Card Number' : 'Show Card Number'}
            >
              {showCardNumber ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Holder Name */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Card Holder Name <span className="text-purple-600 font-bold">*</span>
        </label>
        <input
          type="text"
          value={cardHolderName}
          onChange={(e) => setCardHolderName(e.target.value)}
          placeholder="Cameron Williamson"
          className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-purple-400 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all"
          required
        />
      </div>

      {/* Expiry Date & CVV */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            Expiry Date <span className="text-purple-600 font-bold">*</span>
          </label>
          <input
            type="text"
            value={expiryDate}
            onChange={handleExpiryChange}
            placeholder="mm / yy"
            className="w-full h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all text-center"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            CVV/CVV2 <span className="text-purple-600 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              maxLength={4}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              placeholder="xxx"
              className="w-full h-9 px-3 pr-10 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all text-center"
              required
            />
            {/* Mastercard / Security Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center -space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-90 shadow-sm" />
              <div className="w-3 h-3 rounded-full bg-amber-400 opacity-90 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-slate-500 font-medium">
        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>Cards are tokenized & processed directly via Cashfree PCI-DSS Certified Vault.</span>
      </div>
    </div>
  );
}
