import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface OKRKeyResult {
  id: string
  text: string
  status: string
  completedDate?: string
  detail?: string
}

export interface OKRObjective {
  id: string
  title: string
  description: string
  keyResults: OKRKeyResult[]
  linkedADRs: string[]
}

export interface OKRFile {
  filename: string
  period: string
  status: string
  objectives: OKRObjective[]
}

interface OKRsState {
  items: OKRFile[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: OKRsState = {
  items: [],
  status: 'idle',
  error: null,
}

const API_URL = () => import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')

export const fetchOKRs = createAsyncThunk('okrs/fetchAll', async () => {
  const res = await fetch(`${API_URL()}/api/okrs`)
  if (!res.ok) throw new Error(`Failed to fetch OKRs: ${res.status}`)
  return res.json() as Promise<OKRFile[]>
})

const okrsSlice = createSlice({
  name: 'okrs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOKRs.pending, state => { state.status = 'loading' })
      .addCase(fetchOKRs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOKRs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown error'
      })
  },
})

export default okrsSlice.reducer
