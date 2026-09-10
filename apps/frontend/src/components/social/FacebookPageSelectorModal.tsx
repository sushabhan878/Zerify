'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, CheckCircle2, AlertCircle, Loader2, Check, X, ShieldCheck } from 'lucide-react';

export interface FacebookPage {
  id: string;
  name: string;
  category?: string;
  tasks?: string[];
  isConnected?: boolean;
}

interface FacebookPageSelectorModalProps {
  isOpen: boolean;
  userId?: string;
  onClose: () => void;
  onSuccess: (connectedCount: number) => void;
}

export default function FacebookPageSelectorModal({
  isOpen,
  userId,
  onClose,
  onSuccess,
}: FacebookPageSelectorModalProps) {
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const queryUrl = userId ? `${apiUrl}/social/facebook/pages?userId=${encodeURIComponent(userId)}` : `${apiUrl}/social/facebook/pages`;

    fetch(queryUrl, { headers })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || 'Failed to fetch authorized Facebook pages');
        }
        return json;
      })
      .then((res) => {
        if (!isMounted) return;
        const fetchedPages: FacebookPage[] = Array.isArray(res.pages) ? res.pages : [];
        setPages(fetchedPages);
        if (res.user?.username) {
          setUserName(res.user.username);
        }

        // Auto-select pages that are already connected, or select all if none are connected yet
        const initialSelected = new Set<string>();
        const connectedPages = fetchedPages.filter((p) => p.isConnected);
        if (connectedPages.length > 0) {
          connectedPages.forEach((p) => initialSelected.add(p.id));
        } else {
          fetchedPages.forEach((p) => initialSelected.add(p.id));
        }
        setSelectedIds(initialSelected);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Error fetching Facebook pages:', err);
        setError(err.message || 'Could not load Facebook pages');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, apiUrl]);

  const togglePage = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map((p) => p.id)));
    }
  };

  const handleConnect = async () => {
    if (selectedIds.size === 0) {
      setError('Please select at least one Facebook Page to connect.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/social/facebook/pages/select`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pageIds: Array.from(selectedIds),
          userId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to connect selected Facebook pages');
      }

      onSuccess(selectedIds.size);
    } catch (err: any) {
      console.error('Failed to connect Facebook pages:', err);
      setError(err.message || 'Error connecting Facebook pages');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-2xl bg-slate-950/95 border border-purple-500/30 shadow-2xl p-6 text-white space-y-5 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Facebook className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Connect Facebook Pages</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  {userName ? `Authenticated as ${userName}` : 'Choose Pages authorized for this account'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Body / Page List */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <p className="text-xs">Discovering managed Facebook Pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-300">No Managed Pages Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No Facebook Pages with management permissions were found for this Facebook account. Make sure your account has admin access to at least one Facebook Page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Select one or more Pages:</span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {selectedIds.size === pages.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {pages.map((page) => {
                  const isChecked = selectedIds.has(page.id);
                  return (
                    <div
                      key={page.id}
                      onClick={() => togglePage(page.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-purple-950/30 border-purple-500/50 shadow-sm'
                          : 'bg-slate-900/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-purple-600 border-purple-500 text-white'
                              : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{page.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {page.category || 'Facebook Page'}
                          </p>
                        </div>
                      </div>

                      {page.isConnected && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                          Connected
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 font-mono">
              {selectedIds.size} of {pages.length} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || loading || pages.length === 0}
                onClick={handleConnect}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting Pages...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Connect Selected Pages</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
