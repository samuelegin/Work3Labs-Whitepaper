/**
 * useAuth
 *
 * Manages admin authentication state.
 * Token is stored in sessionStorage (cleared on tab close) rather than
 * localStorage to reduce XSS exposure surface.
 *
 * For production consider httpOnly cookies instead — set those server-side
 * and remove all client-side token storage entirely.
 */

import { useState, useCallback, useEffect } from 'react'
import { adminLogin, adminLogout } from '../services/api'

const TOKEN_KEY = 'w3l_admin_token'

/** Read token from sessionStorage without throwing. */
function readToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) ?? null }
  catch { return null }
}

/** Persist token. Strips accidental whitespace. */
function saveToken(token) {
  try { sessionStorage.setItem(TOKEN_KEY, token.trim()) }
  catch { /* sessionStorage unavailable — in-memory only */ }
}

/** Clear token from storage. */
function clearToken() {
  try { sessionStorage.removeItem(TOKEN_KEY) }
  catch { /* noop */ }
}

export function useAuth() {
  const [token,      setToken]      = useState(() => readToken())
  const [admin,      setAdmin]      = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  const isAuthenticated = Boolean(token)

  /** Attach token to outgoing API headers — call this from api.js interceptors. */
  function getAuthHeader() {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  /** Login: POST /api/admin/login */
  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    setError(null)
    const { data, error } = await adminLogin({ email, password })
    if (error) {
      setError(error)
      setLoading(false)
      return { error }
    }
    // API returns { token, admin }
    saveToken(data.token)
    setToken(data.token)
    setAdmin(data.admin ?? null)
    setLoading(false)
    return { error: null }
  }, [])

  /** Logout: invalidate server session + clear local state. */
  const logout = useCallback(async () => {
    await adminLogout().catch(() => {})   // best-effort — clear local state regardless
    clearToken()
    setToken(null)
    setAdmin(null)
  }, [])

  return { token, admin, isAuthenticated, loading, error, login, logout, getAuthHeader }
}
