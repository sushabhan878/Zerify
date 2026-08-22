'use client';

import React from 'react';
import { Sparkles, DollarSign, Check, X, Send, Eye, UserCheck, ShieldCheck } from 'lucide-react';
import { CampaignApplicationItem } from '@/services/application.service';

interface ApplicantCardProps {
  application: CampaignApplicationItem;
  onViewDetails: (app: CampaignApplicationItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onSelectCompare?: (appId: string) => void;
  isCompareSelected?: boolean;
}

export default function ApplicantCard({
  application,
  onViewDetails,
  onShortlist,
  onReject,
  onSendOffer,
  onSelectCompare,
  isCompareSelected,
}: ApplicantCardProps) {
  const profile: any = application.profileSnapshot || {};
  const match: any = application.matchSnapshot || { score: 85, eligibility: 'ELIGIBLE' };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OFFER_ACCEPTED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'OFFER_SENT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'SHORTLISTED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'UNDER_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-500/30 transition-all space-y-3">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {onSelectCompare && (
            <input
              type="checkbox"
              checked={isCompareSelected || false}
              onChange={() => onSelectCompare(application.id)}
              className="rounded border-white/20 text-purple-600 focus:ring-purple-500 h-4 w-4 bg-slate-950"
            />
          )}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white">{profile.displayName || 'Creator'}</h4>
              <span className="text-[10px] text-slate-400 font-bold">@{profile.username || 'handle'}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">{profile.platform || 'INSTAGRAM'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Match Score Badge */}
          <div className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center gap-1 text-[10px] font-extrabold text-purple-300">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>{match.score}% Match</span>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${getStatusColor(application.status)}`}>
            {application.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Snapshot Stats */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-white/5 text-center">
        <div>
          <span className="text-[9px] text-slate-500 block uppercase font-bold">Audience</span>
          <span className="text-xs font-black text-white">
            {profile.followersCount ? profile.followersCount.toLocaleString() : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 block uppercase font-bold">Engagement</span>
          <span className="text-xs font-black text-emerald-400">
            {profile.engagementRate ? `${profile.engagementRate}%` : 'N/A'}
          </span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 block uppercase font-bold">Pitch Quote</span>
          <span className="text-xs font-black text-purple-300">
            {application.proposedAmount ? `$${application.proposedAmount}` : 'Flexible'}
          </span>
        </div>
      </div>

      {/* Pitch Snippet */}
      {application.applicationMessage && (
        <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/30 p-2 rounded-lg border border-white/5">
          &quot;{application.applicationMessage}&quot;
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <button
          onClick={() => onViewDetails(application)}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Full Pitch</span>
        </button>

        <div className="flex items-center gap-2">
          {application.status === 'APPLIED' && (
            <>
              <button
                onClick={() => onReject(application.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-xs font-bold text-slate-400 transition-colors"
              >
                Pass
              </button>
              <button
                onClick={() => onShortlist(application.id)}
                className="px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-xs font-bold text-indigo-300 hover:text-white border border-indigo-500/40 transition-all"
              >
                Shortlist
              </button>
            </>
          )}

          {(application.status === 'SHORTLISTED' || application.status === 'UNDER_REVIEW') && (
            <button
              onClick={() => onSendOffer(application)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-black text-white flex items-center gap-1 shadow-md transition-all"
            >
              <Send className="w-3 h-3" />
              <span>Send Offer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
