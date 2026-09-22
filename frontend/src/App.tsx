import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import BackgroundGlow from './components/BackgroundGlow/BackgroundGlow';
import Header from './components/Header/Header';
import HeroBento from './components/HeroBento/HeroBento';
import TopologyScene from './components/TopologyScene/TopologyScene';
import ProjectSlider from './components/ProjectSlider/ProjectSlider';
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
  let browserName = 'Unknown Browser';
  let browserVersion = '0';
  let osName = 'Unknown OS';

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  if (userAgent.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = userAgent.split('Firefox/')[1]?.split(' ')[0] ?? '0';
  } else if (userAgent.includes('Edg/')) {
    browserName = 'Edge';
    browserVersion = userAgent.split('Edg/')[1]?.split(' ')[0] ?? '0';
  } else if (userAgent.includes('Chrome/')) {
    browserName = 'Chrome';
    browserVersion = userAgent.split('Chrome/')[1]?.split(' ')[0] ?? '0';
  } else if (userAgent.includes('Safari/')) {
    browserName = 'Safari';
    browserVersion = userAgent.split('Version/')[1]?.split(' ')[0] ?? '0';
  }

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );

  if (userAgent.includes('Win')) {
    osName = 'Windows';
  } else if (userAgent.includes('Mac')) {
    osName = 'macOS';
  } else if (userAgent.includes('Linux')) {
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
    category: 'Ciberseguridad & Rust',
    statusLabel: 'Controlled Env · EDR Agent',
    mediaPlaceholder: '[Rust Axum EDR Security Server]',
    title: 'Agente de Telemetría & Ciberseguridad Endpoint (Rust Axum)',
    description:
      'API REST de alta velocidad desarrollada en Rust Axum para la ingestión, análisis concurrente y monitoreo de eventos de seguridad y telemetría de endpoints en entornos de auditoría.',
    chips: ['Rust', 'Axum', 'Cybersecurity', 'EDR Telemetry', 'REST API', 'Networking'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Api-Axum-Keylogger' },
    ],
  },
  {
    namespace: 'deployment/petcloud-adopcion',
    category: 'Full-Stack & Apps',
    statusLabel: 'Active · Production Flagship',
    mediaPlaceholder: '[PetCloud Dashboard & QA]',
    image: '/logos/petscloud/login.png',
    title: 'PetCloud — Plataforma Web de Adopción de Mascotas & QA',
    description:
      'Plataforma web completa para la gestión y adopción de mascotas. Lideré el aseguramiento de calidad (QA) diseñando y ejecutando suites de pruebas E2E con Cypress, validando endpoints REST y dashboard.',
    chips: ['React', 'Spring Boot', 'PostgreSQL', 'Cypress', 'QA & E2E', 'Docker'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Constr-Proy_fork' },
    ],
  },
  {
    namespace: 'deployment/causas-judiciales-docker',
    category: 'DevOps & Cloud',
    statusLabel: 'Multi-Container · 20+ Services',
    mediaPlaceholder: '[Judicial System Docker Infra]',
    title: 'Sistema de Procesamiento de Causas Judiciales (20+ Contenedores)',
    description:
      'Infraestructura empresarial distribuida sobre contenedores Docker Compose con más de 20 servicios interconectados: Master/Slave DB replication, API Gateways, tareas programadas Cron y módulos IA.',
    chips: ['Docker Compose', 'Master/Slave DB', 'API Gateway', 'Orquestación', 'Microservicios'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Licitacion_SistemaCausasJudiciales_fork' },
    ],
  },
  {
    namespace: 'event-driven/kafka-prometheus-observability',
    category: 'DevOps & Cloud',
    statusLabel: 'Architecture Spec · Roadmap',
    mediaPlaceholder: '[Kafka & Grafana Observability Architecture]',
    title: 'Sistema Event-Driven con Apache Kafka, Prometheus & Grafana',
    description:
      'Proyecto estratégico de microservicios desacoplados para procesamiento de eventos en tiempo real mediante Apache Kafka / RabbitMQ, ingestión de métricas Prometheus y tableros de observabilidad en Grafana.',
    chips: ['Kafka', 'Event-Driven', 'Prometheus', 'Grafana', 'Observabilidad', 'Microservicios'],
    links: [
      { label: 'Ver Especificación en GitHub', href: 'https://github.com/Demiannnnnn' },
    ],
  },
  {
    namespace: 'distributed/tickets-middleware',
    category: 'Sistemas Distribuidos',
    statusLabel: 'Running · Polyglot Middleware',
    mediaPlaceholder: '[Distributed Middleware]',
    title: 'Simulador de Venta de Tickets & Middleware Políglota',
    description:
      'Sistema distribuido compuesto por 3 aplicaciones independientes conectadas mediante un bus de comunicación customizado (middleware en Flask, Go y Node.js) orquestado completamente en Docker.',
    chips: ['Sistemas Distribuidos', 'Go', 'Flask', 'Node.js', 'Docker', 'Middleware'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Proy3_SD_fork' },
    ],
  },
  {
    namespace: 'deployment/facturacion-inventario',
    category: 'Full-Stack & Apps',
    statusLabel: 'Active · Business System',
    mediaPlaceholder: '[Billing & Stock System]',
    title: 'Sistema de Facturación Digital e Inventarios',
    description:
      'Software de gestión comercial diseñado para empresas de escala mediana. Proporciona control de inventarios automatizado y emisión de facturación digital en tiempo real mediante API REST propia.',
    chips: ['Node.js', 'JavaScript', 'REST API', 'Facturación Digital', 'Gestión Comercial'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Sistema-facturaje-inventario' },
      { label: 'Ver Server API', href: 'https://github.com/Demiannnnnn/Server-Sistema-Contabiliadad-Clientes' },
    ],
  },
  {
    namespace: 'network/cisco-packet-tracer',
    category: 'Redes & Low-Level',
    statusLabel: 'Configured · Packet Tracer',
    mediaPlaceholder: '[Cisco Network Infrastructure]',
    title: 'Diseño e Infraestructura de Redes Empresariales Cisco',
    description:
      'Proyecto completo de diseño de red de comunicaciones en Cisco Packet Tracer. Incluye enrutamiento dinámico (OSPF, RIP), enrutamiento estático, segmentación VLAN, telefonía IP (VoIP) y servidores HTTPS.',
    chips: ['Cisco Packet Tracer', 'OSPF', 'VLANs', 'VoIP', 'Routing & Switching', 'Subnetting'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Proyecto_Redes_2' },
    ],
  },
  {
    namespace: 'compute/image-parallel-processing',
    category: 'Redes & Low-Level',
    statusLabel: 'Benchmarked · High Performance',
    mediaPlaceholder: '[Parallel Image Filter Output]',
    title: 'Procesamiento Concurrente y Filtros Paralelos de Imágenes (C / Java)',
    description:
      'Algoritmos de procesamiento de imágenes digitales y reducción de ruido desarrollados en C y Java mediante hilos de ejecución paralela (POSIX Threads), midiendo aceleración Speedup y uso de CPU.',
    chips: ['C', 'Java', 'Parallel Computing', 'POSIX Threads', 'Multithreading', 'HPC'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/ProyectoSistemasDistribuidos_fork' },
      { label: 'Ver Repositorio Hilos C', href: 'https://github.com/Demiannnnnn/ProyectoHilos_fork' },
    ],
  },
  {
    namespace: 'os/process-scheduling-simulator',
    category: 'Redes & Low-Level',
    statusLabel: 'CS Fundamentals · Simulator',
    mediaPlaceholder: '[OS Scheduler Simulator]',
    title: 'Simulador de Planificación de Procesos de SO (Round Robin / FIFO)',
    description:
      'Aplicación interactiva desarrollada en JavaFX que simula la gestión de procesos del sistema operativo evaluando algoritmos Round Robin, FIFO, SJF y prioridades de ejecución de CPU.',
    chips: ['Java', 'JavaFX', 'Sistemas Operativos', 'Round Robin', 'CPU Scheduling'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/ProyectoSOU3_fork' },
    ],
  },
  {
    namespace: 'java/gof-design-patterns-trex',
    category: 'Full-Stack & Apps',
    statusLabel: 'Architecture · GoF Patterns',
    mediaPlaceholder: '[GoF Design Patterns T-Rex]',
    title: 'Implementación de Patrones de Diseño GoF en Java (T-Rex Game)',
    description:
      'Proyecto desarrollado en Java enfocado en la aplicación rigurosa de Patrones de Diseño GoF (State, Observer, Factory, Strategy, Singleton) para la arquitectura de lógica de videojuegos y animaciones.',
    chips: ['Java', 'Design Patterns', 'GoF', 'State Pattern', 'Clean Code'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/Trex_Project' },
      { label: 'Ver Juego JavaFX', href: 'https://github.com/Demiannnnnn/ProyectoU3_fork' },
    ],
  },
  {
    namespace: 'ml/dermatology-naive-bayes',
    category: 'Full-Stack & Apps',
    statusLabel: 'Trained Model · UCI Dataset',
    mediaPlaceholder: '[Machine Learning Plot]',
    title: 'Clasificador IA de Enfermedades Dermatológicas (Python)',
    description:
      'Modelo de Machine Learning para la clasificación automatizada de 6 tipos de patologías dermatológicas aplicando el algoritmo Naive Bayes sobre el dataset UCI Dermatology (366 instancias, 34 características).',
    chips: ['Python', 'Machine Learning', 'Naive Bayes', 'Data Science', 'UCI Dataset'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/IA-Dermatology' },
    ],
  },
  {
    namespace: 'distributed/combustible-gasolinera',
    category: 'Sistemas Distribuidos',
    statusLabel: 'Fault Tolerant · WebSockets',
    mediaPlaceholder: '[Gas Station Monitor]',
    title: 'Sistema Distribuido Resiliente de Abastecimiento de Combustible',
    description:
      'Aplicación distribuida para estaciones de servicio desarrollada en Node.js y WebSockets. Gestiona concurrentemente el stock de gasolina con mecanismos de tolerancia a fallos y auto-despliegue.',
    chips: ['Node.js', 'WebSockets', 'Sistemas Distribuidos', 'Concurrencia', 'Resiliencia'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/sistema-combustible-distribuido' },
    ],
  },
  {
    namespace: 'dotfiles/arch-hyprland',
    category: 'Redes & Low-Level',
    statusLabel: 'Daily Driver · Config',
    mediaPlaceholder: '[Arch Linux Hyprland Setup]',
    title: 'Arch Linux & Hyprland Custom Environment (Dotfiles)',
    description:
      'Scripts de automatización y dotfiles para el entorno de trabajo personal en Arch Linux con compositor Wayland Hyprland, barra de estado Waybar y atajos personalizados.',
    chips: ['Arch Linux', 'Hyprland', 'Wayland', 'Bash', 'Dotfiles'],
    links: [
      { label: 'Ver Repositorio', href: 'https://github.com/Demiannnnnn/config-arch' },
    ],
  },
];

