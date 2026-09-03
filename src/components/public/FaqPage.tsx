import React, { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Calculator, 
  ArrowRight,
  User as UserIcon,
  Printer,
  Mail
} from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { setPageMetadata } from '../../utils/seo';

interface FaqPageProps {
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onEnterGuestMode, isLoggedIn }) => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "Frequently Asked Questions & Help Center | GenPaperAI",
      "Answers to common questions regarding question paper generation, Bloom's Taxonomy, syllabus updates, PDF exports, and educator workflows.",
      "/faq"
    );
  }, []);

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'general', label: 'Platform & Basics' },
    { id: 'generation', label: 'Paper Generation' },
    { id: 'curriculum', label: 'Blueprints & Bloom' },
    { id: 'formats', label: 'LaTeX & Export' },
    { id: 'guest', label: 'Guest & Accounts' },
    { id: 'ai', label: 'AI & Review' }
  ];

  const faqs = [
    {
      category: 'general',
      q: "What is GenPaperAI?",
      a: "GenPaperAI is an intelligent educational assessment platform engineered for teachers, coaching institutes, and schools. It automates the drafting, sectioning, marks distribution, and typesetting of question papers aligned with CBSE, NCERT, and revised Bloom's Taxonomy standards."
    },
    {
      category: 'general',
      q: "Who is GenPaperAI designed for?",
      a: "GenPaperAI is built for school teachers (Classes 6-12), subject matter experts, tutors, academic coordinators, and self-studying students who need balanced mock practice exams with accurate answer keys."
    },
    {
      category: 'generation',
      q: "How does GenPaperAI generate question papers?",
      a: "Educators specify their target class, subject, chapters, test duration, and maximum marks (e.g., 20M, 40M, 80M). GenPaperAI constructs a structured blueprint conforming to Bloom's cognitive distribution, synthesizes questions with proper LaTeX formulas, and generates a corresponding step-by-step answer key."
    },
    {
      category: 'generation',
      q: "Can I customize questions and edit the paper before printing?",
      a: "Yes! Every generated paper can be fully customized in our interactive preview workspace. You can edit question statements, rewrite options, regenerate specific questions, adjust marks, reorder sections, and modify answer keys before saving or printing."
    },
    {
      category: 'curriculum',
      q: "How does GenPaperAI implement Bloom's Taxonomy?",
      a: "GenPaperAI organizes question difficulty across the 6 revised Bloom's Taxonomy domains: Remembering (Definitions/recall, ~20%), Understanding (Explanations/concepts, ~30%), Applying (Numerical/practical problems, ~25%), Analyzing (Deductions/data graphs, ~15%), and Evaluating/Creating (Higher Order Thinking Skills / HOTS, ~10%)."
    },
    {
      category: 'curriculum',
      q: "Are CBSE and state board syllabi supported?",
      a: "Yes. Our curriculum engine includes the official chapter outlines for CBSE Classes 6 through 12 across Mathematics, Science, Social Science, English, Hindi, and regional languages. We regularly synchronize with official NCERT and SCERT educational frameworks."
    },
    {
      category: 'formats',
      q: "Does GenPaperAI support mathematical formulas and equations?",
      a: "Yes! GenPaperAI includes built-in KaTeX / LaTeX rendering. Equations, quadratic formulas, integrals, trigonometry functions, square roots, chemical formulas, and fractions are rendered sharply on both screen and exported PDF papers."
    },
    {
      category: 'formats',
      q: "In what formats can I export the generated question papers?",
      a: "You can download print-ready PDF question papers with school header letterheads, separate solution/answer key documents, or print directly via browser dialogs. Word document (.docx) compatibility is also supported."
    },
    {
      category: 'guest',
      q: "What is Guest Mode, and how does it work?",
      a: "Guest Mode allows educators to immediately test the question paper generator and customize papers without an upfront login. Temporary guest papers are stored in your local session. When you decide to create an account or sign in, your guest papers are automatically migrated to your permanent cloud storage."
    },
    {
      category: 'guest',
      q: "Why should I sign in with Google, Microsoft, or Email?",
      a: "Signing in provides secure cloud persistence for your papers across all devices, enables access to curated Question Banks, enables Web Ingestion from reference links, and allows you to manage school branding profiles."
    },
    {
      category: 'ai',
      q: "What is the Educator-in-the-Loop policy for AI-generated material?",
      a: "GenPaperAI treats artificial intelligence as an assistant that produces initial academic drafts. Because AI models can occasionally produce inaccuracies or misaligned difficulty, qualified teachers are advised to review and confirm all questions and answer solutions prior to administering formal examinations."
    },
    {
      category: 'ai',
      q: "Does GenPaperAI sell or use my test questions to train AI models?",
      a: "No. Your generated papers and custom Question Banks are private to your authenticated account. We do not sell your personal data or examinations to third parties."
    }
  ];

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <HelpCircle className="w-4 h-4" />
            <span>Help & FAQ Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about generating question papers, curriculum alignment, LaTeX rendering, and responsible AI usage on GenPaperAI.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenIdx(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-lg scale-105 border border-purple-400/30'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-white text-base sm:text-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-purple-400 font-mono text-sm">Q.</span>
                    {faq.q}
                  </span>
                  <div className="p-1.5 rounded-lg bg-white/10 text-slate-300 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4 bg-black/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="glass-panel p-8 rounded-3xl bg-purple-950/40 border border-purple-400/30 text-center space-y-4">
          <h3 className="text-xl font-black text-white">Still have questions or need assistance?</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Our support and academic development team is happy to help you with paper generation, custom blueprints, or feature suggestions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-2.5 rounded-xl bg-white text-[#3C128D] font-bold text-sm shadow-md hover:bg-slate-100 transition-all cursor-pointer"
            >
              Contact Support
            </button>
            <button
              onClick={() => {
                if (onEnterGuestMode) onEnterGuestMode();
                else navigate('/');
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-gray-950 font-bold text-sm shadow-md hover:bg-amber-300 transition-all cursor-pointer"
            >
              Try Question Generator
            </button>
          </div>
        </div>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default FaqPage;
