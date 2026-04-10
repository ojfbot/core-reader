import { Button, Tag } from '@carbon/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  fetchGitStatus,
  fetchFileContent,
  stageFile,
  unstageFile,
  setActiveFile,
  type FileStatus,
} from '../../store/slices/gitSlice'

const STATUS_LABELS: Record<string, string> = {
  M: 'modified',
  A: 'added',
  D: 'deleted',
  R: 'renamed',
  '?': 'untracked',
}

interface FileRowProps {
  file: FileStatus | string
  section: 'staged' | 'unstaged' | 'untracked'
  active: boolean
}

export function FileRow({ file, section, active }: FileRowProps) {
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
