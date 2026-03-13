/**
 * Work3 Labs — Admin Setup
 *
 * Route: /admin/setup
 *
 * First-time admin account creation. Accessible only when no admin exists yet.
 * The backend enforces this — once an admin is registered, this endpoint returns
 * 403 and this page shows a "setup already complete" screen.
 *
 * Requires a setupKey (a secret set in backend env as ADMIN_SETUP_KEY) to
 * prevent anyone who finds this URL from creating an admin account.
 *
 * Flow:
 *  1. Admin opens /admin/setup
 *  2. Fills name, email, password, confirm password, setup key
 *  3. POST /api/admin/setup → on success, logs in automatically → /admin/dashboard
 *  4. If backend returns 403 (already set up) → show locked screen
 */

import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminSetup } from '../services/api'
import { useAuth } from '../hooks/useAuth'

const INPUT_BASE = [
  'w-full font-sans text-[14px] font-light bg-white text-ink',
  'border rounded-[10px] px-4 py-3 outline-none transition-all',
  'placeholder-[#D0D0D0] appearance-none',
].join(' ')

const inputCls = (hasError) => hasError
  ? `${INPUT_BASE} border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]`
  : `${INPUT_BASE} border-black/[0.09] focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]`

function Spinner() {
  return <span className="inline-block w-[18px] h-[18px] rounded-full border-2 border-white/25 border-t-white spin-anim flex-shrink-0" />
}

function Field({ id, label, type, value, onChange, onKeyDown, error, placeholder, autoComplete, autoFocus, hint, rightSlot }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999]">
          {label}
        </label>
        {rightSlot}
      </div>
      {hint && <p className="text-[11.5px] text-[#BBB] font-light mb-1.5 leading-snug">{hint}</p>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputCls(Boolean(error))}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[12px] text-red-500 font-light flex items-center gap-1.5">
          <i className="bi bi-exclamation-circle text-[11px] flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// Simple password strength bar
function StrengthBar({ password }) {
  const score = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)  s++
    if (password.length >= 12) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong']
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#1DC433', '#1DC433']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(0,0,0,0.07)' }}
          />
        ))}
      </div>
      <p className="text-[11px] font-light" style={{ color: colors[score] || '#CCC' }}>
        {labels[score]}
      </p>
    </div>
  )
}

