import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  FileText, 
  PlusCircle, 
  BookOpen, 
  Settings, 
  User, 
  Sparkles, 
  Moon, 
  Sun, 
  Palette, 
  Crown, 
  Info, 
  GraduationCap, 
  HelpCircle, 
  Mail, 
  Compass, 
  RotateCcw, 
  ChevronRight, 
  Layers, 
  ArrowRight,
  Command,
  FileQuestion,
  Users
} from 'lucide-react';
import { GeneratedPaper, QuestionBank, UserProfile, AppearanceMode } from '../types';
import { isMacPlatform, getModifierLabel } from '../hooks/useGlobalShortcuts';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPaper: () => void;
  onNavigateView: (view: 'dashboard' | 'create' | 'bank' | 'appearance' | 'settings' | 'profile' | 'subscription' | 'about' | 'admin-portal') => void;
  onNavigateRoute: (route: string) => void;
  onViewPaper: (paper: GeneratedPaper) => void;
  onToggleAppearance: () => void;
  onOpenShortcutsHelp: () => void;
  onSyncSyllabus?: () => void;
  appearanceMode: AppearanceMode;
  userProfile: UserProfile | null;
  isGuest: boolean;
  isUserAdmin: boolean;
  history: GeneratedPaper[];
  questionBanks: QuestionBank[];
}

