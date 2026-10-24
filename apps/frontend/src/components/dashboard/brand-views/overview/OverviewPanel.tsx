'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export default function OverviewPanel({ title, description, icon: Icon, children, action, badge }: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-6 min-w-0">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none opacity-20" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 shrink-0" />
            <span>{title}</span>
          </h2>
          {description && <p className="text-xs sm:text-sm text-slate-400 mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {badge}
          {action}
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}
