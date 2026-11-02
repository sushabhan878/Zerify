import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import TermsContent from '@/components/legal/TermsContent';

const title = 'Terms of Service — Zerify';
const description = 'Read the terms for using Zerify, including accounts, brand and creator collaborations, payments, and acceptable use.';
const url = 'https://zerify.in/terms-of-service';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: 'Zerify', type: 'website' },
};

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms that guide your use of Zerify and collaborations between brands, agencies, and creators."
      effectiveDate="November 2, 2026"
      currentPath="/terms-of-service"
    >
      <TermsContent />
    </LegalPage>
  );
}
