'use client';

import React from 'react';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { ConversationItem } from '@/services/messaging.service';
import ConversationAvatar from './ConversationAvatar';

/** Status chip styling mirrors the application badges used across the dashboard. */
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  APPLIED: {
    label: 'Application Sent',
    className: 'bg-sky-500/10 border-sky-500/25 text-sky-300',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-amber-500/10 border-amber-500/25 text-amber-300',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    className: 'bg-purple-500/10 border-purple-500/25 text-purple-300',
  },
  REJECTED: {
    label: 'Declined',
    className: 'bg-rose-500/10 border-rose-500/25 text-rose-300',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className: 'bg-slate-500/10 border-slate-500/25 text-slate-300',
  },
  OFFER_SENT: {
    label: 'Offer Sent',
    className: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300',
  },
  OFFER_ACCEPTED: {
    label: 'Offer Accepted',
    className: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
  },
  OFFER_DECLINED: {
    label: 'Offer Declined',
    className: 'bg-rose-500/10 border-rose-500/25 text-rose-300',
  },
};

function lastSeenCopy(lastSeen: string | null): string {
  if (!lastSeen) return 'Offline';
  const minutes = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 60_000);
  if (minutes < 1) return 'Last seen just now';
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  if (minutes < 1440) return `Last seen ${Math.floor(minutes / 60)}h ago`;
  return `Last seen ${new Date(lastSeen).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
}

export default function ConversationHeader({
  conversation,
  online,
  lastSeen,
  onBack,
}: {
  conversation: ConversationItem;
  online: boolean;
  lastSeen: string | null;
  onBack?: () => void;
}) {
  const name = conversation.counterpart?.name ?? 'Zerify User';
  const status = conversation.applicationStatus
    ? STATUS_STYLES[conversation.applicationStatus]
    : null;

  return (
    <div className="px-4 py-2 sm:py-2.5 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/50 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to conversations"
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <ConversationAvatar
          name={name}
          avatarUrl={conversation.counterpart?.avatarUrl ?? null}
          online={online}
          size="md"
        />

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
            <span className="truncate">{name}</span>
            <BadgeCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          </h3>
          <span
            className={`text-[10.5px] font-medium leading-none ${
              online ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {online ? 'Online now' : lastSeenCopy(lastSeen)}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        {conversation.campaign?.title && (
          <span className="max-w-[180px] truncate px-2 py-0.5 rounded-md bg-slate-900/80 border border-white/10 text-[9.5px] font-semibold text-slate-300">
            {conversation.campaign.title}
          </span>
        )}
        {status && (
          <span
            className={`px-2.5 py-0.5 rounded-full border text-[9.5px] font-black uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        )}
      </div>
    </div>
  );
}
