/**
 * Runtime smoke test — loads index.html in jsdom and exercises the
 * interactive behaviour (theme, menu, reveals, counters, form error path).
 * Run with: npm test
 */
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jsdom from "jsdom";

const { JSDOM, VirtualConsole } = jsdom;

const here = path.dirname(fileURLToPath(import.meta.url));

const virtualConsole = new VirtualConsole();
const rawErrors = [];
virtualConsole.on("jsdomError", (error) => rawErrors.push(error.message));
virtualConsole.on("error", (...args) => rawErrors.push(args.join(" ")));

const dom = await JSDOM.fromFile(path.join(here, "..", "index.html"), {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  virtualConsole,
});

// Remote font/stylesheet loads are irrelevant here (and may be offline).
const isRemoteNoise = (message) =>
  /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(message);

const { window } = dom;
const { document } = window;

await new Promise((resolve) => {
  if (document.readyState === "complete") resolve();
  else window.addEventListener("load", resolve, { once: true });
});
// Give the document a real origin so localStorage is usable in tests
// (a file:// origin would throw SecurityError).
dom.reconfigure({ url: "http://localhost/" });

// Let rAF-driven work (counters, scroll paint) settle.
await new Promise((resolve) => setTimeout(resolve, 1800));

const click = (el) =>
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

/* --- progressive enhancement flag + theme ----------------------------- */
assert.ok(
  document.documentElement.classList.contains("js"),
  "inline script adds the .js class",
);
assert.ok(
  ["light", "dark"].includes(document.documentElement.dataset.theme),
  "theme attribute is set before paint",
);

/* --- theme toggle ------------------------------------------------------ */
const toggle = document.getElementById("themeToggle");
const initialTheme = document.documentElement.dataset.theme;
click(toggle);
assert.notEqual(
  document.documentElement.dataset.theme,
  initialTheme,
  "clicking the toggle flips the theme",
);
assert.equal(
  toggle.getAttribute("aria-pressed"),
  String(initialTheme === "light"),
  "aria-pressed tracks the theme",
);
assert.equal(
  window.localStorage.getItem("ra-theme"),
  document.documentElement.dataset.theme,
  "theme choice is persisted",
);
click(toggle); // back to the original theme

/* --- mobile menu -------------------------------------------------------- */
const burger = document.getElementById("hamburger");
const menu = document.getElementById("mobileMenu");
click(burger);
assert.equal(burger.getAttribute("aria-expanded"), "true", "menu opens");
assert.ok(menu.classList.contains("is-open"), "menu panel is visible");
assert.ok(document.body.classList.contains("menu-open"), "scroll is locked");
document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape" }));
assert.equal(burger.getAttribute("aria-expanded"), "false", "Escape closes");
assert.ok(!document.body.classList.contains("menu-open"), "scroll unlocked");

/* --- reveal-on-scroll fallback (jsdom has no IntersectionObserver) ------ */
const fadeUps = Array.from(document.querySelectorAll(".fade-up"));
assert.ok(fadeUps.length > 5, "reveal targets exist");
assert.ok(
  fadeUps.every((el) => el.classList.contains("is-visible")),
  "content is revealed without IntersectionObserver",
);

/* --- stat counters resolve to their final value ------------------------- */
assert.equal(
  document.querySelector('[data-count="10"]').textContent,
  "10+",
  "counters finish at the target value",
);

/* --- skill meters indexed for the staggered fill ------------------------ */
const meter = document.querySelector(".skill-level");
assert.ok(
  Array.from(meter.children).every(
    (span, i) => span.style.getPropertyValue("--i") === String(i),
  ),
  "skill meter segments carry a stagger index",
);

/* --- contact form: graceful error path (jsdom has no fetch) ------------- */
const form = document.getElementById("contactForm");
form.dispatchEvent(
  new window.Event("submit", { bubbles: true, cancelable: true }),
);
await new Promise((resolve) => setTimeout(resolve, 100));
const status = document.getElementById("formStatus");
assert.ok(
  status.classList.contains("is-error"),
  "failed submits surface an inline error",
);
assert.ok(
  status.textContent.includes("ronaldakonortey99@gmail.com"),
  "the error state offers the email fallback",
);
assert.equal(
  document.getElementById("formSubmit").disabled,
  false,
  "submit button re-enables after failure",
);

/* --- document structure -------------------------------------------------- */
assert.equal(document.querySelectorAll("h1").length, 1, "exactly one h1");
assert.ok(document.querySelector("main#main"), "main landmark exists");
assert.ok(
  document.querySelector('a.skip-link[href="#main"]'),
  "skip link exists",
);

/* --- no uncaught runtime errors ------------------------------------------ */
const runtimeErrors = rawErrors.filter((message) => !isRemoteNoise(message));
assert.deepEqual(
  runtimeErrors,
  [],
  `no runtime errors (got: ${runtimeErrors})`,
);

console.log(
  "✔ Smoke test passed — theme, menu, reveals, counters and form all behave.",
);
window.close();
