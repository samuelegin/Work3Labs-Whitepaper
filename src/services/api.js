'use client'

/**
 * Work3 Labs — API Service Layer
 * Next.js version — uses NEXT_PUBLIC_API_URL instead of VITE_API_URL
 * Every function returns { data, error } — never throws.
 */

function getBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? '/api'
}

function getToken() {
  if (typeof window === 'undefined') return null
  try { return sessionStorage.getItem('w3l_admin_token') } catch { return null }
}

async function request(method, path, body) {
  try {
    const token = getToken()
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${getBase()}${path}`, {
      method,
      headers,
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

// ── Public ────────────────────────────────────────────────────────────────────
export async function submitApplication({ fn, ln, em, un, co, type }) {
  return request('POST', '/applicants', { fn, ln, em, un, co, type })
}

// ── Applicants ────────────────────────────────────────────────────────────────
export async function fetchApplicants({ type, page = 1, limit = 50, sort = 'applied', dir = 'desc', status } = {}) {
  return request('GET', `/admin/applicants${qs({ type, page, limit, sort, dir, status })}`)
}
export async function approveApplicant(id, { note } = {}) {
  return request('PATCH', `/admin/applicants/${id}/approve`, { note })
}
export async function rejectApplicant(id) {
  return request('PATCH', `/admin/applicants/${id}/reject`, {})
}
export async function bulkAction(ids, action) {
  return request('PATCH', '/admin/applicants/bulk', { ids, action })
}
export async function broadcastEmail({ type, subject, body, recipientIds }) {
  return request('POST', '/admin/applicants/broadcast', { type, subject, body, recipientIds })
}
export async function resetAllApplicants() {
  return request('DELETE', '/admin/applicants')
}

// ── Pods (read-only in admin — pods are user-created) ─────────────────────────
export async function fetchPods() {
  return request('GET', '/admin/pods')
}
export async function passProject(podId) {
  return request('PATCH', `/admin/pods/${podId}/pass`)
}
export async function failProject(podId, { reason } = {}) {
  return request('PATCH', `/admin/pods/${podId}/fail`, { reason })
}
export async function releaseEscrow(podId) {
  return request('POST', `/admin/pods/${podId}/release`)
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function adminLogin({ email, password }) {
  return request('POST', '/admin/login', { email, password })
}
export async function adminForgotPassword({ email }) {
  return request('POST', '/admin/forgot-password', { email })
}
export async function adminLogout() {
  return request('POST', '/admin/logout')
}
export async function adminSetup({ name, email, password, setupKey }) {
  return request('POST', '/admin/setup', { name, email, password, setupKey })
}
export async function adminResetPassword({ token, password }) {
  return request('POST', '/admin/reset-password', { token, password })
}

// ── Admin team ────────────────────────────────────────────────────────────────
export async function fetchAdmins() {
  return request('GET', '/admin/team')
}
export async function inviteAdmin({ email }) {
  return request('POST', '/admin/team/invite', { email })
}
export async function removeAdmin(id) {
  return request('DELETE', `/admin/team/${id}`)
}
export async function cancelInvite(id) {
  return request('DELETE', `/admin/team/invites/${id}`)
}
export async function resendInvite(id) {
  return request('POST', `/admin/team/invites/${id}/resend`)
}
export async function validateInviteToken(token) {
  return request('GET', `/admin/accept-invite?token=${encodeURIComponent(token)}`)
}
export async function acceptAdminInvite({ token, name, password }) {
  return request('POST', '/admin/accept-invite', { token, name, password })
}
