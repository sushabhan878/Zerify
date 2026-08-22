'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, Send, Sparkles } from 'lucide-react';
import ApplicationKpiBar from './subcomponents/ApplicationKpiBar';
import ApplicationCardItem, { ApplicationItem } from './subcomponents/ApplicationCardItem';
import OfferReceivedCard from './applications/OfferReceivedCard';
import OfferDetailModal from './applications/OfferDetailModal';
import { ApplicationService } from '@/services/application.service';
import { OfferService, CampaignOfferItem } from '@/services/offer.service';

export default function ApplicationsSection() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CONTRACT_SENT' | 'SHORTLISTED' | 'UNDER_REVIEW' | 'DECLINED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [offers, setOffers] = useState<CampaignOfferItem[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<CampaignOfferItem | null>(null);
  const [isAcceptingOffer, setIsAcceptingOffer] = useState(false);

  const [applications, setApplications] = useState<ApplicationItem[]>([
    {
      id: 1,
      brand: 'Sony Audio Systems',
      industry: 'Consumer Audio & Tech',
      role: 'WH-1000XM5 Wireless Headphones Unboxing Reel',
      appliedDate: 'Aug 20, 2026',
      proposedRate: '$2,800.00',
      deliveryTime: '5 Days from acceptance',
      status: 'CONTRACT_SENT',
      platforms: ['Instagram', 'YouTube'],
      verifiedBrand: true,
      pitchSummary: 'Proposed a cinematic 4K unboxing Reel with custom sound-frequency visuals demonstrating active noise cancellation in bustling city spots.',
      lastViewedByBrand: 'Brand viewed pitch 2h ago',
    },
    {
      id: 2,
      brand: 'Logitech Gaming',
      industry: 'Gaming Accessories & Hardware',
      role: 'Stream Deck + Wireless Gaming Mouse Integration',
      appliedDate: 'Aug 18, 2026',
      proposedRate: '$3,200.00',
      deliveryTime: '7 Days',
      status: 'SHORTLISTED',
      platforms: ['YouTube', 'TikTok'],
      verifiedBrand: true,
      pitchSummary: 'Will feature macro automation shortcuts for stream creators and dedicated RGB lighting syncing with game triggers.',
      lastViewedByBrand: 'Brand viewed pitch yesterday',
    },
  ]);

  const loadData = async () => {
    try {
      const [myApps, myOffers] = await Promise.all([
        ApplicationService.getMyApplications().catch(() => []),
        OfferService.getMyOffers().catch(() => []),
      ]);

      if (myOffers && myOffers.length > 0) {
        setOffers(myOffers);
      }

      if (myApps && myApps.length > 0) {
        const formatted: ApplicationItem[] = myApps.map((a: any) => ({
          id: a.id,
          brand: a.campaign?.brandProfile?.companyName || 'Verified Brand',
          industry: a.campaign?.industry || 'Technology & Creator',
          role: a.campaign?.title || 'Creator Campaign',
          appliedDate: new Date(a.submittedAt).toLocaleDateString(),
          proposedRate: a.proposedAmount ? `$${a.proposedAmount.toLocaleString()}` : '$1,500.00',
          deliveryTime: '7 Days',
          status: a.status === 'OFFER_SENT' ? 'CONTRACT_SENT' : a.status === 'APPLIED' ? 'UNDER_REVIEW' : a.status,
          platforms: a.campaign?.platforms || ['Instagram'],
          verifiedBrand: true,
          pitchSummary: a.applicationMessage || 'Submitted pitch concept',
          lastViewedByBrand: 'Live status synced',
        }));
        setApplications(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptOffer = async (offerId: string) => {
    setIsAcceptingOffer(true);
    try {
      await OfferService.acceptOffer(offerId);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAcceptingOffer(false);
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      await OfferService.declineOffer(offerId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async (id: any) => {
    if (confirm('Are you sure you want to withdraw this application pitch?')) {
      try {
        if (typeof id === 'string') {
          await ApplicationService.withdrawApplication(id);
        }
        setApplications((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filtered = applications.filter((app) => {
    const matchesTab = activeTab === 'ALL' || app.status === activeTab;
    const matchesSearch =
      app.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span>Applications & Offers Tracker</span>
          </h2>
          <p className="text-xs text-slate-400">
            Track pitch submissions, proposed rates, and received collaboration contracts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-extrabold text-purple-300">
            {applications.length} Pitches Active
          </span>
        </div>
      </div>

      {/* Offers Received Section */}
      {offers.filter((o) => o.status === 'PENDING').length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Pending Collaboration Offers ({offers.filter((o) => o.status === 'PENDING').length})</span>
          </h3>

          <div className="space-y-4">
            {offers
              .filter((o) => o.status === 'PENDING')
              .map((offer) => (
                <OfferReceivedCard
                  key={offer.id}
                  offer={offer}
                  onAccept={handleAcceptOffer}
                  onDecline={handleDeclineOffer}
                  onViewDetails={(off) => setSelectedOffer(off)}
                  isAccepting={isAcceptingOffer}
                />
              ))}
          </div>
        </div>
      )}

      {/* 1. KPI Stats Summary Bar */}
      <ApplicationKpiBar totalCount={applications.length} totalProposedValue="$12,500.00" />

      {/* 2. Controls Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search applications by brand, role, or campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Applications' },
            { id: 'CONTRACT_SENT', label: 'Contracts Sent' },
            { id: 'SHORTLISTED', label: 'Shortlisted' },
            { id: 'UNDER_REVIEW', label: 'Under Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Application Cards */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((application) => (
            <ApplicationCardItem key={application.id} application={application} onWithdraw={handleWithdraw} />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Applications Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No pitches match your selected filter criteria. Discover open campaigns from brand discovery.
            </p>
          </div>
        )}
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onAccept={handleAcceptOffer}
          onDecline={handleDeclineOffer}
        />
      )}
    </div>
  );
}
