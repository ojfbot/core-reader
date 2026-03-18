import { useEffect } from 'react'
import { Button, TextArea, TextInput, InlineLoading, Tag, InlineNotification } from '@carbon/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  fetchGitStatus,
  fetchFileContent,
  saveFile,
  stageFile,
  unstageFile,
  commitChanges,
  setActiveFile,
  editContent,
  setCommitMessage,
  clearCommitResult,
  type FileStatus,
} from '../store/slices/gitSlice'
import './ChangesTab.css'

const STATUS_LABELS: Record<string, string> = {
  M: 'modified',
  A: 'added',
  D: 'deleted',
  R: 'renamed',
  '?': 'untracked',
}

function FileRow({
  file,
  section,
  active,
}: {
  file: FileStatus | string
  section: 'staged' | 'unstaged' | 'untracked'
  active: boolean
}) {
  const dispatch = useAppDispatch()
  const { stagingFile } = useAppSelector(s => s.git)
  const filePath = typeof file === 'string' ? file : file.path
  const statusCode = typeof file === 'string' ? '?' : file.status
  const isStaging = stagingFile === filePath

  async function handleStage() {
    await dispatch(stageFile(filePath))
    dispatch(fetchGitStatus())
  }

  async function handleUnstage() {
    await dispatch(unstageFile(filePath))
    dispatch(fetchGitStatus())
  }

  function handleSelect() {
    dispatch(setActiveFile(filePath))
    dispatch(fetchFileContent(filePath))
  }

  return (
    <div className={`changes-tab__file-row ${active ? 'changes-tab__file-row--active' : ''}`}>
      <button className="changes-tab__file-name" onClick={handleSelect} title={filePath}>
        <Tag size="sm" type={section === 'staged' ? 'green' : 'warm-gray'}>
          {STATUS_LABELS[statusCode] ?? statusCode}
        </Tag>
        <span>{filePath}</span>
      </button>
      <div className="changes-tab__file-actions">
        {section === 'unstaged' && (
          <Button size="sm" kind="ghost" onClick={handleStage} disabled={isStaging}>
            {isStaging ? '…' : 'Stage'}
          </Button>
        )}
        {section === 'staged' && (
          <Button size="sm" kind="ghost" onClick={handleUnstage} disabled={isStaging}>
            {isStaging ? '…' : 'Unstage'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ChangesTab() {
  const dispatch = useAppDispatch()
  const {
    staged, unstaged, untracked,
    statusLoading, statusError,
    activeFile, activeContent, fileLoading, fileDirty,
    commitMessage, committing, commitError, commitSuccess,
  } = useAppSelector(s => s.git)

  useEffect(() => {
    dispatch(fetchGitStatus())
  }, [dispatch])

  const hasStaged = staged.length > 0
  const totalChanges = staged.length + unstaged.length + untracked.length

  async function handleSave() {
    if (!activeFile || activeContent === null) return
    await dispatch(saveFile({ path: activeFile, content: activeContent }))
  }

  async function handleCommit() {
    if (!commitMessage.trim() || !hasStaged) return
    await dispatch(commitChanges(commitMessage))
    dispatch(fetchGitStatus())
    dispatch(clearCommitResult())
  }

  return (
    <div className="changes-tab">
      {/* Left panel — file tree */}
      <div className="changes-tab__sidebar">
        <div className="changes-tab__sidebar-header">
          <span className="changes-tab__section-title">Changes</span>
          <button
            className="changes-tab__refresh"
            onClick={() => dispatch(fetchGitStatus())}
            title="Refresh"
            aria-label="Refresh git status"
          >
            ↻
          </button>
        </div>

        {statusLoading && <InlineLoading description="Loading…" />}
        {statusError && (
          <p className="changes-tab__error">{statusError}</p>
        )}

        {!statusLoading && totalChanges === 0 && (
          <p className="changes-tab__empty">Working tree clean</p>
        )}

        {staged.length > 0 && (
          <section>
            <h4 className="changes-tab__group-heading">Staged ({staged.length})</h4>
            {staged.map(f => (
              <FileRow key={f.path} file={f} section="staged" active={activeFile === f.path} />
            ))}
          </section>
        )}

        {unstaged.length > 0 && (
          <section>
            <h4 className="changes-tab__group-heading">Unstaged ({unstaged.length})</h4>
            {unstaged.map(f => (
              <FileRow key={f.path} file={f} section="unstaged" active={activeFile === f.path} />
            ))}
          </section>
        )}

        {untracked.length > 0 && (
          <section>
            <h4 className="changes-tab__group-heading">Untracked ({untracked.length})</h4>
            {untracked.map(p => (
              <FileRow key={p} file={p} section="untracked" active={activeFile === p} />
            ))}
          </section>
        )}

        {/* Commit panel */}
        <div className="changes-tab__commit-panel">
          <TextInput
            id="commit-message"
            labelText="Commit message"
            size="sm"
            value={commitMessage}
            onChange={e => dispatch(setCommitMessage(e.target.value))}
            placeholder="Describe your changes"
            disabled={committing}
          />
          <Button
            size="sm"
            kind="primary"
            onClick={handleCommit}
            disabled={!hasStaged || !commitMessage.trim() || committing}
          >
            {committing ? 'Committing…' : `Commit (${staged.length})`}
          </Button>
          {commitError && (
            <InlineNotification
              kind="error"
              title="Commit failed"
              subtitle={commitError}
              lowContrast
              hideCloseButton
            />
          )}
          {commitSuccess && (
            <InlineNotification
              kind="success"
              title="Committed"
              subtitle={commitSuccess}
              lowContrast
              hideCloseButton
            />
          )}
        </div>
      </div>

      {/* Right panel — editor */}
      <div className="changes-tab__editor">
        {!activeFile && (
          <div className="changes-tab__editor-empty">
            <p>Select a file to view and edit</p>
          </div>
        )}

        {activeFile && (
          <>
            <div className="changes-tab__editor-header">
              <span className="changes-tab__editor-filename">{activeFile}</span>
              <div className="changes-tab__editor-actions">
                {fileDirty && (
                  <Button size="sm" kind="secondary" onClick={handleSave}>
                    Save
                  </Button>
                )}
              </div>
            </div>

            {fileLoading && <InlineLoading description="Loading file…" />}

            {!fileLoading && activeContent !== null && (
              <TextArea
                id="file-editor"
                labelText={activeFile}
                hideLabel
                value={activeContent}
                onChange={e => dispatch(editContent(e.target.value))}
                className="changes-tab__textarea"
                rows={30}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
