
import * as THREE from "three";

const canvas = document.getElementById("world");
const PAGE = document.body.dataset.page || "home";
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020403);
const camera = new THREE.PerspectiveCamera(48, innerWidth/innerHeight, .1, 2500);

const world = new THREE.Group();
scene.add(world);

scene.add(new THREE.AmbientLight(0x9ab18d, .32));
const limeLight = new THREE.PointLight(0xd8ff3e, 28, 220, 2);
limeLight.position.set(0,18,35); scene.add(limeLight);
const rimLight = new THREE.PointLight(0x45ffca, 14, 260, 2);
rimLight.position.set(-45,8,-120); scene.add(rimLight);

const tex = new THREE.TextureLoader();
const logoTex = tex.load("assets/SOCIETY.png");
const ciphraTex = tex.load("assets/ciphra.png");
const cipherTex = tex.load("assets/cipher.png");

// World is a real corridor: camera moves along negative Z as the user scrolls.
const START_Z = 34;
const END_Z = -520;
const totalFlight = START_Z - END_Z;

// Each page starts at a different point in the same 3D universe.
// Scroll still flies through the complete world on every page.
const pageStart = {
  home: 34,
  about: -95,
  services: -230,
  faq: -350,
  join: -485
}[PAGE] ?? 34;

// ---------- helpers ----------
function mat(color, emissive=0x000000, rough=.5, metal=.2){
  return new THREE.MeshStandardMaterial({color, emissive, emissiveIntensity: emissive ? 1 : 0, roughness:rough, metalness:metal});
}
function box(w,h,d,color=0x0a110c,em=0){
  return new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color,em,.55,.25));
}
function addGlowRing(radius, z, color=0xd8ff3e, opacity=.28){
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius,.055,8,160),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending})
  );
  ring.rotation.x=Math.PI/2;
  ring.position.set(0,0,z);
  world.add(ring);
  return ring;
}
function labelSprite(texture, x,y,z,w,h, opacity=1){
  const m = new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity,depthWrite:false});
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);
  mesh.position.set(x,y,z);
  return mesh;
}
function addBeam(x,y,z,w,h,d){
  const b=box(w,h,d,0x182117,0x8ebd25);
  b.material.emissiveIntensity=.22;
  b.position.set(x,y,z);
  world.add(b);
  return b;
}

// ---------- star field ----------
const count=innerWidth<700?2600:5200;
const pos=new Float32Array(count*3);
for(let i=0;i<count;i++){
  const x=(Math.random()-.5)*330;
  const y=(Math.random()-.5)*170;
  const z=60-Math.random()*650;
  pos[i*3]=x;pos[i*3+1]=y;pos[i*3+2]=z;
}
const sg=new THREE.BufferGeometry();sg.setAttribute("position",new THREE.BufferAttribute(pos,3));
world.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xd8ff3e,size:.65,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending})));

// ---------- floor and rails ----------
const floor=box(170,.45,620,0x050906,0x071207);
floor.position.set(0,-14,-240); world.add(floor);
const floorGrid = new THREE.GridHelper(620,70,0x304329,0x142019);
floorGrid.rotation.x=Math.PI/2;
floorGrid.scale.set(1,.28,1);
floorGrid.position.set(0,-13.75,-240);
world.add(floorGrid);

for(const x of [-30,30]){
  const rail=box(.22,1.2,620,0x2c3a26,0xd8ff3e);
  rail.material.emissiveIntensity=.4;
  rail.position.set(x,-12.9,-240);
  world.add(rail);
}

// ---------- Scene 01: THE GATE ----------
const gate = new THREE.Group(); gate.position.z=0;
world.add(gate);
for(const x of [-16,16]){
  const p=box(4,30,4,0x0c120d,0x111c0c); p.position.set(x,1,0); gate.add(p);
}
const top=box(36,4,4,0x0b110c,0x101a0b);top.position.y=14;gate.add(top);
const arch= new THREE.Mesh(new THREE.TorusGeometry(13,.35,10,100,Math.PI),new THREE.MeshBasicMaterial({color:0xd8ff3e,transparent:true,opacity:.7}));
arch.rotation.z=Math.PI;arch.position.set(0,1,-1);gate.add(arch);
gate.add(labelSprite(logoTex,0,3,-2,10,10,.96));
addGlowRing(23,0,.9);

