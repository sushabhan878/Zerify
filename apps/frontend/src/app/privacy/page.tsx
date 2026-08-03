import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { ShieldCheck, Lock, Eye, Mail, Database, UserCheck, Bell, Server, MapPin, Phone } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Zerify',
  description: 'Understand how Zerify collects, uses, and protects your personal data when using our direct brand & creator collaboration platform.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'July 28, 2026';

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 relative overflow-hidden">
        {/* Background Ambient Lighting Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-900/20 via-pink-900/10 to-transparent blur-[160px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          
          {/* Header Banner */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Zerify <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Privacy Policy</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg">
              We respect your privacy and are committed to safeguarding your personal data across our brand &amp; creator collaboration ecosystem.
            </p>

            <p className="text-xs font-mono text-purple-300/80 bg-purple-950/40 inline-block px-3 py-1 rounded-md border border-purple-800/30">
              Effective Date: {lastUpdated}
            </p>
          </div>

          {/* Main Policy Content Blocks (Full-width, single column) */}
          <div className="space-y-8">

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

            {/* Section 6: Security & Data Retention */}
            <section id="data-security" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">6. Data Security &amp; Retention</h2>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  We employ industry-standard technical and organizational security measures, including TLS encryption for data in transit and encryption at rest. 
                </p>
                <p>
                  We retain personal information only for as long as your account remains active or as required to comply with financial auditing and legal obligations.
                </p>
              </div>
            </section>

            {/* Section 7: User Rights & Deletion */}
            <section id="user-rights" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">7. Your Data Rights &amp; Deletion Requests</h2>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                <p>Depending on your jurisdiction, you have rights to:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                  <li>Access and receive a copy of your stored personal data.</li>
                  <li>Rectify incorrect or incomplete information.</li>
                  <li>Request complete erasure (&quot;Right to be Forgotten&quot;) of your Zerify account and connected social data.</li>
                  <li>Withdraw consent or object to marketing communications.</li>
                </ul>
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs space-y-1">
                  <span className="font-bold text-white block">How to request data deletion:</span>
                  <span>Send an email titled &quot;Data Deletion Request&quot; from your registered email to <a href="mailto:info@zerify.in" className="text-purple-400 underline hover:text-purple-300">info@zerify.in</a>. Requests are processed within 14 business days.</span>
                </div>
              </div>
            </section>

            {/* Section 8: Cookies & Analytics */}
            <section id="cookies" className="bg-slate-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">8. Cookies &amp; Tracking Technologies</h2>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                <p>
                  Zerify uses essential cookies to maintain user session authorization and security. We may also use anonymized analytics tools to evaluate page load performance and usability. You can modify your browser settings to decline cookies, though certain features may become restricted.
                </p>
              </div>
            </section>

            {/* Section 9: Contact Information */}
            <section id="contact-us" className="bg-gradient-to-br from-purple-900/40 via-slate-900/80 to-slate-900 border border-purple-500/30 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">9. Contact Us</h2>
              </div>
              <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                <p>
                  If you have questions, feedback, or concerns regarding this Privacy Policy or our data practices, please reach out to our team:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                      <Mail className="w-4 h-4" />
                      <span>Email Us</span>
                    </div>
                    <a href="mailto:info@zerify.in" className="text-white text-sm font-medium hover:text-purple-300 transition-colors block">
                      info@zerify.in
                    </a>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                      <Phone className="w-4 h-4" />
                      <span>Call Us</span>
                    </div>
                    <a href="tel:+919732550799" className="text-white text-sm font-medium hover:text-purple-300 transition-colors block">
                      +91 9732550799
                    </a>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-white text-xs leading-relaxed font-medium">
                      IIT Kharagpur, Kharagpur, West Bengal, 721302
                    </p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
