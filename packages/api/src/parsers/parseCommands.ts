import fs from 'fs'
import path from 'path'
import { CommandManifest } from '../types'

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

  const tierMatch = content.match(/\*\*Tier:\*\*\s*(\d+)/)
  const phaseMatch = content.match(/\*\*Phase:\*\*\s*(.+?)(?:\n|$)/)

  const knowledgeDir = path.join(commandsDir, name, 'knowledge')
  const knowledgeFiles = fs.existsSync(knowledgeDir)
    ? fs.readdirSync(knowledgeDir).filter(f => f.endsWith('.md'))
    : []

  return {
    name,
    tier: tierMatch ? parseInt(tierMatch[1], 10) : null,
    phase: phaseMatch ? phaseMatch[1].trim() : null,
    description: extractDescription(content),
    knowledgeFiles,
    hasScripts: fs.existsSync(path.join(commandsDir, name, 'scripts')),
  }
}

function extractDescription(content: string): string {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    // Skip headings, metadata lines, dividers, empty lines
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) continue
    if (/^\*\*(Tier|Phase|Input|Trigger|When to|MANDATORY)/.test(trimmed)) continue
    // Return first substantive line (≥30 chars)
    if (trimmed.length >= 30) {
      return trimmed.replace(/\*\*/g, '').slice(0, 150)
    }
  }
  return ''
}
