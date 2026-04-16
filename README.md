# Fangyuan Lin — Portfolio

A modern, bilingual single-page portfolio built with vanilla HTML, CSS, and JavaScript. Features a Linear-inspired dark UI, a Three.js neural-network hero, a Bento Grid project showcase, and an animated terminal mockup.

Live site: **[www.fangyuanlin.com](https://www.fangyuanlin.com)**

---

## Highlights

- **Linear-style dark aesthetic** — `#09090b` canvas, muted indigo accent (`#818cf8`), Inter + JetBrains Mono typography
- **3D hero visualization** — Three.js neural-network cloud (80 nodes + edges + wireframe icosahedron) that tracks mouse movement
- **Bilingual UI (EN / FR)** — JSON-driven i18n via `data-i18n` attributes, no reload required
- **Bento Grid project layout** — responsive CSS Grid with featured card + supporting tiles
- **Animated terminal mockup** — typewriter-driven live demo card for the *Dead Static* project
- **Timeline experience section** — dots + dates + card layout for work history
- **Typewriter intro, scroll-reveal animations, scrollspy, mobile menu**
- **Formspree-powered feedback form**
- **Mobile-first responsive design** with `clamp()` typography and overflow-safe flex layouts

---

## Project Structure

```
Blog/
├── index.html            # Single-page markup, data-i18n tagged
├── CNAME                 # Custom domain (www.fangyuanlin.com)
├── README.md
└── assets/
    ├── css/
    │   └── style.css     # Design tokens, Bento Grid, timeline, responsive rules
    ├── js/
    │   ├── main.js       # i18n, typewriter, scrollspy, mobile menu, form handler
    │   ├── three-hero.js # Three.js hero scene (nodes, edges, icosahedron)
    │   └── particles.js
    ├── i18n.json         # EN / FR translations
    └── images/
```

---

## Tech Stack

| Layer         | Tool                                        |
| ------------- | ------------------------------------------- |
| Markup        | HTML5                                       |
| Styling       | CSS3 (custom properties, Grid, Flex, clamp) |
| Scripting     | Vanilla JavaScript (ES2015+)                |
| 3D Graphics   | [Three.js](https://threejs.org/) (CDN)      |
| Fonts         | Inter, JetBrains Mono (Google Fonts)        |
| Form backend  | [Formspree](https://formspree.io/)          |
| Hosting       | GitHub Pages                                |

No build step, no framework, no bundler — just open `index.html`.

---

## Running Locally

Any static file server works.

### Python

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

### Node

```bash
npx serve -l 3000 .
# then open http://localhost:3000
```

### VS Code

Install the **Live Server** extension and click "Go Live".

---

## Customization

| What to change       | Where                               |
| -------------------- | ----------------------------------- |
| Copy / sections      | `index.html`                        |
| EN / FR translations | `assets/i18n.json`                  |
| Design tokens, layout| `assets/css/style.css` (`:root`)    |
| UI interactions      | `assets/js/main.js`                 |
| 3D hero scene        | `assets/js/three-hero.js`           |
| Accent color         | `--accent` in `style.css`           |

### Adding a translation key

1. Add a `data-i18n="my.key"` attribute to the element in `index.html`.
2. Add `"my.key": "..."` entries under both `en` and `fr` in `assets/i18n.json`.

---

## Deployment

The repo is GitHub Pages–ready:

1. Push to `main`.
2. In repository settings, enable Pages from the `main` branch root.
3. Keep `CNAME` for the custom domain (or delete it for the default `*.github.io` URL).

Also deployable as-is to Netlify, Vercel (static), or Cloudflare Pages.

---

## License

Personal portfolio — content © Fangyuan Lin. Feel free to use the structure as a reference for your own site.
