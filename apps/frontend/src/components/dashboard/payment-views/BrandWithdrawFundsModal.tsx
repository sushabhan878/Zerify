'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BrandWithdrawAmountStep from './BrandWithdrawAmountStep';
import ZerifyCheckoutContainer from './checkout/ZerifyCheckoutContainer';

interface BrandWithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: (amount?: number) => void;
  initialAmount?: number;
}

export default function BrandWithdrawFundsModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
  initialAmount,
}: BrandWithdrawFundsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'SELECT_AMOUNT' | 'CHECKOUT'>('SELECT_AMOUNT');
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount || 5000);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT_AMOUNT');
      setSelectedAmount(
        initialAmount && initialAmount <= availableBalance
          ? initialAmount
          : Math.min(5000, Math.floor(availableBalance))
      );
    }
  }, [isOpen, initialAmount, availableBalance]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Soft warm/amber & purple ambient glow in backdrop */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {step === 'SELECT_AMOUNT' ? (
        <BrandWithdrawAmountStep
          availableBalance={availableBalance}
          initialAmount={selectedAmount}
          onContinue={(chosenAmount) => {
            setSelectedAmount(chosenAmount);
            setStep('CHECKOUT');
          }}
          onClose={onClose}
        />
      ) : (
        /* Modal Container constrained to fixed height, identical to Add Money */
        <div className="relative z-10 w-full max-w-4xl h-[560px] max-h-[88vh] flex items-center justify-center my-auto animate-in fade-in zoom-in-95 duration-300">
          <ZerifyCheckoutContainer
            mode="WITHDRAW"
            availableBalance={availableBalance}
            fixedAmount={selectedAmount}
            onClose={onClose}
            onChangeAmount={() => setStep('SELECT_AMOUNT')}
            onSuccess={(amt) => {
              onSuccess?.(amt);
            }}
          />
        </div>
      )}
    </div>,
    document.body
  );
}
