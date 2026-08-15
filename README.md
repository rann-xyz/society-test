# SOCIETY — Scroll 3D World

Efek animasi 3D scroll-driven untuk website **Society Community** — terinspirasi dari [scroll-world](https://github.com/oso95/scroll-world) oleh oso95, tapi dibangun dengan **Three.js** (tanpa perlu generate video AI).

---

## 🚀 Fitur

- **3 Dunia 3D** yang mewakili fitur utama Society:
  1. 🔬 **Web3 Research** — Node blockchain, data network, floating panels
  2. 💰 **Alpha Community** — Floating coins, tokens, airdrop parachutes
  3. ⚡ **X Raid Support** — Social engagement waves, lightning bolts, X symbol

- **Scroll-driven camera flight** — Kamera terbang melewati setiap dunia saat scroll
- **Seamless transitions** — Transisi halus antar scene dengan fade & depth
- **Particle atmosphere** — 800+ partikel neon yang melayang
- **Responsive** — Optimized untuk mobile & desktop
- **Zero video assets** — Semua 3D di-render real-time, tidak perlu video

---

## 📁 Struktur File

```
society-3d-scroll/
├── index.html          # Entry point
├── css/
│   └── style.css       # Styling & UI overlay
├── js/
│   └── scroll-world.js # Three.js engine
└── README.md           # Dokumentasi ini
```

---

## 🛠️ Cara Menggunakan

### 1. Copy ke Project Anda

Copy folder `society-3d-scroll/` ke dalam project website Anda.

### 2. Integrasi ke Website Utama

Jika ingin mengintegrasikan sebagai **full-page section** di website Society yang sudah ada:

**Opsi A: Standalone Page**
```html
<!-- Link dari navbar/menu ke page ini -->
<a href="/3d-world/">Explore 3D World</a>
```

**Opsi B: Embed sebagai Section**
Tambahkan container di HTML utama:
```html
<section id="scroll-world-section">
  <div id="canvas-container"></div>
  <div id="scroll-track"></div>
  <!-- Copy UI elements dari index.html -->
</section>
```

### 3. Customization

#### Warna
Edit di `css/style.css`:
```css
:root {
  --accent: #a78bfa;    /* Ungu utama */
  --green: #34d399;     /* Hijau */
  --red: #f87171;       /* Merah */
}
```

Dan di `js/scroll-world.js`:
```js
const CONFIG = {
  colors: {
    accent: 0xa78bfa,
    green: 0x34d399,
    red: 0xf87171,
    // ...
  }
};
```

#### Text Content
Edit di `index.html` dalam elemen `.scene-copy`:
```html
<article class="scene-copy" data-scene="0">
  <h2 class="copy-title">Web3 Research</h2>
  <p class="copy-body">...</p>
</article>
```

#### Scene Complexity
Di `js/scroll-world.js`, ubah jumlah objek:
```js
const nodeCount = isMobile ? 20 : 40;  // Kurangi untuk performa
const tokenCount = isMobile ? 25 : 50;
```

---

## 🎨 3 Scene Detail

### Scene 1: Web3 Research
- **Core**: Icosahedron wireframe dengan inner glow
- **Nodes**: 40 sphere nodes yang orbit mengelilingi core
- **Connections**: Garis antar node yang dekat (network graph)
- **Panels**: Floating data panels yang berputar
- **Grid**: Ground grid dengan fog

### Scene 2: Alpha Community
- **Main Coin**: Cylinder emas besar yang berputar
- **Tokens**: 50+ objek 3D (coin, diamond, box) yang orbit
- **Parachutes**: Airdrop packages dengan canopy hijau
- **Sparkles**: Partikel berkilauan

### Scene 3: X Raid Support
- **X Symbol**: Dua bar silang dengan glow ring
- **Waves**: Cincin konsetris yang membesar (energy waves)
- **Engagements**: 60+ objek (like, retweet, star) yang terbang
- **Lightning**: Energy bolts yang berkedip
- **Grid**: Ground grid merah yang berdenyut

---

## ⚡ Performance Tips

1. **Mobile**: Secara otomatis mengurangi jumlah objek & partikel
2. **Reduced Motion**: Respects `prefers-reduced-motion`
3. **Lazy Update**: Hanya update scene aktif & adjacent
4. **Pixel Ratio**: Dibatasi max 2x (1.5x di mobile)

---

## 📦 Dependencies

- **Three.js** v0.160.0 (loaded via CDN / unpkg)
- **Google Fonts**: Space Grotesk & Inter
- **No build step required** — Pure HTML/CSS/JS

---

## 📝 License

MIT — Feel free to use and modify for your project.

---

Built with ❤️ for Society Community
