'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { validateInviteToken, acceptAdminInvite } from '@/services/api'

const INPUT_BASE = [
  'w-full font-sans text-[14px] font-light bg-white text-ink',
  'border rounded-[10px] px-4 py-3 outline-none transition-all',
  'placeholder-[#D0D0D0] appearance-none',
].join(' ')

const inputCls = (err) => err
  ? `${INPUT_BASE} border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]`
  : `${INPUT_BASE} border-black/[0.09] focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]`

function Spinner({ size = 18, dark = false }) {
  return (
    <span
      className={`inline-block rounded-full border-2 flex-shrink-0 spin-anim ${dark ? 'border-black/10 border-t-ink' : 'border-white/25 border-t-white'}`}
      style={{ width: size, height: size }}
    />
  )
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

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 py-16 mesh-green-tr mesh-blue-bl"
      style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="w-full max-w-[420px]" style={{ animation: 'up 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Work3 Labs" className="h-9 mb-4" />
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#BBB]">Admin Portal</span>
        </div>
        {children}
        <p className="text-center font-mono text-[10px] tracking-[0.08em] text-[#CCC] mt-5">
          Work3 Labs · Admin Access Only
        </p>
      </div>
    </div>
  )
}

function AdminAcceptInvite() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [stage, setStage] = useState('validating')
  const [inviteEmail, setInviteEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting]  = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (!token) { setStage('invalid'); return }

    validateInviteToken(token).then(({ data, error }) => {
      if (error || !data?.valid) {
        setStage('invalid')
      } else {
        setInviteEmail(data.email ?? '')
        setStage('form')
        setTimeout(() => nameRef.current?.focus(), 100)
      }
    })
  }, [token])

  function validate() {
    const e = {}
    if (!name.trim())    e.name = 'Full name is required'
    if (!password)       e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Minimum 8 characters'
    if (!confirm)        e.confirm = 'Please confirm your password'
    else if (confirm !== password) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  async function handleSubmit() {
    if (submitting) return
    if (!validate()) return
    setSubmitting(true)
    setErrors({})

    const { data, error } = await acceptAdminInvite({ token, name: name.trim(), password })
    setSubmitting(false)

    if (error) {
      if (error.includes('400') || error.includes('404') ||
          error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid')) {
        setStage('invalid')
        return
      }
      setErrors({ server: error.includes('Network') || error.includes('fetch')
        ? 'Unable to connect. Check your internet connection.'
        : error })
      return
    }

    if (data?.token) {
      
    }
    setStage('done')
  }

  if (stage === 'validating') {
    return (
      <Shell>
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] px-7 py-14 flex flex-col items-center">
          <Spinner size={28} dark />
          <p className="mt-4 text-[13.5px] font-light text-[#AAA]">Validating invite…</p>
        </div>
      </Shell>
    )
  }

  //Invalid / expired
  if (stage === 'invalid') {
    return (
      <Shell>
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] px-7 py-12 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
            <i className="bi bi-envelope-x text-[22px] text-red-400" />
          </div>
          <h2 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink mb-2">
            Invalid invite
          </h2>
          <p className="text-[13.5px] font-light text-[#888] leading-relaxed mb-7 max-w-[270px]">
            This invite link has expired, already been used, or is invalid. Ask the owner to send a new invite.
          </p>
          <Link href="/admin/login"
            className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink border border-black/[0.12] rounded-full px-5 py-2.5 hover:bg-black/[0.04] transition-colors">
            Back to login
          </Link>
        </div>
      </Shell>
    )
  }

  if (stage === 'done') {
    return (
      <Shell>
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] px-7 py-12 flex flex-col items-center text-center"
          style={{ animation: 'up 0.35s both' }}>
          <div className="w-14 h-14 rounded-full bg-[#2DFC44] flex items-center justify-center mb-5 pop-anim">
            <i className="bi bi-person-check text-[22px] text-ink" />
          </div>
          <h2 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink mb-2">
            Account activated
          </h2>
          <p className="text-[13.5px] font-light text-[#888] leading-relaxed mb-7 max-w-[260px]">
            Your admin account is ready. Sign in to access the dashboard.
          </p>
          <Link href="/admin/dashboard"
            className="flex items-center gap-2 bg-ink text-paper font-sans text-[13.5px] font-medium px-6 py-3 rounded-[10px] hover:bg-[#1A1A1A] transition-colors">
            <i className="bi bi-box-arrow-in-right text-[14px]" />
            Go to dashboard
          </Link>
        </div>
      </Shell>
    )
  }

  // Form 
  return (
    <Shell>
      <div className="bg-white border border-black/[0.07] rounded-2xl shadow-[0_2px_40px_rgba(0,0,0,0.06)] overflow-hidden">

        {/* Header */}
        <div className="px-7 pt-7 pb-6 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#2DFC44] flex items-center justify-center flex-shrink-0">
              <i className="bi bi-person-plus text-[13px] text-ink" />
            </div>
            <h1 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink">
              Set up your account
            </h1>
          </div>
          {inviteEmail && (
            <p className="text-[13px] font-light text-[#AAA]">
              Invited as <span className="text-ink font-medium">{inviteEmail}</span>
            </p>
          )}
        </div>

        {/* Fields */}
        <div className="px-7 py-6 space-y-4">

          {errors.server && (
            <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-[10px] px-4 py-3.5"
              style={{ animation: 'up 0.2s both' }}>
              <i className="bi bi-shield-exclamation text-red-500 text-[15px] flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-600 font-light leading-snug">{errors.server}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="inv-name" className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-1.5">
              Full name
            </label>
            <input ref={nameRef} id="inv-name" type="text" value={name}
              onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: null })) }}
              onKeyDown={handleKey} placeholder="Your name" autoComplete="name"
              aria-invalid={Boolean(errors.name)} className={inputCls(errors.name)} />
            {errors.name && (
              <p role="alert" className="mt-1.5 text-[12px] text-red-500 font-light flex items-center gap-1.5">
                <i className="bi bi-exclamation-circle text-[11px]" />{errors.name}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="inv-pwd" className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999]">
                Password
              </label>
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0">
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            <input id="inv-pwd" type={showPwd ? 'text' : 'password'} value={password}
              onChange={e => { setPassword(e.target.value); setErrors(er => ({ ...er, password: null })) }}
              onKeyDown={handleKey} placeholder="Min. 8 characters" autoComplete="new-password"
              aria-invalid={Boolean(errors.password)} className={inputCls(errors.password)} />
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
              <label htmlFor="inv-conf" className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999]">
                Confirm password
              </label>
              <button type="button" onClick={() => setShowConf(s => !s)}
                className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#CCC] hover:text-[#999] transition-colors bg-transparent border-none cursor-pointer p-0">
                {showConf ? 'Hide' : 'Show'}
              </button>
            </div>
            <input id="inv-conf" type={showConf ? 'text' : 'password'} value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors(er => ({ ...er, confirm: null })) }}
              onKeyDown={handleKey} placeholder="Re-enter password" autoComplete="new-password"
              aria-invalid={Boolean(errors.confirm)} className={inputCls(errors.confirm)} />
            {errors.confirm && (
              <p role="alert" className="mt-1.5 text-[12px] text-red-500 font-light flex items-center gap-1.5">
                <i className="bi bi-exclamation-circle text-[11px]" />{errors.confirm}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="px-7 pb-7">
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full flex items-center justify-center gap-2.5 bg-ink text-paper py-3.5 rounded-[10px] font-sans text-[14px] font-medium tracking-[-0.01em] hover:bg-[#1A1A1A] transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={submitting}>
            {submitting
              ? <><Spinner />Activating…</>
              : <><i className="bi bi-person-check text-[15px]" />Activate account</>}
          </button>
        </div>

      </div>
    </Shell>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <AdminAcceptInvite />
    </Suspense>
  )
}