import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BadgeAction } from '../../components/BadgeButton'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestions?: BadgeAction[]
}

type DisplayState = 'minimized' | 'collapsed' | 'expanded'

export interface ChatState {
  messages: ChatMessage[]
  draftInput: string
  isLoading: boolean
  streamingContent: string
  chatSummary: string
  displayState: DisplayState
  unreadCount: number
}

const initialState: ChatState = {
  messages: [
    {
      role: 'assistant',
      content: `# CoreReader Assistant

Explore commands, ADRs, and roadmap items. Ask questions about the codebase.

**Chat wiring coming in Phase 4. Use the shortcuts below to get started:**`,
      suggestions: [
        {
          label: 'List commands',
          icon: '📋',
          message: 'List all available slash commands',
          variant: 'blue',
        },
        {
          label: 'Find ADR',
          icon: '📄',
          message: 'Show me all accepted ADRs',
          variant: 'teal',
        },
        {
          label: 'Roadmap status',
          icon: '🗺️',
          message: 'What is the current roadmap status?',
          variant: 'green',
        },
      ],
    },
  ],
  draftInput: '',
  isLoading: false,
  streamingContent: '',
  chatSummary: '',
  displayState: 'collapsed',
  unreadCount: 0,
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload)
      if (action.payload.role === 'assistant' && state.displayState !== 'expanded') {
        state.unreadCount += 1
      }
    },
    setDraftInput: (state, action: PayloadAction<string>) => {
      state.draftInput = action.payload
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setStreamingContent: (state, action: PayloadAction<string>) => {
      state.streamingContent = action.payload
    },
    setChatSummary: (state, action: PayloadAction<string>) => {
      state.chatSummary = action.payload
    },
    setDisplayState: (state, action: PayloadAction<DisplayState>) => {
      state.displayState = action.payload
      if (action.payload === 'expanded') {
        state.unreadCount = 0
      }
    },
    markMessagesAsRead: (state) => {
      state.unreadCount = 0
    },
    clearChat: (state) => {
      state.messages = [
        {
          role: 'assistant',
          content: `# CoreReader Assistant\n\nHow can I help you explore the codebase?`,
        },
      ]
      state.draftInput = ''
      state.streamingContent = ''
      state.chatSummary = ''
      state.unreadCount = 0
    },
  },
})

export const {
  addMessage,
  setDraftInput,
  setIsLoading,
  setStreamingContent,
  setChatSummary,
  setDisplayState,
  markMessagesAsRead,
  clearChat,
} = chatSlice.actions

export default chatSlice.reducer
