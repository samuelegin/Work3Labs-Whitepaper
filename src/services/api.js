/**
 * Work3 Labs — API Service Layer
 *
 * All admin data operations go through this module.
 * Set VITE_API_URL in .env to point at your backend.
 * Every function returns { data, error } — never throws.
 *
 * Endpoint contract:
 *
 * GET    /admin/applicants?type=talent|project&page=1&limit=50&sort=applied&dir=desc
 *        → { data: Applicant[], total: number, page: number, totalPages: number }
 *
 * PATCH  /admin/applicants/:id/approve          body: { note? }
 *        → { applicant: Applicant }             (backend generates & emails invite token)
 *
 * PATCH  /admin/applicants/:id/reject           body: {}
 *        → { applicant: Applicant }
 *
 * PATCH  /admin/applicants/bulk                 body: { ids, action: 'approve'|'reject' }
 *        → { updated: Applicant[] }
 *
 * POST   /admin/applicants/broadcast            body: { type, subject, body, recipientIds }
 *        → { queued: number }
 *
 * DELETE /admin/applicants                      (testing / reset only)
 *        → { deleted: number }
 *
 * GET    /admin/pods                            → { data: Pod[] }
 * POST   /admin/pods                            body: { name, projectId, members }
 *        → { pod: Pod }
 * GET    /admin/applicants?type=talent&status=approved&page=1&limit=200
 *        (reused for talent picker in pod creation)
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request(method, path, body) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { data: null, error: err.message ?? `HTTP ${res.status}` }
    }
    const data = await res.json()
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err.message ?? 'Network error' }
  }
}

function qs(params) {
  const p = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
  return p.length ? '?' + new URLSearchParams(p).toString() : ''
}

// ── Applicants ────────────────────────────────────────────────────────────────

/**
 * Paginated applicant list.
 * @param {{ type, page, limit, sort, dir, status }} opts
 */
export async function fetchApplicants({ type, page = 1, limit = 50, sort = 'applied', dir = 'desc', status } = {}) {
  return request('GET', `/admin/applicants${qs({ type, page, limit, sort, dir, status })}`)
}

/**
 * Approve a single applicant.
 * Backend generates the invite token and sends the email — no link needed from admin.
 * @param {string} id
 * @param {{ note?: string }} opts
 */
export async function approveApplicant(id, { note } = {}) {
  return request('PATCH', `/admin/applicants/${id}/approve`, { note })
}

/** Reject a single applicant. */
export async function rejectApplicant(id) {
  return request('PATCH', `/admin/applicants/${id}/reject`, {})
}

/**
 * Bulk approve or reject.
 * @param {string[]} ids
 * @param {'approve'|'reject'} action
 */
export async function bulkAction(ids, action) {
  return request('PATCH', '/admin/applicants/bulk', { ids, action })
}

/**
 * Broadcast email to approved applicants.
 * @param {{ type, subject, body, recipientIds }} opts
 */
export async function broadcastEmail({ type, subject, body, recipientIds }) {
  return request('POST', '/admin/applicants/broadcast', { type, subject, body, recipientIds })
}

/** Reset all applicant data. Testing / cycle resets only. */
export async function resetAllApplicants() {
  return request('DELETE', '/admin/applicants')
}

// ── Pods ──────────────────────────────────────────────────────────────────────

/** Fetch all pods. */
export async function fetchPods() {
  return request('GET', '/admin/pods')
}

/**
 * Create a new pod.
 * @param {{ name: string, projectId: string, members: { talentId, role }[] }} body
 */
export async function createPod(body) {
  return request('POST', '/admin/pods', body)
}

// ── Auth ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/login
 * body: { email, password }
 * → { token: string, admin: { id, email, name } }
 */
export async function adminLogin({ email, password }) {
  return request('POST', '/admin/login', { email, password })
}

/**
 * POST /api/admin/forgot-password
 * body: { email }
 * → { message: string }
 */
export async function adminForgotPassword({ email }) {
  return request('POST', '/admin/forgot-password', { email })
}

/**
 * POST /api/admin/logout
 * Invalidates the session server-side.
 */
export async function adminLogout() {
  return request('POST', '/admin/logout')
}
