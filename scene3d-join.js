/* SOCIETY 3D — Join Page Scene */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.FogExp2(0x050505, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 16);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.0, 0.6, 0.15);
composer.addPass(bloomPass);

scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const mainLight = new THREE.DirectionalLight(0xd8ff3e, 1.8);
mainLight.position.set(10, 20, 10);
scene.add(mainLight);

const centerLight = new THREE.PointLight(0xd8ff3e, 3, 60);
centerLight.position.set(0, 5, 0);
scene.add(centerLight);

const accentLight2 = new THREE.PointLight(0xa8c72d, 2, 40);
accentLight2.position.set(-10, 8, -10);
scene.add(accentLight2);

// Particles
const particleCount = 700;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = (Math.random() - 0.5) * 80;
  particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
  particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
  color: 0xd8ff3e, size: 0.12, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, sizeAttenuation: true
}));
scene.add(particles);

// Grid
const gridPositions = [];
for (let i = -35; i <= 35; i++) {
  const pos = i * 2;
  gridPositions.push(pos, 0, -70, pos, 0, 70);
  gridPositions.push(-70, 0, pos, 70, 0, pos);
}
const gridGeo = new THREE.BufferGeometry();
gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(gridPositions, 3));
const grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.4 }));
grid.position.y = -5;
scene.add(grid);

// Social platform cubes
const socialCubes = [];
const platforms = [
  { name: 'X', color: 0xd8ff3e, pos: [8, 3, -5] },
  { name: 'Discord', color: 0xa8c72d, pos: [-8, 5, -8] },
  { name: 'Instagram', color: 0xe8ff8c, pos: [5, -1, -12] },
  { name: 'Telegram', color: 0xd8ff3e, pos: [-5, 2, -15] },
];

platforms.forEach((plat, i) => {
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const mat = new THREE.MeshStandardMaterial({
    color: plat.color, emissive: plat.color, emissiveIntensity: 0.5,
    metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.9
  });
  const cube = new THREE.Mesh(geo, mat);
  group.add(cube);

  const ringGeo = new THREE.TorusGeometry(1.2, 0.04, 8, 64);
  const ringMat = new THREE.MeshStandardMaterial({
    color: plat.color, emissive: plat.color, emissiveIntensity: 1.5, transparent: true, opacity: 0.5
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  group.position.set(...plat.pos);
  group.userData = {
    rotSpeed: { x: Math.random() * 0.01, y: Math.random() * 0.015 },
    floatSpeed: Math.random() * 0.4 + 0.3,
    floatOffset: Math.random() * Math.PI * 2,
    baseY: plat.pos[1],
    orbitRadius: Math.sqrt(plat.pos[0]**2 + plat.pos[2]**2),
    orbitAngle: Math.atan2(plat.pos[2], plat.pos[0]),
    orbitSpeed: 0.1 + Math.random() * 0.1
  };
  scene.add(group);
  socialCubes.push(group);
});

// Central glow sphere
const centerGeo = new THREE.SphereGeometry(0.5, 32, 32);
const centerMat = new THREE.MeshStandardMaterial({
  color: 0xd8ff3e, emissive: 0xd8ff3e, emissiveIntensity: 3,
  transparent: true, opacity: 0.8
});
const centerSphere = new THREE.Mesh(centerGeo, centerMat);
centerSphere.position.set(0, 3, -8);
scene.add(centerSphere);

// Connecting lines
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xd8ff3e, transparent: true, opacity: 0.15 });
platforms.forEach(plat => {
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 3, -8),
    new THREE.Vector3(...plat.pos)
  ]);
  scene.add(new THREE.Line(lineGeo, lineMaterial));
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
  camera.position.z = 16 - scrollProgress * 8;
  camera.lookAt(0, 2, -5);

  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.002;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.02;

  socialCubes.forEach((group) => {
    group.children[0].rotation.x += group.userData.rotSpeed.x;
    group.children[0].rotation.y += group.userData.rotSpeed.y;
    group.children[1].rotation.z = time * 0.5;

    const angle = group.userData.orbitAngle + time * group.userData.orbitSpeed;
    group.position.x = Math.cos(angle) * group.userData.orbitRadius;
    group.position.z = Math.sin(angle) * group.userData.orbitRadius - 8;
    group.position.y = group.userData.baseY + Math.sin(time * group.userData.floatSpeed + group.userData.floatOffset) * 0.5;
  });

  centerSphere.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
  centerSphere.material.emissiveIntensity = 3 + Math.sin(time * 3) * 1;

  composer.render();
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🤝 SOCIETY 3D — Join Scene Loaded');
