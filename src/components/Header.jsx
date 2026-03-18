import React from 'react'
import styles from './Header.module.css'

export default function Header({ onSubmitClick, onMyelinoClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <img src="logo.png" alt="Myelino" className={styles.logoImg} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>Myelino</span>
            <span className={styles.brandSub}>Affiliate Dashboard</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.myelinoBtn} onClick={onMyelinoClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Posted on Myelino
          </button>
          <button className={styles.submitBtn} onClick={onSubmitClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Posted on Social Media
          </button>
        </div>
      </div>
    </header>
  )
}
