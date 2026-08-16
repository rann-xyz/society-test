/* SOCIETY — 3D Scroll World Galaxy Scene */

(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ===== SCROLL WORLD STATE =====
  let scrollProgress = 0;
  let targetScrollProgress = 0;
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

  window.addEventListener('scroll', () => {
    targetScrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
  }, { passive: true });

  // ===== GALAXY LAYERS (Multiple scenes flying through) =====
  const layers = [];

  // Layer 1: Outer galaxy ring (far)
  function createGalaxyLayer(count, radius, color, size, speed) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const c = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random() * radius + radius * 0.3;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * radius * 0.15;

      positions[i3] = Math.cos(angle) * r;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * r;

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
      sizes[i] = Math.random() * size + size * 0.3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: size,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    return { mesh: points, speed: speed, radius: radius };
  }

  // Create multiple galaxy layers for depth
  layers.push(createGalaxyLayer(2000, 600, 0xd8ff3e, 1.5, 0.0002));   // Lime outer
  layers.push(createGalaxyLayer(1500, 400, 0xa8c72d, 1.2, 0.0004));   // Lime mid
  layers.push(createGalaxyLayer(1000, 200, 0xffffff, 1.0, 0.0006));   // White inner
  layers.push(createGalaxyLayer(500, 100, 0x88aaff, 2.0, 0.0008));    // Blue core

  // ===== STAR FIELD (background) =====
  const starCount = 3000;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    starPositions[i3] = (Math.random() - 0.5) * 2000;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 1000;
    starPositions[i3 + 2] = (Math.random() - 0.5) * 2000;
    const brightness = 0.3 + Math.random() * 0.7;
    starColors[i3] = brightness;
    starColors[i3 + 1] = brightness;
    starColors[i3 + 2] = brightness * 0.9;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const starMat = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // ===== GLOWING ORBS (nebula-like) =====
  const orbCount = 20;
  const orbs = [];
  for (let i = 0; i < orbCount; i++) {
    const orbGeo = new THREE.SphereGeometry(2 + Math.random() * 4, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xd8ff3e : 0x44aaff,
      transparent: true,
      opacity: 0.05 + Math.random() * 0.08
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(
      (Math.random() - 0.5) * 800,
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 800
    );
    scene.add(orb);
    orbs.push({ mesh: orb, speed: 0.0001 + Math.random() * 0.0003, originalPos: orb.position.clone() });
  }

  // ===== CONNECTION LINES (constellation effect) =====
  const lineCount = 50;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineCount * 2 * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xd8ff3e,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ===== CAMERA SETUP =====
  camera.position.set(0, 50, 400);

  // Mouse interaction
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
    targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
  });

  // ===== ANIMATION LOOP =====
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.001;

    // Smooth scroll interpolation
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.05;

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.02;
    mouseY += (targetMouseY - mouseY) * 0.02;

    // ===== SCROLL WORLD CAMERA MOVEMENT =====
    // Fly through the galaxy based on scroll
    const flyDepth = scrollProgress * 1200;
    const flyOrbit = scrollProgress * Math.PI * 2;

    camera.position.x = Math.sin(flyOrbit) * (300 - flyDepth * 0.2) + mouseX;
    camera.position.y = 50 + Math.sin(scrollProgress * Math.PI * 3) * 80 + mouseY;
    camera.position.z = 400 - flyDepth;

    camera.lookAt(
      Math.sin(flyOrbit + 0.5) * 100,
      Math.sin(scrollProgress * Math.PI * 2) * 30,
      -flyDepth * 0.5
    );

    // Rotate galaxy layers
    layers.forEach((layer, i) => {
      layer.mesh.rotation.y += layer.speed;
      layer.mesh.rotation.x = mouseY * 0.005 * (i + 1);
    });

    // Rotate star field slowly
    starField.rotation.y -= 0.00005;
    starField.rotation.x = mouseY * 0.002;

    // Animate orbs
    orbs.forEach((orb, i) => {
      orb.mesh.position.y = orb.originalPos.y + Math.sin(time + i) * 20;
      orb.mesh.position.x = orb.originalPos.x + Math.cos(time * 0.5 + i) * 10;
      orb.mesh.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.2);
    });

    // Update constellation lines
    const linePos = lines.geometry.attributes.position.array;
    for (let i = 0; i < lineCount; i++) {
      const i6 = i * 6;
      const t = time + i * 0.5;
      linePos[i6] = Math.sin(t) * 200 + Math.cos(t * 1.3) * 100;
      linePos[i6 + 1] = Math.cos(t * 0.7) * 100;
      linePos[i6 + 2] = Math.sin(t * 0.9) * 200 - flyDepth * 0.3;
      linePos[i6 + 3] = Math.sin(t + 1) * 200 + Math.cos(t * 1.3 + 1) * 100;
      linePos[i6 + 4] = Math.cos(t * 0.7 + 1) * 100;
      linePos[i6 + 5] = Math.sin(t * 0.9 + 1) * 200 - flyDepth * 0.3;
    }
    lines.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

