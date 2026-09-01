'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  UserCheck,
  Award,
  Sparkles,
  Inbox,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

interface RecentActivityFeedProps {
  onViewMessages?: () => void;
}

export default function RecentActivityFeed({ onViewMessages }: RecentActivityFeedProps) {
  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      title: '12 new influencer applications',
      description: 'Submitted for "Summer Skincare Launch" campaign',
      timeAgo: '10m ago',
      icon: Inbox,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/15 border-purple-500/20',
    },
    {
      id: 'act-2',
      title: 'Campaign milestone reached',
      description: '"Summer Launch" passed 1.0M impressions milestone',
      timeAgo: '42m ago',
      icon: Award,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/15 border-amber-500/20',
    },
    {
      id: 'act-3',
      title: 'Collaboration invitation accepted',
      description: 'Sarah Jenkins accepted your campaign invitation',
      timeAgo: '2h ago',
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15 border-emerald-500/20',
    },
    {
      id: 'act-4',
      title: 'AI match recommendation ready',
      description: '3 high-compatibility creators matched for your brand',
      timeAgo: '5h ago',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/15 border-indigo-500/20',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-black text-white">Recent Activity</h3>
        </div>

        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Activity Items */}
      <div className="space-y-2.5">
        {activities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="p-3 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/15 transition-all flex items-start gap-3"
            >
              <div
                className={`p-2 rounded-xl border shrink-0 mt-0.5 ${item.bgColor} ${item.iconColor}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {item.timeAgo}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
