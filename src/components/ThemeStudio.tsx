import React, { useState, useEffect } from 'react';
import { UserProfile, ThemeAnimationConfig, DEFAULT_THEME_ANIMATION_CONFIG } from '../types';
import { 
  Palette, 
  Sparkles, 
  Moon, 
  Sun, 
  Waves, 
  Trees, 
  Flame, 
  RotateCcw, 
  Check, 
  Sliders, 
  Eye, 
  Zap, 
  ShieldCheck, 
  Layers,
  ArrowLeft,
  Stars,
  Compass,
  Maximize2
} from 'lucide-react';
import ThemeBackdrop from './ThemeBackdrop';

interface ThemeStudioProps {
  profile: UserProfile | null;
  currentTheme: string;
  themeConfig: ThemeAnimationConfig;
  onUpdateTheme: (themeId: string, newConfig: ThemeAnimationConfig) => Promise<void>;
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
    primaryDescription: 'Radiant sunset horizon with glowing solar disc, warm coronal glow, and floating solar dust particles.'
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
  onUpdateTheme,
  onBack,
  showToast
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>(currentTheme || 'default');
  const [config, setConfig] = useState<ThemeAnimationConfig>(themeConfig || DEFAULT_THEME_ANIMATION_CONFIG);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'theme' | 'celestial' | 'particles' | 'global'>('theme');

  // Keep internal state synced if external themeConfig changes
  useEffect(() => {
    if (themeConfig) {
      setConfig(themeConfig);
    }
  }, [themeConfig]);

  useEffect(() => {
    if (currentTheme) {
      setSelectedThemeId(currentTheme);
    }
  }, [currentTheme]);

  const currentThemeObj = THEME_OPTIONS.find(t => t.id === selectedThemeId) || THEME_OPTIONS[0];

