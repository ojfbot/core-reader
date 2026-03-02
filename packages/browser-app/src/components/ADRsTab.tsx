import { ContentSwitcher, Switch, InlineLoading, InlineNotification } from '@carbon/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setLensView, ADRLensView } from '../store/slices/adrsSlice'
import { ADRCard } from './ADRCard'
import './ADRsTab.css'

const LENS_VIEWS: { key: ADRLensView; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'by-status', label: 'By Status' },
  { key: 'by-repo', label: 'By Repo' },
]

const STATUS_ORDER = ['Accepted', 'Proposed', 'Superseded']

export default function ADRsTab() {
  const dispatch = useAppDispatch()
  const { items, status, error, lensView } = useAppSelector(state => state.adrs)

  const lensIndex = LENS_VIEWS.findIndex(v => v.key === lensView)

  const renderAll = () => (
    <div className="adrs-tab__list">
      {items.map(adr => <ADRCard key={adr.number} adr={adr} />)}
    </div>
  )

  const renderByStatus = () => (
    <div>
      {STATUS_ORDER.map(s => {
        const group = items.filter(a => a.status === s)
        if (!group.length) return null
        return (
          <div key={s} className="adrs-tab__group">
            <h3 className="adrs-tab__group-heading">{s} <span>({group.length})</span></h3>
            {group.map(adr => <ADRCard key={adr.number} adr={adr} />)}
          </div>
        )
      })}
    </div>
  )

  const renderByRepo = () => {
    // Collect unique repos
    const repoMap = new Map<string, typeof items>()
    for (const adr of items) {
      for (const repo of adr.reposAffected) {
        if (!repoMap.has(repo)) repoMap.set(repo, [])
        repoMap.get(repo)!.push(adr)
      }
      if (adr.reposAffected.length === 0) {
        if (!repoMap.has('(unspecified)')) repoMap.set('(unspecified)', [])
        repoMap.get('(unspecified)')!.push(adr)
      }
    }
    const repos = Array.from(repoMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    return (
      <div>
        {repos.map(([repo, adrs]) => (
          <div key={repo} className="adrs-tab__group">
            <h3 className="adrs-tab__group-heading">{repo} <span>({adrs.length})</span></h3>
            {adrs.map(adr => <ADRCard key={adr.number} adr={adr} />)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="adrs-tab">
      <div className="adrs-tab__toolbar">
        <ContentSwitcher
          size="sm"
          selectedIndex={lensIndex >= 0 ? lensIndex : 0}
          onChange={({ name }) => dispatch(setLensView(name as ADRLensView))}
        >
          {LENS_VIEWS.map(v => (
            <Switch key={v.key} name={v.key} text={v.label} />
          ))}
        </ContentSwitcher>
        {status === 'succeeded' && (
          <span className="adrs-tab__count">{items.length} ADRs</span>
        )}
      </div>

      {status === 'loading' && (
        <div className="adrs-tab__loading"><InlineLoading description="Loading ADRs…" /></div>
      )}

      {status === 'failed' && (
        <InlineNotification
          kind="error"
          title="Failed to load ADRs"
          subtitle={error ?? undefined}
          lowContrast
        />
      )}

      {status === 'succeeded' && lensView === 'all' && renderAll()}
      {status === 'succeeded' && lensView === 'by-status' && renderByStatus()}
      {status === 'succeeded' && lensView === 'by-repo' && renderByRepo()}
    </div>
  )
}
