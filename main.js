/* ═══════════════════════════════════════════════════════════════
   SOCIETY 3D — Main JavaScript
   UI Interactions, Scroll Reveal, Cursor, FAQ, Counter
   ═══════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════
// LOADER
// ═══════════════════════════════════════════════════════════════
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('is-hidden');
  }, 2200);
});

// ═══════════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
const cursorGlow = document.getElementById('cursor-glow');
let cursorX = 0, cursorY = 0;
let ringX = 0, ringY = 0;
let glowX = 0, glowY = 0;

if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
  });

  function animateCursor() {
    ringX += (cursorX - ringX) * 0.15;
    ringY += (cursorY - ringY) * 0.15;
    glowX += (cursorX - glowX) * 0.08;
    glowY += (cursorY - glowY) * 0.08;

    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effects
  document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hovering');
      cursorRing.classList.add('is-hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hovering');
      cursorRing.classList.remove('is-hovering');
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
const nav = document.getElementById('nav');
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 50);
}, { passive: true });

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
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 150;
    if (scrollY >= sectionTop) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
  });
}, { passive: true });

// ═══════════════════════════════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════════════════════════════
const revealElements = document.querySelectorAll('.reveal');
const staggerElements = document.querySelectorAll('.stagger-children');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay;
      if (delay) entry.target.style.transitionDelay = delay * 0.1 + 's';
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));
staggerElements.forEach(el => revealObserver.observe(el));

// ═══════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = progress + '%';
}, { passive: true });

// ═══════════════════════════════════════════════════════════════
// 3D CARD TILT EFFECT
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px) scale(1.01)`;
    card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
    card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ═══════════════════════════════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const item = question.parentElement;
    const isOpen = item.classList.contains('is-open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('is-open'));

    // Open clicked if it was closed
    if (!isOpen) item.classList.add('is-open');
  });
});

// ═══════════════════════════════════════════════════════════════
// COUNTER ANIMATION
// ═══════════════════════════════════════════════════════════════
const counters = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.count);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

function animateCounter(el, target) {
  let current = 0;
  const increment = target / 60;
  const duration = 2000;
  const stepTime = duration / 60;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current).toLocaleString() + '+';
  }, stepTime);
}

// ═══════════════════════════════════════════════════════════════
// SMOOTH SCROLL FOR ANCHOR LINKS
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// PARALLAX FLOATING BADGES
// ═══════════════════════════════════════════════════════════════
const badges = document.querySelectorAll('.floating-badge');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  badges.forEach((badge, i) => {
    const speed = 0.05 + (i * 0.02);
    badge.style.transform = `translateY(${scrollY * speed}px)`;
  });
}, { passive: true });

// ═══════════════════════════════════════════════════════════════
// HERO TEXT 3D EFFECT ON MOUSE MOVE
// ═══════════════════════════════════════════════════════════════
const heroSection = document.querySelector('.hero-section');
const heroTitle = document.querySelector('.hero-title');

if (heroSection && heroTitle) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    heroTitle.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    heroTitle.style.transform = '';
  });
}

// ═══════════════════════════════════════════════════════════════
// SOCIAL CUBES MOUSE INTERACTION
// ═══════════════════════════════════════════════════════════════
const socialStage = document.getElementById('social-3d-stage');
const socialOrbit = document.querySelector('.social-orbit');

if (socialStage && socialOrbit) {
  socialStage.addEventListener('mousemove', (e) => {
    const rect = socialStage.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    socialOrbit.style.transform = `rotateY(${x * 30}deg) rotateX(${-y * 20}deg)`;
  });

  socialStage.addEventListener('mouseleave', () => {
    socialOrbit.style.transform = '';
    socialOrbit.style.animation = 'orbitSpin3d 20s linear infinite';
  });

  socialStage.addEventListener('mouseenter', () => {
    socialOrbit.style.animation = 'none';
  });
}

console.log('🚀 SOCIETY 3D — Main JS Loaded');
