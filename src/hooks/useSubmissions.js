import { useState, useCallback, useEffect, useRef } from 'react'
import {
  fetchSubmissions,
  insertSubmission,
  updateSubmissionStatus,
  updateSubmissionNote,
  deleteSubmission,
} from '../services/submissionsService'

const NOTE_DEBOUNCE_MS = 600

export function useSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const noteTimers = useRef({})

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

  const updateStatus = useCallback(async (id, status) => {
    // Optimistic update — reflect instantly in the UI
    const previous = submissions
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
    try {
      await updateSubmissionStatus(id, status)
    } catch (err) {
      setSubmissions(previous) // revert on failure
      setError(err.message ?? 'Failed to update status')
    }
  }, [submissions])

  const updateNote = useCallback((id, rejectionNote) => {
    // Local state update is immediate for smooth typing
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, rejectionNote } : s))
    )
    // DB write is debounced to avoid hammering on every keystroke
    clearTimeout(noteTimers.current[id])
    noteTimers.current[id] = setTimeout(async () => {
      try {
        await updateSubmissionNote(id, rejectionNote)
      } catch (err) {
        setError(err.message ?? 'Failed to save rejection note')
      }
    }, NOTE_DEBOUNCE_MS)
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

  return { submissions, loading, error, clearError, addSubmission, updateStatus, updateNote, removeSubmission }
}
