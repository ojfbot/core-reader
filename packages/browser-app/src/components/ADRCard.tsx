import { useState } from 'react'
import { Tag, InlineLoading } from '@carbon/react'
import { ChevronDown, ChevronUp } from '@carbon/icons-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ADRManifest, fetchADRContent, setSelectedADR } from '../store/slices/adrsSlice'
import { setActiveTab } from '../store/slices/navigationSlice'
import { setFilter } from '../store/slices/commandsSlice'
import { useAppDispatch } from '../store/hooks'
import './ADRCard.css'

interface ADRCardProps {
  adr: ADRManifest
}

const STATUS_TYPES: Record<string, 'green' | 'blue' | 'gray' | 'red'> = {
  Accepted: 'green',
  Proposed: 'blue',
  Superseded: 'gray',
}

export function ADRCard({ adr }: ADRCardProps) {
  const dispatch = useAppDispatch()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!expanded && !adr.content) {
      setLoading(true)
      await dispatch(fetchADRContent(adr.number))
      setLoading(false)
    }
    setExpanded(prev => !prev)
  }

  // Cross-link: clicking a command name in commandsAffected navigates to Commands tab
  const goToCommand = (cmdName: string) => {
    const clean = cmdName.replace(/^\//, '')
    dispatch(setFilter({ search: clean }))
    dispatch(setActiveTab('commands'))
  }

  return (
    <div className={['adr-card', expanded ? 'expanded' : ''].filter(Boolean).join(' ')}>
      <button
        className="adr-card__header"
        onClick={toggle}
        aria-expanded={expanded}
      >
        <div className="adr-card__meta">
          <span className="adr-card__number">ADR-{adr.number}</span>
          <span className="adr-card__title">{adr.title}</span>
          <div className="adr-card__tags">
            <Tag type={STATUS_TYPES[adr.status] ?? 'gray'} size="sm">
              {adr.status}
            </Tag>
            {adr.date && (
              <span className="adr-card__date">{adr.date}</span>
            )}
          </div>
        </div>
        <div className="adr-card__chevron" aria-hidden>
          {loading ? <InlineLoading /> : expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="adr-card__content">
          {/* Repos affected */}
          {adr.reposAffected.length > 0 && (
            <div className="adr-card__chips">
              <span className="adr-card__chip-label">Repos</span>
              {adr.reposAffected.map(repo => (
                <Tag key={repo} type="teal" size="sm">{repo}</Tag>
              ))}
            </div>
          )}

          {/* Commands affected — cross-linked */}
          {adr.commandsAffected.length > 0 && (
            <div className="adr-card__chips">
              <span className="adr-card__chip-label">Commands</span>
              {adr.commandsAffected.map(cmd => (
                <button
                  key={cmd}
                  className="adr-card__cmd-link"
                  onClick={e => { e.stopPropagation(); goToCommand(cmd) }}
                  title={`Go to ${cmd} in Commands tab`}
                >
                  <Tag type="purple" size="sm">{cmd}</Tag>
                </button>
              ))}
            </div>
          )}

          {/* Full markdown content */}
          {adr.content && (
            <div className="adr-card__markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{adr.content}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
