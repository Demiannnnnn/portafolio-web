import { motion } from 'framer-motion';
import './ContactSection.css';

const ContactSection = () => {
  return (
    <motion.section 
      id="contacto" 
      className="contact-wrap"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.15
          }
        }
      }}
    >
      <div className="contact-inner">
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } }
          }}
        >
          ¿Tienes un proyecto en mente?
        </motion.h2>
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }
          }}
        >
          Siempre abierto a charlar sobre desarrollo web, infraestructura o para armar unas partidas de videojuegos en el tiempo libre.
        </motion.p>
        <motion.a 
          href="mailto:tu-correo@ejemplo.com" 
          className="btn-submit"
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
          }}
        >
          Contactar por Email
        </motion.a>
      </div>
    </motion.section>
  );
};

export default ContactSection;
