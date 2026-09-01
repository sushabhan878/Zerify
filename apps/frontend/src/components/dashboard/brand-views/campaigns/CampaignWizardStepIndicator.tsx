'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CampaignWizardStepIndicatorProps {
  steps: { id: number; label: string; description?: string }[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export default function CampaignWizardStepIndicator({
  steps,
  currentStep,
  onStepClick,
}: CampaignWizardStepIndicatorProps) {
  const progressRatio = (currentStep - 1) / (steps.length - 1);

  return (
    <div className="w-full py-3 mb-8 select-none">
      <div className="relative flex items-center justify-between">
        {/* Continuous Connecting Line between circle centers (left-5 right-5 matches center of w-10 circle) */}
        <div className="absolute top-5 left-5 right-5 h-[3px] bg-slate-800/80 rounded-full z-0 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full shadow-[0_0_16px_rgba(168,85,247,1)]"
            initial={false}
            animate={{
              width: `${progressRatio * 100}%`,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group cursor-pointer"
              onClick={() => onStepClick(step.id)}
            >
              {/* Number Circle */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400/50'
                    : isCurrent
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white shadow-[0_0_22px_rgba(168,85,247,0.9)] ring-4 ring-purple-500/30'
                    : 'bg-slate-900 border border-white/10 text-slate-500 hover:border-purple-500/40 hover:text-slate-300'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </motion.div>

              {/* Title Below the Number */}
              <div className="text-center mt-3 max-w-[110px]">
                <span
                  className={`block text-[11px] font-extrabold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                      : isCompleted
                      ? 'text-slate-200'
                      : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden md:block text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5">
                    {step.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
