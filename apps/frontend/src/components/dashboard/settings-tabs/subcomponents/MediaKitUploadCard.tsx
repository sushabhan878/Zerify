'use client';

import React from 'react';
import { FileText, Upload } from 'lucide-react';

export default function MediaKitUploadCard() {
  return (
    <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
        <FileText className="w-4 h-4 text-purple-400" />
        <span>Media Kit & Press Attachments</span>
      </h3>

      <div className="p-4 rounded-lg bg-slate-950/70 border border-dashed border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-2.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Media Kit (PDF / Deck)</h4>
            <p className="text-[11px] text-slate-400/80">Upload rate sheet, audience demographic breakdown or press kit.</p>
          </div>
        </div>

        <label className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer transition-all shrink-0 shadow-md">
          <span>Upload File</span>
          <input type="file" accept=".pdf,.png,.jpg" className="hidden" />
        </label>
      </div>
    </div>
  );
}
