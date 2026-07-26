'use client';

import React, { useState } from 'react';
import { Settings, Save, Building2, ShieldCheck, CreditCard, Bell } from 'lucide-react';

export default function BrandSettingsSection() {
  const [companyName, setCompanyName] = useState('Apex Gear Inc');
  const [industry, setIndustry] = useState('Tech & Consumer AI');
  const [website, setWebsite] = useState('https://apexgear.com');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <span>Brand Enterprise Settings</span>
          </h2>
          <p className="text-xs text-slate-400">Manage company details, team seats & billing options</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Company Profile & Industry</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Industry Sector</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Official Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Brand Notifications</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-300">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-purple-500 w-4 h-4" />
              <span>Email notification when creator submits content draft for approval</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-purple-500 w-4 h-4" />
              <span>Alert when AI algorithm matches new creator candidates for active campaign</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-emerald-400 font-bold">Brand settings updated!</span>}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 text-xs font-extrabold text-white flex items-center gap-2 transition-all shadow-lg shadow-purple-950/50"
          >
            <Save className="w-4 h-4" />
            <span>Save Company Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
