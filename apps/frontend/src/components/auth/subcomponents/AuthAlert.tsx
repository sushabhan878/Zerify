'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface AuthAlertProps {
  message: string;
}

export default function AuthAlert({ message }: AuthAlertProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <div className="p-3.5 rounded-2xl bg-rose-500/10 light:bg-rose-50 border border-rose-500/30 light:border-rose-200 flex items-start gap-3 text-xs text-rose-300 light:text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-400 light:text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
