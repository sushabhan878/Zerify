'use client';

import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export const panel = 'rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-xl shadow-xl';
export const input = 'w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500';
export function ActionButton({ busy, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return <button {...props} disabled={props.disabled || busy} className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}>
    {busy && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}{children}
  </button>;
}
export function ErrorNotice({ message }: { message?: string | null }) {
  return message ? <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{message}</p> : null;
}
export function StatusBadge({ status }: { status: string }) {
  const tone = /REVISION|REJECT|CANCEL|FAIL/.test(status) ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : /VERIFIED|COMPLETED|APPROVED/.test(status) ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-purple-500/30 bg-purple-500/10 text-purple-200';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{status.replace(/_/g, ' ')}</span>;
}
export function dateLabel(value?: string) { return value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'; }
