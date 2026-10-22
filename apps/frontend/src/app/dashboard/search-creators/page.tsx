'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchCreatorsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/find-influencer');
  }, [router]);
  return null;
}
