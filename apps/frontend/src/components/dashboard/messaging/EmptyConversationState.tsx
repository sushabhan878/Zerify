'use client';

import React from 'react';
import { MessageSquare, Paperclip, ShieldCheck, Zap } from 'lucide-react';

const PERKS = [
  { icon: Zap, label: 'Real-time delivery with read receipts' },
  { icon: Paperclip, label: 'Share decks and media up to 25 MB' },
  { icon: ShieldCheck, label: 'Collaboration updates posted automatically' },
];

export default function EmptyConversationState({ role }: { role: 'BRAND' | 'INFLUENCER' }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 py-10">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-600/20 border border-purple-500/25 flex items-center justify-center shadow-lg shadow-purple-950/30">
        <MessageSquare className="w-6 h-6 text-purple-300" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-black text-white">Select a conversation</h3>
        <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
          {role === 'BRAND'
            ? 'Pick a creator from the list to review their application and talk terms.'
            : 'Pick a brand from the list to continue your collaboration chat.'}
        </p>
      </div>

      <div className="pt-2 space-y-2">
        {PERKS.map((perk) => {
          const Icon = perk.icon;
          return (
            <div key={perk.label} className="flex items-center gap-2 text-left">
              <div className="w-6 h-6 rounded-lg bg-slate-900/80 border border-white/10 flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-[10.5px] font-semibold text-slate-500">{perk.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
