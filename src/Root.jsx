import React from 'react'
import { useHashPath } from './lib/router'
import Landing from './Landing'
import App from './App'
import CrmApp from './crm/CrmApp'

export default function Root() {
  const path = useHashPath()

  if (path.startsWith('/affiliates')) return <App />
  if (path.startsWith('/crm')) return <CrmApp path={path} />
  return <Landing />
}
