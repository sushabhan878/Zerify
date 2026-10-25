'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ZerifyCheckoutContainer from './checkout/ZerifyCheckoutContainer';
import BrandTopupAmountStep from './BrandTopupAmountStep';

interface BrandDepositFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount?: number) => void;
  campaignId?: string;
  campaignTitle?: string;
  initialAmount?: number;
  creatorCount?: number;
}

export default function BrandDepositFundsModal({
  isOpen,
  onClose,
  onSuccess,
  campaignId,
  campaignTitle,
  initialAmount = 5000,
  creatorCount = 1,
}: BrandDepositFundsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'SELECT_AMOUNT' | 'CHECKOUT'>('SELECT_AMOUNT');
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT_AMOUNT');
      setSelectedAmount(initialAmount);
    }
  }, [isOpen, initialAmount]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Soft lavender ambient glow in backdrop matching reference styling */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {step === 'SELECT_AMOUNT' ? (
        <BrandTopupAmountStep
          initialAmount={selectedAmount}
          campaignId={campaignId}
          campaignTitle={campaignTitle}
          creatorCount={creatorCount}
          onContinue={(chosenAmount) => {
            setSelectedAmount(chosenAmount);
            setStep('CHECKOUT');
          }}
          onClose={onClose}
        />
      ) : (
        /* Modal Container constrained to fixed height */
        <div className="relative z-10 w-full max-w-4xl h-[560px] max-h-[88vh] flex items-center justify-center my-auto animate-in fade-in zoom-in-95 duration-300">
          <ZerifyCheckoutContainer
            onClose={onClose}
            onSuccess={onSuccess}
            campaignId={campaignId}
            campaignTitle={campaignTitle}
            fixedAmount={selectedAmount}
            onChangeAmount={() => setStep('SELECT_AMOUNT')}
          />
        </div>
      )}
    </div>,
    document.body
  );
}
