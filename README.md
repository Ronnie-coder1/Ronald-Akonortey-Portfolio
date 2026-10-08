# Ronald Akonortey | Frontend-Leaning Full Stack Developer & Creator

A modern, responsive personal portfolio showcasing sleek frontends and secure
full-stack applications. Pure HTML + CSS + vanilla JavaScript — **no build
step required**, so it can be hosted on any static host.

## 🚀 Live Demo

**[View Live Portfolio](https://ronald-akonortey-portfolio.vercel.app/)**

## ✨ Key Features

- **Dark & light themes** — follows the visitor's system preference, can be
  toggled manually, and the choice persists between visits (no flash of the
  wrong theme on load).
- **Mobile-first, fully responsive** — from 320 px phones to ultrawide
  desktops, with a full-screen mobile menu.
- **Accessible by default** — skip link, semantic landmarks, labelled form
  fields, visible focus states, ARIA-aware mobile menu, and full
  `prefers-reduced-motion` support.
- **Fast** — optimized WebP/JPEG image derivatives (~90 % smaller than the
  original screenshots), lazy loading, explicit image dimensions to avoid
  layout shift, and zero runtime dependencies.
- **SEO & share-ready** — meta description, canonical URL, Open Graph and
  Twitter cards, JSON-LD structured data, `sitemap.xml`, and `robots.txt`.
- **Installable (PWA-ready)** — web manifest with generated icons, including a
  maskable icon and Apple touch icon.
- **Working contact form** — submits to Formspree asynchronously with inline
  success/error feedback, a sending state, and a honeypot for spam bots.
- **Micro-interactions** — scroll progress bar, scrollspy navigation,
  reveal-on-scroll animations, animated stat counters, skill meters, and
  copy-email-to-clipboard.

## 🛠️ Built With

- **Frontend:** HTML5, CSS3 (custom properties, grid, clamp), vanilla ES2020+
  JavaScript
- **Typography:** Syne + DM Sans (Google Fonts)
- **Form backend:** Formspree
- **Deployment:** Vercel / Netlify (any static host works)
- **Tooling:** Prettier, html-validate, http-server (dev only)

## 📂 Project Structure

```
.
├── index.html              # Page structure & content (single page)
├── css/
│   └── styles.css          # All styles: tokens, components, themes, motion
├── js/
│   └── main.js             # Theme, menu, scrollspy, reveals, form, counters
├── img/
│   ├── favicon.svg         # Vector favicon (</> monogram)
│   ├── icon-*.png          # PWA icons (192 / 512 / maskable)
│   ├── apple-touch-icon.png
│   ├── og.jpg              # 1200×630 social share image
│   ├── ronald.webp         # Optimized portrait
│   ├── projects/           # Optimized WebP + JPEG project screenshots
│   └── originals/          # Uncompressed source screenshots (safe to prune)
├── manifest.json           # PWA manifest
├── robots.txt / sitemap.xml
└── package.json            # Dev scripts only — the site itself has no deps
```

## 🏁 Getting Started

No build needed — open `index.html` in a browser, or run a local server:

```bash
npm install     # dev tooling only
npm run dev     # serves the site at http://localhost:4173
```

### Scripts

| Script                 | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Serve the site locally (http-server)          |
| `npm run check`        | Validate HTML + verify formatting             |
| `npm run check:html`   | html-validate against `index.html`            |
| `npm test`             | jsdom smoke test of the interactive behaviour |
| `npm run check:format` | `prettier --check .`                          |
| `npm run format`       | Auto-format all files with Prettier           |

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs the same checks on
every push and pull request.

## 🖼️ Image Assets

Screenshots in `img/projects/` are pre-optimized derivatives (WebP with JPEG
fallback via `<picture>`). The untouched originals live in `img/originals/`;
regenerate derivatives with ImageMagick, e.g.:

```bash
convert img/originals/project1.png -resize 1280x -quality 80 \
  -define webp:method=6 img/projects/fullstack-web-app.webp
```

## 📧 Connect with Me

- **LinkedIn:** [Ronald Akonortey](https://www.linkedin.com/in/ronald-akonortey-32200939b)
- **GitHub:** [Ronnie-coder1](https://github.com/Ronnie-coder1)
- **Email:** ronaldakonortey99@gmail.com
