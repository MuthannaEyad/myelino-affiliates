import { useState, useCallback, useEffect } from 'react'
import { fetchTopCreators, saveTopCreator } from '../services/topCreatorsService'

const DEFAULT = [
  { rank: 1, member_id: null, views: 0, downloads: 0, payout: 0 },
  { rank: 2, member_id: null, views: 0, downloads: 0, payout: 0 },
  { rank: 3, member_id: null, views: 0, downloads: 0, payout: 0 },
]

export function useTopCreators() {
  const [topCreators, setTopCreators] = useState(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopCreators()
      .then((rows) => { if (rows.length) setTopCreators(rows) })
      .catch((err) => setError(err.message ?? 'Failed to load top creators'))
      .finally(() => setLoading(false))
  }, [])

  const saveAll = useCallback(async (slots) => {
    try {
      await Promise.all(
        slots.map((s) => saveTopCreator(s.rank, s.member_id, s.views, s.downloads, s.payout))
      )
      setTopCreators(slots)
      return true
    } catch (err) {
      setError(err.message ?? 'Failed to save')
      return false
    }
  }, [])

  return { topCreators, loading, error, saveAll }
}
