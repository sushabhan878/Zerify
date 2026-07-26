'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Youtube, Twitter, Globe, CheckCircle2, Loader2 } from 'lucide-react';

interface ConnectPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectPlatformModal({ isOpen, onClose }: ConnectPlatformModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(['Instagram', 'YouTube', 'TikTok']);

  if (!isOpen) return null;

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600', description: 'Sync followers, engagement & reels stats' },
    { name: 'YouTube', icon: Youtube, color: 'from-red-500 to-rose-700', description: 'Connect channel analytics & video metrics' },
    { name: 'TikTok', icon: Globe, color: 'from-cyan-400 to-blue-600', description: 'Connect short-form video reach & views' },
    { name: 'X / Twitter', icon: Twitter, color: 'from-sky-400 to-indigo-600', description: 'Import tweet impressions & follower growth' },
  ];

  const handleConnect = (name: string) => {
    if (connectedPlatforms.includes(name)) return;

    setConnecting(name);
    setTimeout(() => {
      setConnectedPlatforms((prev) => [...prev, name]);
      setConnecting(null);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-purple-950/50 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Connect Social Platforms</h3>
              <p className="text-xs text-slate-400">Link your channels to boost your AI match rate</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Platform List */}
          <div className="space-y-2.5">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              const isConnected = connectedPlatforms.includes(platform.name);
              const isLoading = connecting === platform.name;

              return (
                <div
                  key={platform.name}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${platform.color} flex items-center justify-center text-white shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{platform.name}</h4>
                      <p className="text-[10px] text-slate-400">{platform.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnect(platform.name)}
                    disabled={isConnected || isLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isConnected
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-950/40'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <span>Connect</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
