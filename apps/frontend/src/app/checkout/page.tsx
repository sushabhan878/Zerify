'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ZerifyCheckoutContainer from '@/components/dashboard/payment-views/checkout/ZerifyCheckoutContainer';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const campaignId = searchParams.get('campaignId') || undefined;
  const campaignTitle = searchParams.get('campaignTitle') || undefined;
  const rawAmount = searchParams.get('amount');
  const initialAmount = rawAmount ? parseFloat(rawAmount) || 25000 : 25000;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#dcd6f7] via-[#e8e4f8] to-[#d4cefa] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Background ambient lighting orbs matching reference aesthetic */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-purple-400/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-400/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-300/20 blur-3xl pointer-events-none" />

      {/* Top Bar with Return Link */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 relative z-10">
        <button
          type="button"
          onClick={() => router.push('/dashboard?tab=payments')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-bold text-slate-700 shadow-sm border border-purple-200/60 backdrop-blur-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-purple-700" />
          <span>Back to Dashboard</span>
        </button>

        <span className="text-xs font-extrabold uppercase tracking-widest text-purple-900/70">
          Zerify Secure Payment
        </span>
      </div>

      {/* Split-Screen Checkout Component */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <ZerifyCheckoutContainer
          onClose={() => router.push('/dashboard?tab=payments')}
          onSuccess={() => router.push('/dashboard?tab=payments&deposit=success')}
          campaignId={campaignId}
          campaignTitle={campaignTitle}
          initialAmount={initialAmount}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
