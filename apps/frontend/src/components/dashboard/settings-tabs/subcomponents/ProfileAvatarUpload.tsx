'use client';

import React from 'react';
import Image from 'next/image';
import { Camera, User } from 'lucide-react';

interface ProfileAvatarUploadProps {
  name: string;
  avatarUrl: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
}

export default function ProfileAvatarUpload({
  name,
  avatarUrl,
  onAvatarChange,
  onRemoveAvatar,
}: ProfileAvatarUploadProps) {
  return (
    <div className="p-5 rounded-xl bg-slate-900/70 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
        <User className="w-4 h-4 text-purple-400" />
        <span>Profile Picture & Public Avatar</span>
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-5">
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
          <h4 className="text-xs font-bold text-white">Upload New Avatar</h4>
          <p className="text-[11px] text-slate-400/80">JPG, PNG or GIF. Recommended resolution 400x400px.</p>
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
    </div>
  );
}
