'use client'
import Link from 'next/link'
/**
 * Work3 Labs — Admin Dashboard
 *
 * Tabs:
 *  1. Talent Applications  — review, approve, reject, bulk, broadcast
 *  2. Project Applications — same
 *  3. Pods — view user-created pods, match to project, pass/fail work, release escrow, unmatch
 *  4. Waitlist — view + delete waitlist signups
 *  5. Activity — recent platform activity feed
 *  6. Team (owner only) — invite, remove admins
 */

import { useState, useMemo, useEffect } from 'react'
import { useApplicants } from '@/hooks/useApplicants'
import { usePods } from '@/hooks/usePods'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchApplicants,
  fetchAdmins, inviteAdmin, removeAdmin, cancelInvite, resendInvite,
  fetchWaitlist, deleteWaitlistEntry,
  fetchActivity,
} from '@/services/api'

//Design tokens

const STATUS = {
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400', label: 'Pending'  },
  approved: { bg: 'bg-[#F0FDF4]', text: 'text-green-700', dot: 'bg-green-500', label: 'Approved' },
  rejected: { bg: 'bg-red-50',    text: 'text-red-600',   dot: 'bg-red-400',   label: 'Rejected' },
}

const POD_STATUS = {
  unmatched: { bg: 'bg-black/[0.04]', text: 'text-[#999]',     dot: 'bg-[#CCC]',    label: 'Unmatched' },
  matched:   { bg: 'bg-blue-50',      text: 'text-blue-700',   dot: 'bg-blue-400',  label: 'Matched'   },
  passed:    { bg: 'bg-[#F0FDF4]',    text: 'text-green-700',  dot: 'bg-green-500', label: 'Passed'    },
  failed:    { bg: 'bg-red-50',       text: 'text-red-600',    dot: 'bg-red-400',   label: 'Failed'    },
  released:  { bg: 'bg-purple-50',    text: 'text-purple-700', dot: 'bg-purple-400',label: 'Released'  },
}

const INPUT = [
  'w-full font-sans text-[13px] font-light bg-white',
  'border border-black/[0.09] rounded-[10px] px-4 py-3',
  'outline-none transition-all text-ink placeholder-[#D0D0D0]',
  'focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]',
].join(' ')

const SORTABLE_COLS = ['applied', 'country', 'status']

//Atoms 

function StatusBadge({ status, map = STATUS }) {
  const s = map[status] ?? map[Object.keys(map)[0]]
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  )
}

function Spinner({ size = 20, light = true }) {
  return (
    <span
      className={`inline-block rounded-full border-2 flex-shrink-0 spin-anim ${light ? 'border-white/25 border-t-white' : 'border-black/10 border-t-ink'}`}
      style={{ width: size, height: size }}
    />
  )
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 bg-red-50 border border-red-100 rounded-[12px] mb-6">
      <span className="text-[13px] text-red-600 font-light flex items-center gap-2">
        <i className="bi bi-exclamation-circle" /> {message}
      </span>
      {onRetry && (
        <button onClick={onRetry} className="font-mono text-[10px] tracking-[0.1em] uppercase text-red-600 border border-red-200 rounded-full px-3 py-1.5 bg-transparent cursor-pointer hover:bg-red-100 transition-colors flex-shrink-0">
          Retry
        </button>
      )}
    </div>
  )
}

function Toast({ message, type = 'success' }) {
  const err = type === 'error'
  return (
    <div className={`fixed bottom-5 right-5 left-5 sm:left-auto z-[999] px-5 py-3 rounded-[10px] text-[13px] font-light tracking-[-0.01em] flex items-center gap-2 shadow-xl sm:max-w-[340px] ${err ? 'bg-red-500 text-white' : 'bg-ink text-paper'}`}
      style={{ animation: 'up 0.3s both' }}>
      <i className={`bi ${err ? 'bi-exclamation-circle' : 'bi-check2'} text-[15px] flex-shrink-0 ${err ? '' : 'text-[#2DFC44]'}`} />
      {message}
    </div>
  )
}

