'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useApplicants } from '@/hooks/useApplicants'
import { useAuth }        from '@/hooks/useAuth'
import {
  fetchApplicants,
  fetchAdmins, inviteAdmin, removeAdmin, cancelInvite, resendInvite,
  fetchPods, passProject, failProject, releaseEscrow,
} from '@/services/api'

// ── Design tokens ─────────────────────────────────────────────────────────────

const STATUS = {
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400', label: 'Pending'  },
  approved: { bg: 'bg-[#F0FDF4]', text: 'text-green-700', dot: 'bg-green-500', label: 'Approved' },
  rejected: { bg: 'bg-red-50',    text: 'text-red-600',   dot: 'bg-red-400',   label: 'Rejected' },
}

const INPUT = [
  'w-full font-sans text-[13px] font-light bg-white',
  'border border-black/[0.09] rounded-[10px] px-4 py-3',
  'outline-none transition-all text-ink placeholder-[#D0D0D0]',
  'focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]',
].join(' ')

const SORTABLE_COLS = ['applied', 'country', 'status']

// ── Atoms ─────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending
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
      <button onClick={onRetry} className="font-mono text-[10px] tracking-[0.1em] uppercase text-red-600 border border-red-200 rounded-full px-3 py-1.5 bg-transparent cursor-pointer hover:bg-red-100 transition-colors flex-shrink-0">
        Retry
      </button>
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

