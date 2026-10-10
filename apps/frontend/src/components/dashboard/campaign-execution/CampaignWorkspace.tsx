'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Calendar, Sparkles } from 'lucide-react';
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
      <header className={`${panel} relative overflow-visible mt-4 p-6 sm:p-7 space-y-5 group`}>
        {/* Floating Status Badge Overlapping Top-Right Corner */}
        {action && (
          <div
            className="absolute right-6 sm:right-8 z-20 pointer-events-none flex items-center gap-2"
            style={{ top: '0px', transform: 'translateY(-50%)' }}
          >
            <span
              className={`px-3.5 sm:px-4 py-1.5 rounded-full border text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-1.5 shadow-xl ring-4 ring-[#07090E] ${
                /REVISION|REJECT|CANCEL|FAIL/.test(action.state || participant.status || '')
                  ? 'border-rose-400/50 bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-950/80'
                  : /VERIFIED|COMPLETED|APPROVED/.test(action.state || participant.status || '')
                  ? 'border-emerald-400/50 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 shadow-emerald-950/80'
                  : 'border-purple-400/50 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 shadow-purple-950/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
              <span>{(action.state || participant.status || 'IN_PROGRESS').replace(/_/g, ' ')}</span>
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
              {campaign.brandProfile?.companyName || 'Brand Collaboration'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {campaign.title}
            </h2>
            <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Deadline: <strong className="text-slate-200">{dateLabel(campaign.endDate)}</strong></span>
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Agreed campaign value
            </p>
            <p className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 tracking-tight drop-shadow-md">
              {formatCurrency(participant.agreedAmount, participant.agreedCurrency)}
            </p>
          </div>
        </div>

        {action?.message && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-200/90 font-medium bg-purple-950/30 border border-purple-500/20 px-3.5 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shrink-0" />
            <span>{action.message}</span>
          </div>
        )}

        <ol className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-5">
          {milestones.map((m) => (
            <li
              key={m.title}
              className={`flex items-center gap-2 text-xs font-semibold ${
                m.done ? 'text-emerald-300' : 'text-slate-500'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {m.title}
            </li>
          ))}
        </ol>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-950">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${deliverables.length ? (completed / deliverables.length) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs font-medium text-slate-400">
          {completed} of {deliverables.length} deliverables complete
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <CampaignBrief campaign={campaign} />
          {participant.status === 'CONFIRMED' && (
            <div className={`${panel} space-y-3 p-5`}>
              <p className="text-sm text-slate-300">Read the brief and requirements, then start the campaign to unlock submissions.</p>
              <ActionButton busy={busy} onClick={start}>I’ve reviewed the brief · Start Campaign</ActionButton>
            </div>
          )}
          <h3 className="font-bold text-white text-base">Your deliverables</h3>
          {!deliverables.length && <p className="text-sm text-slate-400">No deliverables are assigned. Contact the brand before beginning work.</p>}
          {deliverables.map(d => <DeliverableCard key={d.id} deliverable={d} disabled={participant.status !== 'PARTICIPANT_ACTIVE' || !['OPEN', 'FILLING', 'ACTIVE'].includes(campaign.status)} onSubmit={() => setSelection({ d, publication: false })} onPublish={() => setSelection({ d, publication: true })} />)}
        </div>
        <aside className="space-y-4">
          <section id="campaign-payment" className={`${panel} space-y-3.5 p-5 sm:p-6`}>
            <h3 className="font-extrabold text-white text-base">Payment & escrow</h3>
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight drop-shadow-sm">
              {formatCurrency(participant.agreedAmount, participant.agreedCurrency)}
            </p>
            <div>
              <StatusBadge status={payment?.status || 'NO_PAYOUT_YET'} />
            </div>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              {participant.status === 'PARTICIPANT_COMPLETED' ? 'Completion recorded for finance review. Payout depends on funding, settlement, KYC and dispute checks.' : 'Complete all required deliverables, including publication verification, to become eligible.'}
            </p>
            {payment?.failureReason && <ErrorNotice message={payment.failureReason} />}
            <p className="text-[11px] text-slate-500 pt-1 border-t border-white/5">
              Status comes from the payment system, not content approval. Manage payouts in Payments.
            </p>
          </section>
          <section className={`${panel} p-5 text-xs text-slate-300 space-y-1.5`}>
            <h3 className="mb-1.5 font-bold text-white text-sm">Need a clarification?</h3>
            <p className="leading-relaxed">
              Use Messages to contact your brand. Review updates are delivered to your collaboration conversation.
            </p>
          </section>
        </aside>
      </div>
    </>}
    {selection && <SubmissionDialog deliverable={selection.d} publicationOnly={selection.publication} onClose={() => setSelection(undefined)} onSuccess={load} />}
  </motion.div>;
}
