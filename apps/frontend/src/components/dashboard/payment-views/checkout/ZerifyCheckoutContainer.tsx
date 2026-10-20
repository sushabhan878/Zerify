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

export interface ZerifyCheckoutContainerProps {
  onClose?: () => void;
  onSuccess?: (amount?: number) => void;
  campaignId?: string;
  campaignTitle?: string;
  initialAmount?: number;
  fixedAmount?: number;
  onChangeAmount?: () => void;
}

export default function ZerifyCheckoutContainer({
  onClose,
  onSuccess,
  campaignId,
  campaignTitle,
  initialAmount = 1000,
  fixedAmount,
  onChangeAmount,
}: ZerifyCheckoutContainerProps) {
  const { format } = useCurrency();
  const { toastSuccess, toastError } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Amount is strictly locked from pre-selection
  const effectiveAmount = fixedAmount ?? initialAmount;

  // State
  const [activeTab, setActiveTab] = useState<'CARD' | 'UPI' | 'NETBANKING'>('UPI');
  const [showQrCode, setShowQrCode] = useState(false);

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('Cameron Williamson');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI & NetBanking state
  const [upiId, setUpiId] = useState('');
  const [savedUpiIds, setSavedUpiIds] = useState<string[]>([]);
  const [saveUpiChoice, setSaveUpiChoice] = useState(true);
  const [isEnteringNewUpi, setIsEnteringNewUpi] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Load saved UPI IDs from local cache and backend on mount
  React.useEffect(() => {
    try {
      const cached = localStorage.getItem('zerify_saved_upi_ids');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedUpiIds(parsed);
          setUpiId(parsed[0]);
          setIsEnteringNewUpi(false);
        } else {
          setIsEnteringNewUpi(true);
        }
      } else {
        setIsEnteringNewUpi(true);
      }
    } catch {
      setIsEnteringNewUpi(true);
    }

    const token = localStorage.getItem('zerify_token');
    if (token) {
      fetch(`${apiUrl}/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.savedUpiIds) && data.savedUpiIds.length > 0) {
            setSavedUpiIds(data.savedUpiIds);
            localStorage.setItem('zerify_saved_upi_ids', JSON.stringify(data.savedUpiIds));
            setUpiId((prev) => prev || data.savedUpiIds[0]);
            setIsEnteringNewUpi(false);
          }
        })
        .catch(() => {});
    }
  }, [apiUrl]);

  const handleDeleteSavedUpi = async (idToDelete: string) => {
    const nextList = savedUpiIds.filter((id) => id !== idToDelete);
    setSavedUpiIds(nextList);
    try {
      localStorage.setItem('zerify_saved_upi_ids', JSON.stringify(nextList));
      const token = localStorage.getItem('zerify_token');
      if (token) {
        await fetch(`${apiUrl}/wallet/saved-upi/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ upiId: idToDelete }),
        });
      }
    } catch {}

    if (upiId === idToDelete) {
      if (nextList.length > 0) {
        setUpiId(nextList[0]);
      } else {
        setUpiId('');
        setIsEnteringNewUpi(true);
      }
    }
  };

  // Checkout flow state
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'PROCESSING' | 'AWAITING_APPROVAL' | 'SUCCESS' | 'FAILURE'>('IDLE');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [verifiedOrderId, setVerifiedOrderId] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(300);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clear polling & timers on unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const clearTimers = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // 0% platform fee, zero GST for adding funds (Amount entered is 100% credited)
  const totalAmountToPay = effectiveAmount;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmountToPay < 100) {
      toastError('Minimum deposit amount is ₹100');
      return;
    }

    if (activeTab === 'UPI' && !showQrCode) {
      if (!upiId || !upiId.trim() || !upiId.includes('@')) {
        toastError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or success@upi)');
        return;
      }
    }

    clearTimers();
    setCheckoutStatus('PROCESSING');
    setStatusError(null);
    setTimeLeftSeconds(300);

    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const isWalletTopup = !campaignId;
      const endpoint = isWalletTopup
        ? `${apiUrl}/wallet/add-money`
        : `${apiUrl}/campaigns/${campaignId}/payments`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: totalAmountToPay,
          currency: 'INR',
          idempotencyKey: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          returnUrl: `${window.location.origin}/dashboard?tab=payments&status=success`,
          upiId: activeTab === 'UPI' && !showQrCode ? upiId.trim() : undefined,
          saveUpiId: activeTab === 'UPI' && !showQrCode ? saveUpiChoice : false,
          channel: activeTab === 'UPI' && showQrCode ? 'qrcode' : 'collect',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initialize payment order');
      }

      const orderData = await res.json();
      const paymentId = orderData.id;

      // If dynamic QR code was generated by Cashfree, display it
      if (orderData.qrCode) {
        setQrCodeData(orderData.qrCode);
      }

      // Update local saved UPI IDs cache if user selected to save
      if (activeTab === 'UPI' && !showQrCode && saveUpiChoice && upiId.trim()) {
        const clean = upiId.trim();
        if (!savedUpiIds.includes(clean)) {
          const updated = [...savedUpiIds, clean];
          setSavedUpiIds(updated);
          try {
            localStorage.setItem('zerify_saved_upi_ids', JSON.stringify(updated));
          } catch {}
        }
      }

      if (!paymentId) {
        throw new Error('Payment ID not returned from provider');
      }

      const verifyEndpoint = isWalletTopup
        ? `${apiUrl}/wallet/add-money/${paymentId}/verify`
        : `${apiUrl}/payments/${paymentId}/verify`;

      // Production-grade Polling Loop:
      // Checks status every 2.5 seconds while user enters PIN on their phone
      if (activeTab === 'UPI' && !showQrCode) {
        setCheckoutStatus('AWAITING_APPROVAL');

        // Start countdown
        let remaining = 300;
        timerIntervalRef.current = setInterval(() => {
          remaining -= 1;
          setTimeLeftSeconds(remaining);
          if (remaining <= 0) {
            clearTimers();
            setCheckoutStatus('FAILURE');
            setStatusError('Transaction request timed out. Please try again.');
          }
        }, 1000);

        // Immediate first check
        const initialCheck = async () => {
          try {
            const vRes = await fetch(verifyEndpoint, { method: 'POST', headers }).catch(() => null);
            if (vRes && vRes.ok) {
              const vData = await vRes.json();
              if (vData.status === 'PAID') {
                clearTimers();
                setVerifiedOrderId(vData.providerOrderId || paymentId);
                setCheckoutStatus('SUCCESS');
                toastSuccess(
                  isWalletTopup
                    ? `Successfully added ${format(totalAmountToPay, { showDecimals: true })} to your Zerify Wallet!`
                    : `Deposited ${format(totalAmountToPay, { showDecimals: true })} to Campaign Escrow!`
                );
                onSuccess?.(totalAmountToPay);
                return true;
              } else if (vData.status === 'FAILED') {
                clearTimers();
                setCheckoutStatus('FAILURE');
                setStatusError(vData.failureReason || 'Payment declined by user or bank');
                return true;
              }
            }
          } catch {}
          return false;
        };

        const alreadyDone = await initialCheck();
        if (alreadyDone) return;

        // Poll every 2.5 seconds
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const vRes = await fetch(verifyEndpoint, { method: 'POST', headers }).catch(() => null);
            if (vRes && vRes.ok) {
              const vData = await vRes.json();
              if (vData.status === 'PAID') {
                clearTimers();
                setVerifiedOrderId(vData.providerOrderId || paymentId);
                setCheckoutStatus('SUCCESS');
                toastSuccess(
                  isWalletTopup
                    ? `Successfully added ${format(totalAmountToPay, { showDecimals: true })} to your Zerify Wallet!`
                    : `Deposited ${format(totalAmountToPay, { showDecimals: true })} to Campaign Escrow!`
                );
                onSuccess?.(totalAmountToPay);
              } else if (vData.status === 'FAILED') {
                clearTimers();
                setCheckoutStatus('FAILURE');
                setStatusError(vData.failureReason || 'Payment declined by user or bank');
              }
            }
          } catch (pollErr) {
            console.warn('Poll error:', pollErr);
          }
        }, 2500);
      } else {
        // Direct non-UPI or QR code initial verification
        const verifyRes = await fetch(verifyEndpoint, { method: 'POST', headers }).catch(() => null);
        if (verifyRes) {
          if (!verifyRes.ok) {
            const errBody = await verifyRes.json().catch(() => ({}));
            throw new Error(errBody.message || 'Payment verification failed');
          }
          const verifyData = await verifyRes.json();
          if (verifyData.status === 'FAILED') {
            throw new Error(verifyData.failureReason || 'Payment failed or declined');
          }
          setVerifiedOrderId(verifyData.providerOrderId || paymentId);
        } else {
          setVerifiedOrderId(paymentId);
        }

        setCheckoutStatus('SUCCESS');
        toastSuccess(
          isWalletTopup
            ? `Successfully added ${format(totalAmountToPay, { showDecimals: true })} to your Zerify Wallet!`
            : `Deposited ${format(totalAmountToPay, { showDecimals: true })} to Campaign Escrow!`
        );
        onSuccess?.(totalAmountToPay);
      }
    } catch (err: any) {
      clearTimers();
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
                savedUpiIds={savedUpiIds}
                selectedSavedUpi={upiId}
                onSelectSavedUpi={(id) => {
                  setUpiId(id);
                  setIsEnteringNewUpi(false);
                }}
                isEnteringNewUpi={isEnteringNewUpi}
                setIsEnteringNewUpi={setIsEnteringNewUpi}
                saveUpiChoice={saveUpiChoice}
                setSaveUpiChoice={setSaveUpiChoice}
                onDeleteSavedUpi={handleDeleteSavedUpi}
                showQrCode={showQrCode}
                setShowQrCode={setShowQrCode}
                amountFormatted={format(totalAmountToPay)}
                qrCodeImage={qrCodeData}
              />
            )}

            {activeTab === 'NETBANKING' && (
              <NetBankingTab selectedBank={selectedBank} setSelectedBank={setSelectedBank} />
            )}

            {/* Campaign Escrow Breakdown */}
            <OrderSummaryBreakdown
              campaignAmount={totalAmountToPay}
              campaignTitle={campaignTitle}
              onChangeAmount={onChangeAmount}
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
              disabled={checkoutStatus === 'PROCESSING' || checkoutStatus === 'AWAITING_APPROVAL' || totalAmountToPay < 100}
              className="w-full h-10 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] active:bg-[#6d28d9] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {checkoutStatus === 'PROCESSING' || checkoutStatus === 'AWAITING_APPROVAL' ? (
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
          isWalletTopup={!campaignId}
          upiId={upiId}
          timeLeftSeconds={timeLeftSeconds}
          onRetry={() => {
            clearTimers();
            setCheckoutStatus('IDLE');
          }}
          onFinish={() => {
            clearTimers();
            setCheckoutStatus('IDLE');
            onClose?.();
          }}
        />
      </div>
    </div>
  );
}
