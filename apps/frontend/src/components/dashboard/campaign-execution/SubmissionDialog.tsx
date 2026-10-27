'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, X, Sparkles } from 'lucide-react';
import { DeliverableService, ParticipantDeliverableItem } from '@/services/deliverable.service';
import { ActionButton, ErrorNotice, input } from './ExecutionUi';
import SubmissionMediaInput from './SubmissionMediaInput';
import ExecutionDropdown, { DropdownOption } from './ExecutionDropdown';
import { validatePublishedUrl } from '@/utils/validatePublishedUrl';

interface Props {
  deliverable: ParticipantDeliverableItem | null;
  onClose: () => void;
  onSuccess: () => void;
  publicationOnly?: boolean;
}

export default function SubmissionDialog({
  deliverable: d,
  onClose,
  onSuccess,
  publicationOnly = false,
}: Props) {
  const [method] = useState<'LINK' | 'PUBLISHED_URL'>(
    publicationOnly ? 'PUBLISHED_URL' : 'LINK'
  );
  const [isFinal, setFinal] = useState(publicationOnly ? true : false);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<ParticipantDeliverableItem>();
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose();
      if (event.key !== 'Tab') return;
      const nodes = dialog.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input, select, textarea, a[href]'
      );
      if (!nodes?.length) return;
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      previous?.focus();
    };
  }, [busy, onClose]);

  if (!d) return null;

  const stageOptions: DropdownOption[] = [
    {
      value: 'draft',
      label: 'Draft for approval',
      description: 'Brand reviews your draft before publication',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      value: 'final',
      label: 'Final content',
      description: 'Final polished deliverable for approval/release',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  ];

  const submit = async () => {
    setError('');
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setError(
        publicationOnly
          ? 'Please enter your published live post link.'
          : 'Please enter a deliverable content link.'
      );
      return;
    }

    if (publicationOnly) {
      const validation = validatePublishedUrl(cleanUrl, d.platform, d.type);
      if (!validation.isValid) {
        setError(validation.error || 'Please enter a valid published post URL.');
        return;
      }
    } else {
      try {
        const parsed = new URL(cleanUrl);
        if (parsed.protocol !== 'https:') {
          throw new Error('Please enter a secure HTTPS link (e.g. Google Drive, Dropbox, Frame.io, Loom).');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Please enter a valid HTTPS URL.');
        return;
      }
    }

    if (!confirmed) {
      setError('Please confirm that this link contains your original work before submitting.');
      return;
    }

    setBusy(true);
    try {
      const result = publicationOnly
        ? await DeliverableService.publishDeliverable(d.id, {
            publishedUrl: cleanUrl,
            expectedVersion: d.version,
          })
        : await DeliverableService.submitDraft(d.id, {
            submissionType: method === 'PUBLISHED_URL' ? 'PUBLISHED_URL' : 'LINK',
            isFinal: method === 'PUBLISHED_URL' || isFinal,
            expectedVersion: d.version,
            confirmed: true,
            contentUrl: cleanUrl,
            publishedUrl: method === 'PUBLISHED_URL' ? cleanUrl : undefined,
            caption,
            notes,
          });
      setReceipt(result);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed. Please retry.');
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submission-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-purple-500/20 bg-slate-950/95 p-6 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl"
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-purple-300">
              {receipt
                ? 'Submission received'
                : publicationOnly
                ? 'Publish Content'
                : 'Submit for Brand Review'}
            </p>
            <h2 id="submission-title" className="mt-1 text-xl font-bold text-white">
              {d.title || d.type}
            </h2>
          </div>
          <button
            aria-label="Close submission"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200 space-y-2"
          >
            <div className="font-semibold text-rose-100 flex items-center justify-between">
              <span>Submission Error</span>
              <button
                onClick={() => setError('')}
                className="text-rose-300 hover:text-white text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p>{error}</p>
          </div>
        )}

        {receipt ? (
          <div role="status" className="space-y-4 py-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              {publicationOnly ? 'Published URL received' : 'Submitted for brand review'}
            </h3>
            <p className="text-sm text-slate-300">
              Version {receipt.version} ·{' '}
              {new Date(receipt.submittedAt || Date.now()).toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">
              {publicationOnly
                ? 'The brand will manually verify the post and connected account.'
                : 'We’ll notify you when the brand responds to your submission.'}
            </p>
            <ActionButton onClick={onClose}>Done</ActionButton>
          </div>
        ) : (
          <div className="space-y-4">
            {!publicationOnly && (
              <div>
                {/* Custom Styled Submission Stage Dropdown */}
                <ExecutionDropdown
                  label="Submission stage"
                  options={stageOptions}
                  value={isFinal ? 'final' : 'draft'}
                  onChange={(val) => setFinal(val === 'final')}
                  disabled={busy}
                />
              </div>
            )}

            {/* Deliverable Link Input Component */}
            <SubmissionMediaInput
              deliverable={d}
              url={url}
              busy={busy}
              publicationOnly={publicationOnly}
              onUrl={setUrl}
            />

            {!publicationOnly && (
              <>
                <label className="block text-xs font-bold text-slate-200">
                  Caption / hashtags / mentions
                  <textarea
                    className={`${input} mt-1`}
                    rows={2}
                    value={caption}
                    placeholder="Add planned caption, mentions or hashtags…"
                    maxLength={5000}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </label>

                <label className="block text-xs font-bold text-slate-200">
                  Note for the brand
                  <textarea
                    className={`${input} mt-1`}
                    rows={2}
                    value={notes}
                    placeholder="Any notes or context for the brand reviewer…"
                    maxLength={5000}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </>
            )}

            {/* Polished Interactive Confirmation Card */}
            <div
              onClick={() => setConfirmed(!confirmed)}
              role="checkbox"
              aria-checked={confirmed}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setConfirmed(!confirmed);
                }
              }}
              className={`group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 select-none ${
                confirmed
                  ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30'
                  : 'bg-slate-950/60 border-white/10 hover:border-purple-500/30 hover:bg-slate-950/80'
              }`}
            >
              {/* Custom Checkbox Indicator */}
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${
                  confirmed
                    ? 'bg-gradient-to-tr from-purple-600 to-pink-600 border border-purple-400 text-white shadow-md shadow-purple-950/60 scale-105'
                    : 'border-2 border-white/20 bg-slate-900 group-hover:border-purple-400/60 group-hover:bg-slate-800'
                }`}
              >
                {confirmed ? (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-purple-400/40 transition-colors" />
                )}
              </div>

              <div className="space-y-0.5 min-w-0">
                <p
                  className={`text-xs font-bold transition-colors ${
                    confirmed ? 'text-white' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  I confirm this link contains my original work
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Follows all campaign requirements, belongs to my assigned account, and is fully accessible to the brand without access restrictions.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <ActionButton
                disabled={
                  !confirmed ||
                  !url.trim() ||
                  (publicationOnly && !validatePublishedUrl(url, d.platform, d.type).isValid)
                }
                busy={busy}
                onClick={submit}
                className="w-full"
              >
                {publicationOnly
                  ? 'Submit URL for verification'
                  : 'Submit for brand review'}
              </ActionButton>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
