import React, { useState, useMemo } from 'react'
import Header from './components/Header'
import SubmitModal from './components/SubmitModal'
import SubmissionsTable from './components/SubmissionsTable'
import StatsBar from './components/StatsBar'
import SearchBar from './components/SearchBar'
import TableSkeleton from './components/TableSkeleton'
import Toast from './components/Toast'
import AnnouncementBanner from './components/AnnouncementBanner'
import { useSubmissions } from './hooks/useSubmissions'
import styles from './App.module.css'

function matchesSearch(submission, query) {
  const q = query.toLowerCase()
  return (
    submission.fullName.toLowerCase().includes(q) ||
    submission.instagram.toLowerCase().includes(q) ||
    submission.phone.toLowerCase().includes(q)
  )
}

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { submissions, loading, error, clearError, addSubmission, updateStatus, updateNote } = useSubmissions()

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return submissions
    return submissions.filter((s) => matchesSearch(s, q))
  }, [submissions, searchQuery])

  const isFiltered = searchQuery.trim().length > 0

  return (
    <div className={styles.app}>
      <Header onSubmitClick={() => setIsModalOpen(true)} />
      <AnnouncementBanner />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Affiliate Submissions</h1>
              <p className={styles.pageSubtitle}>
                Review and manage all incoming affiliate video submissions.
              </p>
            </div>
          </div>

          <StatsBar submissions={submissions} />

          <div className={styles.tableControls}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {loading ? (
            <TableSkeleton />
          ) : (
            <SubmissionsTable
              submissions={filteredSubmissions}
              isFiltered={isFiltered}
              onStatusChange={updateStatus}
              onNoteChange={updateNote}
            />
          )}
        </div>
      </main>

      <SubmitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addSubmission}
      />

      <Toast message={error} onDismiss={clearError} />
    </div>
  )
}
