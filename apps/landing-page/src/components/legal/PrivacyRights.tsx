import { ShieldCheck, UserCheck, Bell, Mail, MapPin, Phone } from 'lucide-react';

export default function PrivacyRights() {
  return (
    <>
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
    </>
  );
}
