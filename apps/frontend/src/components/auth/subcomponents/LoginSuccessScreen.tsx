'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface LoginSuccessScreenProps {
  userEmail: string;
}

export default function LoginSuccessScreen({ userEmail }: LoginSuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10 flex flex-col items-center justify-center space-y-5"
    >
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-pulse">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back!</h2>
        <p className="text-sm text-slate-300">
          Logged in as <span className="font-semibold text-purple-300">{userEmail}</span>
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Redirecting to your dashboard...</span>
      </div>
    </motion.div>
  );
}
