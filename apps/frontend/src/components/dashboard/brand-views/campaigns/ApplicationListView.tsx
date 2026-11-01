'use client';

import React, { useState } from 'react';
import ApplicantCard from './ApplicantCard';
import { CampaignApplicationItem } from '@/services/application.service';
import { CreatorItem } from '../find-influencers/CreatorCard';
import { Users, Layers } from 'lucide-react';

interface ApplicationListViewProps {
  applications: CampaignApplicationItem[];
  onViewDetails: (app: CampaignApplicationItem) => void;
  onViewProfile?: (creator: CreatorItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onOpenComparison: (selectedApps: CampaignApplicationItem[]) => void;
  onAccept?: (app: CampaignApplicationItem) => void;
  onCounterOffer?: (app: CampaignApplicationItem) => void;
}

export default function ApplicationListView({
  applications,
  onViewDetails,
  onViewProfile,
  onShortlist,
  onReject,
  onSendOffer,
  onOpenComparison,
  onAccept,
  onCounterOffer,
}: ApplicationListViewProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCompareClick = () => {
    const selectedApps = applications.filter((a) => selectedForCompare.includes(a.id));
    onOpenComparison(selectedApps);
  };

  if (applications.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-3 light:bg-white light:border-slate-200/80 light:shadow-sm">
        <Users className="w-8 h-8 text-slate-600 light:text-slate-400 mx-auto" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-300 light:text-slate-900">No applications received yet</h4>
          <p className="text-xs text-slate-500 light:text-slate-500 max-w-md mx-auto">
            When influencers apply to this campaign, their application cards will appear here with their live status. You can also directly invite creators from the Find Influencers tab.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compare Floating Toolbar (only when 2+ applicants selected) */}
      {selectedForCompare.length > 1 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 backdrop-blur-xl light:bg-white light:border-purple-200 light:shadow-lg">
          <span className="text-xs font-bold text-indigo-200 light:text-purple-900">
            {selectedForCompare.length} applicants selected for comparison
          </span>
          <button
            onClick={handleCompareClick}
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white keep-white flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-white keep-white" />
            <span className="text-white keep-white">Compare Selected ({selectedForCompare.length})</span>
          </button>
        </div>
      )}

      {/* Grid of All Application Cards with their status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1 sm:pt-1.5">
        {applications.map((app) => (
          <ApplicantCard
            key={app.id}
            application={app}
            onViewDetails={onViewDetails}
            onViewProfile={onViewProfile}
            onShortlist={onShortlist}
            onReject={onReject}
            onSendOffer={onSendOffer}
            onSelectCompare={toggleCompare}
            isCompareSelected={selectedForCompare.includes(app.id)}
            onAccept={onAccept}
            onCounterOffer={onCounterOffer}
          />
        ))}
      </div>
    </div>
  );
}