// ---------- Scene 02: SOCIETY CITY ----------
const city = new THREE.Group(); city.position.z=-115; world.add(city);
for(let i=0;i<26;i++){
  const x=(Math.random()-.5)*92;
  const z=(Math.random()-.5)*95;
  const h=5+Math.random()*22;
  const b=box(4+Math.random()*7,h,4+Math.random()*7,0x09100b, i%4===0?0x1d3c10:0);
  b.position.set(x,-13+h/2,z);
  city.add(b);
  for(let y=-10;y<h-1;y+=3.5){
    const window=box(.35,.65,.08,0xd8ff3e,0xd8ff3e);
    window.material.emissiveIntensity=1.2;
    window.position.set(b.position.x+(Math.random()-.5)*2,b.position.y+y,b.position.z-b.geometry.parameters.depth/2-.05);
    city.add(window);
  }
}
const tower=box(14,42,14,0x0c140d,0x182a0e);tower.position.set(0,8,-10);city.add(tower);
const logoCity=labelSprite(logoTex,0,9,-17,11,11,.92);city.add(logoCity);
for(let i=0;i<5;i++)addBeam((i-2)*18,0,-105-i*12,1,30,1);
addGlowRing(29,-115,.45);

// ---------- Scene 03: MASCOT DISTRICT ----------
const mascots = new THREE.Group(); mascots.position.z=-235; world.add(mascots);
const ciphra=labelSprite(ciphraTex,-10,0,0,24,24,.98); mascots.add(ciphra);
const cipher=labelSprite(cipherTex,11,0,-4,24,24,.98); mascots.add(cipher);

// 3D podiums beneath characters
for(const x of [-10,11]){
  const p=new THREE.Mesh(new THREE.CylinderGeometry(5,6,2.2,48),mat(0x0a110c,0x172a0c,.45,.65));
  p.position.set(x,-12,0);mascots.add(p);
  const r=new THREE.Mesh(new THREE.TorusGeometry(5.4,.09,8,80),new THREE.MeshBasicMaterial({color:0xd8ff3e,transparent:true,opacity:.8}));
  r.rotation.x=Math.PI/2;r.position.set(x,-10.8,0);mascots.add(r);
}
for(let i=0;i<8;i++){
 const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.8,1),new THREE.MeshStandardMaterial({color:0xd8ff3e,emissive:0x8eb51a,emissiveIntensity:1.2,metalness:.5,roughness:.25}));
 orb.position.set((Math.random()-.5)*55,(Math.random()*25)-3,(Math.random()-.5)*35);
 mascots.add(orb);
}
addGlowRing(34,-235,.55);

// ---------- Scene 04: ALPHA LAB ----------
const lab=new THREE.Group();lab.position.z=-355;world.add(lab);
const platform=new THREE.Mesh(new THREE.CylinderGeometry(25,25,2.4,64),mat(0x070c09,0x101a0b,.5,.6));platform.position.y=-11;lab.add(platform);
for(let i=0;i<12;i++){
 const a=i/12*Math.PI*2;
 const pillar=box(2.3,18,2.3,0x0b130d,0x263b10);pillar.position.set(Math.cos(a)*19,-1,Math.sin(a)*19);lab.add(pillar);
}
const core=new THREE.Mesh(new THREE.IcosahedronGeometry(8,2),new THREE.MeshStandardMaterial({color:0x0b120c,emissive:0xd8ff3e,emissiveIntensity:.65,metalness:.8,roughness:.18,wireframe:true}));
core.position.y=3;lab.add(core);
lab.add(labelSprite(logoTex,0,4,0,10,10,.55));
for(let i=0;i<4;i++)addGlowRing(10+i*4,-355+i*1.5,.2);

// ---------- Scene 05: FINAL ORBIT ----------
const final=new THREE.Group();final.position.z=-490;world.add(final);
const moon=new THREE.Mesh(new THREE.SphereGeometry(19,64,64),new THREE.MeshStandardMaterial({color:0x071009,roughness:.7,metalness:.1,emissive:0x081108,emissiveIntensity:.5}));
moon.position.set(18,7,0);final.add(moon);
const moonRing=new THREE.Mesh(new THREE.TorusGeometry(27,.15,10,180),new THREE.MeshBasicMaterial({color:0xd8ff3e,transparent:true,opacity:.55,blending:THREE.AdditiveBlending}));
moonRing.rotation.x=1.1;moonRing.rotation.z=-.3;moonRing.position.copy(moon.position);final.add(moonRing);
final.add(labelSprite(logoTex,0,3,-6,15,15,1));
addGlowRing(38,-490,.8);

