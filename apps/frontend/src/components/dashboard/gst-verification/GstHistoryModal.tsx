'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Loader2, Calendar } from 'lucide-react';
import { GstVerificationAttempt } from './types';
import GstStatusBadge from './GstStatusBadge';

interface GstHistoryModalProps {
  isOpen: boolean;
  registrationId: string | null;
  profileId: string | null;
  onClose: () => void;
}

export default function GstHistoryModal({
  isOpen,
  registrationId,
  profileId,
  onClose,
}: GstHistoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<GstVerificationAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !registrationId || !profileId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('zerify_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

        const res = await fetch(
          `${apiUrl}/billing-profiles/${profileId}/gst-registrations/${registrationId}/history`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
            },
          },
        );

        if (!res.ok) {
          throw new Error('Failed to load verification history.');
        }

        const data = await res.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'Error loading verification history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, registrationId, profileId]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-950/95 border border-white/10 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">GSTIN Audit Trail</h3>
                <p className="text-xs text-slate-400">
                  Historical Cashfree verification queries and outcomes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
            {loading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-xs font-semibold">Loading audit logs...</span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No verification attempts recorded for this registration yet.
              </div>
            ) : (
              history.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <GstStatusBadge status={attempt.status} />
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(attempt.startedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium">
                    {attempt.sanitizedMessage || `Attempt completed with status: ${attempt.status}`}
                  </div>

                  {attempt.providerReferenceId && (
                    <div className="text-[10px] font-mono text-slate-500">
                      Cashfree Reference: {attempt.providerReferenceId}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
