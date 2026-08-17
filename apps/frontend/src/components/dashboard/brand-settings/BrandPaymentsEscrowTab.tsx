'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Lock, Check, Loader2, Sparkles, Mail, FileText, Wallet } from 'lucide-react';

interface BrandPaymentsEscrowTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

export default function BrandPaymentsEscrowTab({ initialData, onSaveSuccess }: BrandPaymentsEscrowTabProps) {
  const escrowData = initialData?.escrowSetup || {};
  const [billingEmail, setBillingEmail] = useState(escrowData.billingEmail || '');
  const [taxId, setTaxId] = useState(escrowData.taxId || '');
  const [paymentMethod, setPaymentMethod] = useState(escrowData.paymentMethod || 'Escrow Vault Wallet');
  const [autoDeposit, setAutoDeposit] = useState<boolean>(escrowData.autoDeposit ?? true);

  // Sync state whenever initialData changes from backend API
  React.useEffect(() => {
    if (initialData?.escrowSetup) {
      const eData = initialData.escrowSetup;
      if (eData.billingEmail !== undefined) setBillingEmail(eData.billingEmail || '');
      if (eData.taxId !== undefined) setTaxId(eData.taxId || '');
      if (eData.paymentMethod !== undefined) setPaymentMethod(eData.paymentMethod || 'Escrow Vault Wallet');
      if (eData.autoDeposit !== undefined) setAutoDeposit(eData.autoDeposit);
    }
  }, [initialData]);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/brand/escrow-setup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          escrowSetup: {
            billingEmail,
            taxId,
            paymentMethod,
            autoDeposit,
            escrowEnabled: true,
          },
          isOnboardingCompleted: true,
        }),
      });

      const updatedProfile = await res.json();
      try {
        localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event('zerify_brand_profile_update'));
      } catch (e) {}

      setStatusMsg({ type: 'success', text: 'Payments & Escrow preferences configured successfully!' });
      onSaveSuccess?.();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving escrow settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">


      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs font-medium ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Escrow Banner Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-indigo-950/40 border border-emerald-500/30 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>Zerify Smart Escrow Guarantee</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40">ACTIVE</span>
          </h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            Your campaign funds are securely locked in Cashfree Escrow and released only when creator deliverables meet contract criteria.
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Billing Email</label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="finance@company.com"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tax ID / GSTIN / VAT (Optional)</label>
          <div className="relative">
            <FileText className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. 27AAAAA0000A1Z5 / US-EIN"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Preferred Escrow Funding Source</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'Escrow Vault Wallet', label: 'Zerify Escrow Wallet', icon: Wallet },
            { id: 'Credit / Debit Card', label: 'Credit / Debit Card', icon: CreditCard },
            { id: 'UPI & NetBanking', label: 'UPI / Direct Bank Transfer', icon: Lock },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = paymentMethod === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setPaymentMethod(item.id)}
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950/40 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto Deposit Toggle */}
      <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Automatic Escrow Lock on Deal Sign
          </span>
          <p className="text-[11px] text-slate-400">Automatically allocate funds to escrow when creator accepts campaign contract</p>
        </div>

        <button
          type="button"
          onClick={() => setAutoDeposit(!autoDeposit)}
          className={`w-11 h-6 rounded-full p-1 transition-colors ${autoDeposit ? 'bg-emerald-600' : 'bg-slate-800'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoDeposit ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="pt-3 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>Complete Escrow Setup</span>
        </button>
      </div>
    </form>
  );
}
