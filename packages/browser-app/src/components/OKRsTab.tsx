import { useState } from 'react'
import { Tag, InlineLoading, InlineNotification } from '@carbon/react'
import { ChevronDown, ChevronUp } from '@carbon/icons-react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setActiveTab } from '../store/slices/navigationSlice'
import { OKRFile, OKRObjective, OKRKeyResult } from '../store/slices/okrsSlice'
import './OKRsTab.css'

const STATUS_TAG_TYPE: Record<string, 'green' | 'blue' | 'gray'> = {
  'Done': 'green',
  'In progress': 'blue',
  'Not started': 'gray',
}

function KRRow({ kr }: { kr: OKRKeyResult }) {
  const tagType = STATUS_TAG_TYPE[kr.status] ?? 'gray'
  return (
    <div className="okrs-tab__kr-row">
      <span className="okrs-tab__kr-id">{kr.id}</span>
      <span className="okrs-tab__kr-text">{kr.text}</span>
      <div className="okrs-tab__kr-right">
        <Tag type={tagType} size="sm">{kr.status}</Tag>
        {kr.completedDate && (
          <span className="okrs-tab__kr-date">{kr.completedDate}</span>
        )}
      </div>
      {kr.detail && (
        <p className="okrs-tab__kr-detail">{kr.detail}</p>
      )}
    </div>
  )
}

function ObjectiveCard({ obj }: { obj: OKRObjective }) {
  const dispatch = useAppDispatch()
  const [expanded, setExpanded] = useState(false)

  const goToADR = (_adrNumber: string) => {
    dispatch(setActiveTab('adrs'))
  }

  // Count KR statuses for summary badge
  const doneCount = obj.keyResults.filter(kr => kr.status === 'Done').length
  const total = obj.keyResults.length

  return (
    <div className={['okrs-tab__obj-card', expanded ? 'expanded' : ''].filter(Boolean).join(' ')}>
      <button
        className="okrs-tab__obj-header"
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
      >
        <div className="okrs-tab__obj-meta">
          <span className="okrs-tab__obj-id">{obj.id}</span>
          <span className="okrs-tab__obj-title">{obj.title}</span>
          <span className="okrs-tab__obj-progress">{doneCount}/{total} KRs done</span>
        </div>
        <div className="okrs-tab__obj-chevron" aria-hidden>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="okrs-tab__obj-content">
          {obj.description && (
            <p className="okrs-tab__obj-description">{obj.description}</p>
          )}

          <div className="okrs-tab__kr-list">
            {obj.keyResults.map(kr => (
              <KRRow key={kr.id} kr={kr} />
            ))}
          </div>

          {obj.linkedADRs.length > 0 && (
            <div className="okrs-tab__linked-adrs">
              <span className="okrs-tab__chip-label">Linked ADRs</span>
              {obj.linkedADRs.map(num => (
                <button
                  key={num}
                  className="okrs-tab__adr-link"
                  onClick={e => { e.stopPropagation(); goToADR(num) }}
                  title={`Go to ADR-${num} in ADRs tab`}
                >
                  <Tag type="teal" size="sm">ADR-{num}</Tag>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function OKRFileSection({ file }: { file: OKRFile }) {
  return (
    <div className="okrs-tab__file-section">
      <div className="okrs-tab__file-header">
        <span className="okrs-tab__file-period">{file.period}</span>
        <Tag type={file.status === 'Active' ? 'blue' : 'gray'} size="sm">{file.status}</Tag>
      </div>
      <div className="okrs-tab__obj-list">
        {file.objectives.map(obj => (
          <ObjectiveCard key={obj.id} obj={obj} />
        ))}
      </div>
    </div>
  )
}

export default function OKRsTab() {
  const { items, status, error } = useAppSelector(state => state.okrs)

  return (
    <div className="okrs-tab">
      {status === 'loading' && (
        <div className="okrs-tab__loading">
          <InlineLoading description="Loading OKRs…" />
        </div>
      )}

      {status === 'failed' && (
        <InlineNotification
          kind="error"
          title="Failed to load OKRs"
          subtitle={error ?? undefined}
          lowContrast
        />
      )}

      {status === 'succeeded' && (
        <div className="okrs-tab__list">
          {items.map(file => (
            <OKRFileSection key={file.filename} file={file} />
          ))}
        </div>
      )}
    </div>
  )
}
