'use client';

import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import CashfreeNoticeBanner from './subcomponents/CashfreeNoticeBanner';
import BankDetailsForm from './subcomponents/BankDetailsForm';
import KycUpiForm from './subcomponents/KycUpiForm';

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
    <form onSubmit={handleSave} className="space-y-5">
      <CashfreeNoticeBanner />

      <BankDetailsForm
        accountHolder={accountHolder}
        setAccountHolder={setAccountHolder}
        ifscCode={ifscCode}
        setIfscCode={setIfscCode}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
      />

      <KycUpiForm
        upiId={upiId}
        setUpiId={setUpiId}
        panNumber={panNumber}
        setPanNumber={setPanNumber}
        payoutSchedule={payoutSchedule}
        setPayoutSchedule={setPayoutSchedule}
      />

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" /> Payment Settings Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Payment Info'}</span>
        </button>
      </div>
    </form>
  );
}
