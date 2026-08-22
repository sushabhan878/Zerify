'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import CampaignWizardStepIndicator from './CampaignWizardStepIndicator';
import BasicInfoStep from './steps/BasicInfoStep';
import ProductServiceStep from './steps/ProductServiceStep';
import RequirementsStep from './steps/RequirementsStep';
import DeliverablesStep from './steps/DeliverablesStep';
import BudgetStep from './steps/BudgetStep';
import SlotsStep from './steps/SlotsStep';
import ReviewPublishStep from './steps/ReviewPublishStep';
import { CampaignService } from '@/services/campaign.service';

const STEPS = [
  { id: 1, label: 'Basic Info', description: 'Brief & objectives' },
  { id: 2, label: 'Product / Service', description: 'Offering & assets' },
  { id: 3, label: 'Creator Profile', description: 'Requirements & fit' },
  { id: 4, label: 'Deliverables', description: 'Required assets' },
  { id: 5, label: 'Budget', description: 'Escrow & payouts' },
  { id: 6, label: 'Slots & Guidelines', description: 'Capacity limits' },
  { id: 7, label: 'Review', description: 'Publish campaign' },
];

interface CreateCampaignWizardProps {
  onClose: () => void;
  onSuccess: (campaign: any) => void;
}

export default function CreateCampaignWizard({ onClose, onSuccess }: CreateCampaignWizardProps) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const [formData, setFormData] = useState<any>({
    title: '',
    objective: 'BRAND_AWARENESS',
    description: '',
    industry: 'Tech & SaaS',
    productName: '',
    productType: 'PHYSICAL',
    hasFreeProduct: true,
    freeProductValue: 100,
    landingPageUrl: '',
    coverImageUrl: '',
    platforms: ['INSTAGRAM', 'YOUTUBE'],
    budgetPaymentModel: 'FIXED',
    budgetCurrency: 'USD',
    budgetTotalAmount: 5000,
    targetParticipants: 3,
    maxParticipants: 5,
    autoCloseWhenFilled: true,
    requirements: {
      strictEligibility: false,
      social: { minFollowers: 10000, minEngagementRate: 2.0 },
    },
    deliverables: [
      {
        type: 'Instagram Reel',
        quantity: 1,
        requiredCta: 'Check out link in bio',
        mandatoryHashtags: ['#Zerify', '#Ad'],
        revisionLimit: 2,
      },
    ],
  });

  const handleFieldChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setErrorMessage(null);
    try {
      const created = await CampaignService.createCampaign(formData);
      onSuccess(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save draft');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setErrorMessage(null);
    try {
      const created = await CampaignService.createCampaign(formData);
      const published = await CampaignService.publishCampaign(created.id);
      onSuccess(published);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish campaign');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Step Indicator & Body */}
        <div className="p-6 pt-5 overflow-y-auto flex-1 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <CampaignWizardStepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={(s) => setCurrentStep(s)}
          />

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {currentStep === 1 && (
                <BasicInfoStep formData={formData} onChange={handleFieldChange} />
              )}
              {currentStep === 2 && (
                <ProductServiceStep formData={formData} onChange={handleFieldChange} />
              )}
              {currentStep === 3 && (
                <RequirementsStep formData={formData} onChange={handleFieldChange} />
              )}
              {currentStep === 4 && (
                <DeliverablesStep formData={formData} onChange={handleFieldChange} />
              )}
              {currentStep === 5 && (
                <BudgetStep formData={formData} onChange={handleFieldChange} />
              )}
              {currentStep === 6 && (
                <SlotsStep formData={formData} onChange={handleFieldChange} />
              )}
              {currentStep === 7 && (
                <ReviewPublishStep
                  formData={formData}
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraft}
                  isPublishing={isPublishing}
                  isSavingDraft={isSavingDraft}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Direct Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 disabled:opacity-30 disabled:hover:bg-slate-800/80 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentStep < STEPS.length && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(STEPS.length, prev + 1))}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition-all ml-auto"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>

  );

  return createPortal(modalContent, document.body);
}

