import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Heading, Tabs, TabList, Tab, TabPanels, TabPanel, Tooltip } from '@carbon/react'
import { Menu, Close } from '@carbon/icons-react'
import { store } from '../store'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveTab } from '../store/slices/navigationSlice'
import { fetchCommands } from '../store/slices/commandsSlice'
import { fetchADRs } from '../store/slices/adrsSlice'
import { fetchRoadmap } from '../store/slices/roadmapSlice'
import { fetchOKRs } from '../store/slices/okrsSlice'
import { fetchDocs } from '../store/slices/docsSlice'
import { fetchEvents } from '../store/slices/eventsSlice'
import CommandsTab from './CommandsTab'
import ADRsTab from './ADRsTab'
import RoadmapTab from './RoadmapTab'
import OKRsTab from './OKRsTab'
import DocsTab from './DocsTab'
import ChangesTab from './ChangesTab'
import EventsTab from './EventsTab'
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
  /** True when mounted inside the Frame shell host. Activates the flex height
   *  chain so tab content fills the shell frame. Title is always visible
   *  (unlike cv-builder, CoreReader has no shell-level breadcrumb for its name). */
  shellMode?: boolean
}

const TABS = ['commands', 'adrs', 'roadmap', 'okrs', 'docs', 'changes', 'events'] as const

function DashboardContent({ shellMode }: DashboardProps) {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector(state => state.navigation.activeTab)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchCommands())
    dispatch(fetchADRs())
    dispatch(fetchRoadmap())
    dispatch(fetchOKRs())
    dispatch(fetchDocs())
    dispatch(fetchEvents())
  }, [dispatch])

  const tabIndex = TABS.indexOf(activeTab)

  return (
    <>
      {/* Context panel — position:fixed, overlays full viewport.
          Rendered before dashboard-wrapper (same pattern as cv-builder ThreadSidebar). */}
      <ThreadSidebar isExpanded={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      <div
        className={[
          'dashboard-wrapper',
          shellMode ? 'shell-mode' : '',
          sidebarOpen ? 'with-sidebar' : '',
        ].filter(Boolean).join(' ')}
        data-element="app-container"
      >
        <div className="dashboard-header">
          <Heading className="page-header">Core Reader Dashboard</Heading>

          <Tooltip align="bottom-right" label={sidebarOpen ? 'Close threads' : 'Show threads'}>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label="Toggle thread sidebar"
            >
              {sidebarOpen ? <Close size={20} /> : <Menu size={20} />}
            </button>
          </Tooltip>
        </div>

        <Tabs
          selectedIndex={tabIndex >= 0 ? tabIndex : 0}
          onChange={({ selectedIndex }) => dispatch(setActiveTab(TABS[selectedIndex]))}
        >
          <TabList contained>
            <Tab>Commands</Tab>
            <Tab>ADRs</Tab>
            <Tab>Roadmap</Tab>
            <Tab>OKRs</Tab>
            <Tab>Docs</Tab>
            <Tab>Changes</Tab>
            <Tab>Activity</Tab>
          </TabList>
          <TabPanels>
            <TabPanel><CommandsTab /></TabPanel>
            <TabPanel><ADRsTab /></TabPanel>
            <TabPanel><RoadmapTab /></TabPanel>
            <TabPanel><OKRsTab /></TabPanel>
            <TabPanel><DocsTab /></TabPanel>
            <TabPanel><ChangesTab /></TabPanel>
            <TabPanel><EventsTab /></TabPanel>
          </TabPanels>
        </Tabs>
      </div>

      {/* CondensedChat: outside dashboard-wrapper, sidebar-aware positioning */}
      <CondensedChat sidebarExpanded={sidebarOpen} />
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
