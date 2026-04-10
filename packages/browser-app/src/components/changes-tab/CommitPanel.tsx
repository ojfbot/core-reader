import { Button, TextInput, InlineNotification } from '@carbon/react'

interface CommitPanelProps {
  commitMessage: string
  hasStaged: boolean
  stagedCount: number
  committing: boolean
  commitError: string | null
  commitSuccess: string | null
  onSetMessage: (value: string) => void
  onCommit: () => void
}

export function CommitPanel({
  commitMessage, hasStaged, stagedCount, committing,
  commitError, commitSuccess, onSetMessage, onCommit,
}: CommitPanelProps) {
  return (
    <div className="changes-tab__commit-panel">
      <TextInput
        id="commit-message"
        labelText="Commit message"
        size="sm"
        value={commitMessage}
        onChange={e => onSetMessage(e.target.value)}
        placeholder="Describe your changes"
        disabled={committing}
      />
      <Button
        size="sm"
        kind="primary"
        onClick={onCommit}
        disabled={!hasStaged || !commitMessage.trim() || committing}
      >
        {committing ? 'Committing…' : `Commit (${stagedCount})`}
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
  )
}
