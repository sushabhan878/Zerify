'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CompanyDetailView from '@/components/dashboard/influencer-views/company-discovery/CompanyDetailView';
import CompanyPitchModal from '@/components/dashboard/influencer-views/company-discovery/CompanyPitchModal';
import { CompanyItem } from '@/components/dashboard/influencer-views/company-discovery/CompanyCard';
import { slugify } from '@/utils/dashboardRoutes';
import { ArrowLeft, Building2 } from 'lucide-react';
import LottieLoader from '@/components/ui/LottieLoader';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = typeof params?.id === 'string' ? decodeURIComponent(params.id).toLowerCase() : '';

  const [company, setCompany] = useState<CompanyItem | null>(null);
  const [pitchCompany, setPitchCompany] = useState<CompanyItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCompany() {
      setIsLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('zerify_token') : null;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

        const res = await fetch(`${apiUrl}/brand/discovery`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        let list: any[] = [];
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            list = data;
          }
        }

        const matched = list.find((c) => {
          const cId = (c.id || '').toLowerCase();
          const cNameSlug = slugify(c.companyName || '');
          return (
            cId === idParam ||
            cNameSlug === idParam ||
            c.companyName?.toLowerCase() === idParam ||
            idParam.includes(cNameSlug)
          );
        });

        if (matched) {
          setCompany(matched);
        }
      } catch (err) {
        console.warn('Could not load company from API:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCompany();
  }, [idParam]);

  if (isLoading) {
    return (
      <div className="h-full min-h-[450px] flex items-center justify-center">
        <LottieLoader size={220} message="Loading company profile & partnership details..." />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-12 rounded-3xl bg-slate-900/60 border border-dashed border-white/10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center mx-auto">
          <Building2 className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-black text-white">Company Not Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The requested brand partner could not be located.
        </p>
        <button
          onClick={() => router.push('/dashboard/company-discovery')}
          type="button"
          className="px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shadow-purple-950/40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Company Discovery</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CompanyDetailView
        company={company}
        onBack={() => router.push('/dashboard/company-discovery')}
        onPitch={(c) => setPitchCompany(c)}
      />

      <CompanyPitchModal
        company={pitchCompany}
        onClose={() => setPitchCompany(null)}
        onSubmitPitch={(data) => {
          console.log('Submitted pitch data:', data);
        }}
      />
    </div>
  );
}
