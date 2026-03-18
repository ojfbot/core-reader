import fs from 'fs'
import path from 'path'
import { DocManifest } from '../types'
import { fetchGitHubTree, fetchGitHubBlob } from '../github'

// ── Local filesystem ────────────────────────────────────────────────────────

export function parseDocs(coreRepoPath: string): DocManifest[] {
  const docsDir = path.join(coreRepoPath, 'docs')
  if (!fs.existsSync(docsDir)) return []

  return fs.readdirSync(docsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(filename => {
      const name = filename.replace(/\.md$/, '')
      const content = fs.readFileSync(path.join(docsDir, filename), 'utf-8')
      const title = extractTitle(content) ?? name
      return { name, title }
    })
}

export function parseDocContent(coreRepoPath: string, name: string): string | null {
  const filePath = path.join(coreRepoPath, 'docs', `${name}.md`)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf-8')
}

// ── GitHub ──────────────────────────────────────────────────────────────────

export async function parseDocsFromGitHub(repo: string, token: string): Promise<DocManifest[]> {
  const tree = await fetchGitHubTree(repo, token)
  const entries = tree.filter(e =>
    e.type === 'blob' &&
    e.path.startsWith('docs/') &&
    e.path.endsWith('.md') &&
    e.path.split('/').length === 2
  )

  const docs = await Promise.all(
    entries.map(async e => {
      const content = await fetchGitHubBlob(repo, e.sha, token)
      const name = path.basename(e.path, '.md')
      const title = extractTitle(content) ?? name
      return { name, title }
    })
  )

  return docs.sort((a, b) => a.name.localeCompare(b.name))
}

export async function parseDocContentFromGitHub(
  repo: string,
  token: string,
  name: string
): Promise<string | null> {
  const tree = await fetchGitHubTree(repo, token)
  const entry = tree.find(e => e.path === `docs/${name}.md` && e.type === 'blob')
  if (!entry) return null
  return fetchGitHubBlob(repo, entry.sha, token)
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function extractTitle(content: string): string | null {
  for (const line of content.split('\n')) {
    const match = line.match(/^#\s+(.+)/)
    if (match) return match[1].trim()
  }
  return null
}
