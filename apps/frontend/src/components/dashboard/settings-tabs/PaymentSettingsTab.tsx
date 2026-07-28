'use client';

import React, { useState } from 'react';
import { CreditCard, Building2, ShieldCheck, Lock, CheckCircle2, AlertCircle, Sparkles, Check } from 'lucide-react';

interface PaymentSettingsTabProps {
  onSaveSuccess?: () => void;
}

export default function PaymentSettingsTab({ onSaveSuccess }: PaymentSettingsTabProps) {
  const [accountHolder, setAccountHolder] = useState('Sarah Jenkins');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [upiId, setUpiId] = useState('sarahjenkins@okicici');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [payoutSchedule, setPayoutSchedule] = useState('Instant Automated');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Cashfree Gateway Integration Notice Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-slate-900/80 border border-purple-500/30 backdrop-blur-xl shadow-xl space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-2">
              <span>Cashfree Payments Partner Integration</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9.5px] font-extrabold uppercase">
                Active Escrow Ready
              </span>
            </h4>
            <p className="text-[11.5px] text-slate-300/90 leading-relaxed pt-0.5">
              Zerify utilizes Cashfree Payment Gateway to manage secure escrow releases and automated payouts directly to your local bank account or UPI address.
            </p>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          <span>Bank Account Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Account Holder Name</label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">IFSC / Swift Code</label>
            <input
              type="text"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-bold uppercase tracking-wider"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Bank Account Number</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-bold tracking-widest"
              />
            </div>
          </div>
        </div>
      </div>

      {/* UPI & Tax Verification */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>UPI Address & Tax KYC Verification</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">UPI Virtual Payment Address (VPA)</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="username@upi"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">PAN Card / Tax Registration ID</label>
            <div className="relative">
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 font-bold uppercase tracking-wider"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> KYC Verified
              </span>
            </div>
          </div>
        </div>

        {/* Payout Speed Preference */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-400 block mb-1.5">Cashfree Payout Settlement Frequency</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['Instant Automated', 'Weekly Bulk Settlement'].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setPayoutSchedule(freq)}
                className={`p-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between ${
                  payoutSchedule === freq
                    ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-md'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>{freq}</span>
                {payoutSchedule === freq && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Trigger */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-4 h-4" /> Payment Settings Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Payment Info'}</span>
        </button>
      </div>
    </form>
  );
}
