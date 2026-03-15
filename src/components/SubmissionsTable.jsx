import React, { useState, useMemo } from 'react'
import StatusBadge from './StatusBadge'
import StatusControl from './StatusControl'
import { formatSubmissionDate } from '../utils/dateFormatter'
import styles from './SubmissionsTable.module.css'

const STATUS_SORT_ORDER = { not_reviewed: 0, accepted: 1, rejected: 2 }
const COL_COUNT = 7

export default function SubmissionsTable({ submissions, isFiltered, onStatusChange, onNoteChange }) {
  const [statusSort, setStatusSort] = useState(null) // null | 'asc' | 'desc'

  function toggleStatusSort() {
    setStatusSort((prev) => {
      if (prev === null) return 'asc'
      if (prev === 'asc') return 'desc'
      return null
    })
  }

  const sorted = useMemo(() => {
    if (statusSort === null) return submissions
    return [...submissions].sort((a, b) => {
      const diff = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status]
      return statusSort === 'asc' ? diff : -diff
    })
  }, [submissions, statusSort])

  if (submissions.length === 0) {
    return isFiltered ? <NoResults /> : <NoSubmissions />
  }

  const sortIcon = statusSort === 'asc' ? '↑' : statusSort === 'desc' ? '↓' : '↕'

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Full Name</th>
            <th className={styles.th}>Phone</th>
            <th className={styles.th}>Instagram</th>
            <th className={styles.th}>Video</th>
            <th className={styles.th}>Submitted</th>
            <th
              className={`${styles.th} ${styles.sortable}`}
              onClick={toggleStatusSort}
              title="Click to sort by status"
            >
              Status <span className={styles.sortIcon}>{sortIcon}</span>
            </th>
            <th className={styles.th}>Change Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((submission) => (
            <React.Fragment key={submission.id}>
              <tr className={styles.row}>
                <td className={styles.td}>
                  <span className={styles.name}>{submission.fullName}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.mono}>{submission.phone}</span>
                </td>
                <td className={styles.td}>
                  <a
                    href={`https://instagram.com/${submission.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.instaLink}
                  >
                    @{submission.instagram}
                  </a>
                </td>
                <td className={styles.td}>
                  <a
                    href={submission.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.videoBtn}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    View Video
                  </a>
                </td>
                <td className={styles.td}>
                  <span className={styles.date}>{formatSubmissionDate(submission.submittedAt)}</span>
                </td>
                <td className={styles.td}>
                  <div className={styles.statusCell}>
                    <StatusBadge status={submission.status} />
                    {submission.rejectionNote && (
                      <span className={styles.notePreview} title={submission.rejectionNote}>
                        {submission.rejectionNote}
                      </span>
                    )}
                  </div>
                </td>
                <td className={styles.td}>
                  <StatusControl
                    currentStatus={submission.status}
                    onStatusChange={(status) => onStatusChange(submission.id, status)}
                  />
                </td>
              </tr>

              {submission.status === 'rejected' && (
                <tr className={styles.noteRow}>
                  <td colSpan={COL_COUNT} className={styles.noteTd}>
                    <div className={styles.noteInputWrapper}>
                      <span className={styles.noteLabel}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Rejection note
                        <span className={styles.noteOptional}>(optional)</span>
                      </span>
                      <textarea
                        className={styles.noteTextarea}
                        placeholder="Add a reason for rejection…"
                        value={submission.rejectionNote || ''}
                        onChange={(e) => onNoteChange(submission.id, e.target.value)}
                        rows={2}
                        aria-label={`Rejection note for ${submission.fullName}`}
                      />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NoSubmissions() {
  return (
    <EmptyState
      title="No submissions yet"
      subtitle='Click "Submit Video" to add the first entry.'
    />
  )
}

function NoResults() {
  return (
    <EmptyState
      title="No results found"
      subtitle="Try adjusting your search — no submissions match the current query."
      isSearch
    />
  )
}

function EmptyState({ title, subtitle, isSearch }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        {isSearch ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )}
      </div>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptySubtitle}>{subtitle}</p>
    </div>
  )
}
