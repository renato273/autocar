// src/components/TimeMachineGallery.tsx
"use client";
import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Trash2, Eye } from "lucide-react";

interface TimeMachineGalleryProps {
  images: string[];
  baseUrl: string;
  onView: (src: string) => void;
  onDelete: (index: number) => void;
}

const timelineNodesFor = (count: number) => {
  const nodes: { type: "main" | "sub"; index: number }[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push({ type: "main", index: i });
    if (i < count - 1) {
      for (let j = 0; j < 2; j++) {
        nodes.push({ type: "sub", index: i + (j + 1) * 0.33 });
      }
    }
  }
  return nodes;
};

export const TimeMachineGallery = React.memo(function TimeMachineGallery({
  images,
  baseUrl,
  onView,
  onDelete,
}: TimeMachineGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const timelineNodes = useMemo(() => timelineNodesFor(images.length), [images.length]);

  const handleTimelineHover = (index: number) => {
    setHoveredIndex(index);
    setActiveIndex(Math.round(index));
  };

  if (images.length === 0) return null;

  return (
    <div className="tm-root">
      <svg className="tm-svg-defs" xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="SkiperSquiCircleFilterLayout">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -6"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div className="tm-perspective">
        {images.map((img, i) => {
          const offset = i - activeIndex;
          const isPast = i < activeIndex;
          return (
            <motion.div
              key={i}
              className="tm-card"
              initial={false}
              animate={{
                z: isPast ? 200 : -offset * 60,
                y: isPast ? 300 : -offset * 12,
                rotateX: isPast ? -20 : offset * 2,
                opacity: isPast ? 0 : 1 - Math.abs(offset) * 0.2,
                scale: isPast ? 1.3 : 1,
              }}
              transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.8 }}
              style={{ zIndex: images.length - i }}
              onClick={() => onView(img)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${baseUrl}${img}`} alt={`Foto ${i + 1}`} className="tm-card-img" />
              <div className="tm-card-shade" />
              <div className="tm-card-actions">
                <button
                  type="button"
                  className="gallery-action"
                  title="Ver en grande"
                  onClick={e => { e.stopPropagation(); onView(img); }}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  className="gallery-action danger"
                  title="Eliminar"
                  onClick={e => { e.stopPropagation(); onDelete(i); }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div
        className="tm-timeline"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {timelineNodes.map((node) => {
          if (node.type === "main") {
            const index = node.index;
            const isSelected = activeIndex === index;
            return (
              <button
                key={`main-${index}`}
                type="button"
                className="tm-tl-btn"
                onMouseEnter={() => handleTimelineHover(index)}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
              >
                {hoveredIndex === index && (
                  <motion.span
                    className={`tm-tl-label ${isSelected ? "selected" : ""}`}
                    initial={{ opacity: 0, filter: "blur(2px)", scale: 0.8 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    Foto {index + 1}
                  </motion.span>
                )}
                <motion.span
                  className={`tm-tl-line ${isSelected ? "selected" : ""}`}
                  animate={{
                    scaleX: hoveredIndex === null ? 1 : (isSelected ? 1.4 : (Math.abs(index - hoveredIndex) < 0.5 ? 1.25 : 1)),
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              </button>
            );
          }
          const isHoveringNear = hoveredIndex !== null && Math.abs(node.index - hoveredIndex) <= 0.5;
          return (
            <div
              key={`sub-${node.index}`}
              className="tm-tl-sub"
              onMouseEnter={() => handleTimelineHover(node.index)}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(Math.round(node.index));
              }}
            >
              <motion.span
                className="tm-tl-line sub"
                animate={{
                  scaleX: hoveredIndex === null ? 1 : (isHoveringNear ? 1.15 : 1),
                  opacity: hoveredIndex === null ? 0.3 : (isHoveringNear ? 0.5 : 0.3),
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
