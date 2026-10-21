'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  ArrowDownRight,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/components/ui/Toast';

interface BankAccountData {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  bankName?: string;
}

interface BrandWithdrawDestinationStepProps {
  amount: number;
  availableBalance: number;
  onClose: () => void;
  onChangeAmount: () => void;
  onSuccess?: (amount: number) => void;
}

const COMMON_UPI_HANDLES = ['@okhdfcbank', '@okicici', '@oksbi', '@paytm', '@ybl', '@ibl'];

export default function BrandWithdrawDestinationStep({
  amount,
  availableBalance,
  onClose,
  onChangeAmount,
  onSuccess,
}: BrandWithdrawDestinationStepProps) {
  const { format, symbol } = useCurrency();
  const { toastSuccess, toastError } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const [activeTab, setActiveTab] = useState<'BANK' | 'UPI'>('BANK');

  // Bank form state
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [saveBank, setSaveBank] = useState(true);

  // UPI form state
  const [upiId, setUpiId] = useState('');
  const [saveUpi, setSaveUpi] = useState(true);

  // Saved destinations from wallet profile
  const [savedBanks, setSavedBanks] = useState<BankAccountData[]>([]);
  const [savedUpiList, setSavedUpiList] = useState<string[]>([]);

  // Submission & status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    transferId: string;
    referenceId: string;
    amount: number;
    newBalance: number;
    destination: string;
  } | null>(null);

  // Fetch saved destinations on mount
  useEffect(() => {
    const token = localStorage.getItem('zerify_token');
    if (!token) return;

    fetch(`${apiUrl}/wallet`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.savedUpiIds) && data.savedUpiIds.length > 0) {
            setSavedUpiList(data.savedUpiIds);
            setUpiId(data.savedUpiIds[0]);
          }
          if (Array.isArray(data.savedBankAccounts) && data.savedBankAccounts.length > 0) {
            setSavedBanks(data.savedBankAccounts);
            const first = data.savedBankAccounts[0];
            setAccountHolderName(first.accountHolderName || '');
            setAccountNumber(first.accountNumber || '');
            setConfirmAccountNumber(first.accountNumber || '');
            setIfscCode(first.ifscCode || '');
            setBankName(first.bankName || '');
          }
        }
      })
      .catch(() => {});
  }, [apiUrl]);

  // Auto-detect bank from IFSC prefix
  const handleIfscChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    setIfscCode(clean);
    if (clean.length >= 4 && !bankName) {
      const prefix = clean.slice(0, 4);
      const bankMap: Record<string, string> = {
        HDFC: 'HDFC Bank',
        SBIN: 'State Bank of India',
        ICIC: 'ICICI Bank',
        UTIB: 'Axis Bank',
        KKBK: 'Kotak Mahindra Bank',
        PUNB: 'Punjab National Bank',
        BARB: 'Bank of Baroda',
        CNRB: 'Canara Bank',
        UBIN: 'Union Bank of India',
        YESB: 'Yes Bank',
        IDFB: 'IDFC FIRST Bank',
      };
      if (bankMap[prefix]) {
        setBankName(bankMap[prefix]);
      }
    }
  };

  const handleSelectSavedBank = (b: BankAccountData) => {
    setAccountHolderName(b.accountHolderName);
    setAccountNumber(b.accountNumber);
    setConfirmAccountNumber(b.accountNumber);
    setIfscCode(b.ifscCode);
    setBankName(b.bankName || '');
  };

  const handleAppendUpiHandle = (handle: string) => {
    const base = upiId.includes('@') ? upiId.split('@')[0] : upiId;
    setUpiId(`${base}${handle}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'BANK') {
      if (!accountHolderName.trim()) {
        setErrorMsg('Please enter account holder name');
        return;
      }
      const cleanAcc = accountNumber.replace(/\D/g, '');
      if (cleanAcc.length < 8 || cleanAcc.length > 20) {
        setErrorMsg('Please enter a valid bank account number (8 to 20 digits)');
        return;
      }
      if (cleanAcc !== confirmAccountNumber.replace(/\D/g, '')) {
        setErrorMsg('Bank account numbers do not match');
        return;
      }
      if (ifscCode.length !== 11) {
        setErrorMsg('IFSC code must be exactly 11 characters (e.g. HDFC0000123)');
        return;
      }
    } else {
      if (!upiId || !upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('zerify_token');
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      };

      const payload: Record<string, any> = {
        amount,
        currency: 'INR',
        payoutMethod: activeTab === 'BANK' ? 'bank_transfer' : 'upi',
        saveDestination: activeTab === 'BANK' ? saveBank : saveUpi,
      };

      if (activeTab === 'BANK') {
        payload.bankAccount = {
          accountNumber: accountNumber.replace(/\s+/g, ''),
          ifscCode: ifscCode.trim().toUpperCase(),
          accountHolderName: accountHolderName.trim(),
          bankName: bankName.trim() || 'Bank',
        };
      } else {
        payload.upiId = upiId.trim();
      }

      const res = await fetch(`${apiUrl}/wallet/withdraw`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to process withdrawal');
      }

      const resData = await res.json();
      const destText =
        activeTab === 'BANK'
          ? `${bankName || 'Bank'} (••••${accountNumber.slice(-4)})`
          : upiId.trim();

      setSuccessData({
        transferId: resData.transferId || `wd_${Date.now()}`,
        referenceId: resData.referenceId || 'CASHFREE-SETTLED',
        amount,
        newBalance: resData.newBalance ?? Math.max(0, availableBalance - amount),
        destination: destText,
      });

      toastSuccess(`Successfully initiated withdrawal of ${format(amount, { showDecimals: true })}!`);
      onSuccess?.(amount);
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setErrorMsg(err.message || 'Withdrawal failed. Please check details or contact support.');
      toastError(err.message || 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already successful, render confirmation card
  if (successData) {
    return (
      <div className="relative w-full max-w-xl bg-slate-950/95 border border-white/10 rounded-2xl md:rounded-[28px] shadow-2xl backdrop-blur-2xl p-7 text-white animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Payout Initiated Successfully
            </span>
            <h2 className="text-2xl font-black text-white mt-2">
              {format(successData.amount, { showDecimals: true })}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Transferred directly to {successData.destination}
            </p>
          </div>

          {/* Details breakdown */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2.5 text-xs text-left">
            <div className="flex items-center justify-between text-slate-400">
              <span>Transfer Reference</span>
              <span className="font-mono text-white text-[11px] font-bold">{successData.referenceId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Transfer ID</span>
              <span className="font-mono text-slate-300 text-[11px]">{successData.transferId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Provider Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Cashfree Payout Completed
              </span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between font-bold">
              <span className="text-slate-300">Updated Wallet Balance</span>
              <span className="text-white text-sm">{format(successData.newBalance, { showDecimals: true })}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl bg-slate-950/95 border border-white/10 rounded-2xl md:rounded-[28px] shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col md:flex-row text-white animate-in zoom-in-95 duration-200">
      {/* Left/Main Form Column */}
      <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[88vh] no-scrollbar">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onChangeAmount}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Change Amount"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight">Withdrawal Destination</h2>
                <p className="text-xs text-slate-400 font-medium">Select where to receive your funds</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {format(amount, { showDecimals: true })}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Destination Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('BANK');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                activeTab === 'BANK'
                  ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-500 text-white shadow-md shadow-purple-900/30'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <Building2 className={`w-4 h-4 ${activeTab === 'BANK' ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>Bank Account (IMPS/NEFT)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('UPI');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all ${
                activeTab === 'UPI'
                  ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-500 text-white shadow-md shadow-purple-900/30'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <Zap className={`w-4 h-4 ${activeTab === 'UPI' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>UPI Transfer (Instant)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bank Form */}
          {activeTab === 'BANK' && (
            <form onSubmit={handleSubmit} id="withdraw-form" className="mt-5 space-y-3.5">
              {/* Saved Banks Pills */}
              {savedBanks.length > 0 && (
                <div className="space-y-1.5 pb-2 border-b border-white/5">
                  <span className="text-[11px] font-semibold text-slate-400">Saved Bank Accounts</span>
                  <div className="flex flex-wrap gap-2">
                    {savedBanks.map((b, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSavedBank(b)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-left truncate flex items-center gap-1.5 ${
                          accountNumber === b.accountNumber
                            ? 'bg-purple-600/30 border-purple-500 text-white ring-1 ring-purple-500'
                            : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{b.bankName || 'Bank'} (••••{b.accountNumber.slice(-4)})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Account Holder Name <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. John Doe / Company Pvt Ltd"
                  className="w-full h-10 px-3.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Account Number <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter account number"
                    className="w-full h-10 px-3.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Confirm Account Number <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter account number"
                    className="w-full h-10 px-3.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    IFSC Code <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => handleIfscChange(e.target.value)}
                    placeholder="e.g. HDFC0000123"
                    maxLength={11}
                    className="w-full h-10 px-3.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs font-bold uppercase text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Auto-detected or enter name"
                    className="w-full h-10 px-3.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveBank}
                  onChange={(e) => setSaveBank(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-0"
                />
                <span className="text-[11px] font-semibold text-slate-400">
                  Save this bank account for 1-click future withdrawals
                </span>
              </label>
            </form>
          )}

          {/* UPI Form */}
          {activeTab === 'UPI' && (
            <form onSubmit={handleSubmit} id="withdraw-form" className="mt-5 space-y-3.5">
              {/* Saved UPI IDs */}
              {savedUpiList.length > 0 && (
                <div className="space-y-1.5 pb-2 border-b border-white/5">
                  <span className="text-[11px] font-semibold text-slate-400">Saved UPI IDs</span>
                  <div className="flex flex-wrap gap-2">
                    {savedUpiList.map((id, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setUpiId(id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all truncate flex items-center gap-1.5 ${
                          upiId === id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                            : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  UPI VPA ID <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                    ⚡
                  </span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.trim())}
                    placeholder="yourname@okhdfcbank"
                    className="w-full h-10 pl-8 pr-3.5 bg-slate-900/90 border border-white/10 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Quick Handle Suffix Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-medium">Quick handles:</span>
                {COMMON_UPI_HANDLES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleAppendUpiHandle(h)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveUpi}
                  onChange={(e) => setSaveUpi(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-purple-600 focus:ring-0"
                />
                <span className="text-[11px] font-semibold text-slate-400">
                  Save this UPI ID for 1-click future withdrawals
                </span>
              </label>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Automated 256-bit bank encrypted payout settlement powered by Cashfree.</span>
        </div>
      </div>

      {/* Right Column / Order Summary */}
      <div className="w-full md:w-80 bg-slate-900/90 border-t md:border-t-0 md:border-l border-white/10 p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Withdrawal Summary</h3>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Available Balance</span>
              <span className="font-bold text-white">{format(availableBalance, { showDecimals: true })}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Withdrawal Amount</span>
              <span className="font-black text-amber-400">-{format(amount, { showDecimals: true })}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Platform Fee</span>
              <span className="text-emerald-400 font-bold">₹0.00 (Free)</span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-white">
              <span>Remaining Balance</span>
              <span className="text-slate-300 font-black">{format(Math.max(0, availableBalance - amount), { showDecimals: true })}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[11px]">Instant Processing</p>
              <p className="text-[10px] text-amber-400/80 mt-0.5">
                Funds are dispatched via Cashfree IMPS / UPI rails immediately upon confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <button
            type="submit"
            form="withdraw-form"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Transfer...</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4" />
                <span>Confirm & Withdraw {format(amount, { showDecimals: true })}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onChangeAmount}
            disabled={isSubmitting}
            className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Change Amount
          </button>
        </div>
      </div>
    </div>
  );
}