  const handleApplyTheme = async (themeToApply: string = selectedThemeId, configToApply: ThemeAnimationConfig = config) => {
    setIsApplying(true);
    try {
      await onUpdateTheme(themeToApply, configToApply);
      const appliedTheme = THEME_OPTIONS.find(t => t.id === themeToApply)?.name || 'Theme';
      const msg = `✨ Theme "${appliedTheme}" and animation settings successfully applied!`;
      setAppliedMessage(msg);
      showToast(msg, 'success');
      setTimeout(() => {
        setAppliedMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error("Failed to apply theme:", err);
      showToast("Failed to apply theme: " + (err.message || String(err)), "error");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSelectThemeCard = (themeId: string) => {
    setSelectedThemeId(themeId);
    // Instant live preview & application
    handleApplyTheme(themeId, config);
  };

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

  // Helper updater functions for nested config
  const updateGlobal = (key: keyof ThemeAnimationConfig, value: any) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateMidnight = (key: keyof ThemeAnimationConfig['midnight'], value: any) => {
    const next = {
      ...config,
      midnight: {
        ...config.midnight,
        [key]: value
      }
    };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateSunset = (key: keyof ThemeAnimationConfig['sunset'], value: any) => {
    const next = {
      ...config,
      sunset: {
        ...config.sunset,
        [key]: value
      }
    };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateOcean = (key: keyof ThemeAnimationConfig['ocean'], value: any) => {
    const next = {
      ...config,
      ocean: {
        ...config.ocean,
        [key]: value
      }
    };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateForest = (key: keyof ThemeAnimationConfig['forest'], value: any) => {
    const next = {
      ...config,
      forest: {
        ...config.forest,
        [key]: value
      }
    };
    setConfig(next);
    handleApplyTheme(selectedThemeId, next);
  };

  const updateVibrant = (key: keyof ThemeAnimationConfig['default'], value: any) => {
    const next = {
      ...config,
      default: {
        ...config.default,
        [key]: value
      }
    };
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
            Theme & Animation Studio
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCurrentThemeDefaults}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md active:scale-95"
            title="Reset active theme customizations to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Theme Defaults</span>
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
          Appearance & Theme Studio
        </h1>
        <p className="text-white/80 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Select an atmospheric theme and customize every visual element: celestial objects, star counts, firefly glowing radiuses, solar dust, bubble dynamics, and motion speeds.
        </p>
      </div>

      {/* Main Grid: Theme Selection + Live Preview + Deep Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                  value={config.animationIntensity} 
                  onChange={(e) => updateGlobal('animationIntensity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                  <span>Subtle (20%)</span>
                  <span>Balanced (60%)</span>
                  <span>Vivid (100%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Preset Selection Cards */}
          <div className="glass-panel p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#8A2CB0]" />
                Select Atmospheric Theme
              </h3>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                5 Themes
              </span>
            </div>

            <div className="space-y-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                const IconComponent = theme.icon;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectThemeCard(theme.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'border-[#3C128D] bg-gradient-to-br from-white to-purple-50/60 shadow-lg scale-[1.01]'
                        : 'border-transparent bg-gray-50/80 hover:bg-white hover:border-gray-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.colors} flex items-center justify-center text-white shadow-md shrink-0 mt-0.5`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-black text-sm ${isSelected ? 'text-[#3C128D]' : 'text-gray-800'}`}>
                              {theme.name}
                            </h4>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#3C128D] text-white flex items-center gap-1 shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-0.5 leading-snug">
                            {theme.tagline}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Gradient preview ribbon */}
                    <div className={`mt-3 h-2 w-full rounded-full bg-gradient-to-r ${theme.colors}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Preview + Deep Theme-Specific Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Mini Preview Box */}
          <div className="glass-panel p-6 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                  Live Viewport Preview
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Real-Time Synchronized
              </div>
            </div>

            {/* Embedded Live Backdrop Container */}
            <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden shadow-inner border border-black/10 bg-slate-950 flex flex-col justify-between p-4">
              {/* Actual live rendering of custom elements */}
              <div 
                className="absolute inset-0 z-0"
                style={{
                  background: selectedThemeId === 'ocean'
                    ? 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)'
                    : selectedThemeId === 'sunset'
                    ? 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)'
                    : selectedThemeId === 'forest'
                    ? 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)'
                    : selectedThemeId === 'midnight'
                    ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
                    : 'linear-gradient(135deg, #3C128D 0%, #8A2CB0 60%, #EEA727 100%)'
                }}
              >
                <ThemeBackdrop 
                  theme={selectedThemeId} 
                  config={config} 
                  isInteractivePreview={true} 
                />
              </div>

              {/* Sample Glass Card floating inside preview */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black shadow-md flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentThemeObj.name}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white/90 text-[10px] font-bold border border-white/15">
                  {config.enableAnimations ? 'Motion Active' : 'Static Visuals'}
                </div>
              </div>

              <div className="relative z-10 flex justify-between items-end">
                <div className="text-white/90 text-[11px] font-medium backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 max-w-[80%] truncate">
                  {currentThemeObj.primaryDescription}
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
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
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                          <span>Crescent (40px)</span>
                          <span>Default (65px)</span>
                          <span>Supermoon (180px)</span>
                        </div>
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
                    <div className="space-y-4 pt-2 border-t border-gray-200/60">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Star Count</span>
                          <span className="text-purple-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.midnight.starCount} Stars
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="120" 
                          step="5"
                          value={config.midnight.starCount} 
                          onChange={(e) => updateMidnight('starCount', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Twinkle Pulse Speed</span>
                          <span className="text-purple-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.midnight.starTwinkleSpeed.toFixed(1)}x
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2.0" 
                          step="0.1"
                          value={config.midnight.starTwinkleSpeed} 
                          onChange={(e) => updateMidnight('starTwinkleSpeed', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Extras & Meteors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800 block">Shooting Stars / Meteors</span>
                      <span className="text-[11px] text-gray-500 font-medium">Occasional meteor trails</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.midnight.showShootingStars} 
                        onChange={(e) => updateMidnight('showShootingStars', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-700"></div>
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800 block">Nebula Cosmic Dust</span>
                      <span className="text-[11px] text-gray-500 font-medium">Ambient purple space glow</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.midnight.nebulaGlow} 
                        onChange={(e) => updateMidnight('nebulaGlow', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-700"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* GOLDEN SUNSET CONTROLS */}
            {selectedThemeId === 'sunset' && (
              <div className="space-y-6">
                {/* Sun Controls */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-black text-gray-800">Solar Disc & Corona</span>
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
                    <div className="space-y-4 pt-2 border-t border-gray-200/60">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Sun Diameter / Size</span>
                          <span className="text-amber-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.sunset.sunSize} px
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="50" 
                          max="220" 
                          step="5"
                          value={config.sunset.sunSize} 
                          onChange={(e) => updateSunset('sunSize', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Solar Flare & Glow</span>
                          <span className="text-amber-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {Math.round(config.sunset.sunGlowIntensity * 100)}%
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0.2" 
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

                {/* Solar Dust & Horizon Controls */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-600" />
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
                    <div className="pt-2 border-t border-gray-200/60">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                        <span>Dust Particle Count</span>
                        <span className="text-orange-700 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                          {config.sunset.solarDustCount} Particles
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="40" 
                        step="1"
                        value={config.sunset.solarDustCount} 
                        onChange={(e) => updateSunset('solarDustCount', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                  )}
                </div>

                {/* Horizon Warmth Tint */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70">
                  <label className="block text-xs font-black text-gray-700 mb-2">Horizon Gradient Tint</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'amber', name: 'Amber Gold', desc: 'Warm Radiant' },
                      { id: 'crimson', name: 'Crimson Sunset', desc: 'Deep Scarlet' },
                      { id: 'golden', name: 'Golden Glow', desc: 'Vibrant Solar' }
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => updateSunset('horizonWarmth', w.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          config.sunset.horizonWarmth === w.id
                            ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs block">{w.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{w.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DEEP OCEAN CONTROLS */}
            {selectedThemeId === 'ocean' && (
              <div className="space-y-6">
                {/* Marine Bubbles */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-cyan-700" />
                      <span className="text-sm font-black text-gray-800">Bioluminescent Rising Bubbles</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.ocean.showBubbles} 
                        onChange={(e) => updateOcean('showBubbles', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-700"></div>
                    </label>
                  </div>

                  {config.ocean.showBubbles && (
                    <div className="space-y-4 pt-2 border-t border-gray-200/60">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Bubble Count</span>
                          <span className="text-cyan-800 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
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
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-700"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Bubble Rising Velocity</span>
                          <span className="text-cyan-800 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.ocean.bubbleRiseSpeed.toFixed(1)}x
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="2.0" 
                          step="0.1"
                          value={config.ocean.bubbleRiseSpeed} 
                          onChange={(e) => updateOcean('bubbleRiseSpeed', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Light Rays & Wave Shimmer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-800">Piercing Light Rays</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.ocean.showLightRays} 
                          onChange={(e) => updateOcean('showLightRays', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
                      </label>
                    </div>

                    {config.ocean.showLightRays && (
                      <div>
                        <input 
                          type="range" 
                          min="0.2" 
                          max="1.0" 
                          step="0.05"
                          value={config.ocean.rayIntensity} 
                          onChange={(e) => updateOcean('rayIntensity', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-700"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800 block">Surface Wave Shimmer</span>
                      <span className="text-[11px] text-gray-500 font-medium">Dynamic gradient motion</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.ocean.showWaveShimmer} 
                        onChange={(e) => updateOcean('showWaveShimmer', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-700"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* EMERALD FOREST CONTROLS */}
            {selectedThemeId === 'forest' && (
              <div className="space-y-6">
                {/* Fireflies Controls */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trees className="w-4 h-4 text-emerald-700" />
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
                    <div className="space-y-4 pt-2 border-t border-gray-200/60">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Firefly Population</span>
                          <span className="text-emerald-800 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.forest.fireflyCount} Fireflies
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="60" 
                          step="2"
                          value={config.forest.fireflyCount} 
                          onChange={(e) => updateForest('fireflyCount', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Glow Halo Size / Radius</span>
                          <span className="text-emerald-800 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.forest.fireflyGlowSize} px
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="3" 
                          max="14" 
                          step="1"
                          value={config.forest.fireflyGlowSize} 
                          onChange={(e) => updateForest('fireflyGlowSize', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      {/* Firefly Color Palette */}
                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-2">Firefly Light Hue</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'emerald', name: 'Emerald Glow', color: 'bg-emerald-400' },
                            { id: 'gold', name: 'Golden Lantern', color: 'bg-amber-300' },
                            { id: 'mint', name: 'Mint Aurora', color: 'bg-teal-300' }
                          ].map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => updateForest('fireflyColor', c.id)}
                              className={`p-2 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
                                config.forest.fireflyColor === c.id
                                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full ${c.color} shadow-sm`} />
                              <span className="text-xs">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Canopy Mist & Leaves */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800 block">Floating Botanical Leaves</span>
                      <span className="text-[11px] text-gray-500 font-medium">Gentle drifting foliage</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.forest.showFloatingLeaves} 
                        onChange={(e) => updateForest('showFloatingLeaves', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800 block">Forest Canopy Mist</span>
                      <span className="text-[11px] text-gray-500 font-medium">Soft enchanted overlay</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.forest.forestMistOverlay} 
                        onChange={(e) => updateForest('forestMistOverlay', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PREMIUM VIBRANT CONTROLS */}
            {selectedThemeId === 'default' && (
              <div className="space-y-6">
                {/* Luminous Orbs Controls */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-700" />
                      <span className="text-sm font-black text-gray-800">Luminous Ambient Orbs</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.default.showOrbs} 
                        onChange={(e) => updateVibrant('showOrbs', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#3C128D] peer-checked:to-[#8A2CB0]"></div>
                    </label>
                  </div>

                  {config.default.showOrbs && (
                    <div className="space-y-4 pt-2 border-t border-gray-200/60">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Orb Scale / Diameter</span>
                          <span className="text-purple-800 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.default.orbSizeScale.toFixed(1)}x
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="1.8" 
                          step="0.1"
                          value={config.default.orbSizeScale} 
                          onChange={(e) => updateVibrant('orbSizeScale', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A2CB0]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                          <span>Active Orb Count</span>
                          <span className="text-purple-800 font-black px-2 py-0.5 rounded-md bg-white border border-gray-200">
                            {config.default.orbCount} Orbs
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="6" 
                          step="1"
                          value={config.default.orbCount} 
                          onChange={(e) => updateVibrant('orbCount', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A2CB0]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Stardust & Center Glow */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-800">Sparkling Golden Stardust</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={config.default.showStardustParticles} 
                          onChange={(e) => updateVibrant('showStardustParticles', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8A2CB0]"></div>
                      </label>
                    </div>

                    {config.default.showStardustParticles && (
                      <div>
                        <input 
                          type="range" 
                          min="5" 
                          max="30" 
                          step="2"
                          value={config.default.particleDensity} 
                          onChange={(e) => updateVibrant('particleDensity', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A2CB0]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-gray-800 block">Radial Center Aura</span>
                      <span className="text-[11px] text-gray-500 font-medium">Warm luminous central glow</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.default.showCenterGlow} 
                        onChange={(e) => updateVibrant('showCenterGlow', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8A2CB0]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeStudio;
