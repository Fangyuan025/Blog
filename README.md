# Fangyuan Lin Portfolio Website

A modern single-page personal portfolio site built with vanilla HTML, CSS, and JavaScript, featuring smooth animations, bilingual content (English/French), and a 3D interactive hero section.

## Overview

This repository contains the source for a static portfolio website that highlights:

- Professional profile and education
- Timeline-based experience
- Featured and supporting projects
- Contact details and feedback form

The site is designed to be lightweight, responsive, and deployment-friendly (GitHub Pages ready).

## Live Domain

The repository includes a `CNAME` file configured for:

- `www.fangyuanlin.com`

## Key Features

- **Responsive navigation** with mobile menu and active section highlighting
- **Bilingual UI** (EN/FR) powered by `assets/i18n.json`
- **Hero animations**:
  - Typewriter intro text
  - Three.js neural-network-style 3D background
- **Scroll-based reveal effects** for sections
- **Project showcase** with animated terminal mockup
- **Integrated feedback form** via Formspree

## Tech Stack

- **HTML5** (`index.html`)
- **CSS3** (`assets/css/style.css`)
- **Vanilla JavaScript** (`assets/js/main.js`)
- **Three.js** (loaded from CDN for hero visualization)

## Running Locally

Because this is a static website, you can serve it with any local static server.

### Option 1: Python

```bash
cd /path/to/repository-root
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Option 2: VS Code Live Server

Open the repository in VS Code and launch `index.html` with the Live Server extension.

## Customization Guide

### 1) Update content

- Edit section content in: `index.html`
- Update translatable strings in: `assets/i18n.json`

### 2) Update styling

- Modify design tokens, layout, and component styles in: `assets/css/style.css`

### 3) Update interactions

- Main UI behavior (language toggle, scrollspy, form handling): `assets/js/main.js`
- 3D hero effect: `assets/js/three-hero.js`

## Deployment

This project is suitable for static hosting providers such as:

- GitHub Pages
- Netlify
- Vercel (static output)

For GitHub Pages, ensure `index.html` remains at the repository root and keep `CNAME` if using a custom domain.
