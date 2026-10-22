'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CampaignDetailView from '@/components/dashboard/influencer-views/campaign-discovery/CampaignDetailView';
import CampaignPitchModal from '@/components/dashboard/influencer-views/campaign-discovery/CampaignPitchModal';
import { CampaignItem } from '@/components/dashboard/influencer-views/campaign-discovery/CampaignCard';
import { mapDbCampaignToItem } from '@/components/dashboard/influencer-views/CampaignDiscoverySection';
import { CampaignService } from '@/services/campaign.service';
import { slugify } from '@/utils/dashboardRoutes';
import { ArrowLeft, Megaphone } from 'lucide-react';
import LottieLoader from '@/components/ui/LottieLoader';
import { useCurrency } from '@/context/CurrencyContext';

export default function CampaignBriefPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = typeof params?.id === 'string' ? decodeURIComponent(params.id).toLowerCase() : '';

  const { currency } = useCurrency();
  const [campaign, setCampaign] = useState<CampaignItem | null>(null);
  const [selectedCampaignForPitch, setSelectedCampaignForPitch] = useState<CampaignItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadCampaign() {
      setIsLoading(true);
      try {
        const res = await CampaignService.discoverCampaigns({ limit: 100 });
        const data = res?.campaigns || [];
        if (Array.isArray(data)) {
          const formattedList = data.map((d) => mapDbCampaignToItem(d, currency));
          const matched = formattedList.find((c) => {
            const cId = c.id.toLowerCase();
            const cTitleSlug = slugify(c.title);
            return (
              cId === idParam ||
              cTitleSlug === idParam ||
              c.title.toLowerCase() === idParam ||
              idParam.includes(cTitleSlug)
            );
          });
          if (matched) {
            setCampaign(matched);
          }
        }
      } catch (err) {
        console.warn('Could not load campaign:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCampaign();
  }, [idParam, currency]);

  if (isLoading) {
    return (
      <div className="h-full min-h-[450px] flex items-center justify-center">
        <LottieLoader size={220} message="Loading campaign brief..." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center mx-auto">
          <Megaphone className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-white">Campaign Brief Not Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The requested campaign brief could not be loaded from active sponsorships.
        </p>
        <button
          onClick={() => router.push('/dashboard/campaign-discovery')}
          type="button"
          className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shadow-purple-950/40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover Campaigns</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CampaignDetailView
        campaign={campaign}
        isSaved={isSaved}
        onToggleSave={() => setIsSaved((prev) => !prev)}
        onBack={() => router.push('/dashboard/campaign-discovery')}
        onApply={(c) => setSelectedCampaignForPitch(c)}
      />

      <CampaignPitchModal
        isOpen={Boolean(selectedCampaignForPitch)}
        onClose={() => setSelectedCampaignForPitch(null)}
        campaign={selectedCampaignForPitch}
        onSuccess={() => {
          setSelectedCampaignForPitch(null);
        }}
      />
    </div>
  );
}
