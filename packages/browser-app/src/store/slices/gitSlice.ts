import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface FileStatus {
  path: string
  status: string
}

export interface GitStatusResult {
  staged: FileStatus[]
  unstaged: FileStatus[]
  untracked: string[]
}

interface GitState {
  staged: FileStatus[]
  unstaged: FileStatus[]
  untracked: string[]
  statusLoading: boolean
  statusError: string | null
  activeFile: string | null
  activeContent: string | null
  fileLoading: boolean
  fileDirty: boolean
  commitMessage: string
  committing: boolean
  commitError: string | null
  commitSuccess: string | null
  stagingFile: string | null
}

const initialState: GitState = {
  staged: [],
  unstaged: [],
  untracked: [],
  statusLoading: false,
  statusError: null,
  activeFile: null,
  activeContent: null,
  fileLoading: false,
  fileDirty: false,
  commitMessage: '',
  committing: false,
  commitError: null,
  commitSuccess: null,
  stagingFile: null,
}

const API_URL = () => import.meta.env.VITE_CORE_READER_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3016')

export const fetchGitStatus = createAsyncThunk('git/fetchStatus', async () => {
  const res = await fetch(`${API_URL()}/api/git/status`)
  if (!res.ok) throw new Error(`git status failed: ${res.status}`)
  return res.json() as Promise<GitStatusResult>
})

export const fetchFileContent = createAsyncThunk('git/fetchFile', async (filePath: string) => {
  const res = await fetch(`${API_URL()}/api/git/file?path=${encodeURIComponent(filePath)}`)
  if (!res.ok) throw new Error(`read file failed: ${res.status}`)
  const data = await res.json() as { content: string }
  return { path: filePath, content: data.content }
})

export const saveFile = createAsyncThunk('git/saveFile', async ({ path, content }: { path: string; content: string }) => {
  const res = await fetch(`${API_URL()}/api/git/file`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  })
  if (!res.ok) throw new Error(`write file failed: ${res.status}`)
  return path
})

export const stageFile = createAsyncThunk('git/stageFile', async (filePath: string) => {
  const res = await fetch(`${API_URL()}/api/git/stage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths: [filePath] }),
  })
  if (!res.ok) throw new Error(`stage failed: ${res.status}`)
  return filePath
})

export const unstageFile = createAsyncThunk('git/unstageFile', async (filePath: string) => {
  const res = await fetch(`${API_URL()}/api/git/unstage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths: [filePath] }),
  })
  if (!res.ok) throw new Error(`unstage failed: ${res.status}`)
  return filePath
})

export const commitChanges = createAsyncThunk('git/commit', async (message: string) => {
  const res = await fetch(`${API_URL()}/api/git/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    const data = await res.json() as { error: string }
    throw new Error(data.error ?? `commit failed: ${res.status}`)
  }
  const data = await res.json() as { output: string }
  return data.output
})

const gitSlice = createSlice({
  name: 'git',
  initialState,
  reducers: {
    setActiveFile(state, action: PayloadAction<string | null>) {
      state.activeFile = action.payload
      state.activeContent = null
      state.fileDirty = false
    },
    editContent(state, action: PayloadAction<string>) {
      state.activeContent = action.payload
      state.fileDirty = true
    },
    setCommitMessage(state, action: PayloadAction<string>) {
      state.commitMessage = action.payload
    },
    clearCommitResult(state) {
      state.commitError = null
      state.commitSuccess = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGitStatus.pending, state => { state.statusLoading = true; state.statusError = null })
      .addCase(fetchGitStatus.fulfilled, (state, action) => {
        state.statusLoading = false
        state.staged = action.payload.staged
        state.unstaged = action.payload.unstaged
        state.untracked = action.payload.untracked
      })
      .addCase(fetchGitStatus.rejected, (state, action) => {
        state.statusLoading = false
        state.statusError = action.error.message ?? 'Failed to fetch git status'
      })
      .addCase(fetchFileContent.pending, state => { state.fileLoading = true })
      .addCase(fetchFileContent.fulfilled, (state, action) => {
        state.fileLoading = false
        state.activeContent = action.payload.content
        state.fileDirty = false
      })
      .addCase(fetchFileContent.rejected, state => { state.fileLoading = false })
      .addCase(saveFile.fulfilled, state => { state.fileDirty = false })
      .addCase(stageFile.pending, (state, action) => { state.stagingFile = action.meta.arg })
      .addCase(stageFile.fulfilled, state => { state.stagingFile = null })
      .addCase(stageFile.rejected, state => { state.stagingFile = null })
      .addCase(unstageFile.pending, (state, action) => { state.stagingFile = action.meta.arg })
      .addCase(unstageFile.fulfilled, state => { state.stagingFile = null })
      .addCase(unstageFile.rejected, state => { state.stagingFile = null })
      .addCase(commitChanges.pending, state => { state.committing = true; state.commitError = null; state.commitSuccess = null })
      .addCase(commitChanges.fulfilled, (state, action) => {
        state.committing = false
        state.commitSuccess = action.payload || 'Committed'
        state.commitMessage = ''
        state.staged = []
      })
      .addCase(commitChanges.rejected, (state, action) => {
        state.committing = false
        state.commitError = action.error.message ?? 'Commit failed'
      })
  },
})

export const { setActiveFile, editContent, setCommitMessage, clearCommitResult } = gitSlice.actions
export default gitSlice.reducer
