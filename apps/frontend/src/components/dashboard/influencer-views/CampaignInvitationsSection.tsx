'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MailCheck, DollarSign, Calendar, Check, X, Clock, MessageSquare } from 'lucide-react';

export default function CampaignInvitationsSection() {
  const [invites, setInvites] = useState([
    { id: 1, brand: 'Sony Audio', title: 'WH-1000XM5 Wireless Headphones Launch', payout: '$3,500', deadline: 'Aug 15, 2026', status: 'PENDING', deliverables: '1x YouTube Dedicated Video + 2x IG Reels' },
    { id: 2, brand: 'Gymshark', title: 'Fall Performance Wear Campaign', payout: '$2,200', deadline: 'Aug 20, 2026', status: 'PENDING', deliverables: '2x TikTok Videos + 3x IG Stories with Affiliate Code' },
    { id: 3, brand: 'NordVPN', title: 'Tech Sponsorship Integration', payout: '$1,800', deadline: 'Aug 25, 2026', status: 'PENDING', deliverables: '60s Dedicated Mid-roll Integration' },
  ]);

  const handleAction = (id: number, newStatus: string) => {
    setInvites((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-purple-400" />
            <span>Campaign Invitations</span>
          </h2>
          <p className="text-xs text-slate-400">Direct deal offers sent by brand managers</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300">
          {invites.filter((i) => i.status === 'PENDING').length} Pending Invites
        </span>
      </div>

      <div className="space-y-4">
        {invites.map((inv) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 hover:border-purple-500/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-purple-400">{inv.brand}</span>
                <h3 className="text-base font-extrabold text-white">{inv.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Due {inv.deadline}
                </span>
                <span className="text-lg font-black text-emerald-400">{inv.payout}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5">
              <strong className="text-white">Deliverables:</strong> {inv.deliverables}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <button className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Message Brand Manager</span>
              </button>

              {inv.status === 'PENDING' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(inv.id, 'DECLINED')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-xs font-bold text-slate-300 hover:text-rose-300 border border-white/5 transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleAction(inv.id, 'ACCEPTED')}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-xs font-bold text-white transition-all shadow-md shadow-purple-950/40 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Offer</span>
                  </button>
                </div>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    inv.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {inv.status}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
