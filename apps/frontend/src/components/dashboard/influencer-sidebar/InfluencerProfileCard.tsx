import React from 'react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

interface InfluencerProfileCardProps {
  userName: string;
  userField?: string;
  userHandle?: string;
  avatarUrl?: string;
  isCollapsed?: boolean;
  completionPercentage?: number;
  onCompleteProfile?: () => void;
}

export default function InfluencerProfileCard({
  userName,
  userField = 'Product Designer',
  userHandle = '@creator_id',
  avatarUrl,
  isCollapsed = false,
  completionPercentage = 65,
  onCompleteProfile,
}: InfluencerProfileCardProps) {
  const avatarChar = userName.charAt(0).toUpperCase();
  const showCompletion = completionPercentage < 90;

  if (isCollapsed) {
    return (
      <div className="flex justify-center py-1">
        <div
          className="relative group shrink-0 cursor-pointer"
          onClick={onCompleteProfile}
          title={`${userName} • ${userField} ${showCompletion ? `(Profile ${completionPercentage}% Complete)` : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-[2px] shadow-md shadow-purple-950/50">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={userName}
                width={36}
                height={36}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-xs">
                {avatarChar}
              </div>
            )}
          </div>
          {showCompletion ? (
            <span className="absolute -bottom-1 -right-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-slate-950 shadow-md">
              {completionPercentage}%
            </span>
          ) : (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-950 shadow-sm" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onCompleteProfile}
      className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-3 group cursor-pointer hover:border-purple-500/30 transition-all"
    >
      {/* Avatar with Completion Percentage Badge */}
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 p-[2px] shadow-md shadow-purple-950/50">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-sm">
              {avatarChar}
            </div>
          )}
        </div>
        {showCompletion ? (
          <span
            className="absolute -bottom-1 -right-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full border border-slate-950 shadow-md"
            title={`Profile ${completionPercentage}% Complete`}
          >
            {completionPercentage}%
          </span>
        ) : (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-purple-500 border-2 border-slate-950 shadow-sm" title="Verified Creator" />
        )}
      </div>

      {/* Field & Name */}
      <div className="overflow-hidden min-w-0 flex-1">
        <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-purple-400/90 block truncate">
          {userField}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <h4 className="text-xs font-black text-white truncate tracking-tight">{userName}</h4>
          <span title="Verified Creator" className="inline-flex shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
          </span>
        </div>
      </div>
    </div>
  );
}
