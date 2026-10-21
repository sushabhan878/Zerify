'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import TestCardsSelector, { TestCard } from './TestCardsSelector';
import { isSandboxEnvironment } from '@/utils/payment-env';
import {
  detectCardBrand,
  validateCardNumber,
  validateExpiry,
  validateCvv,
  validateCardHolder,
} from '@/utils/card-validator';

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
  const [isTestMode, setIsTestMode] = useState(true);
  const [isSandbox, setIsSandbox] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsSandbox(isSandboxEnvironment());
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    setTouched((prev) => ({ ...prev, cardNumber: true }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = `${raw.slice(0, 2)} / ${raw.slice(2)}`;
    }
    setExpiryDate(raw);
    setTouched((prev) => ({ ...prev, expiry: true }));
  };

  const brand = detectCardBrand(cardNumber);

  // Field Validations
  const numCheck = validateCardNumber(cardNumber);
  const expiryCheck = validateExpiry(expiryDate);
  const cvvCheck = validateCvv(cvv);
  const nameCheck = validateCardHolder(cardHolderName);

  const handleSelectTestCard = (card: TestCard) => {
    setCardNumber(card.number);
    setCardHolderName(card.name);
    setExpiryDate(card.expiry);
    setCvv(card.cvv);
    setTouched({ cardNumber: true, cardHolder: true, expiry: true, cvv: true });
  };

  return (
    <div className="space-y-2.5 text-left">
      {/* Test Mode Cards Selector - ONLY shown in Sandbox / Development */}
      {isSandbox && (
        <TestCardsSelector
          selectedCardNumber={cardNumber}
          onSelectCard={handleSelectTestCard}
          isTestMode={isTestMode}
          setIsTestMode={setIsTestMode}
        />
      )}

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
            onBlur={() => setTouched((p) => ({ ...p, cardNumber: true }))}
            placeholder="4706 1312 1121 2123"
            className={`w-full h-9 px-3 pr-20 rounded-lg bg-slate-50 border text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
              touched.cardNumber && !numCheck.isValid && cardNumber.length > 0
                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
                : 'border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20'
            }`}
            required
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {brand === 'VISA' && (
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-extrabold italic text-[9px]">
                VISA
              </span>
            )}
            {brand === 'MASTERCARD' && (
              <div className="flex items-center -space-x-1 px-1 py-0.5 rounded bg-slate-900 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-90" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-90" />
              </div>
            )}
            {brand === 'RUPAY' && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-black text-[9px]">
                RuPay
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
        {touched.cardNumber && !numCheck.isValid && cardNumber.length > 0 && (
          <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-600 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{numCheck.error}</span>
          </p>
        )}
      </div>

      {/* Card Holder Name */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
          Card Holder Name <span className="text-purple-600 font-bold">*</span>
        </label>
        <input
          type="text"
          value={cardHolderName}
          onChange={(e) => {
            setCardHolderName(e.target.value);
            setTouched((p) => ({ ...p, cardHolder: true }));
          }}
          onBlur={() => setTouched((p) => ({ ...p, cardHolder: true }))}
          placeholder="Test"
          className={`w-full h-9 px-3 rounded-lg bg-slate-50 border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all ${
            touched.cardHolder && !nameCheck.isValid && cardHolderName.length > 0
              ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
              : 'border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20'
          }`}
          required
        />
        {touched.cardHolder && !nameCheck.isValid && cardHolderName.length > 0 && (
          <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-600 font-medium">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{nameCheck.error}</span>
          </p>
        )}
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
            onBlur={() => setTouched((p) => ({ ...p, expiry: true }))}
            placeholder="03 / 28"
            maxLength={7}
            className={`w-full h-9 px-3 rounded-lg bg-slate-50 border text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all text-center ${
              touched.expiry && !expiryCheck.isValid && expiryDate.length > 0
                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
                : 'border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20'
            }`}
            required
          />
          {touched.expiry && !expiryCheck.isValid && expiryDate.length > 0 && (
            <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-600 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{expiryCheck.error}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
            CVV / CVC <span className="text-purple-600 font-bold">*</span>
          </label>
          <input
            type="password"
            maxLength={4}
            value={cvv}
            onChange={(e) => {
              setCvv(e.target.value.replace(/\D/g, ''));
              setTouched((p) => ({ ...p, cvv: true }));
            }}
            onBlur={() => setTouched((p) => ({ ...p, cvv: true }))}
            placeholder="123"
            className={`w-full h-9 px-3 rounded-lg bg-slate-50 border text-xs font-mono font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition-all text-center ${
              touched.cvv && !cvvCheck.isValid && cvv.length > 0
                ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
                : 'border-slate-200 focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20'
            }`}
            required
          />
          {touched.cvv && !cvvCheck.isValid && cvv.length > 0 && (
            <p className="flex items-center gap-1 mt-1 text-[10px] text-rose-600 font-medium">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{cvvCheck.error}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-slate-500 font-medium">
        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>Cards are processed directly via Cashfree PCI-DSS Certified Vault.</span>
      </div>
    </div>
  );
}
