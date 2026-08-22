'use client';

import React, { useState } from 'react';
import ApplicantCard from './ApplicantCard';
import { CampaignApplicationItem } from '@/services/application.service';
import { Users, Filter, Layers } from 'lucide-react';

interface ApplicationListViewProps {
  applications: CampaignApplicationItem[];
  onViewDetails: (app: CampaignApplicationItem) => void;
  onShortlist: (appId: string) => void;
  onReject: (appId: string) => void;
  onSendOffer: (app: CampaignApplicationItem) => void;
  onOpenComparison: (selectedApps: CampaignApplicationItem[]) => void;
}

const STATUS_TABS = [
  { id: 'ALL', label: 'All Applicants' },
  { id: 'APPLIED', label: 'New Pitches' },
  { id: 'SHORTLISTED', label: 'Shortlisted' },
  { id: 'OFFER_SENT', label: 'Offers Sent' },
  { id: 'OFFER_ACCEPTED', label: 'Confirmed' },
  { id: 'REJECTED', label: 'Declined' },
];

export default function ApplicationListView({
  applications,
  onViewDetails,
  onShortlist,
  onReject,
  onSendOffer,
  onOpenComparison,
}: ApplicationListViewProps) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const filtered = applications.filter((app) => {
    if (activeTab === 'ALL') return true;
    return app.status === activeTab;
  });

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCompareClick = () => {
    const selectedApps = applications.filter((a) => selectedForCompare.includes(a.id));
    onOpenComparison(selectedApps);
  };

  return (
    <div className="space-y-4">
      {/* Tab Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const count =
              tab.id === 'ALL'
                ? applications.length
                : applications.filter((a) => a.status === tab.id).length;
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedForCompare.length > 1 && (
          <button
            onClick={handleCompareClick}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white flex items-center gap-1.5 shadow-md transition-all flex-shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare ({selectedForCompare.length})</span>
          </button>
        )}
      </div>

      {/* Grid of Applicants */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950/40 border border-dashed border-white/10 text-center space-y-3">
          <Users className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-xs font-bold text-slate-300">No applicants in this category</h4>
          <p className="text-[11px] text-slate-500">
            When influencers discover and apply to this campaign, their pitches will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((app) => (
            <ApplicantCard
              key={app.id}
              application={app}
              onViewDetails={onViewDetails}
              onShortlist={onShortlist}
              onReject={onReject}
              onSendOffer={onSendOffer}
              onSelectCompare={toggleCompare}
              isCompareSelected={selectedForCompare.includes(app.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
