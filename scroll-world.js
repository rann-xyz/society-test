/* ============================================
   SOCIETY — Scroll 3D World Engine
   Three.js + Scroll-driven Camera Flight
   ============================================ */

import * as THREE from 'three';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  sceneCount: 3,
  sceneScrollHeight: 1.3, // vh per scene
  transitionScroll: 0.5,   // vh for transition between scenes
  cameraFov: 60,
  fogDensity: 0.015,
  particleCount: 800,
  colors: {
    bg: 0x0a0a0f,
    accent: 0xa78bfa,
    green: 0x34d399,
    red: 0xf87171,
    blue: 0x60a5fa,
    yellow: 0xfbbf24,
    cyan: 0x22d3ee,
  }
};

// ============================================
// STATE
// ============================================
let scene, camera, renderer, clock;
let scrollY = 0, targetScrollY = 0;
let currentScene = 0, sceneProgress = 0;
let isMobile = false;
let animationId;

// Scene objects
const sceneObjects = [];
const particles = [];
let globalParticles;

// UI refs
let uiElements = {};

// ============================================
// INIT
// ============================================
function init() {
  // Detect mobile
  isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches 
    || window.innerWidth <= 860;

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(CONFIG.colors.bg, CONFIG.fogDensity);

  // Camera
  camera = new THREE.PerspectiveCamera(
    CONFIG.cameraFov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: !isMobile,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(CONFIG.colors.bg);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  document.getElementById('canvas-container').appendChild(renderer.domElement);

  clock = new THREE.Clock();

  // Build all 3 worlds
  buildWorlds();
  buildGlobalParticles();
  buildLights();

  // UI refs
  cacheUIElements();

  // Events
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  // Nav clicks
  document.querySelectorAll('.nav-item, .route-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.scene);
      jumpToScene(idx);
    });
  });

  // Initial layout
  updateScrollTrack();
  onScroll();

  // Hide loader
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    animateStats();
  }, 2200);

  // Start loop
  animate();
}

function cacheUIElements() {
  uiElements = {
    progressFill: document.getElementById('progress-fill'),
    sceneCopies: document.querySelectorAll('.scene-copy'),
    navItems: document.querySelectorAll('.nav-item'),
    routeDots: document.querySelectorAll('.route-dot'),
    scrollHint: document.querySelector('.scroll-hint'),
    statsOverlay: document.querySelector('.stats-overlay'),
  };
}

// ============================================
// WORLD BUILDERS
// ============================================
function buildWorlds() {
  // Scene 0: Web3 Research — Data Network / Blockchain Nodes
  sceneObjects.push(buildResearchWorld());

  // Scene 1: Alpha Community — Floating Coins / Tokens / Airdrops
  sceneObjects.push(buildAlphaWorld());

  // Scene 2: X Raid Support — Social Waves / Engagement Storm
  sceneObjects.push(buildRaidWorld());
}

