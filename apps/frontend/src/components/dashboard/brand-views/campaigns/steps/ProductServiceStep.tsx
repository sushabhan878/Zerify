'use client';

import React, { useState } from 'react';
import { Package, Globe, Gift, Check, Smartphone, Monitor, Award } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

const PRODUCT_TYPES = [

  { value: 'PHYSICAL', label: 'Physical Product', icon: Package, desc: 'Shipped directly to creators for unboxing & reviews' },
  { value: 'DIGITAL_SAAS', label: 'Digital / SaaS Access', icon: Monitor, desc: 'Software login, API key, or premium web app access' },
  { value: 'MOBILE_APP', label: 'Mobile App / Game', icon: Smartphone, desc: 'iOS / Android app install, feature demo, or gameplay' },
  { value: 'SERVICE_EXPERIENCE', label: 'Service / Experience', icon: Award, desc: 'In-person event, consultation, hotel stay, or spa visit' },
];

interface ProductServiceStepProps {
  formData: any;
  onChange: (field: string, val: any) => void;
}

export default function ProductServiceStep({ formData, onChange }: ProductServiceStepProps) {
  const [productType, setProductType] = useState<string>(formData.productType || '');

  const handleTypeSelect = (type: string) => {
    const newVal = productType === type ? '' : type;
    setProductType(newVal);
    onChange('productType', newVal);
  };

  const currencyCode = formData.budgetCurrency || 'USD';
  const currencySymbol = currencyCode === 'INR' ? '₹' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6">

      {/* Product Type Selector */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider">
          Product / Offering Type <span className="text-pink-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {PRODUCT_TYPES.map((pt) => {
            const isSelected = productType === pt.value;
            const Icon = pt.icon;

            return (
              <button
                type="button"
                key={pt.value}
                onClick={() => handleTypeSelect(pt.value)}
                className={`relative p-4 rounded-2xl text-left border transition-all duration-200 group flex flex-col justify-between overflow-hidden cursor-pointer ${isSelected
                    ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/90 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-400/30'
                    : 'bg-slate-900/60 border-white/10 hover:border-purple-400/30 hover:bg-slate-900/90 hover:-translate-y-0.5'
                  }`}
              >
                {/* Subtle Top Accent Highlight for active card */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isSelected
                          ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-[0_0_10px_rgba(192,132,252,0.25)]'
                          : 'bg-slate-800/80 text-slate-400 border border-white/5 group-hover:text-purple-300 group-hover:border-purple-400/20'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'border border-white/15 group-hover:border-purple-400/30'
                        }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  <span className="block text-xs font-bold text-white tracking-tight">
                    {pt.label}
                  </span>
                </div>

                <span className="block text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                  {pt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>


      {/* Core Product Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Product / Service Name <span className="text-pink-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Zerify AI Studio Pro"
            value={formData.productName || ''}
            onChange={(e) => onChange('productName', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/90 border border-purple-400/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Landing Page / Product Store URL
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-purple-300/60 absolute left-3.5 top-3.5" />
            <input
              type="url"
              placeholder="https://yourbrand.com/products/pro"
              value={formData.landingPageUrl || ''}
              onChange={(e) => onChange('landingPageUrl', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-purple-400/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <ImageUploader
            value={formData.coverImageUrl || ''}
            onChange={(url) => onChange('coverImageUrl', url)}
            label="Campaign Cover / Product Showcase Image"
            helperText="Upload high-res product photos, campaign cover, or mockup (PNG, JPG, WEBP). Stored directly on Cloudinary CDN."
          />
        </div>
      </div>


      {/* Free Product Sample / Gifting Section */}
      <div className="pt-6 border-t border-purple-400/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-400/20 text-purple-300 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Free Product Sample / Access for Creators
              </span>
              <span className="text-[11px] text-slate-400 block">
                Provide physical sample units, software credentials, or VIP event access to confirmed creators
              </span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(formData.hasFreeProduct)}
              onChange={(e) => onChange('hasFreeProduct', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        {Boolean(formData.hasFreeProduct) && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Estimated Retail Value ({currencyCode})
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5000"
                    value={formData.freeProductValue || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      onChange('freeProductValue', val ? Number(val) : '');
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                  />
                  <span className="text-purple-300/70 font-bold text-xs absolute left-3.5 top-3">
                    {currencySymbol}
                  </span>
                </div>
              </div>



              <div>
                <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                  Shipping & Fulfillment Method
                </label>
                <input
                  type="text"
                  placeholder="e.g. Worldwide courier tracking provided / instant portal login"
                  value={formData.shippingDetails || ''}
                  onChange={(e) => onChange('shippingDetails', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
                Product Handling & Creator Instructions
              </label>
              <textarea
                rows={3}
                placeholder="Specify any unboxing instructions, product testing requirements, return conditions, or features creators must showcase..."
                value={formData.productInstructions || ''}
                onChange={(e) => onChange('productInstructions', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