const CATEGORIES = [
  'Todos',
  'DevOps & Cloud',
  'Sistemas Distribuidos',
  'Ciberseguridad & Rust',
  'Redes & Low-Level',
  'Full-Stack & Apps',
] as const;

const appleEase = [0.25, 0.46, 0.45, 0.94] as const;

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredProjects =
    selectedCategory === 'Todos'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  // Block zoom (Ctrl+wheel & pinch)
  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    const preventGestureZoom = (e: Event) => {
      e.preventDefault();
    };
    const preventKeyZoom = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', preventZoom, { passive: false });
    document.addEventListener('gesturestart', preventGestureZoom);
    document.addEventListener('gesturechange', preventGestureZoom);
    document.addEventListener('gestureend', preventGestureZoom);
    document.addEventListener('keydown', preventKeyZoom);

    return () => {
      document.removeEventListener('wheel', preventZoom);
      document.removeEventListener('gesturestart', preventGestureZoom);
      document.removeEventListener('gesturechange', preventGestureZoom);
      document.removeEventListener('gestureend', preventGestureZoom);
      document.removeEventListener('keydown', preventKeyZoom);
    };
  }, []);

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
      <Header scrollContainerRef={scrollContainerRef} />

      <div className="scroll-snap-container" ref={scrollContainerRef}>
        {/* SECCIÓN 1: INICIAL & HABILIDADES */}
        <section className="snap-section" id="inicial">
          <div className="snap-section-inner">
            <HeroBento />
          </div>
        </section>

        {/* SECCIÓN 2: EL GRÁFICO (TOPOLOGÍA 3D & STACK) */}
        <section className="snap-section" id="grafico">
          <div className="snap-section-inner snap-section-padded">
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
          </div>
        </section>

        {/* SECCIÓN 3: MIS PROYECTOS */}
        <section className="snap-section" id="proyectos">
          <div className="snap-section-inner snap-section-padded">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <motion.div
                className="eyebrow"
                initial={{ opacity: 0, x: -30, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, ease: appleEase }}
              >
                DESPLIEGUES & PROYECTOS ({filteredProjects.length})
              </motion.div>

              {/* Categoría Selector Bar */}
              <div className="project-category-bar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <ProjectSlider projects={filteredProjects} />
          </div>
        </section>

        {/* SECCIÓN 4: EL CONTACTO & FOOTER */}
        <section className="snap-section" id="contacto">
          <div className="snap-section-inner">
            <ContactSection />
            <Footer />
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