interface PaletteAction {
  id: string;
  category: 'Quick Actions' | 'Navigation' | 'Recent Papers' | 'Question Banks' | 'Curriculum & Guides';
  title: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  keywords?: string[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNewPaper,
  onNavigateView,
  onNavigateRoute,
  onViewPaper,
  onToggleAppearance,
  onOpenShortcutsHelp,
  onSyncSyllabus,
  appearanceMode,
  userProfile,
  isGuest,
  isUserAdmin,
  history,
  questionBanks,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isMac = useMemo(() => isMacPlatform(), []);
  const modKey = useMemo(() => getModifierLabel(), []);

  // Reset query and focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Construct all searchable actions
  const allActions = useMemo<PaletteAction[]>(() => {
    const actions: PaletteAction[] = [
      // Quick Actions
      {
        id: 'new-paper',
        category: 'Quick Actions',
        title: 'Create New Question Paper',
        description: 'Launch AI paper generator with syllabus & blueprint setup',
        icon: <PlusCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        shortcut: [modKey, 'N'],
        keywords: ['generate', 'create', 'new', 'exam', 'test', 'blueprint', 'curriculum', 'ai'],
        action: () => {
          onClose();
          onNewPaper();
        },
      },
      {
        id: 'toggle-appearance',
        category: 'Quick Actions',
        title: appearanceMode === 'dark' ? 'Switch to Light Appearance' : 'Switch to Dark Appearance',
        description: `Currently in ${appearanceMode} mode`,
        icon: appearanceMode === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-500" />
        ) : (
          <Moon className="w-4 h-4 text-purple-400" />
        ),
        shortcut: [modKey, '⇧', 'L'],
        keywords: ['theme', 'dark', 'light', 'appearance', 'mode', 'color'],
        action: () => {
          onClose();
          onToggleAppearance();
        },
      },
      {
        id: 'theme-studio',
        category: 'Quick Actions',
        title: 'Theme & Appearance Studio',
        description: 'Customize fluid animations, glassmorphism & gradients',
        icon: <Palette className="w-4 h-4 text-pink-500" />,
        keywords: ['appearance', 'theme', 'studio', 'color', 'background', 'glass', 'animation'],
        action: () => {
          onClose();
          onNavigateView('appearance');
        },
      },
      {
        id: 'shortcuts-cheat-sheet',
        category: 'Quick Actions',
        title: 'Keyboard Shortcuts Cheat Sheet',
        description: 'View full reference of global shortcuts & speed keys',
        icon: <Command className="w-4 h-4 text-blue-500" />,
        shortcut: ['?'],
        keywords: ['hotkeys', 'shortcuts', 'keyboard', 'help', 'cheat', 'sheet', 'keys'],
        action: () => {
          onClose();
          onOpenShortcutsHelp();
        },
      },
    ];

    if (onSyncSyllabus && userProfile?.role === 'admin') {
      actions.push({
        id: 'sync-syllabus',
        category: 'Quick Actions',
        title: 'Sync Latest Curriculum Frameworks',
        description: 'Fetch and update live CBSE / State educational standards via AI',
        icon: <RotateCcw className="w-4 h-4 text-emerald-500" />,
        keywords: ['curriculum', 'sync', 'cbse', 'syllabus', 'standards'],
        action: () => {
          onClose();
          onSyncSyllabus();
        },
      });
    }

    // Navigation & Views
    actions.push(
      {
        id: 'nav-dashboard',
        category: 'Navigation',
        title: 'Educator Workspace Dashboard',
        description: 'View overview metrics, recent papers, and activity',
        icon: <Compass className="w-4 h-4 text-indigo-500" />,
        shortcut: [modKey, '⇧', 'D'],
        keywords: ['home', 'dashboard', 'overview', 'main'],
        action: () => {
          onClose();
          onNavigateView('dashboard');
        },
      },
      {
        id: 'nav-question-bank',
        category: 'Navigation',
        title: 'Curated Question Banks',
        description: 'Browse verified chapter-wise question repositories',
        icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
        shortcut: [modKey, '⇧', 'B'],
        keywords: ['bank', 'questions', 'repository', 'mcq', 'practice'],
        action: () => {
          onClose();
          onNavigateView('bank');
        },
      },
      {
        id: 'nav-settings',
        category: 'Navigation',
        title: 'Account Settings & Preferences',
        description: 'Configure defaults, notification preferences & profiles',
        icon: <Settings className="w-4 h-4 text-slate-500" />,
        shortcut: [modKey, ','],
        keywords: ['settings', 'preferences', 'configuration', 'defaults'],
        action: () => {
          onClose();
          onNavigateView('settings');
        },
      },
      {
        id: 'nav-profile',
        category: 'Navigation',
        title: 'My Profile & Details',
        description: 'View academic bio, credentials and account information',
        icon: <User className="w-4 h-4 text-purple-500" />,
        keywords: ['profile', 'user', 'account', 'bio'],
        action: () => {
          onClose();
          onNavigateView('profile');
        },
      },
      {
        id: 'nav-subscription',
        category: 'Navigation',
        title: 'Subscription & Entitlements',
        description: 'Manage GenPaperAI Plus access, AI limits & features',
        icon: <Sparkles className="w-4 h-4 text-amber-500" />,
        keywords: ['subscription', 'plan', 'pricing', 'plus', 'pro', 'upgrade', 'billing'],
        action: () => {
          onClose();
          onNavigateView('subscription');
        },
      }
    );

    if (isUserAdmin) {
      actions.push({
        id: 'nav-admin',
        category: 'Navigation',
        title: 'Admin Command Center & Portal',
        description: 'Manage users, advertisements, telemetry & system controls',
        icon: <Crown className="w-4 h-4 text-amber-500" />,
        keywords: ['admin', 'portal', 'control', 'super', 'telemetry', 'users'],
        action: () => {
          onClose();
          onNavigateView('admin-portal');
        },
      });
    }

    // Curriculum & Public Guides
    actions.push(
      {
        id: 'nav-about',
        category: 'Curriculum & Guides',
        title: 'About GenPaperAI Platform',
        description: 'Philosophy, educational standards and architecture',
        icon: <Info className="w-4 h-4 text-blue-500" />,
        keywords: ['about', 'platform', 'vision', 'creators'],
        action: () => {
          onClose();
          onNavigateView('about');
        },
      },
      {
        id: 'nav-guide',
        category: 'Curriculum & Guides',
        title: 'Educator & Teacher Guide',
        description: 'Step-by-step handbook on blueprint design & rubric standards',
        icon: <GraduationCap className="w-4 h-4 text-teal-500" />,
        keywords: ['guide', 'educator', 'handbook', 'teachers', 'tutorial'],
        action: () => {
          onClose();
          onNavigateRoute('/guide');
        },
      },
      {
        id: 'nav-curriculum',
        category: 'Curriculum & Guides',
        title: 'Curriculum Frameworks Reference',
        description: 'CBSE, ICSE, State Boards & Bloom’s taxonomy breakdowns',
        icon: <Layers className="w-4 h-4 text-indigo-500" />,
        keywords: ['curriculum', 'frameworks', 'cbse', 'icse', 'blooms', 'syllabus'],
        action: () => {
          onClose();
          onNavigateRoute('/curriculum');
        },
      },
      {
        id: 'nav-faq',
        category: 'Curriculum & Guides',
        title: 'Frequently Asked Questions & Support',
        description: 'Answers regarding exports, watermarks, LaTeX and formulas',
        icon: <HelpCircle className="w-4 h-4 text-sky-500" />,
        keywords: ['faq', 'help', 'answers', 'support', 'questions'],
        action: () => {
          onClose();
          onNavigateRoute('/faq');
        },
      },
      {
        id: 'nav-contact',
        category: 'Curriculum & Guides',
        title: 'Contact Engineering & Support Team',
        description: 'Send feedback, feature requests or academic inquiries',
        icon: <Mail className="w-4 h-4 text-rose-500" />,
        keywords: ['contact', 'email', 'support', 'help', 'inquiry'],
        action: () => {
          onClose();
          onNavigateRoute('/contact');
        },
      }
    );

    // Recent Papers (from History)
    if (history && history.length > 0) {
      history.slice(0, 10).forEach((paper) => {
        actions.push({
          id: `paper-${paper.id}`,
          category: 'Recent Papers',
          title: paper.title || `${paper.config?.subject || 'Assessment'} - ${paper.config?.grade || 'Class'}`,
          description: `${paper.config?.subject || ''} · ${paper.config?.grade || ''} · ${paper.config?.totalMarks || 0} Marks · ${paper.questions?.length || 0} Questions`,
          icon: <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
          keywords: [
            'paper',
            'recent',
            paper.title || '',
            paper.config?.subject || '',
            paper.config?.grade || '',
            paper.config?.board || '',
          ],
          action: () => {
            onClose();
            onViewPaper(paper);
          },
        });
      });
    }

    // Curated Question Banks
    if (questionBanks && questionBanks.length > 0) {
      questionBanks.slice(0, 8).forEach((bank) => {
        const bankTitle = `${bank.subject} (${bank.grade})`;
        const qCount = bank.questions ? bank.questions.length : 0;
        actions.push({
          id: `bank-${bank.id}`,
          category: 'Question Banks',
          title: bankTitle,
          description: `${bank.board || 'Curriculum'} · ${bank.subject} · ${bank.grade} · ${qCount} Questions`,
          icon: <FileQuestion className="w-4 h-4 text-emerald-500" />,
          keywords: ['bank', bankTitle, bank.subject, bank.grade, bank.board || ''],
          action: () => {
            onClose();
            onNavigateView('bank');
          },
        });
      });
    }

    return actions;
  }, [
    userProfile,
    appearanceMode,
    isUserAdmin,
    history,
    questionBanks,
    modKey,
    onClose,
    onNewPaper,
    onToggleAppearance,
    onNavigateView,
    onNavigateRoute,
    onViewPaper,
    onOpenShortcutsHelp,
    onSyncSyllabus,
  ]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allActions;

    return allActions.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q)) || false;
      return matchTitle || matchDesc || matchCategory || matchKeywords;
    });
  }, [allActions, query]);

  // Group filtered actions by category
  const groupedActions = useMemo(() => {
    const groups: { [cat: string]: PaletteAction[] } = {};
    const categoryOrder = [
      'Quick Actions',
      'Navigation',
      'Recent Papers',
      'Question Banks',
      'Curriculum & Guides',
    ];

    categoryOrder.forEach((cat) => {
      groups[cat] = [];
    });

    filteredActions.forEach((action) => {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredActions]);

  // Handle keyboard navigation within palette
  useEffect(() => {
    if (selectedIndex >= filteredActions.length) {
      setSelectedIndex(Math.max(0, filteredActions.length - 1));
    }
  }, [filteredActions.length, selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredActions[selectedIndex];
      if (current) {
        current.action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndexCounter = 0;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Quick Navigation Command Palette"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] z-10"
          onKeyDown={handleKeyDown}
        >
          {/* Header Search Input */}
          <div className="relative flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mr-3.5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search papers, subjects, settings..."
              className="w-full bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Clear
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 ml-2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-4 max-h-[58vh] divide-y divide-slate-100 dark:divide-slate-800/60"
          >
            {groupedActions.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No matching commands found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try searching with keywords like <span className="font-semibold text-purple-600 dark:text-purple-400">"new paper"</span>, <span className="font-semibold text-purple-600 dark:text-purple-400">"theme"</span>, <span className="font-semibold text-purple-600 dark:text-purple-400">"bank"</span>, or subject names.
                </p>
              </div>
            ) : (
              groupedActions.map(([category, items]) => (
                <div key={category} className="pt-2 first:pt-0">
                  <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const itemIndex = flatIndexCounter++;
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          data-index={itemIndex}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-xs sm:text-sm font-bold truncate ${
                                  isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {item.title}
                              </p>
                              {item.description && (
                                <p
                                  className={`text-[11px] truncate ${
                                    isSelected
                                      ? 'text-white/80'
                                      : 'text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.shortcut && (
                              <div className="flex items-center gap-1">
                                {item.shortcut.map((key, i) => (
                                  <kbd
                                    key={i}
                                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                                      isSelected
                                        ? 'bg-white/20 text-white border border-white/30'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs'
                                    }`}
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            )}
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                isSelected
                                  ? 'text-white translate-x-0.5'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Palette Footer Bar */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 font-mono text-[9px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                  ↑
                </kbd>
                <kbd className="px-1 py-0.5 font-mono text-[9px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                  ↓
                </kbd>
                <span className="hidden sm:inline">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono text-[9px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                  ↵
                </kbd>
                <span className="hidden sm:inline">Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono text-[9px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                  ESC
                </kbd>
                <span className="hidden sm:inline">Close</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShortcutsHelp();
              }}
              className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer"
            >
              <span>Shortcuts Reference</span>
              <kbd className="px-1.5 py-0.5 font-mono text-[9px] font-bold bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 rounded">
                ?
              </kbd>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
