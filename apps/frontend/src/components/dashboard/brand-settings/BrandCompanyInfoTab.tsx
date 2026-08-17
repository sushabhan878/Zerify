'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, MapPin, Calendar, FileText, Check, Loader2, Sparkles, Instagram, Linkedin, Twitter, Youtube, Camera, Pencil, Upload, Trash2, Plus, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

import CustomSelect, { SelectOption } from '../settings-tabs/subcomponents/CustomSelect';
import LocationAutocomplete from '../settings-tabs/subcomponents/LocationAutocomplete';
// @ts-ignore
import { Industry } from 'naics';

interface CustomSocialLink {
  id: string;
  platform: string;
  url: string;
}

interface BrandCompanyInfoTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

export const EXTENSIVE_INDUSTRY_OPTIONS: SelectOption[] = [
  // Technology & Digital
  { value: 'Software & SaaS', label: 'Software & SaaS', keywords: 'tech software cloud saas app IT' },
  { value: 'AI & Machine Learning', label: 'AI & Machine Learning', keywords: 'ai artificial intelligence ml data algorithms' },
  { value: 'Cybersecurity & IT Infrastructure', label: 'Cybersecurity & IT Infrastructure', keywords: 'security IT networks cloud data' },
  { value: 'Mobile Apps & Gaming', label: 'Mobile Apps & Mobile Gaming', keywords: 'apps mobile games ios android' },
  { value: 'Consumer Electronics & Hardware', label: 'Consumer Electronics & Hardware', keywords: 'hardware gadgets electronics tech devices' },
  { value: 'Fintech & Digital Payments', label: 'Fintech & Digital Payments', keywords: 'finance fintech payments banking money crypto' },
  { value: 'Web3, Crypto & Blockchain', label: 'Web3, Crypto & Blockchain', keywords: 'crypto bitcoin web3 nft blockchain' },

  // E-Commerce, Retail & Fashion
  { value: 'E-commerce & Retail', label: 'E-commerce & Direct-to-Consumer (D2C)', keywords: 'ecommerce shop retail online d2c' },
  { value: 'Fashion & Apparel', label: 'Fashion & Apparel', keywords: 'clothing fashion apparel style wear garments' },
  { value: 'Luxury & Designer Goods', label: 'Luxury Goods & Designer Fashion', keywords: 'luxury premium designer watches haute couture' },
  { value: 'Jewelry & Accessories', label: 'Jewelry, Watches & Accessories', keywords: 'jewelry watches accessories rings gold' },
  { value: 'Footwear & Athleisure', label: 'Footwear & Athleisure', keywords: 'shoes sneakers sports fashion footwear activewear' },
  { value: 'Retail Outlets & Department Stores', label: 'Retail Outlets & Department Stores', keywords: 'retail store shopping mall boutique' },

  // Beauty, Health & Personal Care
  { value: 'Beauty & Personal Care', label: 'Beauty, Cosmetics & Skincare', keywords: 'makeup beauty skincare cosmetics makeup' },
  { value: 'Personal Care & Hygiene', label: 'Personal Care & Hygiene', keywords: 'shampoo soap grooming hygiene body care' },
  { value: 'Haircare & Styling', label: 'Haircare & Styling Products', keywords: 'hair salon haircare styling shampoo' },
  { value: 'Fitness & Wellness', label: 'Fitness, Wellness & Dietary Supplements', keywords: 'gym fitness nutrition protein wellness health' },
  { value: 'Healthcare & Pharmaceuticals', label: 'Healthcare & Pharmaceuticals', keywords: 'health medical pharma doctor care medicine' },
  { value: 'Medical Devices & Biotech', label: 'Medical Devices & Biotechnology', keywords: 'biotech lab medical research devices' },

  // Food, Beverage & Hospitality
  { value: 'Food & Beverage', label: 'Food, Gourmet & Packaged Goods', keywords: 'food snacks dining organic packaged groceries' },
  { value: 'Beverages & Coffee', label: 'Beverages, Specialty Drinks & Coffee', keywords: 'drinks coffee tea juice soda alcohol wine' },
  { value: 'Restaurants & Cafes', label: 'Restaurants, Cafes & Fast Food', keywords: 'restaurant cafe dining fastfood bistro' },
  { value: 'Hospitality & Travel', label: 'Hospitality, Hotels & Resorts', keywords: 'hotels resorts stay travel booking hospitality' },
  { value: 'Food Delivery & Cloud Kitchens', label: 'Food Delivery & Cloud Kitchens', keywords: 'delivery food ordering kitchen take-out' },

  // Lifestyle, Travel & Real Estate
  { value: 'Travel & Lifestyle', label: 'Travel, Tourism & Aviation', keywords: 'travel flight tourism airline adventure' },
  { value: 'Home & Interior Design', label: 'Home Decor, Furniture & Interior Design', keywords: 'furniture home decor interior design architecture' },
  { value: 'Kitchenware & Appliances', label: 'Kitchenware & Home Appliances', keywords: 'kitchen cookware appliances home' },
  { value: 'Real Estate & Property Development', label: 'Real Estate & Property Development', keywords: 'real estate housing property construction architecture' },
  { value: 'Automotive & EV', label: 'Automotive, Electric Vehicles & Mobility', keywords: 'auto cars ev electric vehicles EV transport' },
  { value: 'Sports & Outdoor Equipment', label: 'Outdoor, Camping & Sports Gear', keywords: 'sports outdoor hiking camping gear' },

  // Media, Entertainment & Games
  { value: 'Media & Publishing', label: 'Media, Publishing & Journalism', keywords: 'news media magazine blog publishing press' },
  { value: 'Film & Video Streaming', label: 'Film, Television & Video Streaming', keywords: 'movies tv OTT streaming video film' },
  { value: 'Music & Audio Production', label: 'Music, Audio & Podcast Production', keywords: 'music podcast audio record studio' },
  { value: 'Esports & Gaming Organizations', label: 'Esports & Gaming Organizations', keywords: 'gaming esports stream twitch youtube' },
  { value: 'Events & PR Agencies', label: 'Events, PR & Talent Management', keywords: 'events pr talent management agency' },

  // Finance, Legal & Professional Services
  { value: 'Financial Services', label: 'Banking & Financial Services', keywords: 'bank loans finance wealth wealth management' },
  { value: 'Venture Capital & Investment', label: 'Venture Capital & Investment Banking', keywords: 'invest VC capital banking finance fund' },
  { value: 'EdTech & Education', label: 'EdTech & Online Learning', keywords: 'education edtech course learning school training' },
  { value: 'Higher Education & Universities', label: 'Universities & Higher Education', keywords: 'college university degree academy' },
  { value: 'Non-Profit & Sustainability', label: 'Non-Profit, NGO & Sustainability', keywords: 'ngo charity non-profit green clean energy' },
  { value: 'Logistics & Supply Chain', label: 'Logistics, Freight & Supply Chain', keywords: 'shipping logistics cargo transport delivery' },
  { value: 'Professional Services & Consulting', label: 'Business Consulting & Corporate Services', keywords: 'consulting legal hr recruitment accounting' },
  { value: 'Agriculture & Forestry', label: 'Agriculture, Forestry & AgTech', keywords: 'agriculture farming forestry agtech' },
  { value: 'Construction & Engineering', label: 'Construction & Heavy Engineering', keywords: 'construction engineering building infrastructure' },
  { value: 'Manufacturing & Industrial', label: 'Manufacturing & Industrial Production', keywords: 'factory manufacturing industrial production' },
  { value: 'Utilities & Energy', label: 'Utilities, Renewable Energy & Solar', keywords: 'energy solar wind power utilities' },
];

