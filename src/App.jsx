import React, { useState, useMemo } from 'react'
import Header from './components/Header'
import SubmitModal from './components/SubmitModal'
import MembersModal from './components/MembersModal'
import SubmissionsTable from './components/SubmissionsTable'
import StatsBar from './components/StatsBar'
import SearchBar from './components/SearchBar'
import TypeFilter from './components/TypeFilter'
import TableSkeleton from './components/TableSkeleton'
import Toast from './components/Toast'
import AnnouncementBanner from './components/AnnouncementBanner'
import { useSubmissions } from './hooks/useSubmissions'
import { useMembers } from './hooks/useMembers'
import styles from './App.module.css'

function matchesSearch(submission, query) {
  const q = query.toLowerCase()
  return (
    submission.fullName.toLowerCase().includes(q) ||
    submission.instagram.toLowerCase().includes(q) ||
    submission.phone.toLowerCase().includes(q)
  )
}

function isToday(isoString) {
  const d = new Date(isoString)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export default function App() {
  // null = closed, 'social' | 'myelino' = which modal is open
  const [modalMode, setModalMode] = useState(null)
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const { submissions, loading, error, clearError, addSubmission, updateStatus, updateNote, removeSubmission } = useSubmissions()
  const { members, loading: membersLoading, error: membersError, clearError: clearMembersError, addMember, removeMember } = useMembers()

  const filteredSubmissions = useMemo(() => {
    let result = submissions

    const q = searchQuery.trim()
    if (q) result = result.filter((s) => matchesSearch(s, q))

    if (typeFilter === 'social')  result = result.filter((s) => s.submissionType === 'social')
    if (typeFilter === 'myelino') result = result.filter((s) => s.submissionType === 'myelino')
    if (typeFilter === 'today')   result = result.filter((s) => isToday(s.submittedAt))

    return result
  }, [submissions, searchQuery, typeFilter])

  const isFiltered = searchQuery.trim().length > 0 || typeFilter !== 'all'

  return (
    <div className={styles.app}>
      <Header
        onSubmitClick={() => setModalMode('social')}
        onMyelinoClick={() => setModalMode('myelino')}
        onMembersClick={() => setIsMembersOpen(true)}
      />
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

          <TypeFilter value={typeFilter} onChange={setTypeFilter} />

          {loading ? (
            <TableSkeleton />
          ) : (
            <SubmissionsTable
              submissions={filteredSubmissions}
              isFiltered={isFiltered}
              onStatusChange={updateStatus}
              onNoteChange={updateNote}
              onRemove={removeSubmission}
            />
          )}
        </div>
      </main>

      <SubmitModal
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        onSubmit={addSubmission}
        members={members}
        membersLoading={membersLoading}
        mode={modalMode ?? 'social'}
      />

      <MembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        members={members}
        loading={membersLoading}
        error={membersError}
        clearError={clearMembersError}
        addMember={addMember}
        removeMember={removeMember}
      />

      <Toast message={error} onDismiss={clearError} />
    </div>
  )
}
