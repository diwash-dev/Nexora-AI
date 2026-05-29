/**
 * ═══════════════════════════════════════════════════════════
 *  NEXORA AI — script.js
 *  Modules:
 *   1.  Smooth Scroll
 *   2.  Navbar Scroll State
 *   3.  Active Nav Link (IntersectionObserver)
 *   4.  Hamburger / Mobile Menu
 *   5.  Scroll Reveal Animations
 *   6.  FAQ Accordion
 *   7.  Pricing Toggle (Monthly / Yearly)
 *   8.  Toast Notification System
 *   9.  Back-to-Top Button
 *   10. Animated Counter (Hero Stats)
 *   11. Chart Bar Grow Animation
 *   12. Data-toast Attribute Handler
 *   13. Keyboard Accessibility
 * ═══════════════════════════════════════════════════════════
 */

"use strict";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function initSmoothScroll() {
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (href === "#") return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      const navH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--nav-h",
          ),
        ) || 68;
      const top =
        target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: "smooth" });

      if (state.menuOpen) toggleMobileMenu();
    });
  });
}

function initNavbarScroll() {
  const navbar = $("#navbar");
  if (!navbar) return;

  const handler = () =>
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", handler, { passive: true });
  handler(); // run once on load
}

function initActiveNav() {
  const navAnchors = $$(".nav-links a");
  if (!navAnchors.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((a) => a.classList.remove("active"));
        const active = $(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add("active");
      });
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );

  $$("section[id], div[id]").forEach((s) => observer.observe(s));
}

const state = { menuOpen: false };

function toggleMobileMenu() {
  state.menuOpen = !state.menuOpen;
  const hamburger = $("#hamburger");
  const mobileMenu = $("#mobileMenu");

  hamburger?.classList.toggle("open", state.menuOpen);
  mobileMenu?.classList.toggle("open", state.menuOpen);
  document.body.classList.toggle("menu-open", state.menuOpen);
}

function initMobileMenu() {
  const hamburger = $("#hamburger");
  const mobileMenu = $("#mobileMenu");
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", toggleMobileMenu);

  // Close when any mobile link is clicked
  $$(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (state.menuOpen) toggleMobileMenu();
    });
  });
}

function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
  );

  $$(".reveal, .reveal-group").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add("visible");
    } else {
      observer.observe(el);
    }
  });
}

function initFAQ() {
  const items = $$(".faq-item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      // Close all items
      items.forEach((i) => i.classList.remove("open"));

      // Re-open clicked item only if it was closed
      if (!isOpen) item.classList.add("open");
    });
  });
}

function initPricingToggle() {
  const toggle = $("#billingToggle");
  const monthlyLabel = $("#monthlyLabel");
  const yearlyLabel = $("#yearlyLabel");
  const priceNums = $$(".price-num[data-monthly]");

  if (!toggle) return;

  let isYearly = false;

  function animateNumber(el, start, end, duration = 400) {
    const t0 = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - t0) / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * ease);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function updatePrices() {
    priceNums.forEach((el) => {
      const target = isYearly ? el.dataset.yearly : el.dataset.monthly;
      if (target === undefined) return;
      const current = parseInt(el.textContent) || 0;
      animateNumber(el, current, parseInt(target));
    });

    toggle.classList.toggle("yearly", isYearly);
    toggle.setAttribute("aria-checked", String(isYearly));

    monthlyLabel?.classList.toggle("active-label", !isYearly);
    yearlyLabel?.classList.toggle("active-label", isYearly);
  }

  toggle.addEventListener("click", () => {
    isYearly = !isYearly;
    updatePrices();
  });

  toggle.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle.click();
    }
  });

  monthlyLabel?.addEventListener("click", () => {
    if (isYearly) {
      isYearly = false;
      updatePrices();
    }
  });
  yearlyLabel?.addEventListener("click", () => {
    if (!isYearly) {
      isYearly = true;
      updatePrices();
    }
  });
}

function showToast(icon, title, sub, duration = 3200) {
  const container = $("#toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      <div class="toast-sub">${sub}</div>
    </div>
  `;
  container.appendChild(toast);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => toast.classList.add("show")),
  );

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);
}

window.showToast = showToast;

function initToastHandlers() {
  $$("[data-toast]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (
        el.tagName === "A" &&
        (el.getAttribute("href") === "#" || el.getAttribute("href") === "")
      ) {
        e.preventDefault();
      }
      try {
        const args = JSON.parse(el.dataset.toast);
        showToast(...args);
      } catch (_) {}
    });
  });
}

function initBackToTop() {
  const btn = $("#backTop");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 600);
    },
    { passive: true },
  );

  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

function initCounters() {
  const counterEls = $$("[data-count]");
  if (!counterEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseInt(el.dataset.count);
        const dur = 1800;
        const t0 = performance.now();

        const tick = (now) => {
          const p = Math.min((now - t0) / dur, 1);

          const ease = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(ease * end);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = end;
        };
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );

  counterEls.forEach((el) => observer.observe(el));
}

function initChartBars() {
  const container = $("#dashBars");
  if (!container) return;

  const bars = $$(".chart-bar", container);
  const initHeights = bars.map((b) => b.style.height);

  bars.forEach((b) => {
    b.style.height = "0%";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      bars.forEach((bar, i) => {
        setTimeout(() => {
          bar.style.transition = `height .6s cubic-bezier(0.22,1,0.36,1) ${i * 40}ms`;
          bar.style.height = initHeights[i];
        }, i * 20);
      });
      observer.disconnect();
    },
    { threshold: 0.3 },
  );

  observer.observe(container);
}

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.menuOpen) toggleMobileMenu();
  });
}

function init() {
  initSmoothScroll();
  initNavbarScroll();
  initActiveNav();
  initMobileMenu();
  initScrollReveal();
  initFAQ();
  initPricingToggle();
  initToastHandlers();
  initBackToTop();
  initCounters();
  initChartBars();
  initKeyboard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
