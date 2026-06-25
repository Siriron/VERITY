import { useState, useEffect, useCallback } from 'react'
import { getAllSources, getTotal, type SourceRecord } from '../lib/genlayer'

export function useRegistry() {
  const [sources, setSources]   = useState<SourceRecord[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [srcs, tot] = await Promise.all([getAllSources(100), getTotal()])
      setSources(srcs)
      setTotal(tot)
    } catch (e) {
      setError('Failed to load registry data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [refresh])

  return { sources, total, loading, error, refresh }
}
