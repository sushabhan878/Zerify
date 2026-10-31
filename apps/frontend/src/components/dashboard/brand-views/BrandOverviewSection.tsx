'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Download, Loader2, RefreshCw } from 'lucide-react';
import { BrandOverviewData, BrandOverviewService } from '@/services/brand-overview.service';
import OverviewKpiGrid from './overview/OverviewKpiGrid';
import CampaignPerformanceTrend from './overview/CampaignPerformanceTrend';
import RecentActivityFeed from './overview/RecentActivityFeed';
import CampaignFilterDropdown from './overview/CampaignFilterDropdown';

interface BrandOverviewSectionProps {
  userName?: string;
  companyName?: string;
  onNavigate?: (routeId: string) => void;
}

const controlClass = 'px-3.5 py-2 rounded-xl bg-slate-950/60 light:bg-white border border-white/10 light:border-slate-200 text-xs font-semibold text-slate-300 light:text-slate-700 hover:text-white light:hover:text-slate-900 hover:border-purple-500/40 light:hover:border-purple-300 light:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:opacity-50 transition-all';

export default function BrandOverviewSection({ onNavigate }: BrandOverviewSectionProps) {
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

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4 sm:space-y-5">

      {/* Filter & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <CampaignFilterDropdown
            value={campaignId}
            onChange={setCampaignId}
            campaigns={data?.campaigns ?? []}
            disabled={isLoading}
          />
          <span className="text-xs text-slate-400 light:text-slate-600 font-medium">All-time totals</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => void load()} disabled={isLoading} className={controlClass + ' flex items-center gap-2'}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400 light:text-purple-600" /> : <RefreshCw className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />}
            {isLoading ? 'Syncing records…' : 'Refresh'}
          </button>
          <button type="button" onClick={exportCsv} disabled={isLoading || !data} className={controlClass + ' bg-purple-600/20 light:bg-purple-50 border-purple-500/30 light:border-purple-200 text-purple-200 light:text-purple-700 hover:light:bg-purple-100 flex items-center gap-2 active:scale-95'}>
            <Download className="w-3.5 h-3.5 text-purple-400 light:text-purple-600" />Export CSV
          </button>
        </div>
      </div>
      {error && <div role="alert" className="flex items-center gap-2 p-4 rounded-2xl bg-rose-500/10 light:bg-rose-50 border border-rose-500/20 light:border-rose-200 text-sm text-rose-200 light:text-rose-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}{data ? ' Showing the last loaded records.' : ' Values are unavailable until the connection is restored.'}</div>}
      {data && !isLoading && <p className="text-[11px] text-slate-500 light:text-slate-600">Last updated {new Date(data.updatedAt).toLocaleString()} · Missing metrics are shown as —.</p>}
      {data || isLoading ? <>
        <OverviewKpiGrid campaigns={campaigns} isLoading={isLoading} />
        <CampaignPerformanceTrend campaigns={campaigns} isLoading={isLoading} />
        <RecentActivityFeed campaigns={campaigns} isLoading={isLoading} />
      </> : null}
    </motion.div>
  );
}
