import { useState } from 'react'
import { Tag, InlineLoading } from '@carbon/react'
import { ChevronDown, ChevronUp, Document } from '@carbon/icons-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CommandManifest, fetchCommandContent } from '../store/slices/commandsSlice'
import { useAppDispatch } from '../store/hooks'
import './CommandCard.css'

interface CommandCardProps {
  command: CommandManifest
  /** If true, filter to matching commands from ADR cross-link */
  highlighted?: boolean
}

const TIER_COLORS: Record<number, 'outline' | 'purple' | 'magenta'> = {
  1: 'outline',
  2: 'purple',
  3: 'magenta',
}

export function CommandCard({ command, highlighted }: CommandCardProps) {
  const dispatch = useAppDispatch()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!expanded && !command.content) {
      setLoading(true)
      await dispatch(fetchCommandContent(command.name))
      setLoading(false)
    }
    setExpanded(prev => !prev)
  }

  return (
    <div
      className={['command-card', expanded ? 'expanded' : '', highlighted ? 'highlighted' : ''].filter(Boolean).join(' ')}
      data-name={command.name}
    >
      <button
        className="command-card__header"
        onClick={toggle}
        aria-expanded={expanded}
      >
        <div className="command-card__meta">
          <span className="command-card__name">/{command.name}</span>
          <div className="command-card__tags">
            {command.tier !== null && (
              <Tag type={TIER_COLORS[command.tier] ?? 'outline'} size="sm">
                Tier {command.tier}
              </Tag>
            )}
            {command.phase && (
              <Tag type="cyan" size="sm">{command.phase}</Tag>
            )}
            {command.knowledgeFiles.length > 0 && (
              <Tag type="gray" size="sm">
                <Document size={12} /> {command.knowledgeFiles.length}
              </Tag>
            )}
          </div>
        </div>
        {command.description && (
          <p className="command-card__description">{command.description}</p>
        )}
        <div className="command-card__chevron" aria-hidden>
          {loading ? (
            <InlineLoading />
          ) : expanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </button>

      {expanded && command.content && (
        <div className="command-card__content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{command.content}</ReactMarkdown>
          {command.knowledgeFiles.length > 0 && (
            <div className="command-card__knowledge">
              <span className="command-card__knowledge-label">Knowledge files</span>
              <ul>
                {command.knowledgeFiles.map(f => (
                  <li key={f}><Document size={14} /> {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
