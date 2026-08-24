'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/subcomponents/DashboardSidebar';
import BrandDashboardView from '@/components/dashboard/BrandDashboardView';
import InfluencerDashboardView from '@/components/dashboard/InfluencerDashboardView';
import LottieLoader from '@/components/ui/LottieLoader';
import { Menu, X } from 'lucide-react';

import { ThemeProvider } from '@/context/ThemeContext';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Sidebar Resizing State
  const [sidebarWidth, setSidebarWidth] = useState<number>(288); // Default 288px (w-72)
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Clamp sidebar width between 200px and 450px
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

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('zerify_user');
        const storedToken = localStorage.getItem('zerify_token');

        if (!storedUser || !storedToken) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setActiveRoute((currentRoute) =>
          currentRoute || (parsedUser.role === 'BRAND' ? 'overview' : 'profile-overview')
        );
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

  const handleLogout = () => {
    localStorage.removeItem('zerify_token');
    localStorage.removeItem('zerify_user');
    document.cookie = 'zerify_token=; path=/; max-age=0; SameSite=Lax';
    window.dispatchEvent(new Event('zerify_auth_change'));
    router.push('/login');
  };

  // Brand & Influencer Profile State & Hydration
  const [brandProfile, setBrandProfile] = useState<any>(null);
  const [influencerProfile, setInfluencerProfile] = useState<any>(null);

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
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) {
              setBrandProfile(data);
              try {
                localStorage.setItem('zerify_brand_profile_cache', JSON.stringify(data));
              } catch (err) {}
            }
          })
          .catch(() => {});

        // Fetch Influencer Profile and Social Accounts
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

        // Prefetch Social Accounts
        fetch(`${apiUrl}/social/accounts`, { headers })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && Array.isArray(data.data)) {
              try {
                localStorage.setItem('zerify_social_accounts_cache', JSON.stringify(data.data));
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
  }, []);

  const completionPercentage =
    user?.role === 'BRAND'
      ? brandProfile?.completionPercentage !== undefined
        ? brandProfile.completionPercentage
        : 65
      : influencerProfile?.completionPercentage !== undefined
      ? influencerProfile.completionPercentage
      : 75;

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#07090E] dark:bg-[#07090E] light:bg-slate-50 flex flex-col items-center justify-center text-white">
        <LottieLoader size={220} message="Loading Zerify Dashboard..." />
      </div>
    );
  }

  if (!user) return null;

  const userRole: 'BRAND' | 'INFLUENCER' = user.role === 'BRAND' ? 'BRAND' : 'INFLUENCER';
  const userName = user.name || user.email?.split('@')[0] || 'User';
  const userHandle = user.handle || `@${userName.toLowerCase().replace(/\s+/g, '')}`;
  const companyName = user.companyName || user.name || 'Enterprise Partner';

  return (
    <ThemeProvider>
      <div
        className={`h-screen w-screen bg-[#07090E] text-slate-100 flex flex-col md:flex-row overflow-hidden selection:bg-purple-500 selection:text-white ${
          isResizing ? 'select-none cursor-col-resize' : ''
        }`}
      >
        {/* Mobile Top Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-white/10 shrink-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden relative">
              <Image src="/logo.png" alt="Zerify Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-sm font-black text-white tracking-tight">Zerify</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Left Sidebar Navigation - Desktop Independent Scroll Container with Resizable Width */}
        <DashboardSidebar
          userRole={userRole}
          userName={userName}
          userEmail={user.email}
          userHandle={userHandle}
          companyName={companyName}
          avatarUrl={user.avatarUrl}
          onLogout={handleLogout}
          activeRoute={activeRoute}
          onSelectRoute={(route) => {
            setActiveRoute(route);
            setIsMobileMenuOpen(false);
          }}
          style={{ width: `${sidebarWidth}px` }}
          completionPercentage={completionPercentage}
        />

        {/* Resizable Divider Handle (Desktop) */}
        <div
          onMouseDown={startResizing}
          className="hidden md:flex w-2 hover:w-2.5 bg-slate-950/40 hover:bg-purple-500/30 cursor-col-resize items-center justify-center transition-all shrink-0 z-20 group relative border-r border-white/5"
          title="Click & drag to resize sidebar width"
        >
          <div className="w-[3px] h-10 rounded-full bg-slate-700/60 group-hover:bg-purple-400 transition-colors" />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 h-full bg-slate-950 border-r border-white/10 flex flex-col">
              <DashboardSidebar
                userRole={userRole}
                userName={userName}
                userEmail={user.email}
                userHandle={userHandle}
                companyName={companyName}
                avatarUrl={user.avatarUrl}
                onLogout={handleLogout}
                activeRoute={activeRoute}
                onSelectRoute={(route) => {
                  setActiveRoute(route);
                  setIsMobileMenuOpen(false);
                }}
                isMobileDrawer
                completionPercentage={completionPercentage}
              />
            </div>
          </div>
        )}

        {/* Main Content View - Right Independent Scroll Container with Purplish Grid Background */}
        <div className="relative flex-1 h-full overflow-hidden bg-[#07090E] bg-gradient-to-b from-purple-950/25 via-[#07090E] to-[#05060a]">
          {/* Right-Side Purple Glow Spotlights */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Prominent High-Tech Grid Pattern Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.12)_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />

          <main className="relative z-10 h-full overflow-y-auto no-scrollbar p-4 sm:p-8 md:p-10 max-w-7xl mx-auto">
            {userRole === 'BRAND' ? (
              <BrandDashboardView
                userName={userName}
                userEmail={user.email}
                userHandle={userHandle}
                companyName={companyName}
                avatarUrl={user.avatarUrl}
                activeRoute={activeRoute}
                onSelectRoute={(route) => setActiveRoute(route)}
                completionPercentage={completionPercentage}
                brandProfile={brandProfile}
              />
            ) : (
              <InfluencerDashboardView
                userName={userName}
                userEmail={user.email}
                userHandle={userHandle}
                avatarUrl={user.avatarUrl}
                activeRoute={activeRoute}
                onSelectRoute={(route) => setActiveRoute(route)}
                completionPercentage={completionPercentage}
                influencerProfile={influencerProfile}
              />
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

