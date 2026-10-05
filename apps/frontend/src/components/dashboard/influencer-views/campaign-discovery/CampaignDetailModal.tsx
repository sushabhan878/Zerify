'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Gift,
  Check,
  AlertTriangle,
  Send,
  Video,
  Users,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Clock,
  Package,
  FileText,
  Hash,
  MessageSquare,
  Globe,
} from 'lucide-react';
import { CampaignItem } from './CampaignCard';
import { useCurrency } from '@/context/CurrencyContext';

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignItem | null;
  onApply: (campaign: CampaignItem) => void;
}

export default function CampaignDetailModal({
  isOpen,
  onClose,
  campaign,
  onApply,
}: CampaignDetailModalProps) {
  const { formatBudget, symbol } = useCurrency();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !campaign || !mounted) return null;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-400" />;
      case 'YouTube':
        return <Youtube className="w-3.5 h-3.5 text-rose-500" />;
      case 'TikTok':
        return <Video className="w-3.5 h-3.5 text-cyan-400" />;
      case 'LinkedIn':
        return <Linkedin className="w-3.5 h-3.5 text-blue-400" />;
      case 'Twitter':
        return <Twitter className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Video className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const product = campaign.productDetails;
  const req = campaign.requirementDetails;
  const rawDels = Array.isArray(campaign.rawDeliverables) && campaign.rawDeliverables.length > 0
    ? campaign.rawDeliverables
    : null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-purple-500/25 rounded-3xl shadow-2xl shadow-purple-950/40 overflow-hidden flex flex-col z-10 backdrop-blur-2xl"
        >
          {/* 1. Header Banner & Cover Image */}
          <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0">
            <img
              src={campaign.coverImage}
              alt={campaign.title}
              className="w-full h-full object-cover brightness-[0.7] scale-105 transition-transform duration-700"
            />
            {/* Gradient Overlay for seamless readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />

            {/* Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-white/10 transition-all z-20 backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Logo & Info Over Banner */}
            <div className="absolute bottom-3.5 left-5 right-5 flex items-end justify-between gap-3 z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-purple-500/30 overflow-hidden shadow-xl shrink-0">
                  <img
                    src={campaign.brandLogo}
                    alt={campaign.brandName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-white">{campaign.brandName}</h4>
                    {campaign.isVerifiedBrand && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-purple-300 font-semibold">{campaign.category}</span>
                    {campaign.brandLocation && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-slate-400">{campaign.brandLocation}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-xs font-extrabold text-white shadow-lg backdrop-blur-md shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>{campaign.matchScore}% Match</span>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 text-xs text-slate-300 no-scrollbar">
            {/* Title & Description */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {campaign.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {campaign.description}
              </p>
            </div>

            {/* Target Platforms Row */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Target Platforms:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {campaign.targetPlatforms.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-purple-500/25 text-xs font-semibold text-white shadow-sm"
                  >
                    {getPlatformIcon(p)}
                    <span>{p}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Key Deal Stats Grid (Line Separated with Dividers) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-purple-500/20 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-purple-500/25 backdrop-blur-xl shadow-lg">
              {/* Compensation */}
              <div className="pb-3 sm:pb-0 sm:pr-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider block">
                  Budget / Compensation
                </span>
                <span className="text-xl sm:text-2xl font-black text-white block tracking-tight">
                  {formatBudget(campaign.payoutAmount)}
                </span>
                <span className="text-[11px] text-purple-300 font-semibold block">
                  {campaign.payoutModel}
                </span>
                {campaign.hasFreeProduct && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-400">
                    <Gift className="w-3 h-3" />
                    <span>+ Free Product Gifting</span>
                  </span>
                )}
              </div>

              {/* Spots & Applications */}
              <div className="py-3 sm:py-0 sm:px-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider block">
                  Applications / Spots
                </span>
                <span className="text-xl sm:text-2xl font-black text-white block tracking-tight">
                  {campaign.applicationsCount || 0} Applied
                </span>
                <span className="text-[11px] text-slate-300 block">
                  {campaign.slotsTotal - campaign.slotsFilled} spots left
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {campaign.slotsTotal} creator capacity
                </span>
              </div>

              {/* Deadline */}
              <div className="pt-3 sm:pt-0 sm:pl-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400/80 tracking-wider block">
                  Application Deadline
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-400 block tracking-tight">
                  {campaign.daysRemaining} days left
                </span>
                <span className="text-[11px] text-slate-300 block">
                  Ends on {campaign.deadline}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Rolling Creator Review
                </span>
              </div>
            </div>

            {/* 4. Required Deliverables */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-400" />
                <span>Required Deliverables & Assets</span>
              </h4>

              {rawDels ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rawDels.map((del: any, idx: number) => (
                    <div
                      key={del.id || idx}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-600/25 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs">
                            {del.quantity || 1}x
                          </span>
                          <span className="text-xs font-bold text-white">
                            {del.type || 'Deliverable'}
                          </span>
                        </div>
                        {del.revisionLimit && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                            Up to {del.revisionLimit} revisions
                          </span>
                        )}
                      </div>

                      {del.requiredCta && (
                        <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-white/5">
                          <span className="text-purple-400 font-bold">Required CTA: </span>
                          <span>&quot;{del.requiredCta}&quot;</span>
                        </div>
                      )}

                      {Array.isArray(del.mandatoryHashtags) && del.mandatoryHashtags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-[10.5px] text-purple-300">
                          <Hash className="w-3 h-3 text-purple-400" />
                          <span>{del.mandatoryHashtags.join(' ')}</span>
                        </div>
                      )}

                      {del.instructions && (
                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                          &quot;{del.instructions}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {campaign.deliverables.map((del, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-purple-500/20 flex items-center gap-3"
                    >
                      <div className="w-7 h-7 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <span className="text-xs font-bold text-white">{del}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Product Sample Details (if available) */}
            {campaign.hasFreeProduct && product && (
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span>Free Product Sample / Access</span>
                  </h4>
                  {product.freeProductValue && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                      Valued at {symbol}{Number(product.freeProductValue).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Product Name:</span>
                    <span className="font-bold text-white text-sm">{product.productName || 'Campaign Product'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Type / Fulfillment:</span>
                    <span className="font-semibold text-slate-200">
                      {product.productType === 'PHYSICAL' ? 'Physical Item (Shipped)' : 'Digital Software / SaaS Access'}
                    </span>
                  </div>
                  {product.shippingDetails && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 text-[11px] block">Shipping Method:</span>
                      <span className="text-slate-300">{product.shippingDetails}</span>
                    </div>
                  )}
                  {product.productInstructions && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 text-[11px] block">Product Guidelines:</span>
                      <span className="text-slate-300">{product.productInstructions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Creator Requirements & Eligibility */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Eligibility & Requirements</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-2">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {campaign.requirements.map((reqItem, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{reqItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 7. Guidelines: Dos & Don'ts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/25 space-y-2.5">
                <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Key Dos & Brand Requirements</span>
                </h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  {campaign.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-950/25 border border-rose-500/25 space-y-2.5">
                <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Strict Don&apos;ts & Exclusions</span>
                </h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  {campaign.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 8. Escrow Protection Guarantee */}
            <div className="p-4.5 rounded-2xl bg-slate-950/80 border border-purple-500/25 flex items-start sm:items-center gap-3.5 shadow-md">
              <ShieldCheck className="w-7 h-7 text-purple-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Zerify 100% Escrow Protection Guaranteed
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                  Campaign compensation is pre-funded into Zerify smart escrow before content creation begins. Once your submitted deliverables are approved, funds are immediately deposited into your creator wallet.
                </span>
              </div>
            </div>
          </div>

          {/* 9. Footer Action Bar */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-t border-purple-500/20 bg-slate-950/80 shrink-0 backdrop-blur-xl">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/20 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm"
            >
              Close Brief
            </button>

            <button
              onClick={() => {
                onClose();
                onApply(campaign);
              }}
              type="button"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-950/50 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Apply & Submit Pitch</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
