'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  badgeText?: string;
  onAction?: () => Promise<void>;
}

export default function FeatureCard({
  title,
  description,
  badgeText = 'NEW',
  onAction,
}: FeatureCardProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleClick = async () => {
    if (!onAction || loading || completed) return;
    setLoading(true);
    try {
      await onAction();
      setCompleted(true);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-purple-500/40"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

      {/* Top Badge */}
      {badgeText && (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          {badgeText}
        </span>
      )}

      {/* Card Content */}
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-slate-300 leading-relaxed">{description}</p>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || completed}
        className="mt-6 w-full py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : completed ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed</span>
          </>
        ) : (
          <>
            <span>Explore Feature</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </motion.div>
  );
}
