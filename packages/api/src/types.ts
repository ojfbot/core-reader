export interface SkillManifest {
  name: string
  tier: number | null
  phase: string | null
  description: string
  knowledgeFiles: string[]
  hasScripts: boolean
  content?: string
}

export interface ADRManifest {
  number: string
  title: string
  status: string
  date: string
  okr: string
  reposAffected: string[]
  skillsAffected: string[]
  content?: string
}

export interface RoadmapPhase {
  phase: string
  what: string
  repos: string[]
  status: string
}

export interface OKRKeyResult {
  id: string
  text: string
  status: string
  completedDate?: string
  detail?: string
}

export interface OKRObjective {
  id: string
  title: string
  description: string
  keyResults: OKRKeyResult[]
  linkedADRs: string[]
}

export interface OKRFile {
  filename: string
  period: string
  status: string
  objectives: OKRObjective[]
}

export interface DocManifest {
  name: string
  title: string
  content?: string
}

export interface FileStatus {
  path: string
  status: string
}

export interface GitStatusResult {
  staged: FileStatus[]
  unstaged: FileStatus[]
  untracked: string[]
}

export interface EventEntry {
  id: string
  timestamp: string
  type: string
  actor: string
  bead_id?: string
  agent_id?: string
  app: string
  summary: string
  payload?: Record<string, unknown>
}
