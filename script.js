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
    document.documentElement.classList.add("menu-open");
    overlay.setAttribute("aria-hidden", "false");
  }
  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.classList.remove("menu-open");
    document.documentElement.classList.remove("menu-open");
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
  var expandFrames = document.querySelectorAll(".expand__frame");
  var isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (expandFrames.length) {
    if (isMobile) {
      var mio = new IntersectionObserver(function (entries) {
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
        var vh = window.innerHeight;
        expandFrames.forEach(function (f) {
          var r = f.getBoundingClientRect();
          var center = r.top + r.height / 2;
          var dist = Math.abs(center - vh / 2);
          var max = vh * 0.85;
          var p = 1 - dist / max;
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

  /* --- contact form: envio AJAX + modal de sucesso --- */
  var contactForm = document.querySelector(".contact__form");
  var formModal   = document.getElementById("form-modal");

  if (contactForm && formModal) {
    var modalClose = formModal.querySelector(".form-modal__close");

    function openModal() {
      formModal.classList.add("open");
      formModal.setAttribute("aria-hidden", "false");
    }
    function closeModal() {
      formModal.classList.remove("open");
      formModal.setAttribute("aria-hidden", "true");
    }

    modalClose.addEventListener("click", closeModal);
    formModal.addEventListener("click", function (e) {
      if (e.target === formModal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });

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
        return res.json().then(function (data) {
          btn.innerHTML = originalText;
          btn.disabled = false;
          if (res.ok) {
            contactForm.reset();
            openModal();
          } else {
            var msg = (data && data.error) ? data.error : "Erro desconhecido";
            showContactError(contactForm, msg);
          }
        });
      })
      .catch(function (err) {
        btn.innerHTML = originalText;
        btn.disabled = false;
        showContactError(contactForm, err.message || "Falha de rede");
      });
    });
  }

  function showContactError(form, detail) {
    var existing = form.querySelector(".contact__error");
    if (existing) existing.remove();
    var p = document.createElement("p");
    p.className = "contact__error";
    p.textContent = "Erro: " + (detail || "tente novamente ou escreva para contato@ajah.com");
    form.appendChild(p);
  }

  /* --- hero headline: embaralhar letra ao hover --- */
  var scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!';
  document.querySelectorAll('.hero__headline .ltr').forEach(function (ltr) {
    var original = ltr.textContent;
    var timer = null;
    var count = 0;
    var total = 10;
    if (!original.trim() || original === '.' || original === ',') return;
    ltr.addEventListener('mouseenter', function () {
      if (timer) clearInterval(timer);
      count = 0;
      timer = setInterval(function () {
        count++;
        if (count >= total) {
          ltr.textContent = original;
          clearInterval(timer);
          timer = null;
        } else {
          ltr.textContent = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
      }, 35);
    });
    ltr.addEventListener('mouseleave', function () {
      if (timer) { clearInterval(timer); timer = null; }
      ltr.textContent = original;
    });
  });

  /* --- neon border: segue o mouse nas imagens --- */
  document.querySelectorAll(".expand__frame, .statement__image").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      el.style.setProperty("--my", ((e.clientY - r.top)  / r.height * 100).toFixed(1) + "%");
    });
  });

  /* --- gallery touch toggle (mobile / tap on desktop) --- */
  document.querySelectorAll(".gallery__item").forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".gallery__item.touched").forEach(function (o) {
        if (o !== item) o.classList.remove("touched");
      });
      item.classList.toggle("touched");
    });
  });
})();
