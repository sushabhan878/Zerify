'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/subcomponents/DashboardSidebar';
import BrandDashboardView from '@/components/dashboard/BrandDashboardView';
import InfluencerDashboardView from '@/components/dashboard/InfluencerDashboardView';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string>('');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('zerify_user');
      const storedToken = localStorage.getItem('zerify_token');

      if (!storedUser || !storedToken) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setActiveRoute(parsedUser.role === 'BRAND' ? 'search-creators' : 'profile-overview');
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('zerify_token');
    localStorage.removeItem('zerify_user');
    document.cookie = 'zerify_token=; path=/; max-age=0; SameSite=Lax';
    window.dispatchEvent(new Event('zerify_auth_change'));
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
        <span className="text-xs text-slate-400 font-semibold">Loading Dashboard...</span>
      </div>
    );
  }

  if (!user) return null;

  const userRole: 'BRAND' | 'INFLUENCER' = user.role === 'BRAND' ? 'BRAND' : 'INFLUENCER';
  const userName = user.name || user.email?.split('@')[0] || 'User';
  const userHandle = user.handle || `@${userName.toLowerCase().replace(/\s+/g, '')}`;
  const companyName = user.companyName || user.name || 'Apex Gear Inc';

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        userRole={userRole}
        userName={userName}
        userEmail={user.email}
        userHandle={userHandle}
        companyName={companyName}
        onLogout={handleLogout}
        activeRoute={activeRoute}
        onSelectRoute={setActiveRoute}
      />

      {/* Main Content View */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">
        {userRole === 'BRAND' ? (
          <BrandDashboardView userName={userName} activeRoute={activeRoute} />
        ) : (
          <InfluencerDashboardView userName={userName} activeRoute={activeRoute} />
        )}
      </main>
    </div>
  );
}
