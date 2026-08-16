
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const canvas = document.getElementById("space");
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020304, 0.0008);

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, .1, 2200);
camera.position.set(0, 1.5, 42);

const world = new THREE.Group();
scene.add(world);

// Soft galaxy lights
scene.add(new THREE.AmbientLight(0x6e8a73, .32));
const key = new THREE.PointLight(0xd8ff3e, 7, 260, 2);
key.position.set(20, 10, 15);
scene.add(key);
const cyan = new THREE.PointLight(0x45ffd0, 3, 180, 2);
cyan.position.set(-35, -15, -30);
scene.add(cyan);

// Star field
const starCount = innerWidth < 700 ? 1500 : 3000;
const positions = new Float32Array(starCount * 3);
const sizes = new Float32Array(starCount);
for(let i=0;i<starCount;i++){
  const r = 120 + Math.random()*720;
  const theta = Math.random()*Math.PI*2;
  const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
  positions[i*3] = Math.sin(phi)*Math.cos(theta)*r;
  positions[i*3+1] = Math.cos(phi)*r*.72;
  positions[i*3+2] = Math.sin(phi)*Math.sin(theta)*r;
  sizes[i] = Math.random()*.8 + .25;
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute("position", new THREE.BufferAttribute(positions,3));
const starMat = new THREE.PointsMaterial({
  color:0xd8ff3e, size:.8, sizeAttenuation:true, transparent:true, opacity:.7,
  blending:THREE.AdditiveBlending, depthWrite:false
});
const stars = new THREE.Points(starGeo, starMat);
world.add(stars);

// Dense galaxy band
const dustCount = innerWidth < 700 ? 1000 : 1900;
const dustPos = new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){
  const radius = Math.pow(Math.random(), .65)*260;
  const angle = Math.random()*Math.PI*2 + radius*.018;
  const spread = (Math.random()-.5)*Math.max(4, radius*.16);
  dustPos[i*3] = Math.cos(angle)*radius;
  dustPos[i*3+1] = spread - radius*.015;
  dustPos[i*3+2] = Math.sin(angle)*radius;
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos,3));
const dustMat = new THREE.PointsMaterial({color:0x9fcf48,size:.7,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false});
const dust = new THREE.Points(dustGeo,dustMat);
dust.rotation.z = .28;
world.add(dust);

