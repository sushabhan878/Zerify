'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface RegisterSuccessScreenProps {
  role: 'BRAND' | 'INFLUENCER';
}

export default function RegisterSuccessScreen({ role }: RegisterSuccessScreenProps) {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6 space-y-4"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-white tracking-tight">Account Created Successfully!</h2>
        <p className="text-xs text-slate-300">
          Welcome to Zerify! Your {role === 'BRAND' ? 'Brand' : 'Influencer'} profile is ready.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:opacity-95 transition-all"
        >
          <span>Go to Home Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
