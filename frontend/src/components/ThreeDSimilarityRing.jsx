import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeDSimilarityRing = ({ similarityPercent = 92 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 80;
    const height = 80;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Warm golden ambient & point lights
    const ambient = new THREE.AmbientLight(0xfffbeb, 1.5);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xf59e0b, 3, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    const group = new THREE.Group();
    scene.add(group);

    // 1. Holographic Golden Torus Ring
    const torusGeo = new THREE.TorusGeometry(1.0, 0.08, 16, 64);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    group.add(torusMesh);

    // 2. Secondary Thin Outer Energy Orbit Ring
    const outerGeo = new THREE.TorusGeometry(1.22, 0.02, 16, 64);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    // 3. Electrical Energy Particle Spark Dots racing along the ring
    const particleCount = 24;
    const particleGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat);
      const angle = (i / particleCount) * Math.PI * 2;
      p.userData = { angle, speed: 0.025 + (similarityPercent / 100) * 0.02 };
      group.add(p);
      particles.push(p);
    }

    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gyroscopic tilt
      group.rotation.y = Math.sin(elapsed * 1.5) * 0.25;
      group.rotation.x = Math.cos(elapsed * 1.2) * 0.2;

      outerMesh.rotation.z = -elapsed * 0.8;

      // Move electrical spark particles along the circle
      particles.forEach((p) => {
        p.userData.angle += p.userData.speed;
        p.position.x = 1.0 * Math.cos(p.userData.angle);
        p.position.y = 1.0 * Math.sin(p.userData.angle);
        p.position.z = Math.sin(p.userData.angle * 3 + elapsed * 4) * 0.1;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [similarityPercent]);

  return (
    <div className="relative w-20 h-20 flex items-center justify-center select-none">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="font-display font-bold text-base text-slate-900 leading-none">
          {similarityPercent}%
        </span>
      </div>
    </div>
  );
};
