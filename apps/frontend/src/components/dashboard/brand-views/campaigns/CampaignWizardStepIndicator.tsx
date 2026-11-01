'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CampaignWizardStepIndicatorProps {
  steps: { id: number; label: string; description?: string }[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  isStepCompleted?: (stepId: number) => boolean;
}

export default function CampaignWizardStepIndicator({
  steps,
  currentStep,
  onStepClick,
  isStepCompleted,
}: CampaignWizardStepIndicatorProps) {
  const progressRatio = (currentStep - 1) / (steps.length - 1);

  return (
    <div className="w-full py-2 select-none">
      <div className="relative flex items-center justify-between">
        {/* Continuous Connecting Line between circle centers */}
        <div className="absolute top-5 left-5 right-5 h-[2px] bg-slate-800 light:bg-slate-200 rounded-full z-0 overflow-hidden">
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
          const isStepDone = isStepCompleted ? isStepCompleted(step.id) : currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isCompleted = !isCurrent && isStepDone;
          const isUnfilledPastStep = !isCurrent && !isStepDone && currentStep > step.id;

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
                    ? 'bg-purple-600 text-white keep-white shadow-md shadow-purple-900/30'
                    : isCurrent
                    ? 'bg-purple-600 text-white keep-white shadow-lg shadow-purple-600/40 border-2 border-purple-400'
                    : isUnfilledPastStep
                    ? 'bg-slate-900 light:bg-white border-2 border-purple-500/40 light:border-purple-300 text-slate-300 light:text-slate-700 hover:border-purple-400 hover:text-white light:hover:text-purple-700'
                    : 'bg-slate-900 light:bg-white border border-purple-500/25 light:border-slate-300 text-slate-400 light:text-slate-500 hover:border-purple-500/60 hover:text-white light:hover:text-purple-700'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5] text-white keep-white" />
                ) : (
                  <span className={isCurrent ? 'keep-white text-white' : ''}>{step.id}</span>
                )}
              </motion.div>

              {/* Title Below the Number */}
              <div className="text-center mt-2.5 max-w-[105px]">
                <span
                  className={`block text-[11px] font-bold tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-purple-300 light:text-purple-700'
                      : isCompleted
                      ? 'text-slate-200 light:text-slate-800'
                      : 'text-slate-400 group-hover:text-slate-200 light:text-slate-500 light:group-hover:text-slate-800'
                  }`}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="hidden md:block text-[9.5px] text-slate-500 light:text-slate-500 font-medium leading-tight mt-0.5">
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
