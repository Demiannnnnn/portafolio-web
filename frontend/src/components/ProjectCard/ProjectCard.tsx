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
      <div className="deploy-head">
        <span className="ns">{project.namespace}</span>
        <span className="pill">
          <span className="status-dot live" />
          {project.statusLabel}
        </span>
      </div>
      <div className="deploy-body">
        <div className="deploy-media">{project.mediaPlaceholder}</div>
        <div>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <div className="chips">
            {project.chips.map(c => (
              <span className="chip" key={c}>{c}</span>
            ))}
          </div>
          <div className="deploy-links">
            {project.links.map(link => (
              <a key={link.label} href={link.href}>
                {link.label}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
