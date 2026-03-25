import { useCallback } from 'react'
import { ChatShell, ChatMessage, MarkdownMessage, getChatMessage } from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/chat-shell'
import '@ojfbot/frame-ui-components/styles/markdown-message'
import '@ojfbot/frame-ui-components/styles/badge-button'
import type { ChatDisplayState, BadgeAction } from '@ojfbot/frame-ui-components'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  addMessage,
  setDraftInput,
  setIsLoading,
  setDisplayState,
} from '../store/slices/chatSlice'

interface CondensedChatProps {
  sidebarExpanded?: boolean
}

/**
 * CoreReader chat — wires shared ChatShell to core-reader's Redux chatSlice.
 */
function CondensedChat({ sidebarExpanded = false }: CondensedChatProps) {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(state => state.chat.messages)
  const draftInput = useAppSelector(state => state.chat.draftInput)
  const isLoading = useAppSelector(state => state.chat.isLoading)
  const displayState = useAppSelector(state => state.chat.displayState)
  const unreadCount = useAppSelector(state => state.chat.unreadCount)

  const handleSend = useCallback((message: string) => {
    if (!message || isLoading) return

    dispatch(addMessage({ role: 'user', content: message }))
    dispatch(setDraftInput(''))
    dispatch(setIsLoading(true))

    // TODO Phase 4: connect to CoreReader agent API
    setTimeout(() => {
      dispatch(addMessage({
        role: 'assistant',
        content: 'CoreReader agent integration coming in Phase 4.',
      }))
      dispatch(setIsLoading(false))
    }, 1000)
  }, [isLoading, dispatch])

  const handleExecute = useCallback((badgeAction: BadgeAction) => {
    const message = getChatMessage(badgeAction)
    if (message) handleSend(message)
  }, [handleSend])

  return (
    <ChatShell
      displayState={displayState as ChatDisplayState}
      onDisplayStateChange={(state) => dispatch(setDisplayState(state))}
      sidebarExpanded={sidebarExpanded}
      title="AI Assistant"
      isLoading={isLoading}
      unreadCount={unreadCount}
      draftInput={draftInput}
      onDraftChange={(value) => dispatch(setDraftInput(value))}
      onSend={handleSend}
      placeholder="Ask about the codebase..."
    >
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} role={msg.role} isStreaming={false}>
          {msg.role === 'user' ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          ) : (
            <MarkdownMessage
              content={msg.content}
              suggestions={msg.suggestions}
              onExecute={handleExecute}
              compact
            />
          )}
        </ChatMessage>
      ))}
    </ChatShell>
  )
}

export default CondensedChat
