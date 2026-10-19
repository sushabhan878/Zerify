'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ZerifyCheckoutContainer from './checkout/ZerifyCheckoutContainer';
import LottieLoader from '@/components/ui/LottieLoader';

interface BrandDepositFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (amount?: number) => void;
  campaignId?: string;
  campaignTitle?: string;
}

export default function BrandDepositFundsModal({
  isOpen,
  onClose,
  onSuccess,
  campaignId,
  campaignTitle,
}: BrandDepositFundsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2400); // 2-3 sec loading animation as requested
      return () => clearTimeout(timer);
    } else {
      setIsLoading(true);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      {/* Soft lavender ambient glow in backdrop matching reference styling */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {isLoading ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center animate-in fade-in duration-300 pointer-events-none">
          <LottieLoader size={200} message="Loading Payment Checkout..." />
          <p className="mt-1 text-xs text-purple-200/60 font-medium">Initializing secure payment gateway & channels...</p>
        </div>
      ) : (
        /* Modal Container constrained to fixed height */
        <div className="relative z-10 w-full max-w-4xl h-[560px] max-h-[88vh] flex items-center justify-center my-auto animate-in fade-in zoom-in-95 duration-300">
          <ZerifyCheckoutContainer
            onClose={onClose}
            onSuccess={onSuccess}
            campaignId={campaignId}
            campaignTitle={campaignTitle}
          />
        </div>
      )}
    </div>,
    document.body
  );
}
