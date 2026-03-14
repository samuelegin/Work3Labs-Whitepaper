'use client'

/**
 * Since Next.js middleware can't read sessionStorage,
 * we sync the token to a cookie on login/logout.
 * The cookie is NOT httpOnly so client JS can clear it — 
 * for production, swap to httpOnly cookies set server-side.
 */

const TOKEN_KEY   = 'w3l_admin_token'
const COOKIE_NAME = 'w3l_admin_token'

export function saveAuthToken(token) {
  // sessionStorage
  try { sessionStorage.setItem(TOKEN_KEY, token.trim()) } catch {}
  // cookie for middleware
  document.cookie = `${COOKIE_NAME}=${token.trim()}; path=/; SameSite=Lax`
}

export function clearAuthToken() {
  try { sessionStorage.removeItem(TOKEN_KEY) } catch {}
  document.cookie = `${COOKIE_NAME}=; path=/; Max-Age=0`
}

export function readAuthToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) ?? null } catch { return null }
}
