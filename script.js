(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowEndDevice = Number(navigator.deviceMemory || 8) <= 4 || Number(navigator.hardwareConcurrency || 8) <= 4;

  const nav = document.getElementById("nav");
  const loader = document.getElementById("loader");
  const progressBar = document.getElementById("progressBar");
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const cursor = document.getElementById("cursor");
  const cursorFollower = document.getElementById("cursorFollower");
  const currentYear = document.getElementById("currentYear");

  const closeMobileMenu = () => {
    navToggle?.setAttribute("aria-expanded", "false");
    mobileMenu?.setAttribute("aria-hidden", "true");
    mobileMenu?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  const toggleMobileMenu = () => {
    const open = navToggle?.getAttribute("aria-expanded") !== "true";
    navToggle?.setAttribute("aria-expanded", String(open));
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    mobileMenu?.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };

  const updateScrollProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / max));
    progressBar.style.width = `${progress * 100}%`;
    progressBar.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    nav.classList.toggle("is-scrolled", window.scrollY > 30);
  };

  const updateActiveNav = () => {
    const sections = [...document.querySelectorAll("[data-zone]")];
    const marker = window.scrollY + window.innerHeight * 0.42;
    let active = "home";
    sections.forEach(section => {
      if (section.offsetTop <= marker) active = section.id;
    });
    document.querySelectorAll("[data-zone-link]").forEach(link => {
      const on = link.dataset.zoneLink === active;
      link.classList.toggle("is-active", on);
      link.setAttribute("aria-current", on ? "page" : "false");
    });
  };

  const initCursor = () => {
    if (!cursor || !cursorFollower || window.matchMedia("(pointer: coarse)").matches) return;
    let mouseX = innerWidth / 2, mouseY = innerHeight / 2;
    let followerX = mouseX, followerY = mouseY;
    window.addEventListener("mousemove", e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px,${mouseY}px,0)`;
    }, { passive: true });
    const tick = () => {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      cursorFollower.style.transform = `translate3d(${followerX}px,${followerY}px,0)`;
      requestAnimationFrame(tick);
    };
    tick();
  };

  const bindCursorHover = () => {
    document.querySelectorAll("[data-cursor]").forEach(el => {
      el.addEventListener("mouseenter", () => cursorFollower?.classList.add("is-hovering"));
      el.addEventListener("mouseleave", () => cursorFollower?.classList.remove("is-hovering"));
    });
  };

  const initParticles = () => {
    if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    const container = document.getElementById("particles");
    if (!container) return;
    const count = lowEndDevice ? 10 : 25;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.width = p.style.height = (Math.random() * 2 + 1) + "px";
      p.style.animationDuration = (Math.random() * 15 + 10) + "s";
      p.style.animationDelay = (Math.random() * 10) + "s";
      p.style.opacity = Math.random() * 0.25 + 0.05;
      frag.appendChild(p);
    }
    container.appendChild(frag);
  };

  const initScrollReveal = () => {
    const targets = document.querySelectorAll(".reveal, .stagger-children");
    if (prefersReducedMotion) {
      targets.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(el => observer.observe(el));
  };

  const initFAQ = () => {
    document.querySelectorAll(".faq-item").forEach(item => {
      item.addEventListener("click", () => {
        const open = item.classList.contains("is-open");
        document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("is-open"));
        if (!open) item.classList.add("is-open");
      });
    });
  };

  const initMagneticButtons = () => {
    if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
    document.querySelectorAll(".button, .social-link").forEach(btn => {
      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px,${y * 0.18}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  };

  const initSmoothAnchors = () => {
    document.addEventListener("click", e => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      history.replaceState(null, "", id);
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  const lazyInitWorld = () => {
    if (window.__societyWorldRequested) return;
    window.__societyWorldRequested = true;
    import("./world-scene.js")
      .then(mod => mod.initWorld?.({ reducedMotion: prefersReducedMotion, lowEnd: lowEndDevice }))
      .catch(err => console.error("[SOCIETY] 3D world failed to initialize:", err));
  };

  const hideLoaderAndStartWorld = () => {
    const delay = prefersReducedMotion ? 0 : 800;
    setTimeout(() => {
      loader?.classList.add("is-hidden");
      requestAnimationFrame(lazyInitWorld);
    }, delay);
  };

  const init = () => {
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());
    navToggle?.addEventListener("click", toggleMobileMenu);
    window.addEventListener("scroll", () => {
      updateScrollProgress();
      updateActiveNav();
    }, { passive: true });
    window.addEventListener("resize", updateActiveNav, { passive: true });

    initCursor();
    bindCursorHover();
    initParticles();
    initScrollReveal();
    initFAQ();
    initMagneticButtons();
    initSmoothAnchors();
    updateScrollProgress();
    updateActiveNav();

    if (document.readyState === "complete") hideLoaderAndStartWorld();
    else window.addEventListener("load", hideLoaderAndStartWorld, { once: true });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
