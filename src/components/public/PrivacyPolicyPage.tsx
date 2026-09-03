import React, { useLayoutEffect } from 'react';
import { ShieldCheck, Lock, Eye, Cookie, FileText, Mail, Info } from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { setPageMetadata } from '../../utils/seo';

interface PrivacyPolicyPageProps {
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onEnterGuestMode, isLoggedIn }) => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "Privacy Policy | GenPaperAI",
      "Read how GenPaperAI collects, manages, and protects educator and student information in full compliance with global educational privacy standards.",
      "/privacy"
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal & Privacy Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last updated: September 3, 2026 | Effective Date: September 3, 2026
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-8 text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">1.</span> Introduction & Scope
            </h2>
            <p>
              Welcome to <strong>GenPaperAI</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting the privacy and personal information of educators, teachers, administrators, and students who utilize our question paper generation platform, website, and associated assessment tools.
            </p>
            <p>
              This Privacy Policy explains how information is collected, used, disclosed, and safeguarded when you visit our website (the &quot;Platform&quot;) and utilize our assessment generation services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">2.</span> Information We Collect
            </h2>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>
                <strong>Account Information:</strong> When you register via Google Auth, Microsoft Auth, or Email/Password, we collect your name, email address, and unique user identifier.
              </li>
              <li>
                <strong>User Content & Paper Data:</strong> We store the assessment blueprints, customized question statements, answer keys, and Question Bank entries you create so you can retrieve and edit them across sessions.
              </li>
              <li>
                <strong>Guest Session Data:</strong> In Guest Mode, session data is stored locally within your browser and is not linked to an identity until you choose to create an account.
              </li>
              <li>
                <strong>Log Data & Telemetry:</strong> Standard operational telemetry (e.g., browser type, operating system, page response latency, and general location/country) is logged for security monitoring and uptime reliability.
              </li>
            </ul>
          </section>

          {/* Section 3: Google AdSense & Cookies */}
          <section id="cookies" className="space-y-3 p-5 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-slate-200">
            <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              <span>3. Cookies & Google AdSense Advertising</span>
            </h2>
            <p>
              Third-party vendors, including <strong>Google AdSense</strong>, use cookies to serve ads based on a user&apos;s prior visits to our website or other websites on the Internet:
            </p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-slate-300">
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to GenPaperAI and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline font-semibold">Google Ads Settings</a>.
              </li>
              <li>
                Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline font-semibold">aboutads.info</a>.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">4.</span> How We Use Collected Information
            </h2>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>To provide, operate, and maintain the GenPaperAI question paper generation and question bank services.</li>
              <li>To authenticate user sessions and securely synchronize assessments across your devices.</li>
              <li>To prevent fraudulent behavior, abusive automated bot traffic, or denial-of-service attempts.</li>
              <li>To respond to user customer support inquiries, feedback, and technical error reports.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">5.</span> Data Security & Storage
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards. All user data, question banks, and generated assessments are encrypted in transit via SSL/TLS and stored in enterprise Google Cloud Firestore infrastructure with role-based security rules.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">6.</span> Data Rights & Account Deletion
            </h2>
            <p>
              You maintain complete ownership of your academic content. You may export your question papers at any time. If you wish to delete your account or any saved assessments from our database, you can contact us at <a href="mailto:pendyaladarshit4@gmail.com" className="text-purple-300 underline font-mono">pendyaladarshit4@gmail.com</a> and we will permanently purge your records within 30 days.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">7.</span> Contacting Us
            </h2>
            <p>
              For privacy-related inquiries or data protection requests:
            </p>
            <div className="p-4 rounded-xl bg-black/20 font-mono text-xs text-purple-300 space-y-1">
              <p>GenPaperAI Privacy Officer</p>
              <p>Email: pendyaladarshit4@gmail.com</p>
              <p>Location: Andhra Pradesh / Telangana, India</p>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default PrivacyPolicyPage;
