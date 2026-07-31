'use client';

import React, { useState, useEffect } from 'react';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import SingleCreatorDetailsCard from './subcomponents/SingleCreatorDetailsCard';

interface CreatorDetailsTabProps {
  onSaveSuccess?: () => void;
}

export default function CreatorDetailsTab({ onSaveSuccess }: CreatorDetailsTabProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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

  // Fetch saved creator details from DB on mount
  useEffect(() => {
    async function loadCreatorDetails() {
      try {
        const token = localStorage.getItem('zerify_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiUrl}/influencer/profile`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.niches)) setCategories(data.niches);
          if (Array.isArray(data.contentLanguages)) setLanguages(data.contentLanguages);
          if (data.minPricePerReel !== null && data.minPricePerReel !== undefined) {
            setMinAmount(String(data.minPricePerReel));
          }
          if (data.currency) setCurrency(data.currency);
          if (Array.isArray(data.collaborationTypes)) setCollabTypes(data.collaborationTypes);
          if (data.availableForBarter !== undefined) setBarterAvailable(data.availableForBarter);
          if (data.availableForRelocation !== undefined) setTravelReady(data.availableForRelocation);
          if (data.responseTime) setResponseTime(data.responseTime);
        }
      } catch (err) {
        console.warn('Could not load creator details from DB:', err);
      }
    }
    loadCreatorDetails();
  }, [apiUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      niches: categories,
      contentLanguages: languages,
      minPricePerReel: minAmount ? Number(minAmount) : undefined,
      currency,
      collaborationTypes: collabTypes,
      availableForBarter: barterAvailable,
      availableForRelocation: travelReady,
      responseTime,
    };

    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${apiUrl}/influencer/creator-details`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('API save failed, using client state:', err);
    } finally {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        if (onSaveSuccess) onSaveSuccess();
      }, 700);
    }
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
            <Check className="w-4 h-4" /> Creator Details Saved! Redirecting...
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Creator Details...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save Creator Details</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
