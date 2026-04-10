import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchGitStatus,
  saveFile,
  commitChanges,
  editContent,
  setCommitMessage,
  clearCommitResult,
} from '../../store/slices/gitSlice'

export function useChangesTab() {
  const dispatch = useAppDispatch()
  const state = useAppSelector(s => s.git)

  useEffect(() => {
    dispatch(fetchGitStatus())
  }, [dispatch])

  const hasStaged = state.staged.length > 0
  const totalChanges = state.staged.length + state.unstaged.length + state.untracked.length

  async function handleSave() {
    if (!state.activeFile || state.activeContent === null) return
    await dispatch(saveFile({ path: state.activeFile, content: state.activeContent }))
  }

  async function handleCommit() {
    if (!state.commitMessage.trim() || !hasStaged) return
    await dispatch(commitChanges(state.commitMessage))
    dispatch(fetchGitStatus())
    dispatch(clearCommitResult())
  }

  return {
    ...state,
    hasStaged,
    totalChanges,
    handleSave,
    handleCommit,
    handleRefresh: () => dispatch(fetchGitStatus()),
    handleEditContent: (value: string) => dispatch(editContent(value)),
    handleSetCommitMessage: (value: string) => dispatch(setCommitMessage(value)),
  }
}