// --- SCENE 0: WEB3 RESEARCH ---
function buildResearchWorld() {
  const group = new THREE.Group();

  // Central data core
  const coreGeo = new THREE.IcosahedronGeometry(2, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.accent,
    emissive: CONFIG.colors.accent,
    emissiveIntensity: 0.4,
    metalness: 0.9,
    roughness: 0.1,
    wireframe: true,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner solid core
  const innerGeo = new THREE.IcosahedronGeometry(1.2, 1);
  const innerMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.accent,
    emissive: CONFIG.colors.accent,
    emissiveIntensity: 0.8,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.6,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  // Orbiting data nodes (blockchain nodes)
  const nodeCount = isMobile ? 20 : 40;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.15, 8, 8);

  for (let i = 0; i < nodeCount; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: i % 3 === 0 ? CONFIG.colors.green : 
             i % 3 === 1 ? CONFIG.colors.blue : CONFIG.colors.cyan,
      emissive: i % 3 === 0 ? CONFIG.colors.green : 
                i % 3 === 1 ? CONFIG.colors.blue : CONFIG.colors.cyan,
      emissiveIntensity: 0.6,
    });
    const node = new THREE.Mesh(nodeGeo, mat);

    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 4 + Math.random() * 6;
    const height = (Math.random() - 0.5) * 8;
    const speed = 0.2 + Math.random() * 0.5;

    node.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    node.userData = { angle, radius, height, speed, baseY: height };
    nodes.push(node);
    group.add(node);
  }

  // Connection lines between nearby nodes
  const lineMat = new THREE.LineBasicMaterial({
    color: CONFIG.colors.accent,
    transparent: true,
    opacity: 0.15,
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = nodes[i].position.distanceTo(nodes[j].position);
      if (dist < 5) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          nodes[i].position,
          nodes[j].position
        ]);
        const line = new THREE.Line(lineGeo, lineMat.clone());
        line.userData = { nodeA: nodes[i], nodeB: nodes[j] };
        group.add(line);
      }
    }
  }

  // Floating data panels
  const panelCount = isMobile ? 6 : 12;
  for (let i = 0; i < panelCount; i++) {
    const w = 1.5 + Math.random() * 2;
    const h = 0.8 + Math.random() * 1.2;
    const panelGeo = new THREE.PlaneGeometry(w, h);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      emissive: CONFIG.colors.accent,
      emissiveIntensity: 0.05,
      metalness: 0.5,
      roughness: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);

    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 10;
    panel.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 12,
      Math.sin(angle) * radius
    );
    panel.rotation.set(
      Math.random() * 0.5,
      Math.random() * Math.PI,
      Math.random() * 0.5
    );
    panel.userData = { 
      rotSpeed: { x: (Math.random()-0.5)*0.003, y: (Math.random()-0.5)*0.005, z: (Math.random()-0.5)*0.002 },
      floatSpeed: 0.3 + Math.random() * 0.5,
      floatOffset: Math.random() * Math.PI * 2,
    };
    group.add(panel);
  }

  // Ground grid
  const gridHelper = new THREE.GridHelper(60, 60, CONFIG.colors.accent, 0x1a1a2e);
  gridHelper.position.y = -8;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.3;
  group.add(gridHelper);

  return { group, type: 'research', nodes, core, inner };
}

