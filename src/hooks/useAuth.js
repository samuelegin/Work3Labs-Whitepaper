'use client'

import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { adminLogin, adminLogout } from '@/services/api'

const TOKEN_KEY  = 'w3l_admin_token'
const COOKIE_KEY = 'w3l_auth'

function readToken()  { try { return sessionStorage.getItem(TOKEN_KEY) ?? null } catch { return null } }
function saveToken(t) { try { sessionStorage.setItem(TOKEN_KEY, t.trim()) } catch {} }
function clearToken() { try { sessionStorage.removeItem(TOKEN_KEY) } catch {} }

// Set a cookie readable by Next.js middleware (not httpOnly so JS can clear it)
function setCookie(val) {
  document.cookie = `${COOKIE_KEY}=${val}; path=/; SameSite=Lax; Max-Age=28800` // 8h
}
function clearCookie() {
  document.cookie = `${COOKIE_KEY}=; path=/; Max-Age=0`
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(null)
  const [admin,   setAdmin]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // Hydrate from sessionStorage on mount (client only)
  useEffect(() => {
    const t = readToken()
    if (t) { setToken(t); setCookie(t) }
  }, [])

  const isAuthenticated = Boolean(token)

  const login = useCallback(async ({ email, password }) => {
    setLoading(true); setError(null)
    const { data, error } = await adminLogin({ email, password })
    if (error) { setError(error); setLoading(false); return { error } }
    saveToken(data.token)
    setCookie(data.token)
    setToken(data.token)
    setAdmin(data.admin ?? null)
    setLoading(false)
    return { error: null }
  }, [])

  const logout = useCallback(async () => {
    await adminLogout().catch(() => {})
    clearToken()
    clearCookie()
    setToken(null)
    setAdmin(null)
  }, [])

  // Also expose a way to save token directly (used by setup/accept-invite)
  const saveSession = useCallback((token, adminData) => {
    saveToken(token)
    setCookie(token)
    setToken(token)
    setAdmin(adminData ?? null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, admin, isAuthenticated, loading, error, login, logout, saveSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
