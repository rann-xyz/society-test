/* SOCIETY — Main JavaScript */

// ===== LOADER =====
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('is-hidden'), 2200);
});

// ===== CUSTOM CURSOR =====
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
const cursorGlow = document.getElementById('cursor-glow');
let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0, glowX = 0, glowY = 0;

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX; cursorY = e.clientY;
    cursor.style.left = cursorX + 'px'; cursor.style.top = cursorY + 'px';
  });
  function animateCursor() {
    ringX += (cursorX - ringX) * 0.15; ringY += (cursorY - ringY) * 0.15;
    glowX += (cursorX - glowX) * 0.08; glowY += (cursorY - glowY) * 0.08;
    cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px';
    cursorGlow.style.left = glowX + 'px'; cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
  document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('is-hovering'); cursorRing.classList.add('is-hovering'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hovering'); cursorRing.classList.remove('is-hovering'); });
  });
}

// ===== NAVIGATION =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => nav.classList.toggle('is-scrolled', window.scrollY > 50), { passive: true });
navToggle.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

// Active nav link
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => { if (scrollY >= section.offsetTop - 150) current = section.getAttribute('id'); });
  navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href').includes('#' + current)));
}, { passive: true });

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.reveal');
const staggerElements = document.querySelectorAll('.stagger-children');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealElements.forEach(el => revealObserver.observe(el));
staggerElements.forEach(el => revealObserver.observe(el));

// ===== PROGRESS BAR =====
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrollTop / docHeight) * 100 + '%';
}, { passive: true });

// ===== 3D TILT ON CARDS =====
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const centerX = rect.width / 2; const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20; const rotateY = (centerX - x) / 20;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.01)`;
    card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
    card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('is-open'));
    if (!isOpen) item.classList.add('is-open');
  });
});

// ===== COUNTER ANIMATION =====
const counters = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.count);
      let current = 0; const increment = target / 60; const stepTime = 2000 / 60;
      const timer = setInterval(() => {
        current += increment; if (current >= target) { current = target; clearInterval(timer); }
        entry.target.textContent = Math.floor(current).toLocaleString() + '+';
      }, stepTime);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
counters.forEach(counter => counterObserver.observe(counter));

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== FLOATING BADGES PARALLAX =====
const badges = document.querySelectorAll('.floating-badge');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  badges.forEach((badge, i) => {
    const speed = 0.05 + (i * 0.02);
    badge.style.transform = `translateY(${scrollY * speed}px)`;
  });
}, { passive: true });

// ===== HERO TITLE 3D MOUSE FOLLOW =====
const heroSection = document.querySelector('.hero-section');
const heroTitle = document.querySelector('.hero-title');
if (heroSection && heroTitle) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroTitle.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });
  heroSection.addEventListener('mouseleave', () => { heroTitle.style.transform = ''; });
}

// ===== SCROLL-DRIVEN 3D LOGO =====
const scroll3dLogos = document.querySelectorAll('.scroll-3d-logo');
const scroll3dCards = document.querySelectorAll('.scroll-3d-card');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollY / maxScroll;

  scroll3dLogos.forEach(logo => {
    const rotateX = progress * 30 - 10;
    const rotateY = progress * 360;
    const scale = 1 + Math.sin(progress * Math.PI) * 0.1;
    logo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
  });

  scroll3dCards.forEach((card, i) => {
    const offset = i * 0.1;
    const cardProgress = Math.min(1, Math.max(0, (progress - offset) * 2));
    const rotateY = cardProgress * 20;
    card.style.transform = `perspective(1000px) rotateY(${rotateY}deg)`;
  });
}, { passive: true });

// ===== FLOATING ICONS GALAXY PARTICLES =====
document.querySelectorAll('.float-icon').forEach((icon, index) => {
  for (let i = 0; i < 4; i++) {
    const p = document.createElement('span');
    p.style.cssText = `position:absolute;width:2px;height:2px;background:var(--accent);border-radius:50%;opacity:0;pointer-events:none;left:${20+Math.random()*60}%;top:${20+Math.random()*60}%;`;
    p.style.animation = `floatParticle${index} ${2+Math.random()*2}s ease-in-out ${Math.random()*2}s infinite`;
    icon.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `@keyframes floatParticle${index}{0%,100%{opacity:0;transform:translate(0,0) scale(0)}50%{opacity:0.6;transform:translate(${Math.random()*20-10}px,${-20-Math.random()*20}px) scale(1)}}`;
  document.head.appendChild(style);
});

// ===== GALAXY BUTTON ENHANCED PARTICLES =====
document.querySelectorAll('.galaxy-btn, .galaxy-btn-ghost').forEach(btn => {
  const particles = btn.querySelector('.btn-particles');
  if (!particles) return;
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('span');
    p.style.cssText = `position:absolute;width:3px;height:3px;background:var(--accent);border-radius:50%;opacity:0;pointer-events:none;left:${Math.random()*100}%;bottom:-5px;animation:btnGalaxyParticle ${1.5+Math.random()}s ease-out ${Math.random()}s infinite;`;
    particles.appendChild(p);
  }
});
const galaxyStyle = document.createElement('style');
galaxyStyle.textContent = `@keyframes btnGalaxyParticle{0%{opacity:0;transform:translateY(0) scale(0)}20%{opacity:0.8}100%{opacity:0;transform:translateY(-40px) scale(1)}}`;
document.head.appendChild(galaxyStyle);
