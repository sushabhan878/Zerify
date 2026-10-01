'use client';

import React from 'react';
import { APP_ROUTES } from '@/config/env';

export default function NavAuthButtons() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <a
        href={APP_ROUTES.login}
        className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
      >
        Sign In
      </a>
      <a
        href={APP_ROUTES.register}
        className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-90 transition-all duration-300 shadow-md shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:-translate-y-0.5"
      >
        Sign Up
      </a>
    </div>
  );
}
