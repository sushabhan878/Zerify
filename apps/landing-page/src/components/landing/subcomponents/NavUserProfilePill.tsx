'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface NavUserProfilePillProps {
  userName: string;
  avatarChar: string;
  onLogout: () => void;
}

export default function NavUserProfilePill({
  userName,
  avatarChar,
  onLogout,
}: NavUserProfilePillProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/30 shadow-lg shadow-purple-950/20 backdrop-blur-md">
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-inner border border-white/20">
          {avatarChar}
        </div>
        <span className="text-xs font-bold text-slate-200 tracking-tight max-w-[120px] truncate">
          {userName}
        </span>
      </div>

      <button
        onClick={onLogout}
        title="Sign Out"
        className="p-2 rounded-full bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all duration-200"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
