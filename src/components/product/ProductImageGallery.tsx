import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X } from "lucide-react";

interface Props {
  images: string[];
  name: string;
}

export default function ProductImageGallery({ images, name }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isExploded, setIsExploded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const fragments = Array.from({ length: 9 }, (_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    return {
      id: i,
      originX: `${col * 33.33}%`,
      originY: `${row * 33.33}%`,
      width: "33.34%",
      height: "33.34%",
      tx: (col - 1) * (80 + Math.random() * 60),
      ty: (row - 1) * (80 + Math.random() * 60),
      rotate: (Math.random() - 0.5) * 45,
      delay: Math.random() * 0.1,
    };
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || !zoomed) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, [zoomed]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!imgRef.current || !zoomed) return;
    const touch = e.touches[0];
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [zoomed]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Main Image */}
      <div
        ref={imgRef}
        className="relative aspect-square rounded-3xl overflow-hidden bg-secondary cursor-pointer select-none"
        onClick={() => {
          if (zoomed) { setZoomed(false); return; }
          setIsExploded(!isExploded);
        }}
        onDoubleClick={() => { setZoomed(!zoomed); setIsExploded(false); }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => zoomed && setZoomed(false)}
        onTouchMove={handleTouchMove}
      >
        <AnimatePresence mode="wait">
          {isExploded && !zoomed ? (
            <motion.div key={`exploded-${selectedImage}`} className="absolute inset-0" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {fragments.map((frag) => (
                <motion.div
                  key={frag.id}
                  className="absolute overflow-hidden"
                  style={{ left: frag.originX, top: frag.originY, width: frag.width, height: frag.height }}
                  initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                  animate={{ x: frag.tx, y: frag.ty, rotate: frag.rotate, opacity: 0.85, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: frag.delay }}
                >
                  <div
                    className="w-full h-full rounded-lg shadow-2xl border border-primary/20"
                    style={{
                      backgroundImage: `url(${images[selectedImage]})`,
                      backgroundSize: "300% 300%",
                      backgroundPosition: `${(frag.id % 3) * 50}% ${Math.floor(frag.id / 3) * 50}%`,
                    }}
                  />
                </motion.div>
              ))}
              <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <div className="w-24 h-24 rounded-full gold-gradient opacity-30 blur-2xl" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={`image-${selectedImage}`}
              className="w-full h-full"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <img
                src={images[selectedImage]}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={zoomed ? {
                  transform: "scale(2.5)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                } : undefined}
                draggable={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom indicator */}
        {!isExploded && !zoomed && (
          <motion.div
            className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        )}

        {zoomed && (
          <motion.div
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/80 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <X className="w-4 h-4 text-foreground" />
          </motion.div>
        )}

        {/* Hint */}
        <motion.div
          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {zoomed ? "Click to exit zoom" : isExploded ? "Tap to reassemble" : "Tap to explore · Double-tap to zoom"}
        </motion.div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setSelectedImage(i); setIsExploded(false); setZoomed(false); }}
            className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
              i === selectedImage ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
