'use client';

import React, { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import SingleBasicInfoCard from './subcomponents/SingleBasicInfoCard';

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
  const [location, setLocation] = useState('San Francisco, CA, United States');
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
          location,
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
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Single Unified Card containing image upload, name, username, bio, location suggestions, contact & gender */}
      <SingleBasicInfoCard
        name={name}
        setName={setName}
        handle={handle}
        setHandle={setHandle}
        bio={bio}
        setBio={setBio}
        location={location}
        setLocation={setLocation}
        userEmail={userEmail}
        phoneCode={phoneCode}
        setPhoneCode={setPhoneCode}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        dob={dob}
        setDob={setDob}
        gender={gender}
        setGender={setGender}
        avatarUrl={avatarUrl}
        onAvatarChange={handleAvatarChange}
        onRemoveAvatar={() => setAvatarUrl(null)}
      />

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {saved && (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check className="w-4 h-4" /> Basic Information Saved!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Basic Info'}</span>
        </button>
      </div>
    </form>
  );
}
