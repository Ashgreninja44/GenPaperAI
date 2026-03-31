import React from 'react';
import { GeneratedPaper, HistoryStats } from '../types';

interface DashboardProps {
  history: GeneratedPaper[];
  onCreateNew: () => void;
  onViewPaper: (paper: GeneratedPaper) => void;
  onViewBank: () => void;
  onDeletePaper: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onCreateNew, onViewPaper, onViewBank, onDeletePaper }) => {
  const stats: HistoryStats = {
    totalGenerated: history.length,
    topics: Array.from(new Set(history.map(p => p.config.subject))),
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <header className="mb-10 text-center md:text-left relative z-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">Dashboard</h1>
        <p className="text-lg text-white/90 font-medium max-w-2xl drop-shadow-sm">Manage your academic content and generate new papers with AI.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full transform hover:scale-[1.02] transition-transform">
            <div>
                <h3 className="text-xs uppercase tracking-wider text-[#8A2CB0] font-bold mb-1">Total Papers</h3>
                <p className="text-5xl font-bold text-gray-900 mt-2">{stats.totalGenerated}</p>
            </div>
            <div className="mt-4 text-xs font-medium text-gray-500">All time generated</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between md:col-span-2 h-full">
            <div>
                <h3 className="text-xs uppercase tracking-wider text-[#8A2CB0] font-bold mb-3">Recent Subjects</h3>
                <div className="flex flex-wrap gap-2">
                    {stats.topics.slice(0, 5).map((topic, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#f3e8ff] border border-[#d8b4fe] text-[#3C128D] text-sm rounded-lg font-bold shadow-sm">
                            {topic}
                        </span>
                    ))}
                    {stats.topics.length === 0 && <span className="text-gray-400 text-sm italic">No subjects yet. Generate a paper to see topics here.</span>}
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-[#3C128D]/10 text-gray-800 flex flex-col gap-4 justify-center border border-white/40">
            <h3 className="font-bold text-xl mb-2 text-[#3C128D] px-1">Quick Actions</h3>
            <button 
                onClick={onCreateNew}
                className="btn-glass btn-glass-primary px-5 py-3 rounded-lg font-bold text-sm w-full flex items-center justify-center gap-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
                <span className="text-lg">+</span> Create New Paper
            </button>
            <button 
                onClick={onViewBank}
                className="btn-glass btn-glass-accent px-5 py-3 rounded-lg font-bold text-sm w-full flex items-center justify-center gap-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all relative group/btn"
            >
                <span>Open Question Bank</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[#3C128D] text-[9px] font-black uppercase tracking-tighter shadow-sm border border-amber-500/30 transition-transform group-hover/btn:scale-110">
                  🚧 Beta
                </span>
            </button>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-[#3C128D]/10">
        <div className="p-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800">Generation History</h2>
        </div>
        
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
        ) : (
            <div className="bg-white/40 divide-y divide-gray-100">
                {history.slice().reverse().map((paper) => (
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