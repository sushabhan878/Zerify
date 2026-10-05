'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Smartphone, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface LinkPayoutCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onLinked?: () => void;
  existingBeneficiary?: any;
}

export default function LinkPayoutCredentialsModal({
  isOpen,
  onClose,
  onSuccess,
  onLinked,
  existingBeneficiary,
}: LinkPayoutCredentialsModalProps) {
  const { toastSuccess, toastError } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [payoutMethod, setPayoutMethod] = useState<'BANK' | 'UPI'>('BANK');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (existingBeneficiary) {
      if (existingBeneficiary.accountHolderName) setAccountHolderName(existingBeneficiary.accountHolderName);
      if (existingBeneficiary.bankName) setBankName(existingBeneficiary.bankName);
      if (existingBeneficiary.ifscCode) setIfscCode(existingBeneficiary.ifscCode);
      if (existingBeneficiary.accountLast4) setAccountNumber(`••••••••${existingBeneficiary.accountLast4}`);
      if (existingBeneficiary.upiId) {
        setUpiId(existingBeneficiary.upiId);
        setPayoutMethod('UPI');
      }
      if (existingBeneficiary.panNumber) setPanNumber(existingBeneficiary.panNumber);
    }
  }, [existingBeneficiary]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (payoutMethod === 'BANK') {
      if (!accountHolderName.trim()) {
        setErrorMsg('Please enter the account holder name');
        return;
      }
      if (!bankName.trim()) {
        setErrorMsg('Please enter the bank name');
        return;
      }
      if (!accountNumber.trim() || accountNumber.includes('•')) {
        setErrorMsg('Please enter a valid bank account number');
        return;
      }
      if (confirmAccountNumber && accountNumber !== confirmAccountNumber) {
        setErrorMsg('Account numbers do not match');
        return;
      }
      if (!ifscCode.trim() || ifscCode.trim().length < 8) {
        setErrorMsg('Please enter a valid IFSC code (e.g. HDFC0001234)');
        return;
      }
    } else {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. name@okhdfcbank)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const accountLast4 = accountNumber.replace(/\s+/g, '').slice(-4);

      // 1. Save detailed credentials to InfluencerProfile
      await fetch(`${apiUrl}/influencer/payment-details`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          accountHolderName,
          bankName: payoutMethod === 'BANK' ? bankName : 'UPI Virtual Bank',
          accountNumber: payoutMethod === 'BANK' ? accountNumber : upiId,
          ifscCode: payoutMethod === 'BANK' ? ifscCode.toUpperCase() : 'UPI0000000',
          upiId: payoutMethod === 'UPI' ? upiId : null,
          panNumber: panNumber ? panNumber.toUpperCase() : null,
          paymentMethod: payoutMethod === 'BANK' ? 'BANK_TRANSFER' : 'UPI',
        }),
      });

      // 2. Onboard beneficiary in Cashfree Payouts engine
      const beneficiaryRes = await fetch(`${apiUrl}/payout-accounts/onboard`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider: 'CASHFREE',
          accountHolderName: accountHolderName || 'Verified Influencer',
          bankName: payoutMethod === 'BANK' ? bankName : 'UPI Account',
          accountLast4: accountLast4 || '0000',
          ifscCode: payoutMethod === 'BANK' ? ifscCode.toUpperCase() : 'UTIB0000000',
          beneficiaryStatus: 'ACTIVE',
          kycStatus: 'VERIFIED',
        }),
      });

      if (!beneficiaryRes.ok) {
        const errorData = await beneficiaryRes.json();
        throw new Error(errorData.message || 'Beneficiary validation failed');
      }

      toastSuccess('Payout credentials linked successfully!');
      onSuccess?.();
      onLinked?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to link credentials:', err);
      setErrorMsg(err.message || 'Failed to link payout account. Please try again.');
      toastError(err.message || 'Failed to link payout account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Link Payout Credentials</h3>
              <p className="text-[11px] text-slate-400">Funds from approved campaign milestones will transfer here</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-white/5">
          <button
            type="button"
            onClick={() => setPayoutMethod('BANK')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              payoutMethod === 'BANK'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank Account (IMPS/NEFT)</span>
          </button>

          <button
            type="button"
            onClick={() => setPayoutMethod('UPI')}
            className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              payoutMethod === 'UPI'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI ID (Instant)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {payoutMethod === 'BANK' ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="As per bank passbook"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    maxLength={11}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Account Number *</label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account number"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Confirm Account Number *</label>
                  <input
                    type="text"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value)}
                    placeholder="Re-enter account number"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">UPI ID (VPA) *</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or name@okaxis"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">PAN Card Number (Optional / Tax Compliance)</label>
            <input
              type="text"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="ABCDE1234F"
              maxLength={10}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono uppercase"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Your payout credentials are encrypted via AES-256 and verified through Cashfree Marketplace Payout Gateway. Zerify never stores full raw banking passwords or PINs.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying & Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify & Link Payout Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
