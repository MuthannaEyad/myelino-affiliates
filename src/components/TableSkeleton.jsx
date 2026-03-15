import React from 'react'
import styles from './TableSkeleton.module.css'

const SKELETON_ROWS = 5

export default function TableSkeleton() {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {['Full Name', 'Phone', 'Instagram', 'Video', 'Submitted', 'Status', 'Change Status'].map((h) => (
              <th key={h} className={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} className={styles.row}>
              <td className={styles.td}><span className={`${styles.bone} ${styles.w140}`} /></td>
              <td className={styles.td}><span className={`${styles.bone} ${styles.w110}`} /></td>
              <td className={styles.td}><span className={`${styles.bone} ${styles.w100}`} /></td>
              <td className={styles.td}><span className={`${styles.bone} ${styles.w80} ${styles.rounded}`} /></td>
              <td className={styles.td}><span className={`${styles.bone} ${styles.w130}`} /></td>
              <td className={styles.td}><span className={`${styles.bone} ${styles.w90} ${styles.rounded}`} /></td>
              <td className={styles.td}><span className={`${styles.bone} ${styles.w100} ${styles.rounded}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
