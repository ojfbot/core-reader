import { InlineLoading } from '@carbon/react'
import { useChangesTab } from './changes-tab/useChangesTab'
import { FileRow } from './changes-tab/FileRow'
import { CommitPanel } from './changes-tab/CommitPanel'
import { FileEditor } from './changes-tab/FileEditor'
import './ChangesTab.css'

export default function ChangesTab() {
  const s = useChangesTab()

  return (
    <div className="changes-tab">
      <div className="changes-tab__sidebar">
        <div className="changes-tab__sidebar-header">
          <span className="changes-tab__section-title">Changes</span>
          <button
            className="changes-tab__refresh"
            onClick={s.handleRefresh}
            title="Refresh"
            aria-label="Refresh git status"
          >
            ↻
          </button>
        </div>

        {s.statusLoading && <InlineLoading description="Loading…" />}
        {s.statusError && <p className="changes-tab__error">{s.statusError}</p>}

        {!s.statusLoading && s.totalChanges === 0 && (
          <p className="changes-tab__empty">Working tree clean</p>
        )}

        {s.staged.length > 0 && (
          <section>
            <h4 className="changes-tab__group-heading">Staged ({s.staged.length})</h4>
            {s.staged.map(f => (
              <FileRow key={f.path} file={f} section="staged" active={s.activeFile === f.path} />
            ))}
          </section>
        )}

        {s.unstaged.length > 0 && (
          <section>
            <h4 className="changes-tab__group-heading">Unstaged ({s.unstaged.length})</h4>
            {s.unstaged.map(f => (
              <FileRow key={f.path} file={f} section="unstaged" active={s.activeFile === f.path} />
            ))}
          </section>
        )}

        {s.untracked.length > 0 && (
          <section>
            <h4 className="changes-tab__group-heading">Untracked ({s.untracked.length})</h4>
            {s.untracked.map(p => (
              <FileRow key={p} file={p} section="untracked" active={s.activeFile === p} />
            ))}
          </section>
        )}

        <CommitPanel
          commitMessage={s.commitMessage}
          hasStaged={s.hasStaged}
          stagedCount={s.staged.length}
          committing={s.committing}
          commitError={s.commitError}
          commitSuccess={s.commitSuccess}
          onSetMessage={s.handleSetCommitMessage}
          onCommit={s.handleCommit}
        />
      </div>

      <FileEditor
        activeFile={s.activeFile}
        activeContent={s.activeContent}
        fileLoading={s.fileLoading}
        fileDirty={s.fileDirty}
        onEditContent={s.handleEditContent}
        onSave={s.handleSave}
      />
    </div>
  )
}
