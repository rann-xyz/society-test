import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

let state = null;

export function initWorld({ reducedMotion = false, lowEnd = false } = {}) {
  if (state) return state;
  const canvas = document.getElementById("worldCanvas");
  const progressBar = document.getElementById("progressBar");
  if (!canvas || !progressBar) return null;

  const staticMode = reducedMotion || lowEnd;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050505, lowEnd ? 0.035 : 0.022);

  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 240);
  camera.position.set(0, 1.2, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowEnd,
    alpha: true,
    powerPreference: lowEnd ? "low-power" : "high-performance"
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, lowEnd ? 1.25 : 1.65));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = new THREE.Group();
  scene.add(world);

  const lime = new THREE.Color("#d8ff3e");
  const white = new THREE.Color("#f4f4f0");

  const lineMaterial = (opacity = 0.24) => new THREE.LineBasicMaterial({
    color: lime, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending
  });

  const faintMaterial = new THREE.LineBasicMaterial({
    color: white, transparent: true, opacity: 0.08, depthWrite: false
  });

  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: lime, transparent: true, opacity: 0.8
  });

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: lime, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending
  });

  const curvePoints = [
    new THREE.Vector3(0, 1.1, 10),
    new THREE.Vector3(0.5, 1.0, 0),
    new THREE.Vector3(-4.0, 0.8, -13),
    new THREE.Vector3(3.5, 1.7, -27),
    new THREE.Vector3(-1.5, 0.2, -43),
    new THREE.Vector3(4.0, 2.8, -59),
    new THREE.Vector3(-3.5, 5.2, -76),
    new THREE.Vector3(0, 8.5, -94),
    new THREE.Vector3(0, 11.5, -110)
  ];
  const flightCurve = new THREE.CatmullRomCurve3(curvePoints, false, "catmullrom", 0.65);

  const lookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.0, 4),
    new THREE.Vector3(0, 0.9, -8),
    new THREE.Vector3(0, 1.0, -24),
    new THREE.Vector3(0, 1.4, -40),
    new THREE.Vector3(0, 2.2, -56),
    new THREE.Vector3(0, 4.0, -74),
    new THREE.Vector3(0, 6.5, -92),
    new THREE.Vector3(0, 9.5, -110)
  ]);

  const zoneT = {
    hero: 0.00, about: 0.15, people: 0.29, culture: 0.43,
    alpha: 0.57, lab: 0.72, archive: 0.86, join: 1.00
  };

  const zoneGroups = [];

  function addPoint(position, radius = 0.10, glow = true) {
    const group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(radius, lowEnd ? 8 : 12, lowEnd ? 8 : 12), nodeMaterial);
    group.add(core);
    if (glow) {
      const halo = new THREE.Mesh(new THREE.SphereGeometry(radius * 4, 8, 8), glowMaterial);
      group.add(halo);
    }
    group.position.copy(position);
    world.add(group);
    return group;
  }

  function addLine(points, opacity = 0.24) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, lineMaterial(opacity));
    world.add(line);
    return line;
  }

  function addZone(name) {
    const g = new THREE.Group();
    g.name = name;
    world.add(g);
    zoneGroups.push(g);
    return g;
  }

  // 01 Genesis: sparse node + particle burst.
  const genesis = addZone("GENESIS");
  const genesisCore = addPoint(new THREE.Vector3(0, 1, 0), 0.18);
  genesis.attach(genesisCore);
  const burstCount = lowEnd ? 80 : 150;
  const burstPositions = new Float32Array(burstCount * 3);
  for (let i = 0; i < burstCount; i++) {
    const r = Math.pow(Math.random(), 0.65) * 7;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 6;
    burstPositions[i * 3] = Math.cos(a) * r;
    burstPositions[i * 3 + 1] = y;
    burstPositions[i * 3 + 2] = Math.sin(a) * r;
  }
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPositions, 3));
  const burst = new THREE.Points(burstGeo, new THREE.PointsMaterial({
    color: lime, size: lowEnd ? 0.035 : 0.05, transparent: true, opacity: 0.42,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  genesis.add(burst);

  // 02 The Core: four connected pillars.
  const coreZone = addZone("CORE");
  const coreNodes = [
    new THREE.Vector3(-3.6, 0.8, -2),
    new THREE.Vector3(-1.2, 1.8, -1),
    new THREE.Vector3(1.2, 0.4, -2),
    new THREE.Vector3(3.6, 1.4, -1)
  ];
  coreNodes.forEach(p => {
    const n = addPoint(p, 0.12);
    coreZone.attach(n);
  });
  const coreEdges = [[0,1],[1,2],[2,3],[0,2],[1,3]];
  coreEdges.forEach(([a,b]) => coreZone.attach(addLine([coreNodes[a], coreNodes[b]], 0.3)));

  // 03 Twin Pillars: geometric vs organic.
  const people = addZone("PEOPLE");
  const leftPts = [], rightPts = [];
  for (let i = 0; i < 18; i++) {
    const y = -5 + i * 0.58;
    leftPts.push(new THREE.Vector3(-4.2 + (i % 2) * 0.6, y, -1.5 + Math.sin(i) * 0.25));
    rightPts.push(new THREE.Vector3(4.2 + Math.sin(i * 0.8) * 0.9, y, -1.0 + Math.cos(i * 0.7) * 0.8));
  }
  people.attach(addLine(leftPts, 0.3));
  people.attach(addLine(rightPts, 0.24));
  for (let i = 0; i < 12; i++) {
    const y = -4.4 + i * 0.75;
    people.attach(addLine([
      new THREE.Vector3(-4.0, y, -1.2),
      new THREE.Vector3(-2.0, y + 0.4, -1.8)
    ], 0.12));
  }

  // 04 Constellation belt: 8 nodes in a helix/belt.
  const culture = addZone("CULTURE");
  const cultureNodes = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const p = new THREE.Vector3(Math.cos(a) * 5.5, Math.sin(a) * 2.4, -Math.sin(a) * 3.5);
    cultureNodes.push(p);
    culture.attach(addPoint(p, 0.16));
  }
  for (let i = 0; i < 8; i++) culture.attach(addLine([cultureNodes[i], cultureNodes[(i + 1) % 8]], 0.2));
  for (let i = 0; i < 6; i++) {
    const pts = [];
    for (let j = 0; j < 18; j++) pts.push(new THREE.Vector3(-7 + j * 0.8, -3 + i * 1.2, -2 + Math.sin(j * 0.7 + i) * 0.5));
    culture.attach(addLine(pts, 0.06));
  }

  // 05 Signal field: terminal grid + rising/falling graph.
  const alpha = addZone("ALPHA");
  const gridSize = 14;
  for (let i = -gridSize; i <= gridSize; i++) {
    alpha.attach(addLine([
      new THREE.Vector3(i * 0.65, -2.2, -8),
      new THREE.Vector3(i * 0.65, -2.2, 8)
    ], 0.045));
    alpha.attach(addLine([
      new THREE.Vector3(-9, -2.2, i * 0.55),
      new THREE.Vector3(9, -2.2, i * 0.55)
    ], 0.045));
  }
  const graph = [];
  for (let i = 0; i < 32; i++) {
    const x = -8 + i * 0.52;
    const y = -1.3 + Math.sin(i * 0.65) * 1.2 + (i / 31) * 2.4 + Math.sin(i * 2.1) * 0.25;
    graph.push(new THREE.Vector3(x, y, -0.5));
  }
  alpha.attach(addLine(graph, 0.65));

  // 06 Workshop: five assembling modules.
  const lab = addZone("LAB");
  for (let i = 0; i < 5; i++) {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const edges = new THREE.EdgesGeometry(geo);
    g.add(new THREE.LineSegments(edges, lineMaterial(0.32)));
    g.position.set((i - 2) * 2.4, (i % 2) * 1.2 - 0.5, (i % 3) * -1.4);
    lab.add(g);
  }

  // 07 Spiral to horizon: archive nodes and convergence.
  const archive = addZone("ARCHIVE");
  const spiral = [];
  for (let i = 0; i < 44; i++) {
    const a = i * 0.42;
    const r = 0.45 + i * 0.075;
    const p = new THREE.Vector3(Math.cos(a) * r, i * 0.22 - 4.2, Math.sin(a) * r);
    spiral.push(p);
    archive.attach(addPoint(p, 0.045, false));
    if (i) archive.attach(addLine([spiral[i - 1], p], 0.12));
  }
  const horizon = addPoint(new THREE.Vector3(0, 8.2, -3), 0.22);
  archive.attach(horizon);
  archive.attach(addLine([new THREE.Vector3(-10, 8, -8), horizon.position], 0.1));
  archive.attach(addLine([new THREE.Vector3(10, 8, -8), horizon.position], 0.1));

  // A sparse ambient star field shared across the world.
  const ambientCount = lowEnd ? 100 : 220;
  const ambientPositions = new Float32Array(ambientCount * 3);
  for (let i = 0; i < ambientCount; i++) {
    ambientPositions[i * 3] = (Math.random() - 0.5) * 28;
    ambientPositions[i * 3 + 1] = (Math.random() - 0.5) * 18;
    ambientPositions[i * 3 + 2] = -Math.random() * 125;
  }
  const ambientGeo = new THREE.BufferGeometry();
  ambientGeo.setAttribute("position", new THREE.BufferAttribute(ambientPositions, 3));
  const ambient = new THREE.Points(ambientGeo, new THREE.PointsMaterial({
    color: white, size: 0.025, transparent: true, opacity: 0.28, depthWrite: false
  }));
  world.add(ambient);

  const tempPos = new THREE.Vector3();
  const tempLook = new THREE.Vector3();
  const tempForward = new THREE.Vector3();
  const tempUp = new THREE.Vector3(0, 1, 0);

  function progress() {
    const raw = parseFloat(progressBar.style.width) || 0;
    return THREE.MathUtils.clamp(raw / 100, 0, 1);
  }

  function cameraAt(t) {
    const p = flightCurve.getPointAt(t, tempPos);
    const lookT = Math.min(1, t + 0.012);
    const look = lookCurve.getPointAt(lookT, tempLook);
    camera.position.copy(p);
    camera.lookAt(look);
  }

  function zoneAmount(t, center, width = 0.12) {
    return THREE.MathUtils.clamp(1 - Math.abs(t - center) / width, 0, 1);
  }

  function updateWorld(t, elapsed = 0) {
    cameraAt(t);
    const z = Math.min(1, t * 7);
    const fogPulse = 0.018 + Math.sin(t * Math.PI) * 0.008;
    scene.fog.density = lowEnd ? 0.035 : fogPulse;

    const heroA = zoneAmount(t, zoneT.hero, 0.12);
    const coreA = zoneAmount(t, zoneT.about, 0.14);
    const peopleA = zoneAmount(t, zoneT.people, 0.14);
    const cultureA = zoneAmount(t, zoneT.culture, 0.15);
    const alphaA = zoneAmount(t, zoneT.alpha, 0.15);
    const labA = zoneAmount(t, zoneT.lab, 0.15);
    const archiveA = zoneAmount(t, zoneT.archive, 0.18) + THREE.MathUtils.smoothstep(t, 0.82, 1);

    genesis.scale.setScalar(0.75 + heroA * 1.15);
    genesis.rotation.y = elapsed * 0.06;
    burst.material.opacity = 0.08 + heroA * 0.48;
    genesisCore.scale.setScalar(0.8 + heroA * 1.5);

    coreZone.scale.setScalar(0.8 + coreA * 1.0);
    coreZone.rotation.y = elapsed * 0.04;

    people.scale.setScalar(0.75 + peopleA * 1.1);
    people.rotation.y = Math.sin(elapsed * 0.2) * 0.05;

    culture.scale.setScalar(0.72 + cultureA * 1.05);
    culture.rotation.z = elapsed * 0.04;

    alpha.scale.setScalar(0.75 + alphaA * 1.1);
    lab.scale.setScalar(0.72 + labA * 1.1);
    archive.scale.setScalar(0.8 + archiveA * 1.0);
    archive.rotation.y = elapsed * 0.05;

    // Gentle global breathing keeps the line-art world alive without becoming noisy.
    ambient.rotation.y = elapsed * 0.006;
    ambient.rotation.x = Math.sin(elapsed * 0.1) * 0.015;
  }

  let raf = 0;
  let last = 0;
  let lastStaticZone = -1;

  function render(now) {
    raf = requestAnimationFrame(render);
    const elapsed = now * 0.001;
    if (now - last < (lowEnd ? 50 : 1000 / 45)) return;
    last = now;

    const t = progress();

    if (staticMode) {
      const zone = Math.min(6, Math.floor(t * 7));
      if (zone !== lastStaticZone) {
        lastStaticZone = zone;
        updateWorld(Math.min(0.995, zone / 7 + 0.055), elapsed);
        renderer.render(scene, camera);
      }
      return;
    }

    updateWorld(t, elapsed);
    renderer.render(scene, camera);
  }

  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, lowEnd ? 1.25 : 1.65));
    renderer.setSize(innerWidth, innerHeight, false);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();

  state = {
    scene, camera, renderer, curve: flightCurve,
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
          materials.forEach(m => m.dispose());
        }
      });
    }
  };

  canvas.classList.add("is-ready");
  requestAnimationFrame(render);
  return state;
}