// --- SCENE 1: ALPHA COMMUNITY ---
function buildAlphaWorld() {
  const group = new THREE.Group();

  // Central golden coin
  const coinGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.4, 32);
  const coinMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.yellow,
    emissive: CONFIG.colors.yellow,
    emissiveIntensity: 0.3,
    metalness: 1.0,
    roughness: 0.15,
  });
  const coin = new THREE.Mesh(coinGeo, coinMat);
  coin.rotation.x = Math.PI / 2;
  group.add(coin);

  // Coin rim glow
  const rimGeo = new THREE.TorusGeometry(2.5, 0.08, 16, 64);
  const rimMat = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.yellow,
    transparent: true,
    opacity: 0.8,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  group.add(rim);

  // Floating smaller coins/tokens
  const tokenCount = isMobile ? 25 : 50;
  const tokens = [];
  const tokenGeos = [
    new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16),
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
  ];
  const tokenColors = [CONFIG.colors.yellow, CONFIG.colors.green, CONFIG.colors.accent, CONFIG.colors.red];

  for (let i = 0; i < tokenCount; i++) {
    const geo = tokenGeos[i % tokenGeos.length];
    const mat = new THREE.MeshStandardMaterial({
      color: tokenColors[i % tokenColors.length],
      emissive: tokenColors[i % tokenColors.length],
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    });
    const token = new THREE.Mesh(geo, mat);

    const angle = Math.random() * Math.PI * 2;
    const radius = 5 + Math.random() * 12;
    const y = (Math.random() - 0.5) * 14;

    token.position.set(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
    token.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);

    token.userData = {
      orbitRadius: radius,
      orbitSpeed: 0.1 + Math.random() * 0.3,
      orbitAngle: angle,
      rotSpeed: { x: (Math.random()-0.5)*0.02, y: (Math.random()-0.5)*0.02, z: (Math.random()-0.5)*0.02 },
      floatSpeed: 0.5 + Math.random() * 1.0,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: y,
    };

    tokens.push(token);
    group.add(token);
  }

  // Airdrop parachutes (small cones with strings)
  const parachuteCount = isMobile ? 4 : 8;
  for (let i = 0; i < parachuteCount; i++) {
    const paraGroup = new THREE.Group();

    // Canopy
    const canopyGeo = new THREE.ConeGeometry(0.6, 0.5, 8, 1, true);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.green,
      emissive: CONFIG.colors.green,
      emissiveIntensity: 0.3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 0.5;
    paraGroup.add(canopy);

    // Package
    const packGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const packMat = new THREE.MeshStandardMaterial({
      color: CONFIG.colors.yellow,
      emissive: CONFIG.colors.yellow,
      emissiveIntensity: 0.2,
    });
    const pack = new THREE.Mesh(packGeo, packMat);
    paraGroup.add(pack);

    // Strings
    const stringMat = new THREE.LineBasicMaterial({ color: CONFIG.colors.green, transparent: true, opacity: 0.5 });
    for (let s = 0; s < 4; s++) {
      const sx = Math.cos((s/4)*Math.PI*2) * 0.4;
      const sz = Math.sin((s/4)*Math.PI*2) * 0.4;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sx, 0.3, sz),
        new THREE.Vector3(0, -0.15, 0)
      ]);
      paraGroup.add(new THREE.Line(lineGeo, stringMat));
    }

    paraGroup.position.set(
      (Math.random() - 0.5) * 20,
      6 + Math.random() * 8,
      (Math.random() - 0.5) * 20
    );
    paraGroup.userData = {
      driftSpeed: 0.2 + Math.random() * 0.3,
      driftOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.5 + Math.random() * 0.5,
    };
    group.add(paraGroup);
  }

  // Sparkle particles
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePositions = new Float32Array(200 * 3);
  for (let i = 0; i < 200; i++) {
    sparklePositions[i*3] = (Math.random() - 0.5) * 30;
    sparklePositions[i*3+1] = (Math.random() - 0.5) * 20;
    sparklePositions[i*3+2] = (Math.random() - 0.5) * 30;
  }
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
  const sparkleMat = new THREE.PointsMaterial({
    color: CONFIG.colors.yellow,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });
  const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
  group.add(sparkles);

  return { group, type: 'alpha', coin, rim, tokens, sparkles };
}

