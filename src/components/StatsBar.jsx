import React from 'react'
import styles from './StatsBar.module.css'

export default function StatsBar({ submissions }) {
  const total = submissions.length
  const accepted = submissions.filter((s) => s.status === 'accepted').length
  const rejected = submissions.filter((s) => s.status === 'rejected').length
  const pending = submissions.filter((s) => s.status === 'not_reviewed').length

  const stats = [
    { label: 'Total', value: total, className: styles.total },
    { label: 'Not Reviewed', value: pending, className: styles.pending },
    { label: 'Accepted', value: accepted, className: styles.accepted },
    { label: 'Rejected', value: rejected, className: styles.rejected },
  ]

  return (
    <div className={styles.bar}>
      {stats.map(({ label, value, className }) => (
        <div key={label} className={`${styles.stat} ${className}`}>
          <span className={styles.value}>{value}</span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  )
}
