'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { BillingProfile, GstRegistration } from './types';
import GstDetailsCard from './GstDetailsCard';
import GstVerificationForm from './GstVerificationForm';
import GstMismatchModal from './GstMismatchModal';
import GstHistoryModal from './GstHistoryModal';

export default function GstVerificationManager() {
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [showAddForm, setShowAddForm] = useState(false);
  const [mismatchTarget, setMismatchTarget] = useState<GstRegistration | null>(null);
  const [historyTargetId, setHistoryTargetId] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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

  const handleAddGstin = async ({ gstin, businessName }: { gstin: string; businessName: string }) => {
    if (!profile) return;
    setActionLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${apiUrl}/billing-profiles/${profile.id}/gst-registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ gstin, businessName, autoVerify: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to add GSTIN registration.');
      }

      await fetchProfile();
      setShowAddForm(false);
      setFeedback({ type: 'success', text: `GSTIN ${gstin} submitted and verified successfully!` });
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
        <span className="text-xs font-semibold">Loading GST and Billing Details...</span>
      </div>
    );
  }

  const registrations = profile?.gstRegistrations || [];

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Government GSTIN Verification Suite</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold border border-purple-500/40">
                CASHFREE
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Multi-state GST verification & automated business tax invoice compliance (PRD FR-01–FR-09)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add GSTIN'}</span>
        </button>
      </div>

      {/* Form accordion */}
      {showAddForm && <GstVerificationForm onSubmit={handleAddGstin} isLoading={actionLoading} />}

      {/* Registrations List */}
      <div className="space-y-3">
        {registrations.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/30 border border-white/5 space-y-2">
            <p className="text-xs text-slate-400 font-medium">No GST registrations associated with this billing profile yet.</p>
            <p className="text-[11px] text-slate-500">
              Click &quot;Add GSTIN&quot; above to verify your business details via Cashfree.
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
