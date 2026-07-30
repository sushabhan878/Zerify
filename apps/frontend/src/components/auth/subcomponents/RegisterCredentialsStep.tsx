'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import AuthGoogleButton from './AuthGoogleButton';
import AuthAlert from './AuthAlert';

interface RegisterCredentialsStepProps {
  role: 'BRAND' | 'INFLUENCER';
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onGoogleRegister: () => void;
}

export default function RegisterCredentialsStep({
  role,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  errorMessage,
  onSubmit,
  onBack,
  onGoogleRegister,
}: RegisterCredentialsStepProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Create Your <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">Credentials</span>
        </h2>
      </div>

      {/* Business Email Verified Badge Instructions Note */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-3 shadow-inner">
        <ShieldCheck className="w-4.5 h-4.5 text-purple-400 flex-shrink-0" />
        <p className="leading-snug">
          Use your official <span className="font-bold text-white">business email</span> address to automatically earn your <span className="font-bold text-purple-300">Verified Account Badge</span> upon sign-up.
        </p>
      </div>

      <AuthAlert message={errorMessage} />

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {role === 'BRAND' ? 'Your Name or Company Rep' : 'Full Name'}
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={role === 'BRAND' ? 'Jane Doe (Marketing Lead)' : 'Jane Creator'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'BRAND' ? 'jane@brand.com' : 'jane@creator.com'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 mt-4"
        >
          <span>Continue to Profile Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-4 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative px-3 bg-[#090D16] text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Or Quick Signup
        </span>
      </div>

      <AuthGoogleButton onClick={onGoogleRegister} label="Continue with Google" />
    </motion.div>
  );
}
