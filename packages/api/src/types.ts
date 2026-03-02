export interface CommandManifest {
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
  commandsAffected: string[]
  content?: string
}

export interface RoadmapPhase {
  phase: string
  what: string
  repos: string[]
  status: string
}
