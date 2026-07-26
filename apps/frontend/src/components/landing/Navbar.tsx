'use client';

import React, { useState, useEffect } from 'react';
import NavLogo from './subcomponents/NavLogo';
import NavLinks from './subcomponents/NavLinks';
import NavUserProfilePill from './subcomponents/NavUserProfilePill';
import NavAuthButtons from './subcomponents/NavAuthButtons';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const checkAuth = () => {
    try {
      const storedUser = localStorage.getItem('zerify_user');
      const storedToken = localStorage.getItem('zerify_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('zerify_auth_change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('zerify_auth_change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zerify_token');
    localStorage.removeItem('zerify_user');
    document.cookie = 'zerify_token=; path=/; max-age=0; SameSite=Lax';
    setUser(null);
    window.dispatchEvent(new Event('zerify_auth_change'));
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'Member';
  const avatarChar = userName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl transition-all duration-300">
      <div className="px-5 py-3 rounded-full bg-slate-950/75 border border-white/10 backdrop-blur-xl shadow-2xl shadow-purple-950/30 flex items-center justify-between">
        <NavLogo />
        <NavLinks />

        {mounted && user ? (
          <NavUserProfilePill
            userName={userName}
            avatarChar={avatarChar}
            onLogout={handleLogout}
          />
        ) : (
          <NavAuthButtons />
        )}
      </div>
    </header>
  );
}
