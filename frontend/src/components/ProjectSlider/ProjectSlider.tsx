import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../../types/portfolio';
import './ProjectSlider.css';

interface ProjectSliderProps {
  projects: Project[];
}

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

const ProjectSlider = ({ projects }: ProjectSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleSelect = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentProject = projects[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="slider-wrapper">
      {/* Slider Header / Controls */}
      <div className="slider-controls-head">
        <div className="slider-counter">
          <span className="current-num">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className="counter-slash">/</span>
          <span className="total-num">
            {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <div className="slider-arrows">
          <button
            type="button"
            className="arrow-btn"
            onClick={handlePrev}
            aria-label="Proyecto anterior"
          >
            ←
          </button>
          <button
            type="button"
            className="arrow-btn"
            onClick={handleNext}
            aria-label="Proyecto siguiente"
          >
            →
          </button>
        </div>
      </div>

      {/* Main Slide Track */}
      <div className="slider-viewport">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.65, ease: appleEase }}
            className="slider-card"
          >
            <div className="card-top-bar">
              <span className="card-ns">{currentProject.namespace}</span>
              <span className="card-status-pill">
                <span className="status-dot live" />
                {currentProject.statusLabel}
              </span>
            </div>

            <div className="card-content-grid">
              <div className="card-media-box">
                {currentProject.mediaPlaceholder}
              </div>

              <div className="card-text-box">
                <h3 className="card-title">{currentProject.title}</h3>
                <p className="card-desc">{currentProject.description}</p>

                <div className="card-chips">
                  {currentProject.chips.map((chip) => (
                    <span className="chip-tag" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="card-links">
                  {currentProject.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-anchor"
                    >
                      {link.label}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="link-icon"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Pagination Dots */}
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
