import React, { useState, useMemo } from 'react';
import { GeneratedPaper, UserProfile } from '../types';
import { Search, X, ArrowUpDown, LogOut, Sparkles, FileText, Plus } from 'lucide-react';
import { getModifierLabel } from '../hooks/useGlobalShortcuts';

interface DashboardProps {
  history: GeneratedPaper[];
  userProfile?: UserProfile | null;
  onCreateNew: () => void;
  onViewPaper: (paper: GeneratedPaper) => void;
  onViewBank: () => void;
  onDeletePaper: (id: string) => void;
  isGuest?: boolean;
  onRequireAuth?: (feature: 'download' | 'bank' | 'web-extract' | 'save' | 'customization' | 'general', customMessage?: string) => void;
  onExitGuestMode?: () => void;
}

const getClassNumber = (grade: string): number => {
  if (!grade) return 0;
  const match = grade.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const normalizeClass = (str: string): string => {
  return str.toLowerCase()
    .replace(/\b(\d+)th\b/g, '$1') // 10th -> 10
    .replace(/\bclass\s+(\d+)\b/g, '$1') // class 10 -> 10
    .replace(/\b(\d+)\s+class\b/g, '$1'); // 10 class -> 10
};

const Dashboard: React.FC<DashboardProps> = ({ 
  history, 
  userProfile,
  onCreateNew, 
  onViewPaper, 
  onViewBank, 
  onDeletePaper,
  isGuest = false,
  onRequireAuth,
  onExitGuestMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const modKey = useMemo(() => getModifierLabel(), []);

  const filteredAndSortedHistory = useMemo(() => {
    const queryLower = searchQuery.toLowerCase().trim();
    const queryNorm = normalizeClass(queryLower);

    let result = history;

    // 1. Filter
    if (queryLower) {
      result = history.filter((paper) => {
        const title = (paper.title || '').toLowerCase();
        const subject = (paper.config?.subject || '').toLowerCase();
        const grade = (paper.config?.grade || '').toLowerCase();
        const gradeNorm = normalizeClass(grade);
        const testType = (paper.config?.testType || '').toLowerCase();

        // Check if any question topic matches (in case questions exist)
        const questionTopicMatch = paper.questions?.some(q => 
          (q.topic || '').toLowerCase().includes(queryLower)
        ) || false;

        return title.includes(queryLower) ||
               subject.includes(queryLower) ||
               grade.includes(queryLower) ||
               gradeNorm.includes(queryNorm) ||
               testType.includes(queryLower) ||
               questionTopicMatch;
      });
    }

    // 2. Sort
    return result.slice().sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'classAsc': {
          const aClass = getClassNumber(a.config?.grade || '');
          const bClass = getClassNumber(b.config?.grade || '');
          if (aClass !== bClass) return aClass - bClass;
          return b.timestamp - a.timestamp; // Sub-sort by newest first
        }
        case 'classDesc': {
          const aClass = getClassNumber(a.config?.grade || '');
          const bClass = getClassNumber(b.config?.grade || '');
          if (aClass !== bClass) return bClass - aClass;
          return b.timestamp - a.timestamp; // Sub-sort by newest first
        }
        case 'subjectAsc': {
          const aSub = (a.config?.subject || '').toLowerCase();
          const bSub = (b.config?.subject || '').toLowerCase();
          const comp = aSub.localeCompare(bSub);
          if (comp !== 0) return comp;
          return b.timestamp - a.timestamp; // Sub-sort by newest first
        }
        case 'subjectDesc': {
          const aSub = (a.config?.subject || '').toLowerCase();
          const bSub = (b.config?.subject || '').toLowerCase();
          const comp = bSub.localeCompare(aSub);
          if (comp !== 0) return comp;
          return b.timestamp - a.timestamp; // Sub-sort by newest first
        }
        case 'newest':
        default:
          return b.timestamp - a.timestamp;
      }
    });
  }, [history, searchQuery, sortBy]);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-foreground drop-shadow-sm tracking-tight mb-2">
            Educator Workspace
          </h1>
          <p className="text-sm sm:text-base text-theme-foreground-muted font-medium max-w-2xl">
            Create curriculum-aligned examination papers, blueprints, marking schemes, and answer keys.
          </p>
        </div>
      </header>

      {/* Stats & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col justify-between transform hover:scale-[1.01] transition-transform">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#8A2CB0] dark:text-purple-300 font-bold mb-1">Total Papers</h3>
            <p className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">{history.length}</p>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>All time generated</span>
            <span className="text-[#3C128D] dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 text-[11px]">
              {history.length} {history.length === 1 ? 'Paper' : 'Papers'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl flex flex-col justify-between md:col-span-2 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
          <div>
            <h3 className="font-bold text-lg text-[#3C128D] dark:text-purple-300 mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4">Generate comprehensive examinations with instant blueprint calculation or browse verified questions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button 
              onClick={onCreateNew}
              className="px-4 py-3 rounded-xl font-bold text-xs sm:text-sm w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md hover:shadow-lg hover:from-[#320f78] hover:to-[#78249a] transform hover:-translate-y-0.5 transition-all cursor-pointer"
              title={`Create New Question Paper (${modKey}N)`}
            >
              <span className="text-base font-black leading-none">+</span> 
              <span>Create Paper</span>
              <kbd className="hidden sm:inline-flex items-center ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white/20 text-white rounded border border-white/30">
                {modKey}N
              </kbd>
            </button>
            <button 
              onClick={() => {
                if (isGuest && onRequireAuth) {
                  onRequireAuth('bank', 'Sign in with Google, Microsoft, or Email to access curated Question Banks.');
                  return;
                }
                onViewBank();
              }}
              className="px-4 py-3 rounded-xl font-bold text-xs sm:text-sm w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all relative group/btn cursor-pointer"
            >
              <span>Question Bank</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[#3C128D] text-[9px] font-black uppercase tracking-tighter shadow-sm border border-amber-500/30 transition-transform group-hover/btn:scale-110">
                🚧 Beta
              </span>
            </button>
          </div>
        </div>
      </div>

          {/* Guest Mode Session Notice */}
          {isGuest && (
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 text-xl font-black shadow-sm">
                  👤
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold flex items-center gap-2 text-amber-950 dark:text-white">
                    <span>Guest Mode Active</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold uppercase tracking-wider">Temporary</span>
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mt-0.5 leading-relaxed max-w-2xl">
                    Papers generated in guest mode are saved in this session only. Sign in to preserve them permanently and download PDFs.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
                {onExitGuestMode && (
                  <button 
                    id="btn-exit-guest-mode-banner"
                    type="button"
                    onClick={onExitGuestMode}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-200 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                    title="Exit Guest Mode & Return to Home"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
                    <span>Exit Guest Mode</span>
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => onRequireAuth?.('save', 'Sign in to save your question papers to your permanent account history.')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all whitespace-nowrap shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sign In to Save</span>
                </button>
              </div>
            </div>
          )}


          {/* History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Your Papers
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {filteredAndSortedHistory.length} of {history.length} {history.length === 1 ? 'paper' : 'papers'}
            </span>
        </div>

        {history.length > 0 && (
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input Container */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-[#8A2CB0]/25 focus:border-[#8A2CB0] outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm font-medium"
                placeholder={`Search your papers... (${modKey}K for command palette)`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Control Container */}
            <div className="relative w-full sm:w-60 flex items-center gap-2">
              <div className="relative w-full">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-[#8A2CB0]/25 focus:border-[#8A2CB0] outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="newest">Newest → Oldest</option>
                  <option value="oldest">Oldest → Newest</option>
                  <option value="classAsc">Class: Low → High</option>
                  <option value="classDesc">Class: High → Low</option>
                  <option value="subjectAsc">Subject: A → Z</option>
                  <option value="subjectDesc">Subject: Z → A</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {history.length === 0 ? (
            <div className="p-16 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 dark:text-slate-500">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">No papers generated yet</p>
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Click "Create New Paper" to get started.</p>
            </div>
        ) : filteredAndSortedHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/60 rounded-full flex items-center justify-center mb-3 text-[#8A2CB0] dark:text-purple-300">
                    <Search className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">No papers found</p>
                <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 max-w-sm">
                    Try searching with a different title, subject, chapter, or class.
                </p>
                <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                    Clear Search
                </button>
            </div>
        ) : (
            <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-white/10">
                {filteredAndSortedHistory.map((paper) => (
                    <div key={paper.id} className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Title + Subtitle */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-xl leading-snug text-base group-hover:text-[#3C128D] dark:group-hover:text-purple-300 transition-colors">
                                {paper.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{paper.config.subject}</span>
                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{paper.config.testType || 'Chapter Based'}</span>
                            </div>
                        </div>

                        {/* Right Section: Badge, Marks, Date, Button */}
                        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-8 w-full lg:w-auto">
                            {/* Class Badge */}
                            <div className="flex-shrink-0">
                                <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-[#3C128D] dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                                    {paper.config.grade}
                                </span>
                            </div>

                            {/* Marks */}
                            <div className="flex flex-col items-start lg:items-center min-w-[50px]">
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Marks</span>
                                <span className="text-slate-900 dark:text-slate-100 font-extrabold text-sm sm:text-base">{paper.config.totalMarks}</span>
                            </div>

                            {/* Date */}
                            <div className="flex flex-col items-start lg:items-center min-w-[80px]">
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest">Created</span>
                                <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">{new Date(paper.timestamp).toLocaleDateString()}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 ml-auto lg:ml-0">
                                <button 
                                    onClick={() => onViewPaper(paper)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#320f78] hover:to-[#78249a] shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                                >
                                    View Paper
                                </button>
                                <button 
                                    onClick={() => {
                                        if(window.confirm("Are you sure you want to delete this paper?")) {
                                            onDeletePaper(paper.id);
                                        }
                                    }}
                                    className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40 cursor-pointer"
                                    title="Delete Paper"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;