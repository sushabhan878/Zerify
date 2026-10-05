'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { CreatorItem } from '../CreatorCard';

interface ProfileGalleryProps {
  creator: CreatorItem;
}

interface GalleryMediaItem {
  id: string;
  url: string;
  orientation: 'portrait' | 'landscape';
  caption?: string;
}

const DEFAULT_GALLERY_ITEMS: GalleryMediaItem[] = [
  {
    id: 'g1',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80',
    orientation: 'portrait',
    caption: 'Studio Editorial Look',
  },
  {
    id: 'g2',
    url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&auto=format&fit=crop&q=80',
    orientation: 'landscape',
    caption: 'Outdoor Lifestyle Campaign',
  },
  {
    id: 'g3',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&auto=format&fit=crop&q=80',
    orientation: 'portrait',
    caption: 'Summer Collection Showcase',
  },
  {
    id: 'g4',
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop&q=80',
    orientation: 'landscape',
    caption: 'Editorial Runway Styling',
  },
  {
    id: 'g5',
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&auto=format&fit=crop&q=80',
    orientation: 'portrait',
    caption: 'Night Glam Series',
  },
  {
    id: 'g6',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
    orientation: 'landscape',
    caption: 'Urban Architecture & Fashion',
  },
];

export default function ProfileGallery({ creator }: ProfileGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // If creator has an avatar, blend it into the gallery items
  const mediaItems: GalleryMediaItem[] = [
    ...(creator.avatarUrl
      ? [
          {
            id: 'creator_primary',
            url: creator.avatarUrl,
            orientation: 'portrait' as const,
            caption: `${creator.name} Featured Portrait`,
          },
        ]
      : []),
    ...DEFAULT_GALLERY_ITEMS,
  ];

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

      // Estimate active index based on scroll position
      const approxItemWidth = 340;
      const index = Math.round(scrollLeft / approxItemWidth);
      setActiveIndex(Math.min(mediaItems.length - 1, Math.max(0, index)));
    }
  };

  useEffect(() => {
    updateScrollState();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', updateScrollState, { passive: true });
      window.addEventListener('resize', updateScrollState);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', updateScrollState);
      }
      window.removeEventListener('resize', updateScrollState);
    };
  }, [mediaItems.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/gallery">
      {/* Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Slide left"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Slide right"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Media Count Badge at Top Right */}
      <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg pointer-events-none">
        <ImageIcon className="w-3.5 h-3.5 text-purple-300" />
        <span>
          {activeIndex + 1} / {mediaItems.length}
        </span>
      </div>

      {/* Slidable Single-Line Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2 pt-0.5 px-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {mediaItems.map((item, idx) => {
          const isLandscape = item.orientation === 'landscape';

          return (
            <div
              key={item.id || idx}
              className={`relative shrink-0 snap-start rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-xl group transition-all duration-300 ${
                isLandscape
                  ? 'w-[85vw] sm:w-[460px] md:w-[540px] lg:w-[620px]'
                  : 'w-[72vw] sm:w-[290px] md:w-[320px] lg:w-[360px]'
              } h-[340px] sm:h-[400px] lg:h-[460px]`}
            >
              <img
                src={item.url}
                alt={item.caption || `${creator.name} work ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                draggable={false}
              />

              {/* Ambient Bottom Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Optional Bottom Caption */}
              {item.caption && (
                <div className="absolute bottom-3.5 left-4 right-4 text-xs font-medium text-slate-200 truncate">
                  {item.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
