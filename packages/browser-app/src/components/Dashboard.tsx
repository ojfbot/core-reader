import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Heading, Tabs, TabList, Tab, TabPanels, TabPanel, IconButton } from '@carbon/react'
import { Switcher } from '@carbon/icons-react'
import { store } from '../store'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveTab } from '../store/slices/navigationSlice'
import { fetchCommands } from '../store/slices/commandsSlice'
import { fetchADRs } from '../store/slices/adrsSlice'
import { fetchRoadmap } from '../store/slices/roadmapSlice'
import CommandsTab from './CommandsTab'
import ADRsTab from './ADRsTab'
import RoadmapTab from './RoadmapTab'
import CondensedChat from './CondensedChat'
import ThreadSidebar from './ThreadSidebar'
// Styles must be imported here, not only in main.tsx.
// cssInjectedByJs targets __federation_expose_Dashboard — it only injects CSS
// that lives in Dashboard's module graph. Imports in main.tsx land in the entry
// chunk and are never seen by the shell when it loads this remote module.
import '../styles/carbon.scss'
import '../styles/tokens.css'
import './Dashboard.css'

interface DashboardProps {
  /** True when mounted inside the Frame shell host. Suppresses the internal
   *  app title heading and activates the flex height chain so tab content
   *  fills the shell frame. Does not remove chat or navigation controls. */
  shellMode?: boolean
}

const TABS = ['commands', 'adrs', 'roadmap'] as const

function DashboardContent({ shellMode }: DashboardProps) {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector(state => state.navigation.activeTab)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchCommands())
    dispatch(fetchADRs())
    dispatch(fetchRoadmap())
  }, [dispatch])

  const tabIndex = TABS.indexOf(activeTab)

  return (
    <>
      {/* Context panel — position:fixed, overlays full viewport.
          Rendered before dashboard-wrapper (same pattern as cv-builder ThreadSidebar). */}
      <ThreadSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={[
          'dashboard-wrapper',
          shellMode ? 'shell-mode' : '',
          sidebarOpen ? 'sidebar-open' : '',
        ].filter(Boolean).join(' ')}
        data-element="app-container"
      >
        <div className="dashboard-header">
          {/* Suppress app title in shell — shell header already shows app name */}
          {!shellMode && <Heading className="page-header">CoreReader</Heading>}

          {/* Context panel toggle — always visible */}
          <IconButton
            className="dashboard-sidebar-toggle"
            label={sidebarOpen ? 'Close context panel' : 'Open context panel'}
            kind="ghost"
            size="sm"
            align="bottom-right"
            onClick={() => setSidebarOpen(o => !o)}
          >
            <Switcher size={16} />
          </IconButton>
        </div>

        <Tabs
          selectedIndex={tabIndex >= 0 ? tabIndex : 0}
          onChange={({ selectedIndex }) => dispatch(setActiveTab(TABS[selectedIndex]))}
        >
          <TabList contained>
            <Tab>Commands</Tab>
            <Tab>ADRs</Tab>
            <Tab>Roadmap</Tab>
          </TabList>
          <TabPanels>
            <TabPanel><CommandsTab /></TabPanel>
            <TabPanel><ADRsTab /></TabPanel>
            <TabPanel><RoadmapTab /></TabPanel>
          </TabPanels>
        </Tabs>
      </div>

      {/* CondensedChat: outside dashboard-wrapper (same pattern as cv-builder).
          Visible but disabled in Phase 1. Wired in Phase 4. */}
      <CondensedChat />
    </>
  )
}

// MF export — self-contained with its own Redux Provider.
// The shell mounts Dashboard under the shell's Provider (no CoreReader slices).
// Without the inner Provider every useAppSelector call reads undefined.
// Standalone App.tsx also wraps with the same store singleton — harmless double-wrap.
function Dashboard({ shellMode }: DashboardProps) {
  return (
    <Provider store={store}>
      <DashboardContent shellMode={shellMode} />
    </Provider>
  )
}

export default Dashboard
