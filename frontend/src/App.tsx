import { useEffect } from 'react';
import { motion } from 'framer-motion';
import BackgroundGlow from './components/BackgroundGlow/BackgroundGlow';
import Header from './components/Header/Header';
import HeroBento from './components/HeroBento/HeroBento';
import TopologyScene from './components/TopologyScene/TopologyScene';
import StackTable from './components/StackTable/StackTable';
import ProjectCard from './components/ProjectCard/ProjectCard';
import ContactSection from './components/ContactSection/ContactSection';
import Footer from './components/Footer/Footer';
import {
  registerVisitor,
  getCurrentVisitor,
  type VisitorPayload,
} from './services/api';
import type { Project } from './types/portfolio';

const SESSION_STORAGE_KEY = 'portfolio.visitor.session_token';

function detectVisitorMetadata(): VisitorPayload {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform || undefined;
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent);

  const browserMatch = userAgent.match(
    /(Firefox|Chrome|Edg|OPR|Safari)\/([\d.]+)/,
  );
  const browserName = browserMatch?.[1] ?? 'Unknown';
  const browserVersion = browserMatch?.[2];

  let osName: string | undefined;
  if (/Windows/i.test(userAgent)) {
    osName = 'Windows';
  } else if (/Macintosh|Mac OS/i.test(userAgent)) {
    osName = 'macOS';
  } else if (/Android/i.test(userAgent)) {
    osName = 'Android';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    osName = 'iOS';
  } else if (/Linux/i.test(userAgent)) {
    osName = 'Linux';
  }

  return {
    browser_name: browserName,
    browser_version: browserVersion,
    os_name: osName ?? platform,
    device_type: isMobile ? 'mobile' : 'desktop',
  };
}

const projects: Project[] = [
  {
    namespace: 'security/axum-keylogger-api',
    statusLabel: 'Controlled Env · Security',
    mediaPlaceholder: '[Rust Axum Security Server]',
    title: 'API de Ciberseguridad & Telemetría en Rust',
    description:
      'API REST desarrollada en Rust utilizando el framework Axum. Diseñada para la recepción, análisis y procesamiento concurrente de eventos de telemetría y monitoreo de seguridad en entornos controlados.',
    chips: ['Rust', 'Axum', 'Cybersecurity', 'REST API', 'Networking'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Api-Axum-Keylogger' },
    ],
  },
  {
    namespace: 'deployment/petcloud-adopcion',
    statusLabel: 'Active · Production',
    mediaPlaceholder: '[PetCloud Dashboard & QA]',
    title: 'PetCloud — Plataforma de Adopción de Mascotas',
    description:
      'Plataforma web completa para la gestión y adopción de mascotas. Lideré el aseguramiento de calidad (QA) diseñando y ejecutando suites de pruebas E2E con Cypress, validando endpoints y fiabilidad del dashboard.',
    chips: ['React', 'JavaScript', 'Spring Boot', 'Cypress', 'QA & E2E'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Constr-Proy_fork' },
    ],
  },
  {
    namespace: 'deployment/causas-judiciales-docker',
    statusLabel: 'Multi-Container · Docker',
    mediaPlaceholder: '[Judicial System Docker Infra]',
    title: 'Sistema de Procesamiento de Causas Judiciales',
    description:
      'Sistema para la gestión y procesamiento de causas judiciales desplegado sobre una infraestructura avanzada multinodo mediante contenedores Docker y scripts de orquestación.',
    chips: ['Docker', 'Shell', 'Sistemas Distribuidos', 'Infraestructura'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Licitacion_SistemaCausasJudiciales_fork' },
    ],
  },
  {
    namespace: 'ml/dermatology-naive-bayes',
    statusLabel: 'Trained Model · UCI Dataset',
    mediaPlaceholder: '[Machine Learning Plot]',
    title: 'Clasificador IA de Enfermedades Dermatológicas',
    description:
      'Proyecto de Machine Learning para la clasificación automatizada de 6 tipos de patologías dermatológicas usando el algoritmo Naive Bayes. Entrenado sobre el dataset UCI Dermatology (366 instancias, 34 características clínicas).',
    chips: ['Python', 'Machine Learning', 'Naive Bayes', 'Data Science'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/IA-Dermatology' },
    ],
  },
  {
    namespace: 'deployment/facturacion-inventario',
    statusLabel: 'Active · Business System',
    mediaPlaceholder: '[Billing & Stock System]',
    title: 'Sistema de Facturación e Inventario Digital',
    description:
      'Software de gestión comercial diseñado para empresas de escala mediana. Proporciona control de inventarios automatizado y emisión de facturación digital en tiempo real.',
    chips: ['JavaScript', 'Node.js', 'REST API', 'Gestión Comercial'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Sistema-facturaje-inventario' },
    ],
  },
  {
    namespace: 'distributed/tickets-middleware',
    statusLabel: 'Running · Middleware',
    mediaPlaceholder: '[Distributed Middleware]',
    title: 'Simulador de Venta de Tickets Distribuidos',
    description:
      'Sistema distribuido compuesto por 3 aplicaciones independientes conectadas a través de un middleware de comunicación customizado, orquestado completamente en Docker.',
    chips: ['Sistemas Distribuidos', 'Docker', 'Middleware', 'JavaScript'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Proy3_SD_fork' },
    ],
  },
  {
    namespace: 'backend/api-contabilidad',
    statusLabel: 'REST Service · Active',
    mediaPlaceholder: '[Accounting API Server]',
    title: 'API REST de Contabilidad & Clientes',
    description:
      'Servidor backend propio para la gestión contable, administración de registros de clientes y control de operaciones financieras.',
    chips: ['JavaScript', 'Node.js', 'Express', 'REST API'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Server-Sistema-Contabiliadad-Clientes' },
    ],
  },
  {
    namespace: 'distributed/combustible-gasolinera',
    statusLabel: 'Distributed System · Concurrency',
    mediaPlaceholder: '[Gas Station Monitor]',
    title: 'Sistema Distribuido de Abastecimiento de Combustible',
    description:
      'Aplicación distribuida para estaciones de servicio que gestiona concurrentemente la distribución de gasolina, precios y control de stock entre nodos interconectados.',
    chips: ['JavaScript', 'Sistemas Distribuidos', 'Concurrencia', 'Node.js'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/sistema-combustible-distribuido' },
    ],
  },
  {
    namespace: 'compute/image-parallel-processing',
    statusLabel: 'Benchmarked · Java Multithreading',
    mediaPlaceholder: '[Parallel Image Filter Output]',
    title: 'Procesamiento y Filtrado Paralelo de Imágenes',
    description:
      'Algoritmo desarrollado en Java para la reducción de ruido en imágenes digitales mediante programación en paralelo y secuencial, comparando aceleración y uso de CPU entre hilos.',
    chips: ['Java', 'Parallel Programming', 'Multithreading', 'Algoritmos'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/ProyectoSistemasDistribuidos_fork' },
    ],
  },
  {
    namespace: 'network/cisco-packet-tracer',
    statusLabel: 'Configured · Packet Tracer',
    mediaPlaceholder: '[Cisco Network Infrastructure]',
    title: 'Diseño e Infraestructura de Redes Cisco',
    description:
      'Proyecto completo de diseño de red de comunicaciones en Cisco Packet Tracer. Incluye enrutamiento dinámico, segmentación VLAN y políticas de seguridad.',
    chips: ['Packet Tracer', 'Networking', 'VLANs', 'Routing & Switching'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Proyecto_Redes_2' },
    ],
  },
  {
    namespace: 'dotfiles/arch-hyprland',
    statusLabel: 'Daily Driver · Config',
    mediaPlaceholder: '[Arch Linux Hyprland Setup]',
    title: 'Arch Linux & Hyprland Custom Environment',
    description:
      'Dotfiles y scripts de configuración para entorno de escritorio en Arch Linux utilizando el compositor Wayland Hyprland, barra de estado y atajos personalizados.',
    chips: ['Arch Linux', 'Hyprland', 'Wayland', 'Bash', 'Dotfiles'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/config-arch' },
    ],
  },
];

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

