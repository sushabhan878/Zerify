'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/subcomponents/DashboardSidebar';
import LottieLoader from '@/components/ui/LottieLoader';
import { Menu, X } from 'lucide-react';
import { ThemeProvider } from '@/context/ThemeContext';
import { MessagingProvider } from '@/context/MessagingContext';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import { getRoutePath, getActiveRouteFromPathname } from '@/utils/dashboardRoutes';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    userRole,
    userName,
    userEmail,
    userHandle,
    companyName,
    effectiveAvatarUrl,
    effectiveIndustry,
    completionPercentage,
    loading,
    handleLogout,
    sidebarWidth,
    isResizing,
    startResizing,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useDashboard();

  const activeRoute = getActiveRouteFromPathname(pathname, userRole);

  const handleSelectRoute = (routeId: string) => {
    setIsMobileMenuOpen(false);
    const targetPath = getRoutePath(routeId);
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#07090E] dark:bg-[#07090E] light:bg-slate-50 flex flex-col items-center justify-center text-white">
        <LottieLoader size={220} message="Loading Zerify Dashboard..." />
      </div>
    );
  }

  if (!user) return null;

  const isMessagesPage = pathname.includes('/messages');

  return (
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
        userEmail={userEmail}
        userHandle={userHandle}
        companyName={companyName}
        industry={effectiveIndustry}
        avatarUrl={effectiveAvatarUrl}
        onLogout={handleLogout}
        activeRoute={activeRoute}
        onSelectRoute={handleSelectRoute}
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
              userEmail={userEmail}
              userHandle={userHandle}
              companyName={companyName}
              industry={effectiveIndustry}
              avatarUrl={effectiveAvatarUrl}
              onLogout={handleLogout}
              activeRoute={activeRoute}
              onSelectRoute={handleSelectRoute}
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

        <main
          className={`relative z-10 h-full no-scrollbar ${
            isMessagesPage
              ? 'p-2 sm:p-4 md:p-5 max-w-[1800px] w-full mx-auto flex flex-col overflow-hidden'
              : 'overflow-y-auto p-4 sm:p-8 md:p-10 max-w-7xl mx-auto'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MessagingProvider>
        <DashboardProvider>
          <Suspense
            fallback={
              <div className="h-screen w-screen bg-[#07090E] flex flex-col items-center justify-center text-white">
                <LottieLoader size={220} message="Loading Zerify Dashboard..." />
              </div>
            }
          >
            <DashboardShell>{children}</DashboardShell>
          </Suspense>
        </DashboardProvider>
      </MessagingProvider>
    </ThemeProvider>
  );
}