export default function AdminSetup() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [fields, setFields] = useState({ name: '', email: '', password: '', confirm: '', setupKey: '' })
  const [show,   setShow]   = useState({ password: false, confirm: false, setupKey: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  const nameRef = useRef(null)
  useEffect(() => { nameRef.current?.focus() }, [])

  function set(key, val) {
    setFields(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: null, server: null }))
  }

  function validate() {
    const e = {}
    if (!fields.name.trim())  e.name = 'Full name is required'
    if (!fields.email.trim()) {
      e.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      e.email = 'Enter a valid email address'
    }
    if (!fields.password) {
      e.password = 'Password is required'
    } else if (fields.password.length < 8) {
      e.password = 'Minimum 8 characters'
    }
    if (!fields.confirm) {
      e.confirm = 'Please confirm your password'
    } else if (fields.confirm !== fields.password) {
      e.confirm = 'Passwords do not match'
    }
    if (!fields.setupKey.trim()) e.setupKey = 'Setup key is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  async function handleSubmit() {
    if (submitting) return
    if (!validate()) return

    setSubmitting(true)

    const { data, error } = await adminSetup({
      name:     fields.name.trim(),
      email:    fields.email.trim(),
      password: fields.password,
      setupKey: fields.setupKey.trim(),
    })

    if (error) {
      // 403 = already set up
      if (error.includes('403') || error.toLowerCase().includes('already') || error.toLowerCase().includes('exists')) {
        setAlreadyDone(true)
        setSubmitting(false)
        return
      }
      // 401/403 on setup key
      const msg = error.toLowerCase().includes('key') || error.toLowerCase().includes('unauthorized') || error.includes('401')
        ? 'Invalid setup key. Check your ADMIN_SETUP_KEY environment variable.'
        : error.includes('Network') || error.includes('fetch')
        ? 'Unable to connect. Check your internet connection.'
        : error
      setErrors({ server: msg })
      setSubmitting(false)
      return
    }

    // Backend returns { token, admin } — same shape as login
    // Reuse login flow: save token, set admin state
    if (data?.token) {
      // Manually save token since we have it directly
      try { sessionStorage.setItem('w3l_admin_token', data.token) } catch {}
      navigate('/admin/dashboard', { replace: true })
    } else {
      // Fallback: redirect to login
      navigate('/admin/login', { replace: true })
    }
  }

  // ── Already set up screen ────────────────────────────────────────────────────
  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 mesh-green-tr mesh-blue-bl">
        <div className="w-full max-w-[400px]" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Work3 Labs" className="h-9 mb-4" />
          </div>
          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] px-7 py-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-5">
              <i className="bi bi-shield-lock text-[22px] text-[#999]" />
            </div>
            <h2 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink mb-2">
              Setup complete
            </h2>
            <p className="text-[13.5px] font-light text-[#888] leading-relaxed mb-7 max-w-[280px]">
              An admin account already exists. This setup page is no longer accessible.
            </p>
            <Link
              to="/admin/login"
              className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink border border-black/[0.12] rounded-full px-5 py-2.5 hover:bg-black/[0.04] transition-colors"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Setup form ───────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-paper flex flex-col relative overflow-hidden mesh-green-tr mesh-blue-bl"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors"
        >
          <i className="bi bi-arrow-left text-[11px]" />
          <span className="hidden sm:inline">Back to site</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-[420px]" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Work3 Labs" className="h-9 mb-4" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#BBB]">Admin Setup</span>
          </div>

          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Header */}
            <div className="px-7 pt-7 pb-6 border-b border-black/[0.06]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#2DFC44] flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-person-gear text-[13px] text-ink" />
                </div>
                <h1 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink">
                  Create admin account
                </h1>
              </div>
              <p className="text-[13px] font-light text-[#AAA] leading-snug">
                First-time setup. This page locks after one successful registration.
              </p>
            </div>

            {/* Form */}
            <div className="px-7 py-6 space-y-4">

              {/* Server error */}
              {errors.server && (
                <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-[10px] px-4 py-3.5" style={{ animation: 'up 0.2s both' }}>
                  <i className="bi bi-shield-exclamation text-red-500 text-[15px] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-600 font-light leading-snug">{errors.server}</p>
                </div>
              )}

              <Field
                id="name"
                label="Full name"
                type="text"
                value={fields.name}
                onChange={v => set('name', v)}
                onKeyDown={handleKey}
                placeholder="Sam Egin"
                autoComplete="name"
                autoFocus
                error={errors.name}
              />

              <Field
                id="email"
                label="Email address"
                type="email"
                value={fields.email}
                onChange={v => set('email', v)}
                onKeyDown={handleKey}
                placeholder="admin@work3labs.com"
                autoComplete="email"
                error={errors.email}
              />

              <div>
                <Field
                  id="password"
                  label="Password"
                  type={show.password ? 'text' : 'password'}
                  value={fields.password}
                  onChange={v => set('password', v)}
                  onKeyDown={handleKey}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  error={errors.password}
                  rightSlot={
                    <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))}
                      className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0">
                      {show.password ? 'Hide' : 'Show'}
                    </button>
                  }
                />
                <StrengthBar password={fields.password} />
              </div>

              <Field
                id="confirm"
                label="Confirm password"
                type={show.confirm ? 'text' : 'password'}
                value={fields.confirm}
                onChange={v => set('confirm', v)}
                onKeyDown={handleKey}
                placeholder="Re-enter password"
                autoComplete="new-password"
                error={errors.confirm}
                rightSlot={
                  <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                    className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0">
                    {show.confirm ? 'Hide' : 'Show'}
                  </button>
                }
              />

              <Field
                id="setupKey"
                label="Setup key"
                type={show.setupKey ? 'text' : 'password'}
                value={fields.setupKey}
                onChange={v => set('setupKey', v)}
                onKeyDown={handleKey}
                placeholder="••••••••••••"
                autoComplete="off"
                hint="Set by your backend developer in ADMIN_SETUP_KEY env var."
                error={errors.setupKey}
                rightSlot={
                  <button type="button" onClick={() => setShow(s => ({ ...s, setupKey: !s.setupKey }))}
                    className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0">
                    {show.setupKey ? 'Hide' : 'Show'}
                  </button>
                }
              />
            </div>

            {/* Actions */}
            <div className="px-7 pb-7">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 bg-ink text-paper py-3.5 rounded-[10px] font-sans text-[14px] font-medium tracking-[-0.01em] hover:bg-[#1A1A1A] active:bg-[#111] transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={submitting}
              >
                {submitting ? (
                  <><Spinner /><span>Creating account…</span></>
                ) : (
                  <><i className="bi bi-person-check text-[15px]" />Create admin account</>
                )}
              </button>
            </div>
          </div>

          {/* Info footer */}
          <div className="mt-4 bg-black/[0.03] border border-black/[0.06] rounded-[10px] px-4 py-3.5 flex items-start gap-3">
            <i className="bi bi-info-circle text-[13px] text-[#BBB] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-light text-[#999] leading-snug">
              Once created, this admin account cannot be changed from this page.
              Use <span className="font-mono text-[11px] text-ink">Forgot password</span> to reset credentials later.
            </p>
          </div>

          <p className="text-center font-mono text-[10px] tracking-[0.08em] text-[#CCC] mt-5">
            Work3 Labs · Admin Access Only
          </p>
        </div>
      </div>
    </div>
  )
}
