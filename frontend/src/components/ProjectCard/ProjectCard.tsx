import { motion } from 'framer-motion';
import type { Project } from '../../types/portfolio';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <motion.div
      id={`project-${project.namespace.replace(/[^a-zA-Z0-9-]/g, '-')}`}
      className="deploy"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Top bar with namespace and status */}
      <div className="deploy-head">
        <span className="ns">{project.namespace}</span>
        <div className="deploy-head-labels">
          {project.statusLabel.split('·').map((label, i) => (
            <span className="head-label" key={i}>
              {i === 0 && <span className="status-dot live" />}
              {label.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Full-width image area */}
      <div className="deploy-media">
        {project.image ? (
          <img src={project.image} alt={project.title} className="deploy-img" />
        ) : (
          <div className="deploy-media-placeholder">
            {project.mediaPlaceholder}
          </div>
        )}
      </div>

      {/* Content below image */}
      <div className="deploy-body">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="chips">
          {project.chips.map(c => (
            <span className="chip" key={c}>{c}</span>
          ))}
        </div>
        <div className="deploy-links">
          {project.links.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
              <span className="link-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
