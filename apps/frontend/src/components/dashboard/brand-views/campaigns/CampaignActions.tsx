'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Pencil, Trash2, X } from 'lucide-react';
import { CampaignItem, CampaignService } from '@/services/campaign.service';
import { useToast } from '@/components/ui/Toast';
import CreateCampaignWizard from './CreateCampaignWizard';

export default function CampaignActions({ campaign, onUpdated, onDeleted }: {
  campaign: CampaignItem;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const { toastError, toastSuccess } = useToast();
  const [editing, setEditing] = useState<CampaignItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<'edit' | 'delete' | null>(null);
  const baseButtonClass =
    'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer shadow-md';

  const edit = async () => {
    setBusy('edit');
    try { setEditing(await CampaignService.getCampaignDetails(campaign.id)); }
    catch (error) { toastError(error instanceof Error ? error.message : 'Could not load campaign'); }
    finally { setBusy(null); }
  };

  const remove = async () => {
    if (busy) return;
    setBusy('delete');
    try {
      await CampaignService.deleteCampaign(campaign.id);
      setConfirmDelete(false);
      toastSuccess('Campaign deleted. Applicants and collaborators will receive an automated notice.');
      onDeleted();
    } catch (error) { toastError(error instanceof Error ? error.message : 'Could not delete campaign'); }
    finally { setBusy(null); }
  };

  if (campaign.status === 'DELETED') return <span className="text-xs text-rose-300">Campaign deleted</span>;

  return (
    <div className="flex items-center gap-3 sm:gap-3.5" onClick={(event) => event.stopPropagation()}>
      {!['COMPLETED', 'CANCELLED'].includes(campaign.status) && (
        <button
          type="button"
          disabled={Boolean(busy)}
          onClick={() => void edit()}
          className={`${baseButtonClass} bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white border border-violet-400/30 hover:border-violet-300/60 shadow-purple-950/40 hover:shadow-lg hover:shadow-purple-600/30`}
        >
          {busy === 'edit' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Pencil className="w-3.5 h-3.5 text-white" />
          )}
          <span>Edit</span>
        </button>
      )}
      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() => setConfirmDelete(true)}
        className={`${baseButtonClass} bg-gradient-to-r from-rose-600 via-rose-600 to-red-600 hover:from-rose-500 hover:via-rose-500 hover:to-red-500 text-white border border-rose-400/30 hover:border-rose-300/60 shadow-rose-950/40 hover:shadow-lg hover:shadow-rose-600/30`}
      >
        <Trash2 className="w-3.5 h-3.5 text-white" />
        <span>Delete</span>
      </button>
      {editing && <CreateCampaignWizard initialCampaign={editing} onClose={() => setEditing(null)} onSuccess={() => { setEditing(null); onUpdated(); }} />}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4" onClick={(event) => event.stopPropagation()}>
          <div role="dialog" aria-modal="true" aria-labelledby={`delete-campaign-${campaign.id}`} className="relative p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl max-w-lg w-full space-y-4">
            <button type="button" aria-label="Close delete dialog" disabled={Boolean(busy)} onClick={() => setConfirmDelete(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg disabled:opacity-50"><X className="w-5 h-5" /></button>
            <div className="p-3 w-fit rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20"><Trash2 className="w-6 h-6" /></div>
            <h2 id={`delete-campaign-${campaign.id}`} className="text-xl font-black text-white pr-5">Delete {campaign.title}?</h2>
            <p className="text-sm text-slate-300">This campaign will be removed from listings and stop accepting new applications and collaborations.</p>
            <p className="text-sm text-slate-400">All applicants and active collaborators will receive an automated deletion notice. Campaign data, applications, collaboration records, and messages will be retained.</p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" disabled={Boolean(busy)} onClick={() => setConfirmDelete(false)} className={`${baseButtonClass} bg-slate-800 border-white/10 text-slate-200 hover:bg-slate-700`}>Keep campaign</button>
              <button type="button" disabled={Boolean(busy)} onClick={() => void remove()} className={`${baseButtonClass} bg-gradient-to-r from-rose-600 to-red-600 border border-rose-500/50 text-white hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-950/40`}>{busy === 'delete' && <Loader2 className="w-4 h-4 animate-spin" />}Delete & notify</button>
            </div>
          </div>
        </div>, document.body,
      )}
    </div>
  );
}
