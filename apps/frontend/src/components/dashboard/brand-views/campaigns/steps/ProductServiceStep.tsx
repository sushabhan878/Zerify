'use client';

import React, { useState } from 'react';
import { Package, Globe, Image as ImageIcon, Gift, Sparkles, Check, Smartphone, Monitor, ShoppingBag, Award } from 'lucide-react';

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
  const [productType, setProductType] = useState<string>(formData.productType || 'PHYSICAL');

  const handleTypeSelect = (type: string) => {
    setProductType(type);
    onChange('productType', type);
  };

  return (
    <div className="space-y-6">
      {/* Product Type Selector */}
      <div>
        <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
          Product / Offering Type <span className="text-pink-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRODUCT_TYPES.map((pt) => {
            const isSelected = productType === pt.value;
            const Icon = pt.icon;

            return (
              <button
                type="button"
                key={pt.value}
                onClick={() => handleTypeSelect(pt.value)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-400/60 text-white shadow-[0_0_12px_rgba(192,132,252,0.25)]'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-purple-400/30 hover:text-purple-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-500/30 text-purple-200' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-300 stroke-[2.5]" />}
                  </div>
                  <span className="block text-xs font-bold text-white">{pt.label}</span>
                </div>
                <span className="block text-[10px] text-slate-400 mt-2 leading-relaxed">{pt.desc}</span>
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
          <label className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Campaign Cover / Product Showcase Image URL
          </label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-purple-300/60 absolute left-3.5 top-3.5" />
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-... or product asset link"
              value={formData.coverImageUrl || ''}
              onChange={(e) => onChange('coverImageUrl', e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-purple-400/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Free Product Sample / Gifting Option */}
      <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-400/20 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Gift className="w-4 h-4 text-purple-300" />
            <div>
              <span className="text-xs font-bold text-white block">Free Product Sample / Access for Creators</span>
              <span className="text-[10px] text-purple-300/70 block">
                Will you provide free physical units or premium access credentials to confirmed creators?
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasFreeProduct ?? true}
              onChange={(e) => onChange('hasFreeProduct', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        {formData.hasFreeProduct !== false && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-400/10">
            <div>
              <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1">
                Estimated Sample Retail Value (USD)
              </label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={formData.freeProductValue || ''}
                onChange={(e) => onChange('freeProductValue', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-purple-200 uppercase mb-1">
                Shipping & Access Details
              </label>
              <input
                type="text"
                placeholder="e.g. Worldwide shipping included / instant license key"
                value={formData.shippingDetails || ''}
                onChange={(e) => onChange('shippingDetails', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-purple-400/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-0 focus:border-white/20"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
