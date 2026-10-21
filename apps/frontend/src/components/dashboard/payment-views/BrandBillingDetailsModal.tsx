'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import GstVerificationManager from '../gst-verification/GstVerificationManager';

interface BrandBillingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (details: any) => void;
}

export default function BrandBillingDetailsModal({
  isOpen,
  onClose,
}: BrandBillingDetailsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-950/95 border border-white/10 shadow-2xl p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Business GSTIN Verification</h3>
                <p className="text-xs text-slate-400">
                  Manage corporate tax identity, multi-state GSTINs, and Cashfree invoice validation
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

          {/* GSTIN Verification Manager Body */}
          <div className="pt-1">
            <GstVerificationManager />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
