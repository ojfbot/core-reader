import fs from 'fs'
import path from 'path'
import { RoadmapPhase } from '../types'
import { fetchGitHubFile } from '../github'

// ── Local filesystem ────────────────────────────────────────────────────────

export function parseRoadmap(coreRepoPath: string): RoadmapPhase[] {
  const contextPath = path.join(coreRepoPath, 'domain-knowledge', 'frame-os-context.md')
  if (!fs.existsSync(contextPath)) return []
  return parseRoadmapContent(fs.readFileSync(contextPath, 'utf-8'))
}

// ── GitHub ──────────────────────────────────────────────────────────────────

export async function parseRoadmapFromGitHub(repo: string, token: string): Promise<RoadmapPhase[]> {
  const content = await fetchGitHubFile(repo, 'domain-knowledge/frame-os-context.md', token)
  return parseRoadmapContent(content)
}

// ── Shared parsing ──────────────────────────────────────────────────────────

function parseRoadmapContent(content: string): RoadmapPhase[] {
  const sectionMatch = content.match(/##\s+The roadmap phases\s*\n([\s\S]+?)(?:\n---|\n##|$)/)
  if (!sectionMatch) return []

  const tableText = sectionMatch[1]
  const rows = tableText
    .split('\n')
    .filter(l => l.startsWith('|') && !/^\|[\s\-|]+\|$/.test(l))

  // Skip header row
  return rows
    .slice(1)
    .map(row => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean)
      if (cells.length < 4) return null

      const [phase, what, reposRaw, statusRaw] = cells

      return {
        phase: phase.trim(),
        what: what.replace(/\*\*/g, '').trim(),
        repos: reposRaw
          .replace(/\*\*/g, '')
          .split(/[,;/]/)
          .map(s => s.trim())
          .filter(Boolean),
        status: normalizeStatus(statusRaw),
      }
    })
    .filter((p): p is RoadmapPhase => p !== null)
}

function normalizeStatus(raw: string): string {
  const s = raw.replace(/[✅⬜🔴🟡🟢]/g, '').trim()
  if (/complete/i.test(s)) return 'Complete'
  if (/in progress/i.test(s)) return 'In progress'
  if (/blocked/i.test(s)) return 'Blocked'
  if (/not started/i.test(s)) return 'Not started'
  return s || 'Not started'
}
