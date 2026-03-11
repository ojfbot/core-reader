/**
 * Minimal GitHub API client for reading files from a private repo.
 * Used to serve commands + roadmap data from ojfbot/core on Vercel,
 * where the local core checkout is not available.
 *
 * Requires: GITHUB_TOKEN env var (PAT with contents:read on ojfbot/core)
 * Optional: GITHUB_CORE_REPO env var (default: "ojfbot/core")
 */

const GITHUB_API = 'https://api.github.com'

function ghHeaders(token: string): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

export interface GitHubTreeEntry {
  path: string
  type: 'blob' | 'tree' | 'commit'
  sha: string
}

/**
 * Fetch the full recursive git tree for HEAD.
 * One API call — use this to enumerate all commands before fetching blobs.
 */
export async function fetchGitHubTree(repo: string, token: string): Promise<GitHubTreeEntry[]> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/git/trees/HEAD?recursive=1`,
    { headers: ghHeaders(token) },
  )
  if (!res.ok) throw new Error(`GitHub tree fetch failed (${res.status}): ${repo}`)
  const data = await res.json() as { tree: GitHubTreeEntry[]; truncated: boolean }
  if (data.truncated) {
    console.warn(`[github] tree truncated for ${repo} — some entries may be missing`)
  }
  return data.tree
}

/**
 * Fetch a blob by SHA and decode from base64.
 * GitHub wraps base64 lines at 60 chars — strip whitespace before decode.
 */
export async function fetchGitHubBlob(repo: string, sha: string, token: string): Promise<string> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/git/blobs/${sha}`,
    { headers: ghHeaders(token) },
  )
  if (!res.ok) throw new Error(`GitHub blob fetch failed (${res.status}): ${sha}`)
  const data = await res.json() as { content: string; encoding: string }
  return Buffer.from(data.content.replace(/\s/g, ''), 'base64').toString('utf-8')
}

/**
 * Fetch a single file by path and decode from base64.
 * Use for targeted single-file lookups (e.g. frame-os-context.md, one command).
 */
export async function fetchGitHubFile(repo: string, filePath: string, token: string): Promise<string> {
  const res = await fetch(
    `${GITHUB_API}/repos/${repo}/contents/${filePath}`,
    { headers: ghHeaders(token) },
  )
  if (!res.ok) throw new Error(`GitHub file fetch failed (${res.status}): ${filePath}`)
  const data = await res.json() as { content: string; encoding: string }
  return Buffer.from(data.content.replace(/\s/g, ''), 'base64').toString('utf-8')
}
