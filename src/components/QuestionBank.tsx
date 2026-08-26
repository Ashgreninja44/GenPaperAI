import React, { useState, useEffect } from 'react';
import { 
  QuestionBank, 
  StructuredQuestion, 
  Question, 
  BloomTaxonomyLevel, 
  QuestionOrigin, 
  UserProfile, 
  SubscriptionGlobalConfig, 
  WebResearchConfig 
} from '../types';
import { SYLLABUS_DATA, GRADES, BOARDS } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { generateQuestionBankUpdate } from '../services/geminiService';
import { 
  migrateBankToStructured, 
  filterStructuredQuestions, 
  smartSemanticRetrieve, 
  convertToStructuredQuestion, 
  convertToRuntimeQuestion 
} from '../services/questionBankService';
import { WebResearchModal } from './WebResearchModal';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Globe, 
  ArrowLeft, 
  Check, 
  Layers, 
  Tag, 
  HelpCircle, 
  ExternalLink, 
  FileText,
  RefreshCw,
  Edit3,
  Database
} from 'lucide-react';

interface QuestionBankProps {
  banks: QuestionBank[];
  onUpdateBank: (bank: QuestionBank) => void;
  onDeleteBank: (id: string) => void;
  onBack: () => void;
  onUseInPaper?: (questions: Question[]) => void;
  user?: UserProfile | null;
  subscriptionConfig?: SubscriptionGlobalConfig | null;
  webResearchConfig?: WebResearchConfig | null;
}

