import type { ReactNode } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

const sections: { id: string; title: string; content: ReactNode }[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of These Terms',
    content: <p>These Terms of Service govern your access to and use of Zerify, including our website and collaboration platform. By using Zerify, you agree to these terms. If you use Zerify on behalf of a brand, agency, or other organization, you confirm that you are authorized to accept these terms on its behalf.</p>,
  },
  {
    id: 'accounts',
    title: 'Eligibility & Account Responsibilities',
    content: <>
      <p>You must be legally able to enter into a binding agreement to use Zerify. Provide accurate registration information and keep your profile and contact details up to date.</p>
      <p>You are responsible for safeguarding your login credentials and for activity under your account. Do not share another person&apos;s credentials or misrepresent your identity, organization, audience, or social media performance. Contact us if you suspect unauthorized access.</p>
    </>,
  },
  {
    id: 'services',
    title: 'Our Platform',
    content: <>
      <p>Zerify helps brands, agencies, and creators discover each other, discuss briefs, manage collaborations, and track campaign activity. Features and access may vary depending on availability and the services you select.</p>
      <p>Unless expressly agreed in writing, Zerify is not a party to agreements between brands and creators and does not guarantee a particular collaboration, campaign result, audience reach, or earnings. Joining a waitlist does not guarantee access or a launch date.</p>
    </>,
  },
  {
    id: 'collaborations',
    title: 'Campaigns & Collaborations',
    content: <>
      <p>Before starting a collaboration, participants should agree on the scope, deliverables, deadlines, revisions, compensation, approvals, cancellation conditions, and content usage rights. Each participant is responsible for meeting the obligations they accept.</p>
      <p>Brands must provide accurate briefs and have permission to share their materials. Creators must provide authentic work and accurate performance information. Both parties are responsible for applicable advertising disclosures, platform rules, and permissions for any content they publish.</p>
    </>,
  },
  {
    id: 'payments',
    title: 'Fees, Payments & Cancellations',
    content: <>
      <p>Any platform fees, campaign charges, payment schedules, and applicable taxes will be presented with the relevant service or agreement. Review those details before authorizing a payment or accepting a collaboration. You are responsible for providing accurate billing and payout information and for your own tax obligations.</p>
      <p>Payment processing may be provided by third-party providers under their own terms. Refunds, cancellations, and payment disputes are handled according to the terms disclosed for the relevant transaction or collaboration and applicable law. Contact us with the transaction details if you need assistance.</p>
    </>,
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    content: <>
      <p>Use Zerify lawfully and respectfully. You must not:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>Post unlawful, fraudulent, abusive, discriminatory, or infringing content.</li>
        <li>Impersonate others, submit fake engagement metrics, or manipulate campaign activity.</li>
        <li>Send spam, harass other users, or collect their personal information without permission.</li>
        <li>Attempt unauthorized access, distribute malicious software, or interfere with the platform.</li>
        <li>Copy or extract platform data through unauthorized automated access.</li>
      </ul>
    </>,
  },
  {
    id: 'intellectual-property',
    title: 'Content & Intellectual Property',
    content: <>
      <p>You retain ownership of the content you submit and confirm that you have the rights needed to share it. You grant Zerify permission to host, store, and display that content as needed to operate the platform and provide the services you request.</p>
      <p>Rights to campaign content, including advertising use, editing, exclusivity, and licensing periods, must be agreed between the relevant participants. Zerify&apos;s branding, software, and platform design remain the property of Zerify or its licensors and may not be used without permission except as permitted by law.</p>
    </>,
  },
  {
    id: 'privacy-and-third-parties',
    title: 'Privacy & Third-Party Services',
    content: <>
      <p>Our <Link href="/privacy-policy" className="text-purple-300 underline hover:text-purple-200">Privacy Policy</Link> explains how we collect, use, and protect personal information.</p>
      <p>When you connect a social account or use a third-party service, its terms and privacy practices also apply. Only connect accounts you are authorized to manage. Third-party availability, permissions, and metrics may change, which can affect connected features.</p>
    </>,
  },
  {
    id: 'availability-and-liability',
    title: 'Service Availability & Liability',
    content: <>
      <p>We work to maintain a reliable service, but Zerify may be interrupted, changed, or unavailable because of maintenance, technical issues, or third-party services. To the extent permitted by applicable law, the service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without a guarantee of uninterrupted or error-free operation.</p>
      <p>To the extent permitted by applicable law, Zerify is not responsible for indirect or consequential losses, lost profits, or disputes arising from agreements between users. Nothing in these terms excludes liability or consumer rights that cannot lawfully be excluded.</p>
    </>,
  },
  {
    id: 'suspension-and-termination',
    title: 'Suspension & Termination',
    content: <>
      <p>We may restrict or suspend access when an account violates these terms, presents a security risk, or must be restricted to comply with law. You may stop using the service and contact us to request account closure.</p>
      <p>Closing an account does not remove payment obligations or collaboration commitments already incurred. Data retention and deletion are described in our Privacy Policy.</p>
    </>,
  },
  {
    id: 'changes-to-terms',
    title: 'Changes to These Terms',
    content: <p>We may update these terms as the platform develops. Updated terms will be posted on this page with a revised effective date, and we will provide any notice required by applicable law. Your continued use after an update takes effect means you accept the updated terms.</p>,
  },
  {
    id: 'contact-us',
    title: 'Contact Us',
    content: <p>For questions about these terms, collaborations, or your account, email <a href="mailto:info@zerify.in" className="text-purple-300 underline hover:text-purple-200">info@zerify.in</a> or call <a href="tel:+919732550799" className="text-purple-300 underline hover:text-purple-200">+91 9732550799</a>.</p>,
  },
];

export default function TermsContent() {
  return sections.map(({ id, title, content }, index) => (
    <section key={id} id={id} className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <FileText aria-hidden="true" className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white pt-1.5">{index + 1}. {title}</h2>
      </div>
      <div className="text-slate-300 text-sm leading-relaxed space-y-3">{content}</div>
    </section>
  ));
}
