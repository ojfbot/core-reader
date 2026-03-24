import { ThreadSidebar } from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/thread-sidebar'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  createThread,
  deleteThread,
  setCurrentThreadId,
} from '../store/slices/threadsSlice'

interface ThreadSidebarConnectedProps {
  isExpanded: boolean
  onToggle: () => void
}

/**
 * Thin Redux wrapper around the shared ThreadSidebar component.
 * Maps core-reader's threadsSlice state to the pure component's props.
 */
export default function ThreadSidebarConnected({ isExpanded, onToggle }: ThreadSidebarConnectedProps) {
  const dispatch = useAppDispatch()
  const { threads, currentThreadId, isCreatingThread } = useAppSelector(
    state => state.threads
  )

  return (
    <ThreadSidebar
      isExpanded={isExpanded}
      onToggle={onToggle}
      threads={threads}
      currentThreadId={currentThreadId}
      isCreatingThread={isCreatingThread}
      onCreateThread={() => {
        const timestamp = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
        dispatch(createThread({ title: `Conversation - ${timestamp}` }))
      }}
      onSelectThread={(threadId) => {
        if (currentThreadId !== threadId) {
          dispatch(setCurrentThreadId(threadId))
        }
      }}
      onDeleteThread={(threadId) => {
        dispatch(deleteThread(threadId))
      }}
    />
  )
}
