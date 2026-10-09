'use client';

import React, { useState, useMemo } from 'react';
import { Info, MapPin } from 'lucide-react';

export interface DemographicRecord {
  type: string;
  key: string;
  label?: string | null;
  value: number;
  percentage?: number | null;
  socialAccountId?: string;
}

export interface SocialAccountItem {
  id?: string;
  platform: string;
  handle?: string;
  username?: string;
  followerCount?: number;
  subscribers?: number;
  connections?: number;
  engagementRate?: number;
  isVerified?: boolean;
  audienceGenders?: Array<{
    gender?: string;
    label?: string;
    percentage?: number;
    count?: number;
  }>;
  audienceAgeGroups?: Array<{
    ageRange?: string;
    label?: string;
    percentage?: number;
    count?: number;
  }>;
  audienceCountries?: Array<{
    countryCode?: string;
    countryName?: string;
    percentage?: number;
    count?: number;
  }>;
  audienceCities?: Array<{
    countryCode?: string;
    cityName?: string;
    percentage?: number;
    count?: number;
  }>;
  performance?: Array<{
    views?: number;
    impressions?: number;
    reach?: number;
  }>;
  contents?: Array<{
    playCount?: number;
    views?: number;
    impressions?: number;
    reach?: number;
  }>;
}

interface AudienceDemographicsCardProps {
  demographics?: DemographicRecord[];
  accounts?: SocialAccountItem[];
  defaultPlatform?: string;
  isLoading?: boolean;
}

const SOCIAL_LOGOS: Record<string, string> = {
  youtube: '/social/youtube.png',
  instagram: '/social/instagram.png',
  twitter: '/social/twitter.png',
  x: '/social/twitter.png',
  linkedin: '/social/linkedin.png',
  facebook: '/social/facebook.png',
  threads: '/social/threads.png',
  tiktok: '/social/tik-tok.png',
};

function getSocialLogo(platformName: string): string | null {
  const p = platformName.toLowerCase().trim();
  if (p.includes('youtube')) return SOCIAL_LOGOS.youtube;
  if (p.includes('instagram')) return SOCIAL_LOGOS.instagram;
  if (p.includes('twitter') || p === 'x' || p.includes(' x')) return SOCIAL_LOGOS.twitter;
  if (p.includes('linkedin')) return SOCIAL_LOGOS.linkedin;
  if (p.includes('facebook')) return SOCIAL_LOGOS.facebook;
  if (p.includes('threads')) return SOCIAL_LOGOS.threads;
  if (p.includes('tiktok') || p.includes('tik-tok') || p.includes('tik tok')) return SOCIAL_LOGOS.tiktok;
  return null;
}

function getMetricTerm(platformName: string): string {
  const p = platformName.toLowerCase().trim();
  if (p.includes('youtube')) return 'Subscribers';
  if (p.includes('linkedin')) return 'Connections';
  return 'Followers';
}

