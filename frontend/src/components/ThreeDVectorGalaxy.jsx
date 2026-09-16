import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, Bot, ArrowRight, Compass, Heart } from 'lucide-react';

export const ThreeDVectorGalaxy = () => {
  const mountRef = useRef(null);
  const { setDetailItem } = useAppStore();
  const [hoveredNode, setHoveredNode] = useState(null);

  // Multimodal Vector Clusters represented by Cute Cartoon AI Robot Drones
  const robotNodes = [
    // Cluster 1: Climate & Marine Ecology (Mint / Emerald Bots)
    { id: 'c1', title: 'IPCC AR6 Coastal Synthesis', cluster: 'Climate Impact', color: 0x10b981, botType: 'eco', pos: [-2.4, 1.2, 0.5], sim: 0.96, tag: 'Eco-Bot 01' },
    { id: 'c2', title: 'Nature: High-Res Elevation Mapping', cluster: 'Climate Impact', color: 0x34d399, botType: 'eco', pos: [-2.9, 0.4, -0.4], sim: 0.93, tag: 'Eco-Bot 02' },
    { id: 'c3', title: 'Aerial Coastal Flood LiDAR', cluster: 'Climate Impact', color: 0x059669, botType: 'eco', pos: [-1.9, 1.8, 0.9], sim: 0.94, tag: 'Eco-Drone' },

    // Cluster 2: Renewable Clean Tech (Golden / Amber Bots)
    { id: 'r1', title: 'The Future of Renewable Energy', cluster: 'Clean Tech', color: 0xf59e0b, botType: 'solar', pos: [2.3, 1.5, -0.6], sim: 0.92, tag: 'Solar-Bot Alpha' },
    { id: 'r2', title: 'Offshore Wind Turbine Array', cluster: 'Clean Tech', color: 0xfbbf24, botType: 'solar', pos: [3.0, 0.8, 0.3], sim: 0.95, tag: 'Wind-Drone' },
    { id: 'r3', title: 'Photovoltaic Microgrid Storage', cluster: 'Clean Tech', color: 0xd97706, botType: 'solar', pos: [2.0, 2.2, -0.2], sim: 0.89, tag: 'Battery-Bot' },

    // Cluster 3: Neural & Multimodal AI (Candy Violet / Iris Bots)
    { id: 'a1', title: 'CLIP Vision-Language Embeddings', cluster: 'Neural AI', color: 0x8b5cf6, botType: 'neural', pos: [0.3, -2.0, 1.3], sim: 0.91, tag: 'Vision-Bot' },
    { id: 'a2', title: 'HNSW Graph Vector Search', cluster: 'Neural AI', color: 0x7c3aed, botType: 'neural', pos: [-0.6, -2.3, 0.6], sim: 0.88, tag: 'Vector-Bot' },
    { id: 'a3', title: 'Cross-Encoder Reranking Model', cluster: 'Neural AI', color: 0xa78bfa, botType: 'neural', pos: [0.9, -1.6, 0.8], sim: 0.86, tag: 'Ranker-Bot' },

    // Cluster 4: Geospatial & Oceans (Aqua / Cyan Bots)
    { id: 'g1', title: 'Oceanographic Bathymetry Depth', cluster: 'Geospatial', color: 0x06b6d4, botType: 'aqua', pos: [0.6, 0.3, -2.5], sim: 0.87, tag: 'Aqua-Drone' },
    { id: 'g2', title: 'Tidal Harmonic Surge Sensors', cluster: 'Geospatial', color: 0x38bdf8, botType: 'aqua', pos: [-0.4, 0.8, -2.2], sim: 0.85, tag: 'Sensor-Bot' },
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Dreamy Cartoon Space Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.5);
    scene.add(ambientLight);

    const pinkFill = new THREE.DirectionalLight(0xf472b6, 2.0);
    pinkFill.position.set(5, 5, 4);
    scene.add(pinkFill);

    const cyanFill = new THREE.DirectionalLight(0x38bdf8, 2.0);
    cyanFill.position.set(-5, -4, 4);
    scene.add(cyanFill);

    const galaxyRoot = new THREE.Group();
    scene.add(galaxyRoot);

    // 3. Stylized Cartoon Stars & Floating Pastel Bubble Particles
    const starCount = 120;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 22;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.09,
      transparent: true,
      opacity: 0.75,
    });
    const stars = new THREE.Points(starGeo, starMat);
    galaxyRoot.add(stars);

    // 4. Central "Mother-Drone" Robot Star (NEXUS Queen Bot)
    const motherDrone = new THREE.Group();
    galaxyRoot.add(motherDrone);

    // Mother bot glossy rounded head
    const motherHeadGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const motherHeadMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 0.8,
    });
    const motherHead = new THREE.Mesh(motherHeadGeo, motherHeadMat);
    motherDrone.add(motherHead);

    // Mother bot curved shiny dark visor
    const motherVisorGeo = new THREE.SphereGeometry(0.68, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const motherVisorMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.1, metalness: 0.8 });
    const motherVisor = new THREE.Mesh(motherVisorGeo, motherVisorMat);
    motherVisor.rotation.x = Math.PI / 2.3;
    motherVisor.position.set(0, 0.1, 0.1);
    motherVisor.scale.set(0.9, 0.65, 0.9);
    motherDrone.add(motherVisor);

    // Big expressive cartoon eyes for Mother-Drone
    const motherEyeGeo = new THREE.CapsuleGeometry(0.08, 0.14, 12, 16);
    const motherEyeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const mLeftEye = new THREE.Mesh(motherEyeGeo, motherEyeMat);
    mLeftEye.position.set(-0.22, 0.18, 0.68);
    mLeftEye.rotation.z = Math.PI / 20;
    motherDrone.add(mLeftEye);

    const mRightEye = new THREE.Mesh(motherEyeGeo, motherEyeMat);
    mRightEye.position.set(0.22, 0.18, 0.68);
    mRightEye.rotation.z = -Math.PI / 20;
    motherDrone.add(mRightEye);

    // Spinning Cartoon Halo Ring around Mother Bot
    const motherHaloGeo = new THREE.TorusGeometry(1.15, 0.04, 16, 64);
    const motherHaloMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.5,
      metalness: 0.7,
    });
    const motherHalo = new THREE.Mesh(motherHaloGeo, motherHaloMat);
    motherHalo.rotation.x = Math.PI / 3;
    motherDrone.add(motherHalo);

    // 5. Build Mini Cartoon Robot Drones for each vector node
    const droneObjects = [];

    robotNodes.forEach((nodeData) => {
      const droneGroup = new THREE.Group();
      droneGroup.position.set(...nodeData.pos);
      droneGroup.userData = nodeData;

      // Bot Body (Cute Rounded Capsule in Candy Colors)
      const botBodyGeo = new THREE.CapsuleGeometry(0.2, 0.22, 12, 16);
      const botBodyMat = new THREE.MeshStandardMaterial({
        color: nodeData.color,
        roughness: 0.2,
        metalness: 0.3,
      });
      const botBody = new THREE.Mesh(botBodyGeo, botBodyMat);
      droneGroup.add(botBody);

      // Bot Curved Visor
      const botVisorGeo = new THREE.SphereGeometry(0.19, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.3);
      const botVisorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
      const botVisor = new THREE.Mesh(botVisorGeo, botVisorMat);
      botVisor.rotation.x = Math.PI / 2.3;
      botVisor.position.set(0, 0.04, 0.04);
      botVisor.scale.set(0.9, 0.6, 0.9);
      droneGroup.add(botVisor);

      // Cute Glowing LED Eyes
      const botEyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const botEyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const bEyeL = new THREE.Mesh(botEyeGeo, botEyeMat);
      bEyeL.position.set(-0.065, 0.055, 0.19);
      droneGroup.add(bEyeL);

      const bEyeR = new THREE.Mesh(botEyeGeo, botEyeMat);
      bEyeR.position.set(0.065, 0.055, 0.19);
      droneGroup.add(bEyeR);

      // Cute Spinning Hover Ring / Propeller under each bot
      const propGeo = new THREE.TorusGeometry(0.24, 0.02, 12, 32);
      const propMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.8 });
      const prop = new THREE.Mesh(propGeo, propMat);
      prop.rotation.x = Math.PI / 2;
      prop.position.y = -0.24;
      droneGroup.add(prop);

      // Antenna with glowing candy tip
      const antGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.12);
      const antMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const ant = new THREE.Mesh(antGeo, antMat);
      ant.position.set(0, 0.35, 0);
      droneGroup.add(ant);

      const tipGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const tipMat = new THREE.MeshBasicMaterial({ color: nodeData.color });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.set(0, 0.42, 0);
      droneGroup.add(tip);

      // Floating data halo
      const haloGeo = new THREE.RingGeometry(0.32, 0.35, 24);
      const haloMat = new THREE.MeshBasicMaterial({ color: nodeData.color, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.y = 0.05;
      droneGroup.add(halo);

      droneGroup.userData.originalY = nodeData.pos[1];
      droneGroup.userData.floatOffset = Math.random() * Math.PI * 2;
      droneGroup.userData.propeller = prop;
      droneGroup.userData.body = botBody;

      galaxyRoot.add(droneGroup);
      droneObjects.push(droneGroup);
    });

    // 6. Glowing Cartoon Laser Pathways connecting Drone Robots to Mother Drone
    const beamMat = new THREE.LineDashedMaterial({
      color: 0xc084fc,
      dashSize: 0.2,
      gapSize: 0.15,
      transparent: true,
      opacity: 0.4,
    });

    const connections = [
      [robotNodes[0].pos, [0, 0, 0]],
      [robotNodes[3].pos, [0, 0, 0]],
      [robotNodes[6].pos, [0, 0, 0]],
      [robotNodes[9].pos, [0, 0, 0]],
      [robotNodes[0].pos, robotNodes[1].pos],
      [robotNodes[0].pos, robotNodes[2].pos],
      [robotNodes[3].pos, robotNodes[4].pos],
      [robotNodes[3].pos, robotNodes[5].pos],
      [robotNodes[6].pos, robotNodes[7].pos],
      [robotNodes[6].pos, robotNodes[8].pos],
    ];

    connections.forEach(([p1, p2]) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...p1),
        new THREE.Vector3(...p2),
      ]);
      const line = new THREE.Line(lineGeo, beamMat);
      line.computeLineDistances();
      galaxyRoot.add(line);
    });

    // 7. Interactive Mouse Controls & Raycasting
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;
        galaxyRoot.rotation.y += deltaX * 0.007;
        galaxyRoot.rotation.x += deltaY * 0.007;
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Click handler to trigger document deep-dive
    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(droneObjects, true);
      if (intersects.length > 0) {
        // Find top group
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== galaxyRoot) {
          obj = obj.parent;
        }
        const item = obj.userData;
        if (item && item.title) {
          setDetailItem({
            title: item.title,
            similarityPercent: Math.round(item.sim * 100),
            breadcrumb: 'Back to 3D Robot Galaxy',
            heroMediaUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
            videoDuration: '2:15',
            aiSummary: `Cute 3D AI Robot Drone [${item.tag}] discovered high-confidence multimodal vectors in the ${item.cluster} cluster with ${(item.sim * 100).toFixed(0)}% similarity.`,
            keyPoints: [
              'Represented by an autonomous 3D cartoon drone in the embedding space.',
              'Cosine vector similarity verified across text and diagram modalities.',
              'Grounded in peer-reviewed scientific repositories.',
            ],
            tags: [item.cluster.toLowerCase(), '3d cartoon ai', 'qdrant vector', 'clip vit'],
            relatedImages: [
              { id: 'rel-bot', title: item.title, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80', similarity: item.sim, type: item.tag },
            ],
          });
        }
      }
    };

    container.addEventListener('click', onClick);

    // 8. 60 FPS Cartoon Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Mother drone floating & breathing
      motherDrone.position.y = Math.sin(elapsed * 2.0) * 0.15;
      motherHalo.rotation.z = elapsed * 1.8;
      motherHalo.rotation.x = Math.PI / 3 + Math.sin(elapsed * 1.2) * 0.15;

      // Soft galaxy drift
      if (!isDragging) {
        galaxyRoot.rotation.y += 0.003;
      }

      // Animate each cartoon drone
      droneObjects.forEach((drone) => {
        // Individual levitation bobbing
        drone.position.y = drone.userData.originalY + Math.sin(elapsed * 3 + drone.userData.floatOffset) * 0.08;

        // Spin drone hover propeller
        if (drone.userData.propeller) {
          drone.userData.propeller.rotation.z += 0.25;
        }

        // Bots gently tilt toward camera
        drone.rotation.y = Math.sin(elapsed * 1.5 + drone.userData.floatOffset) * 0.2;
      });

      // Raycasting hover detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(droneObjects, true);

      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        let topObj = intersects[0].object;
        while (topObj.parent && topObj.parent !== galaxyRoot) {
          topObj = topObj.parent;
        }
        if (topObj.userData && topObj.userData.title) {
          setHoveredNode(topObj.userData);
          // Scale up hovered bot playfully
          topObj.scale.setScalar(1.25);
        }
      } else {
        container.style.cursor = isDragging ? 'grabbing' : 'grab';
        droneObjects.forEach((d) => d.scale.setScalar(1.0));
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 480;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [setDetailItem]);

  return (
    <div className="relative w-full h-[480px] rounded-4xl overflow-hidden bg-gradient-to-b from-[#140F2D] via-[#1E143E] to-[#0D0A22] border-2 border-purple-300/40 shadow-2xl select-none">
      
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Cartoon Top HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
        <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
          <Bot className="w-4 h-4 text-amberGold" />
          <span>3D Cartoon AI Robot Galaxy • Drone Vectors</span>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-[11px] font-mono border border-purple-400/30">
          NEXUS-01 Mother Drone Active
        </span>
      </div>

      <div className="absolute top-4 right-4 z-10 text-[11px] font-mono text-white/80 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
        Drag to Orbit • Click Drone to Deep Dive
      </div>

      {/* Playful Floating Speech Bubble Tooltip for Hovered Robot Drone */}
      {hoveredNode && (
        <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-md z-20 p-5 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-200 shadow-2xl animate-in zoom-in-95 duration-150 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-800">
                🤖 {hoveredNode.tag} ({hoveredNode.cluster})
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {(hoveredNode.sim * 100).toFixed(0)}% Match
            </span>
          </div>

          <h4 className="font-display font-bold text-base text-slate-900 mt-2 leading-snug">
            {hoveredNode.title}
          </h4>

          <p className="text-xs text-slate-600 mt-1 font-sans">
            Autonomous vector drone holding multimodal CLIP coordinates.
          </p>

          <div className="mt-3 pt-2.5 border-t border-purple-100 flex items-center justify-between text-xs font-semibold text-brand-700">
            <span>Click to explore document with AI</span>
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Cartoon Robot Cluster Legend */}
      <div className="absolute bottom-4 right-4 hidden md:flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-[11px] font-mono text-white">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Eco-Bots</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Solar-Bots</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Neural-Bots</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Aqua-Drones</span>
      </div>

    </div>
  );
};
