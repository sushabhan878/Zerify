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
import { useToast } from '@/components/ui/Toast';
import { useCurrency } from '@/context/CurrencyContext';

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
  const { currency: userCurrency } = useCurrency();
  const { toastError, toastSuccess } = useToast();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

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
    objective: [],
    description: '',
    industry: '',
    productName: '',
    productType: '',
    hasFreeProduct: false,
    freeProductValue: '',
    shippingDetails: '',
    productInstructions: '',
    landingPageUrl: '',
    coverImageUrl: '',
    platforms: [],
    budgetPaymentModel: '',
    budgetCurrency: userCurrency || 'INR',
    budgetTotalAmount: '',
    budgetMinPerInfluencer: '',
    budgetMaxPerInfluencer: '',
    performanceMetric: '',
    performanceRate: '',
    barterItems: '',
    shippingCovered: false,
    targetParticipants: '',
    maxParticipants: '',
    autoCloseWhenFilled: false,
    requirements: {
      strictEligibility: false,
      social: {},
      influencer: {},
    },
    deliverables: [],
    contentGuidelines: {
      referenceUrls: [],
      assetUrls: [],
      moodboardUrl: '',
    },
  });

  const handleFieldChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  const validateStep = (stepNumber: number): { isValid: boolean; error: string | null } => {
    switch (stepNumber) {
      case 1: {
        if (!formData.title || !formData.title.trim()) {
          return { isValid: false, error: 'Campaign Name is required (*).' };
        }
        if (!formData.industry || !formData.industry.trim()) {
          return { isValid: false, error: 'Industry / Vertical is required (*).' };
        }
        const hasObjective = Array.isArray(formData.objective)
          ? formData.objective.length > 0
          : Boolean(formData.objective && String(formData.objective).trim());
        if (!hasObjective) {
          return { isValid: false, error: 'Please select at least one Campaign Objective / Goal tag (*).' };
        }
        if (!formData.description || !formData.description.trim()) {
          return { isValid: false, error: 'Campaign Description & Brief is required (*).' };
        }
        return { isValid: true, error: null };
      }
      case 2: {
        if (!formData.productType || !formData.productType.trim()) {
          return { isValid: false, error: 'Product / Offering Type is required (*).' };
        }
        if (!formData.productName || !formData.productName.trim()) {
          return { isValid: false, error: 'Product / Service Name is required (*).' };
        }
        if (formData.hasFreeProduct && (!formData.freeProductValue || Number(formData.freeProductValue) <= 0)) {
          return { isValid: false, error: 'Estimated Retail Value is required when free product gifting is enabled (*).' };
        }
        return { isValid: true, error: null };
      }
      case 3: {
        if (!Array.isArray(formData.platforms) || formData.platforms.length === 0) {
          return { isValid: false, error: 'Please select at least one Target Social Platform (*).' };
        }
        return { isValid: true, error: null };
      }
      case 4: {
        if (!Array.isArray(formData.deliverables) || formData.deliverables.length === 0) {
          return { isValid: false, error: 'Please add at least one expected Deliverable (*).' };
        }
        const hasUntyped = formData.deliverables.some((d: any) => !d.type || !d.type.trim());
        if (hasUntyped) {
          return { isValid: false, error: 'Please select an Asset Type for all configured deliverables (*).' };
        }
        return { isValid: true, error: null };
      }
      case 5: {
        if (!formData.budgetPaymentModel) {
          return { isValid: false, error: 'Please select a Payment & Compensation Model (*).' };
        }
        const model = formData.budgetPaymentModel;
        if (model === 'FIXED') {
          if (formData.budgetMinPerInfluencer === undefined || formData.budgetMinPerInfluencer === '') {
            return { isValid: false, error: 'Fixed Fee Payout Per Creator is required (*).' };
          }
          if (formData.budgetTotalAmount === undefined || formData.budgetTotalAmount === '') {
            return { isValid: false, error: 'Total Campaign Budget Pool is required (*).' };
          }
        } else if (model === 'RANGE') {
          if (formData.budgetMinPerInfluencer === undefined || formData.budgetMinPerInfluencer === '') {
            return { isValid: false, error: 'Minimum Payout is required (*).' };
          }
          if (formData.budgetMaxPerInfluencer === undefined || formData.budgetMaxPerInfluencer === '') {
            return { isValid: false, error: 'Maximum Payout is required (*).' };
          }
          if (formData.budgetTotalAmount === undefined || formData.budgetTotalAmount === '') {
            return { isValid: false, error: 'Total Budget Pool is required (*).' };
          }
        } else if (model === 'NEGOTIABLE') {
          if (formData.budgetTotalAmount === undefined || formData.budgetTotalAmount === '') {
            return { isValid: false, error: 'Estimated Total Budget Pool is required (*).' };
          }
        } else if (model === 'PERFORMANCE_BASED') {
          if (formData.budgetTotalAmount === undefined || formData.budgetTotalAmount === '') {
            return { isValid: false, error: 'Total Budget Pool is required (*).' };
          }
        } else if (model === 'BARTER') {
          if (formData.freeProductValue === undefined || formData.freeProductValue === '') {
            return { isValid: false, error: 'Estimated Retail Value of Gifting Package is required (*).' };
          }
        } else if (model === 'HYBRID') {
          if (formData.budgetMinPerInfluencer === undefined || formData.budgetMinPerInfluencer === '') {
            return { isValid: false, error: 'Guaranteed Cash Payout is required (*).' };
          }
          if (formData.freeProductValue === undefined || formData.freeProductValue === '') {
            return { isValid: false, error: 'Product Sample Value is required (*).' };
          }
          if (formData.budgetTotalAmount === undefined || formData.budgetTotalAmount === '') {
            return { isValid: false, error: 'Total Financial Budget is required (*).' };
          }
        }
        return { isValid: true, error: null };
      }
      case 6: {
        if (
          formData.targetParticipants === undefined ||
          formData.targetParticipants === '' ||
          Number(formData.targetParticipants) < 1
        ) {
          return { isValid: false, error: 'Target Creators to Hire is required (minimum 1) (*).' };
        }
        return { isValid: true, error: null };
      }
      default:
        return { isValid: true, error: null };
    }
  };

  const handleNextStep = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      toastError(validation.error || 'Please fill in all required fields.', 'Required Field');
      return;
    }
    setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }

    for (let s = currentStep; s < targetStep; s++) {
      const v = validateStep(s);
      if (!v.isValid) {
        toastError(v.error || 'Required fields missing.', `Step ${s} (${STEPS[s - 1].label}) Required`);
        return;
      }
    }
    setCurrentStep(targetStep);
  };

  const sanitizeCampaignPayload = (data: any) => {
    const payload: any = { ...data };

    // Numerical cleanups
    if (payload.budgetTotalAmount !== undefined && payload.budgetTotalAmount !== '') {
      payload.budgetTotalAmount = Number(payload.budgetTotalAmount);
    } else {
      delete payload.budgetTotalAmount;
    }

    if (payload.budgetMinPerInfluencer !== undefined && payload.budgetMinPerInfluencer !== '') {
      payload.budgetMinPerInfluencer = Number(payload.budgetMinPerInfluencer);
    } else {
      delete payload.budgetMinPerInfluencer;
    }

    if (payload.budgetMaxPerInfluencer !== undefined && payload.budgetMaxPerInfluencer !== '') {
      payload.budgetMaxPerInfluencer = Number(payload.budgetMaxPerInfluencer);
    } else {
      delete payload.budgetMaxPerInfluencer;
    }

    if (payload.targetParticipants !== undefined && payload.targetParticipants !== '') {
      payload.targetParticipants = Number(payload.targetParticipants);
    } else {
      delete payload.targetParticipants;
    }

    if (payload.maxParticipants !== undefined && payload.maxParticipants !== '') {
      payload.maxParticipants = Number(payload.maxParticipants);
    } else {
      delete payload.maxParticipants;
    }

    if (payload.freeProductValue !== undefined && payload.freeProductValue !== '') {
      payload.freeProductValue = Number(payload.freeProductValue);
    } else {
      delete payload.freeProductValue;
    }

    if (payload.performanceRate !== undefined && payload.performanceRate !== '') {
      payload.performanceRate = Number(payload.performanceRate);
    } else {
      delete payload.performanceRate;
    }

    // Enums / string cleanups
    if (!payload.budgetPaymentModel) delete payload.budgetPaymentModel;
    if (Array.isArray(payload.objective)) {
      payload.objective = payload.objective.filter((o: any) => typeof o === 'string' && o.trim().length > 0);
      if (payload.objective.length === 0) delete payload.objective;
    } else if (typeof payload.objective === 'string' && payload.objective.trim().length > 0) {
      payload.objective = [payload.objective.trim()];
    } else {
      delete payload.objective;
    }
    delete payload.categories;
    if (!payload.industry) delete payload.industry;
    if (!payload.productType) delete payload.productType;
    if (!payload.productName) delete payload.productName;
    if (!payload.landingPageUrl) delete payload.landingPageUrl;
    if (!payload.coverImageUrl) delete payload.coverImageUrl;
    if (!payload.applicationDeadline) delete payload.applicationDeadline;
    if (!payload.startDate) delete payload.startDate;
    if (!payload.endDate) delete payload.endDate;

    // Deliverables cleanup
    if (Array.isArray(payload.deliverables)) {
      payload.deliverables = payload.deliverables
        .filter((d: any) => Boolean(d.type || d.requiredCta || (d.mandatoryHashtags && d.mandatoryHashtags.length > 0)))
        .map((d: any) => {
          const item: any = { ...d };
          if (item.quantity !== undefined && item.quantity !== '') item.quantity = Number(item.quantity);
          else delete item.quantity;
          if (item.revisionLimit !== undefined && item.revisionLimit !== '') item.revisionLimit = Number(item.revisionLimit);
          else delete item.revisionLimit;
          if (!item.type) item.type = 'Instagram Reel';
          return item;
        });
    }

    // Requirements cleanup
    if (payload.requirements) {
      const req: any = { ...payload.requirements };
      if (req.social) {
        const soc = { ...req.social };
        if (soc.minFollowers === undefined || soc.minFollowers === '') delete soc.minFollowers;
        else soc.minFollowers = Number(soc.minFollowers);
        if (soc.minEngagementRate === undefined || soc.minEngagementRate === '') delete soc.minEngagementRate;
        else soc.minEngagementRate = Number(soc.minEngagementRate);
        if (Object.keys(soc).length === 0) delete req.social;
        else req.social = soc;
      }
      if (req.influencer) {
        const inf = { ...req.influencer };
        if (!inf.countries || inf.countries.length === 0) delete inf.countries;
        if (Object.keys(inf).length === 0) delete req.influencer;
        else req.influencer = inf;
      }
      payload.requirements = req;
    }

    return payload;
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const sanitized = sanitizeCampaignPayload(formData);
      const created = await CampaignService.createCampaign(sanitized);
      toastSuccess('Campaign draft saved successfully.', 'Draft Saved');
      onSuccess(created);
    } catch (err: any) {
      toastError(err.message || 'Failed to save draft', 'Draft Error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const sanitized = sanitizeCampaignPayload(formData);
      const created = await CampaignService.createCampaign(sanitized);
      const published = await CampaignService.publishCampaign(created.id);
      toastSuccess('Campaign published and live for creator pitches!', 'Campaign Published');
      onSuccess(published);
    } catch (err: any) {
      toastError(err.message || 'Failed to publish campaign', 'Publishing Error');
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
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-all shadow-sm"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wizard Step Indicator & Body with Generous Top Negative Space */}
        <div className="p-6 pt-12 sm:pt-14 sm:px-8 overflow-y-auto flex-1 space-y-6 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <CampaignWizardStepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />

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
                onClick={handleNextStep}
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