const BRAND_VALUES_OPTIONS = [
  'Sustainability',
  'Inclusivity',
  'Innovation',
  'Quality',
  'Affordability',
  'Community',
  'Transparency',
];

export default function BrandCompanyInfoTab({ initialData, onSaveSuccess }: BrandCompanyInfoTabProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName || '');
  const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [industry, setIndustry] = useState(initialData?.industry || 'E-commerce & Retail');
  const [location, setLocation] = useState(initialData?.location || '');
  const [foundedYear, setFoundedYear] = useState(initialData?.foundedYear || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedValues, setSelectedValues] = useState<string[]>(initialData?.brandValues || ['Quality', 'Innovation']);
  
  const [instagram, setInstagram] = useState(initialData?.socialLinks?.instagram || '');
  const [linkedin, setLinkedin] = useState(initialData?.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState(initialData?.socialLinks?.twitter || '');
  const [youtube, setYoutube] = useState(initialData?.socialLinks?.youtube || '');
  const [customLinks, setCustomLinks] = useState<CustomSocialLink[]>(
    initialData?.socialLinks?.customLinks || []
  );

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isEditingNameInline, setIsEditingNameInline] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever initialData changes from backend API
  React.useEffect(() => {
    if (initialData) {
      if (initialData.companyName !== undefined) setCompanyName(initialData.companyName || '');
      if (initialData.logoUrl !== undefined) setLogoUrl(initialData.logoUrl || '');
      if (initialData.website !== undefined) setWebsite(initialData.website || '');
      if (initialData.industry !== undefined) setIndustry(initialData.industry || 'E-commerce & Retail');
      if (initialData.location !== undefined) setLocation(initialData.location || '');
      if (initialData.foundedYear !== undefined) setFoundedYear(initialData.foundedYear || '');
      if (initialData.description !== undefined) setDescription(initialData.description || '');
      if (initialData.brandValues && initialData.brandValues.length > 0) setSelectedValues(initialData.brandValues);
      if (initialData.socialLinks) {
        if (initialData.socialLinks.instagram !== undefined) setInstagram(initialData.socialLinks.instagram || '');
        if (initialData.socialLinks.linkedin !== undefined) setLinkedin(initialData.socialLinks.linkedin || '');
        if (initialData.socialLinks.twitter !== undefined) setTwitter(initialData.socialLinks.twitter || '');
        if (initialData.socialLinks.youtube !== undefined) setYoutube(initialData.socialLinks.youtube || '');
        if (Array.isArray(initialData.socialLinks.customLinks)) {
          setCustomLinks(initialData.socialLinks.customLinks);
        }
      }
    }
  }, [initialData]);

  const handleAddCustomLink = () => {
    setCustomLinks((prev) => [
      ...prev,
      { id: Date.now().toString(), platform: 'Facebook', url: '' },
    ]);
  };

  const handleUpdateCustomLink = (id: string, field: 'platform' | 'url', value: string) => {
    setCustomLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveCustomLink = (id: string) => {
    setCustomLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleValue = (val: string) => {
    setSelectedValues((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const tempPreview = URL.createObjectURL(file);
    setLogoUrl(tempPreview);
    setIsUploadingLogo(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/file-upload/upload`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Logo upload failed.');
      }

      const data = await res.json();
      if (data.url) {
        setLogoUrl(data.url);
        setStatusMsg({ type: 'success', text: 'Brand logo uploaded successfully!' });
      }
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Image upload failed.' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handlePencilClick = () => {
    setIsEditingNameInline(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('zerify_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

      const res = await fetch(`${apiUrl}/brand/company-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          companyName,
          logoUrl,
          website,
          industry,
          location,
          foundedYear,
          description,
          brandValues: selectedValues,
          socialLinks: {
            instagram,
            linkedin,
            twitter,
            youtube,
            customLinks: customLinks.filter((l) => l.url.trim() !== ''),
          },
        }),
      });

      const updatedProfile = await res.json();

      // Sync local storage & trigger real-time UI updates
      try {
        localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event('zerify_brand_profile_update'));

        const stored = localStorage.getItem('zerify_user');
        const userObj = stored ? JSON.parse(stored) : {};
        const updatedUser = {
          ...userObj,
          name: companyName || userObj.name,
          companyName: companyName || userObj.companyName,
          logoUrl: logoUrl || userObj.logoUrl,
        };
        localStorage.setItem('zerify_user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('zerify_auth_change'));
      } catch (e) {
        // Ignore localStorage error
      }

      setStatusMsg({ type: 'success', text: 'Company details saved successfully!' });
      onSaveSuccess?.();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error saving changes.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
      {statusMsg && (
        <div className={`p-3 rounded-xl text-xs font-medium ${statusMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Minimal Brand Identity Header with Default Building Logo */}
      <div className="flex items-center gap-4 pb-2">
        {/* Compact Logo Avatar Box (Defaults to Building Icon) */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group shrink-0 cursor-pointer"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-purple-950/30 border border-purple-500/30 overflow-hidden flex items-center justify-center shadow-inner group-hover:border-purple-400 transition-colors">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName || 'Brand Logo'}
                className="w-full h-full object-cover rounded-xl bg-slate-900"
              />
            ) : (
              <Building2 className="w-7 h-7 text-purple-400 group-hover:scale-105 transition-transform" />
            )}
          </div>

          {/* Camera Badge */}
          <div
            className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-md border border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110"
            title="Upload Logo from Device"
          >
            {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Brand Details on Right of Logo */}
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            {isEditingNameInline ? (
              <input
                ref={nameInputRef}
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onBlur={() => setIsEditingNameInline(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingNameInline(false)}
                placeholder="Enter Company / Brand Name"
                className="bg-slate-900 border border-purple-500 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none"
              />
            ) : (
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{companyName || 'My Company Name'}</span>
                <button
                  type="button"
                  onClick={handlePencilClick}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                  title="Edit Brand Name"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </h2>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-2 font-medium">
            <span>{industry || 'Category not set'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {location || 'Location not set'}
            </span>
          </p>
        </div>
      </div>

      {/* Grid Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Website URL</label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://acmewear.com"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry Sector</label>
          <CustomSelect
            options={EXTENSIVE_INDUSTRY_OPTIONS}
            value={industry}
            onChange={(val) => setIndustry(val)}
            searchable
            searchPlaceholder="Search 40+ industry sectors..."
            iconLeft={<Building2 className="w-3.5 h-3.5 text-purple-400" />}
            dropdownHeight="max-h-64"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">HQ Location</label>
          <LocationAutocomplete
            value={location}
            onChange={(val) => setLocation(val)}
            placeholder="e.g. San Francisco, CA / Mumbai, India"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Founded Year</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder="e.g. 2021"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Brand Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of your brand story, mission, and key offerings..."
          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      {/* Brand Values */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Brand Core Values</label>
        <div className="flex flex-wrap gap-2">
          {BRAND_VALUES_OPTIONS.map((val) => {
            const isSelected = selectedValues.includes(val);
            return (
              <button
                type="button"
                key={val}
                onClick={() => toggleValue(val)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-500/60 text-purple-200 shadow-sm'
                    : 'bg-slate-950/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                <span>{val}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Media Links */}
      <div className="space-y-3 pt-1">
        <label className="block text-xs font-semibold text-slate-300">Brand Social Media Handles</label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2">
            <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Instagram URL / handle"
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-600"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2">
            <Linkedin className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="LinkedIn URL"
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-600"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2">
            <Twitter className="w-4 h-4 text-sky-400 shrink-0" />
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="X / Twitter handle"
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-600"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2">
            <Youtube className="w-4 h-4 text-rose-500 shrink-0" />
            <input
              type="text"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="YouTube Channel URL"
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-600"
            />
          </div>

          {/* Additional Dynamic Social / Portfolio Links */}
          {customLinks.map((link) => (
            <div key={link.id} className="flex items-center gap-2 bg-slate-950/90 border border-purple-500/30 rounded-xl px-2.5 py-1.5 shadow-sm">
              <div className="flex items-center gap-1 shrink-0">
                <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                <select
                  value={link.platform}
                  onChange={(e) => handleUpdateCustomLink(link.id, 'platform', e.target.value)}
                  className="bg-slate-900 border border-white/10 text-[11px] font-bold text-purple-300 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Discord">Discord</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Twitch">Twitch</option>
                  <option value="Pinterest">Pinterest</option>
                  <option value="Threads">Threads</option>
                  <option value="Custom">Custom Link</option>
                </select>
              </div>
              <input
                type="text"
                value={link.url}
                onChange={(e) => handleUpdateCustomLink(link.id, 'url', e.target.value)}
                placeholder={`Enter ${link.platform} URL / handle`}
                className="w-full bg-transparent text-xs text-white focus:outline-none placeholder-slate-600"
              />
              <button
                type="button"
                onClick={() => handleRemoveCustomLink(link.id)}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                title="Remove link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Link Button placed AFTER all 4 link fields */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddCustomLink}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white bg-purple-600/20 hover:bg-purple-600/30 px-3.5 py-2 rounded-xl border border-purple-500/40 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            title="Add custom social media link or website handle"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Add Link</span>
          </button>
        </div>
      </div>

      <div className="pt-3 flex justify-end">
        <button
          type="submit"
          disabled={saving || isUploadingLogo}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>Save Company Info</span>
        </button>
      </div>
    </form>
  );
}
