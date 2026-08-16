/* SOCIETY 3D — Home Page Scene */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.5, 0.2);
composer.addPass(bloomPass);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const mainLight = new THREE.DirectionalLight(0xd8ff3e, 1.5);
mainLight.position.set(10, 20, 10);
scene.add(mainLight);

const accentLight = new THREE.PointLight(0xd8ff3e, 2, 50);
accentLight.position.set(-10, 10, -10);
scene.add(accentLight);

const fillLight = new THREE.PointLight(0x4a4a4a, 1, 50);
fillLight.position.set(10, -5, 10);
scene.add(fillLight);

// ═══════════════════════════════════════════════════════════════
// 3D SOCIETY LOGO — Floating in hero
// ═══════════════════════════════════════════════════════════════
function createSocietyLogo3D() {
  const group = new THREE.Group();

  // S shape built from boxes
  const logoMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 0.4,
    metalness: 0.9, roughness: 0.1
  });

  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 2,
    transparent: true, opacity: 0.15
  });

  // Top bar
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 0.5), logoMat);
  topBar.position.set(0, 1.5, 0);
  group.add(topBar);

  // Top-left diagonal
  const topLeft = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.5), logoMat);
  topLeft.position.set(-1.2, 1, 0);
  topLeft.rotation.z = Math.PI / 4;
  group.add(topLeft);

  // Middle bar
  const midBar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 0.5), logoMat);
  midBar.position.set(0, 0.2, 0);
  group.add(midBar);

  // Bottom-right diagonal
  const botRight = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.5), logoMat);
  botRight.position.set(1.2, -0.6, 0);
  botRight.rotation.z = Math.PI / 4;
  group.add(botRight);

  // Bottom bar
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 0.5), logoMat);
  botBar.position.set(0, -1.1, 0);
  group.add(botBar);

  // Glow sphere behind
  const glow = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), glowMat);
  glow.position.set(0, 0, -1);
  group.add(glow);

  return group;
}

const logo3D = createSocietyLogo3D();
logo3D.position.set(8, 2, -5);
logo3D.scale.setScalar(1.2);
scene.add(logo3D);

// ═══════════════════════════════════════════════════════════════
// PARTICLES
// ═══════════════════════════════════════════════════════════════
const particleCount = 800;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 100;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 60;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
  color: 0xd8ff3e, size: 0.15, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, sizeAttenuation: true
}));
scene.add(particles);

// Grid
const gridSize = 100, gridDivisions = 50;
const gridPositions = [];
for (let i = -gridDivisions; i <= gridDivisions; i++) {
  const pos = (i / gridDivisions) * gridSize;
  gridPositions.push(pos, 0, -gridSize, pos, 0, gridSize);
  gridPositions.push(-gridSize, 0, pos, gridSize, 0, pos);
}
const gridGeo = new THREE.BufferGeometry();
gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
const grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.5 }));
grid.position.y = -5;
scene.add(grid);

// Accent grid
const accentGridPositions = [];
for (let i = -5; i <= 5; i++) {
  const pos = i * 4;
  accentGridPositions.push(pos, 0, -20, pos, 0, 20);
  accentGridPositions.push(-20, 0, pos, 20, 0, pos);
}
const accentGridGeo = new THREE.BufferGeometry();
accentGridGeo.setAttribute('position', new THREE.Float32BufferAttribute(accentGridPositions, 3));
const accentGridMat = new THREE.LineBasicMaterial({ color: 0xd8ff3e, transparent: true, opacity: 0.15 });
const accentGrid = new THREE.LineSegments(accentGridGeo, accentGridMat);
accentGrid.position.y = -5;
scene.add(accentGrid);

// Floating shapes
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
    color: config.color, emissive: config.color, emissiveIntensity: 0.3,
    metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.9
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
// MASCOTS
// ═══════════════════════════════════════════════════════════════
function createCipherMascot() {
  const group = new THREE.Group();
  const bodyGeo = new THREE.CylinderGeometry(0.8, 1, 2.5, 6);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.1, emissive: 0x0a0a0a, emissiveIntensity: 0.2 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  group.add(body);
  const headGeo = new THREE.IcosahedronGeometry(0.7, 1);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.95, roughness: 0.05, emissive: 0xd8ff3e, emissiveIntensity: 0.1 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.8;
  group.add(head);
  const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 2 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.25, 1.9, 0.55);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.25, 1.9, 0.55);
  group.add(rightEye);
  const antennaGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0x8b8b87, metalness: 1, roughness: 0.1 });
  const antenna = new THREE.Mesh(antennaGeo, antennaMat);
  antenna.position.set(0, 2.6, 0);
  group.add(antenna);
  const tipGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const tipMat = new THREE.MeshStandardMaterial({ color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 3 });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.set(0, 3.05, 0);
  group.add(tip);
  const ringGeo = new THREE.TorusGeometry(1.3, 0.02, 8, 64);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 1, transparent: true, opacity: 0.4 });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.position.y = 0.5;
  ring1.rotation.x = Math.PI / 2;
  group.add(ring1);
  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.position.y = -0.3;
  ring2.rotation.x = Math.PI / 2;
  group.add(ring2);
  return group;
}

