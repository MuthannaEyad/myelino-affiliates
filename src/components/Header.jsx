import React from 'react'
import styles from './Header.module.css'

export default function Header() {
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
      </div>
    </header>
  )
}
