import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeDAudioRibbon = ({ isListening = true }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = 120;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0x7c3aed, 2);
    dirLight.position.set(2, 3, 2);
    scene.add(dirLight);

    // Create ribbon plane geometry with subdivision
    const ribbonGeo = new THREE.PlaneGeometry(5, 1.2, 60, 20);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.6,
      wireframe: true,
    });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.rotation.x = -Math.PI / 3;
    scene.add(ribbon);

    const posAttr = ribbonGeo.attributes.position;
    const originalPositions = posAttr.clone();

    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Wave deformation
      for (let i = 0; i < posAttr.count; i++) {
        const u = originalPositions.getX(i);
        const v = originalPositions.getY(i);
        const wave = Math.sin(u * 2.5 + elapsed * 4) * 0.25 * Math.cos(v * 3 + elapsed * 2);
        posAttr.setZ(i, isListening ? wave : 0);
      }
      posAttr.needsUpdate = true;

      ribbon.rotation.z = Math.sin(elapsed * 0.5) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isListening]);

  return (
    <div className="w-full relative h-[120px] rounded-2xl overflow-hidden bg-gradient-to-r from-purple-900/10 via-amber-500/10 to-purple-900/10 flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-4 px-2.5 py-0.5 rounded-full bg-white/90 border border-purple-200 text-[10px] font-mono text-brand-800 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span>3D Acoustic Vector Ribbon</span>
      </div>
    </div>
  );
};
