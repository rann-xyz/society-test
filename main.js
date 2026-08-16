
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menuBtn");
const loader = document.getElementById("loader");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 20);
}, {passive:true});

menuBtn?.addEventListener("click", () => nav.classList.toggle("open"));

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

window.addEventListener("load", () => {
  setTimeout(() => loader?.classList.add("done"), 900);
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.animate(
      [{opacity:0, transform:"translateY(24px)"}, {opacity:1, transform:"translateY(0)"}],
      {duration:700, easing:"cubic-bezier(.16,1,.3,1)", fill:"forwards"}
    );
    revealObserver.unobserve(entry.target);
  });
}, {threshold:.12});

document.querySelectorAll(".feature-card,.pillar-grid>div,.services-list article,.faq-list details,.social-orbit-links a,.section-heading,.manifesto-copy,.split>div").forEach(el => {
  el.style.opacity = "0";
  revealObserver.observe(el);
});

document.querySelectorAll("a[href^='http']").forEach(a => {
  a.addEventListener("click", () => {
    // Keep external links direct; this handler intentionally does not intercept navigation.
  });
});
