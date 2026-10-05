export const STAGES = [
  { key: 'contact',   label: 'Contact',   hint: 'First touchpoint made' },
  { key: 'meeting',   label: 'Meeting',   hint: 'Meeting booked or held' },
  { key: 'signed_up', label: 'Signed up', hint: 'Agreed and onboarding' },
  { key: 'active',    label: 'Active',    hint: 'Live on Myelino' },
]

export const MEETING_MODES = [
  { key: 'in_person', label: 'In person' },
  { key: 'online',    label: 'Online' },
]

// "Tags" — the next call to action on a lead. Tone groups them by colour:
// chase = waiting on a reply, meet = get or prep a meeting,
// close = move to signing, care = onboarding and live accounts.
export const NEXT_ACTIONS = [
  { key: 'dm_again',         label: 'DM again',         tone: 'chase' },
  { key: 'double_text',      label: 'Double text',      tone: 'chase' },
  { key: 'triple_text',      label: 'Triple text',      tone: 'chase' },
  { key: 'email_again',      label: 'Email again',      tone: 'chase' },
  { key: 'call_again',       label: 'Call again',       tone: 'chase' },
  { key: 'visit_in_person',  label: 'Visit in person',  tone: 'chase' },
  { key: 'schedule_meeting', label: 'Schedule meeting', tone: 'meet' },
  { key: 'follow_up',        label: 'Follow up',        tone: 'meet' },
  { key: 'meet_again',       label: 'Meet again',       tone: 'meet' },
  { key: 'confirm_meeting',  label: 'Confirm meeting',  tone: 'meet' },
  { key: 'send_deck',        label: 'Send deck / info', tone: 'meet' },
  { key: 'send_proposal',    label: 'Send proposal',    tone: 'close' },
  { key: 'send_contract',    label: 'Send contract',    tone: 'close' },
  { key: 'get_signature',    label: 'Get signature',    tone: 'close' },
  { key: 'onboard',          label: 'Onboard / set up', tone: 'care' },
  { key: 'collect_menu',     label: 'Collect menu & photos', tone: 'care' },
  { key: 'check_in',         label: 'Check in',         tone: 'care' },
]

const ACTIONS_BY_KEY = Object.fromEntries(NEXT_ACTIONS.map((a) => [a.key, a]))

export function getAction(key) {
  if (!key) return null
  return ACTIONS_BY_KEY[key] ?? { key, label: key, tone: 'chase' }
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// dateStr is a Postgres `date` (YYYY-MM-DD), read as a local calendar day
export function dueInfo(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const days = Math.round((due - startOfToday()) / 86400000)

  if (days < 0) return { state: 'overdue', label: `${-days}d overdue` }
  if (days === 0) return { state: 'today', label: 'Today' }
  if (days === 1) return { state: 'soon', label: 'Tomorrow' }
  return {
    state: 'later',
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
}

// Leads that have an open next action, most urgent first (undated last)
export function getPriorities(leads) {
  return leads
    .filter((l) => l.nextAction)
    .sort((a, b) => {
      if (a.nextActionDue && b.nextActionDue) return a.nextActionDue.localeCompare(b.nextActionDue)
      if (a.nextActionDue) return -1
      if (b.nextActionDue) return 1
      return a.createdAt.localeCompare(b.createdAt)
    })
}

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
