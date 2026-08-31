'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreatorItem } from './CreatorCard';
import ProfileHeader from './profile/ProfileHeader';
import ProfileGallery from './profile/ProfileGallery';
import ProfileMainInfo from './profile/ProfileMainInfo';
import ProfileBookingCard from './profile/ProfileBookingCard';
import ProfileAnalytics from './profile/ProfileAnalytics';
import ProfileReviews from './profile/ProfileReviews';
import ProfileSimilarInfluencers from './profile/ProfileSimilarInfluencers';

interface CreatorProfileFullViewProps {
  creator: CreatorItem;
  onBack: () => void;
  onInvite: (creator: CreatorItem) => void;
  onToggleBookmark: (creatorId: string) => void;
  onSelectCreator?: (creator: CreatorItem) => void;
}

export default function CreatorProfileFullView({
  creator,
  onBack,
  onInvite,
  onToggleBookmark,
  onSelectCreator,
}: CreatorProfileFullViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.28 }}
      className="max-w-7xl mx-auto space-y-10 pb-20 pt-1"
    >
      {/* 1. Top Navigation & Header Row */}
      <ProfileHeader
        creator={creator}
        onBack={onBack}
        onInvite={onInvite}
        onToggleBookmark={onToggleBookmark}
      />

      {/* 2. Top 3-Photo Showcase Gallery Grid */}
      <ProfileGallery creator={creator} />

      {/* 3. Top Two-Column Split (Profile Info & Sticky Booking Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-2">
        {/* Left Column (~65-70%): Profile Info, Top Creator Badge, Bio */}
        <div className="lg:col-span-2">
          <ProfileMainInfo creator={creator} />
        </div>

        {/* Right Column (~30-35%): Sticky Pricing & Booking Card */}
        <div className="lg:col-span-1">
          <ProfileBookingCard creator={creator} onInvite={onInvite} />
        </div>
      </div>

      {/* 4. Full-Width Analytics Section (First) */}
      <div className="w-full">
        <ProfileAnalytics creator={creator} />
      </div>

      {/* 5. Full-Width Reviews Section (After Analytics) */}
      <div className="w-full">
        <ProfileReviews creator={creator} />
      </div>

      {/* 6. Full-Width Bottom Section: Similar Influencers & Related Categories */}
      <ProfileSimilarInfluencers
        creator={creator}
        onSelectCreator={onSelectCreator}
      />
    </motion.div>
  );
}
