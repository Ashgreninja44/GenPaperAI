import React, { useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Globe, 
  Code2, 
  FileSpreadsheet, 
  ShieldCheck, 
  ArrowRight,
  Calculator,
  Microscope,
  Landmark,
  Languages
} from 'lucide-react';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import { setPageMetadata } from '../../utils/seo';

interface CurriculumGuideProps {
  onEnterGuestMode?: () => void;
  isLoggedIn?: boolean;
}

export const CurriculumGuide: React.FC<CurriculumGuideProps> = ({ onEnterGuestMode, isLoggedIn }) => {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setPageMetadata(
      "Curriculum & Standards Mapping (CBSE, NCERT, ICSE) | GenPaperAI",
      "Detailed syllabus coverage and competency-based blueprints for Classes 6-12 across Mathematics, Science, Social Studies, and Languages.",
      "/curriculum"
    );
  }, []);

  const subjects = [
    {
      name: "Mathematics (Grades 6 - 12)",
      icon: Calculator,
      color: "from-blue-500 to-indigo-600",
      topics: "Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, Circles, Statistics, Probability, Calculus, Vectors & 3D Geometry.",
      specialFeature: "Rich LaTeX mathematical typesetting for complex integrals, matrices, fractions, square roots, and geometric proofs."
    },
    {
      name: "Science & Physical Sciences (Grades 6 - 12)",
      icon: Microscope,
      color: "from-emerald-500 to-teal-600",
      topics: "Chemical Reactions, Acids Bases & Salts, Metals & Non-metals, Carbon Compounds, Life Processes, Control & Coordination, Reproduction, Heredity, Light Reflection & Refraction, Electricity, Magnetic Effects, Ray Optics, Thermodynamics.",
      specialFeature: "Experimental setup questions, chemical reaction balancing, ray diagram prompts, and clinical data interpretation."
    },
    {
      name: "Social Science & Humanities (Grades 6 - 10)",
      icon: Landmark,
      color: "from-amber-500 to-orange-600",
      topics: "History (Nationalism in India, Industrialization), Geography (Resources, Agriculture, Minerals, Manufacturing), Political Science (Power Sharing, Federalism, Democracy), Economics (Development, Sectors of Indian Economy, Money & Credit).",
      specialFeature: "Source-based contextual passages, map-pointing questions, and multi-perspective historical evaluations."
    },
    {
      name: "Languages (English, Hindi, Telugu)",
      icon: Languages,
      color: "from-purple-500 to-pink-600",
      topics: "Reading Comprehension (Factual & Discursive Passages), Grammar & Syntax, Creative Writing (Letters, Articles, Notices, Speeches), Literature & Analytical Poetry Extracts.",
      specialFeature: "Support for Devanagari and Telugu Unicode fonts, grammar fill-in-the-blanks, and unseen passage question generation."
    }
  ];

  const boards = [
    {
      board: "CBSE (Central Board of Secondary Education)",
      status: "Primary Core Support",
      description: "Complete chapter mappings from NCERT textbooks for Grades 6 through 12, matching the latest annual circulars and sample question paper blueprints."
    },
    {
      board: "State Educational Boards (AP, TS, Maharashtra, Karnataka)",
      status: "Fully Compatible",
      description: "Alignment with state curriculum boards and regional SCERT textbooks, accommodating regional variations in unit tests and term examinations."
    },
    {
      board: "ICSE / CISCE Standards",
      status: "Customizable Blueprint",
      description: "Configurable section titles, marks subdivisions, and descriptive long-form question templates tailored to CISCE standards."
    },
    {
      board: "Custom Coaching & Olympiad Curriculums",
      status: "Dynamic Ingestion",
      description: "Utilize our Web Research and Custom Question Ingestion tool to generate test papers from custom study materials, PDFs, or institution-specific syllabi."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <PublicHeader onEnterGuestMode={onEnterGuestMode} isLoggedIn={isLoggedIn} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <GraduationCap className="w-4 h-4" />
            <span>Curriculum & Board Alignment</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Supported Boards, Subjects & Chapters
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            GenPaperAI connects textbook curricula with academic blueprints so teachers can generate syllabus-compliant tests in minutes.
          </p>
        </div>

        {/* 1. Boards Overview */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">1. Educational Board Compatibility</h2>
              <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Curriculum Blueprints</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {boards.map((b, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{b.board}</h3>
                </div>
                <span className="inline-block text-[10px] font-black text-amber-300 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {b.status}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Subject Breakdown */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-white/5 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">2. Subject & Domain Coverage</h2>
              <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">Disciplinary Depth</p>
            </div>
          </div>

          <div className="space-y-6">
            {subjects.map((sub, idx) => {
              const IconComp = sub.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${sub.color} text-white shadow-md`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-white text-lg">{sub.name}</h3>
                  </div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <p><strong className="text-slate-200">Key Chapter Themes:</strong> {sub.topics}</p>
                    <p className="pt-2 text-amber-300"><strong className="text-amber-200">Assessment Feature:</strong> {sub.specialFeature}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Dynamic Chapter Selection & Customization */}
        <section className="glass-panel p-6 sm:p-10 rounded-3xl bg-purple-950/40 border border-purple-400/30 space-y-5">
          <div className="flex items-center gap-3 text-amber-300">
            <Sparkles className="w-7 h-7 shrink-0" />
            <h2 className="text-2xl font-black text-white">3. Multi-Chapter & Unit Test Flexibility</h2>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">
            GenPaperAI allows educators to select single chapters for weekly formative assessments or multi-chapter units for comprehensive midterm and annual exams. You can also specify exact maximum marks (20, 25, 40, 50, 70, or 80 marks) and exam durations.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Generate a test aligned with your exact board and chapter today.
            </p>
            <button
              onClick={() => {
                if (onEnterGuestMode) onEnterGuestMode();
                else navigate('/');
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Start Test Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <PublicFooter onEnterGuestMode={onEnterGuestMode} />
    </div>
  );
};

export default CurriculumGuide;
