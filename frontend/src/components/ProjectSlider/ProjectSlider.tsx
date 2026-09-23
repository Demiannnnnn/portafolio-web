import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Project } from '../../types/portfolio';
import './ProjectSlider.css';

interface ProjectSliderProps {
  projects: Project[];
}

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

const ProjectSlider = ({ projects }: ProjectSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Reset index when project list changes (category filter)
  useEffect(() => {
    setCurrentIndex(0);
  }, [projects]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  }, [projects.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  }, [projects.length]);

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNext, handlePrev]);

  /**
   * Calculate the shortest circular offset from currentIndex to a given index.
   * Returns a value in range [-(len/2), +(len/2)].
   */
  const getCircularOffset = (idx: number): number => {
    const len = projects.length;
    const raw = idx - currentIndex;
    if (raw > len / 2) return raw - len;
    if (raw < -len / 2) return raw + len;
    return raw;
  };

  /**
   * Determine which project indices are "visible" (within ±3 of center).
   */
  const visibleProjects: { project: Project; idx: number; offset: number }[] = [];
  for (let i = 0; i < projects.length; i++) {
    const offset = getCircularOffset(i);
    if (Math.abs(offset) <= 3) {
      visibleProjects.push({ project: projects[i], idx: i, offset });
    }
  }

  return (
    <div className="slider-wrapper">
      {/* Navigation arrows removed — use dots or keyboard */}

      {/* 3D Carousel Track */}
      <div className="carousel-viewport">
        <div className="carousel-track">
          {visibleProjects.map(({ project, idx, offset }) => {
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            return (
              <motion.div
                /* Key by project namespace so DOM nodes persist across slides */
                key={project.namespace}
                className={`carousel-card ${isCenter ? 'center' : 'side'}`}
                layout
                animate={{
                  x: `${offset * 82}%`,
                  scale: isCenter ? 1 : 0.82 - absOffset * 0.04,
                  rotateY: offset * -15,
                  z: isCenter ? 0 : -180 * absOffset,
                  opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.22,
                  filter: isCenter ? 'blur(0px)' : `blur(${absOffset * 2}px)`,
                }}
                transition={{
                  duration: 0.7,
                  ease: appleEase,
                  filter: { duration: 0.5 },
                }}
                onClick={() => !isCenter && handleSelect(idx)}
                style={{
                  zIndex: 10 - absOffset,
                  cursor: isCenter ? 'default' : 'pointer',
                  pointerEvents: absOffset > 2 ? 'none' : 'auto',
                }}
              >
                {/* Top bar */}
                <div className="carousel-card-head">
                  <span className="carousel-card-ns">{project.namespace}</span>
                  <div className="carousel-card-labels">
                    {project.statusLabel.split('·').map((label, i) => (
                      <span className="carousel-head-label" key={i}>
                        {i === 0 && <span className="status-dot live" />}
                        {label.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image area */}
                <div className="carousel-card-media">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="carousel-card-img"
                    />
                  ) : (
                    <div className="carousel-card-placeholder">
                      {project.mediaPlaceholder}
                    </div>
                  )}
                </div>

                {/* Body content */}
                <div className="carousel-card-body">
                  <h3 className="carousel-card-title">{project.title}</h3>
                  <p className="carousel-card-desc">{project.description}</p>

                  <div className="carousel-card-chips">
                    {project.chips.map((chip) => (
                      <span className="carousel-chip" key={chip}>
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="carousel-card-links">
                    {project.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="carousel-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {link.label}
                        <span className="carousel-link-arrow">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="slider-dots">
        {projects.map((proj, idx) => (
          <button
            type="button"
            key={proj.namespace}
            className={`dot-btn ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => handleSelect(idx)}
            aria-label={`Ir al proyecto ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectSlider;
