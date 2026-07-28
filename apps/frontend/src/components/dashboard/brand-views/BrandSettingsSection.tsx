'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Building2, Sliders, Globe, Briefcase, CreditCard, Sparkles } from 'lucide-react';
import BasicInfoTab from '../settings-tabs/BasicInfoTab';
import CreatorDetailsTab from '../settings-tabs/CreatorDetailsTab';
import SocialAccountsTab from '../settings-tabs/SocialAccountsTab';
import PortfolioTab from '../settings-tabs/PortfolioTab';
import PaymentSettingsTab from '../settings-tabs/PaymentSettingsTab';

interface BrandSettingsSectionProps {
  userName?: string;
  userEmail?: string;
  userHandle?: string;
  companyName?: string;
  avatarUrl?: string;
}

export default function BrandSettingsSection({
  userName,
  userEmail,
  userHandle,
  companyName,
  avatarUrl,
}: BrandSettingsSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<'basic' | 'creator' | 'social' | 'portfolio' | 'payment'>('basic');
  const [completion, setCompletion] = useState(65);

  const tabs = [
    { id: 'basic', label: 'Company Info', icon: Building2 },
    { id: 'creator', label: 'Campaign Preferences', icon: Sliders },
    { id: 'social', label: 'Brand Socials', icon: Globe },
    { id: 'portfolio', label: 'Past Campaigns', icon: Briefcase },
    { id: 'payment', label: 'Cashfree & Escrow', icon: CreditCard },
  ];

  const handleTabSave = () => {
    setCompletion((prev) => Math.min(prev + 10, 100));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <span>Brand Enterprise Settings</span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage company profile, campaign requirements, official brand socials & Cashfree escrow billing options
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-white/10 shrink-0">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-xs font-black text-white">Brand Setup {completion}%</span>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              type="button"
              className={`relative px-4 py-2 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-2 ${
                isActive ? 'text-white font-black' : 'text-slate-400 hover:text-white font-bold hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBrandSettingsTabHighlight"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-pink-600/30 border border-purple-500/40 rounded-xl shadow-lg shadow-purple-950/40"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-purple-300' : 'text-slate-400'}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="relative">
        {activeTab === 'basic' && (
          <BasicInfoTab
            userName={companyName || userName}
            userEmail={userEmail}
            userHandle={userHandle}
            avatarUrl={avatarUrl}
            onSaveSuccess={handleTabSave}
          />
        )}
        {activeTab === 'creator' && <CreatorDetailsTab onSaveSuccess={handleTabSave} />}
        {activeTab === 'social' && <SocialAccountsTab onSaveSuccess={handleTabSave} />}
        {activeTab === 'portfolio' && <PortfolioTab onSaveSuccess={handleTabSave} />}
        {activeTab === 'payment' && <PaymentSettingsTab onSaveSuccess={handleTabSave} />}
      </div>
    </div>
  );
}
