import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Thread {
  threadId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ThreadsState {
  threads: Thread[]
  currentThreadId: string | null
  isLoading: boolean
  isCreatingThread: boolean
}

// Mock threads — wired to real API in Phase 2
const MOCK_THREADS: Thread[] = [
  {
    threadId: 'mock-1',
    title: 'How does /scaffold work?',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    threadId: 'mock-2',
    title: 'ADR-0008 ShellAgent routing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    threadId: 'mock-3',
    title: 'CoreReader Phase 1 scope',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]

const initialState: ThreadsState = {
  threads: MOCK_THREADS,
  currentThreadId: null,
  isLoading: false,
  isCreatingThread: false,
}

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    setCurrentThreadId: (state, action: PayloadAction<string | null>) => {
      state.currentThreadId = action.payload
    },
    createThread: (state, action: PayloadAction<{ title?: string }>) => {
      const now = new Date().toISOString()
      const newThread: Thread = {
        threadId: `mock-${Date.now()}`,
        title: action.payload.title || `Conversation - ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
        createdAt: now,
        updatedAt: now,
      }
      state.threads.unshift(newThread)
      state.currentThreadId = newThread.threadId
    },
    deleteThread: (state, action: PayloadAction<string>) => {
      state.threads = state.threads.filter(t => t.threadId !== action.payload)
      if (state.currentThreadId === action.payload) {
        state.currentThreadId = state.threads[0]?.threadId ?? null
      }
    },
  },
})

export const { setCurrentThreadId, createThread, deleteThread } = threadsSlice.actions
export default threadsSlice.reducer
