import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Layers, CheckCircle2, Sparkles, Eye, FileText, Check } from 'lucide-react';
import QuestionPaperTemplate, { SUBJECT_LAYOUT_DESCRIPTORS } from './QuestionPaperTemplate';
import { GeneratedPaper } from '../types';

interface TemplateShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPaper?: GeneratedPaper;
  onSelectSubjectTemplate?: (subjectName: string) => void;
}

const ALL_SUBJECT_KEYS = [
  'Mathematics',
  'Science',
  'English',
  'Social Studies',
  'Telugu',
  'Hindi',
  'Artificial Intelligence',
  'PAT',
  'Other Subjects'
];

export const TemplateShowcaseModal: React.FC<TemplateShowcaseModalProps> = ({
  isOpen,
  onClose,
  currentPaper,
  onSelectSubjectTemplate
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  if (!isOpen) return null;

  // Build dummy sample paper for placeholder specification preview
  const samplePaper: GeneratedPaper = currentPaper || {
    id: 'sample-spec-paper',
    timestamp: Date.now(),
    title: `ANNUAL EXAMINATION 2026-27`,
    config: {
      board: 'CBSE / NCERT',
      schoolName: 'ADITYA BIRLA PUBLIC SCHOOL',
      subject: selectedSubject,
      grade: 'Class 10',
      timeAllowed: '3 Hours',
      totalMarks: 80,
      difficulty: 'Medium',
      includeFigures: true,
      testType: selectedSubject === 'PAT' ? 'PAT-1 (Periodic Assessment Test)' : 'Annual Examination',
      counts: { mcq: 5, ar: 2, vsaq: 3, saq: 3, laq: 2, caseStudy: 1 }
    },
    questions: [],
    answerKey: ''
  };

  const layoutSpec = SUBJECT_LAYOUT_DESCRIPTORS[selectedSubject] || SUBJECT_LAYOUT_DESCRIPTORS['Other Subjects'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-slate-100 flex flex-col max-h-[94vh]"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/60 via-slate-900 to-sky-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#005A70] to-[#8A2CB0] text-white flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  All-Subject Question Paper Template Pack
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-400/30">
                    GenPaperAI PDF Spec
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect subject-aware layouts for Mathematics, Science, Languages, Social Studies, AI, PAT & more
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subject Navigation Tabs */}
          <div className="px-6 py-3 border-b border-white/10 bg-slate-950/60 overflow-x-auto flex items-center gap-2 scrollbar-none">
            {ALL_SUBJECT_KEYS.map((subj) => {
              const isActive = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#005A70] to-[#8A2CB0] text-white border-purple-400/50 shadow-md scale-105'
                      : 'bg-slate-800/80 text-slate-300 border-white/5 hover:border-purple-400/30 hover:bg-slate-800'
                  }`}
                >
                  <span>{subj}</span>
                  {isActive && <Check className="w-3 h-3 text-emerald-300" />}
                </button>
              );
            })}
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/40">
            {/* Subject Info Card */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                  Selected Subject Template Specification
                </div>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {selectedSubject} Paper Design Format
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {layoutSpec.description}
                </p>
              </div>

              {onSelectSubjectTemplate && (
                <button
                  onClick={() => {
                    onSelectSubjectTemplate(selectedSubject);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-md flex items-center gap-2 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply {selectedSubject} Template</span>
                </button>
              )}
            </div>

            {/* Template Paper Live Render Container */}
            <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl">
              <QuestionPaperTemplate
                paper={samplePaper}
                layoutSettings={{
                  showAnswerKey: false,
                  includeInstructionsPage: false,
                  columnLayout: 'single',
                  fontSize: 'standard',
                  includeStudentInfoBox: true,
                  downloadFormat: 'pdf'
                }}
                isPlaceholderMode={true}
                placeholderSubject={selectedSubject}
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-white/10 bg-slate-950 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Preserves exact school branding, time/marks rows, pale-blue section bars, dark-teal borders, and native font glyphs.
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Close Template Pack
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TemplateShowcaseModal;