// --- SCENE 2: X RAID SUPPORT ---
function buildRaidWorld() {
  const group = new THREE.Group();

  // Central X symbol (two crossing bars)
  const xGroup = new THREE.Group();
  const barGeo = new THREE.BoxGeometry(0.5, 5, 0.5);
  const barMat = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.red,
    emissive: CONFIG.colors.red,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.2,
  });
  const bar1 = new THREE.Mesh(barGeo, barMat);
  bar1.rotation.z = Math.PI / 4;
  const bar2 = new THREE.Mesh(barGeo, barMat);
  bar2.rotation.z = -Math.PI / 4;
  xGroup.add(bar1, bar2);

  // X glow ring
  const xRingGeo = new THREE.TorusGeometry(3.5, 0.05, 16, 64);
  const xRingMat = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.red,
    transparent: true,
    opacity: 0.6,
  });
  const xRing = new THREE.Mesh(xRingGeo, xRingMat);
  xRing.rotation.x = Math.PI / 2;
  xGroup.add(xRing);

  group.add(xGroup);

  // Social engagement waves (concentric rings emanating)
  const waveCount = isMobile ? 6 : 12;
  const waves = [];
  for (let i = 0; i < waveCount; i++) {
    const waveGeo = new THREE.RingGeometry(4 + i * 1.5, 4.3 + i * 1.5, 64);
    const waveMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? CONFIG.colors.red : CONFIG.colors.accent,
      transparent: true,
      opacity: 0.15 - i * 0.01,
      side: THREE.DoubleSide,
    });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.rotation.x = -Math.PI / 2;
    wave.position.y = -2;
    wave.userData = { index: i, baseOpacity: 0.15 - i * 0.01 };
    waves.push(wave);
    group.add(wave);
  }

  // Flying engagement particles (hearts, retweets, likes)
  const engagementCount = isMobile ? 30 : 60;
  const engagements = [];

  for (let i = 0; i < engagementCount; i++) {
    // Simple shapes: diamond for like, arrow for retweet, star for star
    let geo;
    const type = i % 3;
    if (type === 0) {
      geo = new THREE.OctahedronGeometry(0.3, 0); // like
    } else if (type === 1) {
      geo = new THREE.ConeGeometry(0.2, 0.5, 4); // retweet arrow-ish
    } else {
      geo = new THREE.TetrahedronGeometry(0.3, 0); // star
    }

    const color = type === 0 ? CONFIG.colors.red : 
                  type === 1 ? CONFIG.colors.green : CONFIG.colors.yellow;

    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const angle = Math.random() * Math.PI * 2;
    const radius = 6 + Math.random() * 14;
    mesh.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 12,
      Math.sin(angle) * radius
    );

    mesh.userData = {
      type: type,
      orbitAngle: angle,
      orbitRadius: radius,
      orbitSpeed: 0.2 + Math.random() * 0.4,
      riseSpeed: 0.3 + Math.random() * 0.5,
      riseOffset: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
    };

    engagements.push(mesh);
    group.add(mesh);
  }

  // Lightning bolts (energy lines)
  const boltCount = isMobile ? 8 : 16;
  for (let i = 0; i < boltCount; i++) {
    const points = [];
    let px = 0, py = 0, pz = 0;
    const segments = 8;
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 0.5 + 0.5,
      (Math.random() - 0.5) * 2
    ).normalize();

    for (let s = 0; s <= segments; s++) {
      const t = s / segments;
      px = dir.x * t * 8 + (Math.random() - 0.5) * 0.5;
      py = dir.y * t * 8 + (Math.random() - 0.5) * 0.5;
      pz = dir.z * t * 8 + (Math.random() - 0.5) * 0.5;
      points.push(new THREE.Vector3(px, py, pz));
    }

    const boltGeo = new THREE.BufferGeometry().setFromPoints(points);
    const boltMat = new THREE.LineBasicMaterial({
      color: CONFIG.colors.red,
      transparent: true,
      opacity: 0.4,
    });
    const bolt = new THREE.Line(boltGeo, boltMat);
    bolt.userData = { 
      flashSpeed: 3 + Math.random() * 5,
      flashOffset: Math.random() * Math.PI * 2,
    };
    group.add(bolt);
  }

  // Ground energy grid
  const gridGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
  const gridMat = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.red,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -6;
  group.add(grid);

  return { group, type: 'raid', xGroup, waves, engagements, grid };
}

// ============================================
// GLOBAL PARTICLES (atmosphere)
// ============================================
function buildGlobalParticles() {
  const count = isMobile ? 400 : CONFIG.particleCount;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const palette = [
    new THREE.Color(CONFIG.colors.accent),
    new THREE.Color(CONFIG.colors.green),
    new THREE.Color(CONFIG.colors.blue),
    new THREE.Color(CONFIG.colors.cyan),
  ];

  for (let i = 0; i < count; i++) {
    positions[i*3] = (Math.random() - 0.5) * 80;
    positions[i*3+1] = (Math.random() - 0.5) * 60;
    positions[i*3+2] = (Math.random() - 0.5) * 80;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i*3] = color.r;
    colors[i*3+1] = color.g;
    colors[i*3+2] = color.b;

    sizes[i] = 0.05 + Math.random() * 0.15;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  globalParticles = new THREE.Points(geo, mat);
  scene.add(globalParticles);
}

// ============================================
// LIGHTS
// ============================================
function buildLights() {
  const ambient = new THREE.AmbientLight(0x404060, 0.5);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Scene-specific lights added per world
  sceneObjects.forEach((world, idx) => {
    const light = new THREE.PointLight(
      idx === 0 ? CONFIG.colors.accent :
      idx === 1 ? CONFIG.colors.yellow :
      CONFIG.colors.red,
      2, 30
    );
    light.position.set(0, 5, 0);
    world.group.add(light);
    world.mainLight = light;
  });
}

