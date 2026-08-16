/* SOCIETY 3D — FAQ Page Scene */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 18);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.4, 0.3);
composer.addPass(bloomPass);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const mainLight = new THREE.DirectionalLight(0xd8ff3e, 1.2);
mainLight.position.set(10, 20, 10);
scene.add(mainLight);

// Minimal particles
const particleCount = 400;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 80;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
  color: 0xd8ff3e, size: 0.08, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, sizeAttenuation: true
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
const grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.3 }));
grid.position.y = -5;
scene.add(grid);

// Floating question mark shapes (abstract)
const shapes = [];
for (let i = 0; i < 6; i++) {
  const geo = new THREE.TorusKnotGeometry(0.6, 0.15, 64, 8, 2, 3);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 0.2,
    metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.5, wireframe: true
  });
  const mesh = new THREE.Mesh(geo, mat);
  const angle = (i / 6) * Math.PI * 2;
  mesh.position.set(Math.cos(angle) * 12, Math.sin(i) * 3 + 2, Math.sin(angle) * 12 - 10);
  mesh.userData = {
    rotSpeed: { x: Math.random() * 0.005, y: Math.random() * 0.008 },
    floatSpeed: Math.random() * 0.3 + 0.2,
    floatOffset: Math.random() * Math.PI * 2,
    baseY: Math.sin(i) * 3 + 2
  };
  scene.add(mesh);
  shapes.push(mesh);
}

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
  camera.position.y = 3 + mouseY * 1 - scrollProgress * 3;
  camera.position.z = 18 - scrollProgress * 8;
  camera.lookAt(0, 1, -5);

  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += Math.sin(time * 0.3 + i) * 0.001;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.01;

  shapes.forEach((shape) => {
    shape.rotation.x += shape.userData.rotSpeed.x;
    shape.rotation.y += shape.userData.rotSpeed.y;
    shape.position.y = shape.userData.baseY + Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.3;
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

console.log('❓ SOCIETY 3D — FAQ Scene Loaded');
