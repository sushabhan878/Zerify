'use client';

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import * as Flags from 'country-flag-icons/react/3x2';
import { Camera, User, Mail, Calendar, Users, Phone, MapPin, Pencil } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import CustomSelect from './CustomSelect';

interface SingleBasicInfoCardProps {
  name: string;
  setName: (val: string) => void;
  handle: string;
  setHandle: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  userEmail: string;
  phoneCode: string;
  setPhoneCode: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  dob: string;
  setDob: (val: string) => void;
  gender: string;
  setGender: (val: string) => void;
  avatarUrl: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
}

export default function SingleBasicInfoCard({
  name,
  setName,
  handle,
  setHandle,
  bio,
  setBio,
  location,
  setLocation,
  userEmail,
  phoneCode,
  setPhoneCode,
  phoneNumber,
  setPhoneNumber,
  dob,
  setDob,
  gender,
  setGender,
  avatarUrl,
  onAvatarChange,
  onRemoveAvatar,
}: SingleBasicInfoCardProps) {
  const [isEditingNameInline, setIsEditingNameInline] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePencilClick = () => {
    setIsEditingNameInline(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);
  };

  const formatFirstLocation = (locStr: string): string => {
    if (!locStr) return '';
    return locStr.split(',')[0].trim();
  };

  const phoneCodeOptions = useMemo(() => {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const popularCodes = ['IN', 'US', 'GB', 'CA', 'AU'];

    const allMapped = getCountries().map((countryCode) => {
      const dialCode = getCountryCallingCode(countryCode);
      const countryName = regionNames.of(countryCode) ?? countryCode;
      const flagKey = countryCode.toUpperCase().replace(/-/g, '_') as keyof typeof Flags;
      const FlagComponent = Flags[flagKey];

      return {
        value: `+${dialCode}`,
        label: `+${dialCode} ${countryName}`,
        triggerLabel: `+${dialCode} (${countryCode})`,
        keywords: `${countryCode} ${countryName} ${dialCode}`,
        countryCode,
        icon: FlagComponent ? (
          <FlagComponent className="w-4.5 h-3.5 object-cover rounded-[1px] shadow-sm shrink-0" />
        ) : undefined,
      };
    });

    const popular = allMapped
      .filter((opt) => popularCodes.includes(opt.countryCode))
      .sort((a, b) => popularCodes.indexOf(a.countryCode) - popularCodes.indexOf(b.countryCode));

    const rest = allMapped
      .filter((opt) => !popularCodes.includes(opt.countryCode))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [...popular, ...rest];
  }, []);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-xl bg-slate-950/45 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
      {/* 1. Identity & Profile Photo Header */}
      <div className="flex items-center gap-4 pb-3 border-b border-white/10">
        {/* Avatar Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group shrink-0 cursor-pointer"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-purple-950/30 border-2 border-purple-500/40 overflow-hidden flex items-center justify-center shadow-md group-hover:border-purple-400 transition-colors">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || 'Creator Avatar'}
                className="w-full h-full object-cover rounded-full bg-slate-900"
              />
            ) : (
              <User className="w-7 h-7 text-purple-400 group-hover:scale-105 transition-transform" />
            )}
          </div>

          {/* Camera Badge */}
          <div
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-md border-2 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-110"
            title="Upload Photo from Device"
          >
            <Camera className="w-3 h-3" />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />
        </div>

        {/* Creator Info on Right of Avatar */}
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            {isEditingNameInline ? (
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setIsEditingNameInline(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingNameInline(false)}
                placeholder="Enter Full Name"
                className="bg-slate-900 border border-purple-500 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none"
              />
            ) : (
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{name || 'Full Name'}</span>
                <button
                  type="button"
                  onClick={handlePencilClick}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                  title="Edit Name"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </h2>
            )}
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-2 font-medium">
            <span className="text-purple-300 font-semibold">{handle ? `@${handle.replace(/^@/, '')}` : '@handle'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {location ? formatFirstLocation(location) : 'Location not set'}
            </span>
          </p>

          <div className="flex items-center gap-3 pt-0.5">
            <span className="text-[11px] text-slate-500">JPG, PNG or GIF. Rec. 400x400px.</span>
            {avatarUrl && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 transition-colors"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Username / Handle & Contact Number (Side by side at top) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Username / Handle
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500/70 text-xs font-semibold">@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="username"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Contact Number
          </label>
          <div className="flex gap-2">
            <CustomSelect
              options={phoneCodeOptions}
              value={phoneCode}
              onChange={setPhoneCode}
              searchable
              searchPlaceholder="Search country or code..."
              dropdownHeight="max-h-64"
              className="w-32 sm:w-36 shrink-0"
              showCheckmark={false}
            />
            <div className="relative flex-1 min-w-0">
              <Phone className="w-4 h-4 text-slate-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="415-555-0192"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bio & Creative Pitch */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
          Bio & Creative Pitch
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="e.g. Content creator focused on tech gadgets, productivity workflows, and modern lifestyle aesthetics..."
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all leading-relaxed shadow-inner resize-none"
        />
        <span className="text-[10px] text-slate-500/80 font-medium block text-right mt-1">
          {bio.length} / 300 characters
        </span>
      </div>

      {/* 4. Location with Auto-Suggestions & Email Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Location (City / Region)
          </label>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="Search location (e.g. San Francisco, CA)..."
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              defaultValue={userEmail}
              readOnly
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950/40 border border-white/5 text-xs text-slate-400/80 cursor-not-allowed font-medium"
            />
          </div>
        </div>
      </div>

      {/* 6. DOB & Gender Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Date of Birth (DOB)
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-semibold shadow-inner [color-scheme:dark] cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Gender Identity
          </label>
          <CustomSelect
            options={genderOptions}
            value={gender}
            onChange={setGender}
            iconLeft={<Users className="w-4 h-4 text-purple-400" />}
          />
        </div>
      </div>
    </div>
  );
}
