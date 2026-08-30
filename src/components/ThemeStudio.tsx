import React, { useState, useEffect, useRef } from 'react';
import { 
  UserProfile, 
  ThemeAnimationConfig, 
  DEFAULT_THEME_ANIMATION_CONFIG,
  CustomBackgroundConfig,
  DEFAULT_CUSTOM_BACKGROUND_CONFIG,
  BackgroundMode
} from '../types';
import { 
  Palette, 
  Sparkles, 
  Moon, 
  Sun, 
  Waves, 
  Trees, 
  RotateCcw, 
  Check, 
  Sliders, 
  Zap, 
  ArrowLeft,
  Stars,
  Compass,
  Maximize2,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  SlidersHorizontal,
  Layers,
  Sparkle,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import ThemeBackdrop from './ThemeBackdrop';
import { 
  uploadCustomBackgroundImage, 
  deletePreviousCustomBackground, 
  validateBackgroundImageFile 
} from '../services/customBackgroundService';

interface ThemeStudioProps {
  profile: UserProfile | null;
  currentTheme: string;
  themeConfig: ThemeAnimationConfig;
  backgroundMode?: BackgroundMode;
  customBackground?: CustomBackgroundConfig | null;
  liquidGlassEnabled?: boolean;
  onUpdateTheme: (themeId: string, newConfig: ThemeAnimationConfig) => Promise<void>;
  onUpdateBackgroundMode?: (mode: BackgroundMode, customBg?: CustomBackgroundConfig | null) => Promise<void> | void;
  onUpdateLiquidGlass?: (enabled: boolean) => Promise<void> | void;
  onUpdateCustomBackgroundConfig?: (config: CustomBackgroundConfig) => Promise<void> | void;
  onBack: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

interface ThemeOption {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: string;
  badgeColor: string;
  primaryDescription: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'default',
    name: 'Premium Vibrant',
    tagline: 'Signature Royal Theme',
    icon: Sparkles,
    colors: 'from-[#3C128D] via-[#8A2CB0] to-[#EEA727]',
    badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
    primaryDescription: 'Luminous royal purple & violet gradient with warm golden highlights, ambient orbs, and sparkling stardust.'
  },
  {
    id: 'midnight',
    name: 'Midnight Sky',
    tagline: 'Cosmic & Deep Space',
    icon: Moon,
    colors: 'from-[#232526] via-[#34373a] to-[#414345]',
    badgeColor: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
    primaryDescription: 'Deep obsidian space with celestial moon, customizable twinkling stars, and shooting meteors.'
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    tagline: 'Warm Solar Radiance',
    icon: Sun,
    colors: 'from-[#FF512F] via-[#F09819] to-[#DD2476]',
    badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
    primaryDescription: 'Radiant sunset horizon with glowing solar disc (exclusive to Golden Sunset), warm coronal glow, and floating solar dust particles.'
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    tagline: 'Abyssal Marine Waters',
    icon: Waves,
    colors: 'from-[#0F2027] via-[#203A43] to-[#2C5364]',
    badgeColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
    primaryDescription: 'Deep tranquil marine depth with bioluminescent rising bubbles, caustic light rays, and wave shimmers.'
  },
  {
    id: 'forest',
    name: 'Emerald Forest',
    tagline: 'Enchanted Forest Canopy',
    icon: Trees,
    colors: 'from-[#134E5E] via-[#2D7D6F] to-[#71B280]',
    badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
    primaryDescription: 'Enchanted forest canopy with magical glowing fireflies, soft mist overlays, and floating botanical leaves.'
  },
];

export const ThemeStudio: React.FC<ThemeStudioProps> = ({
  profile,
  currentTheme,
  themeConfig,
  backgroundMode = 'preset',
  customBackground = null,
  liquidGlassEnabled = true,
  onUpdateTheme,
  onUpdateBackgroundMode,
  onUpdateLiquidGlass,
  onUpdateCustomBackgroundConfig,
  onBack,
  showToast
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(currentTheme || 'default');
  const [config, setConfig] = useState<ThemeAnimationConfig>(themeConfig || DEFAULT_THEME_ANIMATION_CONFIG);
  const [activeBgMode, setActiveBgMode] = useState<BackgroundMode>(backgroundMode || 'preset');
  const [activeCustomBg, setActiveCustomBg] = useState<CustomBackgroundConfig | null>(customBackground || null);
  const [isGlassOn, setIsGlassOn] = useState<boolean>(liquidGlassEnabled !== false);
  
  // Custom Background Upload & Editing State
  const [isUploadingBg, setIsUploadingBg] = useState<boolean>(false);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Sync with incoming props
  useEffect(() => {
    if (themeConfig) setConfig(themeConfig);
  }, [themeConfig]);

  useEffect(() => {
    if (currentTheme) setSelectedThemeId(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (backgroundMode) setActiveBgMode(backgroundMode);
  }, [backgroundMode]);

  useEffect(() => {
    if (customBackground !== undefined) setActiveCustomBg(customBackground);
  }, [customBackground]);

  useEffect(() => {
    if (liquidGlassEnabled !== undefined) setIsGlassOn(liquidGlassEnabled);
  }, [liquidGlassEnabled]);

  const currentThemeObj = THEME_OPTIONS.find(t => t.id === selectedThemeId) || THEME_OPTIONS[0];

  // Apply Theme & Configurations
  const handleApplyTheme = async (themeToApply: string = selectedThemeId, configToApply: ThemeAnimationConfig = config) => {
    try {
      await onUpdateTheme(themeToApply, configToApply);
      const appliedTheme = THEME_OPTIONS.find(t => t.id === themeToApply)?.name || 'Theme';
      const msg = `✨ Theme "${appliedTheme}" and visual settings saved!`;
      setAppliedMessage(msg);
      showToast(msg, 'success');
      setTimeout(() => setAppliedMessage(null), 4000);
    } catch (err: any) {
      console.error("Failed to apply theme:", err);
      showToast("Failed to apply theme: " + (err.message || String(err)), "error");
    }
  };

  // Toggle Liquid Glass ON / OFF
  const handleToggleLiquidGlass = async (checked: boolean) => {
    setIsGlassOn(checked);
    if (onUpdateLiquidGlass) {
      await onUpdateLiquidGlass(checked);
    }
    showToast(
      checked ? "✨ Liquid Glass styling activated across all surfaces!" : "⚪ Solid clean interface styling enabled.",
      'success'
    );
  };

  // Switch Background Mode (Preset Themes vs Custom Image)
  const handleSelectBackgroundMode = async (mode: BackgroundMode) => {
    setActiveBgMode(mode);
    if (onUpdateBackgroundMode) {
      await onUpdateBackgroundMode(mode, activeCustomBg);
    }
    showToast(
      mode === 'custom' 
        ? "🖼️ Custom Background active. Upload or fine-tune your wallpaper below."
        : `🎨 Returned to Preset Atmospheric Theme (${currentThemeObj.name}).`,
      'success'
    );
  };

  // Select Preset Theme Card
  const handleSelectThemeCard = async (themeId: string) => {
    setSelectedThemeId(themeId);
    setActiveBgMode('preset');
    if (onUpdateBackgroundMode) {
      await onUpdateBackgroundMode('preset', activeCustomBg);
    }
    await handleApplyTheme(themeId, config);
  };

  // Upload Custom Background Image File
  const handleProcessBgFile = async (file: File) => {
    if (!file) return;

    setBgUploadError(null);
    const validation = validateBackgroundImageFile(file);
    if (!validation.valid) {
      setBgUploadError(validation.error || 'Invalid image file.');
      showToast(validation.error || 'Invalid image file.', 'error');
      return;
    }

    setIsUploadingBg(true);
    try {
      const uid = profile?.uid || 'anonymous_user';
      const oldStoragePath = activeCustomBg?.storagePath;

      const uploadedBg = await uploadCustomBackgroundImage(uid, file);
      
      // Preserve existing adjustments if replacing
      const mergedBg: CustomBackgroundConfig = {
        ...uploadedBg,
        brightness: activeCustomBg?.brightness ?? 100,
        blur: activeCustomBg?.blur ?? 0,
        opacity: activeCustomBg?.opacity ?? 100,
        overlayDarkness: activeCustomBg?.overlayDarkness ?? 25,
        position: activeCustomBg?.position ?? 'center'
      };

      setActiveCustomBg(mergedBg);
      setActiveBgMode('custom');

      if (onUpdateBackgroundMode) {
        await onUpdateBackgroundMode('custom', mergedBg);
      }

      // Cleanup previous uploaded storage image in background
      if (oldStoragePath && oldStoragePath !== mergedBg.storagePath) {
        deletePreviousCustomBackground(oldStoragePath).catch(() => {});
      }

      showToast("🎉 Custom background image successfully set!", "success");
    } catch (err: any) {
      console.error("Custom background upload failed:", err);
      const errMsg = err?.message || 'Failed to upload background image.';
      setBgUploadError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (file) handleProcessBgFile(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessBgFile(file);
  };

  // Update Custom Background Adjustments (Sliders)
  const handleUpdateCustomBgProp = (prop: keyof CustomBackgroundConfig, value: any) => {
    if (!activeCustomBg) return;
    const updated: CustomBackgroundConfig = {
      ...activeCustomBg,
      [prop]: value
    };
    setActiveCustomBg(updated);
    if (onUpdateCustomBackgroundConfig) {
      onUpdateCustomBackgroundConfig(updated);
    }
  };

  // Remove Custom Background
  const handleRemoveCustomBackground = async () => {
    const prevStoragePath = activeCustomBg?.storagePath;
    setActiveCustomBg(null);
    setActiveBgMode('preset');
    if (onUpdateBackgroundMode) {
      await onUpdateBackgroundMode('preset', null);
    }
    if (prevStoragePath) {
      deletePreviousCustomBackground(prevStoragePath).catch(() => {});
    }
    showToast("Custom background removed. Returned to preset theme.", "success");
  };

  // Reset Background to Default Preset
  const handleResetBackgroundToDefault = async () => {
    setActiveBgMode('preset');
    setSelectedThemeId('default');
    const defaults = DEFAULT_THEME_ANIMATION_CONFIG;
    setConfig(defaults);
    if (onUpdateBackgroundMode) {
      await onUpdateBackgroundMode('preset', activeCustomBg);
    }
    await handleApplyTheme('default', defaults);
    showToast("Background reset to default Signature Royal theme.", "success");
  };

  // Reset fine-grained theme defaults
  const handleResetCurrentThemeDefaults = () => {
    const defaults = DEFAULT_THEME_ANIMATION_CONFIG;
    let newConfig = { ...config };

    if (selectedThemeId === 'midnight') {
      newConfig = { ...newConfig, midnight: { ...defaults.midnight } };
    } else if (selectedThemeId === 'sunset') {
      newConfig = { ...newConfig, sunset: { ...defaults.sunset } };
    } else if (selectedThemeId === 'ocean') {
      newConfig = { ...newConfig, ocean: { ...defaults.ocean } };
    } else if (selectedThemeId === 'forest') {
      newConfig = { ...newConfig, forest: { ...defaults.forest } };
    } else {
      newConfig = { ...newConfig, default: { ...defaults.default } };
    }

    setConfig(newConfig);
    handleApplyTheme(selectedThemeId, newConfig);
    showToast(`Reset ${currentThemeObj.name} animation settings to default!`, 'success');
  };

  // Updaters for preset themes
  const updateGlobal = (key: keyof ThemeAnimationConfig, value: any) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateMidnight = (key: keyof ThemeAnimationConfig['midnight'], value: any) => {
    const next = { ...config, midnight: { ...config.midnight, [key]: value } };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateSunset = (key: keyof ThemeAnimationConfig['sunset'], value: any) => {
    const next = { ...config, sunset: { ...config.sunset, [key]: value } };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateOcean = (key: keyof ThemeAnimationConfig['ocean'], value: any) => {
    const next = { ...config, ocean: { ...config.ocean, [key]: value } };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateForest = (key: keyof ThemeAnimationConfig['forest'], value: any) => {
    const next = { ...config, forest: { ...config.forest, [key]: value } };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateVibrant = (key: keyof ThemeAnimationConfig['default'], value: any) => {
    const next = { ...config, default: { ...config.default, [key]: value } };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 animate-fade-in text-gray-900 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="hidden sm:block h-6 w-px bg-white/20" />
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md">
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            Appearance & Customization Studio
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetBackgroundToDefault}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md active:scale-95"
            title="Reset to default theme & settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Background</span>
          </button>
        </div>
      </div>

      {/* Applied Confirmation Banner */}
      {appliedMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 backdrop-blur-md shadow-xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/30 text-emerald-200">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </span>
            <div>
              <h4 className="text-sm font-black text-white">{appliedMessage}</h4>
              <p className="text-xs text-emerald-200/90 mt-0.5">Your visual preferences are saved to your profile and active immediately.</p>
            </div>
          </div>
          <button 
            onClick={() => setAppliedMessage(null)}
            className="text-xs font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Title & Introduction */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md flex items-center gap-3">
          <Palette className="w-8 h-8 text-amber-300 drop-shadow-md" />
          Appearance & Customization
        </h1>
        <p className="text-white/80 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
          Personalize your workspace experience with GenPaperAI Liquid Glass material styling, switch between atmospheric preset themes or upload your own custom background image.
        </p>
      </div>

      {/* ========================================================
          FEATURE 1: LIQUID GLASS MASTER TOGGLE CARD
          ======================================================== */}
      <div className="mb-8 glass-panel p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
              isGlassOn 
                ? 'bg-gradient-to-br from-[#3C128D] to-[#8A2CB0] text-amber-300 ring-2 ring-purple-300/50' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <Sparkle className={`w-6 h-6 ${isGlassOn ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black text-gray-900">Liquid Glass</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  isGlassOn 
                    ? 'bg-purple-100 text-[#8A2CB0] border border-purple-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {isGlassOn ? 'ON — Liquid Glass Active' : 'OFF — Solid UI Material'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                {isGlassOn 
                  ? 'Luminous frosted glass surfaces, specular highlights, and translucent blur are applied across navigation, panels, and cards.'
                  : 'Liquid Glass material is disabled. UI surfaces use crisp, high-contrast solid materials without background blur.'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
              {isGlassOn ? 'ON' : 'OFF'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isGlassOn} 
                onChange={(e) => handleToggleLiquidGlass(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-16 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-[#3C128D] peer-checked:to-[#8A2CB0]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================
          FEATURE 2: BACKGROUND SELECTOR (PRESETS VS CUSTOM IMAGE)
          ======================================================== */}
      <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleSelectBackgroundMode('preset')}
            className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeBgMode === 'preset'
                ? 'bg-white text-gray-900 shadow-lg scale-100'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Preset Atmospheric Themes</span>
            {activeBgMode === 'preset' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
            )}
          </button>

          <button
            onClick={() => handleSelectBackgroundMode('custom')}
            className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeBgMode === 'custom'
                ? 'bg-white text-gray-900 shadow-lg scale-100'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Custom Background Image</span>
            {activeBgMode === 'custom' && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
            )}
          </button>
        </div>

        <div className="text-xs text-white/90 font-medium px-3 text-center sm:text-right">
          {activeBgMode === 'custom' ? 'Custom Wallpaper Active' : `Preset Theme: ${currentThemeObj.name}`}
        </div>
      </div>

      {/* ========================================================
          MODE A: CUSTOM BACKGROUND IMAGE UPLOADER & CONTROLS
          ======================================================== */}
      {activeBgMode === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-fade-in">
          {/* Left: Upload Dropzone & Controls */}
          <div className="lg:col-span-6 space-y-6">
            {/* Upload Dropzone Card */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#8A2CB0]" />
                  Upload Custom Image
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#8A2CB0] border border-purple-100">
                  Firebase Cloud Storage
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                Upload your preferred wallpaper or aesthetic image (JPG, PNG, WebP up to 8MB). The image securely uploads to your user storage and spans seamlessly across your screen.
              </p>

              {/* Hidden File Input */}
              <input 
                type="file" 
                ref={bgFileInputRef}
                onChange={handleFileInputChange}
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="hidden"
              />

              {/* Interactive Drag & Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => bgFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDraggingFile 
                    ? 'border-[#8A2CB0] bg-purple-50/80 scale-[0.99]' 
                    : 'border-gray-300 hover:border-[#8A2CB0] bg-gray-50/70 hover:bg-purple-50/30'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-amber-50 text-[#8A2CB0] flex items-center justify-center shadow-inner">
                  {isUploadingBg ? (
                    <div className="w-6 h-6 border-3 border-[#8A2CB0] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <UploadCloud className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-gray-800">
                    {isUploadingBg 
                      ? 'Uploading & Optimizing Wallpaper...' 
                      : isDraggingFile 
                      ? 'Drop image file here' 
                      : 'Click to browse or drop an image file'}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Supports JPG, PNG, and WebP formats (Max 8MB)
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isUploadingBg}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white text-xs font-black shadow-md hover:shadow-purple-900/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{activeCustomBg?.url ? 'Change / Replace Image' : 'Select Image File'}</span>
                </button>
              </div>

              {/* Error Message if any */}
              {bgUploadError && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bgUploadError}</span>
                </div>
              )}

              {/* Action Toolbar */}
              {activeCustomBg?.url && (
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-gray-500">
                    <span className="font-bold text-gray-700">{activeCustomBg.fileName || 'Custom Wallpaper'}</span>
                    {activeCustomBg.fileSize && (
                      <span className="ml-1 text-[11px] text-gray-400">({(activeCustomBg.fileSize / (1024 * 1024)).toFixed(2)} MB)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveCustomBackground}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectBackgroundMode('preset')}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs border border-gray-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Return to Presets</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Fine-Tuning Adjustments for Custom Image */}
            {activeCustomBg?.url && (
              <div className="glass-panel p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    Fine-Tune Image Display & Readability
                  </h3>
                  <button
                    onClick={() => {
                      if (!activeCustomBg) return;
                      const resetProps: CustomBackgroundConfig = {
                        ...activeCustomBg,
                        brightness: 100,
                        blur: 0,
                        opacity: 100,
                        overlayDarkness: 25,
                        position: 'center'
                      };
                      setActiveCustomBg(resetProps);
                      if (onUpdateCustomBackgroundConfig) onUpdateCustomBackgroundConfig(resetProps);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Sliders
                  </button>
                </div>

                {/* Brightness Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                    <span>Brightness</span>
                    <span className="text-[#8A2CB0] font-black px-2 py-0.5 rounded-md bg-purple-50">
                      {activeCustomBg.brightness ?? 100}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="150" 
                    step="5"
                    value={activeCustomBg.brightness ?? 100} 
                    onChange={(e) => handleUpdateCustomBgProp('brightness', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A2CB0]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                    <span>Dim (50%)</span>
                    <span>Standard (100%)</span>
                    <span>Vibrant (150%)</span>
                  </div>
                </div>

                {/* Blur Softness Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                    <span>Background Blur Filter</span>
                    <span className="text-[#8A2CB0] font-black px-2 py-0.5 rounded-md bg-purple-50">
                      {activeCustomBg.blur ?? 0} px
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    step="1"
                    value={activeCustomBg.blur ?? 0} 
                    onChange={(e) => handleUpdateCustomBgProp('blur', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A2CB0]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                    <span>Sharp (0px)</span>
                    <span>Soft (6px)</span>
                    <span>Deep Blur (20px)</span>
                  </div>
                </div>

                {/* Readability / Dark Overlay Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                    <span>Text Readability & Contrast Shield</span>
                    <span className="text-amber-700 font-black px-2 py-0.5 rounded-md bg-amber-50">
                      {activeCustomBg.overlayDarkness ?? 25}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="70" 
                    step="5"
                    value={activeCustomBg.overlayDarkness ?? 25} 
                    onChange={(e) => handleUpdateCustomBgProp('overlayDarkness', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                    <span>None (0%)</span>
                    <span>Recommended (25%)</span>
                    <span>High Contrast (70%)</span>
                  </div>
                </div>

                {/* Focal Alignment Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Image Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => handleUpdateCustomBgProp('position', pos)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs capitalize transition-all border cursor-pointer ${
                          (activeCustomBg.position || 'center') === pos
                            ? 'bg-[#3C128D] text-white border-[#3C128D] shadow-sm'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {pos} Focus
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Interactive Simulation Stage */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Live Preview on Custom Background
                </h3>
                <span className="text-[11px] font-bold text-gray-500">
                  {isGlassOn ? 'Liquid Glass ON' : 'Solid Material ON'}
                </span>
              </div>

              {/* Realistic Simulated Viewport */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-300 aspect-[16/10] flex items-center justify-center p-6 bg-slate-900">
                {/* Background Image Layer */}
                {activeCustomBg?.url ? (
                  <>
                    <img 
                      src={activeCustomBg.url}
                      alt="Custom Preview"
                      className="absolute inset-0 w-full h-full object-cover select-none"
                      style={{
                        filter: `brightness(${activeCustomBg.brightness ?? 100}%) blur(${activeCustomBg.blur ?? 0}px)`,
                        opacity: (activeCustomBg.opacity ?? 100) / 100,
                        objectPosition: activeCustomBg.position || 'center'
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div 
                      className="absolute inset-0 transition-all duration-300"
                      style={{ backgroundColor: `rgba(0, 0, 0, ${(activeCustomBg.overlayDarkness ?? 25) / 100})` }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white/60">
                    <ImageIcon className="w-12 h-12 mb-2 text-white/30" />
                    <p className="text-xs font-medium">No custom background image uploaded yet.</p>
                  </div>
                )}

                {/* Simulated UI Surface demonstrating Liquid Glass or Solid material */}
                <div className={`relative z-10 w-full max-w-sm rounded-2xl p-5 shadow-2xl transition-all ${
                  isGlassOn 
                    ? 'bg-white/80 backdrop-blur-xl border border-white/60 text-gray-900' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#8A2CB0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        G
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900">GenPaperAI Surface</h4>
                        <p className="text-[10px] text-gray-500">{isGlassOn ? 'Liquid Glass Frosted Material' : 'Solid Opaque Material'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-[#8A2CB0]">
                      Sample
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-700 leading-relaxed mb-3 font-medium">
                    This sample card demonstrates how your custom background looks with the current <strong>{isGlassOn ? 'Liquid Glass' : 'Solid Material'}</strong> setting.
                  </p>

                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black text-center ${
                        isGlassOn
                          ? 'bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] text-white shadow-md'
                          : 'bg-[#3C128D] text-white'
                      }`}
                    >
                      Primary Action
                    </button>
                    <button 
                      type="button"
                      className="py-1.5 px-3 rounded-lg text-xs font-bold border border-gray-300 text-gray-700 bg-white/70"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Information Note */}
              <div className="mt-4 p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-purple-950 text-xs flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#8A2CB0] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Atmospheric preset elements disabled:</strong> When a custom background image is active, animated celestial elements (such as the Golden Sunset sun, forest fireflies, or ocean rays) are cleanly omitted to prioritize your wallpaper.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE B: PRESET ATMOSPHERIC THEMES & DEEP CONTROLS
          ======================================================== */}
      {activeBgMode === 'preset' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Column: Theme Picker Cards & Global Master Animation Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Global Master Animation Switch Card */}
            <div className="glass-panel p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className={`p-2 rounded-xl ${config.enableAnimations ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Zap className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-gray-900">Background Animations</h3>
                    <p className="text-xs text-gray-500 font-medium">Master toggle for live motion & particles</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={config.enableAnimations} 
                    onChange={(e) => updateGlobal('enableAnimations', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-[#3C128D] peer-checked:to-[#8A2CB0]"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                {/* Animation Speed Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#8A2CB0]" />
                      Animation Motion Speed
                    </span>
                    <span className="text-[#8A2CB0] font-black px-2 py-0.5 rounded-md bg-purple-50">
                      {config.animationSpeed.toFixed(1)}x
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0.4" 
                    max="2.0" 
                    step="0.1"
                    disabled={!config.enableAnimations}
                    value={config.animationSpeed} 
                    onChange={(e) => updateGlobal('animationSpeed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A2CB0] disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                    <span>Serene (0.5x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Dynamic (2.0x)</span>
                  </div>
                </div>

                {/* Atmosphere Intensity Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-600" />
                      Atmosphere & Glow Intensity
                    </span>
                    <span className="text-amber-700 font-black px-2 py-0.5 rounded-md bg-amber-50">
                      {Math.round(config.animationIntensity * 100)}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0.2" 
                    max="1.0" 
                    step="0.05"
                    disabled={!config.enableAnimations}
                    value={config.animationIntensity} 
                    onChange={(e) => updateGlobal('animationIntensity', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600 disabled:opacity-40"
                  />
                </div>
              </div>
            </div>

            {/* Atmospheric Themes List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/90 px-1">
                Choose Atmospheric Environment
              </h3>

              {THEME_OPTIONS.map((theme) => {
                const IconComponent = theme.icon;
                const isSelected = selectedThemeId === theme.id && activeBgMode === 'preset';

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectThemeCard(theme.id)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer border flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-white shadow-2xl scale-[1.02] border-amber-300 ring-2 ring-amber-300/60'
                        : 'bg-white/85 hover:bg-white border-white/40 hover:scale-[1.01] shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.colors} flex items-center justify-center text-white shadow-md shrink-0`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-gray-900">{theme.name}</h4>
                          {isSelected && (
                            <span className="p-0.5 rounded-full bg-emerald-500 text-white">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{theme.tagline}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${theme.badgeColor}`}>
                        {isSelected ? 'Active Theme' : 'Select'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Theme-Specific Fine-Grained Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Interactive Preview Box */}
            <div className="glass-panel p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#8A2CB0]" />
                  <h3 className="text-sm font-black text-gray-900">Live Atmospheric Simulation</h3>
                </div>
                <span className="text-xs text-gray-500 font-medium">Real-time dynamic canvas</span>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-300 aspect-[16/8] flex items-center justify-center p-6 bg-slate-950">
                <ThemeBackdrop 
                  theme={selectedThemeId} 
                  config={config} 
                  backgroundMode="preset"
                  isInteractivePreview={true} 
                />

                <div className="relative z-10 text-center text-white pointer-events-none drop-shadow-md">
                  <h4 className="text-xl font-black">{currentThemeObj.name}</h4>
                  <p className="text-xs text-white/80 mt-1 max-w-sm">{currentThemeObj.primaryDescription}</p>
                </div>

                <div className="absolute bottom-2 right-2 text-white/50 text-[10px] font-bold px-2 py-1 bg-black/40 rounded-lg backdrop-blur-sm pointer-events-none flex items-center gap-1">
                  <span>Interactive Stage</span>
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Theme-Specific Fine-Grained Controls Card */}
            <div className="glass-panel p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-purple-50 text-[#8A2CB0]">
                    <Sliders className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">
                      {currentThemeObj.name} Customization
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Fine-tune individual elements and atmospheric layers</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-black border ${currentThemeObj.badgeColor}`}>
                  Active Preset
                </span>
              </div>

              {/* MIDNIGHT SKY CONTROLS */}
              {selectedThemeId === 'midnight' && (
                <div className="space-y-6">
                  {/* Celestial Moon Controls */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-slate-700" />
                        <span className="text-sm font-black text-gray-800">Celestial Moon</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.midnight.showMoon} 
                          onChange={(e) => updateMidnight('showMoon', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-800"></div>
                      </label>
                    </div>

                    {config.midnight.showMoon && (
                      <div className="space-y-4 pt-2 border-t border-gray-200/60">
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                            <span>Moon Scale / Diameter</span>
                            <span className="text-slate-900 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                              {config.midnight.moonSize} px
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="40" 
                            max="180" 
                            step="5"
                            value={config.midnight.moonSize} 
                            onChange={(e) => updateMidnight('moonSize', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                            <span>Moon Glow Radiance</span>
                            <span className="text-slate-900 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                              {Math.round(config.midnight.moonGlowIntensity * 100)}%
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="0.2" 
                            max="1.0" 
                            step="0.05"
                            value={config.midnight.moonGlowIntensity} 
                            onChange={(e) => updateMidnight('moonGlowIntensity', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Starfield Controls */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stars className="w-4 h-4 text-purple-700" />
                        <span className="text-sm font-black text-gray-800">Twinkling Starfield</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.midnight.showStars} 
                          onChange={(e) => updateMidnight('showStars', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700"></div>
                      </label>
                    </div>

                    {config.midnight.showStars && (
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Visible Star Count</span>
                          <span className="text-purple-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.midnight.starCount} Stars
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="20" 
                          max="120" 
                          step="10"
                          value={config.midnight.starCount} 
                          onChange={(e) => updateMidnight('starCount', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GOLDEN SUNSET CONTROLS */}
              {selectedThemeId === 'sunset' && (
                <div className="space-y-6">
                  {/* Animated Top-Right Sun Controls (Exclusive to Golden Sunset) */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="text-sm font-black text-gray-800">Top-Right Radiant Sun</span>
                          <p className="text-[11px] text-amber-800 font-medium">Atmospheric corona & solar disc (exclusive to Golden Sunset)</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.sunset.showSun} 
                          onChange={(e) => updateSunset('showSun', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    {config.sunset.showSun && (
                      <div className="space-y-4 pt-2 border-t border-amber-200/60">
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                            <span>Sun Disc Diameter</span>
                            <span className="text-amber-800 font-black px-2 py-0.5 rounded-md bg-white border border-amber-200">
                              {config.sunset.sunSize} px
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="60" 
                            max="200" 
                            step="10"
                            value={config.sunset.sunSize} 
                            onChange={(e) => updateSunset('sunSize', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                            <span>Coronal Glow Radiance</span>
                            <span className="text-amber-800 font-black px-2 py-0.5 rounded-md bg-white border border-amber-200">
                              {Math.round(config.sunset.sunGlowIntensity * 100)}%
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="0.3" 
                            max="1.0" 
                            step="0.05"
                            value={config.sunset.sunGlowIntensity} 
                            onChange={(e) => updateSunset('sunGlowIntensity', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Solar Dust Particles */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-black text-gray-800">Floating Solar Dust Particles</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.sunset.showFloatingSolarDust} 
                          onChange={(e) => updateSunset('showFloatingSolarDust', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    {config.sunset.showFloatingSolarDust && (
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Solar Dust Density</span>
                          <span className="text-orange-600 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.sunset.solarDustCount} particles
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="40" 
                          step="5"
                          value={config.sunset.solarDustCount} 
                          onChange={(e) => updateSunset('solarDustCount', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DEEP OCEAN CONTROLS */}
              {selectedThemeId === 'ocean' && (
                <div className="space-y-6">
                  {/* Bioluminescent Bubbles */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm font-black text-gray-800">Rising Ocean Bubbles</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.ocean.showBubbles} 
                          onChange={(e) => updateOcean('showBubbles', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    {config.ocean.showBubbles && (
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Bubble Count</span>
                          <span className="text-cyan-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.ocean.bubbleCount} Bubbles
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="6" 
                          max="40" 
                          step="2"
                          value={config.ocean.bubbleCount} 
                          onChange={(e) => updateOcean('bubbleCount', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EMERALD FOREST CONTROLS */}
              {selectedThemeId === 'forest' && (
                <div className="space-y-6">
                  {/* Glowing Fireflies */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trees className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-black text-gray-800">Glowing Fireflies</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.forest.showFireflies} 
                          onChange={(e) => updateForest('showFireflies', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    {config.forest.showFireflies && (
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Firefly Density</span>
                          <span className="text-emerald-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.forest.fireflyCount} Fireflies
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="6" 
                          max="40" 
                          step="2"
                          value={config.forest.fireflyCount} 
                          onChange={(e) => updateForest('fireflyCount', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PREMIUM VIBRANT CONTROLS */}
              {selectedThemeId === 'default' && (
                <div className="space-y-6">
                  {/* Floating Luminous Orbs */}
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-black text-gray-800">Luminous Floating Orbs</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.default.showOrbs} 
                          onChange={(e) => updateVibrant('showOrbs', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8A2CB0]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeStudio;
