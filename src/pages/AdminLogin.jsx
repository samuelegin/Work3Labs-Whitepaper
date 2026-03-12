import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// ── Shared input token ────────────────────────────────────────────────────────

const INPUT_BASE = [
  'w-full font-sans text-[14px] font-light bg-white text-ink',
  'border rounded-[10px] px-4 py-3 outline-none transition-all',
  'placeholder-[#D0D0D0] appearance-none',
].join(' ')

function inputCls(hasError) {
  return hasError
    ? `${INPUT_BASE} border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]`
    : `${INPUT_BASE} border-black/[0.09] focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]`
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <span
      className="inline-block w-[18px] h-[18px] rounded-full border-2 border-white/25 border-t-white spin-anim flex-shrink-0"
    />
  )
}

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({ id, label, type, value, onChange, onKeyDown, error, placeholder, autoComplete, autoFocus, rightSlot }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999]">
          {label}
        </label>
        {rightSlot}
      </div>
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

// ── AdminLogin ────────────────────────────────────────────────────────────────

export default function AdminLogin() {
  const { login, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const emailRef  = useRef(null)

  // Where to go after login — default to /admin/dashboard
  const from = location.state?.from?.pathname ?? '/admin/dashboard'

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPwd,    setShowPwd]    = useState(false)
  const [errors,     setErrors]     = useState({})     // { email, password, server }
  const [submitting, setSubmitting] = useState(false)

  // Focus email on mount
  useEffect(() => { emailRef.current?.focus() }, [])

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate() {
    const next = {}
    if (!email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address'
    }
    if (!password) {
      next.password = 'Password is required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleReset() {
    setEmail('')
    setPassword('')
    setErrors({})
    emailRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  async function handleSubmit() {
    if (submitting) return
    if (!validate()) return

    setSubmitting(true)
    setErrors(prev => ({ ...prev, server: null }))

    const { error } = await login({ email: email.trim(), password })

    if (error) {
      // Map common server errors to human-readable messages
      const msg =
        error.includes('401') || error.toLowerCase().includes('invalid') || error.toLowerCase().includes('credential')
          ? 'Invalid email or password. Please try again.'
          : error.includes('429')
          ? 'Too many attempts. Please wait a moment and try again.'
          : error.includes('Network') || error.includes('fetch')
          ? 'Unable to connect. Check your internet connection.'
          : error
      setErrors({ server: msg })
      setSubmitting(false)
      return
    }

    navigate(from, { replace: true })
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen bg-paper flex flex-col relative overflow-hidden mesh-green-tr mesh-blue-bl"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      {/* Back to site — top-left */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors"
        >
          <i className="bi bi-arrow-left text-[11px]" />
          <span className="hidden sm:inline">Back to site</span>
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div
          className="w-full max-w-[400px]"
          style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}
        >
          {/* Logo + wordmark */}
          <div className="flex flex-col items-center mb-8 sm:mb-10">
            <img src="/logo.png" alt="Work3 Labs" className="h-9 mb-4" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#BBB]">Admin Portal</span>
          </div>

          {/* Card */}
          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Card header */}
            <div className="px-7 pt-7 pb-6 border-b border-black/[0.06]">
              <h1 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink mb-0.5">
                Sign in
              </h1>
              <p className="text-[13px] font-light text-[#AAA]">
                Work3 Labs admin dashboard
              </p>
            </div>

            {/* Form */}
            <div className="px-7 py-6 space-y-4">
              {/* Server error banner */}
              {errors.server && (
                <div
                  role="alert"
                  className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-[10px] px-4 py-3.5"
                  style={{ animation: 'up 0.2s both' }}
                >
                  <i className="bi bi-shield-exclamation text-red-500 text-[15px] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-600 font-light leading-snug">{errors.server}</p>
                </div>
              )}

              {/* Email */}
              <Field
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: null, server: null })) }}
                onKeyDown={handleKeyDown}
                placeholder="admin@work3labs.com"
                autoComplete="email"
                autoFocus
                error={errors.email}
              />

              {/* Password */}
              <Field
                id="password"
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: null, server: null })) }}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPwd(s => !s)}
                    className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0"
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                }
              />

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  to="/admin/forgot-password"
                  className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#BBB] hover:text-ink transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="px-7 pb-7 space-y-2.5">
              {/* Login */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 bg-ink text-paper py-3.5 rounded-[10px] font-sans text-[14px] font-medium tracking-[-0.01em] hover:bg-[#1A1A1A] active:bg-[#111] transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right text-[15px]" />
                    Sign in
                  </>
                )}
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="w-full py-3 rounded-[10px] border border-black/[0.09] text-[#888] font-sans text-[13.5px] font-light hover:border-black/20 hover:text-ink transition-all bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset form
              </button>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-center font-mono text-[10px] tracking-[0.08em] text-[#CCC] mt-6">
            Work3 Labs · Admin Access Only
          </p>
        </div>
      </div>
    </div>
  )
}
