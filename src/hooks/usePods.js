/**
 * usePods
 *
 * Manages pod list and creation for the Pods tab.
 */

import { useState, useEffect, useCallback } from 'react'
import { fetchPods, createPod } from '../services/api'

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

  async function create(body) {
    const { data, error } = await createPod(body)
    if (error) return { error }
    setPods(prev => [data.pod, ...prev])
    return { error: null, pod: data.pod }
  }

  return { pods, loading, error, create, reload: load }
}
