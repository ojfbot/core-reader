import fs from 'fs'
import path from 'path'
import { SkillManifest } from '../types'
import { fetchGitHubTree, fetchGitHubBlob, fetchGitHubFile } from '../github'

// ── Local filesystem ────────────────────────────────────────────────────────

export function parseSkills(coreRepoPath: string): SkillManifest[] {
  const skillsDir = path.join(coreRepoPath, '.claude', 'skills')
  if (!fs.existsSync(skillsDir)) return []

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
  const skills: SkillManifest[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skill = parseSkillEntry(skillsDir, entry.name)
    if (skill) skills.push(skill)
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name))
}

export function getSkillContent(coreRepoPath: string, name: string): SkillManifest | null {
  const skillsDir = path.join(coreRepoPath, '.claude', 'skills')
  const skill = parseSkillEntry(skillsDir, name)
  if (!skill) return null

  const mdPath = path.join(skillsDir, name, `${name}.md`)
  skill.content = fs.readFileSync(mdPath, 'utf-8')
  return skill
}

function parseSkillEntry(skillsDir: string, name: string): SkillManifest | null {
  const mdPath = path.join(skillsDir, name, `${name}.md`)
  if (!fs.existsSync(mdPath)) return null

  const content = fs.readFileSync(mdPath, 'utf-8')
  const knowledgeDir = path.join(skillsDir, name, 'knowledge')
  const knowledgeFiles = fs.existsSync(knowledgeDir)
    ? fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'))
    : []
  const hasScripts = fs.existsSync(path.join(skillsDir, name, 'scripts'))

  return buildManifestFromContent(name, content, knowledgeFiles, hasScripts)
}

// ── GitHub ──────────────────────────────────────────────────────────────────

const SKILLS_PREFIX = '.claude/skills'
const SKILL_RE = /^\.claude\/skills\/([^/]+)\/\1\.md$/

/**
 * Parse all skills from the GitHub repo.
 * One tree fetch + parallel blob fetches (one per skill).
 */
export async function parseSkillsFromGitHub(repo: string, token: string): Promise<SkillManifest[]> {
  const tree = await fetchGitHubTree(repo, token)

  const skillBlobs = tree.filter(e => e.type === 'blob' && SKILL_RE.test(e.path))

  const manifests = await Promise.all(skillBlobs.map(async entry => {
    const name = entry.path.match(SKILL_RE)![1]
    const content = await fetchGitHubBlob(repo, entry.sha, token)

    const knowledgeFiles = tree
      .filter(e =>
        e.type === 'blob' &&
        e.path.startsWith(`${SKILLS_PREFIX}/${name}/knowledge/`) &&
        e.path.endsWith('.md')
      )
      .map(e => e.path.split('/').pop()!)

    const hasScripts = tree.some(e =>
      e.path.startsWith(`${SKILLS_PREFIX}/${name}/scripts/`)
    )

    return buildManifestFromContent(name, content, knowledgeFiles, hasScripts)
  }))

  return manifests.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Fetch a single skill by name from GitHub, including full content.
 * knowledgeFiles + hasScripts are omitted (would require extra API calls).
 */
export async function getSkillFromGitHub(
  repo: string,
  token: string,
  name: string,
): Promise<SkillManifest | null> {
  try {
    const content = await fetchGitHubFile(repo, `${SKILLS_PREFIX}/${name}/${name}.md`, token)
    const manifest = buildManifestFromContent(name, content, [], false)
    manifest.content = content
    return manifest
  } catch {
    return null
  }
}

// ── Shared parsing ──────────────────────────────────────────────────────────

function buildManifestFromContent(
  name: string,
  content: string,
  knowledgeFiles: string[],
  hasScripts: boolean,
): SkillManifest {
  const tierMatch = content.match(/\*\*Tier:\*\*\s*(\d+)/)
  const phaseMatch = content.match(/\*\*Phase:\*\*\s*(.+?)(?:\n|$)/)

  return {
    name,
    tier: tierMatch ? parseInt(tierMatch[1], 10) : null,
    phase: phaseMatch ? phaseMatch[1].trim() : null,
    description: extractDescription(content),
    knowledgeFiles,
    hasScripts,
  }
}

function extractDescription(content: string): string {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) continue
    if (/^\*\*(Tier|Phase|Input|Trigger|When to|MANDATORY)/.test(trimmed)) continue
    if (trimmed.length >= 30) {
      return trimmed.replace(/\*\*/g, '').slice(0, 150)
    }
  }
  return ''
}
