(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const html = document.documentElement;
  const mqMobile = window.matchMedia("(max-width: 700px)");
  const mqNav = window.matchMedia("(max-width: 1040px)");
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const RESUME_URL = "https://drive.google.com/file/d/1xPwN5AX4sBWURYKETI1RfvD55fQ0-ppi/view?usp=sharing";

  $$("[data-resume]").forEach((a) => {
    a.href = RESUME_URL;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });

  function navHeight() {
    const nav = $(".nav");
    return nav ? nav.getBoundingClientRect().height : 64;
  }

  /* Nav */
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const panel = $(".nav__panel");
  function setOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    html.classList.toggle("menu-open", open);
  }
  if (toggle) {
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    $$("a", panel).forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
    mqNav.addEventListener("change", (e) => { if (!e.matches) setOpen(false); });
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = id === "#top" ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      const top = id === "#top" ? 0 : target.getBoundingClientRect().top + window.scrollY - navHeight() + 1;
      window.scrollTo({ top, behavior: mqReduce.matches ? "auto" : "smooth" });
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

  /* Theme */
  const themeBtn = $("[data-theme-toggle]");
  const themeMeta = $('meta[name="theme-color"]');
  function applyTheme(dark, persist) {
    if (dark) html.setAttribute("data-theme", "dark");
    else html.removeAttribute("data-theme");
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(dark));
      themeBtn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      themeBtn.textContent = dark ? "Light" : "Dark";
    }
    if (themeMeta) themeMeta.setAttribute("content", dark ? "#0E0E0E" : "#EFEBE3");
    if (persist) {
      try { localStorage.setItem("as-theme", dark ? "dark" : "light"); } catch (err) {}
    }
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      applyTheme(!html.hasAttribute("data-theme"), true);
    });
  }

  /* Wordmark: fill the measure, cap the height. Two lines on small screens. */
  const title = $(".hero__title");
  const wm = $(".wm");
  const lines = $$(".wm__line");

  function measure(el, wdth, size) {
    el.style.fontVariationSettings = '"wght" 600, "wdth" ' + wdth.toFixed(2) + ', "opsz" 144';
    el.style.fontSize = size + "px";
    el.style.lineHeight = ".74";
    return el.scrollWidth;
  }

  function fitEl(el, containerW, maxVh, minWdth) {
    const target = Math.max(1, containerW) * 0.96;
    let lo = 12;
    let hi = 960;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      if (measure(el, minWdth, mid) > target) hi = mid;
      else lo = mid;
    }
    const cap = (maxVh * window.innerHeight) / 0.719;
    const size = Math.min(lo, cap);
    let wdth = minWdth;
    if (measure(el, minWdth, size) < target - 1) {
      let a = minWdth;
      let b = 151;
      for (let i = 0; i < 16; i++) {
        const mid = (a + b) / 2;
        if (measure(el, mid, size) < target) a = mid;
        else b = mid;
      }
      wdth = a;
      measure(el, wdth, size);
    }
    el.style.height = (size * 0.74) + "px";
    return size * 0.74;
  }

  function fitWordmark() {
    if (!wm || !title) return;
    const mobile = mqMobile.matches;
    const box = title.clientWidth;
    wm.classList.add("is-set");
    if (mobile) {
      wm.style.fontSize = "";
      wm.style.height = "";
      wm.style.fontVariationSettings = "";
      let h = 0;
      lines.forEach((line) => {
        line.style.display = "block";
        line.style.width = "max-content";
        h += fitEl(line, box, 0.22, 62);
      });
      wm.style.height = h + "px";
      title.style.height = h + "px";
    } else {
      lines.forEach((line) => {
        line.style.fontSize = "";
        line.style.height = "";
        line.style.fontVariationSettings = "";
        line.style.display = "";
        line.style.width = "";
      });
      wm.style.width = "max-content";
      const h = fitEl(wm, box, 0.42, 78);
      title.style.height = h + "px";
    }
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitWordmark);
  }
  fitWordmark();
  window.addEventListener("resize", fitWordmark);
  mqMobile.addEventListener("change", fitWordmark);

  /* Ruler follows the pointer */
  const hero = $(".hero");
  const marker = $(".hero__marker");
  const ruler = $(".hero__ruler");
  if (hero && marker && ruler && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const r = ruler.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
      marker.style.left = x + "px";
      marker.classList.add("is-on");
    });
    hero.addEventListener("pointerleave", () => marker.classList.remove("is-on"));
  }

  /* Experience rail */
  const xp = $(".xp");
  const fill = $(".xp__fill");
  const items = $$(".xp__item");
  function paintRail() {
    if (!xp || !fill) return;
    const rect = xp.getBoundingClientRect();
    const total = rect.height || 1;
    const mark = window.innerHeight * 0.42;
    const passed = Math.min(total, Math.max(0, mark - rect.top));
    fill.style.transform = "scaleY(" + (passed / total) + ")";
    items.forEach((item) => {
      const top = item.getBoundingClientRect().top;
      item.classList.toggle("is-active", top < mark && item.getBoundingClientRect().bottom > 80);
    });
  }
  paintRail();
  window.addEventListener("scroll", paintRail, { passive: true });
  window.addEventListener("resize", paintRail);

  /* Current section in the nav */
  const navLinks = $$(".nav__links a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  function paintNav() {
    const y = window.scrollY + navHeight() + 40;
    let current = null;
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec.id;
    });
    navLinks.forEach((a) => {
      const on = a.getAttribute("href") === "#" + current;
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  paintNav();
  window.addEventListener("scroll", paintNav, { passive: true });

  /* Contact */
  const form = $("#contactForm");
  const status = $("#formMsg");
  const copyBtn = $("[data-copy]");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const address = "shahanvik@gmail.com";
      try {
        await navigator.clipboard.writeText(address);
        if (status) {
          status.className = "contact__status mono";
          status.textContent = "Email copied.";
        }
      } catch (err) {
        if (status) {
          status.className = "contact__status mono is-err";
          status.textContent = "Copy failed. Email shahanvik@gmail.com directly.";
        }
      }
    });
  }
  if (form && status) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const body = form.message.value.trim();
      if (!name || !email || !body) {
        status.className = "contact__status mono is-err";
        status.textContent = "Fill in all three fields before sending.";
        return;
      }
      window.location.href =
        "mailto:shahanvik@gmail.com?subject=" + encodeURIComponent("Website enquiry from " + name) +
        "&body=" + encodeURIComponent(body + "\n\nFrom: " + name + " (" + email + ")");
      status.className = "contact__status mono";
      status.textContent = "Opening your email client.";
    });
  }
})();
