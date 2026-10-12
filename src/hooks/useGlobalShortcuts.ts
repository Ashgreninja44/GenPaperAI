import { useEffect, useCallback } from 'react';

export const isMacPlatform = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || navigator.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(platform);
};

export const getModifierLabel = (): string => {
  return isMacPlatform() ? '⌘' : 'Ctrl';
};

interface UseGlobalShortcutsOptions {
  onOpenPalette: () => void;
  onNewPaper: () => void;
  onToggleTheme?: () => void;
  onGoToDashboard?: () => void;
  onGoToBank?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  onCloseModals?: () => void;
  isPaletteOpen?: boolean;
}

export function useGlobalShortcuts({
  onOpenPalette,
  onNewPaper,
  onToggleTheme,
  onGoToDashboard,
  onGoToBank,
  onOpenSettings,
  onOpenHelp,
  onCloseModals,
  isPaletteOpen = false,
}: UseGlobalShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = isMacPlatform();
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // 1. ESCAPE: Close palette or modals
      if (e.key === 'Escape') {
        if (onCloseModals) {
          onCloseModals();
        }
        return;
      }

      // 2. CMD+K / CTRL+K: Open Quick Navigation Command Palette (Always intercept, even in inputs)
      if (modifier && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        onOpenPalette();
        return;
      }

      // 3. CMD+N / CTRL+N: Start New Question Paper (Always intercept to prevent browser new window)
      if (modifier && !e.shiftKey && !e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        e.stopPropagation();
        onNewPaper();
        return;
      }

      // 4. CMD+SHIFT+L or CMD+SHIFT+T: Toggle Appearance / Theme Mode
      if (modifier && e.shiftKey && (e.key === 'l' || e.key === 'L' || e.key === 't' || e.key === 'T')) {
        if (onToggleTheme) {
          e.preventDefault();
          e.stopPropagation();
          onToggleTheme();
          return;
        }
      }

      // 5. CMD+SHIFT+D: Go to Dashboard
      if (modifier && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
        if (onGoToDashboard) {
          e.preventDefault();
          e.stopPropagation();
          onGoToDashboard();
          return;
        }
      }

      // 6. CMD+SHIFT+B: Go to Question Bank
      if (modifier && e.shiftKey && (e.key === 'b' || e.key === 'B')) {
        if (onGoToBank) {
          e.preventDefault();
          e.stopPropagation();
          onGoToBank();
          return;
        }
      }

      // 7. CMD+,: Open Settings
      if (modifier && e.key === ',') {
        if (onOpenSettings) {
          e.preventDefault();
          e.stopPropagation();
          onOpenSettings();
          return;
        }
      }

      // 8. CMD+/ or '?' (only if not typing in editable fields): Open Keyboard Shortcuts Help
      if (
        (modifier && e.key === '/') ||
        (!isEditable && !modifier && !isPaletteOpen && e.key === '?')
      ) {
        if (onOpenHelp) {
          e.preventDefault();
          e.stopPropagation();
          onOpenHelp();
          return;
        }
      }
    },
    [
      onOpenPalette,
      onNewPaper,
      onToggleTheme,
      onGoToDashboard,
      onGoToBank,
      onOpenSettings,
      onOpenHelp,
      onCloseModals,
      isPaletteOpen,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
