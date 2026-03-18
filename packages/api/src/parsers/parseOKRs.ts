import fs from 'fs'
import path from 'path'
import { OKRFile, OKRObjective, OKRKeyResult } from '../types'
import { fetchGitHubTree, fetchGitHubBlob } from '../github'

// ── Local filesystem ────────────────────────────────────────────────────────

export function parseOKRs(coreRepoPath: string): OKRFile[] {
  const okrDir = path.join(coreRepoPath, 'decisions', 'okr')
  if (!fs.existsSync(okrDir)) return []

  return fs.readdirSync(okrDir)
    .filter(f => f.endsWith('.md') && f !== 'template.md')
    .sort()
    .map(filename => {
      const content = fs.readFileSync(path.join(okrDir, filename), 'utf-8')
      return parseOKRContent(content, filename.replace(/\.md$/, ''))
    })
}

// ── GitHub ──────────────────────────────────────────────────────────────────

export async function parseOKRsFromGitHub(repo: string, token: string): Promise<OKRFile[]> {
  const tree = await fetchGitHubTree(repo, token)
  const entries = tree.filter(e =>
    e.type === 'blob' &&
    e.path.startsWith('decisions/okr/') &&
    e.path.endsWith('.md') &&
    !e.path.endsWith('template.md')
  )

  const files = await Promise.all(
    entries.map(async e => {
      const content = await fetchGitHubBlob(repo, e.sha, token)
      const filename = path.basename(e.path, '.md')
      return parseOKRContent(content, filename)
    })
  )

  return files.sort((a, b) => a.filename.localeCompare(b.filename))
}

// ── Shared parsing ──────────────────────────────────────────────────────────

export function parseOKRContent(content: string, filename: string): OKRFile {
  const lines = content.split('\n')

  // Extract top-level metadata
  let period = ''
  let status = ''
  for (const line of lines) {
    const statusMatch = line.match(/^Status:\s*(.+)/)
    if (statusMatch) status = statusMatch[1].trim()
    const periodMatch = line.match(/^Period:\s*(.+)/)
    if (periodMatch) {
      // Convert "2026-01-01 → 2026-03-31" to "Q1 2026"
      // Also try to detect from the filename e.g. "2026-q1"
      period = periodMatch[1].trim()
    }
  }

  // Derive human-readable period label from filename if possible
  const qMatch = filename.match(/^(\d{4})-q(\d)$/)
  if (qMatch) {
    period = `Q${qMatch[2]} ${qMatch[1]}`
  }

  // Split into objective sections: lines starting with "## O\d+"
  const objectives: OKRObjective[] = []
  const objSections: Array<{ id: string; title: string; body: string[] }> = []

  let currentObj: { id: string; title: string; body: string[] } | null = null

  for (const line of lines) {
    const objMatch = line.match(/^##\s+(O\d+):\s*(.+)/)
    if (objMatch) {
      if (currentObj) objSections.push(currentObj)
      currentObj = { id: objMatch[1], title: objMatch[2].trim(), body: [] }
    } else if (currentObj) {
      currentObj.body.push(line)
    }
  }
  if (currentObj) objSections.push(currentObj)

  for (const section of objSections) {
    // Skip "Retrospective" pseudo-objective
    if (/retrospective/i.test(section.title)) continue

    const obj = parseObjectiveBody(section.id, section.title, section.body)
    objectives.push(obj)
  }

  return { filename, period, status, objectives }
}

function parseObjectiveBody(id: string, title: string, bodyLines: string[]): OKRObjective {
  const keyResults: OKRKeyResult[] = []
  const descLines: string[] = []
  let linkedADRs: string[] = []
  let seenFirstKR = false

  for (const line of bodyLines) {
    // KR line: "- KR1: ..."
    const krMatch = line.match(/^-\s+(KR\d+):\s*(.+)/)
    if (krMatch) {
      seenFirstKR = true
      const [, krId, rest] = krMatch
      const kr = parseKRLine(krId, rest)
      keyResults.push(kr)
      continue
    }

    // Linked ADRs line
    if (line.startsWith('**Linked ADRs:**')) {
      linkedADRs = extractADRNumbers(line)
      continue
    }

    // Accumulate description lines (before first KR)
    if (!seenFirstKR && line.trim() !== '' && !line.startsWith('---')) {
      descLines.push(line.trim())
    }
  }

  return {
    id,
    title,
    description: descLines.join(' ').trim(),
    keyResults,
    linkedADRs,
  }
}

function parseKRLine(id: string, rest: string): OKRKeyResult {
  // Pattern: "<text> — Status: Done (2026-02-26)"
  // or:      "<text> — Status: In progress — <detail>"
  // or:      "<text> — Status: Not started"
  const statusIdx = rest.lastIndexOf('— Status:')
  if (statusIdx === -1) {
    return { id, text: rest.trim(), status: 'Unknown' }
  }

  const text = rest.slice(0, statusIdx).trim().replace(/\s*—\s*$/, '')
  const statusPart = rest.slice(statusIdx + '— Status:'.length).trim()

  // statusPart might be: "Done (2026-02-26)" or "In progress — detail" or "Not started"
  const knownStatuses = ['In progress', 'Not started', 'Done']
  let status = ''
  let remainder = statusPart

  for (const s of knownStatuses) {
    if (statusPart.startsWith(s)) {
      status = s
      remainder = statusPart.slice(s.length).trim()
      break
    }
  }
  if (!status) {
    // Fall back: everything before the first dash or end
    const dashIdx = statusPart.indexOf('—')
    status = dashIdx >= 0 ? statusPart.slice(0, dashIdx).trim() : statusPart
    remainder = dashIdx >= 0 ? statusPart.slice(dashIdx + 1).trim() : ''
  }

  // Extract optional completed date: "(2026-02-26)"
  let completedDate: string | undefined
  let detail: string | undefined

  const dateMatch = remainder.match(/^\((\d{4}-\d{2}-\d{2})\)(.*)/)
  if (dateMatch) {
    completedDate = dateMatch[1]
    const afterDate = dateMatch[2].trim().replace(/^—\s*/, '')
    if (afterDate) detail = afterDate
  } else if (remainder.startsWith('—')) {
    detail = remainder.slice(1).trim()
  } else if (remainder) {
    detail = remainder
  }

  return { id, text, status, completedDate, detail }
}

function extractADRNumbers(line: string): string[] {
  // Match patterns like [ADR-0001](...) or ADR-0001
  const matches = [...line.matchAll(/ADR-(\d{4})/g)]
  return matches.map(m => m[1])
}