// ---------- floating 3D words ----------
const wordCanvas=document.createElement("canvas");wordCanvas.width=1024;wordCanvas.height=256;
const ctx=wordCanvas.getContext("2d");
ctx.clearRect(0,0,1024,256);ctx.font="700 120px Space Grotesk, sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
ctx.strokeStyle="rgba(216,255,62,.75)";ctx.lineWidth=2;ctx.strokeText("SOCIETY",512,128);
ctx.fillStyle="rgba(216,255,62,.07)";ctx.fillText("SOCIETY",512,128);
const wordTex=new THREE.CanvasTexture(wordCanvas);
for(const z of [-70,-180,-300,-420]){
 const m=labelSprite(wordTex,(Math.random()-.5)*38,12,z,35,9,.5);
 m.rotation.y=(Math.random()-.5)*.35;world.add(m);
}

// ---------- camera flight ----------
let targetProgress=0, currentProgress=0;
let mouseX=0,mouseY=0;
addEventListener("pointermove",e=>{mouseX=(e.clientX/innerWidth-.5)*2;mouseY=(e.clientY/innerHeight-.5)*2},{passive:true});

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function smoothstep(t){return t*t*(3-2*t)}
function flightEase(t){
  // Long, cinematic continuous flight with slightly slower entry/exit.
  return smoothstep(clamp(t,0,1));
}
function sceneState(t){
  if(t<.16)return ["01","THE GATE","WELCOME TO SOCIETY"];
  if(t<.38)return ["02","SOCIETY CITY","BUILD / CONNECT"];
  if(t<.61)return ["03","MASCOT DISTRICT","CIPHRA × CIPHER"];
  if(t<.82)return ["04","ALPHA LAB","SIGNAL / RESEARCH"];
  return ["05","FINAL ORBIT","ENTER SOCIETY"];
}
const captionIndex=document.querySelector(".caption-index");
const captionTitle=document.querySelector(".caption-title");
const captionCopy=document.querySelector(".caption-copy");
const progressText=document.getElementById("progressText");

function updateScroll(){
 const max=document.documentElement.scrollHeight-innerHeight;
 targetProgress=max>0?clamp(scrollY/max,0,1):0;
}
addEventListener("scroll",updateScroll,{passive:true});
updateScroll();

function animate(){
 requestAnimationFrame(animate);
 currentProgress += (targetProgress-currentProgress)*.075;

 const eased=flightEase(currentProgress);
 const localStart = pageStart;
const localEnd = Math.max(END_Z, localStart - 145);
const z = localStart + (localEnd-localStart)*eased;
 // True 3D camera movement: position changes along Z, Y and X with the world.
 camera.position.z=z+24;
 camera.position.y=1.2 + Math.sin(eased*Math.PI*4)*1.2 + mouseY*-1.8;
 camera.position.x=Math.sin(eased*Math.PI*3)*4 + mouseX*3;
 camera.rotation.y=mouseX*.025;
 camera.rotation.x=mouseY*.018;

 // Add banking and subtle forward-facing look.
 camera.lookAt(
   Math.sin(eased*Math.PI*3)*2.2,
   0.5 + Math.sin(eased*Math.PI*2)*1.2,
   z-22
 );

 // Animate objects in actual 3D.
 city.rotation.y += .00018;
 mascots.position.x=Math.sin(performance.now()*.0007)*.8;
 mascots.children.forEach((o,i)=>{
   if(o.isMesh && o.geometry.type==="IcosahedronGeometry") o.rotation.y+=.008+i*.0004;
 });
 lab.rotation.y+=.0015;
 core.rotation.x+=.006;core.rotation.y+=.009;
 moon.rotation.y+=.0014;moonRing.rotation.z+=.0008;
 gate.rotation.y=Math.sin(performance.now()*.0003)*.012;

 const s=sceneState(currentProgress);
 captionIndex.textContent=s[0];
 captionTitle.textContent=s[1];
 captionCopy.textContent=s[2];
 progressText.textContent=s[0];

 const panel = document.querySelector(".page-panel");
if(panel){
  const r = panel.getBoundingClientRect();
  panel.style.transform = `translateY(${Math.max(-40, Math.min(40, r.top * -0.025))}px)`;
}
renderer.render(scene,camera);
}
animate();

addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.setSize(innerWidth,innerHeight);
});
