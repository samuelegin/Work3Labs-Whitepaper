'use client'
/**
 * usePods
 *
 * Fetches all user-created pods.
 * Admin views pod details (name, description, members, split),
 * matches pods to projects, passes/fails work, releases escrow,
 * and can unmatch a pod if needed.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  fetchPods,
  fetchPodById,
  matchPodToProject,
  unmatchPod,
  passProject,
  failProject,
  releaseEscrow,
} from '../services/api'

export function usePods() {
  const [pods,    setPods]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await fetchPods()
    if (error) setError(error)
    else setPods(Array.isArray(data) ? data : (data?.data ?? []))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function updatePod(id, patch) {
    setPods(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  async function match(podId, projectId) {
    const { data, error } = await matchPodToProject(podId, projectId)
    if (error) return { error }
    updatePod(podId, { projectId, matched: true, status: 'matched' })
    return { error: null, data }
  }

  async function unmatch(podId) {
    const { error } = await unmatchPod(podId)
    if (error) return { error }
    updatePod(podId, { projectId: null, matched: false, status: 'unmatched' })
    return { error: null }
  }

  async function pass(podId) {
    const { error } = await passProject(podId)
    if (error) return { error }
    updatePod(podId, { status: 'passed' })
    return { error: null }
  }

  async function fail(podId, reason) {
    const { error } = await failProject(podId, { reason })
    if (error) return { error }
    updatePod(podId, { status: 'failed' })
    return { error: null }
  }

  async function release(podId) {
    const { error } = await releaseEscrow(podId)
    if (error) return { error }
    updatePod(podId, { status: 'released' })
    return { error: null }
  }

  async function detail(podId) {
    return fetchPodById(podId)
  }

  return { pods, loading, error, match, unmatch, pass, fail, release, detail, reload: load }
}
