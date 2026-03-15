import React from 'react'
import styles from './StatusControl.module.css'

const STATUSES = [
  { value: 'not_reviewed', label: 'Not Reviewed' },
  { value: 'accepted',     label: 'Accepted' },
  { value: 'rejected',     label: 'Rejected' },
]

export default function StatusControl({ currentStatus, onStatusChange }) {
  function handleChange(e) {
    onStatusChange(e.target.value)
  }

  return (
    <select
      className={`${styles.select} ${styles[currentStatus.replace('_', '')]}`}
      value={currentStatus}
      onChange={handleChange}
      aria-label="Change submission status"
    >
      {STATUSES.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}
