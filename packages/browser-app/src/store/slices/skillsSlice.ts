import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface SkillManifest {
  name: string
  tier: number | null
  phase: string | null
  description: string
  knowledgeFiles: string[]
  hasScripts: boolean
  content?: string
}

interface SkillsState {
  items: SkillManifest[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  selectedName: string | null
  filter: { tier: number | null; phase: string | null; search: string }
}

const initialState: SkillsState = {
  items: [],
  status: 'idle',
  error: null,
  selectedName: null,
  filter: { tier: null, phase: null, search: '' },
}

export const fetchSkills = createAsyncThunk('skills/fetchAll', async () => {
  const base = import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')
  const res = await fetch(`${base}/api/skills`)
  if (!res.ok) throw new Error(`Failed to fetch skills: ${res.status}`)
  return res.json() as Promise<SkillManifest[]>
})

export const fetchSkillContent = createAsyncThunk('skills/fetchOne', async (name: string) => {
  const base = import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')
  const res = await fetch(`${base}/api/skills/${name}`)
  if (!res.ok) throw new Error(`Failed to fetch skill: ${res.status}`)
  return res.json() as Promise<SkillManifest>
})

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    setSelectedSkill(state, action: PayloadAction<string | null>) {
      state.selectedName = action.payload
    },
    setFilter(state, action: PayloadAction<Partial<SkillsState['filter']>>) {
      state.filter = { ...state.filter, ...action.payload }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSkills.pending, state => { state.status = 'loading' })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown error'
      })
      .addCase(fetchSkillContent.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.name === action.payload.name)
        if (idx >= 0) state.items[idx] = action.payload
        else state.items.push(action.payload)
      })
  },
})

export const { setSelectedSkill, setFilter } = skillsSlice.actions
export default skillsSlice.reducer
