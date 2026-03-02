import { Tag, InlineLoading, InlineNotification } from '@carbon/react'
import { useAppSelector } from '../store/hooks'
import './RoadmapTab.css'

const STATUS_TAG_TYPE: Record<string, 'green' | 'blue' | 'red' | 'gray'> = {
  'Complete': 'green',
  'In progress': 'blue',
  'Blocked': 'red',
  'Not started': 'gray',
}

export default function RoadmapTab() {
  const { items, status, error } = useAppSelector(state => state.roadmap)

  return (
    <div className="roadmap-tab">
      {status === 'loading' && (
        <div className="roadmap-tab__loading">
          <InlineLoading description="Loading roadmap…" />
        </div>
      )}

      {status === 'failed' && (
        <InlineNotification
          kind="error"
          title="Failed to load roadmap"
          subtitle={error ?? undefined}
          lowContrast
        />
      )}

      {status === 'succeeded' && (
        <div className="roadmap-tab__list">
          {items.map(phase => {
            const tagType = STATUS_TAG_TYPE[phase.status] ?? 'gray'
            return (
              <div key={phase.phase} className="roadmap-tab__row">
                <div className="roadmap-tab__row-header">
                  <span className="roadmap-tab__phase-label">Phase {phase.phase}</span>
                  <Tag type={tagType} size="sm">{phase.status}</Tag>
                </div>
                <p className="roadmap-tab__what">{phase.what}</p>
                {phase.repos.length > 0 && (
                  <div className="roadmap-tab__repos">
                    {phase.repos.map(r => (
                      <Tag key={r} type="outline" size="sm">{r}</Tag>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
