/**
 * useApplicants
 *
 * Manages paginated, sortable applicant state for a single tab (type).
 * One instance per tab — avoids mixing talent/project state.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchApplicants,
  approveApplicant,
  rejectApplicant,
  bulkAction,
  broadcastEmail,
  resetAllApplicants,
} from '../services/api'

export const DEFAULT_LIMIT = 50

export function useApplicants(type) {
  const [rows,       setRows]       = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page,       setPage]       = useState(1)
  const [sort,       setSort]       = useState('applied')
  const [dir,        setDir]        = useState('desc')
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const load = useCallback(async (opts = {}) => {
    setLoading(true)
    setError(null)
    const { data, error } = await fetchApplicants({
      type,
      page:  opts.page  ?? page,
      limit: DEFAULT_LIMIT,
      sort:  opts.sort  ?? sort,
      dir:   opts.dir   ?? dir,
    })
    if (error) {
      setError(error)
    } else {
      // Normalise: flat array or paginated envelope
      if (Array.isArray(data)) {
        setRows(data)
        setTotal(data.length)
        setTotalPages(1)
      } else {
        setRows(data.data ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.totalPages ?? 1)
      }
    }
    setLoading(false)
  }, [type, page, sort, dir])

  useEffect(() => { load() }, [load])

  // ── Sorting ──────────────────────────────────────────────────────────────────

  function toggleSort(col) {
    const nextDir = sort === col && dir === 'desc' ? 'asc' : 'desc'
    setSort(col)
    setDir(nextDir)
    setPage(1)
    load({ sort: col, dir: nextDir, page: 1 })
  }

  // ── Pagination ───────────────────────────────────────────────────────────────

  function goToPage(p) {
    setPage(p)
    load({ page: p })
  }

  // ── Optimistic updaters ──────────────────────────────────────────────────────

  function updateRows(ids, patch) {
    setRows(prev => prev.map(a => ids.includes(a.id) ? { ...a, ...patch } : a))
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function approve(id, { note } = {}) {
    const { error } = await approveApplicant(id, { note })
    if (error) return { error }
    updateRows([id], { status: 'approved' })
    return { error: null }
  }

  async function reject(id) {
    const { error } = await rejectApplicant(id)
    if (error) return { error }
    updateRows([id], { status: 'rejected' })
    return { error: null }
  }

  async function bulk(ids, action) {
    const { error } = await bulkAction(ids, action)
    if (error) return { error }
    updateRows(ids, { status: action === 'approve' ? 'approved' : 'rejected' })
    return { error: null }
  }

  async function broadcast(opts) {
    return broadcastEmail(opts)
  }

  async function reset() {
    const { error } = await resetAllApplicants()
    if (error) return { error }
    setRows([])
    setTotal(0)
    setTotalPages(1)
    setPage(1)
    return { error: null }
  }

  const approved = rows.filter(a => a.status === 'approved')

  return {
    rows, total, totalPages, page, sort, dir,
    loading, error,
    approved,
    toggleSort, goToPage,
    approve, reject, bulk, broadcast, reset,
    reload: load,
  }
}
