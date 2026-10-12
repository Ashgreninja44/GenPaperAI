import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Columns, 
  AlignJustify, 
  Key, 
  BookOpen, 
  UserCheck, 
  Download, 
  X, 
  Check, 
  Sliders, 
  Sparkles,
  FileCheck,
  Type,
  Printer,
  Brain
} from 'lucide-react';
import { Question } from '../types';
import BloomsTaxonomyD3Chart from './BloomsTaxonomyD3Chart';

export interface PaperLayoutSettings {
  showAnswerKey: boolean;
  includeInstructionsPage: boolean;
  columnLayout: 'single' | 'double';
  fontSize: 'compact' | 'standard' | 'spacious';
  includeStudentInfoBox: boolean;
  downloadFormat: 'pdf' | 'word' | 'txt';
  templateStyle?: 'pdf-specification' | 'classic';
}

interface PaperLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PaperLayoutSettings;
  onUpdateSettings: (settings: PaperLayoutSettings) => void;
  onApplyAndPreview: () => void;
  onDownload: (format: 'pdf' | 'word' | 'txt') => void;
  isDownloading?: boolean;
  totalQuestions: number;
  totalMarks: number;
  subject?: string;
  hasAnswerKey?: boolean;
  questions?: Question[];
}

export const PaperLayoutModal: React.FC<PaperLayoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onApplyAndPreview,
  onDownload,
  isDownloading = false,
  totalQuestions,
  totalMarks,
  subject,
  hasAnswerKey = true,
  questions = []
}) => {
  // Local state so the user can experiment and either Apply/Download or Cancel
  const [localSettings, setLocalSettings] = useState<PaperLayoutSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof PaperLayoutSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleApply = () => {
    onUpdateSettings(localSettings);
    onApplyAndPreview();
  };

  const handleDownloadClick = () => {
    onUpdateSettings(localSettings);
    onDownload(localSettings.downloadFormat);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-50/80 via-white to-amber-50/40 dark:from-purple-950/30 dark:via-slate-900 dark:to-amber-950/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-white flex items-center justify-center shadow-md">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Paper Layout & Download Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure column columns, instructions page, and answer key before exporting
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-5 overflow-y-auto space-y-6 text-sm">
            
            {/* Bloom's Taxonomy Cognitive Distribution D3 Chart */}
            {questions && questions.length > 0 && (
              <BloomsTaxonomyD3Chart 
                questions={questions} 
                totalMarks={totalMarks} 
              />
            )}

            {/* Setting 1: Column Layout (Single vs Double Column) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Columns className="w-3.5 h-3.5 text-[#8A2CB0]" />
                  Question Layout (Columns)
                </label>
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  {localSettings.columnLayout === 'double' ? 'Double Column (CBSE Style)' : 'Single Column (Standard)'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Single Column Card */}
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, columnLayout: 'single' }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    localSettings.columnLayout === 'single'
                      ? 'border-[#3C128D] bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-[#3C128D]/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                        <AlignJustify className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Single Column</span>
                    </div>
                    {localSettings.columnLayout === 'single' && (
                      <span className="w-5 h-5 rounded-full bg-[#3C128D] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  {/* Miniature diagram */}
                  <div className="h-10 bg-slate-100 dark:bg-slate-800/80 rounded-md p-1.5 flex flex-col justify-around mb-2">
                    <div className="h-1.5 bg-slate-400 dark:bg-slate-600 rounded-sm w-full"></div>
                    <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-sm w-4/5"></div>
                    <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-sm w-3/5"></div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Standard full-width lines. Best for long descriptive answers, junior grades, or papers with wide tables.
                  </p>
                </button>

                {/* Double Column Card */}
                <button
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, columnLayout: 'double' }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    localSettings.columnLayout === 'double'
                      ? 'border-[#3C128D] bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-[#3C128D]/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-[#3C128D] dark:text-purple-300">
                        <Columns className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Double Column</span>
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                          Board Style
                        </span>
                      </div>
                    </div>
                    {localSettings.columnLayout === 'double' && (
                      <span className="w-5 h-5 rounded-full bg-[#3C128D] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  {/* Miniature diagram */}
                  <div className="h-10 bg-slate-100 dark:bg-slate-800/80 rounded-md p-1.5 flex gap-1.5 justify-around mb-2">
                    <div className="w-1/2 flex flex-col justify-around">
                      <div className="h-1.5 bg-slate-400 dark:bg-slate-600 rounded-sm w-full"></div>
                      <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-sm w-3/4"></div>
                    </div>
                    <div className="w-px bg-slate-300 dark:bg-slate-700"></div>
                    <div className="w-1/2 flex flex-col justify-around">
                      <div className="h-1.5 bg-slate-400 dark:bg-slate-600 rounded-sm w-full"></div>
                      <div className="h-1.5 bg-slate-300 dark:bg-slate-700 rounded-sm w-4/5"></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Authentic 2-column examination layout. Saves 30–45% paper space and prints like official board tests.
                  </p>
                </button>
              </div>
            </div>

            {/* Setting 2 & 3: Toggles for Instructions Page & Answer Key */}
            <div className="space-y-3">
              <label className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#8A2CB0]" />
                Document Pages & Sections
              </label>

              {/* Instructions Page Toggle */}
              <div 
                onClick={() => handleToggle('includeInstructionsPage')}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  localSettings.includeInstructionsPage 
                    ? 'border-purple-300 bg-purple-50/40 dark:border-purple-800 dark:bg-purple-950/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    localSettings.includeInstructionsPage
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Include Instructions Page (Cover Page)
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Page Break Before Q1
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Creates a dedicated front cover page with complete exam rules, student identification box (Name, Roll No., Section, Invigilator Signature), and marking details.
                    </p>
                  </div>
                </div>

                <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  localSettings.includeInstructionsPage ? 'bg-[#3C128D]' : 'bg-slate-300 dark:bg-slate-700'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${
                    localSettings.includeInstructionsPage ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>

              {/* Show Answer Key Toggle */}
              <div 
                onClick={() => handleToggle('showAnswerKey')}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  localSettings.showAnswerKey 
                    ? 'border-purple-300 bg-purple-50/40 dark:border-purple-800 dark:bg-purple-950/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    localSettings.showAnswerKey
                      ? 'bg-[#8A2CB0] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Show & Append Answer Key
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        Official Solutions
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Appends step-by-step marking scheme, model answers, and solutions starting on a fresh new page at the conclusion of the test.
                    </p>
                  </div>
                </div>

                <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  localSettings.showAnswerKey ? 'bg-[#8A2CB0]' : 'bg-slate-300 dark:bg-slate-700'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${
                    localSettings.showAnswerKey ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>

              {/* Student Candidate Identification Box Header */}
              <div 
                onClick={() => handleToggle('includeStudentInfoBox')}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                  localSettings.includeStudentInfoBox 
                    ? 'border-slate-300 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    localSettings.includeStudentInfoBox ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Include Student Name & Roll Number Form Lines
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Adds blanks for Candidate Name, Roll No., Section, Date, and Invigilator's Signature.
                    </p>
                  </div>
                </div>

                <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
                  localSettings.includeStudentInfoBox ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm ${
                    localSettings.includeStudentInfoBox ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
            </div>

            {/* Setting 4: Print Typography & Spacing Density */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-[#8A2CB0]" />
                  Font Size & Spacing Density
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'standard', 'spacious'] as const).map((density) => (
                  <button
                    key={density}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, fontSize: density }))}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all capitalize cursor-pointer text-center ${
                      localSettings.fontSize === density
                        ? 'border-[#3C128D] bg-[#3C128D] text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {density === 'compact' && 'Compact (Save paper)'}
                    {density === 'standard' && 'Standard (Balanced)'}
                    {density === 'spacious' && 'Spacious (Larger font)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Setting 5: Download Format Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-black text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#8A2CB0]" />
                  Export File Format
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'pdf', label: 'PDF Document', ext: '.pdf', desc: 'Vector Print Ready' },
                  { id: 'word', label: 'Word (.doc)', ext: '.doc', desc: 'Editable in MS Word' },
                  { id: 'txt', label: 'Plain Text', ext: '.txt', desc: 'Unicode Raw Copy' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, downloadFormat: fmt.id as any }))}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      localSettings.downloadFormat === fmt.id
                        ? 'border-[#8A2CB0] bg-purple-50 dark:bg-purple-950/40 text-[#3C128D] dark:text-purple-300 ring-1 ring-[#8A2CB0]'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{fmt.label}</span>
                      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700">
                        {fmt.ext}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {fmt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Summary Pill Bar */}
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Active Configuration:
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 shadow-2xs border border-slate-200 dark:border-slate-600">
                {localSettings.columnLayout === 'double' ? '2-Column Mode' : '1-Column Mode'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 shadow-2xs border border-slate-200 dark:border-slate-600">
                {localSettings.includeInstructionsPage ? 'Cover Instructions Page' : 'Inline Instructions'}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold shadow-2xs border ${
                localSettings.showAnswerKey 
                  ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-800' 
                  : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
              }`}>
                {localSettings.showAnswerKey ? '+ Answer Key Included' : 'No Answer Key'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 shadow-2xs border border-slate-200 dark:border-slate-600 uppercase text-[10px]">
                {localSettings.downloadFormat}
              </span>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Apply to Preview
              </button>

              <button
                type="button"
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
              >
                {isDownloading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Preparing {localSettings.downloadFormat.toUpperCase()}...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {localSettings.downloadFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaperLayoutModal;
