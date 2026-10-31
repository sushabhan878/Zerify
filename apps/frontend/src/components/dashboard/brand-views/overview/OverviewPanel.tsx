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
      className="relative overflow-hidden px-5 py-4 sm:px-6 sm:py-5 rounded-3xl bg-slate-950/45 light:bg-white border border-white/10 light:border-slate-200/80 backdrop-blur-xl shadow-xl light:shadow-sm space-y-4 sm:space-y-5 min-w-0">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none opacity-20 light:opacity-5" />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white light:text-slate-900 tracking-tight flex items-center gap-2.5 sm:gap-3">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400 light:text-purple-600 shrink-0" />
            <span>{title}</span>
          </h2>
          {description && <p className="text-xs sm:text-sm text-slate-400 light:text-slate-500 mt-1">{description}</p>}
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
