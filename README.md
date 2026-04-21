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
- **Blog module** — Markdown-driven posts on a dedicated reading page (`post.html#<slug>`), per-post EN + FR files, YouTube embeds, news-style pull-quotes, and an auto-generated card grid on the index page from a JSON manifest (see [Blog](#blog) below)
- **Typewriter intro, scroll-reveal animations, scrollspy, mobile menu**
- **Formspree-powered feedback form**
- **Mobile-first responsive design** with `clamp()` typography and overflow-safe flex layouts

---

## Project Structure

```
Blog/
├── index.html            # Landing page (hero, about, experience, projects, blog index, contact)
├── post.html             # Dedicated article reading page (rendered client-side from Markdown)
├── CNAME                 # Custom domain (www.fangyuanlin.com)
├── README.md
├── posts/                # Markdown blog posts + manifest
│   ├── posts.json        # Post metadata (slug, date, tags, title/excerpt EN+FR, cover)
│   ├── <slug>.en.md      # English version of a post
│   └── <slug>.fr.md      # French version of a post
└── assets/
    ├── css/
    │   └── style.css     # Design tokens, Bento Grid, timeline, blog, responsive rules
    ├── js/
    │   ├── main.js       # i18n (localStorage-backed), typewriter, scrollspy, menu, forms
    │   ├── three-hero.js # Three.js hero scene (nodes, edges, icosahedron)
    │   ├── blog.js       # Index grid: loads posts.json, renders cards → post.html#<slug>
    │   ├── post.js       # Article page: slug routing, Markdown render, news-quote styling
    │   └── particles.js
    ├── i18n.json         # EN / FR translations (same LANG_KEY="site_lang" shared cross-page)
    ├── papers/           # Linkable PDFs referenced from posts
    └── images/
        └── blog/         # Per-post illustrations (SVG-first)
```

---

## Tech Stack

| Layer         | Tool                                        |
| ------------- | ------------------------------------------- |
| Markup        | HTML5                                       |
| Styling       | CSS3 (custom properties, Grid, Flex, clamp) |
| Scripting     | Vanilla JavaScript (ES2015+)                |
| 3D Graphics   | [Three.js](https://threejs.org/) (CDN)      |
| Markdown      | [marked.js](https://marked.js.org/) (CDN)   |
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
npx serve -l 3001 .
# then open http://localhost:3001
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

## Blog

The site ships with a lightweight, dependency-free blog engine. Posts are plain Markdown files in `posts/`, the manifest is a single JSON file, and everything is rendered client-side using [marked.js](https://marked.js.org/) via CDN. Index cards live on the landing page; each article gets its own dedicated reading page (`post.html`) so long-form content has its own URL, history entry, and reading-width layout.

### How it works

- **Index view** (`index.html#blog`) — `blog.js` loads `posts/posts.json`, sorts posts by `date` descending, and renders a responsive grid of cards (cover, title, excerpt, tags, reading time). Each card links to `post.html#<slug>`.
- **Article view** (`post.html#<slug>`) — `post.js` reads the slug from the URL hash, fetches `posts/<slug>.<lang>.md`, renders it via marked into a reading-width column, and enhances the result (YouTube expansion, external-link targeting, news-style pull-quotes). If the current language file is missing, it falls back to the English version. The `hashchange` event re-renders in place when navigating between posts.
- **Language persistence** — both `main.js` and `post.js` read and write the same `localStorage` key (`site_lang`), so toggling EN↔FR on one page carries over to the other. On the index, `main.js` also calls `window.__blogRefresh()` to re-render cards; on a post page, flipping the toggle re-fetches the corresponding `.md` file.
- **Embeds** — `<div class="youtube-embed" data-youtube-id="VIDEO_ID"></div>` in Markdown becomes a responsive 16:9 privacy-enhanced YouTube iframe (`youtube-nocookie.com`). External links automatically get `target="_blank" rel="noopener"`.
- **News-style pull-quotes** — blockquotes whose last paragraph starts with an em-dash (`—`) are auto-styled with an accent border, a decorative opening quote, an italic body, and a mono-typeset source line (see _Markdown conventions_ below).

### Adding a new post

1. Pick a slug (kebab-case, e.g. `on-device-rag`).
2. Create two Markdown files:
   - `posts/on-device-rag.en.md`
   - `posts/on-device-rag.fr.md` *(optional — if missing, `blog.js` falls back to English)*
3. Append an entry to `posts/posts.json`:

   ```json
   {
     "slug": "on-device-rag",
     "date": "2026-06-01",
     "reading_minutes": 7,
     "cover": "assets/images/blog/on-device-rag-cover.svg",
     "tags_en": ["RAG", "Local LLM"],
     "tags_fr": ["RAG", "LLM local"],
     "title_en": "Building on-device RAG from first principles",
     "title_fr": "Construire un RAG embarqué depuis zéro",
     "excerpt_en": "…",
     "excerpt_fr": "…"
   }
   ```

4. (Optional) Drop a cover image into `assets/images/blog/`. SVGs keep the repo light and scale cleanly.

That's the whole workflow — no build, no generator, no deploy step beyond `git push`.

### Markdown conventions

- **Byline:** drop the date / reading time / author line in as raw HTML right after the `#` title:

  ```markdown
  # My Post Title

  <p class="post-meta">April 19, 2026 · 9 min read · by Fangyuan Lin</p>
  ```

  The `.post-meta` class gives it a muted mono style. Don't use italic markdown for this — italics are reserved for normal prose emphasis.
- **Headings:** use `#` once at the top for the title, `##` for section headings, `###` for sub-sections.
- **YouTube:** `<div class="youtube-embed" data-youtube-id="VIDEO_ID"></div>`.
- **Figures:** regular Markdown `![alt](path)`. For captions, use a `<figure>` / `<figcaption>` block.
- **Horizontal rules** (`---`) create visual breathing room between major sections.
- **News-style pull-quote:** separate the body and the source with a blank line inside the blockquote, and prefix the source line with an em-dash:

  ```markdown
  > The new $599 M4 Mac mini is easily the fastest, most capable Mac
  > that Apple has ever sold at that price.
  >
  > — *Ars Technica*, [reviewing the M4 Mac minis](https://arstechnica.com/…), November 2024
  ```

  `post.js` detects the em-dash-led second paragraph and wraps the blockquote with a `news-quote` class for styling.
- **Linking a paper:** drop PDFs into `assets/papers/` and link them inline. Keep the link text short — `(PDF, 2025)` style suffixes are not needed.

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
