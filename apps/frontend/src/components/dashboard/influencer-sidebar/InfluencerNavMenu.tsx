'use client';

import React from 'react';
import {
  User,
  Building2,
  Sparkles,
  MailCheck,
  Megaphone,
  MessageSquare,
  FileText,
  Users,
  DollarSign,
  Settings,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  isAi?: boolean;
}

interface InfluencerNavMenuProps {
  activeRoute: string;
  onSelectRoute: (routeId: string) => void;
}

export default function InfluencerNavMenu({
  activeRoute,
  onSelectRoute,
}: InfluencerNavMenuProps) {
  const routes: NavItem[] = [
    { id: 'profile-overview', label: 'Profile Overview', icon: User },
    { id: 'company-discovery', label: 'Company Discovery', icon: Building2 },
    { id: 'ai-profile-match', label: 'AI Profile Match', icon: Sparkles, isAi: true, badge: 'AI Match', badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' },
    { id: 'campaign-invitations', label: 'Campaign Invitations', icon: MailCheck, badge: '3', badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
    { id: 'active-campaigns', label: 'Active Campaigns', icon: Megaphone },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '2', badgeColor: 'bg-pink-500/20 text-pink-300 border border-pink-500/30' },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'my-network', label: 'My Network', icon: Users },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-1">
      <div className="px-3 mb-2 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Navigation
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {routes.length} Modules
        </span>
      </div>

      <nav className="space-y-1">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = activeRoute === route.id;

          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              type="button"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-indigo-600/30 border border-purple-500/40 text-white shadow-lg shadow-purple-950/40 scale-[1.01]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-purple-300'
                      : route.isAi
                      ? 'text-pink-400 group-hover:text-pink-300'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{route.label}</span>
              </div>

              {route.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                    route.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {route.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
