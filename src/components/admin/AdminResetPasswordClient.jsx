'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
/**
 * Work3 Labs — Admin Reset Password
 *
 * Route: /admin/reset-password?token=<TOKEN>
 *
 * Landed on from the reset link sent by /admin/forgot-password.
 * Reads the token from the URL query string, lets admin set a new password,
 * then POSTs to /api/admin/reset-password.
 *
 * States:
 *  - no token in URL         → "invalid link" screen
 *  - valid token, form shown → submit new password
 *  - success                 → confirmation + link to login
 *  - token expired / invalid → error screen with link to try again
 */

import { useState, useRef, useEffect } from 'react'

import { adminResetPassword } from '@/services/api'

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

function StrengthBar({ password }) {
  const score = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
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
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'rgba(0,0,0,0.07)' }} />
        ))}
      </div>
      <p className="text-[11px] font-light" style={{ color: colors[score] || '#CCC' }}>
        {labels[score]}
      </p>
    </div>
  )
}

export default function AdminResetPasswordClient() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors,      setErrors]      = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [done,        setDone]        = useState(false)
  const [tokenError,  setTokenError]  = useState(false)

  const pwdRef = useRef(null)
  useEffect(() => { pwdRef.current?.focus() }, [])

  // If no token in URL — show invalid link screen immediately
  if (!token) {
    return <InvalidLink reason="No reset token found in this link." />
  }

  function validate() {
    const e = {}
    if (!password) {
      e.password = 'Password is required'
    } else if (password.length < 8) {
      e.password = 'Minimum 8 characters'
    }
    if (!confirm) {
      e.confirm = 'Please confirm your password'
    } else if (confirm !== password) {
      e.confirm = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  async function handleSubmit() {
    if (submitting) return
    if (!validate()) return

    setSubmitting(true)
    setErrors({})

    const { error } = await adminResetPassword({ token, password })
    setSubmitting(false)

    if (error) {
      // Token expired or invalid
      if (
        error.includes('400') ||
        error.includes('401') ||
        error.includes('404') ||
        error.toLowerCase().includes('expired') ||
        error.toLowerCase().includes('invalid') ||
        error.toLowerCase().includes('token')
      ) {
        setTokenError(true)
        return
      }
      setErrors({
        server: error.includes('Network') || error.includes('fetch')
          ? 'Unable to connect. Check your internet connection.'
          : error,
      })
      return
    }

    setDone(true)
  }

  //Token expired / invalid screen 
  if (tokenError) {
    return <InvalidLink reason="This reset link has expired or has already been used." showTryAgain />
  }

  //Success screen
  if (done) {
    return (
      <Shell>
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] px-7 py-12 flex flex-col items-center text-center" style={{ animation: 'up 0.35s both' }}>
          <div className="w-14 h-14 rounded-full bg-[#2DFC44] flex items-center justify-center mb-5 pop-anim">
            <i className="bi bi-shield-check text-[22px] text-ink" />
          </div>
          <h2 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink mb-2">
            Password updated
          </h2>
          <p className="text-[13.5px] font-light text-[#888] leading-relaxed mb-7 max-w-[260px]">
            Your admin password has been changed. Sign in with your new credentials.
          </p>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-ink border border-black/[0.12] rounded-full px-5 py-2.5 hover:bg-black/[0.04] transition-colors"
          >
            <i className="bi bi-box-arrow-in-right text-[11px]" />
            Go to login
          </Link>
        </div>
      </Shell>
    )
  }

  //Reset form
  return (
    <div
      className="min-h-screen bg-paper flex flex-col relative overflow-hidden mesh-green-tr mesh-blue-bl"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      <div className="absolute top-5 left-5 sm:top-7 sm:left-7 z-10">
        <Link href="/admin/login"
          className="flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors">
          <i className="bi bi-arrow-left text-[11px]" />
          <span className="hidden sm:inline">Back to login</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-[400px]" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>

          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Work3 Labs" className="h-9 mb-4" />
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#BBB]">Admin Portal</span>
          </div>

          <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] overflow-hidden">

            <div className="px-7 pt-7 pb-6 border-b border-black/[0.06]">
              <h1 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink mb-0.5">
                Set new password
              </h1>
              <p className="text-[13px] font-light text-[#AAA]">
                Choose a strong password for your admin account.
              </p>
            </div>

            <div className="px-7 py-6 space-y-4">
              {errors.server && (
                <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-[10px] px-4 py-3.5" style={{ animation: 'up 0.2s both' }}>
                  <i className="bi bi-shield-exclamation text-red-500 text-[15px] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-red-600 font-light leading-snug">{errors.server}</p>
                </div>
              )}

              {/* New password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="new-password" className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999]">
                    New password
                  </label>
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0">
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  ref={pwdRef}
                  id="new-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: null })) }}
                  onKeyDown={handleKey}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password)}
                  className={inputCls(Boolean(errors.password))}
                />
                {errors.password && (
                  <p role="alert" className="mt-1.5 text-[12px] text-red-500 font-light flex items-center gap-1.5">
                    <i className="bi bi-exclamation-circle text-[11px]" />{errors.password}
                  </p>
                )}
                <StrengthBar password={password} />
              </div>

              {/* Confirm */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="confirm-password" className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999]">
                    Confirm password
                  </label>
                  <button type="button" onClick={() => setShowConfirm(s => !s)}
                    className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0">
                    {showConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(er => ({ ...er, confirm: null })) }}
                  onKeyDown={handleKey}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirm)}
                  className={inputCls(Boolean(errors.confirm))}
                />
                {errors.confirm && (
                  <p role="alert" className="mt-1.5 text-[12px] text-red-500 font-light flex items-center gap-1.5">
                    <i className="bi bi-exclamation-circle text-[11px]" />{errors.confirm}
                  </p>
                )}
              </div>
            </div>

            <div className="px-7 pb-7 space-y-2.5">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 bg-ink text-paper py-3.5 rounded-[10px] font-sans text-[14px] font-medium tracking-[-0.01em] hover:bg-[#1A1A1A] transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={submitting}
              >
                {submitting ? (
                  <><Spinner /><span>Updating…</span></>
                ) : (
                  <><i className="bi bi-shield-lock text-[15px]" />Update password</>
                )}
              </button>

              <Link href="/admin/login"
                className="w-full py-3 rounded-[10px] border border-black/[0.09] text-[#888] font-sans text-[13.5px] font-light hover:border-black/20 hover:text-ink transition-all flex items-center justify-center">
                Cancel
              </Link>
            </div>

          </div>

          <p className="text-center font-mono text-[10px] tracking-[0.08em] text-[#CCC] mt-6">
            Work3 Labs · Admin Access Only
          </p>
        </div>
      </div>
    </div>
  )
}

