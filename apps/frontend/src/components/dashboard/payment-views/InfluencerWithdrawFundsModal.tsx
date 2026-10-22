'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import InfluencerWithdrawAmountStep from './InfluencerWithdrawAmountStep';
import ZerifyCheckoutContainer from './checkout/ZerifyCheckoutContainer';

export interface InfluencerWithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: (amount?: number) => void;
  initialAmount?: number;
}

export default function InfluencerWithdrawFundsModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
  initialAmount,
}: InfluencerWithdrawFundsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<'SELECT_AMOUNT' | 'CHECKOUT'>('SELECT_AMOUNT');

  // Default to the full amount stored in DB as requested by user
  const defaultGross = initialAmount && initialAmount <= availableBalance
    ? initialAmount
    : Math.max(0, Math.floor(availableBalance));

  const [selectedGrossAmount, setSelectedGrossAmount] = useState<number>(defaultGross);
  const [selectedNetAmount, setSelectedNetAmount] = useState<number>(
    Math.max(0, Number((defaultGross * 0.93).toFixed(2)))
  );
  const [zerifyFee, setZerifyFee] = useState<number>(
    Number((defaultGross * 0.07).toFixed(2))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep('SELECT_AMOUNT');
      const gross = initialAmount && initialAmount <= availableBalance
        ? initialAmount
        : Math.max(0, Math.floor(availableBalance));
      const fee = Number((gross * 0.07).toFixed(2));
      const net = Math.max(0, Number((gross - fee).toFixed(2)));
      setSelectedGrossAmount(gross);
      setZerifyFee(fee);
      setSelectedNetAmount(net);
    }
  }, [isOpen, initialAmount, availableBalance]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Soft warm/amber & purple ambient glow in backdrop */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {step === 'SELECT_AMOUNT' ? (
        <InfluencerWithdrawAmountStep
          availableBalance={availableBalance}
          initialAmount={selectedGrossAmount}
          onContinue={(gross, net, fee) => {
            setSelectedGrossAmount(gross);
            setSelectedNetAmount(net);
            setZerifyFee(fee);
            setStep('CHECKOUT');
          }}
          onClose={onClose}
        />
      ) : (
        /* Modal Container constrained to fixed height, identical to Brand side */
        <div className="relative z-10 w-full max-w-4xl h-[560px] max-h-[88vh] flex items-center justify-center my-auto animate-in fade-in zoom-in-95 duration-300">
          <ZerifyCheckoutContainer
            mode="WITHDRAW"
            availableBalance={availableBalance}
            fixedAmount={selectedNetAmount}
            grossAmount={selectedGrossAmount}
            zerifyFee={zerifyFee}
            onClose={onClose}
            onChangeAmount={() => setStep('SELECT_AMOUNT')}
            onSuccess={(amt) => {
              onSuccess?.(selectedGrossAmount);
            }}
          />
        </div>
      )}
    </div>,
    document.body
  );
}
