'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  DollarSign,
  Briefcase,
  Sparkles,
  Settings,
  LogOut,
} from 'lucide-react';

interface DashboardSidebarProps {
  userRole: 'BRAND' | 'INFLUENCER';
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

export default function DashboardSidebar({
  userRole,
  userName,
  userEmail,
  onLogout,
}: DashboardSidebarProps) {
  const brandNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'Campaigns', icon: Megaphone, active: false },
    { label: 'Find Creators', icon: Users, active: false },
    { label: 'Payouts', icon: DollarSign, active: false },
    { label: 'Settings', icon: Settings, active: false },
  ];

  const influencerNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'Deal Invites', icon: Sparkles, active: false },
    { label: 'Active Collaborations', icon: Briefcase, active: false },
    { label: 'Earnings', icon: DollarSign, active: false },
    { label: 'Settings', icon: Settings, active: false },
  ];

  const navItems = userRole === 'BRAND' ? brandNavItems : influencerNavItems;
  const avatarChar = userName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Zerify Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white block">Zerify</span>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">
              {userRole === 'BRAND' ? 'Brand Portal' : 'Creator Studio'}
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href="#"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  item.active
                    ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-white shadow-lg shadow-purple-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-purple-400" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center border border-white/20 shrink-0">
            {avatarChar}
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-white truncate block">{userName}</span>
            <span className="text-[10px] text-slate-400 truncate block">{userEmail}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Sign Out"
          className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all duration-200 shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
