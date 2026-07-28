import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { createContact, type ContactPayload } from '../../services/api';
import './ContactSection.css';

const ContactSection = () => {
  const [formData, setFormData] = useState<ContactPayload>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      await createContact(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al enviar el mensaje. Inténtalo de nuevo.',
      );
    }
  };

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
            staggerChildren: 0.15,
          },
        },
      }}
    >
      <div className="contact-container">
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
            },
          }}
        >
          ¿Tienes un proyecto en mente?
        </motion.h2>

        <motion.p
          className="contact-subtitle"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
            },
          }}
        >
          Envíame un mensaje sobre desarrollo web, infraestructura de redes, ciberseguridad o colaboración en proyectos.
        </motion.p>

        <motion.div
          className="contact-form-card"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
            },
          }}
        >
          {status === 'success' ? (
            <motion.div
              className="contact-success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="success-icon">✓</div>
              <h3>¡Mensaje enviado con éxito!</h3>
              <p>Gracias por escribirme. Responderé a tu correo a la brevedad.</p>
              <button
                type="button"
                className="btn-reset"
                onClick={() => setStatus('idle')}
              >
                Enviar otro mensaje
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Tu nombre o empresa"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Asunto</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  placeholder="Ej: Consulta sobre proyecto Web / Infra"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Cuéntame sobre tu proyecto o idea..."
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              {status === 'error' && (
                <div className="form-error-banner">
                  <span>⚠️ {errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn-submit-form"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ContactSection;
