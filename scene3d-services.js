/* SOCIETY 3D — Services Page Scene */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.018);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 15);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.4, 0.25);
composer.addPass(bloomPass);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const mainLight = new THREE.DirectionalLight(0xd8ff3e, 1.5);
mainLight.position.set(10, 20, 10);
scene.add(mainLight);
scene.add(new THREE.PointLight(0xd8ff3e, 2, 50).position.set(-10, 10, -10));

// Particles
const particleCount = 600;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 80;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
  color: 0xd8ff3e, size: 0.1, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, sizeAttenuation: true
}));
scene.add(particles);

// Grid
const gridPositions = [];
for (let i = -40; i <= 40; i++) {
  const pos = i * 2;
  gridPositions.push(pos, 0, -80, pos, 0, 80);
  gridPositions.push(-80, 0, pos, 80, 0, pos);
}
const gridGeo = new THREE.BufferGeometry();
gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
const grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.4 }));
grid.position.y = -5;
scene.add(grid);

// Service-themed 3D shapes - 4 main shapes representing 4 services
const serviceShapes = [];
const serviceConfigs = [
  { pos: [-8, 2, -5], type: 'lightning', color: 0xd8ff3e },      // Alpha Calls
  { pos: [-3, 4, -8], type: 'clock', color: 0xa8c72d },          // Airdrop
  { pos: [3, 1, -6], type: 'group', color: 0xd8ff3e },           // X Raid
  { pos: [8, 3, -4], type: 'book', color: 0xe8ff8c },            // News
];

serviceConfigs.forEach(config => {
  let geometry;
  switch(config.type) {
    case 'lightning': geometry = new THREE.ConeGeometry(0.8, 2, 6); break;
    case 'clock': geometry = new THREE.TorusGeometry(1, 0.2, 16, 32); break;
    case 'group': geometry = new THREE.OctahedronGeometry(1, 0); break;
    case 'book': geometry = new THREE.BoxGeometry(1.5, 2, 0.3); break;
  }
  const material = new THREE.MeshStandardMaterial({
    color: config.color, emissive: config.color, emissiveIntensity: 0.4,
    metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.85
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...config.pos);
  mesh.userData = {
    rotSpeed: { x: Math.random() * 0.008, y: Math.random() * 0.012 },
    floatSpeed: Math.random() * 0.4 + 0.3,
    floatOffset: Math.random() * Math.PI * 2,
    baseY: config.pos[1]
  };
  scene.add(mesh);
  serviceShapes.push(mesh);

  // Add ring around each service shape
  const ringGeo = new THREE.TorusGeometry(1.8, 0.03, 8, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: config.color, emissive: config.color, emissiveIntensity: 0.6, transparent: true, opacity: 0.3
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(...config.pos);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
  serviceShapes.push(ring);
});

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

  camera.position.x = mouseX * 2;
  camera.position.y = 4 + mouseY * 1 - scrollProgress * 4;
  camera.position.z = 15 - scrollProgress * 8;
  camera.lookAt(0, 2, -5);

  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.02;

  serviceShapes.forEach((shape, i) => {
    if (shape.geometry.type !== 'TorusGeometry') {
      shape.rotation.x += shape.userData.rotSpeed.x;
      shape.rotation.y += shape.userData.rotSpeed.y;
    } else {
      shape.rotation.z = time * 0.3 + i;
    }
    if (shape.userData.baseY !== undefined) {
      shape.position.y = shape.userData.baseY + Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.4;
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

console.log('⚡ SOCIETY 3D — Services Scene Loaded');
