import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import './TopologyScene.css';

interface Pod {
  name: string;
  role: string;
  info: string;
  namespace?: string;
  projectTitle?: string;
}

interface NodeData {
  name: string;
  position: [number, number, number];
  pods: Pod[];
}

interface SelectedPod {
  name: string;
  role: string;
  info: string;
  node: string;
  namespace?: string;
  projectTitle?: string;
}

interface TopologyPreset {
  id: string;
  label: string;
  title: string;
  description: string;
  techPills: string[];
  namespace?: string;
  nodes: NodeData[];
}

const PRESETS: TopologyPreset[] = [
  {
    id: 'all',
    label: '⚡ Vista Global / Cluster',
    title: 'Arquitectura Global de Producción (11 Proyectos)',
    description:
      'Vista panorámica completa de toda la infraestructura en producción. Muestra los 11 proyectos distribuidos en los nodos principales de cómputo (prod-node-1 y prod-node-2) interconectados a través del Ingress Controller central.',
    techPills: ['11 Proyectos', 'Multi-node', 'Nginx Ingress', 'Docker', 'Kubernetes', 'Cloud VPS'],
    nodes: [
      {
        name: 'prod-node-1 (Cloud VPS)',
        position: [-4.6, 0, 0],
        pods: [
          {
            name: 'petcloud',
            role: 'Plataforma Web Adopción',
            info: 'React + Spring Boot + PostgreSQL + Cypress QA',
            namespace: 'deployment/petcloud-adopcion',
            projectTitle: 'PetCloud — Plataforma de Adopción',
          },
          {
            name: 'axum-keylogger',
            role: 'API Ciberseguridad',
            info: 'Rust Axum REST API + Event Processing Stream',
            namespace: 'security/axum-keylogger-api',
            projectTitle: 'API Ciberseguridad & Telemetría Rust',
          },
          {
            name: 'facturacion',
            role: 'Inventario & Facturación',
            info: 'Node.js + REST API + Control Comercial',
            namespace: 'deployment/facturacion-inventario',
            projectTitle: 'Sistema de Facturación e Inventario',
          },
          {
            name: 'contabilidad-api',
            role: 'API Contable & Clientes',
            info: 'Node.js + Express REST API Server',
            namespace: 'backend/api-contabilidad',
            projectTitle: 'API REST Contabilidad & Clientes',
          },
          {
            name: 'dermatology-ml',
            role: 'Clasificador IA',
            info: 'Python + Naive Bayes + UCI Dataset Processing',
            namespace: 'ml/dermatology-naive-bayes',
            projectTitle: 'Clasificador IA Dermatológico',
          },
          {
            name: 'image-parallel',
            role: 'Procesamiento Paralelo',
            info: 'Java Multithreading + Parallel Image Filter',
            namespace: 'compute/image-parallel-processing',
            projectTitle: 'Procesamiento Paralelo de Imágenes',
          },
        ],
      },
      {
        name: 'prod-node-2 (Cloud VPS)',
        position: [4.6, 0, 0],
        pods: [
          {
            name: 'causas-judiciales',
            role: 'Sistema de Causas',
            info: 'Docker Multi-nodo + Shell Orchestration',
            namespace: 'deployment/causas-judiciales-docker',
            projectTitle: 'Sistema de Causas Judiciales',
          },
          {
            name: 'tickets-middleware',
            role: 'Tickets Distribuidos',
            info: 'Distributed Middleware + 3 Apps en Docker',
            namespace: 'distributed/tickets-middleware',
            projectTitle: 'Simulador Tickets Distribuidos',
          },
          {
            name: 'combustible-gas',
            role: 'Abastecimiento Distribuido',
            info: 'JavaScript + Node.js Concurrente',
            namespace: 'distributed/combustible-gasolinera',
            projectTitle: 'Sistema Distribuido de Combustible',
          },
          {
            name: 'cisco-network',
            role: 'Infraestructura Redes',
            info: 'Packet Tracer + VLANs + Routing',
            namespace: 'network/cisco-packet-tracer',
            projectTitle: 'Diseño e Infraestructura Cisco',
          },
          {
            name: 'arch-hyprland',
            role: 'Entorno & Dotfiles',
            info: 'Arch Linux + Hyprland Wayland Compositor',
            namespace: 'dotfiles/arch-hyprland',
            projectTitle: 'Arch Linux Custom Environment',
          },
        ],
      },
    ],
  },
  {
    id: 'k8s-portfolio',
    label: '🚀 Portfolio K8s (/k8s)',
    title: 'Arquitectura Kubernetes — Portafolio (/k8s)',
    description:
      'Topología Kubernetes unificada para este Portafolio. Muestra los 3 pods contenedores principales (frontend React, backend Rust Axum y database PostgreSQL) conectados al Ingress Controller central.',
    techPills: ['Nginx Ingress', 'Frontend React', 'Backend Rust Axum', 'Database PostgreSQL 15'],
    nodes: [
      {
        name: 'k8s-cluster-node',
        position: [0, 0, 0],
        pods: [
          {
            name: 'frontend',
            role: 'React SPA Frontend (Puerto 80)',
            info: 'Deployment & Service portfolio-frontend:latest (frontend-deployment.yaml)',
            projectTitle: 'Portfolio React Frontend',
          },
          {
            name: 'backend',
            role: 'Rust Axum API (Puerto 8000)',
            info: 'Deployment & Service portfolio-backend:latest con K8s Secrets (backend-deployment.yaml)',
            projectTitle: 'Portfolio Rust Axum Backend API',
          },
          {
            name: 'database',
            role: 'PostgreSQL 15 DB (Puerto 5432)',
            info: 'PostgreSQL 15 Alpine con PersistentVolumeClaim postgres-data (database-deployment.yaml)',
            projectTitle: 'Portfolio PostgreSQL 15 Database',
          },
        ],
      },
    ],
  },
  {
    id: 'petcloud',
    label: '🐾 PetCloud App',
    title: 'Arquitectura Interna — PetCloud Adopción',
    description:
      'Topología microservicios dedicada: Tráfico entrante por Nginx Ingress balanceado hacia el frontend en React SPA, backend REST en Spring Boot, base de datos PostgreSQL con PersistentVolume y suite de QA Cypress.',
    techPills: ['React', 'Spring Boot', 'PostgreSQL', 'Cypress QA', 'PersistentVolume'],
    namespace: 'deployment/petcloud-adopcion',
    nodes: [
      {
        name: 'frontend-backend-tier',
        position: [-3.8, 0, 0],
        pods: [
          {
            name: 'react-frontend',
            role: 'Frontend UI',
            info: 'Single Page Application cliente en React',
            namespace: 'deployment/petcloud-adopcion',
            projectTitle: 'PetCloud — React Web',
          },
          {
            name: 'spring-boot-api',
            role: 'Backend Core',
            info: 'API REST principal desarrollada en Java Spring Boot',
            namespace: 'deployment/petcloud-adopcion',
            projectTitle: 'PetCloud — Spring Boot REST',
          },
        ],
      },
      {
        name: 'data-qa-tier',
        position: [3.8, 0, 0],
        pods: [
          {
            name: 'postgres-db',
            role: 'Database & Storage',
            info: 'Base de datos PostgreSQL con volumen persistente',
            namespace: 'deployment/petcloud-adopcion',
            projectTitle: 'PetCloud — PostgreSQL DB',
          },
          {
            name: 'cypress-runner',
            role: 'QA & E2E Testing',
            info: 'Contenedor de ejecución de pruebas Cypress',
            namespace: 'deployment/petcloud-adopcion',
            projectTitle: 'PetCloud — Cypress QA',
          },
        ],
      },
    ],
  },
  {
    id: 'axum',
    label: '🛡️ Axum Security API',
    title: 'Arquitectura Interna — API Ciberseguridad Rust',
    description:
      'Infraestructura de alta velocidad para ingestión síncrona/asíncrona y procesamiento concurrente de eventos de telemetría de seguridad en Rust Axum.',
    techPills: ['Rust', 'Axum Framework', 'Telemetry Stream', 'Cybersecurity', 'REST API'],
    namespace: 'security/axum-keylogger-api',
    nodes: [
      {
        name: 'ingestion-tier',
        position: [-3.8, 0, 0],
        pods: [
          {
            name: 'axum-rest-api',
            role: 'High-Speed Ingest',
            info: 'Servidor HTTP Axum en Rust para recepción de eventos',
            namespace: 'security/axum-keylogger-api',
            projectTitle: 'API Rust Axum Ingestion',
          },
          {
            name: 'event-stream',
            role: 'Stream Processor',
            info: 'Procesamiento concurrente de eventos de telemetría',
            namespace: 'security/axum-keylogger-api',
            projectTitle: 'Event Stream Processor',
          },
        ],
      },
      {
        name: 'analytics-storage-tier',
        position: [3.8, 0, 0],
        pods: [
          {
            name: 'security-logger',
            role: 'Security Audit',
            info: 'Módulo de auditoría y filtrado de logs en tiempo real',
            namespace: 'security/axum-keylogger-api',
            projectTitle: 'Security Audit Logger',
          },
          {
            name: 'storage-engine',
            role: 'Persistent Storage',
            info: 'Motor de almacenamiento optimizado para eventos',
            namespace: 'security/axum-keylogger-api',
            projectTitle: 'Security Event Store',
          },
        ],
      },
    ],
  },
  {
    id: 'causas',
    label: '⚖️ Causas Judiciales',
    title: 'Arquitectura Interna — Sistema Causas Judiciales',
    description:
      'Infraestructura distribuida multinodo orquestada mediante contenedores Docker y scripts Shell para procesamiento paralelo de causas legales.',
    techPills: ['Docker Multi-node', 'Shell Scripts', 'Distributed Processing', 'Orchestration'],
    namespace: 'deployment/causas-judiciales-docker',
    nodes: [
      {
        name: 'master-orchestrator-node',
        position: [-3.8, 0, 0],
        pods: [
          {
            name: 'docker-master',
            role: 'Orchestrator',
            info: 'Controlador principal y orquestador Shell',
            namespace: 'deployment/causas-judiciales-docker',
            projectTitle: 'Docker Master Orchestrator',
          },
          {
            name: 'task-dispatcher',
            role: 'Task Queue',
            info: 'Distribuidor de cargas de trabajo entre nodos',
            namespace: 'deployment/causas-judiciales-docker',
            projectTitle: 'Task Dispatcher',
          },
        ],
      },
      {
        name: 'worker-compute-node',
        position: [3.8, 0, 0],
        pods: [
          {
            name: 'worker-node-1',
            role: 'Compute Worker #1',
            info: 'Procesador distribuido de expedientes 1',
            namespace: 'deployment/causas-judiciales-docker',
            projectTitle: 'Worker Node 1',
          },
          {
            name: 'worker-node-2',
            role: 'Compute Worker #2',
            info: 'Procesador distribuido de expedientes 2',
            namespace: 'deployment/causas-judiciales-docker',
            projectTitle: 'Worker Node 2',
          },
        ],
      },
    ],
  },
  {
    id: 'tickets',
    label: '🎫 Tickets Distribuidos',
    title: 'Arquitectura Interna — Tickets Distribuidos',
    description:
      'Sistema distribuido compuesto por 3 aplicaciones independientes interconectadas mediante un middleware de comunicación customizado en Docker.',
    techPills: ['Middleware Custom', 'Docker Containers', 'Sistemas Distribuidos', 'Node.js'],
    namespace: 'distributed/tickets-middleware',
    nodes: [
      {
        name: 'middleware-bus-node',
        position: [-3.8, 0, 0],
        pods: [
          {
            name: 'custom-middleware',
            role: 'Communication Bus',
            info: 'Middleware propio de paso de mensajes y eventos',
            namespace: 'distributed/tickets-middleware',
            projectTitle: 'Custom Middleware Bus',
          },
          {
            name: 'sync-manager',
            role: 'State Sync',
            info: 'Gestor de consistencia de datos entre nodos',
            namespace: 'distributed/tickets-middleware',
            projectTitle: 'State Sync Manager',
          },
        ],
      },
      {
        name: 'apps-cluster-node',
        position: [3.8, 0, 0],
        pods: [
          {
            name: 'ticket-app-1',
            role: 'Sales Node #1',
            info: 'Instancia 1 de aplicación de venta de tickets',
            namespace: 'distributed/tickets-middleware',
            projectTitle: 'Ticket App Instance 1',
          },
          {
            name: 'ticket-app-2',
            role: 'Sales Node #2',
            info: 'Instancia 2 de aplicación de venta de tickets',
            namespace: 'distributed/tickets-middleware',
            projectTitle: 'Ticket App Instance 2',
          },
          {
            name: 'ticket-app-3',
            role: 'Sales Node #3',
            info: 'Instancia 3 de aplicación de venta de tickets',
            namespace: 'distributed/tickets-middleware',
            projectTitle: 'Ticket App Instance 3',
          },
        ],
      },
    ],
  },
];

