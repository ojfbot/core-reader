import { Search, Tag, InlineLoading, InlineNotification } from '@carbon/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setFilter } from '../store/slices/commandsSlice'
import { CommandCard } from './CommandCard'
import './CommandsTab.css'

const TIERS = [1, 2, 3]
const PHASES = ['Planning', 'Kick-off', 'Debugging', 'Quality gate', 'Release', 'Post-ship', 'Continuous', 'Daily/weekly']

export default function CommandsTab() {
  const dispatch = useAppDispatch()
  const { items, status, error, filter } = useAppSelector(state => state.commands)

  const filtered = items.filter(cmd => {
    if (filter.tier !== null && cmd.tier !== filter.tier) return false
    if (filter.phase && !cmd.phase?.toLowerCase().includes(filter.phase.toLowerCase())) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      if (!cmd.name.includes(q) && !cmd.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="commands-tab">
      <div className="commands-tab__filters">
        <Search
          id="commands-search"
          labelText="Search commands"
          placeholder="Search by name or description…"
          size="sm"
          value={filter.search}
          onChange={e => dispatch(setFilter({ search: e.target.value }))}
        />
        <div className="commands-tab__tier-filters">
          <span className="commands-tab__filter-label">Tier</span>
          {TIERS.map(t => (
            <button
              key={t}
              className={['tier-btn', filter.tier === t ? 'active' : ''].filter(Boolean).join(' ')}
              onClick={() => dispatch(setFilter({ tier: filter.tier === t ? null : t }))}
              aria-pressed={filter.tier === t}
            >
              <Tag type={t === 1 ? 'outline' : t === 2 ? 'purple' : 'magenta'} size="sm">
                Tier {t}
              </Tag>
            </button>
          ))}
        </div>
      </div>

      <div className="commands-tab__results-meta">
        {status === 'succeeded' && (
          <span className="commands-tab__count">
            {filtered.length} of {items.length} commands
          </span>
        )}
      </div>

      {status === 'loading' && (
        <div className="commands-tab__loading">
          <InlineLoading description="Loading commands…" />
        </div>
      )}

      {status === 'failed' && (
        <InlineNotification
          kind="error"
          title="Failed to load commands"
          subtitle={error ?? undefined}
          lowContrast
        />
      )}

      {status === 'succeeded' && filtered.length === 0 && (
        <p className="commands-tab__empty">No commands match the current filters.</p>
      )}

      {status === 'succeeded' && (
        <div className="commands-tab__list">
          {filtered.map(cmd => (
            <CommandCard key={cmd.name} command={cmd} />
          ))}
        </div>
      )}
    </div>
  )
}