export const QuestionBankView: React.FC<QuestionBankProps> = ({ 
  banks, 
  onUpdateBank, 
  onDeleteBank, 
  onBack,
  onUseInPaper,
  user = null,
  subscriptionConfig = null,
  webResearchConfig = null
}) => {
  const [selectedBoard, setSelectedBoard] = useState<string>(BOARDS[0]);
  const [selectedClass, setSelectedClass] = useState<string>(GRADES[0] || 'Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Active View Tab: 'structured' | 'markdown'
  const [viewMode, setViewMode] = useState<'structured' | 'markdown'>('structured');

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChapter, setFilterChapter] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterBloom, setFilterBloom] = useState<string>('All');
  const [filterOrigin, setFilterOrigin] = useState<string>('All');
  const [filterMarks, setFilterMarks] = useState<number>(0);

  // Selection for Paper Generator Integration
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Web Research Modal state
  const [showWebResearchModal, setShowWebResearchModal] = useState(false);

  // Add Question Modal state
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('Short Answer');
  const [newQuestionMarks, setNewQuestionMarks] = useState(2);
  const [newQuestionBloom, setNewQuestionBloom] = useState<BloomTaxonomyLevel>('Understand');
  const [newQuestionChapter, setNewQuestionChapter] = useState('');
  const [newQuestionTopic, setNewQuestionTopic] = useState('');
  const [newQuestionSolution, setNewQuestionSolution] = useState('');
  const [newQuestionOptions, setNewQuestionOptions] = useState(['', '', '', '']);

  // Construct precise subject name
  const displaySubjectName = selectedSubject;

  // Board and class subjects
  const boardData = SYLLABUS_DATA[selectedBoard];
  const classData = boardData ? boardData[selectedClass] as any : null;
  const availableSubjects: string[] = classData ? Object.keys(classData) : [];

  // Default subject on mount
  useEffect(() => {
    if (availableSubjects.length > 0 && (!selectedSubject || !availableSubjects.includes(selectedSubject))) {
      setSelectedSubject(availableSubjects[0]);
    }
  }, [selectedBoard, selectedClass, availableSubjects.length]);

  // Find existing bank matching criteria
  const currentBank = banks.find(b => 
    b.subject === displaySubjectName && 
    b.grade === selectedClass && 
    (b.board === selectedBoard || (!b.board && selectedBoard === BOARDS[0]))
  );

  // Auto-extract available chapters from existing questions
  const availableChapters = React.useMemo(() => {
    if (!currentBank?.questions) return [];
    const chapters = new Set<string>();
    currentBank.questions.forEach(q => {
      if (q.chapter) chapters.add(q.chapter);
    });
    return Array.from(chapters);
  }, [currentBank]);

  // Filtered Questions
  const filteredQuestions = React.useMemo(() => {
    if (!currentBank?.questions) return [];
    return filterStructuredQuestions(currentBank.questions, {
      searchQuery,
      chapter: filterChapter,
      type: filterType,
      bloomLevel: filterBloom === 'All' ? undefined : (filterBloom as BloomTaxonomyLevel),
      origin: filterOrigin === 'All' ? undefined : (filterOrigin as QuestionOrigin),
      marks: filterMarks > 0 ? filterMarks : undefined
    });
  }, [currentBank?.questions, searchQuery, filterChapter, filterType, filterBloom, filterOrigin, filterMarks]);

  // Migrate legacy markdown bank to structured
  const handleMigrateBank = async () => {
    if (!currentBank) return;
    setIsMigrating(true);
    try {
      const migrated = await migrateBankToStructured(currentBank);
      onUpdateBank(migrated);
    } catch (err) {
      console.error("Migration error:", err);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleUpdateWithAI = async () => {
    if (!selectedSubject || !selectedClass) return;
    
    setIsUpdating(true);
    try {
      const newContent = await generateQuestionBankUpdate(displaySubjectName, selectedClass, selectedBoard);
      
      const rawBank: QuestionBank = currentBank 
        ? {
            ...currentBank,
            board: selectedBoard,
            lastUpdated: Date.now(),
            content: `### Update: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n${newContent}\n\n---\n\n${currentBank.content}`
          }
        : {
            id: crypto.randomUUID(),
            board: selectedBoard,
            subject: displaySubjectName,
            grade: selectedClass,
            lastUpdated: Date.now(),
            content: `### Question Bank: ${displaySubjectName} (${selectedClass}) - ${selectedBoard}\n\n${newContent}`
          };
      
      // Migrate immediately to structured questions
      const structuredBank = await migrateBankToStructured(rawBank);
      onUpdateBank(structuredBank);
    } catch (error) {
      console.error(error);
      alert("Failed to update question bank. Please check your network connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveResearchedQuestions = (researchedQuestions: Question[]) => {
    const structuredList = researchedQuestions.map(q => 
      convertToStructuredQuestion(q, {
        subject: displaySubjectName,
        grade: selectedClass,
        board: selectedBoard,
        chapter: q.chapter || displaySubjectName
      })
    );

    const updatedBank: QuestionBank = currentBank
      ? {
          ...currentBank,
          lastUpdated: Date.now(),
          questions: [...(currentBank.questions || []), ...structuredList]
        }
      : {
          id: crypto.randomUUID(),
          board: selectedBoard,
          subject: displaySubjectName,
          grade: selectedClass,
          lastUpdated: Date.now(),
          content: `### Question Bank: ${displaySubjectName} (${selectedClass})\n\nResearched via Web Grounding.`,
          questions: structuredList,
          version: 2
        };

    onUpdateBank(updatedBank);
  };

  const handleAddManualQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newSq: StructuredQuestion = {
      id: `q_manual_${Date.now()}`,
      text: newQuestionText.trim(),
      subject: displaySubjectName,
      grade: selectedClass,
      board: selectedBoard,
      chapter: newQuestionChapter.trim() || 'General',
      topic: newQuestionTopic.trim() || 'General',
      type: newQuestionType,
      marks: Number(newQuestionMarks) || 1,
      difficulty: 3,
      bloomLevel: newQuestionBloom,
      origin: 'user_created',
      solution: newQuestionSolution.trim() || undefined,
      options: newQuestionType === 'MCQ' ? newQuestionOptions.filter(o => o.trim().length > 0) : undefined,
      tags: [displaySubjectName, selectedClass],
      createdAt: Date.now(),
      isVerified: true
    };

    const updatedBank: QuestionBank = currentBank
      ? {
          ...currentBank,
          lastUpdated: Date.now(),
          questions: [newSq, ...(currentBank.questions || [])]
        }
      : {
          id: crypto.randomUUID(),
          board: selectedBoard,
          subject: displaySubjectName,
          grade: selectedClass,
          lastUpdated: Date.now(),
          content: `### Question Bank: ${displaySubjectName} (${selectedClass})`,
          questions: [newSq],
          version: 2
        };

    onUpdateBank(updatedBank);
    setShowAddQuestionModal(false);
    setNewQuestionText('');
    setNewQuestionSolution('');
  };

  const handleDeleteSingleQuestion = (questionId: string) => {
    if (!currentBank?.questions) return;
    const remaining = currentBank.questions.filter(q => q.id !== questionId);
    onUpdateBank({
      ...currentBank,
      questions: remaining,
      lastUpdated: Date.now()
    });
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
    if (selectedQuestionIds.size === filteredQuestions.length) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleSendToPaper = () => {
    if (!onUseInPaper || !currentBank?.questions) return;
    const selected = currentBank.questions
      .filter(q => selectedQuestionIds.has(q.id))
      .map(convertToRuntimeQuestion);
    
    if (selected.length === 0) return;
    onUseInPaper(selected);
  };

  const handleDownload = () => {
    if (!currentBank) return;
    const blob = new Blob([currentBank.content || JSON.stringify(currentBank.questions, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuestionBank_${currentBank.subject.replace(/[^a-zA-Z0-9]/g, '_')}_${currentBank.grade}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button 
          onClick={onBack}
          className="text-white hover:text-white/80 flex items-center gap-2 font-medium drop-shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWebResearchModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>Web Research & Grounding</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5 rounded-2xl bg-white/95 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm border-b border-gray-100 dark:border-gray-800 pb-2.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Curriculum Scope
            </h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                  Board
                </label>
                <select 
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold"
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                >
                  {BOARDS.map(board => (
                    <option key={board} value={board}>{board}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                  Class / Grade
                </label>
                <select 
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  {GRADES.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                  Subject
                </label>
                <select 
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold disabled:opacity-50"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {availableSubjects.map(subj => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleUpdateWithAI}
                disabled={!selectedSubject || isUpdating}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentBank ? 'Generate More with AI' : 'Generate Question Bank'}</span>
                  </>
                )}
              </button>

              {currentBank && (
                <button
                  onClick={() => setShowAddQuestionModal(true)}
                  className="w-full py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Manual Question</span>
                </button>
              )}
            </div>
          </div>
          
          {currentBank && (
            <div className="glass-panel p-4 rounded-2xl bg-white/95 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-700 dark:text-purple-400">Repository Status</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>
              <div className="text-gray-500 space-y-1">
                <div>Total Questions: <strong>{currentBank.questions?.length || 'Markdown View'}</strong></div>
                <div>Last Updated: {new Date(currentBank.lastUpdated).toLocaleDateString()}</div>
              </div>

              {/* Migrate button if only markdown exists */}
              {(!currentBank.questions || currentBank.questions.length === 0) && currentBank.content && (
                <button
                  onClick={handleMigrateBank}
                  disabled={isMigrating}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                  <span>{isMigrating ? 'Migrating...' : 'Migrate to Structured Bank'}</span>
                </button>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button 
                  onClick={handleDownload}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export (.txt)
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this entire question bank?")) {
                      onDeleteBank(currentBank.id);
                    }
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {currentBank ? (
            <div className="glass-panel rounded-2xl bg-white/95 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              
              {/* Top View Bar */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="flex items-center gap-2">
                  <div className="flex p-1 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-bold">
                    <button
                      onClick={() => setViewMode('structured')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === 'structured'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Structured Database ({currentBank.questions?.length || 0})
                    </button>
                    <button
                      onClick={() => setViewMode('markdown')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        viewMode === 'markdown'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Raw Document View
                    </button>
                  </div>
                </div>

                {viewMode === 'structured' && onUseInPaper && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      {selectedQuestionIds.size === filteredQuestions.length && filteredQuestions.length > 0
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>

                    <button
                      onClick={handleSendToPaper}
                      disabled={selectedQuestionIds.size === 0}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Use in Paper ({selectedQuestionIds.size})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* View 1: Structured Questions with Filtering */}
              {viewMode === 'structured' ? (
                <div className="p-4 sm:p-6 space-y-4 flex-1">
                  {/* Filter & Search Controls */}
                  <div className="space-y-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions by keyword, topic, Bloom taxonomy, or question type..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Chapter
                        </label>
                        <select
                          value={filterChapter}
                          onChange={(e) => setFilterChapter(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        >
                          <option value="All">All Chapters</option>
                          {availableChapters.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Question Type
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        >
                          <option value="All">All Types</option>
                          <option value="MCQ">MCQ</option>
                          <option value="Assertion-Reason">Assertion-Reason</option>
                          <option value="Short">Short Answer</option>
                          <option value="Long">Long Answer</option>
                          <option value="Case Study">Case Study</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Bloom's Taxonomy
                        </label>
                        <select
                          value={filterBloom}
                          onChange={(e) => setFilterBloom(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        >
                          <option value="All">All Cognitive Levels</option>
                          <option value="Remember">Remember</option>
                          <option value="Understand">Understand</option>
                          <option value="Apply">Apply</option>
                          <option value="Analyze">Analyze</option>
                          <option value="Evaluate">Evaluate</option>
                          <option value="Create">Create</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Origin / Source
                        </label>
                        <select
                          value={filterOrigin}
                          onChange={(e) => setFilterOrigin(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                        >
                          <option value="All">All Sources</option>
                          <option value="web_researched">Web Researched</option>
                          <option value="question_bank">AI Generated</option>
                          <option value="user_created">User Created</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Questions Grid/List */}
                  {filteredQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredQuestions.map((q) => {
                        const isSelected = selectedQuestionIds.has(q.id);
                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-2xl border transition-all ${
                              isSelected
                                ? 'bg-purple-50/30 dark:bg-purple-950/20 border-purple-500/50 shadow-xs'
                                : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-800'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {onUseInPaper && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectQuestion(q.id)}
                                  className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                />
                              )}

                              <div className="space-y-2 flex-1">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    {q.type}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                                  </span>
                                  {q.bloomLevel && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                      Bloom: {q.bloomLevel}
                                    </span>
                                  )}
                                  {q.origin === 'web_researched' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                      <Globe className="w-2.5 h-2.5" /> Web Grounded
                                    </span>
                                  )}
                                  {q.chapter && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
                                      {q.chapter}
                                    </span>
                                  )}
                                </div>

                                {/* Question Text */}
                                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-relaxed">
                                  {q.text}
                                </p>

                                {/* Options if MCQ */}
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

                                {/* Solution */}
                                {q.solution && (
                                  <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-400">
                                    <strong className="text-gray-700 dark:text-gray-300">Solution:</strong> {q.solution}
                                  </div>
                                )}

                                {/* Source citation */}
                                {q.sourceInfo?.url && (
                                  <div className="text-[10px] text-gray-400 flex items-center gap-1 pt-1">
                                    <span>Source:</span>
                                    <a
                                      href={q.sourceInfo.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5"
                                    >
                                      {q.sourceInfo.title || q.sourceInfo.domain || 'Curriculum Reference'}
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => handleDeleteSingleQuestion(q.id)}
                                className="text-gray-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                                title="Remove question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-2">
                      <p className="text-xs text-gray-500">
                        {currentBank.questions?.length === 0 
                          ? "This Question Bank is in document format. Click 'Migrate to Structured Bank' or 'Generate with AI' to populate structured items."
                          : "No questions match your current search/filter criteria."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* View 2: Raw Document / Markdown View */
                <div className="p-8 paper-font overflow-y-auto max-h-[800px] flex-1 bg-white dark:bg-gray-900">
                  <MarkdownRenderer content={currentBank.content || "No raw text available."} />
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl min-h-[600px] flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-white/95 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/40 rounded-2xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                Question Bank Repository Ready
              </h3>
              <p className="max-w-md mt-1.5 text-xs text-gray-500 leading-relaxed">
                Select a Class and Subject from the sidebar, then click <strong>Generate Question Bank</strong> or <strong>Web Research & Grounding</strong> to build your curriculum bank.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Web Research Modal */}
      <WebResearchModal
        isOpen={showWebResearchModal}
        onClose={() => setShowWebResearchModal(false)}
        onAddQuestionsToPaper={onUseInPaper}
        onSaveQuestionsToBank={handleSaveResearchedQuestions}
        user={user}
        subscriptionConfig={subscriptionConfig}
        webResearchConfig={webResearchConfig}
        existingBanks={banks}
        initialSubject={selectedSubject}
        initialGrade={selectedClass}
        initialBoard={selectedBoard}
      />

      {/* Add Manual Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" />
                Add Question to Bank
              </h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Question Text (Unicode Math Allowed: √, ², π)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Enter academic question statement..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Question Type
                  </label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Assertion-Reason">Assertion-Reason</option>
                    <option value="Very Short Answer">Very Short Answer</option>
                    <option value="Short Answer">Short Answer</option>
                    <option value="Long Answer">Long Answer</option>
                    <option value="Case Study">Case Study</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newQuestionMarks}
                    onChange={(e) => setNewQuestionMarks(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Bloom's Taxonomy
                  </label>
                  <select
                    value={newQuestionBloom}
                    onChange={(e) => setNewQuestionBloom(e.target.value as BloomTaxonomyLevel)}
                    className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium"
                  >
                    <option value="Remember">Remember</option>
                    <option value="Understand">Understand</option>
                    <option value="Apply">Apply</option>
                    <option value="Analyze">Analyze</option>
                    <option value="Evaluate">Evaluate</option>
                    <option value="Create">Create</option>
                  </select>
                </div>
              </div>

              {newQuestionType === 'MCQ' && (
                <div className="space-y-1.5 pt-1">
                  <label className="block font-bold text-gray-700 dark:text-gray-300">
                    Multiple Choice Options
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {newQuestionOptions.map((opt, optIdx) => (
                      <input
                        key={optIdx}
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newQuestionOptions];
                          updated[optIdx] = e.target.value;
                          setNewQuestionOptions(updated);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Chapter Name
                  </label>
                  <input
                    type="text"
                    value={newQuestionChapter}
                    onChange={(e) => setNewQuestionChapter(e.target.value)}
                    placeholder="e.g. Chemical Reactions"
                    className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Topic / Subtopic
                  </label>
                  <input
                    type="text"
                    value={newQuestionTopic}
                    onChange={(e) => setNewQuestionTopic(e.target.value)}
                    placeholder="e.g. Types of Reactions"
                    className="w-full px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Marking Scheme / Solution
                </label>
                <textarea
                  rows={2}
                  value={newQuestionSolution}
                  onChange={(e) => setNewQuestionSolution(e.target.value)}
                  placeholder="Expected answer points or step-by-step marking justification..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default QuestionBankView;
