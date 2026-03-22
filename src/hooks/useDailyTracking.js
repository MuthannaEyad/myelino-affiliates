import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchTrackingForDate, upsertTracking, toDateStr } from '../services/dailyTrackingService'

const DEBOUNCE_MS = 600

export function useDailyTracking(selectedDate) {
  // Keyed by member_id: { member_id, tracking_date, video_link, posted_on_myelino, myelino_count, posted_on_tiktok, tiktok_count }
  const [tracking, setTracking] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const trackingRef = useRef({})
  const timers = useRef({})

  // Keep ref in sync so debounce callbacks always see latest state
  useEffect(() => {
    trackingRef.current = tracking
  }, [tracking])

  useEffect(() => {
    // Clear any pending saves from the previous date
    Object.keys(timers.current).forEach((k) => clearTimeout(timers.current[k]))
    timers.current = {}

    setLoading(true)
    setTracking({})

    const dateStr = toDateStr(selectedDate)
    fetchTrackingForDate(dateStr)
      .then((records) => {
        const map = {}
        records.forEach((r) => {
          map[r.member_id] = r
        })
        setTracking(map)
      })
      .catch((err) => setError(err.message ?? 'Failed to load tracking data'))
      .finally(() => setLoading(false))
  }, [selectedDate])

  const clearError = useCallback(() => setError(null), [])

  const updateTracking = useCallback(
    (memberId, updates) => {
      const dateStr = toDateStr(selectedDate)

      // Optimistic local update
      setTracking((prev) => ({
        ...prev,
        [memberId]: {
          member_id: memberId,
          tracking_date: dateStr,
          video_link: null,
          posted_on_myelino: false,
          myelino_count: 0,
          posted_on_tiktok: false,
          tiktok_count: 0,
          ...(prev[memberId] || {}),
          ...updates,
        },
      }))

      // Debounce the DB write — coalesces rapid changes for the same member
      clearTimeout(timers.current[memberId])
      timers.current[memberId] = setTimeout(async () => {
        try {
          const current = trackingRef.current[memberId] || {}
          const fields = {
            posted_on_myelino: current.posted_on_myelino ?? false,
            myelino_count: current.myelino_count ?? 0,
            posted_on_instagram: current.posted_on_instagram ?? false,
            instagram_count: current.instagram_count ?? 0,
            posted_on_tiktok: current.posted_on_tiktok ?? false,
            tiktok_count: current.tiktok_count ?? 0,
          }
          const record = await upsertTracking(memberId, dateStr, fields)
          setTracking((prev) => ({ ...prev, [memberId]: record }))
        } catch (err) {
          setError(err.message ?? 'Failed to save')
        }
      }, DEBOUNCE_MS)
    },
    [selectedDate]
  )

  return { tracking, loading, error, clearError, updateTracking }
}
