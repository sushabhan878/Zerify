'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title?: string; message: string }) => void;
  toastSuccess: (message: string, title?: string) => void;
  toastError: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type = 'success', title, message }: { type?: ToastType; title?: string; message: string }) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
      const newToast: ToastMessage = { id, type, title, message };

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 toasts

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const toastSuccess = useCallback(
    (message: string, title: string = 'Success') => {
      toast({ type: 'success', title, message });
    },
    [toast]
  );

  const toastError = useCallback(
    (message: string, title: string = 'Error') => {
      toast({ type: 'error', title, message });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, toastSuccess, toastError }}>
      {children}
      {/* Toast Portal Container in Top Right Corner */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: -15, scale: 0.9, x: 30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all ${
                t.type === 'success'
                  ? 'bg-slate-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                  : t.type === 'error'
                  ? 'bg-slate-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/30'
                  : 'bg-slate-950/90 border-purple-500/40 text-purple-100 shadow-purple-950/30'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {t.type === 'success' && (
                  <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {t.type === 'error' && (
                  <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
                {t.type === 'info' && (
                  <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Info className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 space-y-0.5 pr-1">
                {t.title && <h4 className="text-xs font-bold tracking-tight text-white">{t.title}</h4>}
                <p className="text-xs text-slate-300 font-medium leading-snug">{t.message}</p>
              </div>

              {/* Dismiss X Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if component is used outside provider
    return {
      toast: ({ title, message }: { type?: ToastType; title?: string; message: string }) => {
        console.log(`[Toast] ${title || ''}: ${message}`);
      },
      toastSuccess: (message: string) => console.log(`[Toast Success]: ${message}`),
      toastError: (message: string) => console.error(`[Toast Error]: ${message}`),
    };
  }
  return context;
}
