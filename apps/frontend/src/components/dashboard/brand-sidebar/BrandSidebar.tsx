'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
  isMobileDrawer?: boolean;
  style?: React.CSSProperties;
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
  isMobileDrawer = false,
  style,
}: BrandSidebarProps) {
  const [internalActiveRoute, setInternalActiveRoute] = useState('search-creators');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeRoute = externalActiveRoute || internalActiveRoute;
  const handleSelectRoute = (routeId: string) => {
    if (externalOnSelectRoute) {
      externalOnSelectRoute(routeId);
    } else {
      setInternalActiveRoute(routeId);
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const avatarChar = userName.charAt(0).toUpperCase();

  const quickMessages = [
    { id: 1, name: 'Erik Gunsel', initial: 'E', color: 'bg-indigo-600' },
    { id: 2, name: 'Emily Smith', initial: 'E', color: 'bg-pink-600' },
    { id: 3, name: 'Arthur Adelk', initial: 'A', color: 'bg-purple-600' },
  ];

  return (
    <aside
      style={isCollapsed ? { ...style, width: '80px' } : style}
      className={`h-full bg-slate-950/90 border-r border-white/10 flex flex-col shrink-0 selection:bg-purple-500 selection:text-white transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${isMobileDrawer ? 'flex w-full' : 'hidden md:flex'}`}
    >
      {/* Sticky Top Header: Zerify Logo + Collapse Button & Profile Card */}
      <div className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 p-4 pb-3.5 space-y-3.5 shrink-0 shadow-md">
        {/* Top Zerify Logo Header Row with Collapse Toggle Button right next to logo */}
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2.5 px-1 group truncate">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Zerify Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white block">Zerify</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-[8.5px] font-black text-white uppercase tracking-wider">
                    Brand
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-slate-400 block truncate">Brand Dashboard</span>
              </div>
            </Link>
          )}

          {/* Collapse Toggle Button */}
          <button
            onClick={toggleCollapse}
            type="button"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="w-7 h-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10 shrink-0 shadow-sm"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Profile Card */}
        <BrandProfileCard
          companyName={companyName}
          industry={industry}
          logoUrl={logoUrl}
          isCollapsed={isCollapsed}
          completionPercentage={65}
          onCompleteProfile={() => handleSelectRoute('brand-settings')}
        />
      </div>

      {/* Scrollable Body: Nav Menu (includes ThemeToggle in Settings), Messages & CTA Card */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3 flex flex-col justify-between min-h-0">
        <div className="space-y-3">
          {/* Main Navigation Menu */}
          <BrandNavMenu
            activeRoute={activeRoute}
            onSelectRoute={handleSelectRoute}
            isCollapsed={isCollapsed}
          />

          {/* Messages List Section */}
          <div className="pt-1">
            {!isCollapsed ? (
              <div className="space-y-2">
                <div className="px-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    MESSAGES
                  </span>
                  <button
                    type="button"
                    title="New Message"
                    onClick={() => handleSelectRoute('brand-messages')}
                    className="text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {quickMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectRoute('brand-messages')}
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="relative shrink-0">
                        <div className={`w-7 h-7 rounded-full ${msg.color} text-white font-bold text-xs flex items-center justify-center border border-white/10`}>
                          {msg.initial}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate">
                        {msg.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="w-8 h-[1px] bg-white/10 mb-1" />
                {quickMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectRoute('brand-messages')}
                    type="button"
                    title={msg.name}
                    className="relative group"
                  >
                    <div className={`w-8 h-8 rounded-full ${msg.color} text-white font-bold text-xs flex items-center justify-center border border-white/10 transition-transform group-hover:scale-105`}>
                      {msg.initial}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Action Card & User Sign Out */}
        <div className="pt-4 space-y-3 shrink-0">
          {!isCollapsed ? (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/20 text-center space-y-2.5 shadow-lg">
              <div>
                <h5 className="text-xs font-black text-white">Let&apos;s start!</h5>
                <p className="text-[10px] text-slate-400 mt-0.5">Creating or adding new campaigns couldn&apos;t be easier</p>
              </div>
              <button
                onClick={() => handleSelectRoute('search-creators')}
                type="button"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-950/40"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add New Campaign</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => handleSelectRoute('search-creators')}
                type="button"
                title="Add New Campaign"
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black flex items-center justify-center transition-all shadow-md shadow-orange-950/40 scale-105"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
              </button>
            </div>
          )}

          {/* User Account / Logout */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            {!isCollapsed ? (
              <>
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
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  type="button"
                  className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