// Nebula sprites from procedural canvas
function nebulaTexture(){
  const c=document.createElement("canvas"); c.width=c.height=256;
  const x=c.getContext("2d");
  const g=x.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0,"rgba(216,255,62,.34)");
  g.addColorStop(.18,"rgba(130,255,95,.12)");
  g.addColorStop(.55,"rgba(20,90,55,.035)");
  g.addColorStop(1,"rgba(0,0,0,0)");
  x.fillStyle=g;x.fillRect(0,0,256,256);
  return new THREE.CanvasTexture(c);
}
const nebulaMat = new THREE.SpriteMaterial({map:nebulaTexture(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
for(let i=0;i<8;i++){
  const s=new THREE.Sprite(nebulaMat.clone());
  s.scale.set(90+Math.random()*100,50+Math.random()*90,1);
  s.position.set((Math.random()-.5)*220,(Math.random()-.5)*90,-180-Math.random()*180);
  s.material.opacity=.18+Math.random()*.1;
  world.add(s);
}

// Planet / moon
const planetGroup = new THREE.Group();
planetGroup.position.set(26,-8,-95);
const planet = new THREE.Mesh(
  new THREE.SphereGeometry(10,64,64),
  new THREE.MeshStandardMaterial({color:0x0a110c,roughness:.68,metalness:.1,emissive:0x071007,emissiveIntensity:.45})
);
planetGroup.add(planet);
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(14,.14,10,160),
  new THREE.MeshBasicMaterial({color:0xd8ff3e,transparent:true,opacity:.25,blending:THREE.AdditiveBlending})
);
ring.rotation.x=.9; ring.rotation.z=-.3; planetGroup.add(ring);
const glow = new THREE.Mesh(
  new THREE.SphereGeometry(10.8,32,32),
  new THREE.MeshBasicMaterial({color:0xd8ff3e,transparent:true,opacity:.035,side:THREE.BackSide,blending:THREE.AdditiveBlending})
);
planetGroup.add(glow);
world.add(planetGroup);

// Floating wireframe geometry
for(let i=0;i<14;i++){
  const geo = i%2 ? new THREE.IcosahedronGeometry(1+Math.random()*2,1) : new THREE.TorusKnotGeometry(.8+Math.random(),.15,64,10);
  const mat = new THREE.MeshBasicMaterial({color:i%3===0?0xd8ff3e:0x4f8d57,wireframe:true,transparent:true,opacity:.16});
  const m=new THREE.Mesh(geo,mat);
  m.position.set((Math.random()-.5)*100,(Math.random()-.5)*55,-20-Math.random()*150);
  m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
  m.userData.spin={x:(Math.random()-.5)*.004,y:(Math.random()-.5)*.006,z:(Math.random()-.5)*.004};
  world.add(m);
}

// 3D SOCIETY / S text
const textGroup = new THREE.Group();
textGroup.position.set(4,7,-38);
world.add(textGroup);
const fontLoader = new FontLoader();
fontLoader.load("https://threejs.org/examples/fonts/helvetiker_bold.typeface.json", font => {
  const material = new THREE.MeshStandardMaterial({
    color:0xd8ff3e, emissive:0x9dcc17, emissiveIntensity:1.3,
    metalness:.7, roughness:.22, transparent:true, opacity:.86
  });
  const geo = new TextGeometry("SOCIETY",{
    font,size:2.3,height:.35,curveSegments:10,bevelEnabled:true,bevelThickness:.04,bevelSize:.025,bevelSegments:3
  });
  geo.center();
  const text = new THREE.Mesh(geo,material);
  text.rotation.x=-.18;
  textGroup.add(text);

  const sGeo = new TextGeometry("S",{font,size:5.5,height:.65,curveSegments:10,bevelEnabled:true,bevelThickness:.06,bevelSize:.04,bevelSegments:3});
  sGeo.center();
  const s = new THREE.Mesh(sGeo,material.clone());
  s.material.emissiveIntensity=1.8;
  s.position.set(-14,-3,-3);
  s.rotation.y=-.35;
  textGroup.add(s);
});

// Orbiting luminous rings
for(let i=0;i<4;i++){
  const torus=new THREE.Mesh(
    new THREE.TorusGeometry(7+i*3,.018+i*.008,8,180),
    new THREE.MeshBasicMaterial({color:0xd8ff3e,transparent:true,opacity:.18-i*.025,blending:THREE.AdditiveBlending})
  );
  torus.position.set(0,0,-30-i*12);
  torus.rotation.x=1.05+i*.16;
  torus.rotation.z=.25+i*.4;
  world.add(torus);
}

// Mouse parallax
let tx=0,ty=0,mx=0,my=0;
addEventListener("pointermove",e=>{
  mx=(e.clientX/innerWidth-.5)*2;
  my=(e.clientY/innerHeight-.5)*2;
});
let scroll=0;
addEventListener("scroll",()=>scroll=scrollY,{passive:true});

function animate(){
  requestAnimationFrame(animate);
  tx += (mx-tx)*.025;
  ty += (my-ty)*.025;
  stars.rotation.y += .00008;
  dust.rotation.y -= .00012;
  planet.rotation.y += .0015;
  planetGroup.rotation.z += .00025;
  world.children.forEach(obj=>{
    if(obj.userData.spin){
      obj.rotation.x+=obj.userData.spin.x;
      obj.rotation.y+=obj.userData.spin.y;
      obj.rotation.z+=obj.userData.spin.z;
    }
  });
  textGroup.rotation.y += .0016;
  camera.position.x += ((tx*3.2)-camera.position.x)*.025;
  camera.position.y += ((1.5-ty*2.0)-camera.position.y)*.025;
  camera.position.z += ((42+Math.min(scroll*.012,14))-camera.position.z)*.012;
  renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.setSize(innerWidth,innerHeight);
});
