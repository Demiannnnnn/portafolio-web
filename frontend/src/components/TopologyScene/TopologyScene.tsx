import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import './TopologyScene.css';

const TopologyScene = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(48, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1, 10.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Resize handling
    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Colors
    const inkAccent = 0x9BB4A2;
    const accentColor = 0x3F6B52;
    const lineColor = 0x3A4A40;

    const group = new THREE.Group();
    scene.add(group);

    // 1. Center sphere
    const centerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xF2F0E8, wireframe: true, transparent: true, opacity: 0.3 })
    );
    group.add(centerSphere);

    // 2. Ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.01, 8, 96),
      new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);

    // 3. Nodes
    const nodeNames = ['p1','p2','p3','p4','p5','p6'];
    const nodes: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];

    nodeNames.forEach((_, i) => {
      const angle = (i / nodeNames.length) * Math.PI * 2;
      const radius = 3.2 + (i % 2 === 0 ? 0.4 : -0.3);
      const y = Math.sin(i * 1.7) * 1.0;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const node = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.26, 0),
        new THREE.MeshBasicMaterial({ 
          color: i % 3 === 0 ? accentColor : inkAccent,
          wireframe: true
        })
      );
      node.position.set(x, y, z);
      nodes.push(node);
      group.add(node);
      nodePositions.push(new THREE.Vector3(x, y, z));
    });

    // 4. Lines from center
    const centerPoint = new THREE.Vector3(0, 0, 0);
    const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.6 });

    nodePositions.forEach(pos => {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([centerPoint, pos]);
      const line = new THREE.Line(lineGeometry, lineMaterial);
      group.add(line);
    });

    // 5. Cross connections
    const crossLineMaterial = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.25 });
    nodePositions.forEach((pos, i) => {
      const nextPos = nodePositions[(i + 2) % nodePositions.length];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([pos, nextPos]);
      const line = new THREE.Line(lineGeometry, crossLineMaterial);
      group.add(line);
    });

    // Drag interaction
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0.4;
    let targetRotX = 0.08;
    let currentRotY = 0.4;
    let currentRotX = 0.08;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        targetRotY += (e.clientX - prevX) * 0.005;
        targetRotX += (e.clientY - prevY) * 0.003;
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX)); // clamp
        prevX = e.clientX;
        prevY = e.clientY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Animation loop
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      t += 0.01;
      
      if (!reduceMotion) {
        currentRotY += (targetRotY + t * 0.05 - currentRotY) * 0.05;
        currentRotX += (targetRotX - currentRotX) * 0.05;
        group.rotation.y = currentRotY;
        group.rotation.x = currentRotX;
        
        ring.rotation.z += 0.004;
        
        nodes.forEach(n => {
          n.rotation.x += 0.01;
          n.rotation.y += 0.008;
        });
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <motion.section
      className="topology-section"
      initial={{ opacity: 0, y: 80, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="topo-frame">
        <div className="topo-tag">topología · entornos locales & vm</div>
        <canvas ref={canvasRef} className="topo-canvas" />
        <div className="topo-hint">arrastra para orbitar</div>
      </div>
    </motion.section>
  );
};

export default TopologyScene;
