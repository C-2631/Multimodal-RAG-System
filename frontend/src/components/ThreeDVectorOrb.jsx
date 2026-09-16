import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeDVectorOrb = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Lighting (Cartoon & movie-style soft dual tones)
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    const pointLightViolet = new THREE.PointLight(0x8b5cf6, 3, 20);
    pointLightViolet.position.set(4, 5, 4);
    scene.add(pointLightViolet);

    const pointLightAmber = new THREE.PointLight(0xf59e0b, 2.5, 20);
    pointLightAmber.position.set(-4, -3, 3);
    scene.add(pointLightAmber);

    // 3. Central Stylized Faceted Core (Crystalline Multimodal Vector Core)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.2,
      metalness: 0.4,
      flatShading: true,
      emissive: 0x3b0764,
      emissiveIntensity: 0.3,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Outer wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // 4. Orbital Gimbal Rings (Stylized celestial knowledge rings)
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.03, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xc4b5fd,
      roughness: 0.3,
      metalness: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.025, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    scene.add(ring2);

    // 5. Floating Knowledge Vector Nodes (Representing Text, Image, Audio, Video chunks in 3D Space)
    const nodeCount = 36;
    const nodeGroup = new THREE.Group();
    scene.add(nodeGroup);

    const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const nodePalette = [0x7c3aed, 0xf59e0b, 0x10b981, 0xec4899, 0x06b6d4];

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const color = nodePalette[i % nodePalette.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.1,
      });
      const mesh = new THREE.Mesh(nodeGeo, mat);

      // Spherical distribution around core
      const radius = 2.2 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      mesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      mesh.userData = {
        speed: 0.005 + Math.random() * 0.01,
        orbitRadius: radius,
        angle: theta,
        phi: phi,
      };

      nodeGroup.add(mesh);
      nodes.push(mesh);
    }

    // 6. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = -(y / rect.height) * 2;
    };

    container.addEventListener('mousemove', onMouseMove);

    // 7. Animation Loop (Smooth 60 FPS)
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera easing to mouse
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x = targetX * 1.2;
      camera.position.y = targetY * 1.2;
      camera.lookAt(0, 0, 0);

      // Core rotation with subtle breathing scale
      coreGroup.rotation.y = elapsedTime * 0.35;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
      const scale = 1 + Math.sin(elapsedTime * 2) * 0.04;
      coreGroup.scale.set(scale, scale, scale);

      // Orbiting rings
      ring1.rotation.z = elapsedTime * 0.25;
      ring1.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 0.5) * 0.1;

      ring2.rotation.y = -elapsedTime * 0.3;
      ring2.rotation.z = Math.cos(elapsedTime * 0.4) * 0.15;

      // Orbiting vector nodes
      nodes.forEach((node) => {
        node.userData.angle += node.userData.speed;
        node.position.x = node.userData.orbitRadius * Math.sin(node.userData.phi) * Math.cos(node.userData.angle);
        node.position.z = node.userData.orbitRadius * Math.sin(node.userData.phi) * Math.sin(node.userData.angle);
      });

      nodeGroup.rotation.y = elapsedTime * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] md:h-[420px] flex items-center justify-center">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />
      {/* Editorial floating annotation badge matching reference mockup */}
      <div className="absolute -bottom-2 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-100 shadow-sm flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-amberGold animate-ping" />
        <span className="font-mono text-xs text-brand-900 tracking-wider font-semibold uppercase">
          CLIP 512D Vector Space
        </span>
      </div>
    </div>
  );
};
