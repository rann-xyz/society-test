
const topbar = document.querySelector(".topbar");
addEventListener("scroll", () => topbar.classList.toggle("scrolled", scrollY > 20), {passive:true});
