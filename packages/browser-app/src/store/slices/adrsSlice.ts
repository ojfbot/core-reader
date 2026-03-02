import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface ADRManifest {
  number: string
  title: string
  status: string
  date: string
  okr: string
  reposAffected: string[]
  commandsAffected: string[]
  content?: string
}

export type ADRLensView = 'all' | 'by-status' | 'by-repo'

interface ADRsState {
  items: ADRManifest[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  selectedNumber: string | null
  lensView: ADRLensView
}

const initialState: ADRsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedNumber: null,
  lensView: 'all',
}

const API_URL = () => import.meta.env.VITE_CORE_READER_API_URL || 'http://localhost:3016'

export const fetchADRs = createAsyncThunk('adrs/fetchAll', async () => {
  const res = await fetch(`${API_URL()}/api/adrs`)
  if (!res.ok) throw new Error(`Failed to fetch ADRs: ${res.status}`)
  return res.json() as Promise<ADRManifest[]>
})

export const fetchADRContent = createAsyncThunk('adrs/fetchOne', async (number: string) => {
  const res = await fetch(`${API_URL()}/api/adrs/${number}`)
  if (!res.ok) throw new Error(`Failed to fetch ADR: ${res.status}`)
  return res.json() as Promise<ADRManifest>
})

const adrsSlice = createSlice({
  name: 'adrs',
  initialState,
  reducers: {
    setSelectedADR(state, action: PayloadAction<string | null>) {
      state.selectedNumber = action.payload
    },
    setLensView(state, action: PayloadAction<ADRLensView>) {
      state.lensView = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchADRs.pending, state => { state.status = 'loading' })
      .addCase(fetchADRs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (Array.isArray(action.payload)) state.items = action.payload
        else state.error = 'Unexpected response from server'
      })
      .addCase(fetchADRs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchADRContent.fulfilled, (state, action) => {
        const idx = state.items.findIndex(a => a.number === action.payload.number)
        if (idx >= 0) state.items[idx] = action.payload
        else state.items.unshift(action.payload)
      })
  },
})

export const { setSelectedADR, setLensView } = adrsSlice.actions
export default adrsSlice.reducer