function App() {
  // Background visitor tracking (silent)
  useEffect(() => {
    let cancelled = false;

    const bootstrapVisitor = async () => {
      try {
        const storedToken = window.localStorage.getItem(SESSION_STORAGE_KEY);

        if (storedToken) {
          try {
            await getCurrentVisitor(storedToken);
            if (!cancelled) return;
          } catch {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }

        const registered = await registerVisitor(detectVisitorMetadata());

        if (!cancelled) {
          window.localStorage.setItem(
            SESSION_STORAGE_KEY,
            registered.session_token,
          );
        }
      } catch {
        // Visitor tracking is non-critical
      }
    };

    void bootstrapVisitor();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <BackgroundGlow />
      <Header />

      {/* SECCIÓN 1: INICIAL & HABILIDADES */}
      <div id="inicial">
        <HeroBento />
      </div>

      {/* SECCIÓN 2: EL GRÁFICO (TOPOLOGÍA 3D & STACK) */}
      <section id="grafico" className="section-spacing">
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, x: -30, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          INFRAESTRUCTURA KUBERNETES & ENTORNO 3D
        </motion.div>
        <TopologyScene />

        <motion.div
          className="eyebrow"
          style={{ marginTop: 60 }}
          initial={{ opacity: 0, x: -30, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          STACK & CONFIGURACIÓN DE SISTEMA
        </motion.div>
        <StackTable />
      </section>

      {/* SECCIÓN 3: MIS PROYECTOS */}
      <section id="proyectos" className="section-spacing">
        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, x: -30, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          DESPLIEGUES & PROYECTOS ({projects.length})
        </motion.div>

        {projects.map((project) => (
          <ProjectCard key={project.namespace} project={project} />
        ))}
      </section>

      {/* SECCIÓN 4: EL CONTACTO & FOOTER */}
      <div id="contacto">
        <ContactSection />
        <Footer />
      </div>
    </>
  );
}

export default App;
