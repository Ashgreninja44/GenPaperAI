import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Sparkles, Navigation, Monitor, ArrowUpDown, CornerDownLeft } from 'lucide-react';
import { isMacPlatform, getModifierLabel } from '../hooks/useGlobalShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPalette?: () => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutSection {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutEntry[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onOpenPalette,
}) => {
  const modKey = useMemo(() => getModifierLabel(), []);

  const sections: ShortcutSection[] = useMemo(
    () => [
      {
        title: 'Global Navigation & Actions',
        icon: <Navigation className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
        shortcuts: [
          {
            keys: [modKey, 'K'],
            description: 'Open Quick Navigation Command Palette',
          },
          {
            keys: [modKey, 'N'],
            description: 'Start New Question Paper Generator',
          },
          {
            keys: [modKey, '⇧', 'D'],
            description: 'Jump to Main Dashboard',
          },
          {
            keys: [modKey, '⇧', 'B'],
            description: 'Jump to Curated Question Bank',
          },
          {
            keys: [modKey, ','],
            description: 'Open Settings & Preferences',
          },
        ],
      },
      {
        title: 'Appearance & System Controls',
        icon: <Monitor className="w-4 h-4 text-amber-500" />,
        shortcuts: [
          {
            keys: [modKey, '⇧', 'L'],
            description: 'Toggle Light / Dark Appearance Mode',
          },
          {
            keys: ['?'],
            description: 'Show Keyboard Shortcuts Cheat Sheet',
          },
          {
            keys: ['Esc'],
            description: 'Close active modal, dropdown, or palette',
          },
        ],
      },
      {
        title: 'Command Palette Navigation',
        icon: <ArrowUpDown className="w-4 h-4 text-emerald-500" />,
        shortcuts: [
          {
            keys: ['↑', '↓'],
            description: 'Cycle through commands and search results',
          },
          {
            keys: ['↵ Enter'],
            description: 'Execute selected command or open paper',
          },
          {
            keys: ['Esc'],
            description: 'Dismiss Command Palette',
          },
        ],
      },
    ],
    [modKey]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-7 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Command className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Speed up paper creation and workspace navigation
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sections */}
          <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
            {sections.map((section) => (
              <div key={section.title} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.icon}
                  <span>{section.title}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 sm:p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {section.shortcuts.map((sc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 sm:py-2.5 px-2 first:pt-1 last:pb-1"
                    >
                      <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                        {sc.description}
                      </span>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        {sc.keys.map((k, ki) => (
                          <kbd
                            key={ki}
                            className="px-2 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-medium">
              Tip: Press <kbd className="px-1 font-mono text-[10px] bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">{modKey}K</kbd> anywhere to access commands.
            </p>
            <div className="flex items-center gap-2">
              {onOpenPalette && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPalette();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
                >
                  Open Palette ({modKey}K)
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
