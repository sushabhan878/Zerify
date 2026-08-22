'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Sparkles, DollarSign, Users, Activity, MapPin, Send } from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';

interface ApplicantComparisonViewProps {
  applicants: CampaignApplicationItem[];
  onClose: () => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
}

export default function ApplicantComparisonView({
  applicants,
  onClose,
  onSendOffer,
}: ApplicantComparisonViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (applicants.length === 0 || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div>
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
              Creator Benchmark
            </span>
            <h3 className="text-base font-black text-white">
              Comparing {applicants.length} Applicant Candidates
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-[280px] gap-4">
            {applicants.map((app) => {
              const profile: any = app.profileSnapshot || {};
              const match: any = app.matchSnapshot || { score: 85 };

              return (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center pb-3 border-b border-white/5">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-base mx-auto shadow-md mb-2">
                        {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <h4 className="text-sm font-black text-white">{profile.displayName || 'Creator'}</h4>
                      <p className="text-xs text-slate-400">@{profile.username}</p>
                      <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black border border-purple-500/30">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>{match.score}% Match Score</span>
                      </div>
                    </div>

                    {/* Metric Rows */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Platform:</span>
                        <span className="font-bold text-white uppercase">{profile.platform || 'INSTAGRAM'}</span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Followers:</span>
                        <span className="font-black text-white">
                          {profile.followersCount ? profile.followersCount.toLocaleString() : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Engagement:</span>
                        <span className="font-black text-emerald-400">
                          {profile.engagementRate ? `${profile.engagementRate}%` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Proposed Fee:</span>
                        <span className="font-black text-purple-300">
                          {app.proposedAmount ? `$${app.proposedAmount}` : 'Flexible'}
                        </span>
                      </div>

                      <div className="py-1.5">
                        <span className="text-slate-400 block mb-1">Pitch Concept:</span>
                        <p className="text-[11px] text-slate-300 line-clamp-3 italic bg-slate-900 p-2 rounded-lg border border-white/5">
                          {app.applicationMessage || 'No text pitch.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => onSendOffer(app)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Offer</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

