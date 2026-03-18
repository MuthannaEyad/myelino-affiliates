import React from 'react'
import styles from './MembersCTA.module.css'

export default function MembersCTA({ onOpen }) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      </div>
      <div className={styles.text}>
        <p className={styles.heading}>Are you an affiliate member?</p>
        <p className={styles.sub}>
          You need to be added to the members list before you can submit. Click to add yourself — it only takes a second.
        </p>
      </div>
      <button className={styles.btn} onClick={onOpen}>
        Add Yourself
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  )
}
