'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface DashboardContextType {
  user: any;
  userRole: 'BRAND' | 'INFLUENCER';
  userName: string;
  userEmail: string;
  userHandle: string;
  companyName: string;
  effectiveAvatarUrl?: string;
  effectiveIndustry?: string;
  brandProfile: any;
  influencerProfile: any;
  completionPercentage: number;
  loading: boolean;
  handleLogout: () => void;
  // Sidebar state
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isResizing: boolean;
  startResizing: (e: React.MouseEvent) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Sidebar Resizing State
  const [sidebarWidth, setSidebarWidth] = useState<number>(288);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 200), 450);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('zerify_token');
    localStorage.removeItem('zerify_user');
    document.cookie = 'zerify_token=; path=/; max-age=0; SameSite=Lax';
    window.dispatchEvent(new Event('zerify_auth_change'));
    router.push('/login');
  }, [router]);

  // Brand & Influencer Profile State
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [influencerProfile, setInfluencerProfile] = useState<any>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        let storedToken = localStorage.getItem('zerify_token') || localStorage.getItem('token');
        if (!storedToken) {
          const cookieMatch = document.cookie.match(/(?:^|;\s*)(?:zerify_token|token)=([^;]*)/);
          if (cookieMatch) {
            storedToken = decodeURIComponent(cookieMatch[1]);
            localStorage.setItem('zerify_token', storedToken);
          }
        }

        let storedUser = localStorage.getItem('zerify_user');
        if (!storedUser && storedToken) {
          try {
            const base64Url = storedToken.split('.')[1];
            if (base64Url) {
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              const decoded = JSON.parse(jsonPayload);
              const userObj = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role || 'BRAND',
              };
              storedUser = JSON.stringify(userObj);
              localStorage.setItem('zerify_user', storedUser);
            }
          } catch {}
        }

        if (!storedUser || !storedToken) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    window.addEventListener('zerify_auth_change', loadUser);
    return () => window.removeEventListener('zerify_auth_change', loadUser);
  }, [router]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const cachedBrand = typeof window !== 'undefined' ? localStorage.getItem('zerify_brand_profile_cache') : null;
      if (cachedBrand) {
        try {
          setBrandProfile(JSON.parse(cachedBrand));
        } catch (e) {}
      }

      const cachedInfluencer = typeof window !== 'undefined' ? localStorage.getItem('zerify_influencer_profile_cache') : null;
      if (cachedInfluencer) {
        try {
          setInfluencerProfile(JSON.parse(cachedInfluencer));
        } catch (e) {}
      }
    };

    handleProfileUpdate();

    const fetchProfiles = async () => {
      try {
        const token = localStorage.getItem('zerify_token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const headers = { Authorization: token ? `Bearer ${token}` : '' };

        // Fetch Brand Profile
        fetch(`${apiUrl}/brand/profile`, { headers })
          .then((res) => {
            if (res.status === 401) {
              handleLogout();
              return null;
            }
            return res.ok ? res.json() : null;
          })
          .then((data) => {
            if (data) {
              setBrandProfile(data);
              try {
                localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(data));
                if (data.currency) {
                  localStorage.setItem('zerify_preferred_currency', data.currency);
                  window.dispatchEvent(new Event('zerify_currency_change'));
                }
                window.dispatchEvent(new Event('zerify_brand_profile_update'));
              } catch (err) {}
            }
          })
          .catch(() => {});

        // Fetch Influencer Profile
        fetch(`${apiUrl}/influencer/profile`, { headers })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              setInfluencerProfile(data);
              try {
                localStorage.setItem('zerify_influencer_profile_cache', JSON.stringify(data));
                window.dispatchEvent(new Event('zerify_influencer_profile_update'));
              } catch (err) {}
            }
          })
          .catch(() => {});
      } catch (e) {}
    };

    fetchProfiles();
    window.addEventListener('zerify_brand_profile_update', handleProfileUpdate);
    window.addEventListener('zerify_influencer_profile_update', handleProfileUpdate);
    return () => {
      window.removeEventListener('zerify_brand_profile_update', handleProfileUpdate);
      window.removeEventListener('zerify_influencer_profile_update', handleProfileUpdate);
    };
  }, [handleLogout]);

  const userRole: 'BRAND' | 'INFLUENCER' = user?.role === 'BRAND' ? 'BRAND' : 'INFLUENCER';
  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userHandle = user?.handle || `@${userName.toLowerCase().replace(/\s+/g, '')}`;
  const companyName = user?.companyName || user?.name || 'Enterprise Partner';

  const effectiveAvatarUrl =
    user?.role === 'BRAND'
      ? brandProfile?.logoUrl || brandProfile?.avatarUrl || user?.avatarUrl
      : influencerProfile?.avatarUrl || influencerProfile?.user?.avatarUrl || user?.avatarUrl;

  const effectiveIndustry =
    user?.role === 'BRAND'
      ? brandProfile?.industry || 'Tech & Consumer AI'
      : influencerProfile?.primaryNiche || influencerProfile?.niches?.[0] || 'Content Creator';

  const completionPercentage =
    user?.role === 'BRAND'
      ? brandProfile?.completionPercentage !== undefined
        ? brandProfile.completionPercentage
        : 65
      : influencerProfile?.completionPercentage !== undefined
      ? influencerProfile.completionPercentage
      : 75;

  return (
    <DashboardContext.Provider
      value={{
        user,
        userRole,
        userName,
        userEmail: user?.email || '',
        userHandle,
        companyName,
        effectiveAvatarUrl,
        effectiveIndustry,
        brandProfile,
        influencerProfile,
        completionPercentage,
        loading,
        handleLogout,
        sidebarWidth,
        setSidebarWidth,
        isResizing,
        startResizing,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
