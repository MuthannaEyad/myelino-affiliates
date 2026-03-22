import React, { useState } from 'react'
import Header from './components/Header'
import MembersModal from './components/MembersModal'
import DailyTable from './components/DailyTable'
import StatsBar from './components/StatsBar'
import DateNav from './components/DateNav'
import Toast from './components/Toast'
import AnnouncementBanner from './components/AnnouncementBanner'
import { useMembers } from './hooks/useMembers'
import { useDailyTracking } from './hooks/useDailyTracking'
import styles from './App.module.css'

export default function App() {
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const {
    members,
    loading: membersLoading,
    error: membersError,
    clearError: clearMembersError,
    addMember,
    removeMember,
  } = useMembers()

  const {
    tracking,
    error: trackingError,
    clearError: clearTrackingError,
    updateTracking,
  } = useDailyTracking(selectedDate)

  function prevDay() {
    setSelectedDate((d) => {
      const nd = new Date(d)
      nd.setDate(nd.getDate() - 1)
      return nd
    })
  }

  function nextDay() {
    setSelectedDate((d) => {
      const nd = new Date(d)
      nd.setDate(nd.getDate() + 1)
      return nd
    })
  }

  const error = membersError || trackingError
  function clearError() {
    clearMembersError()
    clearTrackingError()
  }

  return (
    <div className={styles.app}>
      <Header />
      <AnnouncementBanner />

      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.topRow}>
            <div>
              <h1 className={styles.pageTitle}>Daily Affiliate Tracking</h1>
              <p className={styles.pageSubtitle}>
                Track which members posted on Myelino, Instagram, or TikTok each day.
              </p>
            </div>
            <button
              className={styles.addMemberBtn}
              onClick={() => setIsMembersOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Add new member
            </button>
          </div>

          <StatsBar members={members} tracking={tracking} />

          <div className={styles.tableControls}>
            <DateNav
              selectedDate={selectedDate}
              onPrev={prevDay}
              onNext={nextDay}
            />
          </div>

          {membersLoading ? (
            <div className={styles.loadingMsg}>Loading members…</div>
          ) : (
            <DailyTable
              members={members}
              tracking={tracking}
              onUpdate={updateTracking}
            />
          )}
        </div>
      </main>

      <MembersModal
        isOpen={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        members={members}
        loading={membersLoading}
        error={membersError}
        clearError={clearMembersError}
        addMember={addMember}
        removeMember={removeMember}
      />

      <Toast message={error} onDismiss={clearError} />
    </div>
  )
}
