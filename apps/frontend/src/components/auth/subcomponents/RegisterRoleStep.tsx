'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Video, Building2, ArrowRight } from 'lucide-react';

interface RegisterRoleStepProps {
  role: 'BRAND' | 'INFLUENCER';
  onSelectRole: (role: 'BRAND' | 'INFLUENCER') => void;
}

export default function RegisterRoleStep({ role, onSelectRole }: RegisterRoleStepProps) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to Zerify</h2>
        <p className="text-xs text-slate-400 mt-1.5">How do you plan to use the platform today?</p>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2">
        {/* Option A: Influencer / Creator */}
        <div
          onClick={() => onSelectRole('INFLUENCER')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 group ${
            role === 'INFLUENCER'
              ? 'bg-pink-600/15 border-pink-500 shadow-xl shadow-pink-500/20 ring-1 ring-pink-500'
              : 'bg-slate-900/60 border-white/10 hover:border-pink-500/40 hover:bg-slate-900/90'
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-pink-600/20 text-pink-400 border border-pink-500/30 group-hover:scale-105 transition-transform">
            <Video className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">I am an Influencer</h3>
              <ArrowRight className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Connect directly with top brands, receive campaign invitations, track stats, and get paid fast.
            </p>
          </div>
        </div>

        {/* Option B: Brand / Agency */}
        <div
          onClick={() => onSelectRole('BRAND')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 group ${
            role === 'BRAND'
              ? 'bg-purple-600/15 border-purple-500 shadow-xl shadow-purple-500/20 ring-1 ring-purple-500'
              : 'bg-slate-900/60 border-white/10 hover:border-purple-500/40 hover:bg-slate-900/90'
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 group-hover:scale-105 transition-transform">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">I am looking for Influencers</h3>
              <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Launch creator campaigns, send briefs, track campaign reach, and automate payouts without agency overhead.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
          Sign In to your account
        </Link>
      </div>
    </motion.div>
  );
}
