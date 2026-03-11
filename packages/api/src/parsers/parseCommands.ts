import fs from 'fs'
import path from 'path'
import { CommandManifest } from '../types'
import { fetchGitHubTree, fetchGitHubBlob, fetchGitHubFile } from '../github'

// ── Local filesystem ────────────────────────────────────────────────────────

export function parseCommands(coreRepoPath: string): CommandManifest[] {
  const commandsDir = path.join(coreRepoPath, '.claude', 'commands')
  if (!fs.existsSync(commandsDir)) return []

  const entries = fs.readdirSync(commandsDir, { withFileTypes: true })
  const commands: CommandManifest[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const cmd = parseCommandEntry(commandsDir, entry.name)
    if (cmd) commands.push(cmd)
  }

  return commands.sort((a, b) => a.name.localeCompare(b.name))
}

export function getCommandContent(coreRepoPath: string, name: string): CommandManifest | null {
  const commandsDir = path.join(coreRepoPath, '.claude', 'commands')
  const cmd = parseCommandEntry(commandsDir, name)
  if (!cmd) return null

  const mdPath = path.join(commandsDir, name, `${name}.md`)
  cmd.content = fs.readFileSync(mdPath, 'utf-8')
  return cmd
}

function parseCommandEntry(commandsDir: string, name: string): CommandManifest | null {
  const mdPath = path.join(commandsDir, name, `${name}.md`)
  if (!fs.existsSync(mdPath)) return null

  const content = fs.readFileSync(mdPath, 'utf-8')
  const knowledgeDir = path.join(commandsDir, name, 'knowledge')
  const knowledgeFiles = fs.existsSync(knowledgeDir)
    ? fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'))
    : []
  const hasScripts = fs.existsSync(path.join(commandsDir, name, 'scripts'))

  return buildManifestFromContent(name, content, knowledgeFiles, hasScripts)
}

// ── GitHub ──────────────────────────────────────────────────────────────────

const COMMANDS_PREFIX = '.claude/commands'
const CMD_RE = /^\.claude\/commands\/([^/]+)\/\1\.md$/

/**
 * Parse all commands from the GitHub repo.
 * One tree fetch + parallel blob fetches (one per command).
 */
export async function parseCommandsFromGitHub(repo: string, token: string): Promise<CommandManifest[]> {
  const tree = await fetchGitHubTree(repo, token)

  const commandBlobs = tree.filter(e => e.type === 'blob' && CMD_RE.test(e.path))

  const manifests = await Promise.all(commandBlobs.map(async entry => {
    const name = entry.path.match(CMD_RE)![1]
    const content = await fetchGitHubBlob(repo, entry.sha, token)

    const knowledgeFiles = tree
      .filter(e =>
        e.type === 'blob' &&
        e.path.startsWith(`${COMMANDS_PREFIX}/${name}/knowledge/`) &&
        e.path.endsWith('.md')
      )
      .map(e => e.path.split('/').pop()!)

    const hasScripts = tree.some(e =>
      e.path.startsWith(`${COMMANDS_PREFIX}/${name}/scripts/`)
    )

    return buildManifestFromContent(name, content, knowledgeFiles, hasScripts)
  }))

  return manifests.sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Fetch a single command by name from GitHub, including full content.
 * knowledgeFiles + hasScripts are omitted (would require extra API calls).
 */
export async function getCommandFromGitHub(
  repo: string,
  token: string,
  name: string,
): Promise<CommandManifest | null> {
  try {
    const content = await fetchGitHubFile(repo, `${COMMANDS_PREFIX}/${name}/${name}.md`, token)
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
): CommandManifest {
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
