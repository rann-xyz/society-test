/* ═══════════════════════════════════════════════════════════════
   SOCIETY 3D — Three.js Scene
   Scroll-Driven 3D World with Particles, Grid & Mascots
   ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ═══════════════════════════════════════════════════════════════
// SCENE SETUP
// ═══════════════════════════════════════════════════════════════
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ 
  canvas, 
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ═══════════════════════════════════════════════════════════════
// POST-PROCESSING — BLOOM GLOW
// ═══════════════════════════════════════════════════════════════
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.8,    // strength
  0.5,    // radius
  0.2     // threshold
);
composer.addPass(bloomPass);

// ═══════════════════════════════════════════════════════════════
// LIGHTING
// ═══════════════════════════════════════════════════════════════
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xd8ff3e, 1.5);
mainLight.position.set(10, 20, 10);
mainLight.castShadow = true;
scene.add(mainLight);

const accentLight = new THREE.PointLight(0xd8ff3e, 2, 50);
accentLight.position.set(-10, 10, -10);
scene.add(accentLight);

const fillLight = new THREE.PointLight(0x4a4a4a, 1, 50);
fillLight.position.set(10, -5, 10);
scene.add(fillLight);

// ═══════════════════════════════════════════════════════════════
// PARTICLE SYSTEM — Floating Data Points
// ═══════════════════════════════════════════════════════════════
const particleCount = 800;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 100;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  particleSizes[i] = Math.random() * 2 + 0.5;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleMaterial = new THREE.PointsMaterial({
  color: 0xd8ff3e,
  size: 0.15,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending,
  sizeAttenuation: true
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// ═══════════════════════════════════════════════════════════════
// GRID FLOOR — Perspective Grid
// ═══════════════════════════════════════════════════════════════
const gridSize = 100;
const gridDivisions = 50;
const gridGeometry = new THREE.BufferGeometry();
const gridPositions = [];

for (let i = -gridDivisions; i <= gridDivisions; i++) {
  const pos = (i / gridDivisions) * gridSize;
  gridPositions.push(pos, 0, -gridSize, pos, 0, gridSize);
  gridPositions.push(-gridSize, 0, pos, gridSize, 0, pos);
}

gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));

const gridMaterial = new THREE.LineBasicMaterial({
  color: 0x1a1a1a,
  transparent: true,
  opacity: 0.5
});

const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
grid.position.y = -5;
scene.add(grid);

// Accent grid lines (lime)
const accentGridGeometry = new THREE.BufferGeometry();
const accentGridPositions = [];
for (let i = -5; i <= 5; i++) {
  const pos = i * 4;
  accentGridPositions.push(pos, 0, -20, pos, 0, 20);
  accentGridPositions.push(-20, 0, pos, 20, 0, pos);
}
accentGridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(accentGridPositions, 3));
const accentGridMaterial = new THREE.LineBasicMaterial({
  color: 0xd8ff3e,
  transparent: true,
  opacity: 0.15
});
const accentGrid = new THREE.LineSegments(accentGridGeometry, accentGridMaterial);
accentGrid.position.y = -5;
scene.add(accentGrid);

// ═══════════════════════════════════════════════════════════════
// FLOATING GEOMETRIC SHAPES — The "World" Objects
// ═══════════════════════════════════════════════════════════════
const shapes = [];
const shapeConfigs = [
  { type: 'octahedron', pos: [15, 3, -10], scale: 2, color: 0xd8ff3e },
  { type: 'icosahedron', pos: [-12, 5, -15], scale: 1.5, color: 0xa8c72d },
  { type: 'torus', pos: [8, -2, -20], scale: 2, color: 0xd8ff3e },
  { type: 'dodecahedron', pos: [-18, 2, -8], scale: 1.2, color: 0xe8ff8c },
  { type: 'torusKnot', pos: [0, 8, -25], scale: 1, color: 0xd8ff3e },
  { type: 'octahedron', pos: [20, -1, -30], scale: 1.8, color: 0xa8c72d },
  { type: 'icosahedron', pos: [-8, 6, -35], scale: 1.3, color: 0xd8ff3e },
  { type: 'torus', pos: [12, 4, -40], scale: 1.5, color: 0xe8ff8c },
];

shapeConfigs.forEach(config => {
  let geometry;
  switch(config.type) {
    case 'octahedron': geometry = new THREE.OctahedronGeometry(1, 0); break;
    case 'icosahedron': geometry = new THREE.IcosahedronGeometry(1, 0); break;
    case 'dodecahedron': geometry = new THREE.DodecahedronGeometry(1, 0); break;
    case 'torus': geometry = new THREE.TorusGeometry(1, 0.3, 16, 100); break;
    case 'torusKnot': geometry = new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16); break;
  }

  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.color,
    emissiveIntensity: 0.3,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...config.pos);
  mesh.scale.setScalar(config.scale);
  mesh.userData = {
    rotSpeed: { x: Math.random() * 0.01, y: Math.random() * 0.01 },
    floatSpeed: Math.random() * 0.5 + 0.3,
    floatOffset: Math.random() * Math.PI * 2,
    baseY: config.pos[1]
  };

  scene.add(mesh);
  shapes.push(mesh);
});

// ═══════════════════════════════════════════════════════════════
// 3D MASCOT — CIPHER (Builder/Analyst)
// ═══════════════════════════════════════════════════════════════
function createCipherMascot() {
  const group = new THREE.Group();

  // Body — Hexagonal prism (tech/builder feel)
  const bodyGeo = new THREE.CylinderGeometry(0.8, 1, 2.5, 6);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x0a0a0a,
    emissiveIntensity: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  group.add(body);

  // Head — Icosahedron (analytical mind)
  const headGeo = new THREE.IcosahedronGeometry(0.7, 1);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.95,
    roughness: 0.05,
    emissive: 0xd8ff3e,
    emissiveIntensity: 0.1
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.8;
  group.add(head);

  // Eyes — Glowing sensors
  const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e,
    emissive: 0xd8ff3e,
    emissiveIntensity: 2
  });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.25, 1.9, 0.55);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.25, 1.9, 0.55);
  group.add(rightEye);

  // Antenna — Data receiver
  const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
  const antennaMat = new THREE.MeshStandardMaterial({
    color: 0x8b8b87,
    metalness: 1,
    roughness: 0.1
  });
  const antenna = new THREE.Mesh(antennaGeo, antennaMat);
  antenna.position.set(0, 2.6, 0);
  group.add(antenna);

  // Antenna tip — Signal light
  const tipGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e,
    emissive: 0xd8ff3e,
    emissiveIntensity: 3
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.set(0, 3.05, 0);
  group.add(tip);

  // Arms — Mechanical
  const armGeo = new THREE.CylinderGeometry(0.08, 0.06, 1.2, 8);
  const armMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.8,
    roughness: 0.2
  });

  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-1.1, 0.3, 0);
  leftArm.rotation.z = Math.PI / 6;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(1.1, 0.3, 0);
  rightArm.rotation.z = -Math.PI / 6;
  group.add(rightArm);

  // Data rings around body
  const ringGeo = new THREE.TorusGeometry(1.3, 0.02, 8, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e,
    emissive: 0xd8ff3e,
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.4
  });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.position.y = 0.5;
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.position.y = -0.3;
  ring2.rotation.x = Math.PI / 2;
  group.add(ring2);

  // Circuit pattern on body (small boxes)
  for (let i = 0; i < 12; i++) {
    const circuitGeo = new THREE.BoxGeometry(0.08, 0.02, 0.15);
    const circuitMat = new THREE.MeshStandardMaterial({
      color: 0xd8ff3e,
      emissive: 0xd8ff3e,
      emissiveIntensity: 0.5
    });
    const circuit = new THREE.Mesh(circuitGeo, circuitMat);
    const angle = (i / 12) * Math.PI * 2;
    circuit.position.set(Math.cos(angle) * 0.82, -0.5 + Math.random() * 1.5, Math.sin(angle) * 0.82);
    group.add(circuit);
  }

  return group;
}

// ═══════════════════════════════════════════════════════════════
// 3D MASCOT — CIPHRA (Dreamer/Artist)
// ═══════════════════════════════════════════════════════════════
function createCiphraMascot() {
  const group = new THREE.Group();

  // Body — Smooth sphere (creative/flowing)
  const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    metalness: 0.3,
    roughness: 0.4,
    emissive: 0x0a0a0a,
    emissiveIntensity: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  body.scale.y = 1.3;
  group.add(body);

  // Head — Larger sphere with artistic feel
  const headGeo = new THREE.SphereGeometry(0.75, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.2,
    roughness: 0.3,
    emissive: 0xd8ff3e,
    emissiveIntensity: 0.05
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.7;
  group.add(head);

  // Eyes — Expressive, slightly larger
  const eyeGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e,
    emissive: 0xd8ff3e,
    emissiveIntensity: 1.5
  });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.28, 1.75, 0.55);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.28, 1.75, 0.55);
  group.add(rightEye);

  // Hair/Crown — Flowing curves (torus knots)
  const hairGeo = new THREE.TorusKnotGeometry(0.5, 0.08, 64, 8, 2, 3);
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e,
    emissive: 0xd8ff3e,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.3,
    transparent: true,
    opacity: 0.7
  });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 2.3, 0);
  hair.scale.setScalar(0.6);
  group.add(hair);

  // Flowing ribbons (artistic elements)
  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.5, 1.5, 0),
    new THREE.Vector3(-1.2, 0.5, 0.3),
    new THREE.Vector3(-0.8, -0.5, -0.2),
    new THREE.Vector3(-1.5, -1.2, 0.1)
  ]);
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 32, 0.04, 8, false);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e,
    emissive: 0xd8ff3e,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.5
  });
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  group.add(ribbon);

  const ribbonCurve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.5, 1.5, 0),
    new THREE.Vector3(1.2, 0.5, -0.3),
    new THREE.Vector3(0.8, -0.5, 0.2),
    new THREE.Vector3(1.5, -1.2, -0.1)
  ]);
  const ribbonGeo2 = new THREE.TubeGeometry(ribbonCurve2, 32, 0.04, 8, false);
  const ribbon2 = new THREE.Mesh(ribbonGeo2, ribbonMat);
  group.add(ribbon2);

  // Floating orbs around (creative sparks)
  for (let i = 0; i < 6; i++) {
    const orbGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xd8ff3e,
      emissive: 0xd8ff3e,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.8
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    const angle = (i / 6) * Math.PI * 2;
    orb.position.set(Math.cos(angle) * 1.5, 0.5 + Math.sin(angle) * 0.5, Math.sin(angle) * 1.5);
    orb.userData = { angle, radius: 1.5, speed: 0.5 + Math.random() * 0.5 };
    group.add(orb);
  }

  return group;
}

// ═══════════════════════════════════════════════════════════════
// PLACE MASCOTS IN SCENE
// ═══════════════════════════════════════════════════════════════
const cipherMascot = createCipherMascot();
cipherMascot.position.set(-8, 0, -5);
cipherMascot.scale.setScalar(0.8);
scene.add(cipherMascot);

const ciphraMascot = createCiphraMascot();
ciphraMascot.position.set(8, 0, -5);
ciphraMascot.scale.setScalar(0.8);
scene.add(ciphraMascot);

// ═══════════════════════════════════════════════════════════════
// GLTF LOADER — Load external mascot models if available
// ═══════════════════════════════════════════════════════════════
const gltfLoader = new GLTFLoader();

// Try to load Cipher GLTF
gltfLoader.load(
  './mascot-cipher.gltf',
  (gltf) => {
    const model = gltf.scene;
    model.position.set(-8, 0, -5);
    model.scale.setScalar(1.5);
    scene.add(model);
    // Remove procedural version
    scene.remove(cipherMascot);
    console.log('✅ Cipher GLTF loaded');
  },
  undefined,
  () => console.log('ℹ️ Using procedural Cipher mascot')
);

// Try to load Ciphra GLTF
gltfLoader.load(
  './mascot-ciphra.gltf',
  (gltf) => {
    const model = gltf.scene;
    model.position.set(8, 0, -5);
    model.scale.setScalar(1.5);
    scene.add(model);
    // Remove procedural version
    scene.remove(ciphraMascot);
    console.log('✅ Ciphra GLTF loaded');
  },
  undefined,
  () => console.log('ℹ️ Using procedural Ciphra mascot')
);

// ═══════════════════════════════════════════════════════════════
// SCROLL-BASED CAMERA MOVEMENT
// ═══════════════════════════════════════════════════════════════
let scrollProgress = 0;
let targetScrollProgress = 0;

const cameraPath = {
  start: { x: 0, y: 5, z: 20 },
  points: [
    { x: 0, y: 3, z: 10 },      // Hero deep dive
    { x: -5, y: 2, z: 5 },      // Statement left
    { x: 5, y: 4, z: 0 },       // Features right
    { x: 0, y: 2, z: -5 },      // About center
    { x: -8, y: 3, z: -2 },     // Mascots - Cipher
    { x: 8, y: 3, z: -2 },      // Mascots - Ciphra
    { x: 0, y: 5, z: -10 },     // Services overview
    { x: -3, y: 2, z: -15 },    // Activity
    { x: 3, y: 3, z: -20 },     // FAQ
    { x: 0, y: 4, z: -25 },     // Join
    { x: 0, y: 6, z: -30 },     // Social
  ]
};

function getCameraPosition(progress) {
  const totalPoints = cameraPath.points.length;
  const scaledProgress = progress * (totalPoints - 1);
  const index = Math.floor(scaledProgress);
  const t = scaledProgress - index;

  const p1 = cameraPath.points[Math.min(index, totalPoints - 1)];
  const p2 = cameraPath.points[Math.min(index + 1, totalPoints - 1)];

  return {
    x: p1.x + (p2.x - p1.x) * t,
    y: p1.y + (p2.y - p1.y) * t,
    z: p1.z + (p2.z - p1.z) * t
  };
}

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  targetScrollProgress = Math.min(scrollTop / docHeight, 1);
}, { passive: true });

// ═══════════════════════════════════════════════════════════════
// MOUSE INTERACTION — Camera subtle parallax
// ═══════════════════════════════════════════════════════════════
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ═══════════════════════════════════════════════════════════════
// ANIMATION LOOP
// ═══════════════════════════════════════════════════════════════
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  const delta = clock.getDelta();

  // Smooth scroll progress
  scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;

  // Smooth mouse
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  // Camera movement based on scroll
  const camPos = getCameraPosition(scrollProgress);
  camera.position.x = camPos.x + mouseX * 2;
  camera.position.y = camPos.y + mouseY * 1;
  camera.position.z = camPos.z;

  // Camera look at center with slight offset
  camera.lookAt(
    mouseX * 3,
    mouseY * 2 + 1,
    -10 + scrollProgress * 20
  );

  // Animate particles
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
    positions[i * 3] += Math.cos(time * 0.3 + i * 0.1) * 0.001;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.02;

  // Animate shapes
  shapes.forEach((shape, i) => {
    shape.rotation.x += shape.userData.rotSpeed.x;
    shape.rotation.y += shape.userData.rotSpeed.y;
    shape.position.y = shape.userData.baseY + 
      Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.5;
  });

  // Animate mascots
  cipherMascot.rotation.y = Math.sin(time * 0.5) * 0.3;
  cipherMascot.position.y = Math.sin(time * 0.8) * 0.2;

  ciphraMascot.rotation.y = Math.sin(time * 0.5 + Math.PI) * 0.3;
  ciphraMascot.position.y = Math.sin(time * 0.8 + 1) * 0.2;

  // Animate Ciphra's floating orbs
  ciphraMascot.children.forEach(child => {
    if (child.userData.angle !== undefined) {
      const angle = child.userData.angle + time * child.userData.speed;
      child.position.x = Math.cos(angle) * child.userData.radius;
      child.position.z = Math.sin(angle) * child.userData.radius;
      child.position.y = 0.5 + Math.sin(angle * 2) * 0.3;
    }
  });

  // Animate accent light
  accentLight.position.x = Math.sin(time * 0.5) * 15;
  accentLight.position.z = Math.cos(time * 0.5) * 15;

  // Grid pulse effect
  accentGridMaterial.opacity = 0.1 + Math.sin(time * 2) * 0.05;

  // Render with post-processing
  composer.render();
}

animate();

// ═══════════════════════════════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════════════════════════════
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ═══════════════════════════════════════════════════════════════
// 3D MASCOT PREVIEW IN CARDS
// ═══════════════════════════════════════════════════════════════
function createMiniMascotScene(containerId, mascotType) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const miniScene = new THREE.Scene();
  const miniCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  miniCamera.position.set(0, 1, 4);

  const miniRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  const size = container.offsetWidth || 140;
  miniRenderer.setSize(size, size);
  miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(miniRenderer.domElement);

  const miniLight = new THREE.DirectionalLight(0xd8ff3e, 2);
  miniLight.position.set(2, 3, 2);
  miniScene.add(miniLight);
  miniScene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const mascot = mascotType === 'cipher' ? createCipherMascot() : createCiphraMascot();
  mascot.scale.setScalar(0.6);
  miniScene.add(mascot);

  function animateMini() {
    requestAnimationFrame(animateMini);
    mascot.rotation.y += 0.01;
    miniRenderer.render(miniScene, miniCamera);
  }
  animateMini();
}

// Initialize mini mascot previews after loader
setTimeout(() => {
  createMiniMascotScene('cipher-preview', 'cipher');
  createMiniMascotScene('ciphra-preview', 'ciphra');
}, 2500);

console.log('🎨 SOCIETY 3D — Scene Loaded');
