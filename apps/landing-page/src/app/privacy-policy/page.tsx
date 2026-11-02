import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import PrivacyInformation from '@/components/legal/PrivacyInformation';
import PrivacyRights from '@/components/legal/PrivacyRights';

const title = 'Privacy Policy — Zerify';
const description = 'Understand how Zerify collects, uses, and protects your personal data when using our direct brand & creator collaboration platform.';
const url = 'https://zerify.in/privacy-policy';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: 'Zerify', type: 'website' },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="We respect your privacy and are committed to safeguarding your personal data across our brand & creator collaboration ecosystem."
      effectiveDate="July 28, 2026"
      currentPath="/privacy-policy"
    >
      <PrivacyInformation />
      <PrivacyRights />
    </LegalPage>
  );
}
