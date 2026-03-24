Work3 Labs — Whitepaper & Admin Frontend

This repository contains the Work3 Labs whitepaper site and admin dashboard, built with Next.js 14 and Tailwind CSS.

Live deployment: https://work3-labs-whitepaper.vercel.app


Routes

Public
/ — Whitepaper
/apply — Talent and project application form

Admin authentication
/admin/setup — First-time admin account creation (locks after one successful registration)
/admin/login — Admin sign in
/admin/forgot-password — Request a password reset link
/admin/reset-password — Set a new password via reset link
/admin/invite — Accept an admin invite and activate account

Admin dashboard (protected)
/admin/dashboard — Main dashboard


Getting Started

1. Install dependencies

npm install

2. Configure environment

cp .env.local.example .env.local

Open .env.local and set NEXT_PUBLIC_API_URL to point at your backend:

NEXT_PUBLIC_API_URL=http://localhost:4000/api

3. Run the development server

npm run dev

4. Build for production

npm run build
npm start


Environment Variables

NEXT_PUBLIC_API_URL — Base URL of the backend API, no trailing slash. Required.


Admin Dashboard

The dashboard has six tabs.

Talent Applications
Review incoming talent applications. Approve or reject individually, bulk approve or reject selected rows, sort by name, country, status or date applied, and broadcast a message to all approved talents.

Project Applications
Same interface as talent applications but scoped to project submissions.

Pods
View all pods created by talents on the platform. Each pod shows its name, description, member list with role descriptions and fund split percentages, pod admin name, and current status. Click any pod to open the detail view where you can match it to an approved project, mark work as passed or failed, release escrow funds to members according to their split percentages, or unmatch it from a project if needed.

Pod statuses: unmatched, matched, passed, failed, released.

Waitlist
Paginated table of all waitlist signups. Searchable by email. Entries can be deleted individually.

Activity
Chronological feed of recent platform events including applicant approvals, pod matches, escrow releases, waitlist signups, and admin invites.

Team (owner only)
Invite new admins by email. View active admins with last login time. Remove admins. Manage and resend pending invites.


Backend API Endpoints Required

The frontend calls the following endpoints. All admin routes require a Bearer token in the Authorization header.

Applicants
POST   /api/applicants
GET    /api/admin/applicants
PATCH  /api/admin/applicants/:id/approve
PATCH  /api/admin/applicants/:id/reject
PATCH  /api/admin/applicants/bulk
POST   /api/admin/applicants/broadcast
DELETE /api/admin/applicants

Pods
GET    /api/admin/pods
GET    /api/admin/pods/:id
PATCH  /api/admin/pods/:id/match
PATCH  /api/admin/pods/:id/unmatch
PATCH  /api/admin/pods/:id/pass
PATCH  /api/admin/pods/:id/fail
POST   /api/admin/pods/:id/release

Waitlist
GET    /api/admin/waitlist
DELETE /api/admin/waitlist/:id

Activity
GET    /api/admin/activity

Auth
POST   /api/admin/setup
POST   /api/admin/login
POST   /api/admin/logout
POST   /api/admin/forgot-password
POST   /api/admin/reset-password
GET    /api/admin/accept-invite
POST   /api/admin/accept-invite

Team
GET    /api/admin/team
POST   /api/admin/team/invite
DELETE /api/admin/team/:id
DELETE /api/admin/team/invites/:id
POST   /api/admin/team/invites/:id/resend


Authentication

Admin sessions are stored in sessionStorage under the key w3l_admin_token and sent as a Bearer token on every protected request. The middleware guards /admin/dashboard and redirects unauthenticated users to /admin/login.


Tech Stack

Next.js 14, React 18, Tailwind CSS 3. No additional UI libraries. Icons via Bootstrap Icons loaded from CDN.