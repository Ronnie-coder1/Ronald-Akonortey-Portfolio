/* ==========================================================================
   Ronald Akonortey — Portfolio interactions
   Vanilla JS, no dependencies. Everything is feature-detected so the page
   still works with JavaScript disabled (progressive enhancement).
   ========================================================================== */
(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  // matchMedia exists in every real browser; the stub keeps the script
  // resilient in minimal DOM environments.
  const mediaQuery = (query) =>
    typeof window.matchMedia === "function"
      ? window.matchMedia(query)
      : { matches: false, addEventListener() {}, removeEventListener() {} };

  const reducedMotion = mediaQuery("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------------
     1. Theme (light / dark) with persisted preference + system fallback
     ------------------------------------------------------------------------ */
  const THEME_KEY = "ra-theme";
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const systemDark = mediaQuery("(prefers-color-scheme: dark)");

  const storedTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    themeToggle?.setAttribute("aria-pressed", String(theme === "dark"));
  };

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-pressed",
      String(root.dataset.theme === "dark"),
    );
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* private mode — preference simply won't persist */
      }
    });
  }

  systemDark.addEventListener?.("change", (event) => {
    if (!storedTheme()) applyTheme(event.matches ? "dark" : "light");
  });

  /* ------------------------------------------------------------------------
     2. Mobile navigation
     ------------------------------------------------------------------------ */
  const hamburger = $("#hamburger");
  const mobileMenu = $("#mobileMenu");

  const menuIsOpen = () => hamburger?.getAttribute("aria-expanded") === "true";

  const setMenu = (open) => {
    if (!hamburger || !mobileMenu) return;
    hamburger.setAttribute("aria-expanded", String(open));
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };

  hamburger?.addEventListener("click", () => setMenu(!menuIsOpen()));
  $$(".mobile-link", mobileMenu ?? document).forEach((link) =>
    link.addEventListener("click", () => setMenu(false)),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuIsOpen()) {
      setMenu(false);
      hamburger?.focus();
    }
  });
  mediaQuery("(min-width: 769px)").addEventListener?.("change", (event) => {
    if (event.matches) setMenu(false);
  });

  /* ------------------------------------------------------------------------
     3. Scroll-driven UI: progress bar, nav condense, back-to-top, scrollspy
     ------------------------------------------------------------------------ */
  const progressBar = $("#scrollProgress");
  const nav = $("#navbar");
  const backToTop = $("#btt");

  let scrollTicking = false;
  const paintScrollState = () => {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${scrollable > 0 ? y / scrollable : 0})`;
    }
    nav?.classList.toggle("is-scrolled", y > 24);
    backToTop?.classList.toggle("show", y > 480);
    scrollTicking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(paintScrollState);
      }
    },
    { passive: true },
  );
  paintScrollState();

  backToTop?.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  });

  // Highlight the nav link of the section currently in view.
  const navLinks = $$('.nav-links a[href^="#"]');
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const spyTargets = navLinks
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);

  if ("IntersectionObserver" in window && spyTargets.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    spyTargets.forEach((target) => spy.observe(target));
  }

  /* ------------------------------------------------------------------------
     4. Reveal-on-scroll with a per-sibling stagger
     ------------------------------------------------------------------------ */
  const revealables = $$(".fade-up");

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-visible"));
  } else {
    const siblingIndex = new Map();
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );

    revealables.forEach((el) => {
      const seen = siblingIndex.get(el.parentElement) ?? 0;
      el.style.setProperty("--reveal-delay", `${Math.min(seen, 5) * 90}ms`);
      siblingIndex.set(el.parentElement, seen + 1);
      revealObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     5. Animated stat counters
     ------------------------------------------------------------------------ */
  const counters = $$("[data-count]");

  const runCounter = (el) => {
    const target = Number.parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix ?? "";
    if (Number.isNaN(target)) return;
    if (reducedMotion.matches) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 },
    );
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(runCounter);
  }

  /* ------------------------------------------------------------------------
     6. Skill proficiency meters (staggered fill via --i)
     ------------------------------------------------------------------------ */
  $$(".skill-level").forEach((meter) => {
    $$("span", meter).forEach((segment, index) => {
      segment.style.setProperty("--i", index);
    });
  });

  /* ------------------------------------------------------------------------
     7. Contact form — async submit with inline feedback + honeypot
     ------------------------------------------------------------------------ */
  const form = $("#contactForm");
  const formStatus = $("#formStatus");
  const submitButton = $("#formSubmit");
  const CONTACT_EMAIL = "ronaldakonortey99@gmail.com";

  const setFormStatus = (type, html) => {
    if (!formStatus) return;
    formStatus.className = `form-status is-visible is-${type}`;
    formStatus.setAttribute("role", type === "error" ? "alert" : "status");
    formStatus.innerHTML = html;
  };

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = new FormData(form);

    // Honeypot: real visitors never see (or fill) this field.
    if (payload.get("_gotcha")) return;

    submitButton.disabled = true;
    submitButton.classList.add("is-sending");
    formStatus.className = "form-status";

    try {
      const response = await fetch(form.getAttribute("action"), {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
      });
      if (!response.ok)
        throw new Error(`Formspree responded ${response.status}`);
      form.reset();
      setFormStatus(
        "success",
        "Message sent — thank you! I usually get back to people within 48 hours.",
      );
    } catch {
      setFormStatus(
        "error",
        `Sorry, your message could not be sent right now. Please try again, or email me directly at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`,
      );
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-sending");
    }
  });

  /* ------------------------------------------------------------------------
     8. Copy-email-to-clipboard
     ------------------------------------------------------------------------ */
  const copyButton = $("#copyEmail");

  copyButton?.addEventListener("click", async () => {
    const email = copyButton.dataset.email ?? CONTACT_EMAIL;
    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch {
      const scratch = document.createElement("textarea");
      scratch.value = email;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      scratch.remove();
    }
    if (!copied) return;

    const label = $(".copy-label", copyButton);
    const original = label?.textContent ?? "";
    copyButton.classList.add("is-copied");
    if (label) label.textContent = "Copied!";
    window.setTimeout(() => {
      copyButton.classList.remove("is-copied");
      if (label) label.textContent = original;
    }, 1800);
  });

  /* ------------------------------------------------------------------------
     9. Footer year
     ------------------------------------------------------------------------ */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