function createCiphraMascot() {
  const group = new THREE.Group();
  const bodyGeo = new THREE.SphereGeometry(1, 32, 32);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.4, emissive: 0x0a0a0a, emissiveIntensity: 0.1 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0;
  body.scale.y = 1.3;
  group.add(body);
  const headGeo = new THREE.SphereGeometry(0.75, 32, 32);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.3, emissive: 0xd8ff3e, emissiveIntensity: 0.05 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.7;
  group.add(head);
  const eyeGeo = new THREE.SphereGeometry(0.15, 16, 16);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 1.5 });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.28, 1.75, 0.55);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.28, 1.75, 0.55);
  group.add(rightEye);
  const hairGeo = new THREE.TorusKnotGeometry(0.5, 0.08, 64, 8, 2, 3);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.7 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 2.3, 0);
  hair.scale.setScalar(0.6);
  group.add(hair);
  for (let i = 0; i < 6; i++) {
    const orbGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const orbMat = new THREE.MeshStandardMaterial({ color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 2, transparent: true, opacity: 0.8 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    const angle = (i / 6) * Math.PI * 2;
    orb.position.set(Math.cos(angle) * 1.5, 0.5 + Math.sin(angle) * 0.5, Math.sin(angle) * 1.5);
    orb.userData = { angle, radius: 1.5, speed: 0.5 + Math.random() * 0.5 };
    group.add(orb);
  }
  return group;
}

const cipherMascot = createCipherMascot();
cipherMascot.position.set(-8, 0, -5);
cipherMascot.scale.setScalar(0.8);
scene.add(cipherMascot);

const ciphraMascot = createCiphraMascot();
ciphraMascot.position.set(8, 0, -5);
ciphraMascot.scale.setScalar(0.8);
scene.add(ciphraMascot);

// Scroll
let scrollProgress = 0, targetScrollProgress = 0;
const cameraPath = {
  points: [
    { x: 0, y: 5, z: 20 }, { x: 0, y: 3, z: 10 }, { x: -5, y: 2, z: 5 },
    { x: 5, y: 4, z: 0 }, { x: 0, y: 2, z: -5 }, { x: -8, y: 3, z: -2 },
    { x: 8, y: 3, z: -2 }, { x: 0, y: 5, z: -10 }, { x: -3, y: 2, z: -15 },
    { x: 3, y: 3, z: -20 }, { x: 0, y: 4, z: -25 }, { x: 0, y: 6, z: -30 },
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

let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;
  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;
  const camPos = getCameraPosition(scrollProgress);
  camera.position.x = camPos.x + mouseX * 2;
  camera.position.y = camPos.y + mouseY * 1;
  camera.position.z = camPos.z;
  camera.lookAt(mouseX * 3, mouseY * 2 + 1, -10 + scrollProgress * 20);

  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
    positions[i * 3] += Math.cos(time * 0.3 + i * 0.1) * 0.001;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.02;

  shapes.forEach((shape) => {
    shape.rotation.x += shape.userData.rotSpeed.x;
    shape.rotation.y += shape.userData.rotSpeed.y;
    shape.position.y = shape.userData.baseY + Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.5;
  });

  logo3D.rotation.y = time * 0.3;
  logo3D.position.y = 2 + Math.sin(time * 0.8) * 0.3;

  cipherMascot.rotation.y = Math.sin(time * 0.5) * 0.3;
  cipherMascot.position.y = Math.sin(time * 0.8) * 0.2;
  ciphraMascot.rotation.y = Math.sin(time * 0.5 + Math.PI) * 0.3;
  ciphraMascot.position.y = Math.sin(time * 0.8 + 1) * 0.2;
  ciphraMascot.children.forEach(child => {
    if (child.userData.angle !== undefined) {
      const angle = child.userData.angle + time * child.userData.speed;
      child.position.x = Math.cos(angle) * child.userData.radius;
      child.position.z = Math.sin(angle) * child.userData.radius;
      child.position.y = 0.5 + Math.sin(angle * 2) * 0.3;
    }
  });

  accentGridMat.opacity = 0.1 + Math.sin(time * 2) * 0.05;

  composer.render();
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🏠 SOCIETY 3D — Home Scene Loaded');
