import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Heading, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react'
import { DashboardLayout, ErrorBoundary, SidebarToggle } from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/dashboard-layout'
import { store } from '../store'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setActiveTab } from '../store/slices/navigationSlice'
import { fetchSkills } from '../store/slices/skillsSlice'
import { fetchADRs } from '../store/slices/adrsSlice'
import { fetchRoadmap } from '../store/slices/roadmapSlice'
import { fetchOKRs } from '../store/slices/okrsSlice'
import { fetchDocs } from '../store/slices/docsSlice'
import { fetchEvents } from '../store/slices/eventsSlice'
import SkillsTab from './SkillsTab'
import ADRsTab from './ADRsTab'
import RoadmapTab from './RoadmapTab'
import OKRsTab from './OKRsTab'
import DocsTab from './DocsTab'
import ChangesTab from './ChangesTab'
import EventsTab from './EventsTab'
import CondensedChat from './CondensedChat'
import ThreadSidebarConnected from './ThreadSidebarConnected'
import '../styles/carbon.scss'
import '../styles/tokens.css'

interface DashboardProps {
  shellMode?: boolean
}

const TABS = ['skills', 'adrs', 'roadmap', 'okrs', 'docs', 'changes', 'events'] as const

function DashboardContent({ shellMode }: DashboardProps) {
  const dispatch = useAppDispatch()
  const activeTab = useAppSelector(state => state.navigation.activeTab)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchSkills())
    dispatch(fetchADRs())
    dispatch(fetchRoadmap())
    dispatch(fetchOKRs())
    dispatch(fetchDocs())
    dispatch(fetchEvents())
  }, [dispatch])

  const tabIndex = TABS.indexOf(activeTab)

  return (
    <>
      <ThreadSidebarConnected isExpanded={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />

      <DashboardLayout
        shellMode={shellMode}
        sidebarExpanded={sidebarOpen}
      >
        <DashboardLayout.Header>
          <Heading className="page-header">Core Reader Dashboard</Heading>

          <SidebarToggle isExpanded={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
        </DashboardLayout.Header>

        <Tabs
          selectedIndex={tabIndex >= 0 ? tabIndex : 0}
          onChange={({ selectedIndex }) => dispatch(setActiveTab(TABS[selectedIndex]))}
        >
          <TabList contained>
            <Tab>Skills</Tab>
            <Tab>ADRs</Tab>
            <Tab>Roadmap</Tab>
            <Tab>OKRs</Tab>
            <Tab>Docs</Tab>
            <Tab>Changes</Tab>
            <Tab>Activity</Tab>
          </TabList>
          <TabPanels>
            <TabPanel><SkillsTab /></TabPanel>
            <TabPanel><ADRsTab /></TabPanel>
            <TabPanel><RoadmapTab /></TabPanel>
            <TabPanel><OKRsTab /></TabPanel>
            <TabPanel><DocsTab /></TabPanel>
            <TabPanel><ChangesTab /></TabPanel>
            <TabPanel><EventsTab /></TabPanel>
          </TabPanels>
        </Tabs>
      </DashboardLayout>

      <CondensedChat sidebarExpanded={sidebarOpen} />
    </>
  )
}

function Dashboard({ shellMode }: DashboardProps) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <DashboardContent shellMode={shellMode} />
      </ErrorBoundary>
    </Provider>
  )
}

export default Dashboard
