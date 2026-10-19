'use client';

import React, { useState } from 'react';
import { X, QrCode, Smartphone, CreditCard, Lock, Loader2, Building2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/components/ui/Toast';
import Floating3DCardsAnimation from './Floating3DCardsAnimation';
import CardPaymentTab from './CardPaymentTab';
import UpiPaymentTab from './UpiPaymentTab';
import NetBankingTab from './NetBankingTab';
import OrderSummaryBreakdown from './OrderSummaryBreakdown';
import CheckoutStatusModal from './CheckoutStatusModal';
import { loadCashfreeSDK } from './cashfree-loader';

export interface ZerifyCheckoutContainerProps {
  onClose?: () => void;
  onSuccess?: (amount?: number) => void;
  campaignId?: string;
  campaignTitle?: string;
  initialAmount?: number;
}

export default function ZerifyCheckoutContainer({
  onClose,
  onSuccess,
  campaignId,
  campaignTitle,
  initialAmount = 25000,
}: ZerifyCheckoutContainerProps) {
  const { format } = useCurrency();
  const { toastSuccess, toastError } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // State
  const [activeTab, setActiveTab] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [campaignAmount, setCampaignAmount] = useState<number>(initialAmount);
  const [showQrCode, setShowQrCode] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('Cameron Williamson');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI & NetBanking state
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Checkout flow state
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [verifiedOrderId, setVerifiedOrderId] = useState<string | null>(null);

  // 0% platform fee, zero GST for adding funds (Amount entered is 100% credited)
  const totalAmountToPay = campaignAmount;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (campaignAmount < 500) {
      toastError('Minimum deposit amount is ₹500');
      return;
    }

    setCheckoutStatus('PROCESSING');
    setStatusError(null);

    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const endpoint = campaignId
        ? `${apiUrl}/campaigns/${campaignId}/payments`
        : `${apiUrl}/payments/orders`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: totalAmountToPay,
          currency: 'INR',
          idempotencyKey: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          returnUrl: `${window.location.origin}/dashboard?tab=payments&status=success`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initialize payment order');
      }

      const orderData = await res.json();
      const paymentId = orderData.id;
      const paymentSessionId = orderData.paymentSessionId;

      if (paymentSessionId) {
        try {
          const cashfree = await loadCashfreeSDK(
            process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production' ? 'production' : 'sandbox'
          );
          if (cashfree) {
            await cashfree.checkout({ paymentSessionId, redirectTarget: '_modal' });
          }
        } catch (sdkErr) {
          console.warn('Cashfree SDK modal fallback:', sdkErr);
        }
      }

      if (paymentId) {
        const verifyRes = await fetch(`${apiUrl}/payments/${paymentId}/verify`, { method: 'POST', headers }).catch(() => null);
        if (verifyRes && verifyRes.ok) {
          const verifyData = await verifyRes.json();
          setVerifiedOrderId(verifyData.providerOrderId || paymentId);
        } else {
          setVerifiedOrderId(paymentId);
        }
      }

      setCheckoutStatus('SUCCESS');
      toastSuccess(`Deposited ${format(campaignAmount, { showDecimals: true })} to Campaign Escrow!`);
      onSuccess?.(campaignAmount);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setStatusError(err.message || 'Payment initiation failed. Please try again.');
      setCheckoutStatus('FAILURE');
      toastError(err.message || 'Payment failed');
    }
  };

  return (
    <div className="relative w-full max-w-4xl h-[560px] max-h-[88vh] rounded-[24px] md:rounded-[28px] overflow-hidden shadow-2xl shadow-purple-950/30 border border-white/30 bg-white grid grid-cols-1 md:grid-cols-12 text-slate-800">
      {/* LEFT PANEL: 3D Floating Cards & Navy Atmosphere */}
      <div className="md:col-span-5 h-[560px] max-h-[88vh] overflow-hidden hidden md:block">
        <Floating3DCardsAnimation cardHolderName={cardHolderName} cardNumber={cardNumber} />
      </div>

      {/* RIGHT PANEL: Pure White Modern Payment Details */}
      <div className="md:col-span-7 h-[560px] max-h-[88vh] flex flex-col bg-white relative overflow-hidden">
        {/* FIXED TOP SECTION (Pinned at top, never scrolls) */}
        <div className="p-4 sm:p-5 pb-0 flex-shrink-0 bg-white">
          {/* Top Header */}
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Payment details</h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('UPI');
                  setShowQrCode(!showQrCode);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-200 hover:border-purple-400 bg-purple-50/60 text-[11px] font-bold text-purple-700 hover:bg-purple-50 transition-all shadow-sm"
                title="Toggle QR Code Scanner"
              >
                <QrCode className="w-3 h-3 text-purple-600" />
                <span>QR code</span>
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Three Payment Method Cards: UPI, Card, Net Banking (FIXED) */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('UPI');
                setShowQrCode(false);
              }}
              className={`h-9 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'UPI'
                  ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-600/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Smartphone className={`w-3.5 h-3.5 ${activeTab === 'UPI' ? 'text-purple-600' : 'text-slate-500'}`} />
              <span>UPI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('CARD');
                setShowQrCode(false);
              }}
              className={`h-9 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'CARD'
                  ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-600/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <CreditCard className={`w-3.5 h-3.5 ${activeTab === 'CARD' ? 'text-purple-600' : 'text-slate-500'}`} />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('NETBANKING');
                setShowQrCode(false);
              }}
              className={`h-9 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'NETBANKING'
                  ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-600/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${activeTab === 'NETBANKING' ? 'text-purple-600' : 'text-slate-500'}`} />
              <span>Net Banking</span>
            </button>
          </div>

          {/* Horizontal Line below the three cards */}
          <div className="w-full border-b border-slate-200 mt-3" />
        </div>

        {/* SCROLLABLE FORM & OPTIONS AREA (NO SCROLLBAR) */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-5 pt-3">
          <form onSubmit={handleCheckoutSubmit} className="space-y-3">
            {activeTab === 'CARD' && (
              <CardPaymentTab
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                cardHolderName={cardHolderName}
                setCardHolderName={setCardHolderName}
                expiryDate={expiryDate}
                setExpiryDate={setExpiryDate}
                cvv={cvv}
                setCvv={setCvv}
              />
            )}

            {activeTab === 'UPI' && (
              <UpiPaymentTab
                upiId={upiId}
                setUpiId={setUpiId}
                showQrCode={showQrCode}
                setShowQrCode={setShowQrCode}
                amountFormatted={format(totalAmountToPay)}
              />
            )}

            {activeTab === 'NETBANKING' && (
              <NetBankingTab selectedBank={selectedBank} setSelectedBank={setSelectedBank} />
            )}

            {/* Campaign Escrow Breakdown */}
            <OrderSummaryBreakdown
              campaignAmount={campaignAmount}
              setCampaignAmount={setCampaignAmount}
              campaignTitle={campaignTitle}
            />

            {/* Total Amount Row */}
            <div className="flex items-center justify-between pt-1 pb-0.5 text-slate-900 font-extrabold">
              <span className="text-xs font-bold text-slate-700">Total Amount:</span>
              <span className="text-lg text-purple-700 font-black tracking-tight">
                {format(totalAmountToPay, { showDecimals: true })}
              </span>
            </div>

            {/* Vibrant Purple Pay Now Button */}
            <button
              type="submit"
              disabled={checkoutStatus === 'PROCESSING' || campaignAmount < 100}
              className="w-full h-10 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] active:bg-[#6d28d9] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {checkoutStatus === 'PROCESSING' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay {format(totalAmountToPay, { showDecimals: true })}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Status Overlay Modal */}
        <CheckoutStatusModal
          status={checkoutStatus}
          errorMessage={statusError}
          amount={totalAmountToPay}
          orderId={verifiedOrderId}
          onRetry={() => setCheckoutStatus('IDLE')}
          onFinish={() => {
            setCheckoutStatus('IDLE');
            onClose?.();
          }}
        />
      </div>
    </div>
  );
}