function formatSocialCount(count: number | undefined | null): string {
  if (count === undefined || count === null || isNaN(count)) return '0';
  if (count >= 1_000_000) {
    const val = (count / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${val}M`;
  }
  if (count >= 1_000) {
    const val = (count / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${val}K`;
  }
  return count.toLocaleString();
}

function formatMaxOneDecimal(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  const rounded = Math.round(val * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function AudienceDemographicsCard({
  demographics = [],
  accounts = [],
  defaultPlatform = 'linkedin',
  isLoading = false,
}: AudienceDemographicsCardProps) {
  const platforms = ['linkedin', 'instagram', 'threads', 'twitter', 'facebook', 'youtube'];
  const [activePlatform, setActivePlatform] = useState<string>(defaultPlatform);

  // Match connected account from database
  const currentAccount = useMemo(() => {
    return (
      accounts.find((a) => {
        const p = (a.platform || '').toLowerCase().trim();
        const active = activePlatform.toLowerCase().trim();
        if (active === 'twitter' || active === 'x') {
          return p === 'twitter' || p === 'x';
        }
        return p === active;
      }) || null
    );
  }, [accounts, activePlatform]);

  // 1. Follower count strictly from DB
  const followerDisplay = useMemo(() => {
    if (currentAccount) {
      const c =
        currentAccount.connections ??
        currentAccount.followerCount ??
        currentAccount.subscribers;
      if (typeof c === 'number') return formatSocialCount(c);
    }
    return '0';
  }, [currentAccount]);

  // 2. Average Views strictly from DB performances & contents
  const avgViews = useMemo(() => {
    if (currentAccount?.performance && currentAccount.performance.length > 0) {
      const viewsList = currentAccount.performance
        .map((p) => p.views || p.impressions || p.reach || 0)
        .filter((v) => v > 0);
      if (viewsList.length > 0) {
        const sum = viewsList.reduce((a, b) => a + b, 0);
        return formatSocialCount(Math.round(sum / viewsList.length));
      }
    }

    if (currentAccount?.contents && currentAccount.contents.length > 0) {
      const contentViews = currentAccount.contents
        .map((c) => c.playCount || c.views || c.impressions || c.reach || 0)
        .filter((v) => v > 0);
      if (contentViews.length > 0) {
        const sum = contentViews.reduce((a, b) => a + b, 0);
        return formatSocialCount(Math.round(sum / contentViews.length));
      }
    }

    return '0';
  }, [currentAccount]);

  // 3. Engagement Rate strictly from DB
  const engagement = useMemo(() => {
    if (currentAccount?.engagementRate !== undefined && currentAccount?.engagementRate !== null) {
      return `${formatMaxOneDecimal(currentAccount.engagementRate)}%`;
    }
    return '0.0%';
  }, [currentAccount]);

  // 4. Audience Location strictly from DB
  const locationItems = useMemo(() => {
    let countries: Array<{ countryCode?: string; countryName?: string; percentage?: number }> =
      currentAccount?.audienceCountries || [];
    let allCities: Array<{ countryCode?: string; cityName?: string; percentage?: number }> =
      currentAccount?.audienceCities || [];

    // Fallback to demographics array if not nested directly on account object
    if (countries.length === 0 && demographics.length > 0) {
      const matchedDemos = currentAccount?.id
        ? demographics.filter((d) => d.socialAccountId === currentAccount.id)
        : demographics;

      countries = matchedDemos
        .filter((d) => d.type === 'COUNTRY')
        .map((d) => ({
          countryCode: d.key,
          countryName: d.label || d.key,
          percentage: d.percentage ?? d.value,
        }));

      allCities = matchedDemos
        .filter((d) => d.type === 'CITY')
        .map((d) => ({
          countryCode: undefined,
          cityName: d.label || d.key,
          percentage: d.percentage ?? d.value,
        }));
    }

    if (countries.length === 0) {
      return [];
    }

    return [...countries]
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
      .slice(0, 7)
      .map((c) => {
        const cCode = c.countryCode?.toUpperCase();
        const cName = c.countryName || 'Unknown';

        const matchedCities = allCities.filter((city) => {
          if (cCode && city.countryCode && city.countryCode.toUpperCase() === cCode) return true;
          if (cName && city.cityName && city.cityName.toLowerCase().includes(cName.toLowerCase())) return true;
          return false;
        });

        const sortedCities = matchedCities
          .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
          .slice(0, 6)
          .map((city) => ({
            name: city.cityName || 'City',
            pct: formatMaxOneDecimal(city.percentage),
          }));

        return {
          countryName: cName,
          pct: formatMaxOneDecimal(c.percentage),
          cities: sortedCities,
        };
      });
  }, [currentAccount, demographics]);

  // 5. Audience Age strictly from DB
  const ageItems = useMemo(() => {
    let rawAges: Array<{ ageRange?: string; label?: string; percentage?: number }> =
      currentAccount?.audienceAgeGroups || [];

    if (rawAges.length === 0 && demographics.length > 0) {
      const matchedDemos = currentAccount?.id
        ? demographics.filter((d) => d.socialAccountId === currentAccount.id)
        : demographics;

      rawAges = matchedDemos
        .filter((d) => d.type === 'AGE_GENDER' && /\d/.test(d.key || ''))
        .map((d) => ({
          ageRange: d.key,
          label: d.label || d.key,
          percentage: d.percentage ?? d.value,
        }));
    }

    let pct13_17 = 0;
    let pct18_24 = 0;
    let pct25_34 = 0;
    let pct35_44 = 0;
    let pct45_54 = 0;
    let pct55_plus = 0;

    for (const item of rawAges) {
      const range = (item.ageRange || item.label || '').toLowerCase().trim();
      const p = typeof item.percentage === 'number' ? item.percentage : 0;

      if (range.includes('13') || range.includes('17')) pct13_17 += p;
      else if (range.includes('18') || range.includes('24')) pct18_24 += p;
      else if (range.includes('25') || range.includes('34')) pct25_34 += p;
      else if (range.includes('35') || range.includes('44')) pct35_44 += p;
      else if (range.includes('45') || range.includes('54')) pct45_54 += p;
      else if (range.includes('55') || range.includes('+') || range.includes('65')) pct55_plus += p;
    }

    return [
      { range: '13-17', pct: Number(pct13_17.toFixed(1)), displayPct: formatMaxOneDecimal(pct13_17) },
      { range: '18-24', pct: Number(pct18_24.toFixed(1)), displayPct: formatMaxOneDecimal(pct18_24) },
      { range: '25-34', pct: Number(pct25_34.toFixed(1)), displayPct: formatMaxOneDecimal(pct25_34) },
      { range: '35-44', pct: Number(pct35_44.toFixed(1)), displayPct: formatMaxOneDecimal(pct35_44) },
      { range: '45-54', pct: Number(pct45_54.toFixed(1)), displayPct: formatMaxOneDecimal(pct45_54) },
      { range: '55+', pct: Number(pct55_plus.toFixed(1)), displayPct: formatMaxOneDecimal(pct55_plus) },
    ];
  }, [currentAccount, demographics]);

  const hasAgeData = useMemo(() => ageItems.some((a) => a.pct > 0), [ageItems]);

  // 6. Audience Gender strictly from DB
  const genderData = useMemo(() => {
    let rawGenders: Array<{ gender?: string; label?: string; percentage?: number }> =
      currentAccount?.audienceGenders || [];

    if (rawGenders.length === 0 && demographics.length > 0) {
      const matchedDemos = currentAccount?.id
        ? demographics.filter((d) => d.socialAccountId === currentAccount.id)
        : demographics;

      rawGenders = matchedDemos
        .filter((d) => d.type === 'AGE_GENDER' && !/\d/.test(d.key || ''))
        .map((d) => ({
          gender: d.key,
          label: d.label || d.key,
          percentage: d.percentage ?? d.value,
        }));
    }

    if (rawGenders.length > 0) {
      const maleItem = rawGenders.find(
        (g) => g.gender === 'M' || g.gender === 'MALE' || g.label?.toLowerCase() === 'male'
      );
      const femaleItem = rawGenders.find(
        (g) => g.gender === 'F' || g.gender === 'FEMALE' || g.label?.toLowerCase() === 'female'
      );
      const unspecItem = rawGenders.find(
        (g) =>
          g.gender === 'U' ||
          g.gender === 'UNSPECIFIED' ||
          g.label?.toLowerCase() === 'unspecified' ||
          g.label?.toLowerCase() === 'other'
      );

      const malePct = maleItem ? Number((maleItem.percentage || 0).toFixed(1)) : 0;
      const femalePct = femaleItem ? Number((femaleItem.percentage || 0).toFixed(1)) : 0;
      const unspecifiedPct = unspecItem
        ? Number((unspecItem.percentage || 0).toFixed(1))
        : Number(Math.max(0, 100 - (malePct + femalePct)).toFixed(1));

      const hasData = malePct > 0 || femalePct > 0 || unspecifiedPct > 0;
      return { malePct, femalePct, unspecifiedPct, hasData };
    }

    return { malePct: 0, femalePct: 0, unspecifiedPct: 0, hasData: false };
  }, [currentAccount, demographics]);

  // Donut Chart Geometry (Radius 52, Circumference = 2 * PI * 52 = 326.726)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const totalPct =
    genderData.malePct + genderData.femalePct + genderData.unspecifiedPct || 100;
  const femaleStrokeDash = (genderData.femalePct / totalPct) * circumference;
  const maleStrokeDash = (genderData.malePct / totalPct) * circumference;
  const unspecStrokeDash = (genderData.unspecifiedPct / totalPct) * circumference;

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-950/45 border border-white/10 backdrop-blur-xl shadow-xl space-y-8">
      {/* Background subtle ambient grid/glow */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none opacity-20" />

      {/* 1. Header & Platform Tabs */}
      <div className="space-y-4 relative z-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Analytics
        </h2>

        {/* Platform selection tabs */}
        <div className="flex items-center gap-6 sm:gap-8 border-b border-white/10 overflow-x-auto no-scrollbar pt-1">
          {platforms.map((plat) => {
            const isActive = activePlatform === plat;
            const logo = getSocialLogo(plat);
            const isConnected = accounts.some((a) => {
              const p = (a.platform || '').toLowerCase().trim();
              if (plat === 'twitter' || plat === 'x') return p === 'twitter' || p === 'x';
              return p === plat;
            });

            return (
              <button
                key={plat}
                type="button"
                onClick={() => setActivePlatform(plat)}
                className={`pb-3 text-sm sm:text-base font-bold flex items-center gap-2 transition-all relative shrink-0 cursor-pointer ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {logo ? (
                  <img src={logo} alt={plat} className="w-4 h-4 object-contain" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-purple-600/30 text-[10px] flex items-center justify-center font-bold text-purple-300">
                    {plat.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>
                  {plat === 'twitter' ? 'X / twitter' : plat === 'linkedin' ? 'Linkedin' : capitalize(plat)}
                </span>
                {isConnected && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"
                    title="Connected Account"
                  />
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top 3 KPI Stats */}
      <div className="grid grid-cols-3 gap-6 max-w-lg relative z-10">
        <div>
          {isLoading ? (
            <div className="h-8 w-20 bg-white/15 rounded animate-pulse mb-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {followerDisplay}
            </div>
          )}
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            {getMetricTerm(activePlatform)}
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="h-8 w-20 bg-white/15 rounded animate-pulse mb-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {avgViews}
            </div>
          )}
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Average Views
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="h-8 w-20 bg-white/15 rounded animate-pulse mb-1" />
          ) : (
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>{engagement}</span>
              <Info className="w-4 h-4 text-slate-400 cursor-help" />
            </div>
          )}
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Engagement Rate
          </div>
        </div>
      </div>

      {/* 3. Demographics Section: Location, Age, Gender */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start pt-2 relative z-10">
        {/* 1. Audience Location: Countries first, hover to reveal cities */}
        <div className="space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <span>Audience Location</span>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          </h3>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : locationItems.length > 0 ? (
            <div className="space-y-2.5">
              {locationItems.map((item, idx) => (
                <div
                  key={item.countryName}
                  className="relative group flex items-center justify-between text-xs sm:text-sm py-1 px-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-slate-300 font-medium truncate group-hover:text-white transition-colors">
                      {item.countryName}
                    </span>
                  </div>
                  <span className="font-bold text-white shrink-0">{item.pct}%</span>

                  {/* Hover Popover showing top cities in this country */}
                  <div
                    className={`pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 transition-all duration-200 absolute z-50 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-purple-950/40 rounded-xl p-3.5 ${
                      idx < 3 ? 'left-0 top-full mt-1.5' : 'left-0 bottom-full mb-1.5'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">Top Cities in {item.countryName}</span>
                      </div>
                      <span className="text-[11px] font-black text-purple-300 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        {item.pct}%
                      </span>
                    </div>

                    {item.cities && item.cities.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Top Cities
                        </div>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-none">
                          {item.cities.map((city) => (
                            <div key={city.name} className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-medium truncate pr-2" title={city.name}>
                                {city.name}
                              </span>
                              <span className="font-bold text-white shrink-0">{city.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 py-1 font-medium">
                        Nationwide audience (no regional city records)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1.5">
              <MapPin className="w-5 h-5 text-slate-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">
                {currentAccount ? 'No country demographics recorded' : 'Account not connected'}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentAccount
                  ? 'Audience location metrics will sync with your platform analytics.'
                  : `Connect your ${capitalize(activePlatform)} account to sync locations.`}
              </div>
            </div>
          )}
        </div>

        {/* 2. Audience Age: strictly 13-17, 18-24, 25-34, 35-44, 45-54, 55+ */}
        <div className="space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <span>Audience Age</span>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3.5 w-16 bg-white/10 rounded animate-pulse" />
                  <div className="h-1.5 w-full bg-white/5 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          ) : hasAgeData ? (
            <div className="space-y-3">
              {ageItems.map((item) => (
                <div key={item.range} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-300 font-medium">{item.range}</span>
                    <span className="font-bold text-white">{item.displayPct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.pct))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1.5">
              <Info className="w-5 h-5 text-slate-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">
                {currentAccount ? 'No age breakdown recorded' : 'Account not connected'}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentAccount
                  ? 'Audience age brackets will sync with your platform analytics.'
                  : `Connect your ${capitalize(activePlatform)} account to sync age.`}
              </div>
            </div>
          )}
        </div>

        {/* 3. Audience Gender: Donut Chart on top, Male, Female, Unspecified below */}
        <div className="space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
            <span>Audience Gender</span>
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          </h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center pt-2 space-y-4">
              <div className="w-32 h-32 rounded-full border-8 border-white/10 animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ) : genderData.hasData ? (
            <div className="flex flex-col items-center justify-center pt-2">
              {/* SVG Donut Chart */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="16"
                  />
                  {/* Female Slice (Pink) */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#ec4899"
                    strokeWidth="16"
                    strokeDasharray={`${femaleStrokeDash} ${circumference}`}
                    strokeDashoffset="0"
                    className="transition-all duration-700"
                  />
                  {/* Male Slice (Blue) */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeDasharray={`${maleStrokeDash} ${circumference}`}
                    strokeDashoffset={-femaleStrokeDash}
                    className="transition-all duration-700"
                  />
                  {/* Unspecified Slice (Purple/Violet) */}
                  {genderData.unspecifiedPct > 0 && (
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke="#8b5cf6"
                      strokeWidth="16"
                      strokeDasharray={`${unspecStrokeDash} ${circumference}`}
                      strokeDashoffset={-(femaleStrokeDash + maleStrokeDash)}
                      className="transition-all duration-700"
                    />
                  )}
                </svg>
              </div>

              {/* Percentages shown below the donut chart */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-5 w-full">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-500/50" />
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">Male</span>
                  <span className="text-xs sm:text-sm font-black text-white">
                    {formatMaxOneDecimal(genderData.malePct)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 shrink-0 shadow-sm shadow-pink-500/50" />
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">Female</span>
                  <span className="text-xs sm:text-sm font-black text-white">
                    {formatMaxOneDecimal(genderData.femalePct)}%
                  </span>
                </div>
                {genderData.unspecifiedPct > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0 shadow-sm shadow-purple-500/50" />
                    <span className="text-xs sm:text-sm text-slate-300 font-medium">Unspecified</span>
                    <span className="text-xs sm:text-sm font-black text-white">
                      {formatMaxOneDecimal(genderData.unspecifiedPct)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-1.5">
              <Info className="w-5 h-5 text-slate-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-300">
                {currentAccount ? 'No gender breakdown recorded' : 'Account not connected'}
              </div>
              <div className="text-[11px] text-slate-500">
                {currentAccount
                  ? 'Audience gender splits will sync with your platform analytics.'
                  : `Connect your ${capitalize(activePlatform)} account to sync gender.`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
