import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020204, 0.0008);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.2;

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2, 0.4, 0.85
);

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// GALAXY
function createGalaxy() {
  const params = { count: 15000, size: 0.15, radius: 80, branches: 5, spin: 1.2, randomness: 0.4, randomnessPower: 2.5, insideColor: '#d8ff3e', outsideColor: '#1a0a40' };
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);
  const colorInside = new THREE.Color(params.insideColor);
  const colorOutside = new THREE.Color(params.outsideColor);

  for (let i = 0; i < params.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * params.radius;
    const spinAngle = radius * params.spin;
    const branchAngle = (i % params.branches) / params.branches * Math.PI * 2;
    const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;
    const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius * 0.3;
    const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * params.randomness * radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / params.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.15, sizeAttenuation: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true, transparent: true, opacity: 0.9
  });

  const galaxy = new THREE.Points(geometry, material);
  galaxy.rotation.x = Math.PI * 0.15;
  scene.add(galaxy);
  return galaxy;
}
const galaxy = createGalaxy();

// STARS
function createStarfield() {
  const starCount = 8000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 300 + Math.random() * 400;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = r * Math.cos(phi);
    const starColor = new THREE.Color();
    const hue = Math.random() > 0.7 ? 0.2 + Math.random() * 0.1 : Math.random() * 0.1 + 0.55;
    starColor.setHSL(hue, 0.3 + Math.random() * 0.4, 0.5 + Math.random() * 0.5);
    colors[i3] = starColor.r;
    colors[i3 + 1] = starColor.g;
    colors[i3 + 2] = starColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.4, sizeAttenuation: true, depthWrite: false,
    blending: THREE.AdditiveBlending, vertexColors: true, transparent: true, opacity: 0.8
  });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}
const starfield = createStarfield();

// NEBULA
function createNebula() {
  const nebulaGroup = new THREE.Group();
  const nebulaColors = [
    { color: 0x4a0080, pos: [-60, 30, -80], scale: 40 },
    { color: 0x0066cc, pos: [70, -20, -100], scale: 50 },
    { color: 0x1a0040, pos: [0, 50, -120], scale: 60 },
    { color: 0x0d3320, pos: [-40, -40, -90], scale: 35 },
    { color: 0x3d1a00, pos: [50, 40, -70], scale: 30 }
  ];
  nebulaColors.forEach(n => {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: n.color, transparent: true, opacity: 0.04,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...n.pos);
    mesh.scale.setScalar(n.scale);
    nebulaGroup.add(mesh);
  });
  scene.add(nebulaGroup);
  return nebulaGroup;
}
const nebula = createNebula();

// FLOATING 3D S
function createFloatingS() {
  const sGroup = new THREE.Group();
  const points = [];
  const curve1 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-3, 4, 0), new THREE.Vector3(3, 4, 0),
    new THREE.Vector3(3, 1, 0), new THREE.Vector3(0, 1, 0)
  );
  const curve2 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(-3, 1, 0),
    new THREE.Vector3(-3, -2, 0), new THREE.Vector3(0, -2, 0)
  );
  const curve3 = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, -2, 0), new THREE.Vector3(3, -2, 0),
    new THREE.Vector3(3, -5, 0), new THREE.Vector3(-3, -5, 0)
  );
  points.push(...curve1.getPoints(20), ...curve2.getPoints(20), ...curve3.getPoints(20));

  const sGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, 0.6, 12, false);
  const sMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8ff3e, emissive: 0x88cc00, emissiveIntensity: 0.6,
    metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.95
  });
  const sMesh = new THREE.Mesh(sGeometry, sMaterial);
  sGroup.add(sMesh);

  const glowGeometry = new THREE.SphereGeometry(8, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xd8ff3e, transparent: true, opacity: 0.03,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  sGroup.add(glowMesh);

  const ringGeometry = new THREE.TorusGeometry(7, 0.05, 16, 100);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xd8ff3e, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending
  });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.rotation.x = Math.PI * 0.5;
  sGroup.add(ringMesh);

  sGroup.position.set(15, 5, -20);
  sGroup.scale.setScalar(0.8);
  scene.add(sGroup);
  return { group: sGroup, mesh: sMesh, glow: glowMesh, ring: ringMesh };
}
const floatingS = createFloatingS();

// FLOATING SOCIETY TEXT 1
function createFloatingSocietyText() {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  c.width = 1024; c.height = 256;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = 'bold 180px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#d8ff3e'; ctx.shadowBlur = 60;
  ctx.fillStyle = 'rgba(216, 255, 62, 0.8)';
  ctx.fillText('SOCIETY', c.width / 2, c.height / 2);
  ctx.shadowBlur = 30; ctx.fillStyle = 'rgba(216, 255, 62, 0.9)';
  ctx.fillText('SOCIETY', c.width / 2, c.height / 2);
  ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff';
  ctx.fillText('SOCIETY', c.width / 2, c.height / 2);

  const texture = new THREE.CanvasTexture(c);
  const geometry = new THREE.PlaneGeometry(40, 10);
  const material = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, opacity: 0.08,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  const textMesh = new THREE.Mesh(geometry, material);
  textMesh.position.set(0, -15, -60);
  textMesh.rotation.x = -0.1;
  scene.add(textMesh);
  return textMesh;
}
const societyText = createFloatingSocietyText();

