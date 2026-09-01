'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Compass,
  Sparkles,
  MailCheck,
  Megaphone,
  MessageSquare,
  FileText,
  Users,
  DollarSign,
  Settings,
  ChevronDown,
  Activity,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { OfferService } from '@/services/offer.service';

import ThemeToggle from '../subcomponents/ThemeToggle';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  isAi?: boolean;
  section?: 'MAIN' | 'CREATOR HUB' | 'SETTINGS';
  subItems?: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

interface InfluencerNavMenuProps {
  activeRoute: string;
  onSelectRoute: (routeId: string) => void;
  isCollapsed?: boolean;
}

export default function InfluencerNavMenu({
  activeRoute,
  onSelectRoute,
  isCollapsed = false,
}: InfluencerNavMenuProps) {
  const [activeSubTab, setActiveSubTab] = useState('statistic');
  const [pendingOffersCount, setPendingOffersCount] = useState<number>(0);

  useEffect(() => {
    const fetchPendingOffers = async () => {
      try {
        const offers = await OfferService.getMyOffers().catch(() => []);
        if (Array.isArray(offers)) {
          const pending = offers.filter((o) => o.status === 'PENDING').length;
          setPendingOffersCount(pending);
        }
      } catch (e) {}
    };

    fetchPendingOffers();
    window.addEventListener('zerify_offers_updated', fetchPendingOffers);
    return () => window.removeEventListener('zerify_offers_updated', fetchPendingOffers);
  }, []);

  const mainRoutes: NavItem[] = [
    {
      id: 'statistics',
      label: 'Statistics',
      icon: BarChart3,
      section: 'MAIN',
    },
    { id: 'company-discovery', label: 'Company Discovery', icon: Building2, section: 'MAIN' },
    { id: 'campaign-discovery', label: 'Campaign Discovery', icon: Compass, section: 'MAIN' },
    {
      id: 'ai-profile-match',
      label: 'AI Profile Match',
      icon: Sparkles,
      isAi: true,
      badge: 'AI Match',
      badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
      section: 'MAIN',
    },
  ];

  const creatorRoutes: NavItem[] = [
    {
      id: 'campaign-invitations',
      label: 'Invitations',
      icon: MailCheck,
      badge: pendingOffersCount > 0 ? `${pendingOffersCount}` : undefined,
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      section: 'CREATOR HUB',
    },
    { id: 'active-campaigns', label: 'Active Campaigns', icon: Megaphone, section: 'CREATOR HUB' },
    { id: 'applications', label: 'Applications', icon: FileText, section: 'CREATOR HUB' },
    { id: 'my-network', label: 'My Network', icon: Users, section: 'CREATOR HUB' },
  ];

  const settingsRoutes: NavItem[] = [
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: '2',
      badgeColor: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
      section: 'SETTINGS',
    },
    { id: 'payments', label: 'Payments', icon: DollarSign, section: 'SETTINGS' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'SETTINGS' },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-0.5">
      {!isCollapsed && (
        <div className="px-3 pt-1.5 pb-0.5">
          <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-500">
            {title}
          </span>
        </div>
      )}

      <div className="space-y-0.5">
        {items.map((route) => {
          const Icon = route.icon;
          const isSubItemActive = route.subItems?.some((s) => s.id === activeRoute);
          const isActive = activeRoute === route.id || isSubItemActive;
          const hasSubItems = route.subItems && route.subItems.length > 0;

          if (isCollapsed) {
            return (
              <div key={route.id} className="relative group/collapsed flex justify-center z-30">
                <button
                  onClick={() => onSelectRoute(route.id)}
                  type="button"
                  title={hasSubItems ? undefined : route.label}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-tr from-purple-600/40 via-pink-600/30 to-indigo-600/40 border border-purple-500/50 text-white shadow-lg shadow-purple-950/40 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>

                {/* Collapsed Flyout Submenu with Curved Branch Lines & Hover Bridge */}
                {hasSubItems && (
                  <div className="fixed left-[84px] -mt-1 hidden group-hover/collapsed:flex flex-col bg-slate-900/95 border border-white/10 p-3 rounded-2xl shadow-2xl z-[100] w-48 backdrop-blur-xl before:absolute before:-left-5 before:top-0 before:bottom-0 before:w-5 before:content-[''] pointer-events-auto">
                    <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-2 pb-1 border-b border-white/10 px-1 flex items-center justify-between">
                      <span>{route.label}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    </div>

                    <div className="relative pl-5 py-0.5 space-y-1">
                      {/* Vertical Tree Branch Line */}
                      <div className="absolute left-[7px] top-1 bottom-3 w-[1.5px] bg-slate-700/60 rounded-full" />

                      {route.subItems?.map((sub) => {
                        const isSubActive = activeSubTab === sub.id || activeRoute === sub.id;
                        return (
                          <div key={sub.id} className="relative flex items-center">
                            {/* Curved Branch Connector */}
                            <div className="absolute -left-[13px] top-0 w-3 h-3 border-l-[1.5px] border-b-[1.5px] border-slate-700/60 rounded-bl-lg pointer-events-none" />

                            <button
                              onClick={() => {
                                setActiveSubTab(sub.id);
                                onSelectRoute(sub.id);
                              }}
                              type="button"
                              className={`relative w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors duration-150 ${
                                isSubActive
                                  ? 'text-white font-black'
                                  : 'text-slate-400 hover:text-white font-medium hover:bg-white/5'
                              }`}
                            >
                              {isSubActive && (
                                <motion.div
                                  layoutId={`activeSubHighlightCollapsed-${route.id}`}
                                  className="absolute inset-0 bg-purple-500/20 border border-purple-500/35 rounded-xl shadow-md shadow-purple-950/30 backdrop-blur-sm"
                                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                              )}
                              <span className="relative z-10">{sub.label}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={route.id} className="space-y-0.5">
              <button
                onClick={() => onSelectRoute(route.id)}
                type="button"
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/30 via-pink-600/20 to-indigo-600/30 border border-purple-500/40 text-white shadow-lg shadow-purple-950/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
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

                <div className="flex items-center gap-1.5">
                  {route.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9.5px] font-black shrink-0 ${
                        route.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {route.badge}
                    </span>
                  )}
                  {hasSubItems && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isActive ? 'rotate-0 text-purple-400' : '-rotate-90 text-slate-500'
                      }`}
                    />
                  )}
                </div>
              </button>

              {/* Expanded Tree Sub-Items with Curved Branch Lines & Framer Motion Smooth Transition */}
              {hasSubItems && isActive && (
                <div className="relative pl-6 ml-4 py-1 space-y-1">
                  {/* Continuous Vertical Branch Line */}
                  <div className="absolute left-[7px] top-0 bottom-3.5 w-[1.5px] bg-slate-700/60 rounded-full" />

                  {route.subItems?.map((sub) => {
                    const isSubActive = activeSubTab === sub.id || activeRoute === sub.id;
                    return (
                      <div key={sub.id} className="relative flex items-center">
                        {/* Curved Elbow Branch Line */}
                        <div className="absolute -left-[17px] top-0 w-3.5 h-3.5 border-l-[1.5px] border-b-[1.5px] border-slate-700/60 rounded-bl-lg pointer-events-none" />

                        <button
                          onClick={() => {
                            setActiveSubTab(sub.id);
                            onSelectRoute(sub.id);
                          }}
                          type="button"
                          className={`relative w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors duration-150 ${
                            isSubActive
                              ? 'text-white font-black'
                              : 'text-slate-400 hover:text-white font-medium hover:bg-white/5'
                          }`}
                        >
                          {isSubActive && (
                            <motion.div
                              layoutId={`activeSubHighlight-${route.id}`}
                              className="absolute inset-0 bg-purple-500/20 border border-purple-500/35 rounded-xl shadow-md shadow-purple-950/30 backdrop-blur-sm"
                              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">{sub.label}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Theme Toggle directly inside SETTINGS section */}
        {title === 'SETTINGS' && (
          <div className="pt-1.5 px-0.5">
            <ThemeToggle isCollapsed={isCollapsed} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <nav className="space-y-1.5">
      {renderNavGroup('MAIN', mainRoutes)}
      {renderNavGroup('CREATOR HUB', creatorRoutes)}
      {renderNavGroup('SETTINGS', settingsRoutes)}
    </nav>
  );
}
