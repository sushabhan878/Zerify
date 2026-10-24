'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Download, Loader2, RefreshCw, Rocket, Search, Handshake, Building2 } from 'lucide-react';
import { BrandOverviewData, BrandOverviewService } from '@/services/brand-overview.service';
import OverviewKpiGrid from './overview/OverviewKpiGrid';
import CampaignPerformanceTrend from './overview/CampaignPerformanceTrend';
import TopCampaignsList from './overview/TopCampaignsList';
import OverviewCreators from './overview/OverviewCreators';
import RecentActivityFeed from './overview/RecentActivityFeed';

interface BrandOverviewSectionProps {
  userName?: string;
  companyName?: string;
  onNavigate?: (routeId: string) => void;
}

const controlClass = 'px-3.5 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-purple-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:opacity-50 transition-all';

const quickActions = [
  { label: 'New Campaign', routeId: 'my-campaigns', icon: Rocket, primary: true },
  { label: 'Find Creators', routeId: 'find-influencer', icon: Search, primary: false },
  { label: 'Active Deals', routeId: 'active-deals', icon: Handshake, primary: false },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function BrandOverviewSection({ userName, companyName, onNavigate }: BrandOverviewSectionProps) {
  const [data, setData] = useState<BrandOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaignId, setCampaignId] = useState('all');
  const mounted = useRef(false);
  const loading = useRef(false);

  const load = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    setIsLoading(true);
    setError('');
    try {
      const result = await BrandOverviewService.getOverview();
      if (mounted.current) setData(result);
    } catch {
      if (mounted.current) setError('Could not refresh overview data. Please try again.');
    } finally {
      loading.current = false;
      if (mounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    const onFocus = () => { void load(); };
    window.addEventListener('focus', onFocus);
    return () => {
      mounted.current = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [load]);

  const campaigns = useMemo(() => (data?.campaigns ?? []).filter((c) => campaignId === 'all' || c.id === campaignId), [data, campaignId]);

  const exportCsv = () => {
    const cell = (value: string | number) => {
      const text = String(value);
      return '"' + (/^[=+\-@\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
    };
    const rows = [
      ['Campaign', 'Status', 'Applications', 'Collaborators', 'Paid out', 'Currency', 'Reach', 'Engagement'],
      ...campaigns.map((c) => [c.title, c.status, c.applications.length, c.participants.filter((p) => p.status !== 'PARTICIPANT_CANCELLED').length, c.paidOutAmount, c.currency, '—', '—']),
    ];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brand-overview.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const firstName = userName?.trim().split(' ')[0] || 'there';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Greeting hero header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none opacity-20" />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            {companyName && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{companyName}</span>
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, <span className="text-gradient-accent">{firstName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · Here's how your creator campaigns are performing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {quickActions.map(({ label, routeId, icon: Icon, primary }) => (
              <button
                key={routeId}
                type="button"
                onClick={() => onNavigate?.(routeId)}
                className={primary
                  ? 'px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border border-purple-400/20 text-white text-xs font-bold shadow-lg shadow-purple-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2'
                  : 'px-3.5 py-2 rounded-xl bg-slate-950/60 hover:bg-slate-900/80 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-2'}
              >
                <Icon className="w-3.5 h-3.5 text-purple-400" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select aria-label="Filter overview by campaign" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className={controlClass + ' max-w-full sm:max-w-64 cursor-pointer'} disabled={isLoading}>
            <option value="all" className="bg-slate-950">All campaigns</option>
            {(data?.campaigns ?? []).map((campaign) => <option key={campaign.id} value={campaign.id} className="bg-slate-950">{campaign.title}</option>)}
          </select>
          <span className="text-xs text-slate-400">All-time totals</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => void load()} disabled={isLoading} className={controlClass + ' flex items-center gap-2'}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <RefreshCw className="w-3.5 h-3.5 text-purple-400" />}
            {isLoading ? 'Syncing records…' : 'Refresh'}
          </button>
          <button type="button" onClick={exportCsv} disabled={isLoading || !data} className={controlClass + ' bg-purple-600/20 border-purple-500/30 text-purple-200 flex items-center gap-2 active:scale-95'}>
            <Download className="w-3.5 h-3.5 text-purple-400" />Export CSV
          </button>
        </div>
      </div>
      {error && <div role="alert" className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200"><AlertCircle className="w-4 h-4 shrink-0" />{error}{data ? ' Showing the last loaded records.' : ' Values are unavailable until the connection is restored.'}</div>}
      {data && !isLoading && <p className="text-[11px] text-slate-500">Last updated {new Date(data.updatedAt).toLocaleString()} · Missing metrics are shown as —.</p>}
      {data || isLoading ? <>
        <OverviewKpiGrid campaigns={campaigns} isLoading={isLoading} />
        <CampaignPerformanceTrend campaigns={campaigns} isLoading={isLoading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TopCampaignsList campaigns={campaigns} isLoading={isLoading} onViewCampaigns={() => onNavigate?.('my-campaigns')} />
          <OverviewCreators campaigns={campaigns} isLoading={isLoading} />
        </div>
        <RecentActivityFeed campaigns={campaigns} isLoading={isLoading} />
      </> : null}
    </motion.div>
  );
}