//Shared sub-components

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 mesh-green-tr mesh-blue-bl" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="w-full max-w-[400px]" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Work3 Labs" className="h-9 mb-4" />
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#BBB]">Admin Portal</span>
        </div>
        {children}
        <p className="text-center font-mono text-[10px] tracking-[0.08em] text-[#CCC] mt-6">
          Work3 Labs · Admin Access Only
        </p>
      </div>
    </div>
  )
}

function InvalidLink({ reason, showTryAgain }) {
  return (
    <Shell>
      <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] px-7 py-12 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <i className="bi bi-link-45deg text-[22px] text-red-400" />
        </div>
        <h2 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink mb-2">
          Invalid link
        </h2>
        <p className="text-[13.5px] font-light text-[#888] leading-relaxed mb-7 max-w-[270px]">
          {reason}
        </p>
        <div className="flex flex-col gap-2.5 w-full">
          {showTryAgain && (
            <Link href="/admin/forgot-password"
              className="w-full py-3 rounded-[10px] bg-ink text-paper font-sans text-[13.5px] font-medium flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-colors">
              <i className="bi bi-arrow-repeat text-[13px]" />
              Request a new link
            </Link>
          )}
          <Link href="/admin/login"
            className="w-full py-3 rounded-[10px] border border-black/[0.09] text-[#888] font-sans text-[13.5px] font-light flex items-center justify-center hover:border-black/20 hover:text-ink transition-all">
            Back to login
          </Link>
        </div>
      </div>
    </Shell>
  )
}