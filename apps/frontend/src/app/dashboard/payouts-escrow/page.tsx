'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PayoutsEscrowRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/payouts');
  }, [router]);
  return null;
}