// ── Sort header cell ──────────────────────────────────────────────────────────

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

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  // Show max 7 page numbers with ellipsis
  const visible = totalPages <= 7 ? pages : [
    ...pages.slice(0, Math.min(3, page - 1)),
    ...(page > 4 ? ['…'] : []),
    ...(page > 3 && page < totalPages - 2 ? [page] : []),
    ...(page < totalPages - 3 ? ['…'] : []),
    ...pages.slice(Math.max(totalPages - 3, page)),
  ].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <div className="flex items-center justify-center gap-1 pt-6 pb-2">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-black/[0.09] bg-transparent text-[#888] hover:border-ink hover:text-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[12px]"
      >
        <i className="bi bi-chevron-left" />
      </button>

      {visible.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center font-mono text-[11px] text-[#CCC]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-full font-mono text-[11px] transition-all cursor-pointer border
              ${p === page ? 'bg-ink text-paper border-transparent' : 'border-black/[0.09] text-[#888] bg-transparent hover:border-ink hover:text-ink'}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-black/[0.09] bg-transparent text-[#888] hover:border-ink hover:text-ink transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-[12px]"
      >
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  )
}

// ── Approve modal ─────────────────────────────────────────────────────────────

function ApproveModal({ applicant, onConfirm, onClose }) {
  const [note,       setNote]       = useState('')
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
          <h3 className="font-serif text-[20px] sm:text-[22px] font-light tracking-[-0.04em] text-ink">
            {applicant.fn} {applicant.ln}
          </h3>
          <p className="text-[13px] font-light text-[#AAA] mt-0.5 break-all">{applicant.email}</p>
        </div>

        <div className="px-6 sm:px-7 py-6 space-y-5">
          {/* Auto-invite notice */}
          <div className="flex items-start gap-3 bg-[#F4FAF7] border border-green-dark/10 rounded-[10px] px-4 py-3.5">
            <i className="bi bi-send-check text-green-dark text-[15px] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-ink tracking-[-0.01em] mb-0.5">Invite link generated automatically</p>
              <p className="text-[12px] font-light text-[#888] leading-relaxed">
                A unique, time-limited dashboard link will be created by the server and included in the approval email sent to {applicant.email}.
              </p>
            </div>
          </div>

          {/* Optional note */}
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">
              Personal Note <span className="normal-case text-[#D0D0D0]">(optional)</span>
            </label>
            <textarea
              className={`${INPUT} resize-none leading-relaxed`}
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a personal message to include in the approval email…"
              autoFocus
            />
          </div>
        </div>

        <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={onClose} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer">
            Cancel
          </button>
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

// ── Bulk confirm modal ────────────────────────────────────────────────────────

function BulkModal({ count, action, onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false)
  const isApprove = action === 'approve'

  async function go() {
    setSubmitting(true)
    await onConfirm()
    setSubmitting(false)
  }

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
            {isApprove
              ? `Each applicant will receive a unique invite email. Invite links are generated automatically.`
              : `Selected applicants will be marked as rejected. This can be reversed individually.`}
          </p>
        </div>
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-5 flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={onClose} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer">
            Cancel
          </button>
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

// ── Broadcast modal ───────────────────────────────────────────────────────────

const DEFAULT_SUBJECT = {
  talent:  "You've been approved to join Work3 Labs",
  project: "Your project has been accepted — Work3 Labs",
}
const DEFAULT_BODY = {
  talent:  `Hi {{first_name}},\n\nYou've been approved to join Work3 Labs as a Talent.\n\nClick the link below to access your dashboard:\n{{dashboard_link}}\n\nWelcome to the execution layer.\n\n— The Work3 Labs Team`,
  project: `Hi {{first_name}},\n\nYour project application has been accepted by Work3 Labs.\n\nAccess your project dashboard here:\n{{dashboard_link}}\n\nLet's ship.\n\n— The Work3 Labs Team`,
}

function BroadcastModal({ type, recipients, onSend, onClose }) {
  const [subject,    setSubject]    = useState(DEFAULT_SUBJECT[type])
  const [body,       setBody]       = useState(DEFAULT_BODY[type])
  const [submitting, setSubmitting] = useState(false)
  const [sent,       setSent]       = useState(false)
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
            <p className="text-[13px] font-light text-[#999]">
              {recipients.length} approved {label.toLowerCase()}{recipients.length !== 1 ? 's' : ''} will receive this message.
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 sm:px-7 pt-6 sm:pt-7 pb-5 border-b border-black/[0.07]">
              <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-[#AAA] block mb-1.5">Broadcast — {label}s</span>
              <h3 className="font-serif text-[20px] sm:text-[22px] font-light tracking-[-0.04em] text-ink">Message Approved {label}s</h3>
              <p className="text-[13px] font-light text-[#AAA] mt-0.5">
                Sending to <strong className="text-ink font-medium">{recipients.length}</strong> recipient{recipients.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="px-6 sm:px-7 py-6 space-y-4 max-h-[55vh] overflow-y-auto">
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">Recipients</label>
                <div className="flex flex-wrap gap-1.5">
                  {recipients.map(r => (
                    <span key={r.id} className="font-mono text-[10px] bg-black/[0.04] border border-black/[0.07] rounded-full px-2.5 py-1 text-[#666]">
                      {r.fn} {r.ln}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">Subject</label>
                <input className={INPUT} value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">
                  Body — use {'{{first_name}}'} and {'{{dashboard_link}}'}
                </label>
                <textarea className={`${INPUT} resize-none leading-relaxed font-mono text-[12px]`} rows={10} value={body} onChange={e => setBody(e.target.value)} />
              </div>
            </div>

            <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex flex-col-reverse sm:flex-row gap-3 border-t border-black/[0.07] pt-5">
              <button onClick={onClose} disabled={submitting} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer disabled:opacity-40">
                Cancel
              </button>
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

// ── Reset modal ───────────────────────────────────────────────────────────────

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
          <p className="text-[13px] font-light text-[#888] leading-relaxed">
            Permanently deletes all applicant records. Use only for testing or a scheduled cycle reset.
          </p>
        </div>
        <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-5 flex flex-col-reverse sm:flex-row gap-3">
          <button onClick={onClose} disabled={submitting} className="flex-1 sm:flex-none px-5 py-3 rounded-[10px] border border-black/[0.1] text-[#666] text-[14px] font-light hover:border-black/25 transition-colors bg-transparent cursor-pointer disabled:opacity-40">
            Cancel
          </button>
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

// ── Applicant row (desktop) ───────────────────────────────────────────────────

function ApplicantRow({ applicant, selected, onSelect, onApprove, onReject }) {
  return (
    <tr className={`border-b border-black/[0.05] transition-colors group ${selected ? 'bg-[#F4FAF7]' : 'hover:bg-black/[0.015]'}`}>
      {/* Checkbox */}
      <td className="pl-5 pr-2 py-4">
        <div
          onClick={() => onSelect(applicant.id)}
          className={`w-[17px] h-[17px] rounded-[4px] border flex items-center justify-center cursor-pointer flex-shrink-0 transition-all ${selected ? 'bg-ink border-ink' : 'border-[#DDD] bg-white hover:border-ink/40'}`}
        >
          {selected && <i className="bi bi-check text-[9px] text-paper" />}
        </div>
      </td>
      {/* Applicant */}
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

// ── Applicant card (mobile) ───────────────────────────────────────────────────

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

// ── Applicant panel (full tab) ────────────────────────────────────────────────

function ApplicantPanel({ type, onBroadcast, showToast }) {
  const { rows, total, totalPages, page, sort, dir, loading, error, approved, toggleSort, goToPage, approve, reject, bulk, broadcast, reload } = useApplicants(type)

  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')
  const [selected,  setSelected]  = useState([])
  const [approving, setApproving] = useState(null)
  const [bulkOpts,  setBulkOpts]  = useState(null)   // { count, action }

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

  function toggleAll() {
    setSelected(allSelected ? [] : filtered.map(a => a.id))
  }

  function toggleOne(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

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
    if (error) {
      showToast(`Bulk action failed: ${error}`, 'error')
    } else {
      showToast(`${selected.length} applicant${selected.length !== 1 ? 's' : ''} ${bulkOpts.action === 'approve' ? 'approved' : 'rejected'}`)
      setSelected([])
    }
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
            <span className="font-serif text-[26px] sm:text-[28px] font-light text-ink tracking-[-0.05em] block leading-none mb-1">
              {loading ? '—' : s.n}
            </span>
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
                placeholder={`Search ${label.toLowerCase()}s…`}
                value={search}
                onChange={e => setSearch(e.target.value)}
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

          <button
            onClick={() => onBroadcast(type)}
            disabled={approved.length === 0 || loading}
            className="flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.1em] uppercase text-ink bg-[#2DFC44] px-4 py-2 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap">
            <i className="bi bi-send text-[12px]" />
            Message Approved ({approved.length})
          </button>
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-ink rounded-[10px] flex-wrap"
            style={{ animation: 'up 0.2s both' }}>
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-paper/60 mr-auto">
              {selected.length} selected
            </span>
            <button
              onClick={() => setBulkOpts({ count: selected.length, action: 'approve' })}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-ink bg-[#2DFC44] px-3 py-1.5 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer">
              <i className="bi bi-check-lg" /> Approve Selected
            </button>
            <button
              onClick={() => setBulkOpts({ count: selected.length, action: 'reject' })}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] uppercase text-paper/70 border border-paper/20 px-3 py-1.5 rounded-full hover:border-paper/50 hover:text-paper transition-colors bg-transparent cursor-pointer">
              <i className="bi bi-x" /> Reject Selected
            </button>
            <button
              onClick={() => setSelected([])}
              className="w-6 h-6 flex items-center justify-center text-paper/40 hover:text-paper transition-colors bg-transparent border-none cursor-pointer">
              <i className="bi bi-x-lg text-[11px]" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Spinner size={28} light={false} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <i className="bi bi-inbox text-[40px] text-[#E0E0E0] block mb-4" />
          <p className="text-[14px] font-light text-[#C8C8C8]">
            {rows.length === 0 ? `No ${label.toLowerCase()} applications yet` : `No ${label.toLowerCase()}s match your filter`}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-black/[0.07]">
                    {/* Select all */}
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
                    <ApplicantRow
                      key={a.id} applicant={a}
                      selected={selected.includes(a.id)}
                      onSelect={toggleOne}
                      onApprove={setApproving}
                      onReject={handleReject}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(a => (
              <ApplicantCard
                key={a.id} applicant={a}
                selected={selected.includes(a.id)}
                onSelect={toggleOne}
                onApprove={setApproving}
                onReject={handleReject}
              />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPage={goToPage} />

      {/* Modals */}
      {approving && (
        <ApproveModal
          applicant={approving}
          onConfirm={handleApproveConfirm}
          onClose={() => setApproving(null)}
        />
      )}
      {bulkOpts && (
        <BulkModal
          count={bulkOpts.count}
          action={bulkOpts.action}
          onConfirm={handleBulkConfirm}
          onClose={() => setBulkOpts(null)}
        />
      )}
    </div>
  )
}

// ── Pods Review Panel (read-only — pods created by users, admin reviews) ──────

const POD_STATUS = {
  forming:        { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Forming'         },
  pending_split:  { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400', label: 'Pending Split'   },
  pending_escrow: { bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Awaiting Escrow' },
  active:         { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Active'          },
  review:         { bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400', label: 'In Review'       },
  passed:         { bg: 'bg-[#F0FDF4]',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Passed'          },
  failed:         { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400',    label: 'Failed'          },
  released:       { bg: 'bg-[#F0FDF4]',  text: 'text-green-800',  dot: 'bg-green-600',  label: 'Released'        },
}

function PodStatusBadge({ status }) {
  const s = POD_STATUS[status] ?? POD_STATUS.forming
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wide px-2.5 py-1 rounded-full whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  )
}

function PodsPanel({ showToast }) {
  const [pods,        setPods]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [expanded,    setExpanded]    = useState(null)
  const [activeTab,   setActiveTab]   = useState({})   // per-pod expanded tab: 'details' | 'chat'
  const [filter,      setFilter]      = useState('all')
  const [failReason,  setFailReason]  = useState('')
  const [failing,     setFailing]     = useState(null)
  const [acting,      setActing]      = useState(null)

  async function load() {
    setLoading(true); setError(null)
    const { data, error } = await fetchPods()
    setLoading(false)
    if (error) { setError(error); return }
    setPods(data?.data ?? data ?? [])
  }

  useEffect(() => { load() }, [])

  async function handlePass(pod) {
    // Guard — all deliverables must be approved
    const allApproved = pod.deliverables?.length > 0 &&
      pod.deliverables.every(d => d.status === 'approved')
    if (!allApproved) {
      showToast('All deliverables must be approved before passing', 'error')
      return
    }
    setActing(pod.id)
    const { error } = await passProject(pod.id)
    setActing(null)
    if (error) { showToast(`Failed: ${error}`, 'error'); return }
    setPods(prev => prev.map(p => p.id === pod.id ? { ...p, status: 'passed' } : p))
    showToast(`${pod.name} passed — escrow release unlocked`)
  }

  async function handleFail(pod) {
    setActing(pod.id)
    const { error } = await failProject(pod.id, { reason: failReason })
    setActing(null)
    setFailing(null)
    setFailReason('')
    if (error) { showToast(`Failed: ${error}`, 'error'); return }
    setPods(prev => prev.map(p => p.id === pod.id ? { ...p, status: 'failed' } : p))
    showToast(`${pod.name} marked as failed`)
  }

  async function handleRelease(pod) {
    setActing(pod.id)
    const { error } = await releaseEscrow(pod.id)
    setActing(null)
    if (error) { showToast(`Release failed: ${error}`, 'error'); return }
    setPods(prev => prev.map(p => p.id === pod.id ? { ...p, status: 'released' } : p))
    showToast(`Escrow released for ${pod.name}`)
  }

  function podTab(id) { return activeTab[id] ?? 'details' }
  function setPodTab(id, tab) { setActiveTab(t => ({ ...t, [id]: tab })) }

  function formatDate(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  function formatTime(iso) {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
      ' · ' + new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size={28} light={false} /></div>
  if (error)   return <ErrorBanner message={error} onRetry={load} />

  const stats = {
    total:          pods.length,
    pending_escrow: pods.filter(p => p.status === 'pending_escrow').length,
    active:         pods.filter(p => p.status === 'active').length,
    review:         pods.filter(p => p.status === 'review').length,
    passed:         pods.filter(p => ['passed', 'released'].includes(p.status)).length,
  }

  const FILTERS = ['all', 'forming', 'pending_split', 'pending_escrow', 'active', 'review', 'passed', 'failed', 'released']
  const filtered = filter === 'all' ? pods : pods.filter(p => p.status === filter)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {[
          { n: stats.total,          lbl: 'Total',          sub: 'All pods'          },
          { n: stats.pending_escrow, lbl: 'Awaiting Escrow',sub: 'Funded by project' },
          { n: stats.active,         lbl: 'Active',         sub: 'Work in progress'  },
          { n: stats.review,         lbl: 'In Review',      sub: 'Awaiting verdict'  },
          { n: stats.passed,         lbl: 'Passed',         sub: 'Escrow eligible'   },
        ].map(s => (
          <div key={s.lbl} className="bg-white border border-black/[0.07] rounded-[12px] px-4 py-4">
            <span className="font-serif text-[26px] font-light text-ink tracking-[-0.05em] block leading-none mb-1">{s.n}</span>
            <span className="font-medium text-[11.5px] text-ink block mb-0.5">{s.lbl}</span>
            <span className="text-[11px] font-light text-[#AAA]">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-[#F3F4F6] border border-black/[0.06] rounded-[10px] px-4 py-3.5 mb-5">
        <i className="bi bi-info-circle text-[13px] text-[#999] flex-shrink-0 mt-0.5" />
        <p className="text-[13px] font-light text-[#888] leading-snug">
          Pods are created by users. Review deliverables, check the split agreement, then pass or fail.
          Passing unlocks escrow claims for pod members. All deliverables must be approved before you can pass.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`font-mono text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full border transition-all cursor-pointer
              ${filter === f ? 'bg-ink text-paper border-transparent' : 'text-[#AAA] border-black/[0.1] bg-transparent hover:border-black/20'}`}>
            {f === 'all' ? `All (${pods.length})` : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <i className="bi bi-people text-[40px] text-[#E0E0E0] block mb-4" />
          <p className="text-[14px] font-light text-[#C8C8C8]">
            {pods.length === 0 ? 'No pods yet' : 'No pods match this filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pod => {
            const allDelivApproved = pod.deliverables?.length > 0 &&
              pod.deliverables.every(d => d.status === 'approved')
            const splitTotal = pod.members?.reduce((s, m) => s + (m.splitPercent ?? 0), 0) ?? 0
            const isExpanded = expanded === pod.id
            const tab = podTab(pod.id)

            return (
              <div key={pod.id} className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden">

                {/* Pod header */}
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-black/[0.01] transition-colors"
                  onClick={() => setExpanded(e => e === pod.id ? null : pod.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-medium text-ink tracking-[-0.01em]">{pod.name}</span>
                      <PodStatusBadge status={pod.status} />
                      {/* Escrow funded indicator */}
                      {pod.escrowFunded && (
                        <span className="font-mono text-[9px] tracking-[0.1em] uppercase bg-green/10 text-green-dark border border-green/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <i className="bi bi-safe2 text-[9px]" /> Escrow funded
                        </span>
                      )}
                      {pod.splitLocked && (
                        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#999] flex items-center gap-1">
                          <i className="bi bi-lock-fill text-[9px]" /> Split locked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {pod.projectName && (
                        <span className="text-[12.5px] font-light text-[#666]">
                          <i className="bi bi-buildings text-[10px] mr-1 text-[#BBB]" />
                          {pod.projectName}
                        </span>
                      )}
                      {pod.projectOwner && (
                        <span className="text-[12px] font-light text-[#999]">
                          by {pod.projectOwner}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-[#CCC]">
                        {pod.memberCount ?? pod.members?.length ?? 0} members
                      </span>
                      {pod.escrowAmount && (
                        <span className="font-mono text-[10px] text-[#1DC433] font-medium">
                          {pod.escrowAmount} USDC
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-[#CCC]">{formatDate(pod.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {pod.status === 'review' && (
                      <>
                        <button
                          onClick={() => handlePass(pod)}
                          disabled={acting === pod.id || !allDelivApproved}
                          title={!allDelivApproved ? 'All deliverables must be approved first' : ''}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-ink bg-[#2DFC44] px-3 py-1.5 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer font-mono tracking-wide disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {acting === pod.id ? <Spinner size={12} /> : <i className="bi bi-check-lg" />}
                          {allDelivApproved ? 'Pass' : 'Pass (pending)'}
                        </button>
                        <button
                          onClick={() => setFailing(pod)}
                          disabled={acting === pod.id}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-[#999] border border-black/[0.1] px-3 py-1.5 rounded-full hover:border-red-300 hover:text-red-500 transition-colors bg-transparent cursor-pointer font-mono tracking-wide disabled:opacity-50 whitespace-nowrap"
                        >
                          <i className="bi bi-x" /> Fail
                        </button>
                      </>
                    )}
                    {pod.status === 'passed' && (
                      <button
                        onClick={() => handleRelease(pod)}
                        disabled={acting === pod.id}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-ink bg-[#2DFC44] px-3 py-1.5 rounded-full hover:bg-[#1DC433] transition-colors border-none cursor-pointer font-mono tracking-wide disabled:opacity-50 whitespace-nowrap"
                      >
                        {acting === pod.id ? <Spinner size={12} /> : <i className="bi bi-safe2" />} Release Escrow
                      </button>
                    )}
                    {pod.status === 'released' && (
                      <span className="font-mono text-[10px] text-[#1DC433] flex items-center gap-1">
                        <i className="bi bi-check2-circle" /> Released
                      </span>
                    )}
                    <button className="w-7 h-7 flex items-center justify-center text-[#CCC] hover:text-ink transition-colors bg-transparent border-none cursor-pointer">
                      <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-[11px]`} />
                    </button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div className="border-t border-black/[0.05] bg-[#FAFAF8]" style={{ animation: 'up 0.2s both' }}>

                    {/* Sub-tabs */}
                    <div className="flex gap-0 border-b border-black/[0.05] px-6">
                      {[
                        { key: 'details',      label: 'Details',      icon: 'bi-card-list'   },
                        { key: 'split',        label: 'Split',        icon: 'bi-pie-chart'   },
                        { key: 'deliverables', label: 'Deliverables', icon: 'bi-check2-square' },
                        { key: 'chat',         label: 'Split Chat',   icon: 'bi-chat-dots'   },
                      ].map(t => (
                        <button key={t.key}
                          onClick={() => setPodTab(pod.id, t.key)}
                          className={`flex items-center gap-1.5 px-4 py-3 text-[12px] border-b-2 transition-all bg-transparent cursor-pointer -mb-px whitespace-nowrap
                            ${tab === t.key ? 'border-ink text-ink font-medium' : 'border-transparent text-[#AAA] hover:text-[#666] font-light'}`}>
                          <i className={`bi ${t.icon} text-[12px]`} />
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="px-6 py-5">

                      {/* ── Details tab ── */}
                      {tab === 'details' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: 'Pod Admin',    value: pod.podAdmin ?? '—'                             },
                              { label: 'Project',      value: pod.projectName ?? '—'                          },
                              { label: 'Project Owner',value: pod.projectOwner ?? '—'                         },
                              { label: 'Escrow',       value: pod.escrowAmount ? `${pod.escrowAmount} USDC` : 'Not funded' },
                            ].map(item => (
                              <div key={item.label} className="bg-white border border-black/[0.06] rounded-[10px] px-4 py-3">
                                <p className="font-mono text-[9.5px] tracking-[0.1em] uppercase text-[#CCC] mb-1">{item.label}</p>
                                <p className="text-[13px] font-light text-ink">{item.value}</p>
                              </div>
                            ))}
                          </div>
                          {/* Escrow status */}
                          <div className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border ${pod.escrowFunded ? 'bg-green/5 border-green/20' : 'bg-amber-50 border-amber-200'}`}>
                            <i className={`bi ${pod.escrowFunded ? 'bi-safe2 text-green-dark' : 'bi-hourglass-split text-amber-600'} text-[14px]`} />
                            <div>
                              <p className={`text-[13px] font-medium ${pod.escrowFunded ? 'text-green-dark' : 'text-amber-700'}`}>
                                {pod.escrowFunded ? `Escrow funded — ${pod.escrowAmount} USDC locked` : 'Waiting for project owner to deposit USDC'}
                              </p>
                              {pod.escrowFundedAt && (
                                <p className="font-mono text-[10px] text-[#AAA]">Funded {formatDate(pod.escrowFundedAt)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Split tab ── */}
                      {tab === 'split' && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#AAA]">
                              Pod Members & Agreed Split
                            </p>
                            {pod.splitLocked ? (
                              <span className="font-mono text-[10px] text-[#1DC433] flex items-center gap-1">
                                <i className="bi bi-lock-fill text-[9px]" /> Locked on-chain
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-amber-600 flex items-center gap-1">
                                <i className="bi bi-unlock text-[9px]" /> Not yet locked
                              </span>
                            )}
                          </div>

                          {pod.members && pod.members.length > 0 ? (
                            <div className="space-y-2">
                              {pod.members.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white border border-black/[0.06] rounded-[10px] px-4 py-3">
                                  <div className="w-8 h-8 rounded-full bg-black/[0.06] flex items-center justify-center flex-shrink-0">
                                    <span className="font-mono text-[10px] text-[#888]">
                                      {(m.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-medium text-ink">{m.name ?? m.talentId}</p>
                                    <p className="font-mono text-[11px] text-[#AAA]">{m.role}</p>
                                  </div>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    {m.splitPercent != null ? (
                                      <>
                                        {/* Visual bar */}
                                        <div className="w-24 h-1.5 bg-black/[0.06] rounded-full overflow-hidden hidden sm:block">
                                          <div className="h-full bg-[#1DC433] rounded-full" style={{ width: `${m.splitPercent}%` }} />
                                        </div>
                                        <span className="font-mono text-[13px] text-[#1DC433] font-medium w-10 text-right">
                                          {m.splitPercent}%
                                        </span>
                                      </>
                                    ) : (
                                      <span className="font-mono text-[11px] text-[#CCC]">—</span>
                                    )}
                                  </div>
                                </div>
                              ))}

                              {/* Total */}
                              <div className="flex items-center justify-between pt-2 px-4">
                                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#BBB]">Total</span>
                                <span className={`font-mono text-[13px] font-medium ${splitTotal === 100 ? 'text-[#1DC433]' : 'text-red-500'}`}>
                                  {splitTotal}% {splitTotal === 100 ? '✓' : `(${100 - splitTotal}% unallocated)`}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[13px] font-light text-[#BBB] py-4">Split not yet submitted by pod admin.</p>
                          )}
                        </div>
                      )}

                      {/* ── Deliverables tab ── */}
                      {tab === 'deliverables' && (
                        <div>
                          {pod.deliverables && pod.deliverables.length > 0 ? (
                            <div className="space-y-2">
                              {pod.deliverables.map((d, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white border border-black/[0.06] rounded-[10px] px-4 py-3.5">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                                    ${d.status === 'approved' ? 'bg-[#2DFC44]' : d.status === 'submitted' ? 'bg-amber-100' : d.status === 'rejected' ? 'bg-red-100' : 'bg-black/[0.05]'}`}>
                                    <i className={`bi text-[11px]
                                      ${d.status === 'approved' ? 'bi-check text-ink' : d.status === 'submitted' ? 'bi-clock text-amber-600' : d.status === 'rejected' ? 'bi-x text-red-500' : 'bi-circle text-[#CCC]'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="text-[13px] font-medium text-ink">{d.title}</p>
                                      <span className={`font-mono text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full
                                        ${d.status === 'approved' ? 'bg-green/10 text-green-dark' :
                                          d.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                                          d.status === 'rejected' ? 'bg-red-50 text-red-500' :
                                          'bg-black/[0.04] text-[#AAA]'}`}>
                                        {d.status ?? 'pending'}
                                      </span>
                                    </div>
                                    {d.description && <p className="text-[12px] font-light text-[#888] mt-0.5">{d.description}</p>}
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                      {d.dueDate && <span className="font-mono text-[10px] text-[#CCC]">Due {formatDate(d.dueDate)}</span>}
                                      {d.amount  && <span className="font-mono text-[10px] text-[#1DC433]">{d.amount} USDC</span>}
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* All approved indicator */}
                              {allDelivApproved && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-green/5 border border-green/20 rounded-[10px]">
                                  <i className="bi bi-check2-all text-[#1DC433] text-[14px]" />
                                  <span className="text-[13px] font-medium text-green-dark">All deliverables approved — project can be passed</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-[13px] font-light text-[#BBB] py-4">No deliverables defined yet.</p>
                          )}
                        </div>
                      )}

                      {/* ── Split Chat tab ── */}
                      {tab === 'chat' && (
                        <div>
                          <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#AAA] mb-4">
                            Split Discussion (read-only)
                          </p>
                          {pod.chatMessages && pod.chatMessages.length > 0 ? (
                            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                              {pod.chatMessages.map((msg, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="font-mono text-[9px] text-[#888]">
                                      {(msg.senderName || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-[12.5px] font-medium text-ink">{msg.senderName}</span>
                                      <span className="font-mono text-[10px] text-[#CCC]">{formatTime(msg.sentAt)}</span>
                                    </div>
                                    <p className="text-[13px] font-light text-[#555] leading-snug mt-0.5">{msg.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-8 text-center">
                              <i className="bi bi-chat-dots text-[28px] text-[#E0E0E0] block mb-2" />
                              <p className="text-[13px] font-light text-[#CCC]">No messages yet</p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Fail modal */}
      {failing && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-2xl w-full max-w-[420px] p-7" style={{ animation: 'up 0.25s both' }}>
            <h3 className="font-serif text-[20px] font-light tracking-[-0.03em] text-ink mb-1">Fail this project?</h3>
            <p className="text-[13px] font-light text-[#888] mb-5">
              <strong className="text-ink">{failing.name}</strong> will be marked as failed.
              Escrow will be refunded to the project owner.
            </p>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#999] block mb-2">Reason (optional)</label>
            <textarea
              value={failReason}
              onChange={e => setFailReason(e.target.value)}
              placeholder="Deliverables not met…"
              rows={3}
              className="w-full font-sans text-[13.5px] font-light bg-white border border-black/[0.09] rounded-[10px] px-4 py-3 outline-none focus:border-red-300 resize-none mb-5"
            />
            <div className="flex gap-2">
              <button onClick={() => handleFail(failing)} disabled={acting === failing.id}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-[10px] font-sans text-[13.5px] font-medium hover:bg-red-600 transition-colors border-none cursor-pointer disabled:opacity-50">
                {acting === failing.id ? <Spinner size={16} /> : <i className="bi bi-x-circle" />} Confirm Fail
              </button>
              <button onClick={() => { setFailing(null); setFailReason('') }}
                className="flex-1 py-3 rounded-[10px] border border-black/[0.09] text-[#888] font-sans text-[13.5px] font-light hover:border-black/20 transition-all bg-transparent cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ── Team Panel (owner only) ───────────────────────────────────────────────────

function TeamPanel({ showToast, currentAdmin }) {
  const [admins,      setAdmins]      = useState([])
  const [invites,     setInvites]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteErr,   setInviteErr]   = useState('')
  const [sending,     setSending]     = useState(false)
  const [removing,    setRemoving]    = useState(null)  // id being removed
  const [confirmRemove, setConfirmRemove] = useState(null) // admin object pending confirm

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
    if (error) {
      const msg = error.toLowerCase().includes('already') || error.includes('409')
        ? 'An admin account or pending invite already exists for this email.'
        : error
      setInviteErr(msg); return
    }
    setInviteEmail('')
    setInvites(prev => [data.invite, ...prev])
    showToast(`Invite sent to ${inviteEmail.trim()}`)
  }

  async function handleRemove(admin) {
    setRemoving(admin.id)
    setConfirmRemove(null)
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

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function timeAgo(iso) {
    if (!iso) return 'Never'
    const diff = Date.now() - new Date(iso).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins  < 2)   return 'Just now'
    if (mins  < 60)  return `${mins}m ago`
    if (hours < 24)  return `${hours}h ago`
    if (days  < 30)  return `${days}d ago`
    return formatDate(iso)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Spinner size={24} dark />
    </div>
  )

  if (error) return <ErrorBanner message={error} onRetry={load} />

  const isCurrentAdmin = (id) => currentAdmin?.id === id

  return (
    <div className="max-w-[760px]">

      {/* Invite form */}
      <div className="bg-white border border-black/[0.07] rounded-[14px] p-6 mb-8">
        <h3 className="font-serif text-[17px] font-light tracking-[-0.03em] text-ink mb-1">
          Invite an admin
        </h3>
        <p className="text-[13px] font-light text-[#999] mb-5">
          They'll receive an email with a link to set up their account. Invite expires in 48h.
        </p>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => { setInviteEmail(e.target.value); setInviteErr('') }}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              placeholder="colleague@work3labs.com"
              className={[
                'w-full font-sans text-[13.5px] font-light bg-white text-ink',
                'border rounded-[10px] px-4 py-3 outline-none transition-all',
                'placeholder-[#D0D0D0]',
                inviteErr
                  ? 'border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                  : 'border-black/[0.09] focus:border-[#1DC433] focus:shadow-[0_0_0_3px_rgba(45,252,68,0.08)]',
              ].join(' ')}
            />
            {inviteErr && (
              <p className="mt-1.5 text-[12px] text-red-500 font-light flex items-center gap-1.5">
                <i className="bi bi-exclamation-circle text-[11px]" />{inviteErr}
              </p>
            )}
          </div>
          <button
            onClick={handleInvite}
            disabled={sending}
            className="flex items-center gap-2 bg-ink text-paper px-5 py-3 rounded-[10px] font-sans text-[13.5px] font-medium hover:bg-[#1A1A1A] transition-colors border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
          >
            {sending ? <><Spinner size={15} />Sending…</> : <><i className="bi bi-send text-[13px]" />Send invite</>}
          </button>
        </div>
      </div>

      {/* Active admins */}
      <div className="mb-8">
        <h3 className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] mb-4">
          Active admins — {admins.length}
        </h3>
        <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden divide-y divide-black/[0.05]">
          {admins.map(admin => (
            <div key={admin.id} className="flex items-center gap-4 px-6 py-4">
              {/* Avatar initials */}
              <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-[11px] text-[#666] uppercase">
                  {(admin.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('')}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-medium text-ink truncate">{admin.name}</span>
                  {admin.role === 'owner' && (
                    <span className="font-mono text-[9px] tracking-[0.1em] uppercase bg-[#2DFC44] text-ink px-2 py-0.5 rounded-full flex-shrink-0">
                      Owner
                    </span>
                  )}
                  {isCurrentAdmin(admin.id) && (
                    <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#AAA] flex-shrink-0">you</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-[12.5px] font-light text-[#999] truncate">{admin.email}</span>
                  <span className="text-[11px] font-mono text-[#CCC] flex-shrink-0">
                    Last login: {timeAgo(admin.lastLoginAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono text-[10px] text-[#CCC] hidden sm:block">
                  {formatDate(admin.joinedAt)}
                </span>
                {/* Can't remove yourself or owner */}
                {!isCurrentAdmin(admin.id) && admin.role !== 'owner' && (
                  confirmRemove?.id === admin.id ? (
                    <div className="flex items-center gap-2" style={{ animation: 'up 0.15s both' }}>
                      <span className="text-[12px] font-light text-[#999]">Remove?</span>
                      <button
                        onClick={() => handleRemove(admin)}
                        disabled={removing === admin.id}
                        className="font-mono text-[10px] tracking-[0.08em] uppercase text-red-500 border border-red-200 rounded-full px-3 py-1 bg-transparent cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {removing === admin.id ? '…' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#BBB] border border-black/[0.09] rounded-full px-3 py-1 bg-transparent cursor-pointer hover:border-black/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemove(admin)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#CCC] hover:text-red-500 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                      title={`Remove ${admin.name}`}
                    >
                      <i className="bi bi-person-dash text-[14px]" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}

          {admins.length === 0 && (
            <div className="px-6 py-8 text-center text-[13px] font-light text-[#BBB]">
              No admins found
            </div>
          )}
        </div>
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div>
          <h3 className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] mb-4">
            Pending invites — {invites.length}
          </h3>
          <div className="bg-white border border-black/[0.07] rounded-[14px] overflow-hidden divide-y divide-black/[0.05]">
            {invites.map(invite => (
              <div key={invite.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <i className="bi bi-envelope text-[14px] text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-light text-ink truncate block">{invite.email}</span>
                  <span className="text-[11.5px] font-mono text-[#CCC]">
                    Expires {formatDate(invite.expiresAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleResend(invite)}
                    className="font-mono text-[10px] tracking-[0.08em] uppercase text-[#999] border border-black/[0.09] rounded-full px-3 py-1 bg-transparent cursor-pointer hover:border-black/20 hover:text-ink transition-colors"
                    title="Resend invite"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => handleCancelInvite(invite)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#CCC] hover:text-red-500 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                    title="Cancel invite"
                  >
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

// ── Main export ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'talents',  icon: 'bi-person-check', label: 'Talent Applications'  },
  { key: 'projects', icon: 'bi-buildings',    label: 'Project Applications' },
  { key: 'pods',     icon: 'bi-people-fill',  label: 'Pods Review'  },
  { key: 'team',     icon: 'bi-shield-lock',  label: 'Team',  ownerOnly: true },
]

export default function Admin() {
  const { admin, logout } = useAuth()
  const isOwner = admin?.role === 'owner'

  

  // Separate hook instances per type so pagination/sort are independent
  const talentHook  = useApplicants('talent')
  const projectHook = useApplicants('project')

  const [tab,          setTab]          = useState('talents')
  const [broadcastType,setBroadcastType] = useState(null)
  const [showReset,    setShowReset]    = useState(false)
  const [toast,        setToast]        = useState(null)

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
    if (r1.error || r2.error) showToast('Reset partially failed — check console', 'error')
    else showToast('All application data has been reset')
  }

  const totalPending =
    talentHook.rows.filter(a => a.status === 'pending').length +
    projectHook.rows.filter(a => a.status === 'pending').length

  const broadcastApproved =
    broadcastType === 'talent'
      ? talentHook.approved
      : broadcastType === 'project'
        ? projectHook.approved
        : []

  // Only show Team tab to owner
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
          <button
            onClick={() => setShowReset(true)}
            className="font-mono text-[10px] tracking-[0.1em] uppercase text-red-400 border border-red-200 rounded-full px-2.5 sm:px-3 py-1 bg-transparent cursor-pointer hover:bg-red-50 transition-colors flex items-center gap-1.5">
            <i className="bi bi-arrow-counterclockwise text-[11px]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          {/* Signed-in admin name + logout */}
          {admin?.name && (
            <span className="font-mono text-[10px] tracking-[0.08em] text-[#BBB] hidden md:block truncate max-w-[120px]">
              {admin.name}
            </span>
          )}
          <button
            onClick={logout}
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
        {/* Header */}
        <div className="px-5 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8 border-b border-black/[0.07]">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[#AAA] block mb-2">Work3 Labs</span>
          <h1 className="font-serif text-[clamp(24px,3vw,38px)] font-light tracking-[-0.04em] text-ink mb-1">
            Applications Dashboard
          </h1>
          <p className="text-[13.5px] sm:text-[14px] font-light text-[#999] tracking-[-0.01em]">
            Review applicants, manage pods, and send invitations.
          </p>
        </div>

        {/* Tabs */}
        <div className="px-5 sm:px-10 pt-5 sm:pt-6">
          <div className="flex gap-1 border-b border-black/[0.07] mb-6 sm:mb-8 overflow-x-auto">
            {visibleTabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-[13px] sm:text-[13.5px] border-b-2 transition-all bg-transparent border-none cursor-pointer -mb-px whitespace-nowrap
                  ${tab === t.key ? 'border-ink text-ink font-medium' : 'border-transparent text-[#AAA] hover:text-[#666] font-light'}`}>
                <i className={`bi ${t.icon} text-[14px]`} />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.key === 'talents' ? 'Talents' : t.key === 'projects' ? 'Projects' : t.key === 'pods' ? 'Pods' : 'Team'}</span>
                {t.key !== 'pods' && t.key !== 'team' && (
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-ink text-paper' : 'bg-black/[0.06] text-[#999]'}`}>
                    {t.key === 'talents' ? (talentHook.loading ? '—' : talentHook.total) : (projectHook.loading ? '—' : projectHook.total)}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="pb-16">
            {tab === 'talents' && (
              <ApplicantPanel type="talent" onBroadcast={setBroadcastType} showToast={showToast} />
            )}
            {tab === 'projects' && (
              <ApplicantPanel type="project" onBroadcast={setBroadcastType} showToast={showToast} />
            )}
            {tab === 'pods' && (
              <PodsPanel showToast={showToast} />
            )}
            {tab === 'team' && isOwner && (
              <TeamPanel showToast={showToast} currentAdmin={admin} />
            )}
          </div>
        </div>
      </div>

      {/* Broadcast modal */}
      {broadcastType && (
        <BroadcastModal
          type={broadcastType}
          recipients={broadcastApproved}
          onSend={handleBroadcast}
          onClose={() => setBroadcastType(null)}
        />
      )}

      {/* Reset modal */}
      {showReset && (
        <ResetModal
          onConfirm={handleReset}
          onClose={() => setShowReset(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}