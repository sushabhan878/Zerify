'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function NavLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group" aria-label="Zerify Home">
      <div className="relative w-12 h-12 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
        <Image
          src="/logo.png"
          alt="Zerify Logo"
          width={48}
          height={48}
          className="object-contain w-full h-full"
        />
      </div>
    </Link>
  );
}
