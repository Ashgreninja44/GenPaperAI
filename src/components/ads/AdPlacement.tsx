import React, { useEffect, useRef, useState } from 'react';
import { 
  AdPlacementId, 
  UserProfile, 
  AdvertisementConfig 
} from '../../types';
import { 
  isPlacementActive, 
  PROHIBITED_PLACEMENT_IDS, 
  DEFAULT_AD_CONFIG,
  logAdError 
} from '../../services/adService';
import { Megaphone, ShieldAlert, Sparkles } from 'lucide-react';

interface AdPlacementProps {
  placementId: AdPlacementId;
  currentUser?: UserProfile | null;
  config?: AdvertisementConfig | null;
  isOwnerPreview?: boolean;
  className?: string;
  slotId?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdPlacement: React.FC<AdPlacementProps> = ({
  placementId,
  currentUser,
  config,
  isOwnerPreview = false,
  className = '',
  slotId
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 1. HARD SECURITY & INTEGRITY GATE: Strictly deny prohibited placements
  if (PROHIBITED_PLACEMENT_IDS.includes(placementId)) {
    return null;
  }

  const effectiveConfig = config || DEFAULT_AD_CONFIG;
  const placementConfig = effectiveConfig.placements[placementId];

  // 2. Active Eligibility Check (unless explicitly in Owner Sandbox Preview)
  const shouldRender = isOwnerPreview || isPlacementActive(placementId, currentUser, effectiveConfig);

  useEffect(() => {
    if (!shouldRender || isOwnerPreview) return;

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = window.adsbygoogle || [];
        adsbygoogle.push({});
        setAdLoaded(true);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Google AdSense script push error';
      setLoadError(errorMessage);
      logAdError(placementId, errorMessage);
    }
  }, [shouldRender, isOwnerPreview, placementId]);

  if (!shouldRender) {
    return null;
  }

  // 3. OWNER SANDBOX PREVIEW MODE (No artificial clicks or live impressions)
  if (isOwnerPreview) {
    return (
      <div 
        id={`ad-preview-${placementId}`}
        className={`w-full border-2 border-dashed border-amber-400/70 bg-amber-500/5 dark:bg-amber-950/20 rounded-2xl p-4 text-center my-3 relative overflow-hidden transition-all ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2.5 text-left">
            <div className="p-2 rounded-xl bg-amber-400 text-gray-950 shadow-sm shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                  {placementConfig?.name || placementId}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400/30 text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Owner Test Preview
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                {placementConfig?.description || 'Active advertisement placement container.'}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20 shrink-0">
            Format: {placementConfig?.format || 'auto'} • Safe Sandbox
          </div>
        </div>
      </div>
    );
  }

  // 4. PRODUCTION ADSENSE RENDER (Safe, non-blocking)
  const clientId = effectiveConfig.adSense.clientId || 'ca-pub-7837168331919243';
  const effectiveSlot = slotId || placementConfig?.slotId || '1234567890';

  return (
    <div 
      id={`ad-container-${placementId}`}
      className={`genpaper-ad-slot my-4 text-center overflow-hidden transition-all ${className}`}
      style={{ minHeight: '60px' }}
    >
      <div className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-1 select-none font-bold">
        Advertisement
      </div>
      
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={effectiveSlot}
        data-ad-format={placementConfig?.format || 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
};
