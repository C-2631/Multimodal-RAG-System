import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import { X, Sparkles, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';

export const ThreeDAICompanion = () => {
  const mountRef = useRef(null);
  const { isLoading, setActiveTab } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    "Tip: Drag any image straight onto the search bar to query with CLIP vision!",
    "Tip: Switch to '3D Galaxy View' in search results to fly through vector clusters.",
    "Tip: Click the 92% similarity ring on the detail page to inspect cosine distances.",
    "Tip: Your document uploads are automatically chunked and stored in Qdrant.",
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 110;
    const height = 110;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ambient and cartoon key light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xa78bfa, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfbbf24, 2.0);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    // Companion Root Group
    const companion = new THREE.Group();
    scene.add(companion);

    // 1. Robot Body (Glossy White Ceramic Capsule)
    const bodyGeo = new THREE.CapsuleGeometry(0.7, 0.5, 16, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    companion.add(body);

    // 2. Visor Face Mask (Dark Curved Glass)
    const visorGeo = new THREE.SphereGeometry(0.68, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.rotation.x = Math.PI / 2.4;
    visor.position.set(0, 0.15, 0.12);
    visor.scale.set(0.9, 0.65, 0.9);
    companion.add(visor);

    // 3. Cute Cartoon LED Eyes
    const eyeGroup = new THREE.Group();
    companion.add(eyeGroup);

    const eyeGeo = new THREE.CapsuleGeometry(0.08, 0.12, 12, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.24, 0.22, 0.68);
    leftEye.rotation.z = Math.PI / 18;
    eyeGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.24, 0.22, 0.68);
    rightEye.rotation.z = -Math.PI / 18;
    eyeGroup.add(rightEye);

    // 4. Hover Propulsion Ring
    const hoverRingGeo = new THREE.TorusGeometry(0.75, 0.04, 16, 64);
    const hoverRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const hoverRing = new THREE.Mesh(hoverRingGeo, hoverRingMat);
    hoverRing.rotation.x = Math.PI / 2;
    hoverRing.position.y = -0.75;
    companion.add(hoverRing);

    // 5. Mini Antenna with energy bead
    const antStemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25);
    const antStemMat = new THREE.MeshStandardMaterial({ color: 0xc4b5fd, metalness: 0.5 });
    const antStem = new THREE.Mesh(antStemGeo, antStemMat);
    antStem.position.set(0, 1.05, 0);
    companion.add(antStem);

    const antBeadGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const antBeadMat = new THREE.MeshBasicMaterial({ color: 0x7c3aed });
    const antBead = new THREE.Mesh(antBeadGeo, antBeadMat);
    antBead.position.set(0, 1.2, 0);
    companion.add(antBead);

    // Mouse Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onGlobalMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX = (e.clientX - cx) / cx;
      mouseY = (e.clientY - cy) / cy;
    };

    window.addEventListener('mousemove', onGlobalMouseMove);

    let animId;
    let clock = new THREE.Clock();
    let nextBlink = 3;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Floating / Hover Bobbing animation
      companion.position.y = Math.sin(elapsed * 2.2) * 0.12;

      // Hover ring oscillation
      hoverRing.rotation.z = elapsed * 1.5;
      hoverRing.scale.set(
        1 + Math.sin(elapsed * 3) * 0.05,
        1 + Math.sin(elapsed * 3) * 0.05,
        1
      );

      // Antenna beacon glow
      antBead.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.15);

      // Look toward mouse cursor with smooth damping
      targetRotY = mouseX * 0.45;
      targetRotX = mouseY * 0.3;
      companion.rotation.y += (targetRotY - companion.rotation.y) * 0.08;
      companion.rotation.x += (targetRotX - companion.rotation.x) * 0.08;

      // Searching State: eyes glow amber & spin; Idle State: eyes blink
      if (isLoading) {
        eyeMat.color.setHex(0xf59e0b);
        leftEye.rotation.z += 0.2;
        rightEye.rotation.z -= 0.2;
      } else {
        eyeMat.color.setHex(0x38bdf8);
        leftEye.rotation.z = Math.PI / 18;
        rightEye.rotation.z = -Math.PI / 18;

        // Periodic blink
        if (elapsed > nextBlink) {
          leftEye.scale.y = 0.1;
          rightEye.scale.y = 0.1;
          if (elapsed > nextBlink + 0.15) {
            leftEye.scale.y = 1;
            rightEye.scale.y = 1;
            nextBlink = elapsed + 3 + Math.random() * 3;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onGlobalMouseMove);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isLoading]);

  return (
    <>
      {/* Minimized Pill — shown only when minimized */}
      {isMinimized && (
        <button
          onClick={() => { setIsMinimized(false); setIsOpen(false); }}
          className="fixed bottom-6 right-6 z-[60] p-3 rounded-full bg-brand-600 text-white shadow-xl hover:scale-110 transition-all flex items-center gap-2 cursor-pointer hover:bg-brand-700 active:scale-95"
          title="Open 3D Assistant"
        >
          <Sparkles className="w-5 h-5 text-amberGold" />
          <span className="text-xs font-semibold pr-1">Ask AI</span>
        </button>
      )}

      {/*
        IMPORTANT: The robot container is ALWAYS in the DOM (never conditionally unmounted).
        We use display:none to hide it when minimized.
        Conditional rendering caused a React/Three.js race condition where mountRef.current
        was null when useEffect ran after remount, so the canvas never appeared.
      */}
      <div
        style={{ display: isMinimized ? 'none' : 'flex' }}
        className="fixed bottom-6 right-6 z-50 flex-col items-end pointer-events-none select-none"
      >
        {/* Speech Bubble / Proactive Tips */}
        {isOpen && (
          <div className="pointer-events-auto mb-3 w-72 p-4 bg-white/95 backdrop-blur-md rounded-3xl border border-purple-200 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 text-left">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-800 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amberGold fill-amberGold" />
                <span>Aero • 3D AI Guide</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 font-sans leading-relaxed">
              {tips[tipIndex]}
            </p>

            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-brand-700">
              <button
                onClick={() => setTipIndex((prev) => (prev + 1) % tips.length)}
                className="hover:underline font-semibold cursor-pointer"
              >
                Next tip →
              </button>
              <button
                onClick={() => {
                  setActiveTab('chat');
                  setIsOpen(false);
                }}
                className="px-2.5 py-1 rounded-full bg-brand-600 text-white font-medium hover:bg-brand-700 cursor-pointer"
              >
                Open Chat
              </button>
            </div>
          </div>
        )}

        {/* Floating 3D Robot Mascot */}
        <div className="relative pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => { setIsOpen(false); setIsMinimized(true); }}
            className="w-6 h-6 rounded-full bg-white/90 border border-purple-200 text-slate-400 hover:text-slate-600 flex items-center justify-center shadow-xs cursor-pointer hover:bg-purple-50 transition-colors"
            title="Minimize"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-28 h-28 cursor-pointer group hover:scale-105 transition-transform"
            title="Click to interact with 3D Companion"
          >
            <div ref={mountRef} className="w-full h-full" />
            {/* Status Indicator */}
            <span className="absolute bottom-1 right-3 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
        </div>
      </div>
    </>
  );
};
