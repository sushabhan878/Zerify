'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export default function OverviewPanel({ title, description, icon: Icon, children, action }: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-5 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5"><Icon className="w-5 h-5 text-purple-400 shrink-0" />{title}</h2>
          {description && <p className="text-xs text-slate-400 mt-1.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}
