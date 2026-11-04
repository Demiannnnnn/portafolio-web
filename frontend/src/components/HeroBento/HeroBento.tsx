import { motion } from 'framer-motion';
import type { Skill } from '../../types/portfolio';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import './HeroBento.css';

interface SkillCategory {
  title: string;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'INFRAESTRUCTURA',
    skills: [
      { logo: '/logos/vms.svg', name: 'Virtual Machines (VMs)', level: 'Avanzado', percent: 100, color: '#F59E0B' },
      { logo: '/logos/linux.svg', name: 'Linux', level: 'Avanzado', percent: 92, color: '#F97316' },
      { logo: '/logos/docker.svg', name: 'Docker & Compose', level: 'Avanzado', percent: 88, color: '#0284C7' },
      { logo: '/logos/gcp.svg', name: 'Google Cloud (GCP)', level: 'Avanzado', percent: 82, color: '#4285F4' },
      { logo: '/logos/k8s.svg', name: 'Kubernetes', level: 'Básico', percent: 25, color: '#326CE5' },
    ],
  },
  {
    title: 'SEGURIDAD & PENTESTING',
    skills: [
      { logo: '/logos/linux.svg', name: 'Linux OS', level: 'Avanzado', percent: 92, color: '#F97316' },
      { logo: '/logos/kali.svg', name: 'Kali Linux', level: 'Avanzado', percent: 88, color: '#557C93' },
      { logo: '/logos/rust.svg', name: 'Rust (Sec)', level: 'Básico', percent: 30, color: '#DEA584' },
    ],
  },
  {
    title: 'DESARROLLO WEB',
    skills: [
      { logo: '/logos/express.svg', name: 'Express.js', level: 'Avanzado', percent: 100, color: '#3f3f46' },
      { logo: '/logos/js.svg', name: 'JavaScript', level: 'Avanzado', percent: 92, color: '#EAB308' },
      { logo: '/logos/fastapi.svg', name: 'FastAPI', level: 'Intermedio', percent: 70, color: '#0D9488' },
      { logo: '/logos/react.svg', name: 'React', level: 'Intermedio', percent: 60, color: '#06B6D4' },
      { logo: '/logos/ts.svg', name: 'TypeScript', level: 'Básico', percent: 40, color: '#3178C6' },
    ],
  },
  {
    title: 'LENGUAJES',
    skills: [
      { logo: '/logos/js.svg', name: 'JavaScript (JS)', level: 'Avanzado', percent: 92, color: '#EAB308' },
      { logo: '/logos/python.svg', name: 'Python (Py)', level: 'Avanzado', percent: 85, color: '#2563EB' },
      { logo: '/logos/java.svg', name: 'Java', level: 'Intermedio', percent: 53, color: '#EA580C' },
      { logo: '/logos/ts.svg', name: 'TypeScript (TS)', level: 'Básico', percent: 42, color: '#3178C6' },
      { logo: '/logos/rust.svg', name: 'Rust', level: 'Básico', percent: 30, color: '#DEA584' },
      { logo: '/logos/go.svg', name: 'Go (Golang)', level: 'Básico', percent: 10, color: '#00ADD8' },
    ],
  },
];

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

const HeroBento = () => {
  const [skillsRef, skillsVisible] = useScrollReveal<HTMLDivElement>();

  let globalSkillIndex = 0;

  return (
    <section className="hero-landscape-section">
      {/* TOP: EXPANSIVE LAYOUT (PHOTO FAR LEFT + PRESENTATION FAR RIGHT) */}
      <div className="hero-top-layout">
        {/* STEP 1: PHOTO FRAME (LEFT CONTOUR) */}
        <motion.div
          className="hero-photo-card"
          initial={{ opacity: 0, x: -50, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.9, ease: appleEase }}
        >
          <div className="photo-placeholder-box">
            <span className="placeholder-text">[Inserta tu foto aquí]</span>
          </div>

          <div className="photo-status-badge">
            <span className="status-dot live" />
            <span>Disponible para trabajar</span>
          </div>
        </motion.div>

        {/* STEP 2: PRESENTATION TEXT (RIGHT CONTOUR) */}
        <div className="hero-intro-floating">
          <motion.div
            className="intro-location-tag"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: appleEase }}
          >
            <span>📍 Rengo, Chile</span>
          </motion.div>

          <motion.h1
            className="hero-main-title"
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.45, duration: 0.85, ease: appleEase }}
          >
            Hola, soy Demian <br />
            Maturana.
          </motion.h1>

          <motion.p
            className="hero-main-bio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8, ease: appleEase }}
          >
            Estudiante finalizando Ingeniería Civil en Computación. Me especializo en
            el ecosistema <b>Full-Stack</b>, diseño de <b>Infraestructura de Redes</b> y
            entornos de seguridad. Actualmente, me desempeño como ayudante académico en
            dos asignaturas.
          </motion.p>

          <motion.div
            className="hero-meta-inline"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: appleEase }}
          >
            <div className="meta-group">
              <span className="meta-title">Intereses</span>
              <span className="meta-value">Web Dev · Infra · Cybersecurity · IoT</span>
            </div>
            <div className="meta-divider" />
            <div className="meta-group">
              <span className="meta-title">Setup</span>
              <span className="meta-value">Arch Linux · Hyprland · Mac M2</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* STEP 3: SIDE-BY-SIDE HORIZONTAL CATEGORIES (4 COLUMNS) */}
      <div className="hero-skills-horizontal-section" ref={skillsRef}>
        <motion.div
          className="skills-main-eyebrow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease: appleEase }}
        >
          HABILIDADES & CLASIFICACIÓN TÉCNICA
        </motion.div>

        <div className="skills-horizontal-columns">
          {skillCategories.map((cat, catIdx) => (
            <motion.div
              className="skill-category-column"
              key={cat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.0 + catIdx * 0.15,
                duration: 0.6,
                ease: appleEase,
              }}
            >
              <h3 className="category-column-head">{cat.title}</h3>
              <div className="category-skills-vertical-list">
                {cat.skills.map((skill) => {
                  const currentDelay = 1.1 + globalSkillIndex * 0.1;
                  globalSkillIndex++;

                  return (
                    <motion.div
                      className="skill-floating-card"
                      key={skill.name}
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: currentDelay,
                        duration: 0.55,
                        ease: appleEase,
                      }}
                    >
                      <div className="skill-logo-box">
                        <img src={skill.logo} alt={skill.name} className="skill-icon-img" />
                      </div>
                      <div className="skill-content-box">
                        <div className="skill-header-line">
                          <span className="skill-title">{skill.name}</span>
                          <span className={`skill-badge-level ${skill.level.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                            {skill.level}
                          </span>
                        </div>
                        <div className="skill-track-bar">
                          <div
                            className="skill-fill-bar"
                            style={{
                              width: skillsVisible ? `${skill.percent}%` : '0%',
                              backgroundColor: skill.color || 'var(--accent)',
                              boxShadow: skill.color ? `0 0 8px ${skill.color}55` : 'none',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.8 }}
      >
        <span className="scroll-text">scroll</span>
        <div className="scroll-line-track">
          <div className="scroll-line-thumb" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroBento;