// ============================================
// SCROLL LOGIC
// ============================================
function updateScrollTrack() {
  const totalHeight = (CONFIG.sceneCount * CONFIG.sceneScrollHeight + 
    (CONFIG.sceneCount - 1) * CONFIG.transitionScroll + 1) * window.innerHeight;
  document.getElementById('scroll-track').style.height = totalHeight + 'px';
}

function onScroll() {
  targetScrollY = window.scrollY || window.pageYOffset;
}

function jumpToScene(idx) {
  const vh = window.innerHeight;
  const pos = idx * (CONFIG.sceneScrollHeight + CONFIG.transitionScroll) * vh + 
    (CONFIG.sceneScrollHeight * 0.5) * vh;
  window.scrollTo({ top: pos, behavior: 'smooth' });
}

function getSceneFromScroll(y) {
  const vh = window.innerHeight;
  const segment = CONFIG.sceneScrollHeight + CONFIG.transitionScroll;
  const rawProgress = y / (segment * vh);
  const sceneIdx = Math.floor(rawProgress);
  const progress = rawProgress - sceneIdx;

  return {
    scene: Math.min(Math.max(sceneIdx, 0), CONFIG.sceneCount - 1),
    progress: Math.min(Math.max(progress, 0), 1),
    totalProgress: Math.min(y / ((CONFIG.sceneCount * segment + 1) * vh), 1),
  };
}

// ============================================
// UPDATE WORLDS (per frame)
// ============================================
function updateWorlds(time, delta) {
  sceneObjects.forEach((world, idx) => {
    const isActive = idx === currentScene;
    const isAdjacent = Math.abs(idx - currentScene) <= 1;

    // Only update active + adjacent for performance
    if (!isActive && !isAdjacent) return;

    if (world.type === 'research') {
      // Rotate core
      world.core.rotation.y += delta * 0.3;
      world.core.rotation.x += delta * 0.1;
      world.inner.rotation.y -= delta * 0.5;
      world.inner.rotation.z += delta * 0.2;

      // Orbit nodes
      world.nodes.forEach(node => {
        const d = node.userData;
        d.angle += delta * d.speed * 0.3;
        node.position.x = Math.cos(d.angle) * d.radius;
        node.position.z = Math.sin(d.angle) * d.radius;
        node.position.y = d.baseY + Math.sin(time * d.speed + d.angle) * 0.5;
      });

      // Update connection lines
      world.group.children.forEach(child => {
        if (child.isLine && child.userData.nodeA) {
          const positions = child.geometry.attributes.position.array;
          positions[0] = child.userData.nodeA.position.x;
          positions[1] = child.userData.nodeA.position.y;
          positions[2] = child.userData.nodeA.position.z;
          positions[3] = child.userData.nodeB.position.x;
          positions[4] = child.userData.nodeB.position.y;
          positions[5] = child.userData.nodeB.position.z;
          child.geometry.attributes.position.needsUpdate = true;
        }
        // Float panels
        if (child.isMesh && child.geometry.type === 'PlaneGeometry') {
          const d = child.userData;
          if (d.rotSpeed) {
            child.rotation.x += d.rotSpeed.x;
            child.rotation.y += d.rotSpeed.y;
            child.rotation.z += d.rotSpeed.z;
            child.position.y += Math.sin(time * d.floatSpeed + d.floatOffset) * 0.003;
          }
        }
      });
    }

    else if (world.type === 'alpha') {
      // Spin main coin
      world.coin.rotation.y += delta * 0.5;
      world.rim.rotation.z -= delta * 0.3;

      // Orbit tokens
      world.tokens.forEach(token => {
        const d = token.userData;
        d.orbitAngle += delta * d.orbitSpeed * 0.2;
        token.position.x = Math.cos(d.orbitAngle) * d.orbitRadius;
        token.position.z = Math.sin(d.orbitAngle) * d.orbitRadius;
        token.position.y = d.baseY + Math.sin(time * d.floatSpeed + d.floatOffset) * 1.5;
        token.rotation.x += d.rotSpeed.x;
        token.rotation.y += d.rotSpeed.y;
        token.rotation.z += d.rotSpeed.z;
      });

      // Sparkle twinkle
      world.sparkles.material.opacity = 0.5 + Math.sin(time * 2) * 0.3;

      // Parachutes drift
      world.group.children.forEach(child => {
        if (child.type === 'Group' && child.userData.driftSpeed) {
          const d = child.userData;
          child.position.x += Math.sin(time * d.driftSpeed + d.driftOffset) * 0.01;
          child.position.z += Math.cos(time * d.driftSpeed + d.driftOffset) * 0.01;
          child.rotation.z = Math.sin(time * d.swaySpeed) * 0.1;
        }
      });
    }

    else if (world.type === 'raid') {
      // Pulse X
      const pulse = 1 + Math.sin(time * 3) * 0.05;
      world.xGroup.scale.set(pulse, pulse, pulse);
      world.xGroup.rotation.y += delta * 0.4;

      // Waves expand
      world.waves.forEach((wave, i) => {
        const scale = 1 + (time * 0.3 + i * 0.5) % 3;
        wave.scale.set(scale, scale, 1);
        wave.material.opacity = wave.userData.baseOpacity * (1 - (scale - 1) / 3);
      });

      // Engagements fly
      world.engagements.forEach(eng => {
        const d = eng.userData;
        d.orbitAngle += delta * d.orbitSpeed * 0.3;
        eng.position.x = Math.cos(d.orbitAngle) * d.orbitRadius;
        eng.position.z = Math.sin(d.orbitAngle) * d.orbitRadius;
        eng.position.y = Math.sin(time * d.riseSpeed + d.riseOffset) * 6;
        eng.rotation.y += d.rotSpeed;
      });

      // Lightning flash
      world.group.children.forEach(child => {
        if (child.isLine && child.userData.flashSpeed) {
          const d = child.userData;
          child.material.opacity = 0.1 + Math.max(0, Math.sin(time * d.flashSpeed + d.flashOffset)) * 0.5;
        }
      });

      // Grid pulse
      world.grid.material.opacity = 0.05 + Math.sin(time * 2) * 0.03;
    }
  });
}

