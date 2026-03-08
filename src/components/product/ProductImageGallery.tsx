import { useMemo, useState, useRef, MouseEvent, TouchEvent, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, ZoomIn, ZoomOut, Sparkles } from "lucide-react";
import { IMAGE_PLACEHOLDER, getSafeImageSrc } from "@/lib/imageFallback";

interface Props {
  images: string[];
  name: string;
}

// Generate grid pieces for break-apart effect
const GRID = 4;
const PIECES = Array.from({ length: GRID * GRID }, (_, i) => ({
  row: Math.floor(i / GRID),
  col: i % GRID,
}));

export default function ProductImageGallery({ images, name }: Props) {
  const safeImages = useMemo(
    () => Array.from(new Set((images || []).filter(Boolean))),
    [images]
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPieces, setShowPieces] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef<number>(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!zoom || !containerRef.current || isAnimating) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (isAnimating) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      setZoom(!zoom);
      if (e.touches && e.touches[0] && containerRef.current) {
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.touches[0].clientX - left) / width) * 100;
        const y = ((e.touches[0].clientY - top) / height) * 100;
        setZoomPos({ x, y });
      }
    }
    lastTap.current = now;
  };

  // Trigger break-apart animation when switching images
  const switchImage = useCallback((newIndex: number) => {
    if (newIndex === selectedImage || isAnimating) return;
    setZoom(false);
    setIsAnimating(true);
    setShowPieces(true);

    // After pieces scatter, switch image, then reassemble
    setTimeout(() => {
      setSelectedImage(newIndex);
      // Small delay before reassembly starts
      setTimeout(() => {
        setShowPieces(false);
        setTimeout(() => setIsAnimating(false), 600);
      }, 100);
    }, 500);
  }, [selectedImage, isAnimating]);

  const currentSrc = getSafeImageSrc(safeImages[selectedImage]);

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom & Break-Apart */}
      <div
        ref={containerRef}
        className="relative aspect-square rounded-3xl overflow-hidden bg-secondary cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !zoom && !isAnimating && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onTouchEnd={handleTouchEnd}
      >
        {/* Break-apart pieces overlay */}
        <AnimatePresence>
          {isAnimating && (
            <div className="absolute inset-0 z-20 grid" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gridTemplateRows: `repeat(${GRID}, 1fr)` }}>
              {PIECES.map((piece, i) => {
                const randX = (Math.random() - 0.5) * 300;
                const randY = (Math.random() - 0.5) * 300;
                const randRotate = (Math.random() - 0.5) * 90;
                return (
                  <motion.div
                    key={`${piece.row}-${piece.col}`}
                    className="overflow-hidden"
                    initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                    animate={showPieces
                      ? { x: randX, y: randY, rotate: randRotate, opacity: 0, scale: 0.5 }
                      : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
                    }
                    transition={{
                      duration: showPieces ? 0.45 : 0.55,
                      delay: showPieces ? i * 0.02 : (PIECES.length - i) * 0.02,
                      ease: showPieces ? "easeIn" : [0.34, 1.56, 0.64, 1],
                    }}
                  >
                    <div
                      className="w-full h-full bg-cover bg-no-repeat"
                      style={{
                        backgroundImage: `url(${currentSrc})`,
                        backgroundPosition: `${(piece.col / (GRID - 1)) * 100}% ${(piece.row / (GRID - 1)) * 100}%`,
                        backgroundSize: `${GRID * 100}%`,
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Main image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: isAnimating ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <img
              src={currentSrc}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
              style={{
                transform: zoom && !isAnimating ? "scale(2.5)" : "scale(1)",
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
              onError={(e) => {
                if (selectedImage < safeImages.length - 1) {
                  setSelectedImage(selectedImage + 1);
                  return;
                }
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = IMAGE_PLACEHOLDER;
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom Controls Hint */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <div className="glass px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <SearchIcon className="w-3 h-3" />
            {zoom ? "Scroll to Explore" : "Hover to Zoom"}
          </div>
        </div>

        {/* Animation indicator */}
        {safeImages.length > 1 && (
          <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 opacity-0 group-hover:opacity-70 transition-opacity">
            <Sparkles className="w-3 h-3 text-primary" />
            Click thumbnails for effect
          </div>
        )}

        {/* Mobile Hint */}
        <div className="md:hidden absolute top-4 right-4 glass p-2 rounded-full text-muted-foreground">
          {zoom ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {safeImages.map((img, i) => (
          <button
            key={i}
            onClick={() => switchImage(i)}
            disabled={isAnimating}
            className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
              i === selectedImage
                ? "border-primary scale-105 shadow-lg shadow-primary/20"
                : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
            } ${isAnimating ? "pointer-events-none" : ""}`}
          >
            <img
              src={getSafeImageSrc(img)}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = IMAGE_PLACEHOLDER;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
