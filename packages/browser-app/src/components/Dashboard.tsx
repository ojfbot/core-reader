import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { Heading, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react'
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

  // Fetch all data on mount
  useEffect(() => {
    dispatch(fetchCommands())
    dispatch(fetchADRs())
    dispatch(fetchRoadmap())
  }, [dispatch])

  const tabIndex = TABS.indexOf(activeTab)

  return (
    <div
      className={[
        'dashboard-wrapper',
        shellMode ? 'shell-mode' : '',
        'chat-visible',          // CondensedChat always takes bottom space in Phase 1
      ].filter(Boolean).join(' ')}
      data-element="app-container"
    >
      <div className="dashboard-header">
        {/* Suppress app title in shell — shell header already shows app name */}
        {!shellMode && <Heading className="page-header">CoreReader</Heading>}
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

      {/* CondensedChat: visible but disabled in Phase 1. Wired in Phase 4. */}
      <CondensedChat />
    </div>
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
