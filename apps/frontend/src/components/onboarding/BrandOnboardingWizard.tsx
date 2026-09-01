'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Target, ShoppingBag, Users, CreditCard, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BrandCompanyInfoTab from '../dashboard/brand-settings/BrandCompanyInfoTab';
import BrandCampaignGoalsTab from '../dashboard/brand-settings/BrandCampaignGoalsTab';
import BrandProductServicesTab from '../dashboard/brand-settings/BrandProductServicesTab';
import BrandTargetInfluencersTab from '../dashboard/brand-settings/BrandTargetInfluencersTab';
import BrandPaymentsEscrowTab from '../dashboard/brand-settings/BrandPaymentsEscrowTab';

export default function BrandOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (silent = false) => {
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
        try {
          localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(data));
        } catch (e) {}
      }
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = typeof window !== 'undefined' ? localStorage.getItem('zerify_brand_profile_cache') : null;
    let hasCache = false;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProfileData(parsed);
        setLoading(false);
        hasCache = true;
      } catch (e) {}
    }
    fetchProfile(hasCache);
  }, []);

  const steps = [
    { number: 1, title: 'Company Info', subtitle: 'Brand details & values', icon: Building2 },
    { number: 2, title: 'Campaign Goals', subtitle: 'Objectives & platforms', icon: Target },
    { number: 3, title: 'Product & Services', subtitle: 'Offerings catalog', icon: ShoppingBag },
    { number: 4, title: 'Target Influencers', subtitle: 'Creator requirements', icon: Users },
    { number: 5, title: 'Payments & Escrow', subtitle: 'Cashfree & Escrow setup', icon: CreditCard },
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as any);
      fetchProfile();
    } else {
      // Complete onboarding
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const completeOnboarding = async () => {
    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      await fetch(`${apiUrl}/brand/onboarding/complete`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
    } catch (e) {
      // Ignore
    } finally {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
        <p className="text-xs font-semibold text-slate-400">Loading Brand Setup Wizard...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Step Progress Header */}
      <div className="bg-slate-900/70 border border-white/10 p-4 sm:p-6 rounded-3xl backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Company / Brand Onboarding
            </span>
            <h2 className="text-lg font-bold text-white">Step {currentStep} of 5 — {steps[currentStep - 1].title}</h2>
          </div>
          <span className="text-xs font-bold text-slate-400">{Math.round((currentStep / 5) * 100)}% Completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-6 border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 rounded-full"
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Step Items */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setCurrentStep(step.number as any)}
                className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                    : isDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1" />
                ) : (
                  <Icon className={`w-4 h-4 mb-1 ${isCurrent ? 'text-purple-400' : 'text-slate-400'}`} />
                )}
                <span className="text-[11px] font-bold hidden sm:inline">{step.title}</span>
                <span className="text-[9px] text-slate-400 hidden lg:inline">{step.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {currentStep === 1 && (
            <BrandCompanyInfoTab initialData={profileData} onSaveSuccess={handleNext} />
          )}
          {currentStep === 2 && (
            <BrandCampaignGoalsTab initialData={profileData} onSaveSuccess={handleNext} />
          )}
          {currentStep === 3 && (
            <BrandProductServicesTab initialProducts={profileData?.products || []} onSaveSuccess={handleNext} />
          )}
          {currentStep === 4 && (
            <BrandTargetInfluencersTab initialData={profileData} onSaveSuccess={handleNext} />
          )}
          {currentStep === 5 && (
            <BrandPaymentsEscrowTab initialData={profileData} onSaveSuccess={completeOnboarding} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Previous Step</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-xl shadow-purple-600/20 flex items-center gap-2 cursor-pointer"
        >
          <span>{currentStep === 5 ? 'Complete Onboarding & Enter Portal' : 'Save & Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
