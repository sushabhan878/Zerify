'use client';

import React, { useState } from 'react';
import { Settings, Save, Shield, Bell, CreditCard, User } from 'lucide-react';

export default function SettingsSection() {
  const [rateYoutube, setRateYoutube] = useState('2500');
  const [rateInstagram, setRateInstagram] = useState('1200');
  const [rateTiktok, setRateTiktok] = useState('850');
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
            <span>Creator Studio Settings</span>
          </h2>
          <p className="text-xs text-slate-400">Configure your default rates, payout accounts & preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Rate Cards */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span>Default Rate Card Pricing (USD)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">YouTube Dedicated Video</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                <input
                  type="number"
                  value={rateYoutube}
                  onChange={(e) => setRateYoutube(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Instagram Reel / Post</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                <input
                  type="number"
                  value={rateInstagram}
                  onChange={(e) => setRateInstagram(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">TikTok Video Sponsorship</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                <input
                  type="number"
                  value={rateTiktok}
                  onChange={(e) => setRateTiktok(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Security */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Notification Preferences</span>
          </h3>

          <div className="space-y-2">
            {[
              'Email alert when brand submits a campaign invitation',
              'Instant push notification for new messages',
              'Weekly earnings & analytics summary email',
            ].map((pref, idx) => (
              <label key={idx} className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded accent-purple-500 w-4 h-4 bg-slate-950" />
                <span>{pref}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-emerald-400 font-bold">Settings saved successfully!</span>}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-xs font-extrabold text-white flex items-center gap-2 transition-all shadow-lg shadow-purple-950/50"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
