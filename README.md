# Work3 Labs — Next.js 14

Migrated from Vite + React to Next.js 14 App Router.

---

## Preview locally

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.local.example .env.local
```
Open `.env.local` and set `NEXT_PUBLIC_API_URL` to your backend URL.
For local dev without a backend yet, leave it as `http://localhost:4000/api` — pages will load fine, API calls will just fail gracefully.

### 3. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Routes

| URL | Page |
|-----|------|
| `/` | Whitepaper |
| `/apply` | Early access form |
| `/admin/login` | Admin sign in |
| `/admin/setup` | First-time admin registration (locks after use) |
| `/admin/forgot-password` | Request password reset |
| `/admin/reset-password?token=` | Set new password from email link |
| `/admin/invite?token=` | Accept team invite |
| `/admin/dashboard` | Admin dashboard (protected) |

---

## Project structure

```
src/
  app/
    layout.jsx                        ← root layout (fonts, global CSS, Providers)
    page.jsx                          ← whitepaper (/)
    globals.css
    apply/
      page.jsx                        ← early access form (/apply)
    admin/
      (auth)/                         ← public auth pages
        login/page.jsx
        setup/page.jsx
        forgot-password/page.jsx
        reset-password/page.jsx
        invite/page.jsx
      (dashboard)/                    ← protected pages
        dashboard/page.jsx            ← main admin dashboard
  components/
    Providers.jsx                     ← wraps AuthProvider
    whitepaper/
      WhitepaperClient.jsx            ← client wrapper for whitepaper page
      WhitepaperNav.jsx
      Sidebar.jsx
      MobileMenu.jsx
      sections/                       ← all 16 whitepaper sections
  hooks/
    useAuth.js                        ← auth context + cookie for middleware
    useApplicants.js
    useActiveToc.js
    useReveal.js
    usePods.js
  services/
    api.js                            ← all API calls (NEXT_PUBLIC_API_URL)
  middleware.js                       ← protects /admin/dashboard, redirects login
```

---

## Key changes from Vite version

| Before (Vite) | After (Next.js) |
|---------------|-----------------|
| `react-router-dom` | Next.js App Router file-based routing |
| `import { Link }` from react-router-dom | `import Link from 'next/link'` |
| `useNavigate()` | `useRouter()` from `next/navigation` |
| `useSearchParams()` from react-router-dom | `useSearchParams()` from `next/navigation` |
| `VITE_API_URL` | `NEXT_PUBLIC_API_URL` |
| `import.meta.env.*` | `process.env.NEXT_PUBLIC_*` |
| `sessionStorage` only for auth | `sessionStorage` + cookie (cookie lets middleware protect routes) |
| Manual `RequireAuth` wrapper | `src/middleware.js` handles route protection |
| Pod Creation tab (admin creates pods) | Pods Review tab (pods created by users, admin reviews + passes/fails) |

---

## Admin dashboard tabs

| Tab | Who sees it | What it does |
|-----|-------------|--------------|
| Talent Applications | All admins | Review, approve, reject talent applicants |
| Project Applications | All admins | Review, approve, reject project applicants |
| Pods Review | All admins | View all pods, pass/fail deliverables, release escrow |
| Team | Owner only | Invite admins, view team, remove admins |

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Import into Vercel — it auto-detects Next.js
3. Add environment variable: `NEXT_PUBLIC_API_URL` → your backend URL
4. Deploy

No `_redirects` file needed — Next.js handles routing natively.

---

## TODO — still to wire up

See `TODO.md` for the remaining items.
