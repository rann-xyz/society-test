═══════════════════════════════════════════════════════════════════════════════
  SOCIETY 3D — Web3 Community Website v7.0
  Upgrade Documentation
═══════════════════════════════════════════════════════════════════════════════

OVERVIEW
────────
This is a complete 3D upgrade for the SOCIETY Web3 Community website.
The upgrade transforms the existing 2D website into an immersive 3D experience
using Three.js, inspired by scroll-world's scroll-driven camera movement.


FILE STRUCTURE
──────────────
📁 project-root/
├── index.html              ← Main HTML structure with 3D canvas integration
├── style.css               ← Upgraded CSS with 3D effects, glassmorphism, glow
├── main.js                 ← UI interactions, cursor, scroll reveal, FAQ, counters
├── scene3d.js              ← Three.js 3D scene (particles, grid, mascots, bloom)
├── mascot-cipher.gltf      ← 3D model file for Cipher mascot (Builder/Analyst)
├── mascot-ciphra.gltf      ← 3D model file for Ciphra mascot (Dreamer/Artist)
└── README.txt              ← This file


KEY FEATURES
────────────
✨ Three.js 3D Background Canvas
   - Fixed fullscreen WebGL canvas behind all content
   - 800 floating data-point particles with additive blending
   - Perspective grid floor with lime accent lines
   - 8 floating geometric shapes (octahedrons, icosahedrons, torus knots)
   - Unreal Bloom post-processing for glow effects

🎬 Scroll-Driven Camera Movement
   - Camera flies through 3D world as user scrolls
   - 11 anchor points mapped to page sections
   - Smooth interpolation between positions
   - Mouse parallax for extra depth

🤖 3D Mascots — Cipher & Ciphra
   - Procedural 3D models built with Three.js geometry
   - Cipher: Hexagonal body, icosahedron head, data rings, antenna
   - Ciphra: Spherical body, flowing hair crown, floating orbs
   - Animated floating and rotation
   - GLTF files included for external model loading
   - Mini 3D previews in mascot cards

🎨 Social Media Icons — 3D Cubes
   - 4 rotating 3D cubes for X, Discord, Instagram, Telegram
   - CSS 3D transforms with orbit animation
   - Mouse-interactive rotation
   - Hover color inversion effect

🖱️ Custom 3D Cursor System
   - 3-layer cursor: dot, ring, glow
   - Smooth follow with different lerp speeds
   - Hover state expansion
   - Mix-blend-mode difference effect

📦 3D Card Tilt Effects
   - Mouse-tracking 3D rotation on feature cards
   - Dynamic glow following cursor position
   - Perspective transform on hover

📊 Animated Counters
   - Scroll-triggered number counting animation
   - Members, Countries, Hours stats

🔮 Glassmorphism Navigation
   - Blur backdrop with scroll-triggered activation
   - 3D logo flip on hover
   - Smooth active state transitions


MASCOT GLTF MODELS
──────────────────
The GLTF files contain:
  • mascot-cipher.gltf  → 46 vertices, 132 indices
    - Body: Dark metallic box (hexagonal prism feel)
    - Head: Icosahedron with emissive edges
    - Eyes: Glowing lime spheres
    - Materials: High metallic, low roughness for tech feel

  • mascot-ciphra.gltf  → 402 vertices, 2112 indices
    - Body: Smooth sphere (organic/flowing)
    - Head: Smaller sphere with artistic styling
    - Hair: Ring of segments forming crown
    - Eyes: Glowing lime spheres
    - Materials: Lower metallic, higher roughness for soft feel


SETUP INSTRUCTIONS
──────────────────
1. Place all files in the same directory
2. Serve via a local web server (required for Three.js modules):

   Option A — Python:
     python -m http.server 8000

   Option B — Node.js (http-server):
     npx http-server -p 8000

   Option C — Vite (recommended):
     npm create vite@latest society-3d -- --template vanilla
     # Copy files into the project
     npm install
     npm run dev

3. Open http://localhost:8000 in your browser


DEPENDENCIES
────────────
All dependencies are loaded via CDN (no npm install needed):
  • Three.js v0.160.0 (3D engine)
  • Three.js addons (GLTFLoader, EffectComposer, Bloom)
  • Google Fonts (Space Grotesk, Inter)


BROWSER SUPPORT
───────────────
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 15+
✅ Edge 90+

Mobile: 3D scene runs on mobile but cursor effects are disabled.


PERFORMANCE NOTES
─────────────────
• Renderer uses device pixel ratio cap of 2x for performance
• Bloom post-processing is GPU-intensive; reduce strength on low-end devices
• Particle count (800) can be reduced in scene3d.js if needed
• GLTF models fallback to procedural geometry if loading fails


CUSTOMIZATION
─────────────
Colors: Edit CSS :root variables
  --accent: #d8ff3e     (Lime green)
  --bg: #050505         (Near black)

3D Scene: Edit scene3d.js
  - particleCount: 800  (reduce for performance)
  - bloomPass strength: 0.8
  - cameraPath points: adjust flight path

Mascots: Replace GLTF files or edit procedural geometry in scene3d.js


CREDITS
───────
Original Website: SOCIETY Web3 Community (rann-xyz/society)
3D Reference: scroll-world by oso95
3D Engine: Three.js by mrdoob
Design: Upgraded from Society v6.0

═══════════════════════════════════════════════════════════════════════════════
Built for the culture. © 2026 SOCIETY
═══════════════════════════════════════════════════════════════════════════════
