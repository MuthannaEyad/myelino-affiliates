import React from 'react'
import styles from './Header.module.css'

export default function Header({ onLogoClick, subtitle = 'Affiliate Dashboard', showSwitch = false }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div
          className={`${styles.brand} ${onLogoClick ? styles.brandClickable : ''}`}
          onClick={onLogoClick}
          role={onLogoClick ? 'button' : undefined}
          tabIndex={onLogoClick ? 0 : undefined}
          onKeyDown={onLogoClick ? (e) => e.key === 'Enter' && onLogoClick() : undefined}
        >
          <img src="logo.png" alt="Myelino" className={styles.logoImg} />
          <div className={styles.brandText}>
            <span className={styles.brandName}>Myelino</span>
            <span className={styles.brandSub}>{subtitle}</span>
          </div>
        </div>
        {showSwitch && (
          <a href="#/" className={styles.switchLink}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Switch dashboard</span>
          </a>
        )}
      </div>
    </header>
  )
}