// ============================================
// CAMERA & SCENE TRANSITIONS
// ============================================
const cameraPositions = [
  { start: { x: 0, y: 2, z: 18 }, end: { x: 0, y: 0, z: 6 } },   // Research: far to close
  { start: { x: 12, y: 4, z: 12 }, end: { x: 0, y: 1, z: 8 } },  // Alpha: angle to front
  { start: { x: -10, y: 6, z: 10 }, end: { x: 0, y: 2, z: 7 } }, // Raid: high angle to center
];

const scenePositions = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -30),
  new THREE.Vector3(0, 0, -60),
];

function updateCamera(time) {
  const scrollInfo = getSceneFromScroll(scrollY);
  currentScene = scrollInfo.scene;
  sceneProgress = scrollInfo.progress;

  // Smooth scroll interpolation
  scrollY += (targetScrollY - scrollY) * 0.08;

  const cp = cameraPositions[currentScene];
  const sp = scenePositions[currentScene];

  // Camera position within scene (dive in effect)
  const diveProgress = Math.min(sceneProgress / 0.7, 1);
  const easeDive = diveProgress < 0.5 
    ? 4 * diveProgress * diveProgress * diveProgress 
    : 1 - Math.pow(-2 * diveProgress + 2, 3) / 2;

  camera.position.x = THREE.MathUtils.lerp(cp.start.x, cp.end.x, easeDive);
  camera.position.y = THREE.MathUtils.lerp(cp.start.y, cp.end.y, easeDive);
  camera.position.z = THREE.MathUtils.lerp(cp.start.z, cp.end.z, easeDive);

  // Look at scene center with slight parallax
  const lookTarget = new THREE.Vector3(
    Math.sin(time * 0.2) * 0.5,
    Math.sin(time * 0.3) * 0.3,
    sp.z
  );
  camera.lookAt(lookTarget);

  // Position worlds
  sceneObjects.forEach((world, idx) => {
    const targetPos = scenePositions[idx].clone();

    // Transition offset
    if (idx < currentScene) {
      targetPos.z += 20 * (1 - Math.min(sceneProgress * 2, 1));
    } else if (idx > currentScene) {
      targetPos.z -= 20 * Math.min(sceneProgress * 2, 1);
    }

    world.group.position.lerp(targetPos, 0.05);

    // Fade in/out
    const dist = Math.abs(idx - currentScene);
    const targetOpacity = dist === 0 ? 1 : dist === 1 ? 0.3 : 0;

    world.group.traverse(child => {
      if (child.material && child.material.transparent !== undefined) {
        const baseOpacity = child.userData.baseOpacity || 1;
        child.material.opacity = THREE.MathUtils.lerp(
          child.material.opacity || 1,
          targetOpacity * baseOpacity,
          0.05
        );
      }
    });

    world.group.visible = world.group.position.distanceTo(camera.position) < 80;
  });

  // Update UI
  updateUI(scrollInfo);
}

