'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Building2, Target, ShoppingBag, Users, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import BrandCompanyInfoTab from '../brand-settings/BrandCompanyInfoTab';
import BrandCampaignGoalsTab from '../brand-settings/BrandCampaignGoalsTab';
import BrandProductServicesTab from '../brand-settings/BrandProductServicesTab';
import BrandTargetInfluencersTab from '../brand-settings/BrandTargetInfluencersTab';
import BrandPaymentsEscrowTab from '../brand-settings/BrandPaymentsEscrowTab';

interface BrandSettingsSectionProps {
  userName?: string;
  userEmail?: string;
  userHandle?: string;
  companyName?: string;
  avatarUrl?: string;
}

type BrandTabType = 'info' | 'goals' | 'products' | 'creators' | 'escrow';

const BRAND_TAB_ORDER: BrandTabType[] = ['info', 'goals', 'products', 'creators', 'escrow'];

export default function BrandSettingsSection({
  companyName,
}: BrandSettingsSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<BrandTabType>('info');
  const [direction, setDirection] = useState<number>(1);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completion, setCompletion] = useState(65);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/brand/profile`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        if (data.completionPercentage !== undefined) {
          setCompletion(data.completionPercentage);
        }
      }
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const tabs = [
    { id: 'info', label: 'Company Info', icon: Building2 },
    { id: 'goals', label: 'Campaign Goals', icon: Target },
    { id: 'products', label: 'Products & Services', icon: ShoppingBag },
    { id: 'creators', label: 'Target Influencers', icon: Users },
    { id: 'escrow', label: 'Payments & Escrow', icon: CreditCard },
  ];

  const changeTab = (newTab: BrandTabType) => {
    if (newTab === activeTab) return;
    const currentIndex = BRAND_TAB_ORDER.indexOf(activeTab);
    const newIndex = BRAND_TAB_ORDER.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabSave = (nextTabId?: BrandTabType) => {
    if (nextTabId) {
      changeTab(nextTabId);
    }
    // Background refresh without blocking UI
    setTimeout(() => {
      fetchProfile();
    }, 50);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        <span className="text-xs font-semibold">Loading Brand Profile Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            <span>Brand Enterprise Setup & Settings</span>
          </h2>
          <p className="text-xs text-slate-400/80">
            Dedicated company portal for company details, campaign parameters, product catalogs & escrow billing
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/70 px-3 py-1.5 rounded-lg border border-white/10 shrink-0 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="text-xs font-bold text-white">Brand Setup {completion}%</span>
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
              onClick={() => changeTab(tab.id as BrandTabType)}
              type="button"
              className={`relative px-3.5 py-2 rounded-lg text-xs transition-all shrink-0 flex items-center gap-2 ${
                isActive ? 'text-white font-bold' : 'text-slate-400/90 hover:text-white font-medium hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBrandSettingsTabHighlight"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-pink-600/30 border border-purple-500/40 rounded-lg shadow-md"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
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
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
          >
            {activeTab === 'info' && (
              <BrandCompanyInfoTab
                initialData={profileData || { companyName }}
                onSaveSuccess={() => handleTabSave('goals')}
              />
            )}
            {activeTab === 'goals' && (
              <BrandCampaignGoalsTab
                initialData={profileData}
                onSaveSuccess={() => handleTabSave('products')}
              />
            )}
            {activeTab === 'products' && (
              <BrandProductServicesTab
                initialProducts={profileData?.products || []}
                onSaveSuccess={() => handleTabSave('creators')}
              />
            )}
            {activeTab === 'creators' && (
              <BrandTargetInfluencersTab
                initialData={profileData}
                onSaveSuccess={() => handleTabSave('escrow')}
              />
            )}
            {activeTab === 'escrow' && (
              <BrandPaymentsEscrowTab
                initialData={profileData}
                onSaveSuccess={() => handleTabSave()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
