'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, CheckCircle2, DollarSign, MessageSquare, Briefcase, Filter, ShieldAlert } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function ActivityView() {
  const { currency, format } = useCurrency();
  const [activeFilter, setActiveFilter] = useState('all');

  const paymentAmount = currency === 'INR' ? format(100000, { showDecimals: true }) : format(1200, { showDecimals: true });

  const notifications = [
    {
      id: 1,
      title: 'Campaign Brief Approved',
      desc: 'Summer Fitness Apparel campaign brief was verified and accepted your pitch.',
      time: '12 mins ago',
      category: 'campaigns',
      unread: true,
      icon: Briefcase,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      actionText: 'View Campaign',
    },
    {
      id: 2,
      title: 'Payment Released',
      desc: `${paymentAmount} escrow milestone released to your bank account for Nordic Audio Reel.`,
      time: '45 mins ago',
      category: 'payments',
      unread: true,
      icon: DollarSign,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      actionText: 'View Earnings',
    },
    {
      id: 3,
      title: 'New Message from Aura Fitness',
      desc: 'Brand manager sent a message regarding deliverable script modifications.',
      time: '2 hours ago',
      category: 'messages',
      unread: false,
      icon: MessageSquare,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      actionText: 'Reply in Chat',
    },
    {
      id: 4,
      title: 'System AI Growth Insight',
      desc: 'Your engagement rate increased 18% higher than industry average this month.',
      time: '5 hours ago',
      category: 'system',
      unread: false,
      icon: Bell,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      actionText: 'View Report',
    },
  ];

  const filtered = activeFilter === 'all'
    ? notifications
    : activeFilter === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications.filter((n) => n.category === activeFilter);

  return (
    <div className="space-y-6">
      {/* Header & Category Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <span>Notification Center</span>
          </h2>
          <p className="text-xs text-slate-400">Real-time alerts for campaign invitations, contract milestones, and payments</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-white/10 backdrop-blur-xl overflow-x-auto no-scrollbar">
          {['all', 'unread', 'campaigns', 'payments', 'messages', 'system'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                activeFilter === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif, idx) => {
          const Icon = notif.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-2xl bg-slate-950/45 border backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-purple-500/30 ${
                notif.unread ? 'border-purple-500/30' : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border ${notif.color} shrink-0 mt-0.5 sm:mt-0 relative`}>
                  <Icon className="w-4 h-4" />
                  {notif.unread && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 border-2 border-slate-950" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-white">{notif.title}</h4>
                    {notif.unread && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] font-extrabold text-purple-300">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{notif.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {notif.time}
                </span>
                <button className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white transition-all">
                  {notif.actionText}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
