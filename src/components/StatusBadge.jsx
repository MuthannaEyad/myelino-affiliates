import React from 'react'
import styles from './StatusBadge.module.css'

const STATUS_CONFIG = {
  not_reviewed: { label: 'Not Reviewed', className: styles.notReviewed },
  accepted:     { label: 'Accepted',     className: styles.accepted },
  rejected:     { label: 'Rejected',     className: styles.rejected },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_reviewed
  return (
    <span className={`${styles.badge} ${config.className}`}>
      <span className={styles.dot} />
      {config.label}
    </span>
  )
}
