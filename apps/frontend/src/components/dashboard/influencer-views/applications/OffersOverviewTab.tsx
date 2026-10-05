'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, AlertCircle, Compass, ShieldCheck } from 'lucide-react';
import OfferReceivedCard from './OfferReceivedCard';
import { CampaignOfferItem } from '@/services/offer.service';

interface OffersOverviewTabProps {
  offers: CampaignOfferItem[];
  onAccept: (offerId: string) => void;
  onDecline: (offerId: string) => void;
  onViewDetails: (offer: CampaignOfferItem) => void;
  isAccepting: boolean;
  onNavigate?: (routeId: string) => void;
}

export default function OffersOverviewTab({
  offers,
  onAccept,
  onDecline,
  onViewDetails,
  isAccepting,
  onNavigate,
}: OffersOverviewTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED'>('PENDING');

  const pendingCount = offers.filter((o) => o.status === 'PENDING').length;
  const totalOfferedCash = offers
    .filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED')
    .reduce((acc, o) => acc + (Number(o.compensationAmount) || 0), 0);

  const filteredOffers = offers.filter((offer) => {
    const matchesStatus = filterStatus === 'ALL' || offer.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const app = offer.application || {};
    const campaign = app.campaign || {};
    const brand = campaign.brandProfile || {};
    const title = campaign.title || '';
    const brandName = brand.companyName || '';

    const matchesSearch =
      !q || title.toLowerCase().includes(q) || brandName.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Offers KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-1.5"
        >
          <span className="text-xs font-semibold text-slate-400 block">Pending Collaboration Offers</span>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {pendingCount} Pending
          </div>
          <span className="text-[11px] font-bold text-purple-400 block">Awaiting your response</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-1.5"
        >
          <span className="text-xs font-semibold text-slate-400 block">Total Offered Payouts</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
            ${totalOfferedCash.toLocaleString()}
          </div>
          <span className="text-[11px] font-bold text-emerald-400/80 block">100% Escrow Backed</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-1.5"
        >
          <span className="text-xs font-semibold text-slate-400 block">Platform Security</span>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            <span>Guaranteed</span>
          </div>
          <span className="text-[11px] font-bold text-indigo-300/80 block">Payment locked before start</span>
        </motion.div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search offers by brand or campaign brief..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'PENDING', label: 'Pending Response' },
            { id: 'ALL', label: 'All Received' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'DECLINED', label: 'Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                filterStatus === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Cards List */}
      {filteredOffers.length > 0 ? (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <OfferReceivedCard
              key={offer.id}
              offer={offer}
              onAccept={onAccept}
              onDecline={onDecline}
              onViewDetails={onViewDetails}
              isAccepting={isAccepting}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-950/60 border border-purple-500/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[300px] backdrop-blur-2xl shadow-xl shadow-purple-950/20">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-white">No Pending Collaboration Offers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When brands review your profile or accept your pitches, their direct contract offers with escrow payments will appear right here.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('campaign-discovery')}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/40 flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Campaigns & Submit Pitches</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
