'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import BrandProfileCard from './BrandProfileCard';
import BrandNavMenu from './BrandNavMenu';

interface BrandSidebarProps {
  userName: string;
  userEmail: string;
  companyName?: string;
  industry?: string;
  logoUrl?: string;
  onLogout: () => void;
  activeRoute?: string;
  onSelectRoute?: (routeId: string) => void;
}

export default function BrandSidebar({
  userName,
  userEmail,
  companyName = 'Apex Gear Inc',
  industry = 'Tech & Consumer AI',
  logoUrl,
  onLogout,
  activeRoute: externalActiveRoute,
  onSelectRoute: externalOnSelectRoute,
}: BrandSidebarProps) {
  const [internalActiveRoute, setInternalActiveRoute] = useState('search-creators');

  const activeRoute = externalActiveRoute || internalActiveRoute;
  const handleSelectRoute = (routeId: string) => {
    if (externalOnSelectRoute) {
      externalOnSelectRoute(routeId);
    } else {
      setInternalActiveRoute(routeId);
    }
  };

  const avatarChar = userName.charAt(0).toUpperCase();

  return (
    <aside className="w-72 bg-slate-950/90 border-r border-white/10 p-5 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen overflow-y-auto selection:bg-purple-500 selection:text-white">
      <div className="space-y-6">
        {/* Brand Logo Header */}
        <Link href="/" className="flex items-center gap-3 px-1 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.png"
              alt="Zerify Logo"
              width={36}
              height={36}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white block">Zerify</span>
              <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[9px] font-black text-white uppercase tracking-wider">
                Brand
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 block">Enterprise Portal</span>
          </div>
        </Link>

        {/* Section 1: Company Profile Card */}
        <BrandProfileCard
          companyName={companyName}
          industry={industry}
          logoUrl={logoUrl}
          completionPercentage={92}
          campaignsCreated={12}
          creatorsHired={48}
        />

        {/* Section 2: Main Brand Navigation Menu */}
        <BrandNavMenu
          activeRoute={activeRoute}
          onSelectRoute={handleSelectRoute}
        />
      </div>

      {/* Footer / Account Sign Out */}
      <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-xs flex items-center justify-center border border-white/20 shrink-0">
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
          type="button"
          className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all duration-200 shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