function updateUI(scrollInfo) {
  const { scene, totalProgress } = scrollInfo;

  // Progress bar
  if (uiElements.progressFill) {
    uiElements.progressFill.style.transform = `scaleX(${totalProgress})`;
  }

  // Scene copy
  uiElements.sceneCopies.forEach((copy, idx) => {
    const isActive = idx === scene;
    copy.classList.toggle('active', isActive);

    if (isActive) {
      const pr = sceneProgress;
      const yOffset = (0.5 - pr) * 30;
      copy.style.transform = `translateY(calc(-50% + ${yOffset}px))`;
    }
  });

  // Nav items
  uiElements.navItems.forEach((item, idx) => {
    item.classList.toggle('active', idx === scene);
  });

  // Route dots
  uiElements.routeDots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === scene);
  });

  // Scroll hint
  if (uiElements.scrollHint) {
    uiElements.scrollHint.classList.toggle('hidden', totalProgress > 0.15);
  }

  // Stats visibility
  if (uiElements.statsOverlay) {
    uiElements.statsOverlay.style.opacity = totalProgress > 0.9 ? '0' : '1';
  }
}

// ============================================
// GLOBAL PARTICLES UPDATE
// ============================================
function updateGlobalParticles(time) {
  if (!globalParticles) return;

  const positions = globalParticles.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i+1] += Math.sin(time * 0.5 + positions[i] * 0.1) * 0.005;
    // Wrap around
    if (positions[i+1] > 30) positions[i+1] = -30;
    if (positions[i+1] < -30) positions[i+1] = 30;
  }
  globalParticles.geometry.attributes.position.needsUpdate = true;
  globalParticles.rotation.y = time * 0.02;
}

// ============================================
// STATS ANIMATION
// ============================================
function animateStats() {
  const stats = [
    { el: document.getElementById('stat-members'), target: 12500, suffix: '+' },
    { el: document.getElementById('stat-alpha'), target: 340, suffix: '+' },
    { el: document.getElementById('stat-raids'), target: 89, suffix: '' },
  ];

  stats.forEach(({ el, target, suffix }) => {
    if (!el) return;
    let current = 0;
    const increment = target / 60;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = Math.floor(current).toLocaleString() + suffix;
    }, 30);
  });
}

// ============================================
// RESIZE
// ============================================
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches || w <= 860;
  updateScrollTrack();
}

// ============================================
// ANIMATION LOOP
// ============================================
function animate() {
  animationId = requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime();

  updateCamera(time);
  updateWorlds(time, delta);
  updateGlobalParticles(time);

  renderer.render(scene, camera);
}

// ============================================
// CLEANUP
// ============================================
window.addEventListener('beforeunload', () => {
  if (animationId) cancelAnimationFrame(animationId);
  renderer.dispose();
});

// ============================================
// START
// ============================================
init();
