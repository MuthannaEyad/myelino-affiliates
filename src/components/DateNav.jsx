import React from 'react'
import styles from './DateNav.module.css'

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function formatNavDate(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

export default function DateNav({ selectedDate, onPrev, onNext }) {
  const today = new Date()
  const isToday = isSameDay(selectedDate, today)

  return (
    <div className={styles.nav}>
      <button className={styles.arrow} onClick={onPrev} aria-label="Previous day">
        ‹
      </button>
      <div className={styles.dateLabel}>
        <span className={styles.dateFmt}>{formatNavDate(selectedDate)}</span>
        {isToday && <span className={styles.todayBadge}>Today</span>}
      </div>
      <button
        className={styles.arrow}
        onClick={onNext}
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  )
}
