import React, { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import MembersModal from './components/MembersModal'
import DailyTable from './components/DailyTable'
import DailySummary from './components/DailySummary'
import StatsBar from './components/StatsBar'
import DateNav from './components/DateNav'
import Toast from './components/Toast'
import AnnouncementBanner from './components/AnnouncementBanner'
import OrgChart from './components/OrgChart'
import ProfilePhotoCard from './components/ProfilePhotoCard'
import BudgetBar from './components/BudgetBar'
import DownloadsTracker from './components/DownloadsTracker'
import TopCreatorsEditor from './components/TopCreatorsEditor'
import TopCreatorsPodium from './components/TopCreatorsPodium'
import { useMembers } from './hooks/useMembers'
import { useTopCreators } from './hooks/useTopCreators'
import { useDailyTracking } from './hooks/useDailyTracking'
import styles from './App.module.css'

export default function App() {
  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // 'affiliate' = name-search mode, 'executive' = full access
  const [viewMode, setViewMode] = useState('affiliate')
  const [affiliateMember, setAffiliateMember] = useState(null)

  // Executive unlock password modal
  const [execPwOpen, setExecPwOpen] = useState(false)
  const [execPwInput, setExecPwInput] = useState('')
  const [execPwError, setExecPwError] = useState(null)
  const execPwInputRef = useRef(null)

  const { topCreators, saveAll } = useTopCreators()

  const {
    members,
    loading: membersLoading,
    error: membersError,
    clearError: clearMembersError,
    addMember,
    assignMember,
    updateDownloads,
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

  // Executive password modal handlers
  useEffect(() => {
    if (execPwOpen) setTimeout(() => execPwInputRef.current?.focus(), 50)
  }, [execPwOpen])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeExecPwModal()
    }
    if (execPwOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [execPwOpen])

  function openExecPwModal() {
    setExecPwInput('')
    setExecPwError(null)
    setExecPwOpen(true)
  }

  function closeExecPwModal() {
    setExecPwOpen(false)
    setExecPwInput('')
    setExecPwError(null)
  }

  function handleExecUnlock() {
    if (execPwInput === import.meta.env.VITE_SUMMARY_PASSWORD) {
      setViewMode('executive')
      closeExecPwModal()
    } else {
      setExecPwError('Incorrect password. Access denied.')
    }
  }

  function goHome() {
    setViewMode('affiliate')
    setAffiliateMember(null)
  }

  const error = membersError || trackingError
  function clearError() {
    clearMembersError()
    clearTrackingError()
  }

  const isExecutive = viewMode === 'executive'
  const showMemberSearch = !isExecutive && affiliateMember === null
  const membersToShow = isExecutive ? members : affiliateMember ? [affiliateMember] : []

  return (
    <div className={styles.app}>
      <Header onLogoClick={!showMemberSearch ? goHome : undefined} />
      <AnnouncementBanner />

      <main className={styles.main}>
        <div className={styles.container}>

          {showMemberSearch ? (
            <>
              <TopCreatorsPodium topCreators={topCreators} members={members} />
              <BudgetBar isExecutive={false} />
              <OrgChart
                members={members}
                loading={membersLoading}
                onSelect={setAffiliateMember}
                onExecClick={openExecPwModal}
                addMember={addMember}
                assignMember={assignMember}
              />
            </>
          ) : (
            <>
              <div className={styles.topRow}>
                <div>
                  <h1 className={styles.pageTitle}>Daily Affiliate Tracking</h1>
                  {isExecutive ? (
                    <p className={styles.pageSubtitle}>
                      Track which members posted on Myelino, Instagram, or TikTok each day.
                    </p>
                  ) : (
                    <p className={styles.pageSubtitle}>
                      Viewing as <strong>{affiliateMember?.fullName}</strong>
                      <button
                        className={styles.changeNameBtn}
                        onClick={() => setAffiliateMember(null)}
                      >
                        Not you?
                      </button>
                    </p>
                  )}
                </div>

                {isExecutive ? (
                  <div className={styles.execActions}>
                    <button className={styles.backBtn} onClick={goHome}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Back to main
                    </button>
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
                ) : (
                  <button className={styles.execViewBtn} onClick={openExecPwModal}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Executive View
                  </button>
                )}
              </div>

              {isExecutive && <BudgetBar isExecutive />}

              {isExecutive && (
                <TopCreatorsEditor
                  topCreators={topCreators}
                  members={members}
                  onSave={saveAll}
                />
              )}

              {isExecutive && (
                <DownloadsTracker members={members} onSave={updateDownloads} />
              )}

              {isExecutive && <StatsBar members={members} tracking={tracking} />}

              {!isExecutive && affiliateMember && (
                <div className={styles.downloadsStat}>
                  <div className={styles.downloadsIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                  <div>
                    <p className={styles.downloadsNum}>
                      {(members.find(m => m.id === affiliateMember.id) ?? affiliateMember).downloads.toLocaleString()}
                    </p>
                    <p className={styles.downloadsLabel}>Total Downloads</p>
                  </div>
                </div>
              )}

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
                  members={membersToShow}
                  tracking={tracking}
                  onUpdate={updateTracking}
                  onDelete={isExecutive ? removeMember : undefined}
                />
              )}

              {!isExecutive && affiliateMember && (
                <ProfilePhotoCard member={affiliateMember} />
              )}

              {isExecutive && (
                <DailySummary
                  members={members}
                  tracking={tracking}
                  selectedDate={selectedDate}
                />
              )}
            </>
          )}

        </div>
      </main>

      {isExecutive && (
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
      )}

      <Toast message={error} onDismiss={clearError} />

      {execPwOpen && (
        <div
          className={styles.pwOverlay}
          onClick={(e) => e.target === e.currentTarget && closeExecPwModal()}
        >
          <div className={styles.pwDialog} role="dialog" aria-modal="true" aria-labelledby="exec-pw-title">
            <div className={styles.pwIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 id="exec-pw-title" className={styles.pwTitle}>Executive View</h3>
            <p className={styles.pwSubtitle}>
              Enter the executive password to access the full dashboard.
            </p>
            <input
              ref={execPwInputRef}
              type="password"
              className={styles.pwInput}
              placeholder="Password"
              value={execPwInput}
              onChange={(e) => { setExecPwInput(e.target.value); setExecPwError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleExecUnlock()}
              autoComplete="off"
            />
            {execPwError && <p className={styles.pwError}>{execPwError}</p>}
            <div className={styles.pwActions}>
              <button className={styles.pwCancelBtn} onClick={closeExecPwModal}>Cancel</button>
              <button className={styles.pwConfirmBtn} onClick={handleExecUnlock}>Unlock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
