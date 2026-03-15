import React from 'react'
import styles from './AnnouncementBanner.module.css'

export default function AnnouncementBanner() {
  return (
    <div className={styles.banner}>
      <span className={styles.pulse} />
      <p className={styles.text}>
        <strong>Coming soon -</strong> Affiliate Tracking will be available here soon for every user!
      </p>
    </div>
  )
}
