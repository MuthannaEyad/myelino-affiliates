import React, { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { formatSubmissionDate } from '../utils/dateFormatter'
import styles from './SubmissionsTable.module.css'

const COL_COUNT = 9

export default function SubmissionsTable({
  submissions,
  isFiltered,
  onUpdateMyelino,
  onUpdateTiktok,
  onRemove,
}) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  function requestDelete(id) {
    setPendingDeleteId(id)
  }

  function confirmDelete() {
    onRemove(pendingDeleteId)
    setPendingDeleteId(null)
  }

  function cancelDelete() {
    setPendingDeleteId(null)
  }

  if (submissions.length === 0) {
    return isFiltered ? <NoResults /> : <NoSubmissions />
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Full Name</th>
            <th className={styles.th}>Phone</th>
            <th className={styles.th}>Instagram</th>
            <th className={styles.th}>TikTok</th>
            <th className={styles.th}>Video</th>
            <th className={styles.th}>Submitted</th>
            <th className={styles.th}>Posted on Myelino</th>
            <th className={styles.th}>Posted on TikTok</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id} className={styles.row}>
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
                {submission.tiktok ? (
                  <a
                    href={`https://tiktok.com/@${submission.tiktok}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.tiktokLink}
                  >
                    @{submission.tiktok}
                  </a>
                ) : (
                  <span className={styles.emptyCell}>—</span>
                )}
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
                  View
                </a>
              </td>
              <td className={styles.td}>
                <span className={styles.date}>{formatSubmissionDate(submission.submittedAt)}</span>
              </td>

              {/* Posted on Myelino */}
              <td className={styles.td}>
                <div className={styles.postedCell}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkMyelino}
                      checked={submission.postedOnMyelino}
                      onChange={(e) =>
                        onUpdateMyelino(
                          submission.id,
                          e.target.checked,
                          submission.myelinoCount || 1
                        )
                      }
                    />
                    <span className={styles.checkCustom} />
                  </label>
                  {submission.postedOnMyelino && (
                    <input
                      type="number"
                      min="1"
                      className={styles.countInput}
                      value={submission.myelinoCount || 1}
                      onChange={(e) =>
                        onUpdateMyelino(
                          submission.id,
                          true,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      aria-label="Number of Myelino videos"
                    />
                  )}
                </div>
              </td>

              {/* Posted on TikTok */}
              <td className={styles.td}>
                <div className={styles.postedCell}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkTiktok}
                      checked={submission.postedOnTiktok}
                      onChange={(e) =>
                        onUpdateTiktok(
                          submission.id,
                          e.target.checked,
                          submission.tiktokCount || 1
                        )
                      }
                    />
                    <span className={styles.checkCustomTiktok} />
                  </label>
                  {submission.postedOnTiktok && (
                    <input
                      type="number"
                      min="1"
                      className={styles.countInput}
                      value={submission.tiktokCount || 1}
                      onChange={(e) =>
                        onUpdateTiktok(
                          submission.id,
                          true,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      aria-label="Number of TikTok videos"
                    />
                  )}
                </div>
              </td>

              <td className={styles.td}>
                <button
                  className={styles.removeBtn}
                  onClick={() => requestDelete(submission.id)}
                  aria-label={`Remove submission from ${submission.fullName}`}
                  title="Remove submission"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        title="Delete submission?"
        message="This will permanently remove the submission. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}

function NoSubmissions() {
  return (
    <EmptyState
      title="No submissions for this day"
      subtitle='Click "Add Submission" to add the first entry.'
    />
  )
}

function NoResults() {
  return (
    <EmptyState
      title="No results found"
      subtitle="Try adjusting your search."
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
