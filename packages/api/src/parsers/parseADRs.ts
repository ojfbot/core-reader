import fs from 'fs'
import path from 'path'
import { ADRManifest } from '../types'

// Minimal FrameBead shape — matches @core/workflows FrameBead interface (ADR-0016)
// Defined inline to avoid cross-repo dependency.
export interface FrameBeadLike {
  id: string
  type: 'adr'
  status: 'created' | 'live' | 'closed' | 'archived'
  title: string
  body: string
  labels: Record<string, string>
  actor: string
  refs: string[]
  created_at: string
  updated_at: string
  closed_at?: string
}

export function parseADRsAsBeads(coreRepoPath: string): FrameBeadLike[] {
  const adrDir = resolveADRDir(coreRepoPath)
  if (!adrDir) return []

  const files = fs.readdirSync(adrDir)
    .filter(f => /^\d{4}-/.test(f) && f.endsWith('.md') && f !== 'template.md')
    .sort()
    .reverse()

  return files.map(filename => {
    const adr = parseADRFile(path.join(adrDir, filename), filename)
    const body = fs.readFileSync(path.join(adrDir, filename), 'utf-8')
    const beadStatus = mapADRStatus(adr.status)
    const ts = adr.date ? isoFromDate(adr.date) : new Date(0).toISOString()

    const bead: FrameBeadLike = {
      id: `core-adr-${adr.number.padStart(4, '0')}`,
      type: 'adr',
      status: beadStatus,
      title: adr.title,
      body,
      labels: adr.okr ? { okr: adr.okr } : {},
      actor: 'system',
      refs: adr.reposAffected,
      created_at: ts,
      updated_at: ts,
    }
    if (beadStatus === 'closed' || beadStatus === 'archived') {
      bead.closed_at = ts
    }
    return bead
  })
}

function mapADRStatus(raw: string): FrameBeadLike['status'] {
  const s = raw.toLowerCase()
  if (s === 'accepted') return 'live'
  if (s === 'superseded' || s === 'deprecated') return 'archived'
  if (s === 'rejected') return 'closed'
  return 'created'
}

function isoFromDate(date: string): string {
  try {
    const d = new Date(date)
    if (!isNaN(d.getTime())) return d.toISOString()
  } catch { /* fall through */ }
  return new Date(0).toISOString()
}

export function parseADRs(coreRepoPath: string): ADRManifest[] {
  const adrDir = resolveADRDir(coreRepoPath)
  if (!adrDir) return []

  const files = fs.readdirSync(adrDir)
    .filter(f => /^\d{4}-/.test(f) && f.endsWith('.md') && f !== 'template.md')
    .sort()
    .reverse() // newest first

  return files.map(filename => parseADRFile(path.join(adrDir, filename), filename))
}

export function getADR(coreRepoPath: string, number: string): ADRManifest | null {
  const adrDir = resolveADRDir(coreRepoPath)
  if (!adrDir) return null

  const files = fs.readdirSync(adrDir).filter(f => f.startsWith(number))
  if (!files[0]) return null

  const adr = parseADRFile(path.join(adrDir, files[0]), files[0])
  adr.content = fs.readFileSync(path.join(adrDir, files[0]), 'utf-8')
  return adr
}

function resolveADRDir(coreRepoPath: string): string | null {
  // Try decisions/adr/ (direct in core repo)
  const direct = path.join(coreRepoPath, 'decisions', 'adr')
  if (fs.existsSync(direct)) return direct
  return null
}

function parseADRFile(filePath: string, filename: string): ADRManifest {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const number = filename.split('-')[0]

  const titleLine = lines.find(l => l.startsWith('# '))
  const rawTitle = titleLine
    ? titleLine.replace(/^#\s+/, '').replace(/^ADR-\d+[:\s—–-]+/i, '').trim()
    : filename.replace(/^\d+-/, '').replace(/-/g, ' ')

  // Parse metadata — handles both "Status: X" and "**Status:** X" formats
  const getMeta = (key: string): string => {
    const pattern = new RegExp(`\\*{0,2}${key}:\\*{0,2}\\s*(.+?)(?:\\n|$)`, 'im')
    const match = content.match(pattern)
    if (!match) return ''
    // Strip markdown links: [text](url) → text
    return match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
  }

  return {
    number,
    title: rawTitle,
    status: getMeta('Status') || 'Proposed',
    date: getMeta('Date'),
    okr: getMeta('OKR'),
    reposAffected: splitList(getMeta('Repos affected')),
    commandsAffected: splitList(getMeta('Commands affected')),
  }
}

function splitList(raw: string): string[] {
  if (!raw) return []
  return raw.split(/[,;]/).map(s => s.trim()).filter(Boolean)
}
