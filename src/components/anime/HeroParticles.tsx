"use client";

import { useEffect, useRef } from "react";

/**
 * Floating 3D particle field over the hero.
 * Three.js is loaded dynamically so it never blocks initial render.
 * ~400 particles drifting slowly upward with a subtle drift.
 */
export default function HeroParticles() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let renderer: import("three").WebGLRenderer;
    let animId: number;

    import("three").then((THREE) => {
      const W = el.clientWidth;
      const H = el.clientHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
      camera.position.z = 5;

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      const COUNT = 380;
      const positions = new Float32Array(COUNT * 3);
      const speeds = new Float32Array(COUNT);
      const drifts = new Float32Array(COUNT * 2);

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        speeds[i]             = 0.002 + Math.random() * 0.004;
        drifts[i * 2]         = (Math.random() - 0.5) * 0.001;
        drifts[i * 2 + 1]     = (Math.random() - 0.5) * 0.001;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const mat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.028,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true,
        depthWrite: false,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      const onResize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const pos = geo.attributes.position.array as Float32Array;

        for (let i = 0; i < COUNT; i++) {
          pos[i * 3 + 1] += speeds[i];
          pos[i * 3]     += drifts[i * 2];
          pos[i * 3 + 2] += drifts[i * 2 + 1];
          if (pos[i * 3 + 1] > 4)  pos[i * 3 + 1] = -4;
          if (pos[i * 3]     >  6)  pos[i * 3]     = -6;
          if (pos[i * 3]     < -6)  pos[i * 3]     =  6;
        }

        geo.attributes.position.needsUpdate = true;

        const t = Date.now() * 0.00008;
        camera.position.x = Math.sin(t) * 0.4;
        camera.position.y = Math.cos(t * 0.7) * 0.2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      animate();
    });

    return () => {
      cancelAnimationFrame(animId);
      if (renderer) {
        renderer.dispose();
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 4, mixBlendMode: "screen" }}
    />
  );
}
