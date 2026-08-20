'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Sliders, Globe, Briefcase, CreditCard, Sparkles } from 'lucide-react';
import BasicInfoTab from '../settings-tabs/BasicInfoTab';
import CreatorDetailsTab from '../settings-tabs/CreatorDetailsTab';
import SocialAccountsTab from '../settings-tabs/SocialAccountsTab';
import PortfolioTab from '../settings-tabs/PortfolioTab';
import PaymentSettingsTab from '../settings-tabs/PaymentSettingsTab';

interface SettingsSectionProps {
  userName?: string;
  userEmail?: string;
  userHandle?: string;
  avatarUrl?: string;
  completionPercentage?: number;
  initialData?: any;
}

type TabType = 'basic' | 'creator' | 'social' | 'portfolio' | 'payment';

const TAB_ORDER: TabType[] = ['basic', 'creator', 'social', 'portfolio', 'payment'];

export default function SettingsSection({
  userName,
  userEmail,
  userHandle,
  avatarUrl,
  completionPercentage,
  initialData,
}: SettingsSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [direction, setDirection] = useState<number>(1);
  const [completion, setCompletion] = useState<number>(completionPercentage ?? 75);
  const [profileData, setProfileData] = useState<any>(() => {
    if (initialData) return initialData;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zerify_influencer_profile_cache');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });

  React.useEffect(() => {
    if (initialData) {
      setProfileData(initialData);
    }
  }, [initialData]);

  React.useEffect(() => {
    const syncCompletion = () => {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('zerify_influencer_profile_cache') : null;
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setProfileData(parsed);
          if (parsed?.completionPercentage !== undefined) {
            setCompletion(parsed.completionPercentage);
          }
        } catch (e) {}
      }
    };

    if (completionPercentage !== undefined) {
      setCompletion(completionPercentage);
    } else {
      syncCompletion();
    }

    window.addEventListener('zerify_influencer_profile_update', syncCompletion);
    return () => window.removeEventListener('zerify_influencer_profile_update', syncCompletion);
  }, [completionPercentage]);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'creator', label: 'Creator Details', icon: Sliders },
    { id: 'social', label: 'Social Accounts', icon: Globe },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'payment', label: 'Payment & Payouts', icon: CreditCard },
  ];

  const changeTab = (newTab: TabType) => {
    if (newTab === activeTab) return;
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const newIndex = TAB_ORDER.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const handleTabSave = (nextTabId?: TabType) => {
    if (nextTabId) {
      changeTab(nextTabId);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            <span>Profile & Account Settings</span>
          </h2>
          <p className="text-xs text-slate-400/80">
            Manage your personal profile, creator niche details, social links & Cashfree payout preferences
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/70 px-3 py-1.5 rounded-lg border border-white/10 shrink-0 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Profile {completion}% Setup</span>
        </div>
      </div>

      {/* Glassmorphic Tab Navigation Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl overflow-x-auto no-scrollbar shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id as TabType)}
              type="button"
              className={`relative px-3.5 py-2 rounded-lg text-xs transition-all shrink-0 flex items-center gap-2 ${
                isActive ? 'text-white font-bold' : 'text-slate-400/90 hover:text-white font-medium hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTabHighlight"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-pink-600/30 border border-purple-500/40 rounded-lg shadow-md"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-purple-300' : 'text-slate-400/80'}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sliding Animated Tab Content Panels */}
      <div className="relative min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -40, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'basic' && (
              <BasicInfoTab
                userName={userName}
                userEmail={userEmail}
                userHandle={userHandle}
                avatarUrl={avatarUrl}
                initialData={profileData}
                onSaveSuccess={() => handleTabSave('creator')}
              />
            )}
            {activeTab === 'creator' && (
              <CreatorDetailsTab
                initialData={profileData}
                onSaveSuccess={() => handleTabSave('social')}
              />
            )}
            {activeTab === 'social' && (
              <SocialAccountsTab
                initialData={profileData}
                onSaveSuccess={() => handleTabSave('portfolio')}
              />
            )}
            {activeTab === 'portfolio' && <PortfolioTab onSaveSuccess={() => handleTabSave('payment')} />}
            {activeTab === 'payment' && <PaymentSettingsTab onSaveSuccess={() => handleTabSave()} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
