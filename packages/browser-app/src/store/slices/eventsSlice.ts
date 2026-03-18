import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface EventEntry {
  id: string
  timestamp: string
  type: string
  actor: string
  bead_id?: string
  agent_id?: string
  app: string
  summary: string
  payload?: Record<string, unknown>
}

interface EventsState {
  items: EventEntry[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  typeFilter: string | null
  appFilter: string | null
}

const initialState: EventsState = {
  items: [],
  status: 'idle',
  error: null,
  typeFilter: null,
  appFilter: null,
}

const API_URL = () => import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')

export const fetchEvents = createAsyncThunk<EventEntry[], void, { state: { events: EventsState } }>(
  'events/fetchAll',
  async (_, { getState }) => {
    const state = getState()
    const params = new URLSearchParams({ limit: '200' })
    if (state.events.typeFilter) params.set('type', state.events.typeFilter)
    if (state.events.appFilter) params.set('app', state.events.appFilter)
    const res = await fetch(`${API_URL()}/api/events?${params}`)
    if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`)
    return res.json() as Promise<EventEntry[]>
  }
)

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setTypeFilter(state, action) { state.typeFilter = action.payload; state.status = 'idle' },
    setAppFilter(state, action) { state.appFilter = action.payload; state.status = 'idle' },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEvents.pending, state => { state.status = 'loading'; state.error = null })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown error'
      })
  },
})

export const { setTypeFilter, setAppFilter } = eventsSlice.actions
export default eventsSlice.reducer
