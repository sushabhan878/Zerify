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
    <div className="w-full py-2 select-none">
      <div className="relative flex items-center justify-between">
        {/* Continuous Connecting Line between circle centers */}
        <div className="absolute top-5 left-5 right-5 h-[2px] bg-slate-800 rounded-full z-0 overflow-hidden">
          <motion.div
            className="h-full bg-purple-600 rounded-full"
            initial={false}
            animate={{
              width: `${progressRatio * 100}%`,
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
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
                  scale: isCurrent ? 1.08 : 1,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : isCurrent
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 border-2 border-purple-400'
                    : 'bg-slate-900 border border-purple-500/25 text-slate-400 hover:border-purple-500/60 hover:text-white'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </motion.div>

              {/* Title Below the Number */}
              <div className="text-center mt-2.5 max-w-[105px]">
                <span
                  className={`block text-[11px] font-bold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-purple-300'
                      : isCompleted
                      ? 'text-slate-200'
                      : 'text-slate-400 group-hover:text-slate-200'
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