function SortTh({ col, label, sort, dir, onSort }) {
  const active = sort === col
  return (
    <th
      onClick={() => SORTABLE_COLS.includes(col) ? onSort(col) : null}
      className={`px-5 py-3.5 text-left font-mono text-[9px] tracking-[0.14em] uppercase font-normal whitespace-nowrap select-none
        ${SORTABLE_COLS.includes(col) ? 'cursor-pointer hover:text-ink transition-colors' : ''}
        ${active ? 'text-ink' : 'text-[#BBB]'}`}
    >
      <span className="flex items-center gap-1">
        {label}
        {SORTABLE_COLS.includes(col) && (
          <span className={`text-[10px] transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`}>
            {active && dir === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </span>
    </th>
  )
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = totalPages <= 7 ? pages : [
    ...pages.slice(0, Math.min(3, page - 1)),
    ...(page > 4 ? ['…'] : []),
    ...(page > 3 && page < totalPages - 2 ? [page] : []),
    ...(page < totalPages - 3 ? ['…'] : []),
    ...pages.slice(Math.max(totalPages - 3, page)),
  ].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <div className="flex items-center justify-center gap-1 pt-6 pb-2">
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-black/[0.09] bg-transparent text-[#888] hover:border-ink hover:text-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[12px]">
        <i className="bi bi-chevron-left" />
      </button>
      {visible.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center font-mono text-[11px] text-[#CCC]">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-full font-mono text-[11px] transition-all cursor-pointer border
              ${p === page ? 'bg-ink text-paper border-transparent' : 'border-black/[0.09] text-[#888] bg-transparent hover:border-ink hover:text-ink'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-black/[0.09] bg-transparent text-[#888] hover:border-ink hover:text-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[12px]">
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  )
}

// Modals

function ApproveModal({ applicant, onConfirm, onClose }) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  async function handleConfirm() {
    setSubmitting(true)
    await onConfirm(applicant.id, { note: note.trim() })
    setSubmitting(false)
  }
  return (
    <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper w-full sm:max-w-[460px] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-black/[0.07]"
        style={{ animation: 'up 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-black/[0.07]">
          <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#AAA] block mb-1.5">Approve Applicant</span>
          <h3 className="font-serif text-[20px] sm:text-[22px] font-light tracking-[-0.04em] text-ink">{applicant.fn} {applicant.ln}</h3>
          <p className="text-[13px] font-light text-[#AAA] mt-0.5 break-all">{applicant.email}</p>
        </div>
        <div className="px-6 sm:px-7 py-6 space-y-5">
          <div className="flex items-start gap-3 bg-[#F4FAF7] border border-green-dark/10 rounded-[10px] px-4 py-3.5">
            <i className="bi bi-send-check text-green-dark text-[15px] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-ink tracking-[-0.01em] mb-0.5">Invite link generated automatically</p>
              <p className="text-[12px] font-light text-[#888] leading-relaxed">A unique, time-limited link will be created and sent to {applicant.email}.</p>
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">
              Personal Note <span className="normal-case text-[#D0D0D0]">(optional)</span>
            </label>
            <textarea className={`${INPUT} resize-none leading-relaxed`} rows={3} value={note}
              onChange={e => setNote(e.target.value)} placeholder="Add a personal message…" autoFocus />
          </div>
        </div>
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={onClose} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer">Cancel</button>
          <button onClick={handleConfirm} disabled={submitting}
            className="flex-1 bg-ink text-paper py-3 rounded-[10px] text-[14px] font-medium tracking-[-0.01em] hover:bg-[#222] transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting ? <Spinner /> : <i className="bi bi-check-lg" />}
            Approve & Send Invite
          </button>
        </div>
      </div>
    </div>
  )
}

function BulkModal({ count, action, onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false)
  const isApprove = action === 'approve'
  async function go() { setSubmitting(true); await onConfirm(); setSubmitting(false) }
  return (
    <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper w-full sm:max-w-[400px] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-black/[0.07]"
        style={{ animation: 'up 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-black/[0.07]">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isApprove ? 'bg-[#F0FDF4]' : 'bg-red-50'}`}>
            <i className={`bi ${isApprove ? 'bi-check-lg text-green-700' : 'bi-x-lg text-red-500'} text-[18px]`} />
          </div>
          <h3 className="font-serif text-[20px] font-light tracking-[-0.04em] text-ink mb-1.5">
            {isApprove ? 'Approve' : 'Reject'} {count} applicant{count !== 1 ? 's' : ''}?
          </h3>
          <p className="text-[13px] font-light text-[#888] leading-relaxed">
            {isApprove ? 'Each will receive a unique invite email automatically.' : 'Selected applicants will be marked as rejected.'}
          </p>
        </div>
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-5 flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={onClose} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer">Cancel</button>
          <button onClick={go} disabled={submitting}
            className={`flex-1 text-white py-3 rounded-[10px] text-[14px] font-medium tracking-[-0.01em] transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40
              ${isApprove ? 'bg-ink hover:bg-[#222]' : 'bg-red-500 hover:bg-red-600'}`}>
            {submitting ? <Spinner /> : <i className={`bi ${isApprove ? 'bi-check-lg' : 'bi-x-lg'}`} />}
            {isApprove ? 'Approve' : 'Reject'} {count}
          </button>
        </div>
      </div>
    </div>
  )
}

function BroadcastModal({ type, recipients, onSend, onClose }) {
  const DEFAULT_SUBJECT = {
    talent:  "You've been approved to join Work3 Labs",
    project: "Your project has been accepted — Work3 Labs",
  }
  const DEFAULT_BODY = {
    talent:  `Hi {{first_name}},\n\nYou've been approved to join Work3 Labs as a Talent.\n\nClick the link below to access your dashboard:\n{{dashboard_link}}\n\nWelcome to the execution layer.\n\n— The Work3 Labs Team`,
    project: `Hi {{first_name}},\n\nYour project application has been accepted by Work3 Labs.\n\nAccess your project dashboard here:\n{{dashboard_link}}\n\nLet's ship.\n\n— The Work3 Labs Team`,
  }
  const [subject, setSubject] = useState(DEFAULT_SUBJECT[type])
  const [body, setBody] = useState(DEFAULT_BODY[type])
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const label = type === 'talent' ? 'Talent' : 'Project'

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return
    setSubmitting(true)
    await onSend({ type, subject: subject.trim(), body: body.trim(), recipientIds: recipients.map(r => r.id) })
    setSubmitting(false)
    setSent(true)
    setTimeout(onClose, 2000)
  }

  return (
    <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={!submitting ? onClose : undefined} />
      <div className="relative bg-paper w-full sm:max-w-[560px] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-black/[0.07]"
        style={{ animation: 'up 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
        {sent ? (
          <div className="px-10 py-14 text-center flex flex-col items-center" style={{ animation: 'up 0.3s both' }}>
            <div className="w-14 h-14 rounded-full bg-[#2DFC44] flex items-center justify-center mb-5">
              <i className="bi bi-check-lg text-[24px] text-ink" />
            </div>
            <h3 className="font-serif text-[24px] font-light tracking-[-0.04em] text-ink mb-2">Emails queued</h3>
            <p className="text-[13px] font-light text-[#999]">{recipients.length} approved {label.toLowerCase()}{recipients.length !== 1 ? 's' : ''} will receive this message.</p>
          </div>
        ) : (
          <>
            <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-black/[0.07]">
              <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#AAA] block mb-1.5">Broadcast — {label}s</span>
              <h3 className="font-serif text-[20px] sm:text-[22px] font-light tracking-[-0.04em] text-ink">Message Approved {label}s</h3>
              <p className="text-[13px] font-light text-[#AAA] mt-0.5">Sending to <strong className="text-ink font-medium">{recipients.length}</strong> recipient{recipients.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="px-6 sm:px-7 py-6 space-y-4 max-h-[55vh] overflow-y-auto">
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">Recipients</label>
                <div className="flex flex-wrap gap-1.5">
                  {recipients.map(r => (
                    <span key={r.id} className="font-mono text-[10px] bg-black/[0.04] border border-black/[0.07] rounded-full px-2.5 py-1 text-[#666]">{r.fn} {r.ln}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">Subject</label>
                <input className={INPUT} value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">Body — use {'{{first_name}}'} and {'{{dashboard_link}}'}</label>
                <textarea className={`${INPUT} resize-none leading-relaxed font-mono text-[12px]`} rows={10} value={body} onChange={e => setBody(e.target.value)} />
              </div>
            </div>
            <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex flex-col-reverse sm:flex-row gap-3 border-t border-black/[0.07] pt-5">
              <button onClick={onClose} disabled={submitting} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer disabled:opacity-40">Cancel</button>
              <button onClick={handleSend} disabled={!subject.trim() || !body.trim() || submitting}
                className="flex-1 bg-ink text-paper py-3 rounded-[10px] text-[14px] font-medium tracking-[-0.01em] hover:bg-[#222] transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? <Spinner /> : <i className="bi bi-send" />}
                Send to {recipients.length}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ResetModal({ onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false)
  async function go() { setSubmitting(true); await onConfirm(); setSubmitting(false) }
  return (
    <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={!submitting ? onClose : undefined} />
      <div className="relative bg-paper w-full sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-black/[0.07]"
        style={{ animation: 'up 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-black/[0.07]">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <i className="bi bi-exclamation-triangle text-[18px] text-red-500" />
          </div>
          <h3 className="font-serif text-[20px] font-light tracking-[-0.04em] text-ink mb-1.5">Reset all applications?</h3>
          <p className="text-[13px] font-light text-[#888] leading-relaxed">Permanently deletes all applicant records. Use only for testing or a scheduled cycle reset.</p>
        </div>
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-5 flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={onClose} disabled={submitting} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer disabled:opacity-40">Cancel</button>
          <button onClick={go} disabled={submitting}
            className="flex-1 bg-red-500 text-white py-3 rounded-[10px] text-[14px] font-medium tracking-[-0.01em] hover:bg-red-600 transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40">
            {submitting ? <Spinner /> : <i className="bi bi-trash3" />}
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  )
}

//Pod detail modal

function PodDetailModal({ pod, projects, onMatch, onUnmatch, onPass, onFail, onRelease, onClose, showToast }) {
  const [failReason,  setFailReason]  = useState('')
  const [showFail,    setShowFail]    = useState(false)
  const [selectedProj,setSelectedProj]= useState(pod.projectId ?? '')
  const [submitting,  setSubmitting]  = useState(null) // 'match'|'unmatch'|'pass'|'fail'|'release'

  const totalSplit = (pod.members ?? []).reduce((s, m) => s + (m.split || 0), 0)
  const splitOk    = totalSplit === 100

  async function handle(action, fn) {
    setSubmitting(action)
    const { error } = await fn()
    setSubmitting(null)
    if (error) showToast(error, 'error')
    else { showToast(`Pod ${action}d successfully`); onClose() }
  }

  return (
    <div className="fixed inset-0 z-[900] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl border border-black/[0.07]"
        style={{ animation: 'up 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* Header */}
        <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-black/[0.07] flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#AAA] block mb-1">Pod Detail</span>
            <h3 className="font-serif text-[22px] font-light tracking-[-0.04em] text-ink">{pod.name}</h3>
            {pod.description && <p className="text-[13px] font-light text-[#999] mt-1 leading-relaxed">{pod.description}</p>}
          </div>
          <StatusBadge status={pod.status ?? 'unmatched'} map={POD_STATUS} />
        </div>

        <div className="px-6 sm:px-7 py-6 space-y-6">

          {/* Members + split */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#AAA] mb-3">
              Members — {(pod.members ?? []).length}
            </p>
            <div className="space-y-2">
              {(pod.members ?? []).map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 bg-black/[0.02] border border-black/[0.06] rounded-[10px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center flex-shrink-0">
                      <span className="font-mono text-[10px] text-[#888]">{(m.name || '?')[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink truncate">{m.name}</p>
                      {m.description && <p className="text-[11.5px] font-light text-[#AAA] truncate">{m.description}</p>}
                    </div>
                  </div>
                  {m.split != null && (
                    <span className={`font-mono text-[13px] font-medium flex-shrink-0 ${splitOk ? 'text-[#1DC433]' : 'text-amber-500'}`}>
                      {m.split}%
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* Split total */}
            {(pod.members ?? []).some(m => m.split != null) && (
              <div className="flex justify-between items-center mt-3 px-4 py-2.5 rounded-[10px] border border-black/[0.06]">
                <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#CCC]">Total split</span>
                <span className={`font-mono text-[13px] font-medium ${splitOk ? 'text-[#1DC433]' : 'text-amber-500'}`}>
                  {totalSplit}% {!splitOk && '— must equal 100%'}
                </span>
              </div>
            )}
          </div>

          {/* Pod admin */}
          {pod.adminName && (
            <div className="flex items-center gap-2 text-[12.5px] font-light text-[#999]">
              <i className="bi bi-person-gear text-[14px]" />
              Pod admin: <span className="text-ink font-medium">{pod.adminName}</span>
            </div>
          )}

          {/* Match to project */}
          {(!pod.matched && pod.status !== 'matched' && pod.status !== 'passed' && pod.status !== 'released') && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#AAA] mb-2">Assign to Project</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select className={`${INPUT} appearance-none pr-9 cursor-pointer`}
                    value={selectedProj} onChange={e => setSelectedProj(e.target.value)}>
                    <option value="" disabled>Select project…</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.fn} {p.ln} — @{p.username}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="7" viewBox="0 0 11 7">
                    <path d="M1 1l4.5 4.5L10 1" stroke="#AAAAAA" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <button
                  onClick={() => handle('match', () => onMatch(pod.id, selectedProj))}
                  disabled={!selectedProj || submitting === 'match'}
                  className="flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-[10px] font-medium text-[13px] hover:bg-[#222] transition-colors border-none cursor-pointer disabled:opacity-40 whitespace-nowrap">
                  {submitting === 'match' ? <Spinner size={16} /> : <i className="bi bi-arrow-left-right" />}
                  Match
                </button>
              </div>
            </div>
          )}

          {/* Pass / Fail — matched pods only */}
          {(pod.status === 'matched') && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#AAA] mb-3">Work Outcome</p>
              {!showFail ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handle('pass', () => onPass(pod.id))}
                    disabled={submitting === 'pass'}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#F0FDF4] border border-green-dark/15 text-green-700 py-3 rounded-[10px] font-medium text-[13px] hover:bg-[#e0faf0] transition-colors border-none cursor-pointer disabled:opacity-40">
                    {submitting === 'pass' ? <Spinner size={16} light={false} /> : <i className="bi bi-check2-circle text-[15px]" />}
                    Mark as Passed
                  </button>
                  <button
                    onClick={() => setShowFail(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 py-3 rounded-[10px] font-medium text-[13px] hover:bg-red-100 transition-colors cursor-pointer">
                    <i className="bi bi-x-circle text-[15px]" />
                    Mark as Failed
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea className={`${INPUT} resize-none`} rows={3}
                    value={failReason} onChange={e => setFailReason(e.target.value)}
                    placeholder="Reason for failure (optional)…" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => setShowFail(false)}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[13px] font-light bg-transparent cursor-pointer hover:border-black/25 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={() => handle('fail', () => onFail(pod.id, failReason))}
                      disabled={submitting === 'fail'}
                      className="flex-1 bg-red-500 text-white py-3 rounded-[10px] font-medium text-[13px] hover:bg-red-600 transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40">
                      {submitting === 'fail' ? <Spinner size={16} /> : <i className="bi bi-x-circle" />}
                      Confirm Failure
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Release escrow — passed pods only */}
          {pod.status === 'passed' && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#AAA] mb-3">Escrow</p>
              <button
                onClick={() => handle('release', () => onRelease(pod.id))}
                disabled={submitting === 'release'}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3.5 rounded-[10px] font-medium text-[14px] hover:bg-purple-700 transition-colors border-none cursor-pointer disabled:opacity-40">
                {submitting === 'release' ? <Spinner /> : <i className="bi bi-safe2 text-[16px]" />}
                Release Escrow to Members
              </button>
              <p className="text-[11.5px] font-light text-[#AAA] text-center mt-2">
                Funds will be distributed according to each member's split percentage.
              </p>
            </div>
          )}

          {/* Unmatch */}
          {(pod.status === 'matched') && (
            <div className="pt-2 border-t border-black/[0.06]">
              <button
                onClick={() => handle('unmatch', () => onUnmatch(pod.id))}
                disabled={!!submitting}
                className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#CCC] hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5 disabled:opacity-40">
                <i className="bi bi-x-circle text-[12px]" />
                Unmatch from project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Pod matching panel

function PodMatchingPanel({ pods, loadingPods, onMatch, onUnmatch, onPass, onFail, onRelease, showToast }) {
  const [projects, setProjects] = useState([])
  const [loadingP, setLoadingP] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter]   = useState('all')
  const [detailPod, setDetailPod]   = useState(null)
  const [matched, setMatched]     = useState(null)

  useState(() => {
    let active = true
    async function load() {
      setLoadingP(true)
      const { data, error } = await fetchApplicants({ type: 'project', status: 'approved', limit: 200 })
      if (!active) return
      if (!error) setProjects(Array.isArray(data) ? data : (data?.data ?? []))
      setLoadingP(false)
    }
    load()
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return pods.filter(p => {
      const matchQ = !q || p.name?.toLowerCase().includes(q) || p.adminName?.toLowerCase().includes(q)
      const matchF = filter === 'all' || (p.status ?? 'unmatched') === filter
      return matchQ && matchF
    })
  }, [pods, search, filter])

  async function handleMatch(podId, projectId) {
    const { error } = await onMatch(podId, projectId)
    if (error) { showToast(error, 'error'); return { error } }
    setMatched(pods.find(p => p.id === podId))
    return { error: null }
  }

  const counts = useMemo(() => {
    const c = { all: pods.length, unmatched: 0, matched: 0, passed: 0, failed: 0, released: 0 }
    pods.forEach(p => { const s = p.status ?? 'unmatched'; if (c[s] !== undefined) c[s]++ })
    return c
  }, [pods])

  return (
    <div>
      {/* Success banner */}
      {matched && (
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-[#F0FDF4] border border-green-dark/10 rounded-[12px] mb-6"
             style={{ animation: 'up 0.25s both' }}>
          <div className="flex items-center gap-3">
            <i className="bi bi-check2-circle text-green-700 text-[18px]" />
            <p className="text-[13.5px] font-medium text-ink">{matched.name} matched successfully.</p>
          </div>
          <button onClick={() => setMatched(null)}
            className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#999] border border-black/[0.1] rounded-full px-3 py-1.5 bg-transparent cursor-pointer flex-shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 sm:max-w-[240px]">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#CCC] pointer-events-none" />
          <input
            className="font-sans text-[13px] font-light bg-white border border-black/[0.09] rounded-[9px] pl-8 pr-4 py-2 outline-none focus:border-[#1DC433] transition-all w-full placeholder-[#D8D8D8]"
            placeholder="Search pods…" value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {Object.entries(counts).map(([f, n]) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full border cursor-pointer transition-all
                ${filter === f ? 'bg-ink text-paper border-transparent' : 'text-[#AAA] border-black/[0.1] bg-transparent hover:border-black/20'}`}>
              {f} {n > 0 && <span className="ml-1 opacity-60">{n}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Pod grid */}
      {loadingPods ? (
        <div className="flex justify-center py-16"><Spinner size={24} light={false} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <i className="bi bi-people text-[40px] text-[#E0E0E0] block mb-3" />
          <p className="text-[14px] font-light text-[#CCC]">{pods.length === 0 ? 'No pods yet — pods are created by talents on the platform.' : 'No pods match your filter.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(pod => {
            const status = pod.status ?? 'unmatched'
            const totalSplit = (pod.members ?? []).reduce((s, m) => s + (m.split || 0), 0)
            return (
              <div key={pod.id}
                onClick={() => setDetailPod(pod)}
                className="bg-white border border-black/[0.07] rounded-[14px] p-5 cursor-pointer hover:border-black/20 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-serif text-[16px] font-light tracking-[-0.02em] text-ink leading-tight">{pod.name}</h3>
                  <StatusBadge status={status} map={POD_STATUS} />
                </div>
                {pod.description && (
                  <p className="text-[12px] font-light text-[#999] mb-3 line-clamp-2 leading-relaxed">{pod.description}</p>
                )}
                <div className="flex items-center justify-between text-[11.5px] font-light text-[#BBB]">
                  <span className="flex items-center gap-1.5">
                    <i className="bi bi-people text-[12px]" />
                    {(pod.members ?? []).length} members
                    {(pod.members ?? []).some(m => m.split != null) && (
                      <span className={`font-mono ml-1 ${totalSplit === 100 ? 'text-[#1DC433]' : 'text-amber-400'}`}>
                        {totalSplit}%
                      </span>
                    )}
                  </span>
                  {pod.adminName && <span className="truncate max-w-[120px]">{pod.adminName}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pod detail modal */}
      {detailPod && (
        <PodDetailModal
          pod={detailPod}
          projects={projects}
          onMatch={handleMatch}
          onUnmatch={onUnmatch}
          onPass={onPass}
          onFail={onFail}
          onRelease={onRelease}
          onClose={() => setDetailPod(null)}
          showToast={showToast}
        />
      )}
    </div>
  )
}

// ── Waitlist panel 

function WaitlistPanel({ showToast }) {
  const [entries,    setEntries]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [deleting,   setDeleting]   = useState(null)
  const [search,     setSearch]     = useState('')

  async function load(p = 1) {
    setLoading(true); setError(null)
    const { data, error } = await fetchWaitlist({ page: p, limit: 50 })
    setLoading(false)
    if (error) { setError(error); return }
    const list = Array.isArray(data) ? data : (data?.data ?? [])
    setEntries(list)
    setTotal(data?.total ?? list.length)
    setTotalPages(data?.totalPages ?? 1)
    setPage(p)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    setDeleting(id)
    const { error } = await deleteWaitlistEntry(id)
    setDeleting(null)
    if (error) { showToast(error, 'error'); return }
    setEntries(prev => prev.filter(e => e.id !== id))
    setTotal(t => t - 1)
    showToast('Entry removed')
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return !q ? entries : entries.filter(e => e.email?.toLowerCase().includes(q) || e.role?.toLowerCase().includes(q))
  }, [entries, search])

  return (
    <div>
      {error && <ErrorBanner message={error} onRetry={() => load(page)} />}

      {/* Stats + search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="bg-white border border-black/[0.07] rounded-[12px] px-5 py-4 flex items-center gap-4">
          <span className="font-serif text-[32px] font-light text-ink tracking-[-0.05em]">{loading ? '—' : total}</span>
          <div>
            <p className="font-medium text-[12px] text-ink">Total Signups</p>
            <p className="text-[11px] font-light text-[#AAA]">Waitlist entries</p>
          </div>
        </div>
        <div className="relative sm:w-[240px]">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#CCC] pointer-events-none" />
          <input
            className="font-sans text-[13px] font-light bg-white border border-black/[0.09] rounded-[9px] pl-8 pr-4 py-2 outline-none focus:border-[#1DC433] transition-all w-full placeholder-[#D8D8D8]"
            placeholder="Search by email…" value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={24} light={false} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <i className="bi bi-envelope text-[40px] text-[#E0E0E0] block mb-3" />
          <p className="text-[14px] font-light text-[#CCC]">{entries.length === 0 ? 'No waitlist signups yet.' : 'No entries match your search.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-black/[0.07]">
                <th className="px-5 py-3.5 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-[#BBB] font-normal">Email</th>
                <th className="px-5 py-3.5 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-[#BBB] font-normal">Role</th>
                <th className="px-5 py-3.5 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-[#BBB] font-normal">Signed up</th>
                <th className="px-5 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-black/[0.05] hover:bg-black/[0.015] transition-colors">
                  <td className="px-5 py-3.5 text-[13px] font-light text-ink">{e.email}</td>
                  <td className="px-5 py-3.5">
                    {e.role && (
                      <span className="font-mono text-[10px] tracking-wide bg-black/[0.04] border border-black/[0.07] rounded-full px-2.5 py-1 text-[#666]">{e.role}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-[#BBB] whitespace-nowrap">
                    {e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-3 py-3.5">
                    <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#CCC] hover:text-red-500 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer disabled:opacity-40">
                      {deleting === e.id ? <Spinner size={14} light={false} /> : <i className="bi bi-trash3 text-[12px]" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPage={p => load(p)} />
        </div>
      )}
    </div>
  )
}

// ── Activity panel

function ActivityPanel() {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await fetchActivity({ limit: 50 })
    setLoading(false)
    if (error) { setError(error); return }
    setEvents(Array.isArray(data) ? data : (data?.events ?? []))
  }

  useEffect(() => { load() }, [])

  function timeAgo(iso) {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 2)   return 'Just now'
    if (mins < 60)  return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30)  return `${days}d ago`
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const ICONS = {
    applicant_approved: 'bi-check2-circle text-green-600',
    applicant_rejected: 'bi-x-circle text-red-400',
    applicant_applied:  'bi-person-plus text-blue-500',
    pod_created:        'bi-people text-purple-500',
    pod_matched:        'bi-arrow-left-right text-blue-600',
    pod_passed:         'bi-trophy text-green-600',
    pod_failed:         'bi-x-octagon text-red-400',
    escrow_released:    'bi-safe2 text-purple-600',
    waitlist_signup:    'bi-envelope-check text-[#1DC433]',
    admin_invited:      'bi-shield-plus text-amber-500',
  }

  return (
    <div>
      {error && <ErrorBanner message={error} onRetry={load} />}

      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA]">Recent Activity</p>
        <button onClick={load} className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#BBB] hover:text-ink transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5">
          <i className="bi bi-arrow-clockwise text-[12px]" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={24} light={false} /></div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center">
          <i className="bi bi-clock-history text-[40px] text-[#E0E0E0] block mb-3" />
          <p className="text-[14px] font-light text-[#CCC]">No activity yet.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-black/[0.06]" />
          <div className="space-y-1">
            {events.map((ev, i) => {
              const iconCls = ICONS[ev.type] ?? 'bi-dot text-[#CCC]'
              return (
                <div key={ev.id ?? i} className="flex items-start gap-4 pl-0">
                  {/* Icon */}
                  <div className="w-10 h-10 flex items-center justify-center bg-paper border border-black/[0.07] rounded-full flex-shrink-0 relative z-10">
                    <i className={`bi ${iconCls} text-[14px]`} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 py-2.5 border-b border-black/[0.05] min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] font-light text-ink leading-snug">{ev.message ?? ev.description ?? ev.type}</p>
                      <span className="font-mono text-[10px] text-[#CCC] whitespace-nowrap flex-shrink-0 mt-0.5">{timeAgo(ev.createdAt ?? ev.timestamp)}</span>
                    </div>
                    {ev.actor && (
                      <p className="font-mono text-[10px] text-[#BBB] mt-0.5">by {ev.actor}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Applicant row / card ──────────────────────────────────────────────────────

function ApplicantRow({ applicant, selected, onSelect, onApprove, onReject }) {
  return (
    <tr className={`border-b border-black/[0.05] transition-colors group ${selected ? 'bg-[#F4FAF7]' : 'hover:bg-black/[0.015]'}`}>
      <td className="pl-5 pr-2 py-4">
        <div onClick={() => onSelect(applicant.id)}
          className={`w-[17px] h-[17px] rounded-[4px] border flex items-center justify-center cursor-pointer flex-shrink-0 transition-all ${selected ? 'bg-ink border-ink' : 'border-[#DDD] bg-white hover:border-ink/40'}`}>
          {selected && <i className="bi bi-check text-[9px] text-paper" />}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black/[0.06] flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-[10px] text-[#888]">{applicant.fn?.[0]}{applicant.ln?.[0]}</span>
          </div>
          <div className="min-w-0">
            <span className="text-[13px] font-medium text-ink block tracking-[-0.01em] whitespace-nowrap">{applicant.fn} {applicant.ln}</span>
            <span className="font-mono text-[10px] text-[#AAA]">@{applicant.username}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 max-w-[180px]"><span className="text-[12.5px] font-light text-[#666] block truncate">{applicant.email}</span></td>
      <td className="px-4 py-4 text-[12.5px] font-light text-[#888] whitespace-nowrap">{applicant.country}</td>
      <td className="px-4 py-4"><span className="font-mono text-[10px] text-[#BBB] whitespace-nowrap">{applicant.applied}</span></td>
      <td className="px-4 py-4"><StatusBadge status={applicant.status} /></td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {applicant.status !== 'approved' && (
            <button onClick={() => onApprove(applicant)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-ink bg-[#2DFC44] px-3 py-1.5 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer font-mono tracking-wide whitespace-nowrap">
              <i className="bi bi-check-lg" /> Approve
            </button>
          )}
          {applicant.status === 'pending' && (
            <button onClick={() => onReject(applicant.id)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#999] border border-black/[0.1] px-3 py-1.5 rounded-full hover:border-black/30 hover:text-ink transition-colors bg-transparent cursor-pointer font-mono tracking-wide whitespace-nowrap">
              <i className="bi bi-x" /> Reject
            </button>
          )}
          {applicant.status === 'approved' && (
            <span className="font-mono text-[10px] text-[#1DC433] flex items-center gap-1 whitespace-nowrap">
              <i className="bi bi-check2-circle" /> Approved
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

function ApplicantCard({ applicant, selected, onSelect, onApprove, onReject }) {
  return (
    <div className={`border rounded-[12px] p-4 space-y-3 transition-colors ${selected ? 'bg-[#F4FAF7] border-green-dark/20' : 'bg-white border-black/[0.07]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div onClick={() => onSelect(applicant.id)} className={`w-[17px] h-[17px] rounded-[4px] border flex items-center justify-center cursor-pointer flex-shrink-0 transition-all ${selected ? 'bg-ink border-ink' : 'border-[#DDD] bg-white'}`}>
            {selected && <i className="bi bi-check text-[9px] text-paper" />}
          </div>
          <div className="w-8 h-8 rounded-full bg-black/[0.06] flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-[10px] text-[#888]">{applicant.fn?.[0]}{applicant.ln?.[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-ink tracking-[-0.01em] truncate">{applicant.fn} {applicant.ln}</p>
            <p className="font-mono text-[10px] text-[#AAA] truncate">@{applicant.username}</p>
          </div>
        </div>
        <StatusBadge status={applicant.status} />
      </div>
      <div className="text-[12.5px] font-light text-[#777] space-y-0.5 pl-[calc(17px+32px+12px)]">
        <p className="truncate">{applicant.email}</p>
        <p>{applicant.country}</p>
        <p className="font-mono text-[10px] text-[#BBB]">{applicant.applied}</p>
      </div>
      <div className="flex gap-2">
        {applicant.status !== 'approved' && (
          <button onClick={() => onApprove(applicant)}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-ink bg-[#2DFC44] py-2 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer font-mono tracking-wide">
            <i className="bi bi-check-lg" /> Approve
          </button>
        )}
        {applicant.status === 'pending' && (
          <button onClick={() => onReject(applicant.id)}
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#999] border border-black/[0.1] py-2 rounded-full hover:border-black/30 hover:text-ink transition-colors bg-transparent cursor-pointer font-mono tracking-wide">
            <i className="bi bi-x" /> Reject
          </button>
        )}
      </div>
    </div>
  )
}

// ── Applicant panel ───────────────────────────────────────────────────────────

function ApplicantPanel({ type, onBroadcast, showToast }) {
  const { rows, total, totalPages, page, sort, dir, loading, error, approved, toggleSort, goToPage, approve, reject, bulk, broadcast, reload } = useApplicants(type)

  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [selected,  setSelected]  = useState([])
  const [approving, setApproving] = useState(null)
  const [bulkOpts,  setBulkOpts]  = useState(null)

  const label = type === 'talent' ? 'Talent' : 'Project'

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter(a => {
      const matchSearch = !q || `${a.fn} ${a.ln} ${a.email} ${a.username} ${a.country}`.toLowerCase().includes(q)
      const matchFilter = filter === 'all' || a.status === filter
      return matchSearch && matchFilter
    })
  }, [rows, search, filter])

  const allSelected = filtered.length > 0 && filtered.every(a => selected.includes(a.id))
  function toggleAll() { setSelected(allSelected ? [] : filtered.map(a => a.id)) }
  function toggleOne(id) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]) }

  async function handleApproveConfirm(id, opts) {
    const name = `${approving?.fn} ${approving?.ln}`
    const { error } = await approve(id, opts)
    setApproving(null)
    error ? showToast(`Failed: ${error}`, 'error') : showToast(`${name} approved — invite sent`)
  }

  async function handleReject(id) {
    const { error } = await reject(id)
    error ? showToast(`Failed: ${error}`, 'error') : showToast('Applicant rejected')
  }

  async function handleBulkConfirm() {
    const { error } = await bulk(selected, bulkOpts.action)
    setBulkOpts(null)
    if (error) { showToast(`Bulk action failed: ${error}`, 'error') }
    else { showToast(`${selected.length} applicant${selected.length !== 1 ? 's' : ''} ${bulkOpts.action === 'approve' ? 'approved' : 'rejected'}`); setSelected([]) }
  }

  const pendingCount  = rows.filter(a => a.status === 'pending').length
  const approvedCount = rows.filter(a => a.status === 'approved').length
  const rejectedCount = rows.filter(a => a.status === 'rejected').length

  return (
    <div>
      {error && <ErrorBanner message={error} onRetry={reload} />}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { n: total,         lbl: 'Total',    sub: `${label} applications` },
          { n: pendingCount,  lbl: 'Pending',  sub: 'Awaiting review'       },
          { n: approvedCount, lbl: 'Approved', sub: 'Ready to onboard'      },
          { n: rejectedCount, lbl: 'Rejected', sub: 'Not selected'          },
        ].map(s => (
          <div key={s.lbl} className="bg-white border border-black/[0.07] rounded-[12px] px-4 py-4">
            <span className="font-serif text-[26px] sm:text-[28px] font-light text-ink tracking-[-0.05em] block leading-none mb-1">{loading ? '—' : s.n}</span>
            <span className="font-medium text-[11.5px] text-ink block mb-0.5">{s.lbl}</span>
            <span className="text-[11px] font-light text-[#AAA]">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-[#CCC] pointer-events-none" />
              <input
                className="font-sans text-[13px] font-light bg-white border border-black/[0.09] rounded-[9px] pl-8 pr-4 py-2 outline-none focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.06)] transition-all w-full sm:w-[220px] placeholder-[#D8D8D8]"
                placeholder={`Search ${label.toLowerCase()}s…`} value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full border cursor-pointer transition-all
                    ${filter === f ? 'bg-ink text-paper border-transparent' : 'text-[#AAA] border-black/[0.1] bg-transparent hover:border-black/20'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onBroadcast(type)} disabled={approved.length === 0 || loading}
            className="flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-ink bg-[#2DFC44] px-4 py-2 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap">
            <i className="bi bi-send text-[12px]" />
            Message Approved ({approved.length})
          </button>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-ink rounded-[10px] flex-wrap" style={{ animation: 'up 0.2s both' }}>
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-paper/60 mr-auto">{selected.length} selected</span>
            <button onClick={() => setBulkOpts({ count: selected.length, action: 'approve' })}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-ink bg-[#2DFC44] px-3 py-1.5 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer">
              <i className="bi bi-check-lg" /> Approve Selected
            </button>
            <button onClick={() => setBulkOpts({ count: selected.length, action: 'reject' })}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-paper/70 border border-paper/20 px-3 py-1.5 rounded-full hover:border-paper/50 hover:text-paper transition-colors bg-transparent cursor-pointer">
              <i className="bi bi-x" /> Reject Selected
            </button>
            <button onClick={() => setSelected([])}
              className="w-6 h-6 flex items-center justify-center text-paper/40 hover:text-paper transition-colors bg-transparent border-none cursor-pointer">
              <i className="bi bi-x-lg text-[11px]" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center"><Spinner size={28} light={false} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <i className="bi bi-inbox text-[40px] text-[#E0E0E0] block mb-4" />
          <p className="text-[14px] font-light text-[#C8C8C8]">{rows.length === 0 ? `No ${label.toLowerCase()} applications yet` : `No ${label.toLowerCase()}s match your filter`}</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-black/[0.07]">
                    <th className="pl-5 pr-2 py-3.5 w-10">
                      <div onClick={toggleAll}
                        className={`w-[17px] h-[17px] rounded-[4px] border flex items-center justify-center cursor-pointer transition-all ${allSelected ? 'bg-ink border-ink' : 'border-[#DDD] bg-white hover:border-ink/40'}`}>
                        {allSelected && <i className="bi bi-check text-[9px] text-paper" />}
                      </div>
                    </th>
                    <SortTh col="name"    label="Applicant" sort={sort} dir={dir} onSort={toggleSort} />
                    <SortTh col="email"   label="Email"     sort={sort} dir={dir} onSort={toggleSort} />
                    <SortTh col="country" label="Country"   sort={sort} dir={dir} onSort={toggleSort} />
                    <SortTh col="applied" label="Applied"   sort={sort} dir={dir} onSort={toggleSort} />
                    <SortTh col="status"  label="Status"    sort={sort} dir={dir} onSort={toggleSort} />
                    <th className="px-4 py-3.5 text-left font-mono text-[9px] tracking-[0.14em] uppercase text-[#BBB] font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <ApplicantRow key={a.id} applicant={a} selected={selected.includes(a.id)}
                      onSelect={toggleOne} onApprove={setApproving} onReject={handleReject} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="md:hidden space-y-3">
            {filtered.map(a => (
              <ApplicantCard key={a.id} applicant={a} selected={selected.includes(a.id)}
                onSelect={toggleOne} onApprove={setApproving} onReject={handleReject} />
            ))}
          </div>
        </>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={goToPage} />

      {approving && <ApproveModal applicant={approving} onConfirm={handleApproveConfirm} onClose={() => setApproving(null)} />}
      {bulkOpts && <BulkModal count={bulkOpts.count} action={bulkOpts.action} onConfirm={handleBulkConfirm} onClose={() => setBulkOpts(null)} />}
    </div>
  )
}

// ── Team panel ────────────────────────────────────────────────────────────────

function TeamPanel({ showToast, currentAdmin }) {
  const [admins,        setAdmins]        = useState([])
  const [invites,       setInvites]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [inviteEmail,   setInviteEmail]   = useState('')
  const [inviteErr,     setInviteErr]     = useState('')
  const [sending,       setSending]       = useState(false)
  const [removing,      setRemoving]      = useState(null)
  const [confirmRemove, setConfirmRemove] = useState(null)

  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await fetchAdmins()
    setLoading(false)
    if (error) { setError(error); return }
    setAdmins(data.admins ?? [])
    setInvites(data.invites ?? [])
  }
  useEffect(() => { load() }, [])

  async function handleInvite() {
    setInviteErr('')
    if (!inviteEmail.trim()) { setInviteErr('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) { setInviteErr('Enter a valid email'); return }
    setSending(true)
    const { data, error } = await inviteAdmin({ email: inviteEmail.trim() })
    setSending(false)
    if (error) { setInviteErr(error.toLowerCase().includes('already') || error.includes('409') ? 'An admin or pending invite already exists for this email.' : error); return }
    setInviteEmail('')
    setInvites(prev => [data.invite, ...prev])
    showToast(`Invite sent to ${inviteEmail.trim()}`)
  }

  async function handleRemove(admin) {
    setRemoving(admin.id); setConfirmRemove(null)
    const { error } = await removeAdmin(admin.id)
    setRemoving(null)
    if (error) { showToast(`Failed to remove admin: ${error}`, 'error'); return }
    setAdmins(prev => prev.filter(a => a.id !== admin.id))
    showToast(`${admin.name} has been removed`)
  }

  async function handleCancelInvite(invite) {
    const { error } = await cancelInvite(invite.id)
    if (error) { showToast(`Failed to cancel invite: ${error}`, 'error'); return }
    setInvites(prev => prev.filter(i => i.id !== invite.id))
    showToast('Invite cancelled')
  }

  async function handleResend(invite) {
    const { data, error } = await resendInvite(invite.id)
    if (error) { showToast(`Failed to resend: ${error}`, 'error'); return }
    setInvites(prev => prev.map(i => i.id === invite.id ? data.invite : i))
    showToast(`Invite resent to ${invite.email}`)
  }

  function formatDate(iso) { if (!iso) return '—'; return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  function timeAgo(iso) {
    if (!iso) return 'Never'
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000)
    if (mins < 2) return 'Just now'; if (mins < 60) return `${mins}m ago`; if (hours < 24) return `${hours}h ago`; if (days < 30) return `${days}d ago`; return formatDate(iso)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size={24} light={false} /></div>
  if (error) return <ErrorBanner message={error} onRetry={load} />

  return (
    <div className="max-w-[760px]">
      <div className="bg-white border border-black/[0.07] rounded-[14px] p-6 mb-8">
        <h3 className="font-serif text-[17px] font-light tracking-[-0.03em] text-ink mb-1">Invite an admin</h3>
        <p className="text-[13px] font-light text-[#999] mb-5">They'll receive an email with a link to set up their account. Invite expires in 48h.</p>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input type="email" value={inviteEmail} onChange={e => { setInviteEmail(e.target.value); setInviteErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleInvite()} placeholder="colleague@work3labs.com"
              className={['w-full font-sans text-[13.5px] font-light bg-white text-ink border rounded-[10px] px-4 py-3 outline-none transition-all placeholder-[#D0D0D0]',
                inviteErr ? 'border-red-300 focus:border-red-400' : 'border-black/[0.09] focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]'].join(' ')} />
            {inviteErr && <p className="mt-1.5 text-[12px] text-red-500 font-light flex items-center gap-1.5"><i className="bi bi-exclamation-circle text-[11px]" />{inviteErr}</p>}
          </div>
          <button onClick={handleInvite} disabled={sending}
            className="flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-[10px] font-sans text-[13.5px] font-medium hover:bg-[#1A1A1A] transition-colors border-none cursor-pointer disabled:opacity-50 whitespace-nowrap flex-shrink-0">
            {sending ? <><Spinner size={15} />Sending…</> : <><i className="bi bi-send text-[13px]" />Send invite</>}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] mb-4">Active admins — {admins.length}</h3>
        <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden divide-y divide-black/[0.05]">
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-[11px] text-[#666] uppercase">{(admin.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium text-ink truncate">{admin.name}</span>
                  {admin.role === 'owner' && <span className="font-mono text-[9px] tracking-[0.1em] uppercase bg-[#2DFC44] text-ink px-2 py-0.5 rounded-full flex-shrink-0">Owner</span>}
                  {currentAdmin?.id === admin.id && <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#AAA] flex-shrink-0">you</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-[12.5px] font-light text-[#999] truncate">{admin.email}</span>
                  <span className="text-[11px] font-mono text-[#CCC] flex-shrink-0">Last login: {timeAgo(admin.lastLoginAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-[10px] text-[#CCC] hidden sm:block">{formatDate(admin.joinedAt)}</span>
                {currentAdmin?.id !== admin.id && admin.role !== 'owner' && (
                  confirmRemove?.id === admin.id ? (
                    <div className="flex items-center gap-2" style={{ animation: 'up 0.15s both' }}>
                      <span className="text-[12px] font-light text-[#999]">Remove?</span>
                      <button onClick={() => handleRemove(admin)} disabled={removing === admin.id}
                        className="font-mono text-[10px] tracking-[0.08em] uppercase text-red-500 border border-red-200 rounded-full px-3 py-1 bg-transparent cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-50">
                        {removing === admin.id ? '…' : 'Confirm'}
                      </button>
                      <button onClick={() => setConfirmRemove(null)}
                        className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#BBB] border border-black/[0.09] rounded-full px-3 py-1 bg-transparent cursor-pointer hover:border-black/20 transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmRemove(admin)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#CCC] hover:text-red-500 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                      title={`Remove ${admin.name}`}>
                      <i className="bi bi-person-dash text-[14px]" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
          {admins.length === 0 && <div className="px-6 py-8 text-center text-[13px] font-light text-[#BBB]">No admins found</div>}
        </div>
      </div>

      {invites.length > 0 && (
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] mb-4">Pending invites — {invites.length}</h3>
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden divide-y divide-black/[0.05]">
            {invites.map(invite => (
              <div key={invite.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-envelope text-[14px] text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-light text-ink truncate block">{invite.email}</span>
                  <span className="text-[11.5px] font-mono text-[#CCC]">Expires {formatDate(invite.expiresAt)}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleResend(invite)}
                    className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#999] border border-black/[0.09] rounded-full px-3 py-1 bg-transparent cursor-pointer hover:border-black/20 hover:text-ink transition-colors">
                    Resend
                  </button>
                  <button onClick={() => handleCancelInvite(invite)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#CCC] hover:text-red-500 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer">
                    <i className="bi bi-x text-[16px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export

const TABS = [
  { key: 'talents',   icon: 'bi-person-check', label: 'Talents'   },
  { key: 'projects',  icon: 'bi-buildings',    label: 'Projects'  },
  { key: 'pods',      icon: 'bi-people-fill',  label: 'Pods'      },
  { key: 'waitlist',  icon: 'bi-envelope',     label: 'Waitlist'  },
  { key: 'activity',  icon: 'bi-activity',     label: 'Activity'  },
  { key: 'team',      icon: 'bi-shield-lock',  label: 'Team', ownerOnly: true },
]

export default function AdminDashboardClient() {
  const { admin, logout } = useAuth()
  const isOwner = admin?.role === 'owner'

  const { pods, loading: loadingPods, match, unmatch, pass, fail, release, reload: reloadPods } = usePods()

  const talentHook  = useApplicants('talent')
  const projectHook = useApplicants('project')

  const [tab,           setTab]           = useState('talents')
  const [broadcastType, setBroadcastType] = useState(null)
  const [showReset,     setShowReset]     = useState(false)
  const [toast,         setToast]         = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleBroadcast(opts) {
    const hook = opts.type === 'talent' ? talentHook : projectHook
    const { error } = await hook.broadcast(opts)
    if (error) showToast(`Broadcast failed: ${error}`, 'error')
    setBroadcastType(null)
  }

  async function handleReset() {
    const [r1, r2] = await Promise.all([talentHook.reset(), projectHook.reset()])
    setShowReset(false)
    if (r1.error || r2.error) showToast('Reset partially failed', 'error')
    else showToast('All application data has been reset')
  }

  const totalPending =
    talentHook.rows.filter(a => a.status === 'pending').length +
    projectHook.rows.filter(a => a.status === 'pending').length

  const broadcastApproved = broadcastType === 'talent' ? talentHook.approved : broadcastType === 'project' ? projectHook.approved : []
  const visibleTabs = TABS.filter(t => !t.ownerOnly || isOwner)

  return (
    <div className="min-h-screen bg-paper" style={{ fontFamily: 'Outfit, sans-serif' }}>

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-[500] h-[58px] flex items-center justify-between px-5 sm:px-9 bg-[rgba(250,250,248,0.92)] backdrop-blur-xl border-b border-black/[0.07]">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <img src="/logo.png" alt="Work3 Labs" className="h-7 flex-shrink-0" />
          <span className="h-4 w-px bg-black/[0.1] hidden sm:block" />
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] hidden sm:block">Admin</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {totalPending > 0 && (
            <span className="font-mono text-[10px] tracking-wide bg-amber-100 text-amber-700 px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="hidden sm:inline">{totalPending} pending review</span>
              <span className="sm:hidden">{totalPending}</span>
            </span>
          )}
          <button onClick={() => setShowReset(true)}
            className="font-mono text-[10px] tracking-[0.1em] uppercase text-red-400 border border-red-200 rounded-full px-2.5 sm:px-3 py-1 bg-transparent cursor-pointer hover:bg-red-50 transition-colors flex items-center gap-1.5">
            <i className="bi bi-arrow-counterclockwise text-[11px]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          {admin?.name && <span className="font-mono text-[10px] tracking-[0.08em] text-[#BBB] hidden md:block truncate max-w-[120px]">{admin.name}</span>}
          <button onClick={logout}
            className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink border border-black/[0.09] rounded-full px-2.5 sm:px-3 py-1 bg-transparent cursor-pointer hover:border-black/20 transition-colors flex items-center gap-1.5">
            <i className="bi bi-box-arrow-right text-[11px]" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
          <Link href="/" className="font-mono text-[10px] tracking-[0.1em] uppercase text-[#BBB] hover:text-ink transition-colors flex items-center gap-1.5">
            <i className="bi bi-arrow-left text-[11px]" />
            <span className="hidden sm:inline">Back to site</span>
          </Link>
        </div>
      </nav>

      <div className="pt-[58px]">
        <div className="px-5 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8 border-b border-black/[0.07]">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-2">Work3 Labs</span>
          <h1 className="font-serif text-[clamp(24px,3vw,38px)] font-light tracking-[-0.04em] text-ink mb-1">Applications Dashboard</h1>
          <p className="text-[13.5px] sm:text-[14px] font-light text-[#999] tracking-[-0.01em]">Review applicants, manage pods, and send invitations.</p>
        </div>

        <div className="px-5 sm:px-10 pt-5 sm:pt-6">
          <div className="flex gap-1 border-b border-black/[0.07] mb-6 sm:mb-8 overflow-x-auto">
            {visibleTabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-[13px] sm:text-[13.5px] border-b-2 transition-all bg-transparent border-none cursor-pointer -mb-px whitespace-nowrap
                  ${tab === t.key ? 'border-ink text-ink font-medium' : 'border-transparent text-[#AAA] hover:text-[#666] font-light'}`}>
                <i className={`bi ${t.icon} text-[14px]`} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label}</span>
                {(t.key === 'talents' || t.key === 'projects') && (
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-ink text-paper' : 'bg-black/[0.06] text-[#999]'}`}>
                    {t.key === 'talents' ? (talentHook.loading ? '—' : talentHook.total) : (projectHook.loading ? '—' : projectHook.total)}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pb-16">
            {tab === 'talents'  && <ApplicantPanel type="talent"  onBroadcast={setBroadcastType} showToast={showToast} />}
            {tab === 'projects' && <ApplicantPanel type="project" onBroadcast={setBroadcastType} showToast={showToast} />}
            {tab === 'pods'     && (
              <PodMatchingPanel
                pods={pods} loadingPods={loadingPods}
                onMatch={match} onUnmatch={unmatch}
                onPass={pass}   onFail={fail} onRelease={release}
                showToast={showToast}
              />
            )}
            {tab === 'waitlist' && <WaitlistPanel showToast={showToast} />}
            {tab === 'activity' && <ActivityPanel />}
            {tab === 'team' && isOwner && <TeamPanel showToast={showToast} currentAdmin={admin} />}
          </div>
        </div>
      </div>

      {broadcastType && (
        <BroadcastModal type={broadcastType} recipients={broadcastApproved} onSend={handleBroadcast} onClose={() => setBroadcastType(null)} />
      )}
      {showReset && <ResetModal onConfirm={handleReset} onClose={() => setShowReset(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}