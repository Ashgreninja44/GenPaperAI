import React, { useState, useMemo } from 'react';
import { GeneratedPaper } from '../types';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface DashboardProps {
  history: GeneratedPaper[];
  onCreateNew: () => void;
  onViewPaper: (paper: GeneratedPaper) => void;
  onViewBank: () => void;
  onDeletePaper: (id: string) => void;
  isGuest?: boolean;
  onRequireAuth?: (feature: 'download' | 'bank' | 'web-extract' | 'save' | 'customization' | 'general', customMessage?: string) => void;
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
  onCreateNew, 
  onViewPaper, 
  onViewBank, 
  onDeletePaper,
  isGuest = false,
  onRequireAuth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');

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
    <div className="max-w-6xl mx-auto animate-fade-in">
      <header className="mb-8 text-center md:text-left relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">Dashboard</h1>
        <p className="text-sm sm:text-base text-white/90 font-medium max-w-2xl drop-shadow-sm">Manage your academic content and generate new papers with AI.</p>
      </header>

      {/* Stats & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between transform hover:scale-[1.01] transition-transform">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#8A2CB0] font-bold mb-1">Total Papers</h3>
            <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2">{history.length}</p>
          </div>
          <div className="mt-4 text-xs font-semibold text-gray-500 flex items-center justify-between">
            <span>All time generated</span>
            <span className="text-[#3C128D] font-bold bg-[#f3e8ff] px-2.5 py-0.5 rounded-full border border-[#d8b4fe] text-[11px]">
              {history.length} {history.length === 1 ? 'Paper' : 'Papers'}
            </span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between md:col-span-2 text-gray-800 border border-white/40">
          <div>
            <h3 className="font-bold text-lg text-[#3C128D] mb-1">Quick Actions</h3>
            <p className="text-xs text-gray-500 font-medium mb-4">Create comprehensive question papers or access curated question banks</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button 
              onClick={onCreateNew}
              className="btn-glass btn-glass-primary px-5 py-3 rounded-xl font-bold text-sm w-full flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="text-lg font-black leading-none">+</span> 
              <span>Create New Paper</span>
            </button>
            <button 
              onClick={() => {
                if (isGuest && onRequireAuth) {
                  onRequireAuth('bank', 'Sign in with Google, Microsoft, or Email to access curated Question Banks.');
                  return;
                }
                onViewBank();
              }}
              className="btn-glass btn-glass-accent px-5 py-3 rounded-xl font-bold text-sm w-full flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all relative group/btn cursor-pointer"
            >
              <span>Open Question Bank</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[#3C128D] text-[9px] font-black uppercase tracking-tighter shadow-sm border border-amber-500/30 transition-transform group-hover/btn:scale-110">
                🚧 Beta
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Guest Mode Session Notice */}
      {isGuest && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 text-lg font-bold">
              👤
            </div>
            <div>
              <h4 className="text-sm font-black flex items-center gap-2">
                <span>Guest Mode Active</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-[#3C128D] font-bold uppercase tracking-wider">Temporary</span>
              </h4>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/80 font-medium mt-0.5">
                Papers generated in guest mode are saved in this session only. Sign in to preserve them permanently and download PDFs.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onRequireAuth?.('save', 'Sign in to save your question papers to your permanent account history.')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-black hover:opacity-95 transition-all whitespace-nowrap shadow-md cursor-pointer shrink-0"
          >
            Sign In to Save Papers
          </button>
        </div>
      )}

      {/* History Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-[#3C128D]/10">
        <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">
                Your Papers
            </h2>
        </div>

        {history.length > 0 && (
          <div className="p-6 border-b border-gray-100 bg-white/30 backdrop-blur-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            {/* Search Input Container */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:ring-2 focus:ring-[#8A2CB0]/20 focus:border-[#8A2CB0] outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm font-medium"
                placeholder="Search your papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Sort Control Container */}
            <div className="relative w-full sm:w-64 flex items-center gap-2">
              <div className="relative w-full">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-gray-700 font-bold text-sm focus:ring-2 focus:ring-[#8A2CB0]/20 focus:border-[#8A2CB0] outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="newest">Newest → Oldest</option>
                  <option value="oldest">Oldest → Newest</option>
                  <option value="classAsc">Class: Low → High</option>
                  <option value="classDesc">Class: High → Low</option>
                  <option value="subjectAsc">Subject: A → Z</option>
                  <option value="subjectDesc">Subject: Z → A</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {history.length === 0 ? (
            <div className="p-16 text-center text-gray-500 bg-white/40">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-lg font-medium text-gray-600">No papers generated yet</p>
                <p className="text-sm mt-1 text-gray-400">Click "Create New Paper" to get started.</p>
            </div>
        ) : filteredAndSortedHistory.length === 0 ? (
            <div className="p-16 text-center text-gray-500 bg-white/40 border-t border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#f3e8ff] rounded-full flex items-center justify-center mb-4 text-[#8A2CB0]">
                    <Search className="w-8 h-8" />
                </div>
                <p className="text-xl font-extrabold text-gray-800">No papers found</p>
                <p className="text-sm mt-2 text-gray-500 max-w-sm">
                    Try searching with a different title, subject, chapter, or class.
                </p>
                <button
                    onClick={() => setSearchQuery('')}
                    className="mt-6 px-5 py-2.5 bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:from-[#3C128D]/90 hover:to-[#8A2CB0]/90 transition-all transform hover:-translate-y-0.5"
                >
                    Clear Search
                </button>
            </div>
        ) : (
            <div className="bg-white/40 divide-y divide-gray-100">
                {filteredAndSortedHistory.map((paper) => (
                    <div key={paper.id} className="p-6 hover:bg-white/60 transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Title + Subtitle */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate max-w-xl leading-tight text-lg group-hover:text-[#3C128D] transition-colors">
                                {paper.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm text-gray-500 font-medium">{paper.config.subject}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Chapter Based</span>
                            </div>
                        </div>

                        {/* Right Section: Badge, Marks, Date, Button */}
                        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4 lg:gap-12 w-full lg:w-auto">
                            {/* Class Badge */}
                            <div className="flex-shrink-0">
                                <span className="px-4 py-1.5 rounded-full bg-[#f3e8ff] text-[#3C128D] border border-[#d8b4fe] text-[11px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                                    {paper.config.grade}
                                </span>
                            </div>

                            {/* Marks */}
                            <div className="flex flex-col items-start lg:items-center min-w-[60px]">
                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Marks</span>
                                <span className="text-gray-900 font-extrabold text-base">{paper.config.totalMarks}</span>
                            </div>

                            {/* Date */}
                            <div className="flex flex-col items-start lg:items-center min-w-[90px]">
                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Created</span>
                                <span className="text-gray-600 text-sm font-bold">{new Date(paper.timestamp).toLocaleDateString()}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 ml-auto lg:ml-0">
                                <button 
                                    onClick={() => onViewPaper(paper)}
                                    className="btn-glass btn-glass-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-indigo-500/20"
                                >
                                    View Paper
                                </button>
                                <button 
                                    onClick={() => {
                                        if(window.confirm("Are you sure you want to delete this paper?")) {
                                            onDeletePaper(paper.id);
                                        }
                                    }}
                                    className="text-rose-500 hover:text-rose-700 p-2.5 rounded-xl hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                                    title="Delete Paper"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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