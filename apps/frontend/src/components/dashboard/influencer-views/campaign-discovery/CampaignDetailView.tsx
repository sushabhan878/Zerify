'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
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
  Globe,
  Share2,
  ExternalLink,
  Bookmark,
} from 'lucide-react';
import { CampaignItem } from './CampaignCard';
import LottieLoader from '@/components/ui/LottieLoader';

interface CampaignDetailViewProps {
  campaign: CampaignItem;
  onBack: () => void;
  onApply: (campaign: CampaignItem) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export default function CampaignDetailView({
  campaign,
  onBack,
  onApply,
  isSaved = false,
  onToggleSave,
}: CampaignDetailViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Smooth brief loading transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [campaign.id]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'YouTube':
        return <Youtube className="w-4 h-4 text-rose-500" />;
      case 'TikTok':
        return <Video className="w-4 h-4 text-cyan-400" />;
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4 text-blue-400" />;
      case 'Twitter':
        return <Twitter className="w-4 h-4 text-sky-400" />;
      default:
        return <Video className="w-4 h-4 text-purple-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center min-h-[500px]">
        <LottieLoader size={200} message="Loading comprehensive campaign brief..." />
      </div>
    );
  }

  const product = campaign.productDetails;
  const rawDels = Array.isArray(campaign.rawDeliverables) && campaign.rawDeliverables.length > 0
    ? campaign.rawDeliverables
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-12"
    >
      {/* 1. Top Navigation Bar */}
      <div className="pb-1">
        <button
          onClick={onBack}
          type="button"
          className="group inline-flex items-center gap-2 text-slate-300 hover:text-purple-300 text-xs font-bold transition-colors w-fit py-1"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Campaign Discovery</span>
        </button>
      </div>

      {/* 2. Hero Cover Banner */}
      <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden border border-purple-500/25 shadow-2xl shadow-purple-950/30">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/80" />

        {/* Brand Details Overlay Over Hero Banner */}
        <div className="absolute bottom-5 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-purple-500/30 overflow-hidden shadow-2xl shrink-0">
              <img
                src={campaign.brandLogo}
                alt={campaign.brandName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {campaign.brandName}
                </h1>
                {campaign.isVerifiedBrand && (
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-purple-300 font-semibold px-2.5 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/25">
                  {campaign.category}
                </span>
                {campaign.brandLocation && (
                  <span className="text-xs text-slate-300 font-medium">
                    {campaign.brandLocation}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-950/85 border border-purple-500/40 text-xs sm:text-sm font-extrabold text-white shadow-xl backdrop-blur-md self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>{campaign.matchScore}% Match Rate</span>
          </div>
        </div>
      </div>

      {/* 3. Main Brief Overview & Target Platforms */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/70 border border-purple-500/20 backdrop-blur-2xl shadow-xl shadow-purple-950/20 space-y-6">
        {/* Title, Description & Top-Right Apply Button */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug">
              {campaign.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {campaign.description}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(campaign.id)}
                type="button"
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  isSaved
                    ? 'bg-purple-600/30 border-purple-400/70 text-purple-200 shadow-purple-950/40'
                    : 'bg-slate-900/80 border-purple-500/20 text-slate-300 hover:text-white hover:border-purple-400/40 hover:bg-slate-800'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save campaign'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-purple-400' : 'text-purple-400'}`} />
                <span>{isSaved ? 'Saved' : 'Save Campaign'}</span>
              </button>
            )}

            {campaign.isApplied ? (
              <button
                disabled
                type="button"
                className="px-6 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm cursor-default"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Applied</span>
              </button>
            ) : (
              <button
                onClick={() => onApply(campaign)}
                type="button"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-950/50 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply & Submit Pitch</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Platforms */}
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Target Platforms:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {campaign.targetPlatforms.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/25 text-xs font-semibold text-white shadow-sm"
              >
                {getPlatformIcon(p)}
                <span>{p}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 4. Line-Separated Key Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-purple-500/20 py-2">
          {/* Compensation */}
          <div className="pb-3 sm:pb-0 sm:pr-6 space-y-1 flex flex-col justify-center">
            <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
              {campaign.payoutAmount}
            </span>
            {campaign.hasFreeProduct && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Gift className="w-3.5 h-3.5" />
                <span>+ Free Product Included</span>
              </span>
            )}
          </div>

          {/* Applications */}
          <div className="py-3 sm:py-0 sm:px-6 flex items-center">
            <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
              {campaign.applicationsCount || 0} Applied
            </span>
          </div>

          {/* Deadline */}
          <div className="pt-3 sm:pt-0 sm:pl-6 flex items-center">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 block tracking-tight">
              {campaign.daysRemaining} days left
            </span>
          </div>
        </div>

        {/* 5. Product & Service Being Promoted (Compact, Sleek Design) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider">
              Product & Service Being Promoted
            </h3>
            {product?.hasFreeProduct && product?.freeProductValue && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-400 shadow-sm">
                Free Sample Valued at ₹{product.freeProductValue}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Compact Product Image Thumbnail */}
            {(product?.coverImageUrl || campaign.coverImage) && (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-purple-500/30 shrink-0 bg-slate-900 shadow-md">
                <img
                  src={product?.coverImageUrl || campaign.coverImage}
                  alt={product?.productName || campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Main Product Info */}
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {product?.productName || campaign.title}
                </h4>
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-300">
                  {product?.productType === 'PHYSICAL'
                    ? 'Physical Goods'
                    : product?.productType === 'DIGITAL_SAAS'
                    ? 'Digital SaaS & Software'
                    : product?.productType || 'Digital Service'}
                </span>
              </div>

              {product?.landingPageUrl && (
                <div className="pt-0.5">
                  <a
                    href={product.landingPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1.5 transition-colors"
                  >
                    <span>{product.landingPageUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Optional Shipping & Instructions if present */}
          {(product?.shippingDetails || product?.productInstructions) && (
            <div className="pt-3 border-t border-purple-500/15 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {product?.shippingDetails && (
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold uppercase block mb-0.5">
                    Shipping & Fulfillment:
                  </span>
                  <span className="text-slate-300">{product.shippingDetails}</span>
                </div>
              )}
              {product?.productInstructions && (
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold uppercase block mb-0.5">
                    Promotion Instructions:
                  </span>
                  <span className="text-slate-300">{product.productInstructions}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Required Deliverables & Assets */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">
            Required Deliverables & Assets
          </h3>

          {rawDels ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rawDels.map((del: any, idx: number) => (
                <div
                  key={del.id || idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-purple-600/25 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs">
                        {del.quantity || 1}x
                      </span>
                      <span className="text-sm font-bold text-white">
                        {del.type || 'Deliverable'}
                      </span>
                    </div>
                    {del.revisionLimit && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-white/5">
                        Up to {del.revisionLimit} revisions
                      </span>
                    )}
                  </div>

                  {del.requiredCta && (
                    <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-0.5">
                      <span className="text-purple-400 font-bold block">Required CTA:</span>
                      <span>&quot;{del.requiredCta}&quot;</span>
                    </div>
                  )}

                  {Array.isArray(del.mandatoryHashtags) && del.mandatoryHashtags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-purple-300">
                      <Hash className="w-3.5 h-3.5 text-purple-400" />
                      <span>{del.mandatoryHashtags.join(' ')}</span>
                    </div>
                  )}

                  {del.instructions && (
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      &quot;{del.instructions}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaign.deliverables.map((del, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-bold text-white">{del}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Guidelines: Dos & Don'ts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-emerald-950/25 border border-emerald-500/25 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Key Dos & Brand Requirements</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {campaign.dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-rose-950/25 border border-rose-500/25 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Strict Don&apos;ts & Exclusions</span>
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {campaign.donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 9. Smart Escrow Protection Guarantee */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/25 flex items-start sm:items-center gap-4 shadow-lg">
          <ShieldCheck className="w-8 h-8 text-purple-400 shrink-0" />
          <div className="space-y-1">
            <span className="text-sm font-bold text-white block">
              Zerify 100% Escrow Protection Guaranteed
            </span>
            <span className="text-xs text-slate-400 block leading-relaxed">
              Campaign compensation is pre-funded into Zerify smart escrow before content creation begins. Once your submitted deliverables are approved, funds are immediately deposited into your creator wallet without delays.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
