import React, { useState, useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setPageMetadata } from '../../utils/seo';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  Brain, 
  Calculator, 
  FileText, 
  Printer, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Compass,
  Sliders,
  Database,
  Cpu,
  GraduationCap,
  Microscope,
  Landmark,
  Languages,
  User as UserIcon,
  HelpCircle
} from 'lucide-react';
import Logo from '../Logo';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterGuestMode: () => void;
  isLoggedIn: boolean;
  authComponent?: React.ReactNode;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterGuestMode,
  isLoggedIn,
  authComponent
}) => {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "GenPaperAI - AI Question Paper & Assessment Generator",
      "Create structured, curriculum-aware academic question papers adhering to CBSE, NCERT, and Bloom's Taxonomy blueprints.",
      "/"
    );
  }, []);

  const steps = [
    {
      step: "01",
      title: "Select Class & Subject",
      description: "Choose from Grades 6-12 across Mathematics, Science, Social Studies, English, Hindi, and Telugu with automatic NCERT/CBSE chapter mappings.",
      icon: GraduationCap,
      color: "from-blue-500 to-indigo-600"
    },
    {
      step: "02",
      title: "Customize Blueprint & Marks",
      description: "Configure test duration, maximum marks (20, 40, 70, 80M), section weights, and Bloom's cognitive taxonomy distribution.",
      icon: Sliders,
      color: "from-purple-500 to-pink-600"
    },
    {
      step: "03",
      title: "AI Synthesis & LaTeX Typesetting",
      description: "GenPaperAI generates syllabus-aligned questions, complex KaTeX mathematical formulas, and step-by-step marking schemes.",
      icon: Cpu,
      color: "from-amber-500 to-orange-600"
    },
    {
      step: "04",
      title: "Teacher Review & PDF Export",
      description: "Proofread, edit question text, regenerate items, customize school letterhead headers, and download print-ready PDFs.",
      icon: Printer,
      color: "from-emerald-500 to-teal-600"
    }
  ];

  const bloomPillars = [
    { level: "Remembering", percent: "20%", desc: "Definitions, fundamental laws, formulas & terminology", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { level: "Understanding", percent: "30%", desc: "Conceptual explanations, differences & classifications", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    { level: "Applying", percent: "25%", desc: "Numerical problems, equations & practical scenarios", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    { level: "Analyzing", percent: "15%", desc: "Data graphs, experimental deductions & comparisons", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { level: "HOTS (Creating)", percent: "10%", desc: "Higher-Order evaluation, design & multi-step justification", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" }
  ];

  const quickFaqs = [
    {
      q: "Can I use GenPaperAI without creating an account?",
      a: "Yes! You can use 'Guest Mode' immediately to generate, customize, and preview question papers. When you're ready to save them permanently to the cloud, you can sign in with Google or Email."
    },
    {
      q: "How does GenPaperAI align with CBSE and NCERT guidelines?",
      a: "GenPaperAI incorporates official CBSE chapter structures, standard section divisions (Sections A through E), marks weightages, KaTeX mathematical formulas, and Bloom's cognitive taxonomy standards."
    },
    {
      q: "Can I edit individual questions before downloading?",
      a: "Absolutely. Our live interactive editor lets you modify question statements, rewrite multiple-choice options, adjust marks, reorder sections, and regenerate specific questions with custom instructions."
    },
    {
      q: "What is the Educator-in-the-Loop policy?",
      a: "AI provides initial academic drafts to accelerate test creation. Teachers and subject matter experts retain full editorial authority to review, fact-check, and customize all content prior to printing."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-20">
        {/* ========================================================================= */}
        {/* HERO SECTION WITH AUTH CARD */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-2 sm:pt-6">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Academic Assessment Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
              Create Balanced Question Papers in <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">Seconds</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
              Empower your teaching with automated, curriculum-aware question paper generation. Adheres to <strong>CBSE & NCERT blueprints</strong> and <strong>Bloom&apos;s Taxonomy</strong> standards with instant print-ready formatting.
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-amber-300 font-bold text-xs uppercase tracking-wider block">Cognitive Rigor</span>
                <span className="text-xs text-slate-200 font-medium">Bloom&apos;s Taxonomy calibrated</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-purple-300 font-bold text-xs uppercase tracking-wider block">Typesetting</span>
                <span className="text-xs text-slate-200 font-medium">LaTeX math & equations</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
                <span className="text-emerald-300 font-bold text-xs uppercase tracking-wider block">Output</span>
                <span className="text-xs text-slate-200 font-medium">Print-ready PDF & Keys</span>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onEnterGuestMode}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Try as Guest (Instant Access)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/guide"
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Blueprint Guide</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Embedded Sign In Card / Auth Container */}
          <div id="auth-card" className="lg:col-span-5 scroll-mt-24">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-slate-950/70 backdrop-blur-2xl border border-white/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              {authComponent ? (
                authComponent
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto border border-white/20 shadow-inner">
                    <Logo className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">Welcome to GenPaperAI</h3>
                    <p className="text-xs text-slate-300">Sign in to save papers and access your Question Bank</p>
                  </div>

                  <button
                    onClick={onOpenAuth}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-black text-sm shadow-lg hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Sign In or Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-white/40 text-[10px] uppercase font-bold tracking-widest">or</span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  <button
                    onClick={onEnterGuestMode}
                    className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>Continue in Guest Mode</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS (4-STEP WORKFLOW) */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-300">
              Streamlined Educator Workflow
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              How GenPaperAI Generates Examinations
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">
              From syllabus selection to classroom-ready printouts in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={idx}
                  className="glass-panel p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-purple-400/30 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-2xl font-black text-white/20">
                        {item.step}
                      </span>
                    </div>
                    <h4 className="text-lg font-black text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOOM'S TAXONOMY & COGNITIVE RIGOR */}
        {/* ========================================================================= */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-xl space-y-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-black uppercase tracking-widest">
                <Brain className="w-4 h-4" />
                <span>Pedagogical Standard</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Revised Bloom&apos;s Taxonomy Distribution
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Every test paper generated is scientifically weighted to balance fundamental recall with critical reasoning.
              </p>
            </div>
            <Link
              to="/guide"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all self-start md:self-auto flex items-center gap-1.5"
            >
              <span>Explore Full Framework</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {bloomPillars.map((b, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${b.color} flex flex-col justify-between space-y-2`}>
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-white">{b.level}</h5>
                    <span className="text-xs font-black">{b.percent}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-normal pt-1">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SUBJECTS & DISCIPLINARY DEPTH */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-emerald-300">
              Curriculum Breadth
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Supported Disciplines & Formats
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">
              Tailored schemas for science calculations, mathematical formulas, and humanities essays.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-500/30">
                <Calculator className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white">Mathematics</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Algebra, Geometry, Trigonometry, Calculus & Probability with rich LaTeX mathematical rendering.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
                <Microscope className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white">Sciences</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Physics, Chemistry & Biology with balanced chemical equations, ray diagrams, and practical experimental setups.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white">Social Sciences</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                History, Civics, Geography & Economics with source-based case studies and comparative long questions.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                <Languages className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-white">Languages</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                English, Hindi & Telugu with reading comprehensions, grammar exercises, and creative writing prompts.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RESPONSIBLE AI & TEACHER TRANSPARENCY NOTICE */}
        {/* ========================================================================= */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-purple-950/40 border border-purple-400/30 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 text-amber-300">
            <ShieldCheck className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-2xl font-black text-white">
                Educator-in-the-Loop Transparency Standard
              </h3>
              <p className="text-xs text-purple-200">
                AI accelerates drafting; teachers guarantee academic integrity
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            GenPaperAI is built as an intelligent assistant for professional educators. Every question, diagram prompt, and solution key generated is a suggested draft. We give you instant editing tools to adjust values, customize options, and ensure 100% curriculum adherence before any student takes the exam.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/about#ethics"
              className="text-xs font-bold text-amber-300 hover:text-white underline flex items-center gap-1"
            >
              <span>Read our AI Ethics & Pedagogy Statement</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              to="/faq"
              className="text-xs font-bold text-purple-300 hover:text-white underline flex items-center gap-1"
            >
              <span>Learn about LaTeX & KaTeX formula rendering</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE FAQ ACCORDION PREVIEW */}
        {/* ========================================================================= */}
        <section className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-300">
              Questions & Answers
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {quickFaqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:bg-white/5 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <div className="p-1 rounded-lg bg-white/10 text-slate-300 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3 bg-black/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <Link to="/faq" className="text-xs font-bold text-amber-300 hover:underline">
              View all 20+ Frequently Asked Questions →
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default LandingPage;
