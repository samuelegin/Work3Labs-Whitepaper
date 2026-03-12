# Work3 Labs — React + Vite + Tailwind

Production frontend for the Work3 Labs whitepaper and early access form.

## Stack

- **Vite 5** — build tooling
- **React 18** — UI
- **React Router v6** — client-side routing (`/` whitepaper, `/apply` form)
- **Tailwind CSS 3** — utility-first styling
- **IBM Plex Mono / Fraunces / Outfit** — Google Fonts
- **Bootstrap Icons 1.11.3** — icon set (CDN)

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Drop your assets into /public
#    - logo.png
#    - favicon.png

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

---

## Routes

| Route     | Page            |
|-----------|-----------------|
| `/`       | Whitepaper      |
| `/apply`  | Early Access Form |
| `/apply?type=project` | Form pre-set to Project |

Links between pages use React Router `<Link>` — no full-page reloads.

The whitepaper's **"Apply as Talent"** and **"Submit a Project"** CTA buttons pass `?type=talent` or `?type=project` query params to pre-select the correct card on the form.

---

## Build & deploy

```bash
# Production build → /dist
npm run build

# Preview production build locally
npm run preview
```

### Vercel (recommended)

```bash
npm i -g vercel
vercel --prod
```

Vercel auto-detects Vite. No config needed.

### Netlify

Drag the `/dist` folder into Netlify's UI after `npm run build`, or connect via GitHub.

**Important:** Add a `_redirects` file to `/public` for client-side routing:
```
/*  /index.html  200
```

---

## Project structure

```
src/
  pages/
    Whitepaper.jsx          ← Assembles all sections
    Apply.jsx               ← Early access form
  components/
    whitepaper/
      WhitepaperNav.jsx
      Sidebar.jsx
      MobileMenu.jsx
      sections/
        Hero.jsx
        Metrics.jsx
        Abstract.jsx
        Problem.jsx
        PoP.jsx
        Pods.jsx
        HowItWorks.jsx
        Features.jsx
        Architecture.jsx
        BusinessModel.jsx
        Roadmap.jsx
        Onboarding.jsx
        Governance.jsx
        Risks.jsx
        ERP.jsx
        Conclusion.jsx
  hooks/
    useReveal.js            ← IntersectionObserver for scroll animations
    useActiveToc.js         ← Scroll spy for TOC highlighting
  App.jsx                   ← Router
  main.jsx                  ← Entry point
  index.css                 ← Global styles + Tailwind layers
public/
  logo.png                  ← Add your logo here
  favicon.png               ← Add your favicon here
  _redirects                ← Add for Netlify SPA routing
```

---

## Connecting the form to a backend

`src/pages/Apply.jsx` — look for the `submit()` function. Replace the `setTimeout` mock with your real API call:

```js
async function submit() {
  if (!validate()) return
  setLoading(true)
  try {
    await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, type: mode }),
    })
    setRefId('W3L-' + Date.now().toString(36).toUpperCase().slice(-6))
    setSuccess(true)
    setProgress(100)
  } catch (err) {
    // handle error
  } finally {
    setLoading(false)
  }
}
```

---

## Design tokens

| Token     | Value     |
|-----------|-----------|
| Green     | `#2DFC44` |
| Green Dark| `#1DC433` |
| Ink       | `#0D0D0D` |
| Paper     | `#FAFAF8` |
| Alt BG    | `#F2F0EB` |
