import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import './Header.css';

interface HeaderProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const Header = ({ scrollContainerRef }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const target = scrollContainerRef?.current;
    if (!target) return;

    const handleScroll = () => {
      setIsScrolled(target.scrollTop > 100);
    };

    target.addEventListener('scroll', handleScroll);
    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const container = scrollContainerRef?.current;
    if (!container) return;
    const section = container.querySelector(`#${sectionId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scrollContainerRef]);

  return (
    <motion.header 
      className={`site-header ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="header-logo">
        <a
          href="#inicial"
          onClick={(e) => scrollToSection(e, 'inicial')}
        >
          DM.
        </a>
      </div>
      <nav className="header-nav">
        <ul>
          <li>
            <a href="#proyectos" onClick={(e) => scrollToSection(e, 'proyectos')}>
              Proyectos
            </a>
          </li>
          <li>
            <a href="#contacto" onClick={(e) => scrollToSection(e, 'contacto')}>
              Contacto
            </a>
          </li>
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
