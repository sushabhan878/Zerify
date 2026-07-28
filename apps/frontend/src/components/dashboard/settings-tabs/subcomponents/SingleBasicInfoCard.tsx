'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import * as Flags from 'country-flag-icons/react/3x2';
import { Camera, User, Mail, Calendar, Users, Phone } from 'lucide-react';
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
    <div className="p-5 sm:p-6 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-6 shadow-xl">
      {/* 1. Profile Picture & Avatar Header */}
      <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-white/10">
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 p-[2px] shadow-lg shadow-purple-950/40">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name} width={64} height={64} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-lg">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-transform group-hover:scale-110 shadow-md border-2 border-slate-950">
            <Camera className="w-3 h-3" />
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="space-y-0.5 text-center sm:text-left">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
            <User className="w-3.5 h-3.5 text-purple-400" />
            <span>Profile Photo & General Info</span>
          </h3>
          <p className="text-[11px] text-slate-400/80">JPG, PNG or GIF. Recommended 400x400px.</p>
          {avatarUrl && (
            <button
              type="button"
              onClick={onRemoveAvatar}
              className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 pt-1 block"
            >
              Remove Photo
            </button>
          )}
        </div>
      </div>

      {/* 2. Name & Handle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all font-medium shadow-inner"
          />
        </div>

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
      </div>

      {/* 3. Bio & Pitch */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider block mb-1.5">
          Bio & Creative Pitch
        </label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe your creative content style and audience..."
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/70 border border-white/10 text-xs text-white placeholder:text-slate-600/70 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/20 transition-all leading-relaxed shadow-inner"
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

      {/* 5. Contact Number */}
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
            className="w-40 shrink-0"
            showCheckmark={false}
          />
          <div className="relative flex-1">
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

      {/* 6. DOB & Gender Dropdown (Gender on the RIGHT side of DOB) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left Column: Date of Birth (DOB Calendar Picker) */}
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

        {/* Right Column: Gender Selection Dropdown (Only 3 Options) */}
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
