'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, FileText, AlertCircle, Compass } from 'lucide-react';
import ApplicationKpiBar from './subcomponents/ApplicationKpiBar';
import ApplicationCardItem, { ApplicationItem } from './subcomponents/ApplicationCardItem';
import { ApplicationService } from '@/services/application.service';
import { OfferService } from '@/services/offer.service';
import { useCurrency } from '@/context/CurrencyContext';
import LottieLoader from '@/components/ui/LottieLoader';

interface ApplicationsSectionProps {
  onNavigate?: (routeId: string) => void;
}

type ApplicationFilterTab =
  | 'ALL'
  | 'COUNTER_OFFER'
  | 'CONTRACT_SENT'
  | 'SHORTLISTED'
  | 'UNDER_REVIEW'
  | 'DECLINED';

export default function ApplicationsSection({ onNavigate }: ApplicationsSectionProps) {
  const { format: formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<ApplicationFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const myApps = await ApplicationService.getMyApplications().catch(() => []);
      if (myApps && Array.isArray(myApps)) {
        const formatted: ApplicationItem[] = myApps.map((a: any) => {
          // Check for counter offer from backend offers relation
          const offersList = Array.isArray(a.offers) ? a.offers : [];
          const latestOffer = offersList.length > 0 ? offersList[0] : null;

          let isCounter = false;
          let counterAmount: number | undefined;
          let counterNotes: string | undefined;
          let offerId: string | undefined = latestOffer?.id;

          if (latestOffer) {
            if (
              latestOffer.termsSnapshot?.isCounterOffer === true ||
              latestOffer.isCounterOffer === true ||
              (typeof latestOffer.customNotes === 'string' && latestOffer.customNotes.includes('[COUNTER_OFFER]')) ||
              (latestOffer.status === 'PENDING' && Number(latestOffer.compensationAmount) !== Number(a.proposedAmount))
            ) {
              isCounter = true;
              counterAmount = Number(latestOffer.compensationAmount);
              counterNotes = latestOffer.customNotes;
            }
          }

          // Check localStorage fallback for immediate cross-tab sync
          if (!isCounter) {
            try {
              const localCounter = localStorage.getItem(`zerify_counter_offer_${a.id}`);
              if (localCounter) {
                const parsed = JSON.parse(localCounter);
                isCounter = true;
                counterAmount = Number(parsed.counterAmount || parsed.amount);
                counterNotes = parsed.notes;
              }
            } catch {}
          }

          let statusText: ApplicationItem['status'] = 'UNDER_REVIEW';
          if (isCounter) {
            statusText = 'COUNTER_OFFER';
          } else if (a.status === 'OFFER_SENT' || a.status === 'OFFER_ACCEPTED') {
            statusText = 'CONTRACT_SENT';
          } else if (a.status === 'SHORTLISTED') {
            statusText = 'SHORTLISTED';
          } else if (a.status === 'REJECTED' || a.status === 'OFFER_DECLINED' || a.status === 'WITHDRAWN') {
            statusText = 'DECLINED';
          }

          const currency = a.proposedCurrency || 'USD';
          const sym = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
          const rawAmount = Number(a.proposedAmount || 0);
          const rateStr = rawAmount > 0 ? `${sym}${rawAmount.toLocaleString()}` : 'Fixed Barter';
          const counterRateStr = counterAmount ? `${sym}${counterAmount.toLocaleString()}` : undefined;

          return {
            id: a.id,
            brand: a.campaign?.brandProfile?.companyName || 'Verified Brand',
            industry: a.campaign?.industry || a.campaign?.brandProfile?.industry || 'Technology & Creator',
            role: a.campaign?.title || 'Creator Campaign Pitch',
            appliedDate: new Date(a.submittedAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            proposedRate: rateStr,
            proposedAmount: isCounter && counterAmount ? counterAmount : rawAmount,
            deliveryTime: '7 Days from acceptance',
            status: statusText,
            platforms: a.campaign?.targetPlatforms || a.campaign?.platforms || ['Instagram'],
            verifiedBrand: true,
            pitchSummary: a.applicationMessage || a.contentIdea || 'Submitted pitch concept and content strategy.',
            lastViewedByBrand: 'Live status synced',
            isCounterOffer: isCounter,
            counterAmount,
            counterRate: counterRateStr,
            counterNotes,
            offerId,
          };
        });
        setApplications(formatted);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('zerify_counter_offer_updated', loadData);
    return () => {
      window.removeEventListener('zerify_counter_offer_updated', loadData);
    };
  }, [loadData]);

  const handleWithdraw = async (id: string | number) => {
    if (confirm('Are you sure you want to withdraw this application pitch?')) {
      try {
        if (typeof id === 'string') {
          await ApplicationService.withdrawApplication(id);
        }
        setApplications((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        console.error('Failed to withdraw application:', err);
      }
    }
  };

  const handleAcceptOffer = async (offerId?: string, appId?: string | number) => {
    try {
      if (offerId) {
        await OfferService.acceptOffer(offerId);
      }
      if (appId) {
        localStorage.removeItem(`zerify_counter_offer_${appId}`);
      }
      loadData();
    } catch (err) {
      console.error('Failed to accept counter offer:', err);
      if (appId) {
        localStorage.removeItem(`zerify_counter_offer_${appId}`);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId
              ? { ...app, status: 'CONTRACT_SENT', isCounterOffer: false }
              : app
          )
        );
      }
    }
  };

  const handleDeclineOffer = async (offerId?: string, appId?: string | number) => {
    try {
      if (offerId) {
        await OfferService.declineOffer(offerId);
      }
      if (appId) {
        localStorage.removeItem(`zerify_counter_offer_${appId}`);
      }
      loadData();
    } catch (err) {
      console.error('Failed to decline counter offer:', err);
      if (appId) {
        localStorage.removeItem(`zerify_counter_offer_${appId}`);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === appId
              ? { ...app, status: 'DECLINED', isCounterOffer: false }
              : app
          )
        );
      }
    }
  };

  const kpis = useMemo(() => {
    const currentList =
      activeTab === 'ALL'
        ? applications
        : activeTab === 'COUNTER_OFFER'
        ? applications.filter((a) => a.isCounterOffer)
        : applications.filter((a) => a.status === activeTab);
    const count = currentList.length;
    const totalRev = currentList.reduce((acc, a) => acc + (a.proposedAmount || 0), 0);
    const avgRev = count > 0 ? totalRev / count : 0;
    const maxRev = count > 0 ? Math.max(...currentList.map((a) => a.proposedAmount || 0)) : 0;

    const shortlistedCount = applications.filter(
      (a) => a.status === 'SHORTLISTED' || a.status === 'CONTRACT_SENT'
    ).length;
    const conversionRate =
      applications.length > 0 ? Math.round((shortlistedCount / applications.length) * 100) : 0;

    if (activeTab === 'COUNTER_OFFER') {
      return [
        {
          label: 'Counter Offers',
          val: `${count} Offers`,
          change: count > 0 ? 'Awaiting your review' : 'No counter proposals',
        },
        {
          label: 'Counter Contract Value',
          val: formatCurrency(totalRev),
          change: count > 0 ? 'Proposed compensation' : 'No counter value',
        },
        {
          label: 'Avg. Counter Rate',
          val: formatCurrency(avgRev),
          change: 'Per counter proposal',
        },
        {
          label: 'Top Counter Offer',
          val: formatCurrency(maxRev),
          change: count > 0 ? 'Highest counter proposal' : 'No counter deals',
        },
      ];
    }

    if (activeTab === 'CONTRACT_SENT') {
      return [
        {
          label: 'Offers Received',
          val: `${count} Offers`,
          change: count > 0 ? 'Awaiting your review' : 'No active offers',
        },
        {
          label: 'Offer Contract Value',
          val: formatCurrency(totalRev),
          change: count > 0 ? 'Across received offers' : 'No contract value',
        },
        {
          label: 'Avg. Offer Rate',
          val: formatCurrency(avgRev),
          change: 'Per contract offer',
        },
        {
          label: 'Top Offer Value',
          val: formatCurrency(maxRev),
          change: count > 0 ? 'Highest contract offer' : 'No offers',
        },
      ];
    }

    if (activeTab === 'SHORTLISTED') {
      return [
        {
          label: 'Shortlisted Pitches',
          val: `${count} Pitches`,
          change: count > 0 ? 'Under brand discussion' : 'None shortlisted yet',
        },
        {
          label: 'Shortlisted Value',
          val: formatCurrency(totalRev),
          change: count > 0 ? 'High probability deals' : 'No pipeline value',
        },
        {
          label: 'Avg. Shortlist Size',
          val: formatCurrency(avgRev),
          change: 'Per shortlisted pitch',
        },
        {
          label: 'Top Shortlisted',
          val: formatCurrency(maxRev),
          change: count > 0 ? 'Highest potential deal' : 'No shortlisted deals',
        },
      ];
    }

    if (activeTab === 'UNDER_REVIEW') {
      return [
        {
          label: 'Under Review',
          val: `${count} Pitches`,
          change: count > 0 ? 'Awaiting brand decision' : 'No pending reviews',
        },
        {
          label: 'Pending Review Value',
          val: formatCurrency(totalRev),
          change: count > 0 ? 'Pipeline under evaluation' : 'No pending value',
        },
        {
          label: 'Avg. Proposed Rate',
          val: formatCurrency(avgRev),
          change: 'Per open application',
        },
        {
          label: 'Top Pending Pitch',
          val: formatCurrency(maxRev),
          change: count > 0 ? 'Largest pending proposal' : 'No pending pitches',
        },
      ];
    }

    if (activeTab === 'DECLINED') {
      return [
        {
          label: 'Declined Pitches',
          val: `${count} Pitches`,
          change: count > 0 ? 'Not selected / closed' : 'No declined pitches',
        },
        {
          label: 'Declined Volume',
          val: formatCurrency(totalRev),
          change: count > 0 ? 'Total passed value' : 'No declined value',
        },
        {
          label: 'Avg. Declined Rate',
          val: formatCurrency(avgRev),
          change: 'Per closed pitch',
        },
        {
          label: 'Highest Declined',
          val: formatCurrency(maxRev),
          change: count > 0 ? 'Largest closed proposal' : 'No closed pitches',
        },
      ];
    }

    // ALL Pitches
    return [
      {
        label: 'Applications Submitted',
        val: `${count} Pitches`,
        change: 'All-time proposals',
      },
      {
        label: 'Total Proposed Value',
        val: formatCurrency(totalRev),
        change: 'Combined pitch pipeline',
      },
      {
        label: 'Avg. Pitch Rate',
        val: formatCurrency(avgRev),
        change: 'Per submitted proposal',
      },
      {
        label: 'Shortlist / Offer Rate',
        val: `${conversionRate}%`,
        change: `${shortlistedCount} of ${applications.length} progressed`,
      },
    ];
  }, [activeTab, applications, formatCurrency]);

  const filtered = applications.filter((app) => {
    const matchesTab =
      activeTab === 'ALL'
        ? true
        : activeTab === 'COUNTER_OFFER'
        ? Boolean(app.isCounterOffer)
        : app.status === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.brand.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      app.industry.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. KPI Stats Summary Bar */}
      <ApplicationKpiBar kpis={kpis} />

      {/* 2. Controls Bar: Search & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pitches by brand, role, or campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All Pitches' },
            { id: 'COUNTER_OFFER', label: 'Counter Offers' },
            { id: 'CONTRACT_SENT', label: 'Contracts Sent' },
            { id: 'SHORTLISTED', label: 'Shortlisted' },
            { id: 'UNDER_REVIEW', label: 'Under Review' },
            { id: 'DECLINED', label: 'Not Selected' },
          ].map((tab) => {
            const count =
              tab.id === 'ALL'
                ? applications.length
                : tab.id === 'COUNTER_OFFER'
                ? applications.filter((a) => a.isCounterOffer).length
                : applications.filter((a) => a.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? tab.id === 'COUNTER_OFFER'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                      : 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab.id
                        ? 'bg-black/30 text-white'
                        : tab.id === 'COUNTER_OFFER'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Application Cards List */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center min-h-[320px]">
          <LottieLoader size={180} message="Loading your submitted pitches..." />
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-950/60 border border-purple-500/20 text-center space-y-4 flex flex-col items-center justify-center min-h-[320px] backdrop-blur-2xl shadow-xl shadow-purple-950/20">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-white">No Pitches Submitted Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You haven&apos;t pitched or applied to any campaign opportunities yet. Browse open campaign briefs in Campaign Discovery to submit your first concept!
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('campaign-discovery')}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/40 flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Discover Campaigns to Pitch</span>
            </button>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Pitches Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No submitted pitches match your selected filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('ALL');
            }}
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-purple-500/20 text-xs font-bold text-slate-300 hover:text-white transition-all"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((application) => (
            <ApplicationCardItem
              key={application.id}
              application={application}
              onWithdraw={handleWithdraw}
              onAcceptOffer={handleAcceptOffer}
              onDeclineOffer={handleDeclineOffer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
