import { useState } from 'react'
import { Tag, InlineLoading } from '@carbon/react'
import { ChevronDown, ChevronUp, Document } from '@carbon/icons-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { SkillManifest, fetchSkillContent } from '../store/slices/skillsSlice'
import { useAppDispatch } from '../store/hooks'
import './SkillCard.css'

interface SkillCardProps {
  skill: SkillManifest
  /** If true, filter to matching skills from ADR cross-link */
  highlighted?: boolean
}

const TIER_COLORS: Record<number, 'outline' | 'purple' | 'magenta'> = {
  1: 'outline',
  2: 'purple',
  3: 'magenta',
}

export function SkillCard({ skill, highlighted }: SkillCardProps) {
  const dispatch = useAppDispatch()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!expanded && !skill.content) {
      setLoading(true)
      await dispatch(fetchSkillContent(skill.name))
      setLoading(false)
    }
    setExpanded(prev => !prev)
  }

  return (
    <div
      className={['skill-card', expanded ? 'expanded' : '', highlighted ? 'highlighted' : ''].filter(Boolean).join(' ')}
      data-name={skill.name}
    >
      <button
        className="skill-card__header"
        onClick={toggle}
        aria-expanded={expanded}
      >
        <div className="skill-card__meta">
          <span className="skill-card__name">/{skill.name}</span>
          <div className="skill-card__tags">
            {skill.tier !== null && (
              <Tag type={TIER_COLORS[skill.tier] ?? 'outline'} size="sm">
                Tier {skill.tier}
              </Tag>
            )}
            {skill.phase && (
              <Tag type="cyan" size="sm">{skill.phase}</Tag>
            )}
            {skill.knowledgeFiles.length > 0 && (
              <Tag type="gray" size="sm">
                <Document size={12} /> {skill.knowledgeFiles.length}
              </Tag>
            )}
          </div>
        </div>
        {skill.description && (
          <p className="skill-card__description">{skill.description}</p>
        )}
        <div className="skill-card__chevron" aria-hidden>
          {loading ? (
            <InlineLoading />
          ) : expanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </button>

      {expanded && skill.content && (
        <div className="skill-card__content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{skill.content}</ReactMarkdown>
          {skill.knowledgeFiles.length > 0 && (
            <div className="skill-card__knowledge">
              <span className="skill-card__knowledge-label">Knowledge files</span>
              <ul>
                {skill.knowledgeFiles.map(f => (
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
