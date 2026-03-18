import { useEffect, useCallback } from 'react'
import { InlineLoading, InlineNotification, Tag, ContentSwitcher, Switch } from '@carbon/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchEvents, setTypeFilter, type EventEntry } from '../store/slices/eventsSlice'
import './EventsTab.css'

// Event type → display category
const EVENT_CATEGORY: Record<string, { label: string; kind: 'blue' | 'green' | 'purple' | 'teal' | 'warm-gray' | 'red' }> = {
  'bead:created':  { label: 'bead', kind: 'blue' },
  'bead:updated':  { label: 'bead', kind: 'blue' },
  'bead:closed':   { label: 'bead', kind: 'warm-gray' },
  'bead:archived': { label: 'bead', kind: 'warm-gray' },
  'hook:assigned': { label: 'hook', kind: 'purple' },
  'hook:cleared':  { label: 'hook', kind: 'purple' },
  'hook:nudge':    { label: 'hook', kind: 'purple' },
  'mail:sent':     { label: 'mail', kind: 'teal' },
  'mail:read':     { label: 'mail', kind: 'teal' },
  'molecule:started':    { label: 'molecule', kind: 'green' },
  'molecule:step_done':  { label: 'molecule', kind: 'green' },
  'molecule:completed':  { label: 'molecule', kind: 'green' },
  'agent:started':  { label: 'agent', kind: 'green' },
  'agent:idle':     { label: 'agent', kind: 'warm-gray' },
  'agent:suspended':{ label: 'agent', kind: 'warm-gray' },
  'agent:error':    { label: 'agent', kind: 'red' },
  'agent:handoff':  { label: 'agent', kind: 'teal' },
  'agent:budget_warning':    { label: 'budget', kind: 'warm-gray' },
  'agent:budget_exhausted':  { label: 'budget', kind: 'red' },
  'agent:awaiting_approval': { label: 'approval', kind: 'purple' },
  'convoy:created':  { label: 'convoy', kind: 'teal' },
  'convoy:updated':  { label: 'convoy', kind: 'teal' },
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(iso).toLocaleDateString()
}

function EventRow({ event }: { event: EventEntry }) {
  const cat = EVENT_CATEGORY[event.type] ?? { label: event.type.split(':')[0], kind: 'warm-gray' as const }
  const action = event.type.split(':')[1] ?? ''
  return (
    <div className="events-tab__row">
      <div className="events-tab__row-left">
        <Tag size="sm" type={cat.kind} className="events-tab__type-tag">{cat.label}</Tag>
        <span className="events-tab__action">{action}</span>
        <span className="events-tab__summary">{event.summary}</span>
      </div>
      <div className="events-tab__row-right">
        <span className="events-tab__app">{event.app}</span>
        <span className="events-tab__time" title={event.timestamp}>{relativeTime(event.timestamp)}</span>
      </div>
    </div>
  )
}

const FILTER_VIEWS = [
  { key: null,       label: 'All' },
  { key: 'bead:',    label: 'Beads' },
  { key: 'agent:',   label: 'Agents' },
  { key: 'hook:',    label: 'Hooks' },
  { key: 'molecule:', label: 'Molecules' },
  { key: 'convoy:',  label: 'Convoys' },
] as const

export default function EventsTab() {
  const dispatch = useAppDispatch()
  const { items, status, error, typeFilter } = useAppSelector(s => s.events)

  const load = useCallback(() => { dispatch(fetchEvents()) }, [dispatch])

  useEffect(() => {
    load()
    const interval = setInterval(load, 10_000)
    return () => clearInterval(interval)
  }, [load])

  const lensIndex = FILTER_VIEWS.findIndex(v => v.key === typeFilter)

  function handleFilterChange({ name }: { index?: number; name?: string | number; text?: string; key?: string | number }) {
    dispatch(setTypeFilter(name === 'null' || name == null ? null : name))
    setTimeout(() => dispatch(fetchEvents()), 0)
  }

  const filtered = typeFilter
    ? items.filter(e => e.type.startsWith(typeFilter))
    : items

  return (
    <div className="events-tab">
      <div className="events-tab__toolbar">
        <ContentSwitcher
          size="sm"
          selectedIndex={lensIndex >= 0 ? lensIndex : 0}
          onChange={handleFilterChange}
        >
          {FILTER_VIEWS.map(v => (
            <Switch key={String(v.key)} name={String(v.key)} text={v.label} />
          ))}
        </ContentSwitcher>
        <div className="events-tab__toolbar-right">
          {status === 'loading' && <InlineLoading />}
          {status === 'succeeded' && (
            <span className="events-tab__count">{filtered.length} events</span>
          )}
          <button className="events-tab__refresh-btn" onClick={load} title="Refresh">&#x21BB;</button>
        </div>
      </div>

      {status === 'failed' && (
        <InlineNotification
          kind="error"
          title="Failed to load events"
          subtitle={error ?? undefined}
          lowContrast
        />
      )}

      {status === 'succeeded' && filtered.length === 0 && (
        <div className="events-tab__empty">
          <p>No events yet — events are emitted when beads are created, hooks assigned, agents started, etc.</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="events-tab__list">
          {filtered.map(e => <EventRow key={e.id} event={e} />)}
        </div>
      )}
    </div>
  )
}
