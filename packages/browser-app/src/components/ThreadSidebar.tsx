import { useState } from 'react'
import { Button, Modal } from '@carbon/react'
import { Add, Chat, TrashCan } from '@carbon/icons-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  createThread,
  deleteThread,
  setCurrentThreadId,
} from '../store/slices/threadsSlice'
import './ThreadSidebar.css'

interface ThreadSidebarProps {
  isExpanded: boolean
  onToggle: () => void
}

export default function ThreadSidebar({ isExpanded, onToggle }: ThreadSidebarProps) {
  const dispatch = useAppDispatch()
  const { threads, currentThreadId, isCreatingThread } = useAppSelector(
    state => state.threads
  )
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null)

  const handleCreateThread = () => {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    dispatch(createThread({ title: `Conversation - ${timestamp}` }))
  }

  const handleSelectThread = (threadId: string) => {
    if (currentThreadId !== threadId) {
      dispatch(setCurrentThreadId(threadId))
    }
  }

  const handleDeleteClick = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setThreadToDelete(threadId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (threadToDelete) {
      dispatch(deleteThread(threadToDelete))
      setDeleteModalOpen(false)
      setThreadToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteModalOpen(false)
    setThreadToDelete(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <>
      <div
        className={`thread-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
        {...(!isExpanded ? { inert: '' } : {})}
      >
        <div className="thread-sidebar-header">
          <h3 className="thread-sidebar-title">Conversations</h3>
          <div className="thread-sidebar-actions">
            <Button
              kind="primary"
              size="sm"
              hasIconOnly
              iconDescription="New conversation"
              onClick={handleCreateThread}
              disabled={isCreatingThread}
            >
              <Add />
            </Button>
          </div>
        </div>

        <div className="thread-sidebar-content">
          {threads.length === 0 ? (
            <div className="thread-sidebar-empty">
              <Chat size={48} className="empty-icon" />
              <p className="empty-message">No conversations yet</p>
              <Button
                kind="tertiary"
                size="sm"
                onClick={handleCreateThread}
                disabled={isCreatingThread}
              >
                Start your first conversation
              </Button>
            </div>
          ) : (
            <div className="thread-list">
              {threads.map(thread => (
                <div
                  key={thread.threadId}
                  className={`thread-item ${currentThreadId === thread.threadId ? 'active' : ''}`}
                  onClick={() => handleSelectThread(thread.threadId)}
                  onMouseEnter={() => setHoveredThreadId(thread.threadId)}
                  onMouseLeave={() => setHoveredThreadId(null)}
                >
                  <div className="thread-item-content">
                    <div className="thread-item-title">
                      {thread.title || 'Untitled conversation'}
                    </div>
                    <div className="thread-item-date">
                      {formatDate(thread.updatedAt)}
                    </div>
                  </div>
                  {hoveredThreadId === thread.threadId && (
                    <Button
                      kind="ghost"
                      size="sm"
                      hasIconOnly
                      iconDescription="Delete conversation"
                      onClick={(e: React.MouseEvent) => handleDeleteClick(thread.threadId, e)}
                      className="thread-item-delete"
                    >
                      <TrashCan />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div className="thread-sidebar-overlay" onClick={onToggle} />
      )}

      <Modal
        open={deleteModalOpen}
        onRequestClose={handleCancelDelete}
        onRequestSubmit={handleConfirmDelete}
        modalHeading="Delete conversation"
        modalLabel="Confirm action"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        danger
        size="sm"
      >
        <p>Are you sure you want to delete this conversation? This action cannot be undone.</p>
      </Modal>
    </>
  )
}
