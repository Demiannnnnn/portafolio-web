import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import type { Project } from '../../types/portfolio';
import './ProjectCarousel3D.css';

interface Props { projects: Project[]; }

// ─── Geometry ─────────────────────────────────────────────────────────────────
const RADIUS        = 8.0;    // Larger circle — cards spread wide across viewport
const VERT_STEP     = 0.30;   // spiral Y offset per card
const VISIBLE_ARC   = Math.PI * 0.55; // ±99° — ~4 cards visible on each side
const WHEEL_SPD     = 0.0012;
const DRAG_SPD      = 0.003;
const LERP          = 0.058;

// ─── Component ────────────────────────────────────────────────────────────────
const ProjectCarousel3D = ({ projects }: Props) => {
  const mountRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dotsRef    = useRef<HTMLDivElement>(null);
  const state      = useRef({ cur: Math.PI / 2, tgt: Math.PI / 2, dragging: false, dragX: 0, dragStart: 0, activeIdx: -1 });
  const cleanupRef = useRef<() => void>(() => {});

  const init = useCallback(() => {
    cleanupRef.current();
    const mount = mountRef.current, overlay = overlayRef.current, dotsEl = dotsRef.current;
    if (!mount || !overlay || !dotsEl) return;
    const N = projects.length;
    if (N === 0) return;

    // ── Three.js renderer ────────────────────────────────────────────────────
    let W = mount.clientWidth || 800, H = mount.clientHeight || 520;

    const scene    = new THREE.Scene();
    scene.background = null;

    // Camera is fixed, looking at origin. "Front" of spiral = angle at sin=1 → π/2.
    // Wider FOV to cover the full-viewport spread.
    const camera   = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Invisible ghost planes — only used for 3D→2D projection math
    const geo    = new THREE.PlaneGeometry(3.4, 2.2);
    const mat    = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
    const planes = projects.map(() => { const m = new THREE.Mesh(geo, mat); scene.add(m); return m; });

    // ── HTML Overlay ─────────────────────────────────────────────────────────
    overlay.innerHTML = '';
    const cardEls = projects.map((proj, i) => {
      const d = document.createElement('div');
      d.className = 'c3d-card';
      d.dataset.index = String(i);

      // Full card markup — JS controls which parts are visible via CSS classes
      d.innerHTML = `
        <div class="c3d-topbar">
          <span class="c3d-ns">${proj.namespace}</span>
          <span class="c3d-status"><span class="c3d-dot status-dot live"></span>${proj.statusLabel}</span>
        </div>
        <div class="c3d-body">
          <div class="c3d-media">
            ${proj.image
              ? `<img src="${proj.image}" alt="${proj.title}" class="c3d-img" loading="lazy" draggable="false"/>`
              : `<div class="c3d-placeholder"><span>${proj.mediaPlaceholder}</span></div>`}
          </div>
          <div class="c3d-text">
            <h3 class="c3d-title">${proj.title}</h3>
            <p class="c3d-desc">${proj.description}</p>
            <div class="c3d-chips">${proj.chips.map(c => `<span class="c3d-chip">${c}</span>`).join('')}</div>
            <div class="c3d-links">${proj.links.map(l => `
              <a href="${l.href}" target="_blank" rel="noopener noreferrer" class="c3d-link" tabindex="-1">
                ${l.label}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="c3d-arrow"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>`).join('')}
            </div>
          </div>
        </div>`;
      overlay.appendChild(d);
      return d;
    });

    // Click on non-active card → snap to it
    const snapToIdx = (i: number) => {
      const step    = (Math.PI * 2) / N;
      const desired = Math.PI / 2 - i * step;
      const raw     = state.current.tgt;
      let diff      = ((desired - raw) % (Math.PI * 2));
      if (diff >  Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      state.current.tgt = raw + diff;
    };

    cardEls.forEach((el, i) => {
      el.addEventListener('click', () => {
        if (state.current.activeIdx === i) return;
        snapToIdx(i);
      });
    });

    // ── Dots ─────────────────────────────────────────────────────────────────
    dotsEl.innerHTML = '';
    const dots = projects.map((proj, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'c3d-dot-btn';
      btn.setAttribute('aria-label', proj.title);
      btn.addEventListener('click', () => snapToIdx(i));
      dotsEl.appendChild(btn);
      return btn;
    });

    // ── Per-frame update ──────────────────────────────────────────────────────
    const vec3      = new THREE.Vector3();
    const counterEl = mount.querySelector<HTMLElement>('.c3d-counter-inner');

    const tick = (progress: number) => {
      let bestSin = -Infinity, bestIdx = 0;

      planes.forEach((plane, i) => {
        // ── Spiral geometry ─────────────────────────────────────────────────
        // Matches the spec: angle = (i/N)*2π + progress
        const worldAngle = (i / N) * Math.PI * 2 + progress;
        const x = RADIUS * Math.cos(worldAngle);
        const z = RADIUS * Math.sin(worldAngle);
        const y = (i - (N - 1) / 2) * VERT_STEP;

        plane.position.set(x, y, z);
        // Face the camera: when worldAngle=π/2, card is at (0,y,+R).
        // rotation.y = -(worldAngle - π/2) makes the plane's +Z normal point toward camera
        plane.rotation.y = -(worldAngle - Math.PI / 2);

        if (z > bestSin) { bestSin = z; bestIdx = i; }
      });

      // ── Update active indicator ────────────────────────────────────────────
      if (bestIdx !== state.current.activeIdx) {
        state.current.activeIdx = bestIdx;
        if (counterEl) {
          counterEl.textContent =
            `${String(bestIdx + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`;
        }
        dots.forEach((btn, i) => btn.classList.toggle('c3d-dot-btn--active', i === bestIdx));
      }

      // ── Position HTML cards ────────────────────────────────────────────────
      planes.forEach((plane, i) => {
        const el = cardEls[i];

        // angleFromFront: 0 = directly in front of camera, π = directly behind
        // Using atan2(x, z) where x=cos(wA), z=sin(wA) of the card's world position
        const angleFromFront = Math.atan2(plane.position.x, plane.position.z);
        const absAngle       = Math.abs(angleFromFront);

        // ── Cull back-hemisphere cards ──────────────────────────────────────
        if (absAngle > VISIBLE_ARC) {
          el.style.display = 'none';
          return;
        }
        el.style.display = '';

        // Project world position → NDC → screen pixels
        vec3.setFromMatrixPosition(plane.matrixWorld);
        vec3.project(camera);
        const sx = ( vec3.x * 0.5 + 0.5) * W;
        const sy = (-vec3.y * 0.5 + 0.5) * H;

        // Depth factor: 1.0 = front, 0.0 = VISIBLE_ARC edge
        const depth    = 1 - absAngle / VISIBLE_ARC;
        const isActive = i === bestIdx;

        const opacity = isActive ? 1 : THREE.MathUtils.clamp(0.25 + depth * 0.5, 0.25, 0.75);
        const scale   = isActive ? 1 : THREE.MathUtils.clamp(0.72 + depth * 0.2, 0.72, 0.92);
        const blur    = isActive ? 0 : (depth < 0.4 ? 1.5 : 0);

        el.style.transform     = `translate(-50%,-50%) translate(${sx}px,${sy}px) scale(${scale})`;
        el.style.opacity       = String(opacity);
        el.style.filter        = blur > 0 ? `blur(${blur}px)` : 'none';
        el.style.zIndex        = String(isActive ? 20 : Math.round(depth * 15));
        el.style.pointerEvents = isActive ? 'auto' : (depth > 0.55 ? 'auto' : 'none');
        el.classList.toggle('c3d-card--active', isActive);

        // Active card: enable links; side cards: disable to avoid misclicks
        el.querySelectorAll<HTMLAnchorElement>('.c3d-link').forEach(a => {
          a.tabIndex = isActive ? 0 : -1;
        });
      });
    };

    // ── RAF loop ──────────────────────────────────────────────────────────────
    let rafId = 0;
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      state.current.cur += (state.current.tgt - state.current.cur) * LERP;
      tick(state.current.cur);
      renderer.render(scene, camera);
    };
    loop();

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      W = mount.clientWidth; H = mount.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener('resize', onResize);

    // ── Wheel ─────────────────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      state.current.tgt -= d * WHEEL_SPD;
    };

    // ── Drag ─────────────────────────────────────────────────────────────────
    const onPDown = (e: PointerEvent) => {
      state.current.dragging = true;
      state.current.dragX    = e.clientX;
      state.current.dragStart = state.current.tgt;
      mount.setPointerCapture(e.pointerId);
    };
    const onPMove = (e: PointerEvent) => {
      if (!state.current.dragging) return;
      state.current.tgt = state.current.dragStart + (e.clientX - state.current.dragX) * DRAG_SPD;
    };
    const onPUp = () => {
      if (!state.current.dragging) return;
      state.current.dragging = false;
      // Snap to nearest card after release
      const step    = (Math.PI * 2) / N;
      // Nearest card index: which card would be at front (π/2) given current progress?
      const floatIdx = ((Math.PI / 2 - state.current.tgt) / step % N + N) % N;
      snapToIdx(Math.round(floatIdx) % N);
    };

    mount.addEventListener('wheel',         onWheel,  { passive: false });
    mount.addEventListener('pointerdown',   onPDown);
    mount.addEventListener('pointermove',   onPMove);
    mount.addEventListener('pointerup',     onPUp);
    mount.addEventListener('pointerleave',  onPUp);
    mount.addEventListener('pointercancel', onPUp);

    // ── Keyboard ─────────────────────────────────────────────────────────────
    const onKey = (e: KeyboardEvent) => {
      const step = (Math.PI * 2) / N;
      if (e.key === 'ArrowRight') { e.preventDefault(); state.current.tgt -= step; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); state.current.tgt += step; }
    };
    window.addEventListener('keydown', onKey);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    cleanupRef.current = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize',  onResize);
      window.removeEventListener('keydown', onKey);
      ['wheel','pointerdown','pointermove','pointerup','pointerleave','pointercancel'].forEach(ev =>
        mount.removeEventListener(ev, ev === 'wheel' ? onWheel as EventListener
          : ev === 'pointerdown' ? onPDown as EventListener
          : ev === 'pointermove' ? onPMove as EventListener
          : onPUp)
      );
      planes.forEach(p => scene.remove(p));
      mat.dispose(); geo.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      overlay.innerHTML = '';
      dotsEl.innerHTML  = '';
    };
  }, [projects]);

  useEffect(() => {
    state.current.cur      = Math.PI / 2;
    state.current.tgt      = Math.PI / 2;
    state.current.activeIdx = -1;
    init();
    return () => cleanupRef.current();
  }, [init]);

  if (projects.length === 0) {
    return (
      <div className="c3d-empty" role="status">
        <span className="c3d-empty-icon">⬡</span>
        <p>No hay proyectos en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="c3d-root" role="region" aria-label="Carousel espiral 3D de proyectos">
      {/* Three.js canvas + HTML overlay */}
      <div className="c3d-mount" ref={mountRef} tabIndex={0}>
        <div className="c3d-overlay" ref={overlayRef} aria-hidden="true" />

        <div className="c3d-counter" aria-live="polite" aria-atomic="true">
          <span className="c3d-counter-inner">
            01 / {String(projects.length).padStart(2, '0')}
          </span>
        </div>

        <div className="c3d-hint" aria-hidden="true">
          <svg viewBox="0 0 28 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M1 8h26M1 8l5-5M1 8l5 5M27 8l-5-5M27 8l-5 5"/>
          </svg>
          drag · scroll
        </div>
      </div>

      {/* Dots */}
      <div className="c3d-dots" ref={dotsRef} role="tablist" aria-label="Selección de proyecto" />
    </div>
  );
};

export default ProjectCarousel3D;