// FLOATING SOCIETY TEXT 2
function createFloatingSocietyText2() {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  c.width = 1024; c.height = 256;
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = 'bold 140px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = '#88ff00'; ctx.shadowBlur = 40;
  ctx.fillStyle = 'rgba(136, 255, 0, 0.3)';
  ctx.fillText('SOCIETY', c.width / 2, c.height / 2);

  const texture = new THREE.CanvasTexture(c);
  const geometry = new THREE.PlaneGeometry(50, 12);
  const material = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, opacity: 0.04,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
  });
  const textMesh = new THREE.Mesh(geometry, material);
  textMesh.position.set(-20, 20, -80);
  textMesh.rotation.y = 0.3; textMesh.rotation.x = 0.1;
  scene.add(textMesh);
  return textMesh;
}
const societyText2 = createFloatingSocietyText2();

// FLOATING SHAPES
function createFloatingShapes() {
  const shapes = [];
  const geometries = [
    new THREE.OctahedronGeometry(0.8, 0),
    new THREE.IcosahedronGeometry(0.6, 0),
    new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8),
    new THREE.DodecahedronGeometry(0.7, 0),
    new THREE.TetrahedronGeometry(0.9, 0)
  ];
  for (let i = 0; i < 12; i++) {
    const geometry = geometries[i % geometries.length];
    const material = new THREE.MeshStandardMaterial({
      color: i % 3 === 0 ? 0xd8ff3e : 0x444444,
      emissive: i % 3 === 0 ? 0x88aa00 : 0x000000,
      emissiveIntensity: i % 3 === 0 ? 0.4 : 0,
      metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 60 - 20);
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    const shapeData = {
      mesh, rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.01 },
      floatSpeed: 0.5 + Math.random() * 1.5, floatOffset: Math.random() * Math.PI * 2, baseY: mesh.position.y
    };
    shapes.push(shapeData);
    scene.add(mesh);
  }
  return shapes;
}
const floatingShapes = createFloatingShapes();

// LIGHTS
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const pointLight1 = new THREE.PointLight(0xd8ff3e, 2, 100);
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);
const pointLight2 = new THREE.PointLight(0x4466ff, 1, 100);
pointLight2.position.set(-20, -10, -20);
scene.add(pointLight2);
const pointLight3 = new THREE.PointLight(0xff4466, 0.8, 100);
pointLight3.position.set(30, -20, -30);
scene.add(pointLight3);

// MOUSE
let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
document.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ANIMATION
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  mouseX += (targetMouseX - mouseX) * 0.05;
  mouseY += (targetMouseY - mouseY) * 0.05;

  galaxy.rotation.y = elapsedTime * 0.03;
  galaxy.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05;
  starfield.rotation.y = elapsedTime * 0.005;
  starfield.rotation.x = Math.sin(elapsedTime * 0.02) * 0.02;

  nebula.children.forEach((cloud, i) => {
    cloud.rotation.y = elapsedTime * 0.02 * (i % 2 === 0 ? 1 : -1);
  });

  floatingS.group.position.y = 5 + Math.sin(elapsedTime * 1.2) * 2;
  floatingS.group.rotation.y = elapsedTime * 0.5;
  floatingS.group.rotation.x = Math.sin(elapsedTime * 0.7) * 0.15;
  floatingS.ring.rotation.x = Math.PI * 0.5 + Math.sin(elapsedTime) * 0.1;
  floatingS.ring.rotation.y = elapsedTime * 0.3;
  floatingS.glow.scale.setScalar(1 + Math.sin(elapsedTime * 2) * 0.1);
  floatingS.glow.material.opacity = 0.02 + Math.sin(elapsedTime * 1.5) * 0.015;

  floatingShapes.forEach((shape) => {
    shape.mesh.rotation.x += shape.rotSpeed.x;
    shape.mesh.rotation.y += shape.rotSpeed.y;
    shape.mesh.rotation.z += shape.rotSpeed.z;
    shape.mesh.position.y = shape.baseY + Math.sin(elapsedTime * shape.floatSpeed + shape.floatOffset) * 2;
  });

  societyText.position.y = -15 + Math.sin(elapsedTime * 0.8) * 1.5;
  societyText.rotation.y = Math.sin(elapsedTime * 0.3) * 0.05;
  societyText.material.opacity = 0.06 + Math.sin(elapsedTime * 0.5) * 0.03;

  societyText2.position.y = 20 + Math.sin(elapsedTime * 0.6 + 1) * 2;
  societyText2.rotation.y = 0.3 + Math.sin(elapsedTime * 0.2) * 0.05;
  societyText2.material.opacity = 0.03 + Math.sin(elapsedTime * 0.4 + 2) * 0.02;

  camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, -30);

  pointLight1.position.x = 10 + Math.sin(elapsedTime * 0.5) * 5;
  pointLight1.position.z = 10 + Math.cos(elapsedTime * 0.5) * 5;

  composer.render();
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth, window.innerHeight);
});

console.log('SOCIETY Galaxy Scene Loaded');
