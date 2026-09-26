'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';
import { isComplete, nextAction } from '@/services/deliverable-workflow';
import { formatCurrency } from '@/utils/currency';
import DeliverableCard from './DeliverableCard';
import SubmissionDialog from './SubmissionDialog';
import CampaignBrief from './CampaignBrief';
import { ActionButton, ErrorNotice, panel, StatusBadge, dateLabel } from './ExecutionUi';

export default function CampaignWorkspace({ participantId, onBack }: { participantId: string; onBack: () => void }) {
  const [participant, setParticipant] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<{ d: ParticipantDeliverableItem; publication: boolean }>();
  const load = useCallback(async () => {
    setError('');
    try { setParticipant(await DeliverableService.getParticipantDetails(participantId)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load the campaign'); }
    finally { setLoading(false); }
  }, [participantId]);
  useEffect(() => { load(); }, [load]);
  const start = async () => {
    setBusy(true); setError('');
    try { await DeliverableService.start(participantId); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not start the campaign'); }
    finally { setBusy(false); }
  };
  const deliverables: ParticipantDeliverableItem[] = participant?.deliverables || [];
  const completed = deliverables.filter(isComplete).length;
  const campaign = participant?.campaign || {};
  const action = participant ? nextAction(participant) : null;
  const payment = participant?.payouts?.[0];
  const milestones = [
    { title: 'Accepted', done: !!participant }, { title: 'Brief reviewed', done: !!participant?.startedAt },
    { title: 'Content submitted', done: deliverables.length > 0 && deliverables.every(d => d.version > 0) },
    { title: 'Deliverables complete', done: completed > 0 && completed === deliverables.length },
    { title: 'Payment completed', done: payment?.status === 'COMPLETED' },
  ];
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" />Back to campaigns</button>
    <ErrorNotice message={error} />
    {loading ? <div role="status" className="flex justify-center gap-2 p-12 text-slate-300"><Loader2 className="h-5 w-5 animate-spin" />Loading your workspace…</div> : !participant ? <ActionButton onClick={load}>Retry</ActionButton> : <>
      <header className={`${panel} overflow-hidden p-6`}>
        <div className="flex flex-wrap justify-between gap-4"><div><p className="text-sm font-semibold text-purple-300">{campaign.brandProfile?.companyName}</p><h2 className="mt-1 text-2xl font-bold text-white">{campaign.title}</h2><p className="mt-2 text-xs text-slate-400">Campaign #{campaign.id?.slice(0, 8)} · Deadline {dateLabel(campaign.endDate)}</p></div><div className="text-right"><p className="text-xs text-slate-400">Agreed campaign value</p><p className="mt-1 text-2xl font-bold text-emerald-300">{formatCurrency(participant.agreedAmount, participant.agreedCurrency)}</p></div></div>
        <div className="mt-5 flex flex-wrap items-center gap-3"><StatusBadge status={action!.state} /><p className="text-sm text-slate-300">{action!.message}</p></div>
        <ol className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-5">{milestones.map(m => <li key={m.title} className={`flex items-center gap-2 text-xs ${m.done ? 'text-emerald-300' : 'text-slate-500'}`}><CheckCircle2 className="h-4 w-4 shrink-0" />{m.title}</li>)}</ol>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-950"><div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all" style={{ width: `${deliverables.length ? completed / deliverables.length * 100 : 0}%` }} /></div>
        <p className="mt-2 text-xs text-slate-400">{completed} of {deliverables.length} deliverables complete</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4"><CampaignBrief campaign={campaign} />
          {participant.status === 'CONFIRMED' && <div className={`${panel} space-y-3 p-5`}><p className="text-sm text-slate-300">Read the brief and requirements, then start the campaign to unlock submissions.</p><ActionButton busy={busy} onClick={start}>I’ve reviewed the brief · Start Campaign</ActionButton></div>}
          <h3 className="font-bold text-white">Your deliverables</h3>
          {!deliverables.length && <p className="text-sm text-slate-400">No deliverables are assigned. Contact the brand before beginning work.</p>}
          {deliverables.map(d => <DeliverableCard key={d.id} deliverable={d} disabled={participant.status !== 'PARTICIPANT_ACTIVE' || !['OPEN', 'FILLING', 'ACTIVE'].includes(campaign.status)} onSubmit={() => setSelection({ d, publication: false })} onPublish={() => setSelection({ d, publication: true })} />)}
        </div>
        <aside className="space-y-4"><section id="campaign-payment" className={`${panel} space-y-3 p-5`}><h3 className="font-bold text-white">Payment & escrow</h3><p className="text-2xl font-bold text-emerald-300">{formatCurrency(participant.agreedAmount, participant.agreedCurrency)}</p><StatusBadge status={payment?.status || 'NO_PAYOUT_YET'} /><p className="text-sm text-slate-400">{participant.status === 'PARTICIPANT_COMPLETED' ? 'Completion recorded for finance review. Payout depends on funding, settlement, KYC and dispute checks.' : 'Complete all required deliverables, including publication verification, to become eligible.'}</p>{payment?.failureReason && <ErrorNotice message={payment.failureReason} />}<p className="text-xs text-slate-500">Status comes from the payment system, not content approval. Manage payouts in Payments.</p></section><section className={`${panel} p-5 text-sm text-slate-400`}><h3 className="mb-2 font-bold text-white">Need a clarification?</h3>Use Messages to contact your brand. Review updates are delivered to your collaboration conversation.</section></aside>
      </div>
    </>}
    {selection && <SubmissionDialog deliverable={selection.d} publicationOnly={selection.publication} onClose={() => setSelection(undefined)} onSuccess={load} />}
  </motion.div>;
}
