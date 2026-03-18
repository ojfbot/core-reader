import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface DocManifest {
  name: string
  title: string
  content?: string
}

interface DocsState {
  items: DocManifest[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: DocsState = {
  items: [],
  status: 'idle',
  error: null,
}

const API_URL = () => import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')

export const fetchDocs = createAsyncThunk('docs/fetchAll', async () => {
  const res = await fetch(`${API_URL()}/api/docs`)
  if (!res.ok) throw new Error(`Failed to fetch docs: ${res.status}`)
  return res.json() as Promise<DocManifest[]>
})

export const fetchDocContent = createAsyncThunk('docs/fetchOne', async (name: string) => {
  const res = await fetch(`${API_URL()}/api/docs/${name}`)
  if (!res.ok) throw new Error(`Failed to fetch doc: ${res.status}`)
  const data = await res.json() as { content: string }
  return { name, content: data.content }
})

const docsSlice = createSlice({
  name: 'docs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDocs.pending, state => { state.status = 'loading' })
      .addCase(fetchDocs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchDocs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchDocContent.fulfilled, (state, action) => {
        const idx = state.items.findIndex(d => d.name === action.payload.name)
        if (idx >= 0) state.items[idx] = { ...state.items[idx], content: action.payload.content }
      })
  },
})

export default docsSlice.reducer
