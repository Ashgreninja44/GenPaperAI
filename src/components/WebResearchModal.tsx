import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  Plus, 
  Check, 
  ShieldCheck, 
  Compass, 
  Link as LinkIcon, 
  FileText, 
  ArrowRight,
  Database,
  Info
} from 'lucide-react';
import { 
  ResearchMode, 
  ResearchFinding, 
  Question, 
  UserProfile, 
  SubscriptionGlobalConfig, 
  WebResearchConfig,
  QuestionBank 
} from '../types';
import { performIntelligentWebResearch } from '../services/webResearchService';
import { canUserPerformResearch, incrementUserMonthlyResearchCount } from '../services/subscriptionService';
import { convertToStructuredQuestion } from '../services/questionBankService';

interface WebResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestionsToPaper?: (questions: Question[]) => void;
  onSaveQuestionsToBank?: (questions: Question[], bankId?: string) => void;
  user: UserProfile | null;
  subscriptionConfig?: SubscriptionGlobalConfig | null;
  webResearchConfig?: WebResearchConfig | null;
  existingBanks?: QuestionBank[];
  initialTopic?: string;
  initialSubject?: string;
  initialGrade?: string;
  initialBoard?: string;
}

export const WebResearchModal: React.FC<WebResearchModalProps> = ({
  isOpen,
  onClose,
  onAddQuestionsToPaper,
  onSaveQuestionsToBank,
  user,
  subscriptionConfig,
  webResearchConfig,
  existingBanks = [],
  initialTopic = '',
  initialSubject = 'Science',
  initialGrade = 'Class 10',
  initialBoard = 'CBSE'
}) => {
  const [mode, setMode] = useState<ResearchMode>('curriculum');
  const [topic, setTopic] = useState(initialTopic);
  const [subject, setSubject] = useState(initialSubject);
  const [grade, setGrade] = useState(initialGrade);
  const [board, setBoard] = useState(initialBoard);
  const [chapter, setChapter] = useState('');
  const [url, setUrl] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [result, setResult] = useState<ResearchFinding | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [targetBankId, setTargetBankId] = useState<string>('new');
  const [quotaInfo, setQuotaInfo] = useState<{ remaining: number | 'unlimited'; maxLimit: number | 'unlimited'; currentUsage: number } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTopic) setTopic(initialTopic);
      if (initialSubject) setSubject(initialSubject);
      if (initialGrade) setGrade(initialGrade);
      if (initialBoard) setBoard(initialBoard);
      checkQuota();
    }
  }, [isOpen, initialTopic, initialSubject, initialGrade, initialBoard]);

  const checkQuota = async () => {
    if (!user) return;
    try {
      const quota = await canUserPerformResearch(user, subscriptionConfig, webResearchConfig);
      setQuotaInfo({
        remaining: quota.remaining,
        maxLimit: quota.maxLimit,
        currentUsage: quota.currentUsage
      });
    } catch (err) {
      console.warn("Quota check error:", err);
    }
  };

  if (!isOpen) return null;

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && mode !== 'url') {
      setError("Please specify an academic topic or curriculum chapter.");
      return;
    }
    if (mode === 'url' && (!url.trim() || !/^https?:\/\//i.test(url.trim()))) {
      setError("Please provide a valid HTTP or HTTPS URL to extract from.");
      return;
    }

    setError(null);
    setResult(null);
    setSelectedQuestionIds(new Set());
    setSaveSuccessMsg(null);

    // Verify quota
    if (user) {
      const quota = await canUserPerformResearch(user, subscriptionConfig, webResearchConfig);
      if (!quota.allowed) {
        setError(quota.reason || "Web Research quota limit reached.");
        return;
      }
    }

    setIsLoading(true);
    setLoadingStep("Querying Google Search Grounding & Academic Sources...");

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep("Filtering Official Curriculum Documents & NCERT Benchmarks...");
      }, 1800);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep("Structuring Multi-Tier Cognitive Questions & Solutions...");
      }, 3600);

      const findings = await performIntelligentWebResearch({
        topic: topic.trim() || (url ? 'Web Extract' : 'General'),
        mode,
        subject,
        grade,
        board,
        chapter: chapter.trim() || undefined,
        url: mode === 'url' ? url.trim() : undefined,
        targetQuestionCount: questionCount,
        modelId: webResearchConfig?.researchModel || 'gemini-3-flash-preview'
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setResult(findings);

      // Pre-select all returned questions
      if (findings.suggestedQuestions && findings.suggestedQuestions.length > 0) {
        setSelectedQuestionIds(new Set(findings.suggestedQuestions.map(q => q.question_id)));
      }

      // Increment usage in Firestore
      if (user) {
        await incrementUserMonthlyResearchCount(user.uid);
        await checkQuota();
      }
    } catch (err: any) {
      console.error("[Web Research UI Error]:", err);
      setError(err.message || "Failed to complete curriculum research. Please check your network or try a more specific topic.");
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!result?.suggestedQuestions) return;
    if (selectedQuestionIds.size === result.suggestedQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(result.suggestedQuestions.map(q => q.question_id)));
    }
  };

  const getSelectedQuestions = (): Question[] => {
    if (!result?.suggestedQuestions) return [];
    return result.suggestedQuestions.filter(q => selectedQuestionIds.has(q.question_id));
  };

  const handleAddToPaper = () => {
    const selected = getSelectedQuestions();
    if (selected.length === 0) {
      setError("Please select at least one question to add to your paper.");
      return;
    }
    if (onAddQuestionsToPaper) {
      onAddQuestionsToPaper(selected);
      onClose();
    }
  };

  const handleSaveToBank = () => {
    const selected = getSelectedQuestions();
    if (selected.length === 0) {
      setError("Please select at least one question to save.");
      return;
    }
    if (onSaveQuestionsToBank) {
      onSaveQuestionsToBank(selected, targetBankId === 'new' ? undefined : targetBankId);
      setSaveSuccessMsg(`Successfully saved ${selected.length} questions to Question Bank!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const modeDescriptions: Record<ResearchMode, { title: string; desc: string; icon: any }> = {
    curriculum: {
      title: 'Curriculum & NCERT Grounding',
      desc: 'Grounds questions in official NCERT textbooks, syllabus learning outcomes, and state/central board benchmarks.',
      icon: BookOpen
    },
    deep: {
      title: 'Deep Topic Investigation',
      desc: 'Explores comprehensive core principles, case studies, formulas, and Bloom’s taxonomy cognitive levels.',
      icon: Compass
    },
    quick: {
      title: 'Quick Research',
      desc: 'Rapidly synthesizes essential concepts and high-yield examination questions with live Google search.',
      icon: Sparkles
    },
    url: {
      title: 'URL-Based Extract & Grounding',
      desc: 'Safely extracts and grounds questions directly from academic websites, question portals, or articles.',
      icon: LinkIcon
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-900 dark:text-white">
                  Intelligent Web Research & Grounding
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Live Google AI Grounding
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Ground question papers in authoritative curriculum sources, NCERT textbooks, and live web research.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {quotaInfo && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                <span>Quota:</span>
                <strong className="text-indigo-600 dark:text-indigo-400">
                  {quotaInfo.remaining === 'unlimited' ? 'Unlimited' : `${quotaInfo.remaining} left`}
                </strong>
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold p-1 rounded-lg transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Research Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Select Research Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(['curriculum', 'deep', 'quick', 'url'] as ResearchMode[]).map(m => {
                const info = modeDescriptions[m];
                const Icon = info.icon;
                const isSelected = mode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {info.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                      {info.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Research Form */}
          <form onSubmit={handleStartResearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Science, Mathematics"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Class / Grade
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. Class 10"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Education Board
                </label>
                <input
                  type="text"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  placeholder="e.g. CBSE, ICSE, State"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Questions to Formulate ({questionCount})
                </label>
                <input
                  type="range"
                  min={3}
                  max={12}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-2 mt-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {mode === 'url' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Target Academic URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/class-10-science-chapter-questions"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Academic Topic or Concepts to Ground
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Light Reflection and Refraction, Snell's Law, Ray Diagrams"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Specific Chapter (Optional)
                  </label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="e.g. Chapter 9: Light"
                    className="w-full px-3 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                {error}
              </div>
            )}

            {saveSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                {saveSuccessMsg}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Preserves grounding citations • Strict Unicode Math formatting</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Researching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Conduct Grounded Research</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
              <div className="text-sm font-black text-gray-900 dark:text-white">
                Live Google AI Grounding in Progress
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium animate-pulse">
                {loadingStep || "Analyzing authoritative curriculum sources..."}
              </p>
            </div>
          )}

          {/* Research Results */}
          {result && !isLoading && (
            <div className="space-y-6 pt-2">
              {/* Summary & Sources Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800/40 dark:via-gray-800/20 dark:to-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Curriculum Research Summary: {result.topic}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Key Concepts Pills */}
                {result.keyConcepts && result.keyConcepts.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">
                      Key Concepts Explored:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keyConcepts.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Grounding Sources */}
                {result.sources && result.sources.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">
                      Verified Curriculum & Web Sources ({result.sources.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex items-start justify-between gap-2 group text-xs"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {src.title}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono truncate">
                              {src.domain}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-1">
                            {src.authority === 'official_ncert' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                NCERT
                              </span>
                            )}
                            {src.authority === 'official_cbse' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                CBSE
                              </span>
                            )}
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Structured Questions Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white">
                      Formulated Questions ({result.suggestedQuestions?.length || 0})
                    </h3>
                    <span className="text-xs text-gray-500">
                      • {selectedQuestionIds.size} selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {selectedQuestionIds.size === (result.suggestedQuestions?.length || 0)
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  </div>
                </div>

                {/* Question Cards */}
                <div className="space-y-3">
                  {(result.suggestedQuestions || []).map((q, idx) => {
                    const isSelected = selectedQuestionIds.has(q.question_id);
                    return (
                      <div
                        key={q.question_id || idx}
                        onClick={() => toggleSelectQuestion(q.question_id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-500/50 shadow-xs'
                            : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-800 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectQuestion(q.question_id)}
                            className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />

                          <div className="space-y-2 flex-1">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {q.answer_type || 'Question'}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                              </span>
                              {q.bloom_level && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                  Bloom: {q.bloom_level}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Researched
                              </span>
                              {q.chapter && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                                  {q.chapter}
                                </span>
                              )}
                            </div>

                            {/* Question Text */}
                            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-relaxed">
                              {q.question_text}
                            </p>

                            {/* MCQ Options */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className="p-1.5 px-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 font-mono"
                                  >
                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Marking Solution */}
                            {q.solution && (
                              <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-400">
                                <strong className="text-gray-700 dark:text-gray-300">Marking Scheme:</strong> {q.solution}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        {result && (
          <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-500">Save Destination:</span>
              <select
                value={targetBankId}
                onChange={(e) => setTargetBankId(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
              >
                <option value="new">Create New Subject Bank</option>
                {existingBanks.map(b => (
                  <option key={b.id} value={b.id}>{b.subject} ({b.grade})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {onSaveQuestionsToBank && (
                <button
                  type="button"
                  onClick={handleSaveToBank}
                  disabled={selectedQuestionIds.size === 0}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Save to Bank ({selectedQuestionIds.size})</span>
                </button>
              )}

              {onAddQuestionsToPaper && (
                <button
                  type="button"
                  onClick={handleAddToPaper}
                  disabled={selectedQuestionIds.size === 0}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Paper Draft ({selectedQuestionIds.size})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
