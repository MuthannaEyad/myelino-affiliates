import React from 'react'
import Header from '../components/Header'
import Toast from '../components/Toast'
import { navigate } from '../lib/router'
import { useCrm } from './hooks/useCrm'
import RepGrid from './components/RepGrid'
import RepPage from './components/RepPage'
import styles from '../App.module.css'

export default function CrmApp({ path }) {
  const crm = useCrm()
  const repId = path.match(/^\/crm\/([^/]+)/)?.[1] ?? null
  const rep = repId ? crm.reps.find((r) => r.id === repId) : null

  let content
  if (crm.loading) {
    content = <div className={styles.loadingMsg}>Loading CRM…</div>
  } else if (repId && !rep) {
    content = <div className={styles.loadingMsg}>This salesperson doesn't exist anymore.</div>
  } else if (rep) {
    content = (
      <RepPage
        rep={rep}
        leads={crm.leads.filter((l) => l.repId === rep.id)}
        addLead={crm.addLead}
        updateLead={crm.updateLead}
        removeLead={crm.removeLead}
        removeRep={crm.removeRep}
      />
    )
  } else {
    content = <RepGrid reps={crm.reps} leads={crm.leads} addRep={crm.addRep} />
  }

  return (
    <div className={styles.app}>
      <Header subtitle="Sales CRM" onLogoClick={() => navigate(repId ? '/crm' : '/')} showSwitch />
      <main className={styles.main}>
        <div className={styles.container} style={rep ? { maxWidth: 1600 } : undefined}>{content}</div>
      </main>
      <Toast message={crm.error} onDismiss={crm.clearError} />
    </div>
  )
}
