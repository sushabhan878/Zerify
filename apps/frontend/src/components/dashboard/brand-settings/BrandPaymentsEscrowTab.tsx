'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Loader2, Mail, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface BrandPaymentsEscrowTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

export default function BrandPaymentsEscrowTab({ initialData, onSaveSuccess }: BrandPaymentsEscrowTabProps) {
  const { toastSuccess, toastError } = useToast();

  const getCachedData = () => {
    if (initialData) return initialData;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zerify_brand_profile_cache');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  };

  const cached = getCachedData();
  const escrowData = cached?.escrowSetup || {};

  const [billingEmail, setBillingEmail] = useState<string>(() => escrowData.billingEmail || cached?.user?.email || '');
  const [taxId, setTaxId] = useState<string>(() => escrowData.taxId || '');
  const [autoDeposit, setAutoDeposit] = useState<boolean>(() => escrowData.autoDeposit ?? true);
  const [saving, setSaving] = useState(false);

  // Sync state whenever initialData changes from parent
  useEffect(() => {
    if (initialData?.escrowSetup) {
      const eData = initialData.escrowSetup;
      if (eData.billingEmail !== undefined) setBillingEmail(eData.billingEmail || '');
      if (eData.taxId !== undefined) setTaxId(eData.taxId || '');
      if (eData.autoDeposit !== undefined) setAutoDeposit(eData.autoDeposit);
    }
  }, [initialData]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const currentSetup = (cached?.escrowSetup) || {};
      const updatedEscrow = {
        ...currentSetup,
        billingEmail,
        taxId,
        autoDeposit,
        escrowEnabled: true,
      };

      const res = await fetch(`${apiUrl}/brand/escrow-setup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          escrowSetup: updatedEscrow,
          isOnboardingCompleted: true,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Error saving escrow settings.');
      }

      const updatedProfile = await res.json();
      try {
        localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event('zerify_brand_profile_update'));
      } catch (e) {}

      toastSuccess('Payments & Escrow preferences saved successfully in database!');
      onSaveSuccess?.();
    } catch (err: any) {
      toastError(err.message || 'Error saving escrow settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
      <form onSubmit={handleSaveGeneral} className="space-y-5">
        {/* Billing & Tax Identity Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Billing &amp; Invoicing Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="finance@company.com"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Cashfree GST tax invoices will be sent to this email.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Tax ID / GSTIN (Saved in DB)</label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value.toUpperCase())}
                placeholder="e.g. 27AAAAA0000A1Z5"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 uppercase font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">15-digit GSTIN used for automated input tax credit (ITC).</p>
          </div>
        </div>

        {/* Auto Deposit Toggle */}
        <div className="p-4 bg-slate-950/60 border border-white/10 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Automatic Escrow Lock on Deal Signature
            </span>
            <p className="text-[11px] text-slate-400">Automatically reserve and lock funds in escrow once creator accepts a campaign contract</p>
          </div>

          <button
            type="button"
            onClick={() => setAutoDeposit(!autoDeposit)}
            className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${autoDeposit ? 'bg-emerald-600' : 'bg-slate-800'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoDeposit ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* Submit */}
        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Save Escrow Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
