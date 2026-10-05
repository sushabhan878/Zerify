'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import SingleBasicInfoCard from './subcomponents/SingleBasicInfoCard';
import { useToast } from '@/components/ui/Toast';

interface BasicInfoTabProps {
  userName?: string;
  userEmail?: string;
  userHandle?: string;
  avatarUrl?: string | null;
  initialData?: any;
  onSaveSuccess?: () => void;
}

export default function BasicInfoTab({
  userName = 'User',
  userEmail = 'user@zerify.io',
  userHandle = '@user',
  avatarUrl: initialAvatar = null,
  initialData,
  onSaveSuccess,
}: BasicInfoTabProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const { toastSuccess, toastError } = useToast();

  const getCachedData = () => {
    if (initialData) return initialData;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zerify_influencer_profile_cache');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  };

  const cached = getCachedData();

  const [name, setName] = useState(() => cached?.user?.name || cached?.name || userName || '');
  const [handle, setHandle] = useState(() => (cached?.handle || userHandle || '').replace(/^@/, ''));
  const [bio, setBio] = useState(() => cached?.bio || '');
  const [location, setLocation] = useState(() => cached?.location || '');
  const [phoneCode, setPhoneCode] = useState(() => cached?.phoneCode || '+1');
  const [phoneNumber, setPhoneNumber] = useState(() => cached?.phoneNumber || '');
  const [dob, setDob] = useState(() => (cached?.dob ? new Date(cached.dob).toISOString().split('T')[0] : ''));
  const [gender, setGender] = useState(() => cached?.gender || 'Prefer not to say');
  const [currency, setCurrency] = useState(() => cached?.currency || 'INR');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => cached?.avatarUrl || cached?.user?.avatarUrl || initialAvatar || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.user?.name) setName(initialData.user.name);
      if (initialData.handle) setHandle(initialData.handle.replace(/^@/, ''));
      if (initialData.bio !== undefined && initialData.bio !== null) setBio(initialData.bio);
      if (initialData.location !== undefined) setLocation(initialData.location || '');
      if (initialData.phoneCode !== undefined) setPhoneCode(initialData.phoneCode || '+1');
      if (initialData.phoneNumber !== undefined) setPhoneNumber(initialData.phoneNumber || '');
      if (initialData.dob) setDob(new Date(initialData.dob).toISOString().split('T')[0]);
      if (initialData.gender) setGender(initialData.gender);
      if (initialData.currency) setCurrency(initialData.currency);
      if (initialData.avatarUrl !== undefined) setAvatarUrl(initialData.avatarUrl || null);
    }
  }, [initialData]);

  // Fetch saved profile in background to update cache
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('zerify_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiUrl}/influencer/profile`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.name) setName(data.user.name);
          if (data.handle) setHandle(data.handle.replace(/^@/, ''));
          if (data.bio !== undefined && data.bio !== null) setBio(data.bio);
          if (data.location !== undefined) setLocation(data.location || '');
          if (data.phoneCode) setPhoneCode(data.phoneCode);
          if (data.phoneNumber !== undefined) setPhoneNumber(data.phoneNumber || '');
          if (data.dob) setDob(new Date(data.dob).toISOString().split('T')[0]);
          if (data.gender) setGender(data.gender);
          if (data.currency) setCurrency(data.currency);
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl);

          try {
            localStorage.setItem('zerify_influencer_profile_cache', JSON.stringify(data));
            if (data.currency) {
              localStorage.setItem('zerify_preferred_currency', data.currency);
            }
          } catch (e) {}
        }
      } catch (err) {
        // Silently use cached data
      }
    }
    loadProfile();
  }, [apiUrl]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const tempPreview = URL.createObjectURL(file);
    setAvatarUrl(tempPreview);
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiUrl}/file-upload/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
        throw new Error(msg || 'Failed to upload image');
      }

      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);
        toastSuccess('Profile picture updated successfully!');
      }
    } catch (err: any) {
      console.error('Image upload error:', err);
      toastError(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name,
      handle: `@${handle.replace(/^@/, '')}`,
      bio,
      location,
      phoneCode,
      phoneNumber,
      dob,
      gender,
      currency,
      avatarUrl: avatarUrl || null,
    };

    try {
      const token = localStorage.getItem('zerify_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiUrl}/influencer/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
        throw new Error(msg || 'Failed to save basic info to database');
      }

      const updatedData = await res.json();
      if (updatedData) {
        if (updatedData.user?.name) setName(updatedData.user.name);
        if (updatedData.handle) setHandle(updatedData.handle.replace(/^@/, ''));
        if (updatedData.bio !== undefined && updatedData.bio !== null) setBio(updatedData.bio);
        if (updatedData.location) setLocation(updatedData.location);
        if (updatedData.phoneCode) setPhoneCode(updatedData.phoneCode);
        if (updatedData.phoneNumber) setPhoneNumber(updatedData.phoneNumber);
        if (updatedData.dob) setDob(new Date(updatedData.dob).toISOString().split('T')[0]);
        if (updatedData.gender) setGender(updatedData.gender);
        if (updatedData.currency) setCurrency(updatedData.currency);
        if (updatedData.avatarUrl) setAvatarUrl(updatedData.avatarUrl);
      }

      // Sync local storage for top bar & sidebar real-time progress
      const stored = localStorage.getItem('zerify_user');
      const userObj = stored ? JSON.parse(stored) : {};
      const updatedUser = {
        ...userObj,
        name: updatedData.user?.name || name,
        handle: `@${(updatedData.handle || handle).replace(/^@/, '')}`,
        location: updatedData.location || location,
        avatarUrl: updatedData.avatarUrl || avatarUrl,
      };
      localStorage.setItem('zerify_user', JSON.stringify(updatedUser));
      localStorage.setItem('zerify_influencer_profile_cache', JSON.stringify(updatedData));
      localStorage.setItem('zerify_preferred_currency', updatedData.currency || currency);
      window.dispatchEvent(new Event('zerify_influencer_profile_update'));
      window.dispatchEvent(new Event('zerify_auth_change'));
      window.dispatchEvent(new Event('zerify_currency_change'));

      toastSuccess('Basic info saved successfully!');
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toastError(err.message || 'Failed to save settings to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Single Unified Card containing image upload, name, username, bio, location suggestions, contact, gender & currency */}
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
        currency={currency}
        setCurrency={setCurrency}
        avatarUrl={avatarUrl}
        onAvatarChange={handleAvatarChange}
        onRemoveAvatar={() => setAvatarUrl(null)}
      />

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {isUploadingAvatar && (
          <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image...
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving || isUploadingAvatar}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border border-purple-400/20 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Basic Info...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Save Basic Info</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
