import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface RoadmapPhase {
  phase: string
  what: string
  repos: string[]
  status: string
}

interface RoadmapState {
  items: RoadmapPhase[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: RoadmapState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchRoadmap = createAsyncThunk('roadmap/fetchAll', async () => {
  const base = import.meta.env.VITE_CORE_READER_API_URL || 'http://localhost:3016'
  const res = await fetch(`${base}/api/roadmap`)
  if (!res.ok) throw new Error(`Failed to fetch roadmap: ${res.status}`)
  return res.json() as Promise<RoadmapPhase[]>
})

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchRoadmap.pending, state => { state.status = 'loading' })
      .addCase(fetchRoadmap.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchRoadmap.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown error'
      })
  },
})

export default roadmapSlice.reducer
