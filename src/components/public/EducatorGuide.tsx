import React, { useLayoutEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  Brain, 
  Calculator, 
  FileText, 
  Printer, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  Award,
  Clock,
  Compass
} from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { setPageMetadata } from '../../utils/seo';

interface EducatorGuideProps {
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const EducatorGuide: React.FC<EducatorGuideProps> = ({ onEnterGuestMode, isLoggedIn }) => {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "Educator's Assessment & Blueprint Guide | GenPaperAI",
      "Learn best practices for structuring balanced question papers adhering to Bloom's revised taxonomy, multi-tier blueprints, and academic marking schemes.",
      "/guide"
    );
  }, []);

  const bloomLevels = [
    {
      level: "1. Remembering (Recall)",
      weight: "15% - 20%",
      verbs: "Define, list, state, name, identify, recall",
      example: "State Snell's law of refraction. / Define what is a prime number.",
      purpose: "Tests foundational definitions, formulas, and fundamental vocabulary."
    },
    {
      level: "2. Understanding (Comprehension)",
      weight: "25% - 30%",
      verbs: "Explain, describe, distinguish, classify, summarize",
      example: "Distinguish between exothermic and endothermic reactions with examples.",
      purpose: "Evaluates conceptual grasping, relationships between concepts, and clarity."
    },
    {
      level: "3. Applying (Application)",
      weight: "20% - 25%",
      verbs: "Calculate, solve, demonstrate, compute, apply",
      example: "Calculate the equivalent resistance of three 6-ohm resistors in parallel.",
      purpose: "Assesses ability to apply rules, formulas, and concepts to novel numerical or practical situations."
    },
    {
      level: "4. Analyzing (Analysis)",
      weight: "15% - 20%",
      verbs: "Compare, contrast, deduce, examine, analyze data",
      example: "Analyze the given pH vs reaction rate graph and deduce the optimum enzyme activity range.",
      purpose: "Examines breakdown of information, pattern recognition, and data interpretation."
    },
    {
      level: "5. Evaluating & Creating (HOTS)",
      weight: "10% - 15%",
      verbs: "Justify, critique, formulate, design, evaluate",
      example: "Justify why alternating current (AC) is preferred over direct current (DC) for long-distance power transmission.",
      purpose: "Develops Higher Order Thinking Skills (HOTS), synthesis, and evidence-based justification."
    }
  ];

  const questionTypes = [
    {
      title: "Multiple Choice Questions (MCQs)",
      typicalMarks: "1 Mark each",
      description: "Direct objective questions containing exactly 4 unambiguous options with single correct key. Ideal for quick diagnostic and concept breadth testing.",
      bestPractice: "Ensure distractors reflect common student misconceptions rather than arbitrary numbers."
    },
    {
      title: "Assertion & Reason (A/R)",
      typicalMarks: "1 Mark each",
      description: "Standard dual-statement evaluation testing cause-and-effect logical relationships. Evaluates whether statement (A) and explanation (R) are factually true and causally connected.",
      bestPractice: "Use clearly distinct factual principles where the reasoning directly explains the observed phenomenon."
    },
    {
      title: "Very Short Answer (VSA)",
      typicalMarks: "2 Marks each",
      description: "Concise 2 to 3 line responses focused on core definitions, formula derivation steps, or direct two-point comparisons.",
      bestPractice: "Structure marking rubric as 1 mark for basic principle + 1 mark for correct example or unit."
    },
    {
      title: "Short Answer (SA)",
      typicalMarks: "3 Marks each",
      description: "Structured multi-part questions or intermediate numerical problems requiring 3 distinct conceptual points or step-wise calculations.",
      bestPractice: "Include step-marking rubrics so students receive partial credit for correct formula usage."
    },
    {
      title: "Long Answer (LA)",
      typicalMarks: "5 Marks each",
      description: "Comprehensive explanatory questions, multi-step geometric proofs, or detailed experimental setups with clear sub-divisions (e.g., 2+2+1 or 3+2).",
      bestPractice: "Provide internal choices between equivalent difficulty topics within the same syllabus chapter."
    },
    {
      title: "Case-Based Integrated Studies",
      typicalMarks: "4 Marks each",
      description: "Real-world passages, clinical vignettes, experimental data tables, or architectural diagrams followed by 3 sub-questions testing cross-curricular application.",
      bestPractice: "Ground the case context in relatable practical scenarios (e.g., solar energy installations, sports biomechanics, economic trends)."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <BookOpen className="w-4 h-4" />
            <span>Academic Assessment Guide</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How to Create Balanced Question Papers
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A comprehensive reference guide for educators on designing valid, reliable, and curriculum-aligned examinations using Bloom's Taxonomy and board blueprints.
          </p>
        </div>

        {/* 1. Assessment Philosophy & Bloom's Taxonomy */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">1. Bloom's Taxonomy in Question Paper Design</h2>
              <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Cognitive Domain Distribution</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            An effective examination measures not just rote memorization, but the full hierarchy of cognitive processing. GenPaperAI applies calibrated weightages across all 6 revised Bloom's cognitive levels to ensure papers are balanced and fair for students of varying proficiencies.
          </p>

          <div className="space-y-4">
            {bloomLevels.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/30 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-white text-base">{item.level}</h3>
                  <span className="text-xs font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 self-start sm:self-auto">
                    Recommended Weight: {item.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-400"><strong className="text-slate-300">Action Verbs:</strong> {item.verbs}</p>
                <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl font-mono"><strong className="text-purple-300">Sample Question:</strong> {item.example}</p>
                <p className="text-xs text-slate-400">{item.purpose}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Standard CBSE / Board Section Structure */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">2. Standard Board Blueprint (Section A to E)</h2>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">CBSE 80-Mark Sample Pattern</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            The standard CBSE secondary and senior secondary pattern (e.g., Class 10 & 12 Science, Mathematics, and Social Science) divides the paper into five distinct sections with standardized marks and internal choice options:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/20 text-white font-bold bg-white/10">
                  <th className="p-3">Section</th>
                  <th className="p-3">Question Format</th>
                  <th className="p-3">No. of Questions</th>
                  <th className="p-3">Marks per Q</th>
                  <th className="p-3">Total Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-bold text-purple-300">Section A</td>
                  <td className="p-3">Objective (16 MCQs + 4 Assertion-Reason)</td>
                  <td className="p-3">20</td>
                  <td className="p-3">1 Mark</td>
                  <td className="p-3 font-black text-amber-300">20 Marks</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-bold text-purple-300">Section B</td>
                  <td className="p-3">Very Short Answer (VSA)</td>
                  <td className="p-3">6</td>
                  <td className="p-3">2 Marks</td>
                  <td className="p-3 font-black text-amber-300">12 Marks</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-bold text-purple-300">Section C</td>
                  <td className="p-3">Short Answer (SA)</td>
                  <td className="p-3">7</td>
                  <td className="p-3">3 Marks</td>
                  <td className="p-3 font-black text-amber-300">21 Marks</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-bold text-purple-300">Section D</td>
                  <td className="p-3">Long Answer (LA with Internal Choices)</td>
                  <td className="p-3">3</td>
                  <td className="p-3">5 Marks</td>
                  <td className="p-3 font-black text-amber-300">15 Marks</td>
                </tr>
                <tr className="hover:bg-white/5">
                  <td className="p-3 font-bold text-purple-300">Section E</td>
                  <td className="p-3">Case-Based / Integrated Data Units</td>
                  <td className="p-3">3</td>
                  <td className="p-3">4 Marks</td>
                  <td className="p-3 font-black text-amber-300">12 Marks</td>
                </tr>
                <tr className="bg-purple-900/30 font-black text-white">
                  <td className="p-3" colSpan={2}>Grand Total</td>
                  <td className="p-3">39 Questions</td>
                  <td className="p-3">—</td>
                  <td className="p-3 text-amber-300">80 Marks (3 Hours)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Deep Dive into Question Types */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">3. Question Formats & Construction Best Practices</h2>
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Quality Criteria</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionTypes.map((q, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-white text-base">{q.title}</h3>
                    <span className="text-[11px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {q.typicalMarks}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{q.description}</p>
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-emerald-300 bg-emerald-500/5 p-2 rounded-xl">
                  <strong>Best Practice:</strong> {q.bestPractice}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Responsible AI Usage & Teacher Review */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-purple-950/40 border border-purple-400/30 space-y-5">
          <div className="flex items-center gap-3 text-amber-300">
            <ShieldCheck className="w-7 h-7 shrink-0" />
            <h2 className="text-2xl font-black text-white">4. Responsible AI & Editorial Verification</h2>
          </div>

          <div className="space-y-3 text-sm text-slate-200 leading-relaxed">
            <p>
              While GenPaperAI uses state-of-the-art language models with curriculum awareness, <strong>all AI-generated questions are proposed drafts</strong>. We uphold the <em>Educator-in-the-Loop</em> standard:
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-300 pl-2">
              <li><strong>Verify Numerical Accuracy:</strong> Teachers should verify math calculations and physics unit conversions before conducting high-stakes tests.</li>
              <li><strong>Check Syllabus Scope:</strong> Ensure that specific topics (e.g., deleted chapters or board reductions) are excluded by using our chapter selection toggles.</li>
              <li><strong>Customize Answer Rubrics:</strong> Utilize GenPaperAI's inline question editor to refine marking points and add alternative solutions.</li>
            </ul>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Ready to generate your first test with these best practices?
            </p>
            <button
              onClick={() => {
                if (onEnterGuestMode) onEnterGuestMode();
                else navigate('/');
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Launch Paper Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default EducatorGuide;
