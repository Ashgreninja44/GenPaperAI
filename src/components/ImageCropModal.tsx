import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Check, 
  Image as ImageIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { cropAndProcessImage, loadImageElement } from '../services/profilePhotoService';

interface ImageCropModalProps {
  file: File;
  onConfirm: (croppedBlob: Blob) => Promise<void> | void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  file,
  onConfirm,
  onCancel,
  isProcessing = false
}) => {
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [imgLoading, setImgLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Crop & Adjust States
  const [zoom, setZoom] = useState<number>(1.0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; startOffsetX: number; startOffsetY: number }>({
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0
  });

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load image element from selected file
  useEffect(() => {
    let isMounted = true;
    setImgLoading(true);
    setLoadError(null);

    loadImageElement(file)
      .then((img) => {
        if (isMounted) {
          setImgElement(img);
          setImgLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Error loading image for crop:", err);
          setLoadError("Unable to open image. Please choose another image file.");
          setImgLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Update live preview mini canvas
  useEffect(() => {
    if (!imgElement || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const imgWidth = imgElement.naturalWidth || imgElement.width;
    const imgHeight = imgElement.naturalHeight || imgElement.height;
    if (!imgWidth || !imgHeight) return;

    const baseScale = Math.max(size / imgWidth, size / imgHeight);
    const totalScale = baseScale * zoom;

    const drawWidth = imgWidth * totalScale;
    const drawHeight = imgHeight * totalScale;

    const drawX = (size - drawWidth) / 2 + offset.x * (size / 256);
    const drawY = (size - drawHeight) / 2 + offset.y * (size / 256);

    ctx.drawImage(imgElement, drawX, drawY, drawWidth, drawHeight);
  }, [imgElement, zoom, offset]);

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isProcessing) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isProcessing) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    // Bounds limit based on zoom
    const maxBound = 160 * zoom;
    const newX = Math.max(-maxBound, Math.min(maxBound, dragStartRef.current.startOffsetX + dx));
    const newY = Math.max(-maxBound, Math.min(maxBound, dragStartRef.current.startOffsetY + dy));

    setOffset({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch (err) {}
    }
  };

  const handleReset = () => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  };

  const handleApplyCrop = async () => {
    if (!imgElement || isProcessing) return;
    try {
      const blob = await cropAndProcessImage(imgElement, {
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
        outputSize: 512
      });
      await onConfirm(blob);
    } catch (err) {
      console.error("Failed to generate cropped image:", err);
      setLoadError("Failed to process crop. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full overflow-hidden text-gray-900 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#3C128D] text-white shadow-md">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-black text-gray-900 text-base sm:text-lg">Adjust Profile Picture</h3>
              <p className="text-[11px] text-gray-500 font-medium">Pan and zoom to frame your circular avatar</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loadError ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{loadError}</span>
            </div>
          ) : imgLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-[#3C128D] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 font-bold">Loading selected image...</p>
            </div>
          ) : (
            <>
              {/* Interactive Cropper Stage */}
              <div className="flex flex-col items-center justify-center">
                <div 
                  className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden bg-gray-950 shadow-inner border border-gray-800 cursor-grab active:cursor-grabbing select-none touch-none flex items-center justify-center"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* Image Display */}
                  {imgElement && (
                    <img
                      src={imgElement.src}
                      alt="Crop preview"
                      className="max-w-none pointer-events-none transition-transform duration-75"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                        transformOrigin: 'center center'
                      }}
                      draggable={false}
                    />
                  )}

                  {/* Circular Avatar Framing Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Dark Vignette outside circle */}
                    <div 
                      className="w-full h-full"
                      style={{
                        background: 'radial-gradient(circle 105px at center, transparent 104px, rgba(15, 10, 30, 0.72) 105px)'
                      }}
                    />
                    {/* Crisp Circular Reticle Guide */}
                    <div className="absolute w-[210px] h-[210px] rounded-full border-2 border-white/90 shadow-[0_0_15px_rgba(255,255,255,0.4)] pointer-events-none flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Drag Prompt Tooltip */}
                  <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1.5 pointer-events-none border border-white/15">
                    <Move className="w-3 h-3 text-amber-300" />
                    <span>Drag to reposition</span>
                  </div>
                </div>
              </div>

              {/* Controls: Zoom Slider & Mini Live Preview */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                    <ZoomIn className="w-4 h-4 text-[#8A2CB0]" />
                    <span>Scale / Zoom</span>
                    <span className="text-[11px] font-mono text-gray-400">({zoom.toFixed(1)}x)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-bold text-[#8A2CB0] hover:text-[#3C128D] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    disabled={isProcessing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#8A2CB0]"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
                </div>

                {/* Avatar Preview Row */}
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#8A2CB0] shadow-md bg-white shrink-0">
                      <canvas 
                        ref={previewCanvasRef} 
                        width={96} 
                        height={96} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Avatar Output Preview</p>
                      <p className="text-[10px] text-gray-500 font-medium">512×512 HD Circular Aspect</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-md bg-purple-100 text-[#3C128D] text-[10px] font-black uppercase tracking-wider">
                      {file.name.split('.').pop()?.toUpperCase()} • {(file.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing || imgLoading || Boolean(loadError)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#3C128D] to-[#8A2CB0] hover:from-[#2c0d68] hover:to-[#732494] text-white font-black text-xs sm:text-sm transition-all shadow-lg hover:shadow-purple-900/25 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Picture...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Set Profile Picture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
