import { IconButton } from '@carbon/react'
import { Close } from '@carbon/icons-react'
import './ThreadSidebar.css'

interface ThreadSidebarProps {
  open: boolean
  onClose: () => void
}

/**
 * Right-side contextual panel.
 *
 * Phase 1: structural shell only — thread list wiring and content panels come
 * in later phases. Exists now for MF layout testing and because this panel will
 * serve purposes beyond chat threads (detail views, ADR cross-links, etc.)
 *
 * Positioning: position:fixed, top:48px (shell header height), right:0.
 * Carbon SideNav containing-block note: if an ancestor has a CSS transform the
 * fixed position resolves against that element, not the viewport. Use the
 * inert="" wrapper pattern (see shell-mf-integration.md) to avoid the issue.
 */
export default function ThreadSidebar({ open, onClose }: ThreadSidebarProps) {
  return (
    <aside
      className={['cr-thread-sidebar', open ? 'cr-thread-sidebar--open' : ''].filter(Boolean).join(' ')}
      aria-label="Context panel"
      aria-hidden={!open}
    >
      <div className="cr-thread-sidebar__header">
        <span className="cr-thread-sidebar__title">Context</span>
        <IconButton
          label="Close panel"
          kind="ghost"
          size="sm"
          align="left"
          onClick={onClose}
        >
          <Close size={16} />
        </IconButton>
      </div>

      <div className="cr-thread-sidebar__body">
        {/* Phase 1 placeholder — threads + detail panels wired in later phases */}
        <p className="cr-thread-sidebar__placeholder">
          Context panel — available in Phase 2
        </p>
      </div>
    </aside>
  )
}
