'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Mail, Phone, MapPin, Calendar, Camera, Check, Sparkles } from 'lucide-react';

interface BasicInfoTabProps {
  userName?: string;
  userEmail?: string;
  userHandle?: string;
  avatarUrl?: string | null;
  onSaveSuccess?: () => void;
}

export default function BasicInfoTab({
  userName = 'User',
  userEmail = 'user@zerify.io',
  userHandle = '@user',
  avatarUrl: initialAvatar = null,
  onSaveSuccess,
}: BasicInfoTabProps) {
  const [name, setName] = useState(userName);
  const [handle, setHandle] = useState(userHandle.replace(/^@/, ''));
  const [bio, setBio] = useState('Content Creator focusing on technology, productivity, and modern aesthetics.');
  const [city, setCity] = useState('San Francisco');
  const [country, setCountry] = useState('United States');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('415-555-0192');
  const [dob, setDob] = useState('1996-08-14');
  const [gender, setGender] = useState('Female');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatar);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(userName);
    setHandle(userHandle.replace(/^@/, ''));
    if (initialAvatar) setAvatarUrl(initialAvatar);
  }, [userName, userHandle, initialAvatar]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('zerify_user');
        const userObj = stored ? JSON.parse(stored) : {};
        const updated = {
          ...userObj,
          name,
          handle: `@${handle.replace(/^@/, '')}`,
          avatarUrl,
        };
        localStorage.setItem('zerify_user', JSON.stringify(updated));
        window.dispatchEvent(new Event('zerify_auth_change'));
      } catch (err) {
        console.error(err);
      }

      setIsSaving(false);
      setSaved(true);
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Profile Picture & General Details */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          <span>Profile Picture & Public Avatar</span>
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 p-[2.5px] shadow-xl shadow-purple-950/50">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={userName} width={76} height={76} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-transform group-hover:scale-110 shadow-lg border-2 border-slate-950">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white">Upload New Photo</h4>
            <p className="text-xs text-slate-400">JPG, PNG or GIF. Recommended resolution 400x400px.</p>
            <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="text-[11px] font-bold text-pink-400 hover:text-pink-300 underline"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Username / Handle</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors font-semibold"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5">Bio & Pitch</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell brands about your audience and creative style..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
          />
          <span className="text-[10px] text-slate-500 font-semibold block text-right mt-1">
            {bio.length} / 300 characters
          </span>
        </div>
      </div>

      {/* Location & Contact Information */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          <span>Location & Contact Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">City / Region</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                defaultValue={userEmail}
                readOnly
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Contact Number</label>
            <div className="flex gap-2">
              <select
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="px-2.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 shrink-0 font-bold"
              >
                <option value="+1">+1 (US/CA)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+81">+81 (JP)</option>
              </select>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date of Birth & Gender Identity */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Personal Demographics</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Date of Birth (DOB)</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Gender Identity</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    gender === g
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40 border border-purple-400/40'
                      : 'bg-slate-950 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Trigger */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-4 h-4" /> Basic Information Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-purple-950/50 transition-all hover:scale-105 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Basic Info'}</span>
        </button>
      </div>
    </form>
  );
}
