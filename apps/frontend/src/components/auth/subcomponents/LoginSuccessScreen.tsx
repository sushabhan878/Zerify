'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { ShieldCheck } from 'lucide-react';
import successAnimation from '../../../../public/kOr3pk2jUY.json';

interface LoginSuccessScreenProps {
  userEmail: string;
}

export default function LoginSuccessScreen({ userEmail }: LoginSuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="text-center py-6 flex flex-col items-center justify-center space-y-4"
    >
      <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
        <Lottie
          animationData={successAnimation}
          loop={false}
          autoplay={true}
          style={{ width: 140, height: 140 }}
        />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight [font-family:'Playfair_Display',Georgia,serif]">
          Welcome <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">Back!</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Authenticated as <span className="font-semibold text-purple-300">{userEmail}</span>
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 shadow-inner">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Redirecting to your dashboard...</span>
      </div>
    </motion.div>
  );
}
