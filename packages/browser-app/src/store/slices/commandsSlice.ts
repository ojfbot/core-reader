import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface CommandManifest {
  name: string
  tier: number | null
  phase: string | null
  description: string
  knowledgeFiles: string[]
  hasScripts: boolean
  content?: string
}

interface CommandsState {
  items: CommandManifest[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  selectedName: string | null
  filter: { tier: number | null; phase: string | null; search: string }
}

const initialState: CommandsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedName: null,
  filter: { tier: null, phase: null, search: '' },
}

export const fetchCommands = createAsyncThunk('commands/fetchAll', async () => {
  const base = import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')
  const res = await fetch(`${base}/api/commands`)
  if (!res.ok) throw new Error(`Failed to fetch commands: ${res.status}`)
  return res.json() as Promise<CommandManifest[]>
})

export const fetchCommandContent = createAsyncThunk('commands/fetchOne', async (name: string) => {
  const base = import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')
  const res = await fetch(`${base}/api/commands/${name}`)
  if (!res.ok) throw new Error(`Failed to fetch command: ${res.status}`)
  return res.json() as Promise<CommandManifest>
})

const commandsSlice = createSlice({
  name: 'commands',
  initialState,
  reducers: {
    setSelectedCommand(state, action: PayloadAction<string | null>) {
      state.selectedName = action.payload
    },
    setFilter(state, action: PayloadAction<Partial<CommandsState['filter']>>) {
      state.filter = { ...state.filter, ...action.payload }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCommands.pending, state => { state.status = 'loading' })
      .addCase(fetchCommands.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCommands.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchCommandContent.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.name === action.payload.name)
        if (idx >= 0) state.items[idx] = action.payload
        else state.items.push(action.payload)
      })
  },
})

export const { setSelectedCommand, setFilter } = commandsSlice.actions
export default commandsSlice.reducer
