import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="site-footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="footer-line"
        initial={{ scaleX: 0 }} 
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
      <p>© {currentYear} Demian Maturana</p>
    </motion.footer>
  );
};

export default Footer;