const COLORS = {
  cluster: 0x64748b,
  node: 0x2563eb,
  nodeBorder: 0x60a5fa,
  pod: 0x10b981,
  podCore: 0x34d399,
  ingress: 0xf59e0b,
  ingressGlow: 0xfbbf24,
  trunkLine: 0x38bdf8,
  grid: 0x1e293b,
  gridAccent: 0x334155,
  particle: 0x38bdf8,
};

function makeLabelSprite(
  text: string,
  color = '#e2e8f0',
  bgColor = 'rgba(15, 23, 42, 0.85)',
  borderColor = 'rgba(56, 189, 248, 0.3)'
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  canvas.width = 512;
  canvas.height = 128;
  ctx.font = 'bold 34px "Inter", system-ui, -apple-system, sans-serif';

  const textWidth = ctx.measureText(text).width;
  const paddingX = 28;
  const pillWidth = Math.max(textWidth + paddingX * 2, 180);
  const pillHeight = 64;
  const x = (512 - pillWidth) / 2;
  const y = (128 - pillHeight) / 2;
  const radius = 18;

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, pillWidth, pillHeight, radius);
  } else {
    ctx.rect(x, y, pillWidth, pillHeight);
  }
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.8, 0.7, 1);
  return sprite;
}

const TopologyScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePresetId, setActivePresetId] = useState<string>('all');
  const [selected, setSelected] = useState<SelectedPod | null>(null);

  const activePreset = PRESETS.find((p) => p.id === activePresetId) || PRESETS[0];

  const handleScrollToProject = (namespace?: string) => {
    if (!namespace) return;
    const targetId = `project-${namespace.replace(/[^a-zA-Z0-9-]/g, '-')}`;
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    let width = mount.clientWidth || 600;
    let height = mount.clientHeight || 600;

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070a0f);
    scene.fog = new THREE.FogExp2(0x070a0f, 0.035);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(6, 12, 8);
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-6, 4, -6);
    scene.add(fillLight);
    const topGlow = new THREE.PointLight(0x10b981, 0.6, 25);
    topGlow.position.set(0, 6, 0);
    scene.add(topGlow);

    // --- Resize ---
    const handleResize = () => {
      if (!mount) return;
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // --- Grid floor ---
    const gridHelper = new THREE.GridHelper(30, 30, COLORS.gridAccent, COLORS.grid);
    gridHelper.position.y = -2.5;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.55;
    scene.add(gridHelper);

    // --- Floating particles ---
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 24;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: COLORS.particle,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Cluster box ---
    const cWidth = activePreset.id === 'all' ? 18.5 : 13.2;
    const clusterGeo = new THREE.BoxGeometry(cWidth, 6.2, 4.2);
    const clusterEdges = new THREE.EdgesGeometry(clusterGeo);
    const clusterLineMat = new THREE.LineBasicMaterial({
      color: COLORS.cluster,
      transparent: true,
      opacity: 0.35,
    });
    const clusterBox = new THREE.LineSegments(clusterEdges, clusterLineMat);
    clusterBox.position.set(0, 0.5, 0);
    scene.add(clusterBox);

    const clusterLabelText = activePreset.id === 'all' ? 'Cluster Kubernetes (11 Proyectos)' : `Namespace: ${activePreset.id}`;
    const clusterLabel = makeLabelSprite(clusterLabelText, '#94a3b8', 'rgba(15,23,42,0.85)', 'rgba(148,163,184,0.3)');
    clusterLabel.position.set(0, 3.9, 0);
    scene.add(clusterLabel);

    // --- Ingress Controller ---
    const ingressWidth = 2.8;
    const ingressHeight = 0.85;
    const ingressDepth = 0.85;
    const ingressGeo = new THREE.BoxGeometry(ingressWidth, ingressHeight, ingressDepth);
    const ingressMat = new THREE.MeshStandardMaterial({
      color: COLORS.ingress,
      emissive: COLORS.ingress,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.25,
    });
    const ingress = new THREE.Mesh(ingressGeo, ingressMat);
    ingress.position.set(0, 2.5, 0);
    scene.add(ingress);

    const ingressEdges = new THREE.EdgesGeometry(ingressGeo);
    const ingressEdgeMat = new THREE.LineBasicMaterial({ color: COLORS.ingressGlow, transparent: true, opacity: 0.8 });
    ingress.add(new THREE.LineSegments(ingressEdges, ingressEdgeMat));

    const ingressLabel = makeLabelSprite('ingress-nginx', '#fbbf24', 'rgba(30,27,75,0.9)', 'rgba(251,191,36,0.4)');
    ingressLabel.position.set(0, 3.3, 0);
    scene.add(ingressLabel);

    const ingressRingGeo = new THREE.TorusGeometry(0.75, 0.02, 12, 36);
    const ingressRingMat = new THREE.MeshBasicMaterial({ color: COLORS.ingressGlow, transparent: true, opacity: 0.4 });
    const ingressRing = new THREE.Mesh(ingressRingGeo, ingressRingMat);
    ingressRing.position.copy(ingress.position);
    ingressRing.rotation.x = Math.PI / 2;
    scene.add(ingressRing);

    const clickablePods: THREE.Mesh[] = [];
    const allPodCores: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];

    // --- Render Nodes & Pods for activePreset ---
    activePreset.nodes.forEach((node) => {
      const nodePos = new THREE.Vector3(...node.position);
      nodePositions.push(nodePos);

      const podCount = node.pods.length;
      const nW = Math.max(4.4, podCount * 1.25 + 0.6);
      const nH = 2.7;
      const nD = 2.7;
      const nodeGeo = new THREE.BoxGeometry(nW, nH, nD);

      const nodeEdges = new THREE.EdgesGeometry(nodeGeo);
      const nodeLineMat = new THREE.LineBasicMaterial({
        color: COLORS.nodeBorder,
        transparent: true,
        opacity: 0.6,
      });
      const nodeWireframe = new THREE.LineSegments(nodeEdges, nodeLineMat);
      nodeWireframe.position.copy(nodePos);
      scene.add(nodeWireframe);

      const nodeFillMat = new THREE.MeshStandardMaterial({
        color: COLORS.node,
        transparent: true,
        opacity: 0.12,
        roughness: 0.2,
        metalness: 0.5,
        side: THREE.DoubleSide,
      });
      const nodeFill = new THREE.Mesh(nodeGeo, nodeFillMat);
      nodeFill.position.copy(nodePos);
      scene.add(nodeFill);

      const platformGeo = new THREE.PlaneGeometry(nW + 0.4, nD + 0.4);
      const platformMat = new THREE.MeshBasicMaterial({
        color: COLORS.nodeBorder,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
      });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.set(nodePos.x, nodePos.y - nH / 2 - 0.02, nodePos.z);
      platform.rotation.x = Math.PI / 2;
      scene.add(platform);

      const nodeLabel = makeLabelSprite(node.name, '#60a5fa', 'rgba(15,23,42,0.9)', 'rgba(96,165,250,0.4)');
      nodeLabel.position.set(nodePos.x, nodePos.y + nH / 2 + 0.45, nodePos.z);
      scene.add(nodeLabel);

      // Pods inside node
      const spacing = 1.15;
      const startX = nodePos.x - ((podCount - 1) * spacing) / 2;

      node.pods.forEach((pod, i) => {
        const px = startX + i * spacing;
        const py = nodePos.y;
        const pz = nodePos.z;

        const podGlassGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
        const podGlassMat = new THREE.MeshStandardMaterial({
          color: COLORS.pod,
          transparent: true,
          opacity: 0.35,
          roughness: 0.2,
          metalness: 0.8,
        });
        const podGlassMesh = new THREE.Mesh(podGlassGeo, podGlassMat);
        podGlassMesh.position.set(px, py, pz);
        podGlassMesh.userData = {
          name: pod.name,
          role: pod.role,
          info: pod.info,
          node: node.name,
          namespace: pod.namespace,
          projectTitle: pod.projectTitle,
        };
        scene.add(podGlassMesh);
        clickablePods.push(podGlassMesh);

        const podEdges = new THREE.EdgesGeometry(podGlassGeo);
        const podEdgeMat = new THREE.LineBasicMaterial({ color: COLORS.podCore, transparent: true, opacity: 0.7 });
        podGlassMesh.add(new THREE.LineSegments(podEdges, podEdgeMat));

        const podCoreGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
        const podCoreMat = new THREE.MeshStandardMaterial({
          color: COLORS.podCore,
          emissive: COLORS.podCore,
          emissiveIntensity: 0.4,
          roughness: 0.1,
        });
        const podCoreMesh = new THREE.Mesh(podCoreGeo, podCoreMat);
        podGlassMesh.add(podCoreMesh);
        allPodCores.push(podCoreMesh);

        const podGlow = new THREE.PointLight(COLORS.podCore, 0.3, 2.5);
        podGlow.position.set(px, py, pz);
        scene.add(podGlow);

        const podLabel = makeLabelSprite(pod.name, '#6ee7b7', 'rgba(6,78,59,0.9)', 'rgba(52,211,153,0.4)');
        podLabel.position.set(px, py - 0.75, pz);
        podLabel.scale.set(1.4, 0.35, 1);
        scene.add(podLabel);
      });
    });

    // --- Trunk Lines Connecting Ingress to both nodes ---
    const trunkPulses: { mesh: THREE.Mesh; path: THREE.LineCurve3; progress: number; speed: number }[] = [];

    nodePositions.forEach((nodePos) => {
      const ingressConnectPoint = ingress.position.clone();
      const nodeTopConnectPoint = new THREE.Vector3(nodePos.x, nodePos.y + 1.35, nodePos.z);

      const curve = new THREE.LineCurve3(ingressConnectPoint, nodeTopConnectPoint);
      const points = curve.getPoints(20);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const trunkLineMat = new THREE.LineBasicMaterial({
        color: COLORS.trunkLine,
        transparent: true,
        opacity: 0.75,
      });
      const trunkLine = new THREE.Line(lineGeo, trunkLineMat);
      scene.add(trunkLine);

      const glowLineMat = new THREE.LineBasicMaterial({
        color: COLORS.ingressGlow,
        transparent: true,
        opacity: 0.3,
      });
      const glowLine = new THREE.Line(lineGeo, glowLineMat);
      scene.add(glowLine);

      for (let p = 0; p < 3; p++) {
        const pulseGeo = new THREE.SphereGeometry(0.1, 12, 12);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: COLORS.ingressGlow,
          transparent: true,
          opacity: 0.9,
        });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        scene.add(pulseMesh);
        trunkPulses.push({
          mesh: pulseMesh,
          path: curve,
          progress: p * 0.33,
          speed: 0.008 + Math.random() * 0.004,
        });
      }
    });

    // --- Camera orbit ---
    let radius = 12;
    let theta = 0.6;
    let phi = 1.1;
    const target = new THREE.Vector3(0, 0.6, 0);

    function updateCamera() {
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);
    }
    updateCamera();

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    function onPointerDown(e: PointerEvent) {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    }
    function onPointerUp() {
      isDragging = false;
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      theta -= dx * 0.006;
      phi -= dy * 0.006;
      phi = Math.max(0.3, Math.min(Math.PI - 0.3, phi));
      prevX = e.clientX;
      prevY = e.clientY;
      updateCamera();
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      radius += e.deltaY * 0.01;
      radius = Math.max(5, Math.min(24, radius));
      updateCamera();
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function onClick(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickablePods);
      if (hits.length > 0) {
        setSelected(hits[0].object.userData as SelectedPod);
      }
    }

    function onMouseMove(e: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickablePods);
      domElem.style.cursor = hits.length > 0 ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
    }

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    domElem.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('pointermove', onPointerMove);
    domElem.addEventListener('mousemove', onMouseMove);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('click', onClick);

    let t = 0;
    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);
      t += 0.008;

      allPodCores.forEach((core, i) => {
        core.rotation.y = t * 0.8 + i;
        core.rotation.x = Math.sin(t * 0.5 + i) * 0.2;
      });

      ingressRing.rotation.z = t * 0.6;
      const ringScale = 1 + Math.sin(t * 2.5) * 0.1;
      ingressRing.scale.set(ringScale, ringScale, ringScale);

      trunkPulses.forEach((pulse) => {
        pulse.progress = (pulse.progress + pulse.speed) % 1;
        const point = pulse.path.getPoint(pulse.progress);
        pulse.mesh.position.copy(point);
      });

      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += Math.sin(t + i) * 0.0012;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      domElem.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('pointermove', onPointerMove);
      domElem.removeEventListener('mousemove', onMouseMove);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('click', onClick);
      if (mount.contains(domElem)) {
        mount.removeChild(domElem);
      }
      renderer.dispose();
    };
  }, [activePresetId]);

  const targetNamespace = selected?.namespace || activePreset.namespace;

  return (
    <motion.section
      className="topology-section"
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="k8s-diagram-container">
        {/* Preset Selector Bar */}
        <div className="k8s-preset-selector">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              className={`k8s-preset-tab ${activePresetId === preset.id ? 'active' : ''}`}
              onClick={() => {
                setActivePresetId(preset.id);
                setSelected(null);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="k8s-layout">
          {/* LEFT: Square 3D viewport */}
          <div className="k8s-viewport-wrap">
            <div className="k8s-viewport-tag">
              <span className="k8s-tag-dot" />
              {activePresetId === 'all' ? 'CLUSTER · LIVE VIEW' : `TOPOLOGÍA INTERNA · ${activePreset.id.toUpperCase()}`}
            </div>
            <div ref={mountRef} className="k8s-viewport" />
            <div className="k8s-viewport-controls">
              <span>⟲ drag · orbitar cámara</span>
              <span>⊕ scroll · zoom</span>
            </div>
          </div>

          {/* RIGHT: Description + pod detail */}
          <div className="k8s-right-panel">
            <div className="k8s-description">
              <span className="k8s-eyebrow">Infraestructura</span>
              <h3 className="k8s-title">{activePreset.title}</h3>
              <p className="k8s-desc-text">{activePreset.description}</p>
              <div className="k8s-tech-pills">
                {activePreset.techPills.map((pill) => (
                  <span key={pill} className="k8s-pill">
                    {pill}
                  </span>
                ))}
              </div>
              <div className="k8s-stats-row">
                <div className="k8s-stat">
                  <span className="k8s-stat-value">{activePreset.nodes.length}</span>
                  <span className="k8s-stat-label">Nodos</span>
                </div>
                <div className="k8s-stat">
                  <span className="k8s-stat-value">
                    {activePreset.nodes.reduce((acc, n) => acc + n.pods.length, 0)}
                  </span>
                  <span className="k8s-stat-label">Componentes</span>
                </div>
                <div className="k8s-stat">
                  <span className="k8s-stat-value">1</span>
                  <span className="k8s-stat-label">Ingress</span>
                </div>
              </div>
            </div>

            <div className="k8s-detail-card">
              <div className="k8s-detail-header">
                <span className="k8s-detail-dot" data-active={selected ? 'true' : 'false'} />
                <span className="k8s-detail-title">
                  {selected ? 'Componente seleccionado' : 'Inspección de arquitectura'}
                </span>
              </div>
              {selected ? (
                <div className="k8s-details">
                  <div className="k8s-detail-item">
                    <span className="k8s-label">Componente / Pod</span>
                    <span className="k8s-value pod-name">{selected.name}</span>
                  </div>
                  {selected.projectTitle && (
                    <div className="k8s-detail-item">
                      <span className="k8s-label">Proyecto</span>
                      <span className="k8s-value">{selected.projectTitle}</span>
                    </div>
                  )}
                  <div className="k8s-detail-item">
                    <span className="k8s-label">Nodo / Entorno</span>
                    <span className="k8s-value">{selected.node}</span>
                  </div>
                  <div className="k8s-detail-item">
                    <span className="k8s-label">Rol / Función</span>
                    <span className="k8s-value infra-text">{selected.role}</span>
                  </div>
                  <div className="k8s-detail-item">
                    <span className="k8s-label">Detalles de Infraestructura</span>
                    <p className="k8s-info-text">{selected.info}</p>
                  </div>
                  {targetNamespace && (
                    <button
                      className="k8s-goto-btn"
                      onClick={() => handleScrollToProject(targetNamespace)}
                    >
                      ⬇ Ver Proyecto en el Portfolio
                    </button>
                  )}
                </div>
              ) : (
                <div className="k8s-details">
                  <p className="k8s-hint-text">
                    Haz click sobre cualquier pod o microservicio en el visor 3D para inspeccionar su rol y componentes de infraestructura.
                  </p>
                  {activePreset.namespace && (
                    <button
                      className="k8s-goto-btn"
                      onClick={() => handleScrollToProject(activePreset.namespace)}
                    >
                      ⬇ Ir a la Ficha del Proyecto ({activePreset.id})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default TopologyScene;
