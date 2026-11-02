import { ShieldCheck, Lock, Eye, Database, Server } from 'lucide-react';

export default function PrivacyInformation() {
  return (
    <>
      {/* Section 1: Introduction */}
      <section id="introduction" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">1. Introduction</h2>
        </div>
        <div className="text-slate-300 text-sm leading-relaxed space-y-3">
          <p>
            Zerify (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) provides a direct collaboration platform connecting brand partners, agencies, and content creators. This Privacy Policy describes how we collect, use, disclose, and protect personal information obtained through our website (<a href="https://zerify.in" className="text-purple-400 underline">zerify.in</a>), applications, and connected social APIs.
          </p>
          <p>
            By accessing or using Zerify, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use our service.
          </p>
        </div>
      </section>

      {/* Section 2: Information We Collect */}
      <section id="information-collected" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Database className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
        </div>
        <div className="text-slate-300 text-sm leading-relaxed space-y-4">
          <p>We collect several types of information to deliver and optimize our services:</p>

          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Account &amp; Registration Information
            </h3>
            <p className="pl-3 border-l-2 border-purple-500/30">
              When you register as a Brand or Creator, we collect your name, email address, password hash, company name, website URL, phone number, and billing/payout info.
            </p>

            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              Connected Creator Social Data &amp; Metrics
            </h3>
            <p className="pl-3 border-l-2 border-pink-500/30">
              When creators link social accounts (e.g., Meta/Instagram Graph API, TikTok API), we collect authorized public profile data, follower counts, engagement rate metrics, video analytics, and audience insights necessary for campaign matching.
            </p>

            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Usage &amp; Device Information
            </h3>
            <p className="pl-3 border-l-2 border-indigo-500/30">
              We collect browser type, IP address, device identifiers, operating system version, page visits, and referral headers to ensure system performance and prevent security threats.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: How We Use Information */}
      <section id="use-of-information" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Eye className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">3. How We Use Your Information</h2>
        </div>
        <div className="text-slate-300 text-sm leading-relaxed space-y-3">
          <p>We process personal data for legitimate business purposes including:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-300 pl-2">
            <li>Facilitating direct campaign contracts, negotiations, and messaging between brands and creators.</li>
            <li>Powering Zerify&apos;s AI recommendation engine to suggest compatible creator matches for brand briefs.</li>
            <li>Processing payments, calculating campaign payouts, and generating tax reporting records.</li>
            <li>Monitoring platform integrity, detecting fraud, and safeguarding user data.</li>
            <li>Sending transactional notifications, service updates, and relevant marketing communications (with opt-out controls).</li>
          </ul>
        </div>
      </section>

      {/* Section 4: Social Platform & API Compliance */}
      <section id="social-api-compliance" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4 border-l-4 border-l-purple-500">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">4. Social Media Platform &amp; API Compliance</h2>
        </div>
        <div className="text-slate-300 text-sm leading-relaxed space-y-4">
          <p>
            Zerify strictly complies with developer policies and data protection rules set by third-party social platforms:
          </p>
          <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider text-purple-300">Meta / Instagram API Terms</h3>
            <p className="text-xs text-slate-300">
              Data retrieved via Meta Graph API (Instagram Business accounts) is limited to scope authorized by the user during OAuth flow. We do not sell Meta API data, store access tokens past expiration, or request permissions beyond campaign performance needs. Users may disconnect Meta access at any time via their profile settings.
            </p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5 space-y-2">
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider text-purple-300">TikTok API Terms</h3>
            <p className="text-xs text-slate-300">
              TikTok API integration adheres strictly to TikTok Developer Terms of Service. Creator metrics fetched via TikTok APIs are updated dynamically and automatically purged upon account unlinking or request.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Data Sharing & Third Parties */}
      <section id="data-sharing" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">5. Data Sharing &amp; Sub-Processors</h2>
        </div>
        <div className="text-slate-300 text-sm leading-relaxed space-y-3">
          <p className="font-semibold text-white">We do NOT sell or rent your personal data to third parties.</p>
          <p>We share data only with verified sub-processors necessary to run the service:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-slate-200">Infrastructure &amp; Database:</strong> Managed cloud hosting (Neon PostgreSQL, AWS/Vercel)</li>
            <li><strong className="text-slate-200">Payment Processing:</strong> Secure payout and billing compliance partners</li>
            <li><strong className="text-slate-200">Communication Services:</strong> Transactional email and SMS gateways</li>
            <li><strong className="text-slate-200">Legal Compliance:</strong> When required by court order, law enforcement, or statutory obligation</li>
          </ul>
        </div>
      </section>
    </>
  );
}
