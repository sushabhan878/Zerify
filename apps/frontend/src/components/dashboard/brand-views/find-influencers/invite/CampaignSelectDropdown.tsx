'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, AlertCircle, Clock, X } from 'lucide-react';
import { CampaignItem } from '@/services/campaign.service';

interface CampaignSelectDropdownProps {
  campaigns: CampaignItem[];
  selectedCampaign: CampaignItem | null;
  onSelect: (campaign: CampaignItem) => void;
  invitedCampaignIds?: string[];
}

export default function CampaignSelectDropdown({
  campaigns,
  selectedCampaign,
  onSelect,
  invitedCampaignIds = [],
}: CampaignSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCampaignClick = (camp: CampaignItem) => {
    const isAlreadyInvited = invitedCampaignIds.includes(camp.id);
    if (isAlreadyInvited) {
      setErrorMessage('Already invited for this campaign');
      return;
    }

    setErrorMessage(null);
    onSelect(camp);
    setIsOpen(false);
  };

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-300 block">
        Select Target Campaign
      </label>

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border transition-all duration-200 flex items-center justify-between gap-2.5 text-left text-xs font-semibold ${
          errorMessage
            ? 'border-amber-500/60 ring-2 ring-amber-500/20 bg-slate-900 text-white'
            : isOpen
            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-slate-900 text-white'
            : 'border-white/10 hover:border-purple-500/40 hover:bg-slate-900 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              selectedCampaign
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-slate-500'
            }`}
          />
          <span className="truncate">
            {selectedCampaign ? selectedCampaign.title : 'Select an available campaign...'}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Error Message Alert */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-sm overflow-hidden"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-amber-400/80 hover:text-amber-200 p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl bg-[#0d0a21] border border-purple-500/30 shadow-2xl p-1.5 space-y-1 max-h-60 overflow-y-auto backdrop-blur-xl"
          >
            {campaigns.length > 0 ? (
              campaigns.map((camp) => {
                const isSelected = selectedCampaign?.id === camp.id;
                const isAlreadyInvited = invitedCampaignIds.includes(camp.id);

                return (
                  <button
                    key={camp.id}
                    type="button"
                    onClick={() => handleCampaignClick(camp)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between gap-2 transition-all ${
                      isAlreadyInvited
                        ? 'bg-slate-900/40 text-slate-400 border border-transparent hover:bg-amber-950/20 hover:border-amber-500/30 cursor-not-allowed'
                        : isSelected
                        ? 'bg-purple-600/25 text-purple-200 font-bold border border-purple-500/30'
                        : 'text-slate-200 hover:bg-white/5 hover:text-white border border-transparent cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isAlreadyInvited
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className={`truncate ${isAlreadyInvited ? 'line-through opacity-75' : ''}`}>
                        {camp.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAlreadyInvited ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Already Invited</span>
                        </span>
                      ) : isSelected ? (
                        <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      ) : null}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                No campaigns available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
