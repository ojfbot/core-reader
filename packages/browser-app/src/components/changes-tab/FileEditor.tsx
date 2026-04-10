import { Button, TextArea, InlineLoading } from '@carbon/react'

interface FileEditorProps {
  activeFile: string | null
  activeContent: string | null
  fileLoading: boolean
  fileDirty: boolean
  onEditContent: (value: string) => void
  onSave: () => void
}

export function FileEditor({
  activeFile, activeContent, fileLoading, fileDirty,
  onEditContent, onSave,
}: FileEditorProps) {
  if (!activeFile) {
    return (
      <div className="changes-tab__editor">
        <div className="changes-tab__editor-empty">
          <p>Select a file to view and edit</p>
        </div>
      </div>
    )
  }

  return (
    <div className="changes-tab__editor">
      <div className="changes-tab__editor-header">
        <span className="changes-tab__editor-filename">{activeFile}</span>
        <div className="changes-tab__editor-actions">
          {fileDirty && (
            <Button size="sm" kind="secondary" onClick={onSave}>
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
          onChange={e => onEditContent(e.target.value)}
          className="changes-tab__textarea"
          rows={30}
        />
      )}
    </div>
  )
}
