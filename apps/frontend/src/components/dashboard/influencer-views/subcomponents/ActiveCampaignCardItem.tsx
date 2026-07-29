'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  Clock,
  Upload,
  MessageSquare,
  FileText,
  Lock,
  Calendar,
  AlertCircle,
  Video,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface ActiveCampaignItem {
  id: number;
  title: string;
  brand: string;
  industry: string;
  stage: 'IN_PRODUCTION' | 'CONTENT_REVIEW' | 'READY_TO_PUBLISH' | 'COMPLETED';
  deadline: string;
  payout: string;
  progress: number;
  deliverables: { title: string; completed: boolean }[];
  verifiedBrand: boolean;
  contractBrief: string;
}

interface ActiveCampaignCardItemProps {
  campaign: ActiveCampaignItem;
  onUploadSubmit: (id: number) => void;
}

export default function ActiveCampaignCardItem({ campaign, onUploadSubmit }: ActiveCampaignCardItemProps) {
  const [showBrief, setShowBrief] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const getStageBadge = (stage: ActiveCampaignItem['stage']) => {
    switch (stage) {
      case 'READY_TO_PUBLISH':
        return { label: 'Ready for Publishing', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'CONTENT_REVIEW':
        return { label: 'In Content Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'IN_PRODUCTION':
        return { label: 'In Production', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'COMPLETED':
        return { label: 'Completed & Paid', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
    }
  };

  const badge = getStageBadge(campaign.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 sm:p-6 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-5 hover:border-purple-500/40 transition-all group"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-900/60 to-slate-900 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-xs font-black text-purple-300">{campaign.brand}</span>
              {campaign.verifiedBrand && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-extrabold text-purple-300">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" /> Verified
                </span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">{campaign.title}</h3>
            <span className="text-xs text-slate-400 font-medium">{campaign.industry}</span>
          </div>
        </div>

        {/* Payout & Deadline */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 p-3 rounded-xl bg-slate-950/60 border border-white/10 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Escrow Locked
            </span>
            <span className="text-xl font-black text-emerald-400">{campaign.payout}</span>
          </div>
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Due: {campaign.deadline}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-white/10">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">Milestone Progress</span>
          <span className="text-purple-400 font-extrabold">{campaign.progress}% Completed</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${campaign.progress}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 shadow-md"
          />
        </div>
      </div>

      {/* Deliverables Checklist */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-purple-400" />
          <span>Deliverables Requirements:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {campaign.deliverables.map((del, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                del.completed
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-slate-950/60 border-white/10 text-slate-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  del.completed ? 'bg-emerald-500 text-slate-950' : 'border border-slate-500'
                }`}
              >
                {del.completed && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="truncate">{del.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brief Drawer Toggle */}
      {showBrief && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 text-xs text-slate-300 space-y-1">
          <span className="font-bold text-purple-300 block">Campaign Brief Guidelines</span>
          <p className="leading-relaxed">{campaign.contractBrief}</p>
        </motion.div>
      )}

      {/* Footer Controls */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBrief(!showBrief)}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>{showBrief ? 'Hide Campaign Brief' : 'View Campaign Brief'}</span>
            {showBrief ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span className="text-slate-700">|</span>
          <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat with Brand</span>
          </button>
        </div>

        <button
          onClick={() => onUploadSubmit(campaign.id)}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-105 text-xs font-extrabold text-white shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Content Draft</span>
        </button>
      </div>
    </motion.div>
  );
}
