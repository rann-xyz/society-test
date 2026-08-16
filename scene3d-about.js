/* SOCIETY 3D — About Page Scene */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.012);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.9, 0.6, 0.15);
composer.addPass(bloomPass);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const mainLight = new THREE.DirectionalLight(0xd8ff3e, 2);
mainLight.position.set(5, 15, 10);
scene.add(mainLight);

const accentLight = new THREE.PointLight(0xd8ff3e, 3, 60);
accentLight.position.set(-5, 8, -5);
scene.add(accentLight);

const fillLight = new THREE.PointLight(0x4a4a4a, 1, 50);
fillLight.position.set(10, -3, 10);
scene.add(fillLight);

// Particles
const particleCount = 500;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 60;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
  color: 0xd8ff3e, size: 0.12, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, sizeAttenuation: true
}));
scene.add(particles);

// Grid
const gridPositions = [];
for (let i = -30; i <= 30; i++) {
  const pos = i * 2;
  gridPositions.push(pos, 0, -60, pos, 0, 60);
  gridPositions.push(-60, 0, pos, 60, 0, pos);
}
const gridGeo = new THREE.BufferGeometry();
gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
const grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.4 }));
grid.position.y = -4;
scene.add(grid);

// Activity Globe
const globeGroup = new THREE.Group();
const globeGeo = new THREE.IcosahedronGeometry(3, 3);
const globeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, wireframe: true, transparent: true, opacity: 0.3 });
const globe = new THREE.Mesh(globeGeo, globeMat);
globeGroup.add(globe);

for (let i = 0; i < 50; i++) {
  const phi = Math.acos(-1 + (2 * i) / 50);
  const theta = Math.sqrt(50 * Math.PI) * phi;
  const x = 3.1 * Math.cos(theta) * Math.sin(phi);
  const y = 3.1 * Math.sin(theta) * Math.sin(phi);
  const z = 3.1 * Math.cos(phi);
  const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const dotMat = new THREE.MeshStandardMaterial({ color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 2 });
  const dot = new THREE.Mesh(dotGeo, dotMat);
  dot.position.set(x, y, z);
  globeGroup.add(dot);
}

globeGroup.position.set(0, 2, -8);
scene.add(globeGroup);

// MASCOTS
function createCipherMascot() {
  const group = new THREE.Group();
  const bodyGeo = new THREE.CylinderGeometry(0.8, 1, 2.5, 6);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.1, emissive: 0x0a0a0a, emissiveIntensity: 0.2 });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));
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
cipherMascot.position.set(-6, -1, -3);
cipherMascot.scale.setScalar(1.2);
scene.add(cipherMascot);

const ciphraMascot = createCiphraMascot();
ciphraMascot.position.set(6, -1, -3);
ciphraMascot.scale.setScalar(1.2);
scene.add(ciphraMascot);

// GLTF Loader
const gltfLoader = new GLTFLoader();
gltfLoader.load('./mascot-cipher.gltf', (gltf) => {
  const model = gltf.scene;
  model.position.set(-6, -1, -3);
  model.scale.setScalar(2);
  scene.add(model);
  scene.remove(cipherMascot);
}, undefined, () => {});
gltfLoader.load('./mascot-ciphra.gltf', (gltf) => {
  const model = gltf.scene;
  model.position.set(6, -1, -3);
  model.scale.setScalar(2);
  scene.add(model);
  scene.remove(ciphraMascot);
}, undefined, () => {});

// Scroll
let scrollProgress = 0, targetScrollProgress = 0;
window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  targetScrollProgress = Math.min(window.scrollY / docHeight, 1);
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

  camera.position.x = mouseX * 3;
  camera.position.y = 3 + mouseY * 1.5 - scrollProgress * 5;
  camera.position.z = 12 - scrollProgress * 10;
  camera.lookAt(0, 1 + scrollProgress * 2, -5);

  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.015;

  globeGroup.rotation.y = time * 0.3;
  globeGroup.rotation.x = Math.sin(time * 0.2) * 0.1;

  cipherMascot.rotation.y = Math.sin(time * 0.5) * 0.3;
  cipherMascot.position.y = -1 + Math.sin(time * 0.8) * 0.2;
  ciphraMascot.rotation.y = Math.sin(time * 0.5 + Math.PI) * 0.3;
  ciphraMascot.position.y = -1 + Math.sin(time * 0.8 + 1) * 0.2;
  ciphraMascot.children.forEach(child => {
    if (child.userData.angle !== undefined) {
      const angle = child.userData.angle + time * child.userData.speed;
      child.position.x = Math.cos(angle) * child.userData.radius;
      child.position.z = Math.sin(angle) * child.userData.radius;
      child.position.y = 0.5 + Math.sin(angle * 2) * 0.3;
    }
  });

  composer.render();
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Mini mascot previews
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

setTimeout(() => {
  createMiniMascotScene('cipher-preview', 'cipher');
  createMiniMascotScene('ciphra-preview', 'ciphra');
}, 2500);

console.log('👥 SOCIETY 3D — About Scene Loaded');
