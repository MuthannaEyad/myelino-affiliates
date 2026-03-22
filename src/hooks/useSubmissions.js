import { useState, useCallback, useEffect, useRef } from 'react'
import {
  fetchSubmissions,
  insertSubmission,
  updateMyelinoPosted,
  updateTiktokPosted,
  deleteSubmission,
} from '../services/submissionsService'

const DEBOUNCE_MS = 600

export function useSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const myelinoTimers = useRef({})
  const tiktokTimers = useRef({})

  useEffect(() => {
    fetchSubmissions()
      .then(setSubmissions)
      .catch((err) => setError(err.message ?? 'Failed to load submissions'))
      .finally(() => setLoading(false))
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const addSubmission = useCallback(async (formData) => {
    try {
      const entry = await insertSubmission(formData)
      setSubmissions((prev) => [entry, ...prev])
    } catch (err) {
      setError(err.message ?? 'Failed to save submission')
    }
  }, [])

  const updateMyelino = useCallback((id, posted, count) => {
    // Optimistic update
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, postedOnMyelino: posted, myelinoCount: posted ? (count || 0) : 0 }
          : s
      )
    )
    // Debounced save to avoid hammering DB on every count keystroke
    clearTimeout(myelinoTimers.current[id])
    myelinoTimers.current[id] = setTimeout(async () => {
      try {
        await updateMyelinoPosted(id, posted, count)
      } catch (err) {
        setError(err.message ?? 'Failed to update Myelino status')
      }
    }, DEBOUNCE_MS)
  }, [])

  const updateTiktok = useCallback((id, posted, count) => {
    // Optimistic update
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, postedOnTiktok: posted, tiktokCount: posted ? (count || 0) : 0 }
          : s
      )
    )
    clearTimeout(tiktokTimers.current[id])
    tiktokTimers.current[id] = setTimeout(async () => {
      try {
        await updateTiktokPosted(id, posted, count)
      } catch (err) {
        setError(err.message ?? 'Failed to update TikTok status')
      }
    }, DEBOUNCE_MS)
  }, [])

  const removeSubmission = useCallback(async (id) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
    try {
      await deleteSubmission(id)
    } catch (err) {
      setError(err.message ?? 'Failed to delete submission')
      fetchSubmissions().then(setSubmissions).catch(() => {})
    }
  }, [])

  return {
    submissions,
    loading,
    error,
    clearError,
    addSubmission,
    updateMyelino,
    updateTiktok,
    removeSubmission,
  }
}
