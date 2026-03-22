import React from 'react'
import styles from './DailyTable.module.css'

export default function DailyTable({ members, tracking, onUpdate }) {
  if (members.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p className={styles.emptyTitle}>No members yet</p>
        <p className={styles.emptySubtitle}>Use "Add new member" above to get started.</p>
      </div>
    )
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Full Name</th>
            <th className={styles.th}>Phone</th>
            <th className={styles.th}>Instagram</th>
            <th className={styles.th}>TikTok</th>
            <th className={styles.th}>On Myelino</th>
            <th className={styles.th}>On Instagram</th>
            <th className={styles.th}>On TikTok</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const t = tracking[member.id] || {}

            return (
              <tr key={member.id} className={styles.row}>
                <td className={styles.td}>
                  <span className={styles.name}>{member.fullName}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.mono}>{member.phone}</span>
                </td>
                <td className={styles.td}>
                  <a
                    href={`https://instagram.com/${member.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.instaLink}
                  >
                    @{member.instagram}
                  </a>
                </td>
                <td className={styles.td}>
                  {member.tiktok ? (
                    <a
                      href={`https://tiktok.com/@${member.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.tiktokLink}
                    >
                      @{member.tiktok}
                    </a>
                  ) : (
                    <span className={styles.emptyCell}>—</span>
                  )}
                </td>

                {/* Posted on Myelino */}
                <td className={styles.td}>
                  <PostedCell
                    checked={!!t.posted_on_myelino}
                    count={t.myelino_count || 1}
                    colorClass={styles.checkMyelino}
                    onCheck={(checked) =>
                      onUpdate(member.id, {
                        posted_on_myelino: checked,
                        myelino_count: checked ? (t.myelino_count || 1) : 0,
                      })
                    }
                    onCount={(count) => onUpdate(member.id, { myelino_count: count })}
                    ariaLabel="Myelino videos"
                  />
                </td>

                {/* Posted on Instagram */}
                <td className={styles.td}>
                  <PostedCell
                    checked={!!t.posted_on_instagram}
                    count={t.instagram_count || 1}
                    colorClass={styles.checkInstagram}
                    onCheck={(checked) =>
                      onUpdate(member.id, {
                        posted_on_instagram: checked,
                        instagram_count: checked ? (t.instagram_count || 1) : 0,
                      })
                    }
                    onCount={(count) => onUpdate(member.id, { instagram_count: count })}
                    ariaLabel="Instagram videos"
                  />
                </td>

                {/* Posted on TikTok */}
                <td className={styles.td}>
                  <PostedCell
                    checked={!!t.posted_on_tiktok}
                    count={t.tiktok_count || 1}
                    colorClass={styles.checkTiktok}
                    onCheck={(checked) =>
                      onUpdate(member.id, {
                        posted_on_tiktok: checked,
                        tiktok_count: checked ? (t.tiktok_count || 1) : 0,
                      })
                    }
                    onCount={(count) => onUpdate(member.id, { tiktok_count: count })}
                    ariaLabel="TikTok videos"
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PostedCell({ checked, count, colorClass, onCheck, onCount, ariaLabel }) {
  return (
    <div className={styles.postedCell}>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          className={styles.checkHidden}
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
        />
        <span className={colorClass} />
      </label>
      {checked && (
        <input
          type="number"
          min="1"
          className={styles.countInput}
          value={count}
          onChange={(e) => onCount(Math.max(1, parseInt(e.target.value) || 1))}
          aria-label={ariaLabel}
        />
      )}
    </div>
  )
}
