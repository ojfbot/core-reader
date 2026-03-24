import { Search, Tag, InlineLoading, InlineNotification } from '@carbon/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setFilter } from '../store/slices/skillsSlice'
import { SkillCard } from './SkillCard'
import './SkillsTab.css'

const TIERS = [1, 2, 3]

export default function SkillsTab() {
  const dispatch = useAppDispatch()
  const { items, status, error, filter } = useAppSelector(state => state.skills)

  const filtered = items.filter(skill => {
    if (filter.tier !== null && skill.tier !== filter.tier) return false
    if (filter.phase && !skill.phase?.toLowerCase().includes(filter.phase.toLowerCase())) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      if (!skill.name.includes(q) && !skill.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="skills-tab">
      <div className="skills-tab__filters">
        <Search
          id="skills-search"
          labelText="Search skills"
          placeholder="Search by name or description…"
          size="sm"
          value={filter.search}
          onChange={e => dispatch(setFilter({ search: e.target.value }))}
        />
        <div className="skills-tab__tier-filters">
          <span className="skills-tab__filter-label">Tier</span>
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

      <div className="skills-tab__results-meta">
        {status === 'succeeded' && (
          <span className="skills-tab__count">
            {filtered.length} of {items.length} skills
          </span>
        )}
      </div>

      {status === 'loading' && (
        <div className="skills-tab__loading">
          <InlineLoading description="Loading skills…" />
        </div>
      )}

      {status === 'failed' && (
        <InlineNotification
          kind="error"
          title="Failed to load skills"
          subtitle={error ?? undefined}
          lowContrast
        />
      )}

      {status === 'succeeded' && filtered.length === 0 && (
        <p className="skills-tab__empty">No skills match the current filters.</p>
      )}

      {status === 'succeeded' && (
        <div className="skills-tab__list">
          {filtered.map(skill => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      )}
    </div>
  )
}
