import { useMemo, useState, useRef, MouseEvent, TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  images: string[];
  name: string;
}

export default function ProductImageGallery({ images, name }: Props) {
  const safeImages = useMemo(
    () => Array.from(new Set((images || []).filter(Boolean))),
    [images]
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef<number>(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!zoom || !containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
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

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <div
        ref={containerRef}
        className="relative aspect-square rounded-3xl overflow-hidden bg-secondary cursor-zoom-in group"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !zoom && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <img
              src={safeImages[selectedImage] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-200 ease-out"
              style={{
                transform: zoom ? "scale(2.5)" : "scale(1)",
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
              onError={() => {
                if (selectedImage < safeImages.length - 1) setSelectedImage(selectedImage + 1);
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
            onClick={() => {
              setSelectedImage(i);
              setZoom(false);
            }}
            className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
              i === selectedImage
                ? "border-primary scale-105 shadow-lg shadow-primary/20"
                : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
            }`}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80";
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
