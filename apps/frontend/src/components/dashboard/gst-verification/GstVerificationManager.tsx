'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, AlertCircle, Loader2, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { BillingProfile, GstRegistration } from './types';
import GstDetailsCard from './GstDetailsCard';
import GstMismatchModal from './GstMismatchModal';
import GstHistoryModal from './GstHistoryModal';

const GST_STATE_PREFIXES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '19': 'West Bengal',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '32': 'Kerala',
};

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function GstVerificationManager() {
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick input bar state
  const [gstinInput, setGstinInput] = useState('');
  const [businessNameInput, setBusinessNameInput] = useState('');
  const [showBusinessNamePrompt, setShowBusinessNamePrompt] = useState(false);

  // Modals state
  const [mismatchTarget, setMismatchTarget] = useState<GstRegistration | null>(null);
  const [historyTargetId, setHistoryTargetId] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const cleanGstin = gstinInput.trim().replace(/[\s-]/g, '').toUpperCase();
  const isValidFormat = GST_REGEX.test(cleanGstin);
  const stateCode = cleanGstin.slice(0, 2);
  const detectedState = GST_STATE_PREFIXES[stateCode];

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/billing-profiles/default`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAddGstin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!isValidFormat) {
      setFeedback({ type: 'error', text: 'Please enter a valid 15-character GSTIN format.' });
      return;
    }

    const businessName = businessNameInput.trim() || undefined;
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${apiUrl}/billing-profiles/${profile.id}/gst-registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ gstin: cleanGstin, businessName, autoVerify: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to add GSTIN registration.');
      }

      await fetchProfile();
      setGstinInput('');
      setBusinessNameInput('');
      setShowBusinessNamePrompt(false);
      setFeedback({ type: 'success', text: `GSTIN ${cleanGstin} added and verified successfully!` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error adding GSTIN.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (regId: string) => {
    if (!profile) return;
    setVerifyingId(regId);
    setFeedback(null);

    try {
      const res = await fetch(`${apiUrl}/billing-profiles/${profile.id}/gst-registrations/${regId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Verification attempt failed.');
      }

      await fetchProfile();
      if (data?.verification?.status === 'MISMATCH') {
        const updatedReg = profile.gstRegistrations.find((r) => r.id === regId);
        if (updatedReg) setMismatchTarget(updatedReg);
      } else {
        setFeedback({ type: 'success', text: 'GSTIN re-verified with Cashfree!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error verifying GSTIN.' });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleResolveMismatch = async (acceptProviderName: boolean, updatedName?: string) => {
    if (!profile || !mismatchTarget) return;

    const res = await fetch(
      `${apiUrl}/billing-profiles/${profile.id}/gst-registrations/${mismatchTarget.id}/confirm-mismatch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ acceptProviderName, updatedBusinessName: updatedName }),
      },
    );

    if (res.ok) {
      await fetchProfile();
      setFeedback({ type: 'success', text: 'GSTIN mismatch successfully resolved!' });
    }
  };

  const handleDelete = async (regId: string) => {
    if (!profile || !confirm('Are you sure you want to remove this GSTIN registration?')) return;

    try {
      const res = await fetch(`${apiUrl}/billing-profiles/${profile.id}/gst-registrations/${regId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (res.ok) {
        await fetchProfile();
        setFeedback({ type: 'success', text: 'GSTIN detached from billing profile.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to delete GSTIN.' });
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        <span className="text-xs font-semibold">Loading GST Details...</span>
      </div>
    );
  }

  const registrations = profile?.gstRegistrations || [];

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Sleek Text Box with "Add GSTIN" Button on the right side */}
      <form onSubmit={handleAddGstin} className="space-y-2">
        <div className="relative flex items-center rounded-2xl bg-slate-900/90 border border-white/10 hover:border-purple-500/40 focus-within:border-purple-500 transition-all p-1.5 shadow-lg backdrop-blur-xl light:bg-white light:border-slate-200/80 light:shadow-sm">
          <div className="pl-3 pr-2 text-slate-500">
            <FileText className="w-4 h-4 text-purple-400 light:text-purple-600" />
          </div>

          <input
            type="text"
            value={gstinInput}
            onChange={(e) => {
              setGstinInput(e.target.value.toUpperCase());
              if (!showBusinessNamePrompt && e.target.value.length > 2) {
                setShowBusinessNamePrompt(true);
              }
            }}
            placeholder="Enter 15-digit GSTIN (e.g. 29AAICP2912R1ZR)..."
            maxLength={15}
            className="flex-1 bg-transparent px-2 py-2 text-xs font-mono font-medium text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 focus:outline-none uppercase"
          />

          {/* Right side Add GSTIN button */}
          <button
            type="submit"
            disabled={!cleanGstin || actionLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white keep-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {actionLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span>Add GSTIN</span>
          </button>
        </div>

        {/* Live Detected Info & Optional Entity Input */}
        {cleanGstin.length > 0 && (
          <div className="px-2 flex flex-wrap items-center justify-between gap-2 text-[11px] animate-fadeIn">
            <div className="flex items-center gap-2">
              {detectedState && (
                <span className="text-emerald-400 light:text-emerald-700 font-medium flex items-center gap-1 bg-emerald-500/10 light:bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-500/20 light:border-emerald-200">
                  <MapPin className="w-3 h-3" />
                  {detectedState} ({stateCode})
                </span>
              )}
              {cleanGstin.length === 15 && isValidFormat && (
                <span className="text-emerald-400 light:text-emerald-600 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> Valid format
                </span>
              )}
            </div>

            {showBusinessNamePrompt && (
              <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                <input
                  type="text"
                  value={businessNameInput}
                  onChange={(e) => setBusinessNameInput(e.target.value)}
                  placeholder={`Legal name (default: ${profile?.legalName || 'Company'})`}
                  maxLength={100}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-[11px] text-white placeholder-slate-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}
          </div>
        )}
      </form>

      {/* Registrations List */}
      <div className="space-y-3 pt-1">
        {registrations.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-2xl bg-slate-900/20 light:bg-white border border-dashed border-white/10 light:border-slate-200 space-y-1.5">
            <p className="text-xs font-semibold text-slate-300 light:text-slate-700">No GSTIN registrations linked yet</p>
            <p className="text-[11px] text-slate-500 light:text-slate-500 max-w-sm mx-auto">
              Type your 15-digit GSTIN in the bar above and click &quot;Add GSTIN&quot; to verify and auto-populate your verified tax details.
            </p>
          </div>
        ) : (
          registrations.map((reg) => (
            <GstDetailsCard
              key={reg.id}
              registration={reg}
              onVerify={handleVerify}
              onViewHistory={(id) => setHistoryTargetId(id)}
              onDelete={handleDelete}
              onResolveMismatch={(r) => setMismatchTarget(r)}
              isVerifying={verifyingId === reg.id}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <GstMismatchModal
        isOpen={Boolean(mismatchTarget)}
        registration={mismatchTarget}
        profileLegalName={profile?.legalName}
        onClose={() => setMismatchTarget(null)}
        onResolve={handleResolveMismatch}
      />

      <GstHistoryModal
        isOpen={Boolean(historyTargetId)}
        registrationId={historyTargetId}
        profileId={profile?.id || null}
        onClose={() => setHistoryTargetId(null)}
      />
    </div>
  );
}
