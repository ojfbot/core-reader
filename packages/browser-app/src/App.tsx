import { Theme } from '@carbon/react'
import Dashboard from './components/Dashboard'

// Standalone entry — wraps Dashboard in the g100 dark theme for local dev/QA.
// When loaded as an MF remote, Dashboard.tsx is mounted directly by the shell
// (which provides its own Theme wrapper).
export default function App() {
  return (
    <Theme theme="g100">
      <Dashboard />
    </Theme>
  )
}
