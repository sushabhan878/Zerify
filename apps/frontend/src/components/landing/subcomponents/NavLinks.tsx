'use client';

import React from 'react';

export default function NavLinks() {
  return (
    <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
      <a href="#features" className="hover:text-white transition-colors duration-200">
        For Brands
      </a>
      <a href="#creators" className="hover:text-white transition-colors duration-200">
        For Influencers
      </a>
      <a href="#why-zerify" className="hover:text-white transition-colors duration-200">
        Why Zerify
      </a>
      <a href="#faq" className="hover:text-white transition-colors duration-200">
        FAQ
      </a>
    </nav>
  );
}
