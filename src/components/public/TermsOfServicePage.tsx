import React, { useLayoutEffect } from 'react';
import { FileText, ShieldAlert, CheckCircle2, Award, Scale } from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { setPageMetadata } from '../../utils/seo';

interface TermsOfServicePageProps {
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onEnterGuestMode, isLoggedIn }) => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "Terms of Service | GenPaperAI",
      "Read the terms, conditions, educator review responsibilities, and acceptable usage policies for the GenPaperAI academic platform.",
      "/terms"
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Scale className="w-4 h-4" />
            <span>Academic Terms & Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Last updated: September 3, 2026 | Effective Date: September 3, 2026
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-8 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">1.</span> Acceptance of Terms
            </h2>
            <p>
              By accessing or using the <strong>GenPaperAI</strong> website and paper generation tools, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must discontinue use of the platform.
            </p>
          </section>

          <section className="space-y-3 p-5 rounded-2xl bg-purple-950/40 border border-purple-400/20 text-slate-200">
            <h2 className="text-xl font-bold text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>2. Educator Responsibility & Academic Review Obligation</span>
            </h2>
            <p>
              GenPaperAI produces initial test drafts based on prompt instructions and curriculum standards. <strong>Educators and administrators acknowledge that they retain sole responsibility for reviewing, fact-checking, and verifying all generated questions, numerical answers, scientific claims, and solutions before administering tests to students.</strong>
            </p>
            <p className="text-xs text-slate-400">
              GenPaperAI shall not be liable for any grading disputes, curriculum discrepancies, or exam inaccuracies resulting from unverified test papers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">3.</span> Intellectual Property & Content Rights
            </h2>
            <ul className="space-y-2 list-disc list-inside pl-2">
              <li>
                <strong>Your Assessment Materials:</strong> You retain complete intellectual rights to the customized question papers, school headers, and exam collections created through the Platform.
              </li>
              <li>
                <strong>Platform IP:</strong> GenPaperAI&apos;s interface design, proprietary blueprint algorithms, branding, and codebase are the intellectual property of the creators and developers.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">4.</span> Acceptable Use Policy
            </h2>
            <p>You agree NOT to:</p>
            <ul className="space-y-2 list-disc list-inside pl-2 text-xs sm:text-sm text-slate-300">
              <li>Use the platform for any unlawful purpose or to distribute copyrighted proprietary exam materials without proper authorization.</li>
              <li>Attempt to reverse-engineer, decompile, or bypass rate-limiting mechanisms on the AI generation APIs.</li>
              <li>Deploy automated bots, scrapers, or scripts to flood the platform infrastructure.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">5.</span> Service Availability & Modifications
            </h2>
            <p>
              We strive to maintain maximum uptime and continuous service availability. However, GenPaperAI is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We reserve the right to update features, blueprints, and server endpoints to improve performance and curriculum accuracy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">6.</span> Inquiries & Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. For any contractual or legal queries, please contact <a href="mailto:pendyaladarshit4@gmail.com" className="text-purple-300 underline font-mono">pendyaladarshit4@gmail.com</a>.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default TermsOfServicePage;
