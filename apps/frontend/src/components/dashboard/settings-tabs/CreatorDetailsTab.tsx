'use client';

import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import SingleCreatorDetailsCard from './subcomponents/SingleCreatorDetailsCard';

interface CreatorDetailsTabProps {
  onSaveSuccess?: () => void;
}

export default function CreatorDetailsTab({ onSaveSuccess }: CreatorDetailsTabProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [collabTypes, setCollabTypes] = useState<string[]>([]);
  const [barterAvailable, setBarterAvailable] = useState(false);
  const [travelReady, setTravelReady] = useState(true);
  const [responseTime, setResponseTime] = useState('Within 24 hours');
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
      <SingleCreatorDetailsCard
        categories={categories}
        setCategories={setCategories}
        languages={languages}
        setLanguages={setLanguages}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        currency={currency}
        setCurrency={setCurrency}
        collabTypes={collabTypes}
        setCollabTypes={setCollabTypes}
        barterAvailable={barterAvailable}
        setBarterAvailable={setBarterAvailable}
        travelReady={travelReady}
        setTravelReady={setTravelReady}
        responseTime={responseTime}
        setResponseTime={setResponseTime}
      />

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" /> Creator Details Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Creator Details'}</span>
        </button>
      </div>
    </form>
  );
}

