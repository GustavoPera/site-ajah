/* ============================================================
   AJAH BRAND CLUB — shared behavior
   ============================================================ */

(function () {
  const header = document.querySelector(".site-header");
  const overlay = document.querySelector(".menu-overlay");
  const openBtn = document.querySelector(".hamburger");
  const closeBtn = document.querySelector(".menu-overlay__close");
  const isTransparent = header && header.classList.contains("transparent");

  /* --- scrolled state on header --- */
  function onScroll() {
    if (!header) return;
    const y = window.scrollY || window.pageYOffset;
    if (isTransparent) {
      if (y > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    } else {
      header.classList.add("scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- menu open/close --- */
  function openMenu() {
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.classList.add("menu-open");
    overlay.setAttribute("aria-hidden", "false");
  }
  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
    overlay.setAttribute("aria-hidden", "true");
  }
  if (openBtn) openBtn.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* --- fade-up via IntersectionObserver --- */
  const fadeEls = document.querySelectorAll(".fade-up, .grow-rule");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* --- hero entry animation on home (runs once on load) --- */
  const hero = document.querySelector("[data-hero-anim]");
  if (hero) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.add("ready");
        hero.querySelectorAll(".fade-up, .grow-rule").forEach(function (el) {
          el.classList.add("in");
        });
      });
    });
  }

  /* --- hero bg logo rotation on scroll --- */
  const heroLogoImg = document.querySelector(".hero__bg-logo img");
  if (heroLogoImg) {
    let raf = 0;
    function updateRotate() {
      raf = 0;
      const y = window.scrollY || window.pageYOffset;
      const deg = (y * 360) / 1400;
      heroLogoImg.style.setProperty("--rot", deg.toFixed(2) + "deg");
    }
    function onScrollRot() {
      if (!raf) raf = requestAnimationFrame(updateRotate);
    }
    window.addEventListener("scroll", onScrollRot, { passive: true });
    updateRotate();
  }

  /* --- scroll-expand image frames --- */
  const expandFrames = document.querySelectorAll(".expand__frame");
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (expandFrames.length) {
    if (isMobile) {
      const mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            mio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      expandFrames.forEach(function (f) { mio.observe(f); });
    } else {
      function updateExpand() {
        const vh = window.innerHeight;
        expandFrames.forEach(function (f) {
          const r = f.getBoundingClientRect();
          const center = r.top + r.height / 2;
          const dist = Math.abs(center - vh / 2);
          const max = vh * 0.85;
          let p = 1 - dist / max;
          if (p < 0) p = 0;
          if (p > 1) p = 1;
          p = p * p * (3 - 2 * p);
          f.style.setProperty("--p", p.toFixed(3));
        });
      }
      window.addEventListener("scroll", updateExpand, { passive: true });
      window.addEventListener("resize", updateExpand);
      updateExpand();
    }
  }

  /* --- contact form: envio AJAX sem redirecionar (Formspree) --- */
  var contactForm = document.querySelector(".contact__form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector("button[type='submit']");
      var originalText = btn.innerHTML;
      btn.innerHTML = "Enviando <span class='arrow'>…</span>";
      btn.disabled = true;

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "Accept": "application/json" }
      })
      .then(function (res) {
        if (res.ok) {
          contactForm.innerHTML =
            "<div class='contact__success'>" +
            "<span class='contact__success-rule'></span>" +
            "<p class='contact__success-title'>Mensagem recebida.</p>" +
            "<p class='contact__success-sub'>Respondemos em até 2 dias úteis — por quem assina o projeto, não por SDR.</p>" +
            "</div>";
        } else {
          btn.innerHTML = originalText;
          btn.disabled = false;
          showContactError(contactForm);
        }
      })
      .catch(function () {
        btn.innerHTML = originalText;
        btn.disabled = false;
        showContactError(contactForm);
      });
    });
  }

  function showContactError(form) {
    if (form.querySelector(".contact__error")) return;
    var p = document.createElement("p");
    p.className = "contact__error";
    p.textContent = "Algo deu errado. Escreva direto para contato@ajah.com";
    form.appendChild(p);
  }

  /* --- gallery touch toggle (mobile / tap on desktop) --- */
  document.querySelectorAll(".gallery__item").forEach(function (item) {
    item.addEventListener("click", function (e) {
      document.querySelectorAll(".gallery__item.touched").forEach(function (o) {
        if (o !== item) o.classList.remove("touched");
      });
      item.classList.toggle("touched");
    });
  });
})();
