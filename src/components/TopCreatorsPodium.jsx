import React from 'react'
import { getMemberPhoto } from '../utils/memberPhotos'
import styles from './TopCreatorsPodium.module.css'

function fmt(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function fmtAED(n) {
  return `AED ${Number(n).toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function CreatorCard({ slot, member, isFirst }) {
  if (!member) return null

  const photo = getMemberPhoto(member.id)
  const rankMedal = slot.rank === 1 ? '🥇' : slot.rank === 2 ? '🥈' : '🥉'
  const rankClass = slot.rank === 1 ? styles.cardGold : slot.rank === 2 ? styles.cardSilver : styles.cardBronze

  return (
    <div className={`${styles.card} ${rankClass} ${isFirst ? styles.cardFirst : ''}`}>
      <div className={styles.medal}>{rankMedal}</div>

      <div className={styles.avatarWrap}>
        {photo
          ? <img src={photo} alt={member.fullName} className={styles.avatar} />
          : <div className={styles.avatarInitial}>{member.fullName.charAt(0).toUpperCase()}</div>
        }
      </div>

      <p className={styles.name}>{member.fullName}</p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <span className={styles.statVal}>{fmt(slot.views)}</span>
          <span className={styles.statLabel}>views</span>
        </div>
        <div className={styles.stat}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className={styles.statVal}>{fmt(slot.downloads)}</span>
          <span className={styles.statLabel}>downloads</span>
        </div>
        <div className={`${styles.stat} ${styles.statPayout}`}>
          <span className={styles.statVal}>{fmtAED(slot.payout)}</span>
          <span className={styles.statLabel}>payout</span>
        </div>
      </div>
    </div>
  )
}

export default function TopCreatorsPodium({ topCreators, members }) {
  // Render order on podium: 2nd, 1st (center+elevated), 3rd
  const byRank = {}
  topCreators.forEach((s) => { byRank[s.rank] = s })

  const hasAny = topCreators.some((s) => s.member_id)
  if (!hasAny) return null

  const findMember = (slot) => slot?.member_id ? members.find((m) => m.id === slot.member_id) : null

  const podiumOrder = [byRank[2], byRank[1], byRank[3]]

  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#f59e0b' }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>Top Creators of the Week</span>
      </div>

      <div className={styles.podium}>
        {podiumOrder.map((slot) => {
          if (!slot) return null
          const member = findMember(slot)
          return (
            <CreatorCard
              key={slot.rank}
              slot={slot}
              member={member}
              isFirst={slot.rank === 1}
            />
          )
        })}
      </div>
    </div>
  )
}
