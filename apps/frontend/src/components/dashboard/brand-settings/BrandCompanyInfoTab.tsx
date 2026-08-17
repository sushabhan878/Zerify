'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, MapPin, Calendar, FileText, Check, Loader2, Sparkles, Instagram, Linkedin, Twitter, Youtube, Camera, Pencil, Upload, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface BrandCompanyInfoTabProps {
  initialData?: any;
  onSaveSuccess?: () => void;
}

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
      }
    }
  }, [initialData]);

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
          socialLinks: { instagram, linkedin, twitter, youtube },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
        throw new Error(msg || 'Failed to update company info. Please check authentication.');
      }

      // Sync local storage for top bar
      try {
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
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="E-commerce & Retail">E-commerce & Retail</option>
            <option value="Fashion & Apparel">Fashion & Apparel</option>
            <option value="Beauty & Personal Care">Beauty & Personal Care</option>
            <option value="Fitness & Wellness">Fitness & Wellness</option>
            <option value="Technology & SaaS">Technology & SaaS</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Travel & Lifestyle">Travel & Lifestyle</option>
            <option value="Financial Services">Financial Services</option>
            <option value="EdTech & Education">EdTech & Education</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">HQ Location</label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA / Mumbai, India"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
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
      <div className="space-y-3 pt-2 border-t border-white/10">
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
