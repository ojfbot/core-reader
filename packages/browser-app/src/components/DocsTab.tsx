import { useState } from 'react'
import { InlineLoading, InlineNotification } from '@carbon/react'
import { ChevronDown, ChevronUp } from '@carbon/icons-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { fetchDocContent, DocManifest } from '../store/slices/docsSlice'
import './DocsTab.css'

function DocCard({ doc }: { doc: DocManifest }) {
  const dispatch = useAppDispatch()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    if (!expanded && !doc.content) {
      setLoading(true)
      await dispatch(fetchDocContent(doc.name))
      setLoading(false)
    }
    setExpanded(prev => !prev)
  }

  return (
    <div className={['docs-tab__card', expanded ? 'expanded' : ''].filter(Boolean).join(' ')}>
      <button
        className="docs-tab__card-header"
        onClick={toggle}
        aria-expanded={expanded}
      >
        <div className="docs-tab__card-meta">
          <span className="docs-tab__card-name">{doc.name}</span>
          <span className="docs-tab__card-title">{doc.title}</span>
        </div>
        <div className="docs-tab__card-chevron" aria-hidden>
          {loading ? <InlineLoading /> : expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="docs-tab__card-content">
          {doc.content ? (
            <div className="docs-tab__markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="docs-tab__empty">No content available.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DocsTab() {
  const { items, status, error } = useAppSelector(state => state.docs)

  return (
    <div className="docs-tab">
      {status === 'loading' && (
        <div className="docs-tab__loading">
          <InlineLoading description="Loading docs…" />
        </div>
      )}

      {status === 'failed' && (
        <InlineNotification
          kind="error"
          title="Failed to load docs"
          subtitle={error ?? undefined}
          lowContrast
        />
      )}

      {status === 'succeeded' && (
        <div className="docs-tab__list">
          {items.map(doc => (
            <DocCard key={doc.name} doc={doc} />
          ))}
        </div>
      )}
    </div>
  )
}
