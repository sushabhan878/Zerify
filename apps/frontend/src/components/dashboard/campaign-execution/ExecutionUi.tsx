'use client';

import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export const panel = 'rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-xl shadow-xl light:bg-white light:border-slate-200/80 light:shadow-sm';
export const input = 'w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder:text-slate-400';
export function ActionButton({ busy, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return <button {...props} disabled={props.disabled || busy} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white keep-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
    {busy && <Loader2 aria-hidden className="h-4 w-4 animate-spin text-white keep-white" />}{children}
  </button>;
}
export function ErrorNotice({ message }: { message?: string | null }) {
  return message ? <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 light:bg-rose-50 light:border-rose-200 light:text-rose-700 p-3 text-sm text-rose-200">{message}</p> : null;
}
export function StatusBadge({ status }: { status: string }) {
  const tone = /REVISION|REJECT|CANCEL|FAIL/.test(status)
    ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 light:bg-rose-50 light:border-rose-200 light:text-rose-700'
    : /VERIFIED|COMPLETED|APPROVED|READY_TO_PUBLISH/.test(status)
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 light:bg-emerald-50 light:border-emerald-200 light:text-emerald-700'
    : 'border-purple-500/30 bg-purple-500/10 text-purple-200 light:bg-purple-50 light:border-purple-200 light:text-purple-700';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{status.replace(/_/g, ' ')}</span>;
}
export function dateLabel(value?: string) { return value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'; }
